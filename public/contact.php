<?php
/**
 * Apex Global website form handler (callback, enquiry, newsletter).
 *
 * - SMTP settings and the Turnstile secret are read from a config file OUTSIDE the
 *   web root (see APEX_CONFIG below and server/README.md). Never commit that file.
 * - Cloudflare Turnstile + honeypot, verified server-side.
 * - Per-IP rate limit, input sanitising, header-injection protection.
 * - Sends to the firm, auto-replies to the visitor, then redirects to /thank-you/.
 * - Never accepts files, tax references, NI numbers or bank details.
 */

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

// Absolute path to the private config, one level ABOVE public_html.
define('APEX_CONFIG', dirname(__DIR__) . '/apex-private/smtp-config.php');
define('APEX_RATE_DIR', dirname(__DIR__) . '/apex-private/rate-limit');
define('APEX_RATE_MAX', 5);          // submissions allowed...
define('APEX_RATE_WINDOW', 600);     // ...per IP per 10 minutes

header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');

function apex_redirect(string $path): void
{
    header('Location: ' . $path, true, 303);
    exit;
}

/** Strip tags, control characters (incl. CR/LF for header safety) and limit length. */
function apex_line(string $key, int $max): string
{
    $v = isset($_POST[$key]) && is_string($_POST[$key]) ? $_POST[$key] : '';
    $v = strip_tags($v);
    $v = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v) ?? '';
    return mb_substr(trim($v), 0, $max);
}

/** Multi-line text: keep newlines, drop other control characters. */
function apex_text(string $key, int $max): string
{
    $v = isset($_POST[$key]) && is_string($_POST[$key]) ? $_POST[$key] : '';
    $v = strip_tags($v);
    $v = preg_replace('/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]+/u', '', $v) ?? '';
    return mb_substr(trim($v), 0, $max);
}

function apex_client_ip(): string
{
    // Behind Cloudflare the visitor IP is in CF-Connecting-IP.
    $ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
}

function apex_rate_limited(string $ip): bool
{
    if (!is_dir(APEX_RATE_DIR) && !@mkdir(APEX_RATE_DIR, 0700, true)) {
        return false; // fail open rather than block genuine enquiries
    }
    $file = APEX_RATE_DIR . '/' . hash('sha256', $ip) . '.json';
    $now = time();
    $hits = [];
    if (is_file($file)) {
        $decoded = json_decode((string) file_get_contents($file), true);
        $hits = is_array($decoded) ? $decoded : [];
    }
    $hits = array_values(array_filter($hits, static fn ($t) => is_int($t) && $t > $now - APEX_RATE_WINDOW));
    if (count($hits) >= APEX_RATE_MAX) {
        return true;
    }
    $hits[] = $now;
    file_put_contents($file, json_encode($hits), LOCK_EX);
    return false;
}

function apex_turnstile_ok(string $secret, string $token, string $ip): bool
{
    if ($token === '' || $secret === '') {
        return false;
    }
    $ch = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query(['secret' => $secret, 'response' => $token, 'remoteip' => $ip]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
    ]);
    $body = curl_exec($ch);
    curl_close($ch);
    $result = is_string($body) ? json_decode($body, true) : null;
    return is_array($result) && ($result['success'] ?? false) === true;
}

// ---------------------------------------------------------------------------

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    apex_redirect('/contact/');
}

$type = apex_line('form_type', 20);
if (!in_array($type, ['callback', 'enquiry', 'newsletter'], true)) {
    apex_redirect('/contact/?status=invalid#book');
}

// Honeypot: bots fill hidden fields. Pretend success, send nothing.
if (apex_line('company_website', 200) !== '') {
    apex_redirect('/thank-you/');
}

if (!is_file(APEX_CONFIG)) {
    error_log('Apex contact form: config file missing at ' . APEX_CONFIG);
    apex_redirect('/contact/?status=error#book');
}
/** @var array{host:string,port:int,username:string,password:string,encryption:string,from_email:string,from_name:string,to_email:string,turnstile_secret:string} $cfg */
$cfg = require APEX_CONFIG;

