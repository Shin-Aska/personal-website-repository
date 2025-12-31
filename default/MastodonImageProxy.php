<?php

$url = isset($_GET['url']) ? trim((string)$_GET['url']) : '';

if ($url === '') {
    http_response_code(400);
    exit;
}

$parts = parse_url($url);
if (!is_array($parts)) {
    http_response_code(400);
    exit;
}

$scheme = strtolower((string)($parts['scheme'] ?? ''));
$host = (string)($parts['host'] ?? '');

if ($scheme !== 'https' || $host === '') {
    http_response_code(400);
    exit;
}

if (isset($parts['user']) || isset($parts['pass'])) {
    http_response_code(400);
    exit;
}

$ips = @gethostbynamel($host);
if (is_array($ips)) {
    foreach ($ips as $ip) {
        $publicIp = filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE);
        if ($publicIp === false) {
            http_response_code(403);
            exit;
        }
    }
}

$cacheDir = __DIR__ . DIRECTORY_SEPARATOR . 'cache' . DIRECTORY_SEPARATOR . 'img';
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0775, true);
}

$key = hash('sha256', $url);
$bodyFile = $cacheDir . DIRECTORY_SEPARATOR . $key . '.bin';
$metaFile = $cacheDir . DIRECTORY_SEPARATOR . $key . '.json';
$ttlSeconds = 86400;

if (is_file($bodyFile) && is_file($metaFile)) {
    $mtime = filemtime($bodyFile);
    if ($mtime !== false && (time() - $mtime) < $ttlSeconds) {
        $metaRaw = @file_get_contents($metaFile);
        $meta = is_string($metaRaw) ? json_decode($metaRaw, true) : null;
        $contentType = is_array($meta) ? (string)($meta['content_type'] ?? '') : '';

        if ($contentType !== '') {
            header('Content-Type: ' . $contentType);
            header('Cache-Control: public, max-age=3600');
            header('X-Content-Type-Options: nosniff');
            readfile($bodyFile);
            exit;
        }
    }
}

if (!function_exists('curl_init')) {
    http_response_code(500);
    exit;
}

$tmpFile = $bodyFile . '.tmp';
$fp = @fopen($tmpFile, 'wb');
if ($fp === false) {
    http_response_code(500);
    exit;
}

$maxBytes = 5 * 1024 * 1024;
$written = 0;

$ch = curl_init($url);
if ($ch === false) {
    fclose($fp);
    @unlink($tmpFile);
    http_response_code(500);
    exit;
}

curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_USERAGENT, 'PHP Mastodon Image Proxy');
curl_setopt($ch, CURLOPT_PROTOCOLS, CURLPROTO_HTTPS);
curl_setopt($ch, CURLOPT_REDIR_PROTOCOLS, CURLPROTO_HTTPS);
curl_setopt($ch, CURLOPT_WRITEFUNCTION, function ($ch, $data) use ($fp, &$written, $maxBytes) {
    $len = strlen($data);
    $written += $len;
    if ($written > $maxBytes) {
        return 0;
    }
    return fwrite($fp, $data);
});

$ok = curl_exec($ch);
$curlErr = curl_errno($ch);
$status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = (string)curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

curl_close($ch);
fclose($fp);

if ($ok !== true || $curlErr !== 0 || $status < 200 || $status >= 300 || $written <= 0) {
    @unlink($tmpFile);
    http_response_code(502);
    exit;
}

$contentType = trim(explode(';', $contentType)[0]);
if (stripos($contentType, 'image/') !== 0) {
    @unlink($tmpFile);
    http_response_code(415);
    exit;
}

@rename($tmpFile, $bodyFile);
@file_put_contents($metaFile, json_encode(['content_type' => $contentType]));

header('Content-Type: ' . $contentType);
header('Cache-Control: public, max-age=3600');
header('X-Content-Type-Options: nosniff');
readfile($bodyFile);

?>
