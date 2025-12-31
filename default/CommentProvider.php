<?php

abstract class CommentProvider {
    protected $cacheDir;
    protected $cacheTtl;

    public function __construct($cacheDir = null, $cacheTtl = 3600) {
        $this->cacheDir = $cacheDir ?: __DIR__ . DIRECTORY_SEPARATOR . 'cache';
        $this->cacheTtl = $cacheTtl;

        if (!is_dir($this->cacheDir)) {
            @mkdir($this->cacheDir, 0775, true);
        }
    }

    abstract public function getComments($config);

    protected function getCache($key) {
        $file = $this->getCacheFilePath($key);
        if (is_file($file)) {
            $mtime = filemtime($file);
            if ($mtime !== false && (time() - $mtime) < $this->cacheTtl) {
                $raw = @file_get_contents($file);
                if ($raw !== false) {
                    return json_decode($raw, true);
                }
            }
        }
        return null;
    }

    protected function setCache($key, $data) {
        $file = $this->getCacheFilePath($key);
        @file_put_contents($file, json_encode($data));
    }

    protected function getCacheFilePath($key) {
        return $this->cacheDir . DIRECTORY_SEPARATOR . $key . '.json';
    }

    protected function httpGet($url, $userAgent = 'PHP Comment Provider') {
        $url = (string)$url;

        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            if ($ch === false) {
                return null;
            }

            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);

            $body = curl_exec($ch);
            $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($body === false || $status < 200 || $status >= 300) {
                return null;
            }

            return $body;
        }

        if (!ini_get('allow_url_fopen')) {
            return null;
        }

        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => "User-Agent: $userAgent\r\n",
                'timeout' => 10,
            ],
            'ssl' => [
                'verify_peer' => true,
                'verify_peer_name' => true,
            ],
        ]);

        $body = @file_get_contents($url, false, $context);
        if ($body === false) {
            return null;
        }

        return $body;
    }
}
