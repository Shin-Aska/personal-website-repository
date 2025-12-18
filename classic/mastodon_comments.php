<?php

function get_mastodon_comments($post_id, $host = 'mastodon.social', $user = 'your_handle') {
    $post_id = trim((string)$post_id);
    if ($post_id === '') {
        return "<div class='mastodon-nocomments'><p>No comments yet. Reply on Mastodon to join the discussion.</p></div>";
    }

    $host = trim((string)$host);
    $host = preg_replace('#^https?://#i', '', $host);
    $host = preg_replace('#/.*$#', '', $host);

    $user = trim((string)$user);

    $cacheDir = __DIR__ . DIRECTORY_SEPARATOR . 'cache';
    if (!is_dir($cacheDir)) {
        @mkdir($cacheDir, 0775, true);
    }

    $safePostId = preg_replace('/[^A-Za-z0-9_-]/', '_', $post_id);
    $cacheFile = $cacheDir . DIRECTORY_SEPARATOR . 'comments_' . $safePostId . '.json';
    $cacheTtlSeconds = 3600;

    $data = null;

    if (is_file($cacheFile)) {
        $mtime = filemtime($cacheFile);
        if ($mtime !== false && (time() - $mtime) < $cacheTtlSeconds) {
            $raw = @file_get_contents($cacheFile);
            if ($raw !== false) {
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) {
                    $data = $decoded;
                }
            }
        }
    }

    if ($data === null) {
        $apiUrl = 'https://' . $host . '/api/v1/statuses/' . rawurlencode($post_id) . '/context';
        $response = mastodon_comments_http_get($apiUrl);

        if (is_string($response) && $response !== '') {
            $json = json_decode($response, true);
            if (is_array($json)) {
                $desc = $json['descendants'] ?? [];
                if (is_array($desc)) {
                    $data = mastodon_comments_latest($desc, 50);
                    @file_put_contents($cacheFile, json_encode($data));
                }
            }
        }
    }

    if (is_array($data)) {
        $data = mastodon_comments_latest($data, 50);
    }

    if (!is_array($data) || count($data) === 0) {
        $postReactions = mastodon_comments_post_reactions($host, $post_id, $cacheDir, $safePostId, $cacheTtlSeconds);
        $postBoostCount = (int)($postReactions['boosts'] ?? 0);
        $postFavoriteCount = (int)($postReactions['favorites'] ?? 0);
        $replyUrl = mastodon_comments_reply_url($host, $post_id, $user);
        return "<div class='mastodon-nocomments'><h4>This post has " . $postBoostCount . " boosts and " . $postFavoriteCount . " favorites</h4><p>No comments yet. <a href='" . htmlspecialchars($replyUrl) . "' target='_blank' rel='noopener'>Reply on Mastodon</a> to join the discussion.</p></div>";
    }

    $html = "<div class='mastodon-comments-list'>";

    $postReactions = mastodon_comments_post_reactions($host, $post_id, $cacheDir, $safePostId, $cacheTtlSeconds);
    $postBoostCount = (int)($postReactions['boosts'] ?? 0);
    $postFavoriteCount = (int)($postReactions['favorites'] ?? 0);

    $html .= "<h4>This post has " . $postBoostCount . " boosts and " . $postFavoriteCount . " favorites</h4>";
    $html .= "<h3>Comments from the Fediverse</h3>";

    foreach ($data as $comment) {
        if (!is_array($comment)) {
            continue;
        }

        $visibility = $comment['visibility'] ?? '';
        if ($visibility !== 'public' && $visibility !== 'unlisted') {
            continue;
        }

        $account = $comment['account'] ?? [];
        $avatarRaw = (string)($account['avatar_static'] ?? $account['avatar'] ?? '');
        $avatarProxy = $avatarRaw !== '' ? ('mastodon_image_proxy.php?url=' . rawurlencode($avatarRaw)) : '';
        $avatar = htmlspecialchars($avatarProxy, ENT_QUOTES, 'UTF-8');
        $displayName = htmlspecialchars((string)($account['display_name'] ?? ''), ENT_QUOTES, 'UTF-8');
        $username = htmlspecialchars((string)($account['acct'] ?? ''), ENT_QUOTES, 'UTF-8');
        $url = htmlspecialchars((string)($comment['url'] ?? ''), ENT_QUOTES, 'UTF-8');

        $createdAt = (string)($comment['created_at'] ?? '');
        $timestamp = strtotime($createdAt);
        $dateText = $timestamp ? date('M j, Y', $timestamp) : '';
        $dateTextEsc = htmlspecialchars($dateText, ENT_QUOTES, 'UTF-8');

        $boostsCount = (int)($comment['reblogs_count'] ?? 0);
        $favesCount = (int)($comment['favourites_count'] ?? 0);
        $reactionsTextEsc = htmlspecialchars('Boosts: ' . $boostsCount . ' · Faves: ' . $favesCount, ENT_QUOTES, 'UTF-8');

        $content = (string)($comment['content'] ?? '');
        $cleanContent = mastodon_comments_sanitize_html($content);

        $html .= "<div class='mastodon-comment' style='margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;'>";
        $html .= "<div style='display: flex; align-items: center; margin-bottom: 5px;'>";

        if ($avatar !== '') {
            $html .= "<img src='" . $avatar . "' alt='" . $username . "' style='width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;'>";
        }

        $html .= "<div>";
        $html .= "<strong>" . $displayName . "</strong> <small>@" . $username . "</small><br>";

        if ($url !== '' && $dateTextEsc !== '') {
            $html .= "<small><a href='" . $url . "' target='_blank' rel='noopener' style='color: #888;'>" . $dateTextEsc . "</a> <span class='mastodon-reactions' style='color: #888;'>" . $reactionsTextEsc . "</span></small>";
        } elseif ($dateTextEsc !== '') {
            $html .= "<small style='color: #888;'>" . $dateTextEsc . " <span class='mastodon-reactions' style='color: #888;'>" . $reactionsTextEsc . "</span></small>";
        }

        $html .= "</div>";
        $html .= "</div>";

        $html .= "<div class='comment-body'>" . $cleanContent . "</div>";
        $html .= "</div>";
    }

    $replyUrl = mastodon_comments_reply_url($host, $post_id, $user);
    $html .= "<p><a href='" . htmlspecialchars($replyUrl, ENT_QUOTES, 'UTF-8') . "' target='_blank' rel='noopener' class='button'>Reply to this post on Mastodon</a></p>";
    $html .= "</div>";

    return $html;
}

