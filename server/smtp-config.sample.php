<?php
// Copy to /home/<cpanel-user>/apex-private/smtp-config.php on the server
// (ONE LEVEL ABOVE public_html) and fill in real values. Never commit the real file.
return [
    'host' => 'mail.apexglobalconsultants.co.uk',
    'port' => 465,
    'encryption' => 'ssl', // 'ssl' for port 465, 'tls' for port 587
    'username' => 'info@apexglobalconsultants.co.uk',
    'password' => 'CHANGE-ME',
    'from_email' => 'info@apexglobalconsultants.co.uk',
    'from_name' => 'Apex Global website',
    'to_email' => 'info@apexglobalconsultants.co.uk',
    'turnstile_secret' => 'CHANGE-ME', // Cloudflare Turnstile secret key
];