$ip = apex_client_ip();
if (apex_rate_limited($ip)) {
    apex_redirect('/contact/?status=busy#book');
}
if (!apex_turnstile_ok((string) $cfg['turnstile_secret'], apex_line('cf-turnstile-response', 2048), $ip)) {
    apex_redirect('/contact/?status=captcha#book');
}

$name = apex_line('name', 100);
$email = apex_line('email', 150);
$phone = preg_replace('/[^0-9+()\s-]/', '', apex_line('phone', 30)) ?? '';
$company = apex_line('company', 120);
$service = apex_line('service', 80);
$bestTime = apex_line('best_time', 20);
$source = apex_line('source', 200);
$message = apex_text('message', 3000);

$emailOk = filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
$valid = match ($type) {
    'newsletter' => $emailOk,
    'callback' => $emailOk && $name !== '' && $phone !== '',
    'enquiry' => $emailOk && $name !== '' && $message !== '',
};
if (!$valid) {
    apex_redirect('/contact/?status=invalid#book');
}

require __DIR__ . '/_lib/phpmailer/Exception.php';
require __DIR__ . '/_lib/phpmailer/PHPMailer.php';
require __DIR__ . '/_lib/phpmailer/SMTP.php';

function apex_mailer(array $cfg): PHPMailer
{
    $m = new PHPMailer(true);
    $m->isSMTP();
    $m->Host = (string) $cfg['host'];
    $m->Port = (int) $cfg['port'];
    $m->SMTPAuth = true;
    $m->Username = (string) $cfg['username'];
    $m->Password = (string) $cfg['password'];
    $m->SMTPSecure = $cfg['encryption'] === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $m->CharSet = PHPMailer::CHARSET_UTF8;
    $m->setFrom((string) $cfg['from_email'], (string) $cfg['from_name']);
    return $m;
}

$labels = ['callback' => 'callback request', 'enquiry' => 'enquiry', 'newsletter' => 'newsletter signup'];
$lines = array_filter([
    'Form' => ucfirst($labels[$type]),
    'Name' => $name,
    'Email' => $email,
    'Phone' => $phone,
    'Company' => $company,
    'Service' => $service,
    'Best time to call' => $bestTime,
    'Page' => $source,
    'Submitted' => gmdate('Y-m-d H:i') . ' UTC',
], static fn ($v) => $v !== '');
$body = '';
foreach ($lines as $k => $v) {
    $body .= $k . ': ' . $v . "\n";
}
if ($message !== '') {
    $body .= "\nMessage:\n" . $message . "\n";
}

try {
    $m = apex_mailer($cfg);
    $m->addAddress((string) $cfg['to_email']);
    $m->addReplyTo($email, $name); // PHPMailer validates and rejects line breaks
    $m->Subject = 'Apex Global website enquiry: ' . $labels[$type] . ($name !== '' ? ' from ' . $name : '');
    $m->Body = $body;
    $m->send();
} catch (MailException $e) {
    error_log('Apex contact form send failed: ' . $e->getMessage());
    apex_redirect('/contact/?status=error#book');
}

// Auto-reply to the visitor. A failure here must not lose the enquiry above.
try {
    $r = apex_mailer($cfg);
    $r->addAddress($email, $name);
    $r->Subject = $type === 'newsletter'
        ? 'You are subscribed to Apex Global updates'
        : 'Thank you for contacting Apex Global';
    $greeting = $name !== '' ? 'Dear ' . $name : 'Hello';
    $r->Body = $type === 'newsletter'
        ? "$greeting,\n\nThank you for subscribing to occasional updates from Apex Global Consulting Services. You can unsubscribe at any time by replying to this email.\n\nApex Global Consulting Services Limited\nBeyond numbers. Beyond borders.\n"
        : "$greeting,\n\nThank you for contacting Apex Global Consulting Services. We have received your message and a member of the team will reply within one working day.\n\nPlease do not send tax references, National Insurance numbers, bank details or documents by email. We will share a secure client portal link for those.\n\nApex Global Consulting Services Limited\nOffice No. 79, Atlantic Business Centre, Atlantic Street, Altrincham, Greater Manchester, WA14 5NQ, United Kingdom\n+44 (0) 204 553 8806\n";
    $r->send();
} catch (MailException $e) {
    error_log('Apex contact form auto-reply failed: ' . $e->getMessage());
}

apex_redirect('/thank-you/');