function mastodon_comments_reply_url($host, $post_id, $user) {
    $host = trim((string)$host);
    $post_id = trim((string)$post_id);
    $user = trim((string)$user);

    if ($user !== '' && $user !== 'your_handle') {
        $user = ltrim($user, '@');
        return 'https://' . $host . '/@' . rawurlencode($user) . '/' . rawurlencode($post_id);
    }

    return 'https://' . $host . '/web/statuses/' . rawurlencode($post_id);
}

function mastodon_comments_post_reactions($host, $post_id, $cacheDir, $safePostId, $cacheTtlSeconds) {
    $postBoostCount = 0;
    $postFavoriteCount = 0;

    $postCacheFile = $cacheDir . DIRECTORY_SEPARATOR . 'post_' . $safePostId . '.json';

    $postData = null;
    if (is_file($postCacheFile)) {
        $mtime = filemtime($postCacheFile);
        if ($mtime !== false && (time() - $mtime) < $cacheTtlSeconds) {
            $raw = @file_get_contents($postCacheFile);
            if ($raw !== false) {
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) {
                    $postData = $decoded;
                }
            }
        }
    }

    if ($postData === null) {
        $postApiUrl = 'https://' . $host . '/api/v1/statuses/' . rawurlencode($post_id);
        $response = mastodon_comments_http_get($postApiUrl);
        if (is_string($response) && $response !== '') {
            $json = json_decode($response, true);
            if (is_array($json)) {
                $postData = $json;
                @file_put_contents($postCacheFile, json_encode($postData));
            }
        }
    }

    if (is_array($postData)) {
        $postBoostCount = (int)($postData['reblogs_count'] ?? 0);
        $postFavoriteCount = (int)($postData['favourites_count'] ?? 0);
    }

    return [
        'boosts' => $postBoostCount,
        'favorites' => $postFavoriteCount,
    ];
}

function mastodon_comments_http_get($url) {
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
        curl_setopt($ch, CURLOPT_USERAGENT, 'PHP Mastodon Comments');

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
            'header' => "User-Agent: PHP Mastodon Comments\r\n",
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

function mastodon_comments_sanitize_html($html) {
    $allowedTags = '<p><br><a><span><strong><em><b><i><code><pre><blockquote><ul><ol><li>';
    $clean = strip_tags((string)$html, $allowedTags);

    $clean = preg_replace('/\son\w+\s*=\s*("[^"]*"|\'[^\']*\')/i', '', $clean);
    $clean = preg_replace('/href\s*=\s*("|\')\s*javascript:[^"\']*("|\')/i', 'href="#"', $clean);

    return $clean;
}

function mastodon_comments_latest($comments, $limit) {
    if (!is_array($comments)) {
        return [];
    }

    $items = [];
    foreach ($comments as $c) {
        if (is_array($c)) {
            $items[] = $c;
        }
    }

    usort($items, function ($a, $b) {
        $ta = strtotime((string)($a['created_at'] ?? '')) ?: 0;
        $tb = strtotime((string)($b['created_at'] ?? '')) ?: 0;
        return $ta <=> $tb;
    });

    $limit = (int)$limit;
    if ($limit > 0 && count($items) > $limit) {
        return array_slice($items, -$limit);
    }

    return $items;
}

?>
