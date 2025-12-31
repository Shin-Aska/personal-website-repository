<?php

class ImageProxyProvider {
    protected $cacheDir;
    protected $cacheTtl;
    protected $userAgent;

    public function __construct($cacheDir = null, $cacheTtl = 86400, $userAgent = 'PHP Image Proxy') {
        $this->cacheDir = $cacheDir ?: __DIR__ . DIRECTORY_SEPARATOR . 'cache' . DIRECTORY_SEPARATOR . 'img';
        $this->cacheTtl = $cacheTtl;
        $this->userAgent = $userAgent;

        if (!is_dir($this->cacheDir)) {
            @mkdir($this->cacheDir, 0775, true);
        }
    }

    public function serve($url) {
        $url = trim((string)$url);

        if ($url === '') {
            $this->error(400);
        }

        $parts = parse_url($url);
        if (!is_array($parts)) {
            $this->error(400);
        }

        $scheme = strtolower((string)($parts['scheme'] ?? ''));
        $host = (string)($parts['host'] ?? '');

        if ($scheme !== 'https' || $host === '') {
            $this->error(400);
        }

        if (isset($parts['user']) || isset($parts['pass'])) {
            $this->error(400);
        }

        $this->checkSsrf($host);

        $key = hash('sha256', $url);
        $bodyFile = $this->cacheDir . DIRECTORY_SEPARATOR . $key . '.bin';
        $metaFile = $this->cacheDir . DIRECTORY_SEPARATOR . $key . '.json';

        if ($this->serveFromCache($bodyFile, $metaFile)) {
            exit;
        }

        $this->fetchAndCache($url, $bodyFile, $metaFile);
    }

    protected function checkSsrf($host) {
        $ips = @gethostbynamel($host);
        if (is_array($ips)) {
            foreach ($ips as $ip) {
                $publicIp = filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE);
                if ($publicIp === false) {
                    $this->error(403);
                }
            }
        }
    }

    protected function serveFromCache($bodyFile, $metaFile) {
        if (is_file($bodyFile) && is_file($metaFile)) {
            $mtime = filemtime($bodyFile);
            if ($mtime !== false && (time() - $mtime) < $this->cacheTtl) {
                $metaRaw = @file_get_contents($metaFile);
                $meta = is_string($metaRaw) ? json_decode($metaRaw, true) : null;
                $contentType = is_array($meta) ? (string)($meta['content_type'] ?? '') : '';

                if ($contentType !== '') {
                    $this->output($contentType, $bodyFile);
                    return true;
                }
            }
        }
        return false;
    }

    protected function fetchAndCache($url, $bodyFile, $metaFile) {
        if (!function_exists('curl_init')) {
            $this->error(500);
        }

        $tmpFile = $bodyFile . '.tmp';
        $fp = @fopen($tmpFile, 'wb');
        if ($fp === false) {
            $this->error(500);
        }

        $maxBytes = 5 * 1024 * 1024;
        $written = 0;

        $ch = curl_init($url);
        if ($ch === false) {
            fclose($fp);
            @unlink($tmpFile);
            $this->error(500);
        }

        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_USERAGENT, $this->userAgent);
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
            $this->error(502);
        }

        $contentType = trim(explode(';', $contentType)[0]);
        if (stripos($contentType, 'image/') !== 0) {
            @unlink($tmpFile);
            $this->error(415);
        }

        @rename($tmpFile, $bodyFile);
        @file_put_contents($metaFile, json_encode(['content_type' => $contentType]));

        $this->output($contentType, $bodyFile);
    }

    protected function output($contentType, $bodyFile) {
        header('Content-Type: ' . $contentType);
        header('Cache-Control: public, max-age=3600');
        header('X-Content-Type-Options: nosniff');
        readfile($bodyFile);
    }

    protected function error($code) {
        http_response_code($code);
        exit;
    }
}
