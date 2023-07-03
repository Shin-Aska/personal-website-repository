<?php
    require_once('nonce.php');
    $nonce = new Nonce();
    $token = $nonce->generateToken(15);
    $domain = getenv("DOMAIN");
    header("Content-Security-Policy: script-src 'self' 'unsafe-inline' https: 'nonce-{$token}' 'strict-dynamic' {$domain} https://cdn.datatables.net; img-src 'self' 'nonce-{$token}' blob: data: https://*; child-src 'none'; object-src 'self' blob: {$domain}; base-uri 'self'; media-src blob: * {$domain}; frame-ancestors 'none';");
    header("Cross-Origin-Embedder-Policy: require-corp");
    header("Cross-Origin-Opener-Policy: same-origin");
    header("Strict-Transport-Security: max-age=63072000; includeSubDomains; preload");
    header("X-Frame-Options: SAMEORIGIN");
?>