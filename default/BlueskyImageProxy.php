<?php

require_once __DIR__ . '/ImageProxyProvider.php';

$url = isset($_GET['url']) ? trim((string)$_GET['url']) : '';

$proxy = new ImageProxyProvider(
    __DIR__ . DIRECTORY_SEPARATOR . 'cache' . DIRECTORY_SEPARATOR . 'bsky_img',
    86400,
    'PHP Bluesky Image Proxy'
);

$proxy->serve($url);

?>
