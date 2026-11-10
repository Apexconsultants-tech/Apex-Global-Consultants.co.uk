<?php
// Copy to domains/apexglobalconsultants.co.uk/apex-private/smtp-config.php on Hostinger
// (ONE LEVEL ABOVE public_html) and fill in real values. Never commit the real file.
return [
    'host' => 'smtp.hostinger.com',
    'port' => 465,
    'encryption' => 'ssl', // 'ssl' for port 465, 'tls' for port 587
    'username' => 'website@apexglobalconsultants.co.uk',
    'password' => 'CHANGE-ME', // password of the website@ mailbox
    'from_email' => 'website@apexglobalconsultants.co.uk',
    'from_name' => 'Apex Global website',
    'to_email' => 'info@apexglobalconsultants.co.uk', // enquiries are always delivered here
    'turnstile_secret' => 'CHANGE-ME', // Cloudflare Turnstile secret key
];
