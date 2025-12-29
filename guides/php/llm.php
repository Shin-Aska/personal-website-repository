<?php
// guides/php/llm.php

// --- CORS (strict allowlist) & Preflight ---
// Update this list with the exact origins you serve from
$allowedOrigins = [
    'http://localhost',
    'http://127.0.0.1',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://*.richardorilla.website',
    'https://*.richardorilla.website',
    'http://richardorilla.website',
    'https://richardorilla.website',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: false');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Max-Age: 600');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
} else {
    // Allow non-CORS (same-origin or server-side) requests to proceed.
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Origin not allowed']);
        exit;
    }
}

// --- Method guard ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST, OPTIONS');
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

// --- Rate limiting: 10 requests per minute per IP ---
$clientIp = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
// X-Forwarded-For may contain a list
$clientIp = trim(explode(',', $clientIp)[0]);
$windowSeconds = 60;    // time window
$requestLimit  = 10;    // max requests per window
$now = time();
$bucketFile = sys_get_temp_dir() . '/llm_rl_' . md5($clientIp);
$state = ['ts' => $now, 'count' => 0];
if (is_file($bucketFile)) {
    $loaded = json_decode(@file_get_contents($bucketFile), true);
    if (is_array($loaded) && isset($loaded['ts'], $loaded['count'])) {
        $state = $loaded;
    }
}
if ($now - $state['ts'] >= $windowSeconds) {
    $state = ['ts' => $now, 'count' => 0];
}
$state['count']++;
@file_put_contents($bucketFile, json_encode($state), LOCK_EX);
if ($state['count'] > $requestLimit) {
    http_response_code(429);
    header('Retry-After: ' . $windowSeconds);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Too Many Requests', 'message' => 'Rate limit exceeded. Try again later.']);
    exit;
}

// --- Read API key from environment ---
$apiKey = getenv('GEMINI_API_KEY');
if (!$apiKey) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Server misconfiguration: GEMINI_API_KEY not set']);
    exit;
}

// --- Read raw JSON payload from client ---
$rawBody = file_get_contents('php://input');
if ($rawBody === false || $rawBody === '') {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Empty request body']);
    exit;
}

// Optional: validate JSON
$decoded = json_decode($rawBody, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Invalid JSON payload', 'details' => json_last_error_msg()]);
    exit;
}

// --- Target Gemini endpoint ---
$base = 'https://generativelanguage.googleapis.com/v1beta/models';
$model = 'gemini-3-flash-preview:generateContent';
$url   = $base . '/' . $model . '?key=' . urlencode($apiKey);

// --- Retry logic (exponential backoff) ---
$maxRetries = 3;
$delayMs    = 1000;

$lastErr = null;
for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $rawBody,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER         => true,  // so we can forward upstream status
        CURLOPT_TIMEOUT        => 30,
    ]);

    $resp     = curl_exec($ch);
    $curlErr  = curl_error($ch);
    $status   = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $hdrSize  = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    curl_close($ch);

    if ($resp === false) {
        $lastErr = "cURL error: " . $curlErr;
    } else {
        $rawHeaders = substr($resp, 0, $hdrSize);
        $body       = substr($resp, $hdrSize);

        // Success: forward status and body
        if ($status >= 200 && $status < 300) {
            header('Content-Type: application/json');
            http_response_code($status);
            echo $body;
            exit;
        }

        // Non-2xx: capture body for error
        $lastErr = "Upstream error (HTTP $status): " . $body;
    }

    // Backoff before retrying (except after last attempt)
    if ($attempt < $maxRetries) {
        usleep($delayMs * 1000);
        $delayMs *= 2;
    }
}

// --- All retries failed ---
http_response_code(502);
header('Content-Type: application/json');
echo json_encode([
    'error'   => 'Bad Gateway',
    'message' => 'Failed to reach Gemini after retries',
    'details' => $lastErr,
]);