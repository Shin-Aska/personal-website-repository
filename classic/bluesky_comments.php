<?php

function get_bluesky_comments($post_url) {
    if (empty($post_url)) {
        return "<div class='bluesky-nocomments'><p>No comments yet.</p></div>";
    }

    // 1. Parse URL
    // Expected: https://bsky.app/profile/{handleOrDid}/post/{rkey}
    $parts = parse_url($post_url);
    if (!isset($parts['path']) || $parts['host'] !== 'bsky.app') {
        return "<div class='bluesky-nocomments'><p>Invalid Bluesky URL.</p></div>";
    }

    $pathSegments = explode('/', trim($parts['path'], '/'));
    // [0]=>profile, [1]=>{handleOrDid}, [2]=>post, [3]=>{rkey}
    if (count($pathSegments) < 4 || $pathSegments[0] !== 'profile' || $pathSegments[2] !== 'post') {
        return "<div class='bluesky-nocomments'><p>Invalid Bluesky URL format.</p></div>";
    }

    $handleOrDid = $pathSegments[1];
    $rkey = $pathSegments[3];

    // 2. Setup Cache
    $cacheDir = __DIR__ . DIRECTORY_SEPARATOR . 'cache';
    if (!is_dir($cacheDir)) {
        @mkdir($cacheDir, 0775, true);
    }

    // 3. Resolve Handle -> DID (if needed)
    $did = $handleOrDid;
    if (strpos($handleOrDid, 'did:') !== 0) {
        $did = bluesky_resolve_handle($handleOrDid, $cacheDir);
        if (!$did) {
            return "<div class='bluesky-nocomments'><p>Could not resolve user handle.</p></div>";
        }
    }

    // 4. Build AT URI
    // at://{did}/app.bsky.feed.post/{rkey}
    $atUri = "at://$did/app.bsky.feed.post/$rkey";

    // 5. Fetch Thread
    $cacheKey = hash('sha256', $atUri);
    $threadCacheFile = $cacheDir . DIRECTORY_SEPARATOR . 'bsky_thread_' . $cacheKey . '.json';
    $cacheTtl = 3600; // 1 hour

    $threadData = null;
    if (is_file($threadCacheFile) && (time() - filemtime($threadCacheFile) < $cacheTtl)) {
        $raw = @file_get_contents($threadCacheFile);
        $threadData = json_decode($raw, true);
    }

    if (!$threadData) {
        $apiUrl = "https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=" . urlencode($atUri) . "&depth=6&parentHeight=0";
        $response = bluesky_http_get($apiUrl);
        if ($response) {
            $json = json_decode($response, true);
            if (isset($json['thread'])) {
                $threadData = $json['thread'];
                @file_put_contents($threadCacheFile, json_encode($threadData));
            }
        }
    }

    if (!$threadData) {
        return "<div class='bluesky-nocomments'><p>Could not load comments from Bluesky. <a href='" . htmlspecialchars($post_url) . "' target='_blank' rel='noopener'>View on Bluesky</a></p></div>";
    }

    // 6. Flatten Thread
    $comments = [];
    if (isset($threadData['replies'])) {
        bluesky_flatten_replies($threadData['replies'], $comments);
    }

    // Sort by indexedAt
    usort($comments, function ($a, $b) {
        $tA = strtotime($a['post']['indexedAt']);
        $tB = strtotime($b['post']['indexedAt']);
        return $tA <=> $tB;
    });

    // Limit to 50
    $comments = array_slice($comments, 0, 50);

    // 7. Render
    $rootPost = $threadData['post'] ?? null;
    $boostCount = $rootPost['repostCount'] ?? 0;
    $likeCount = $rootPost['likeCount'] ?? 0;

    $html = "<div class='bluesky-comments-list'>";

    if (empty($comments)) {
        $html .= "<div class='bluesky-nocomments'><h4>This post has " . $boostCount . " reposts and " . $likeCount . " likes</h4><p>No comments yet. <a href='" . htmlspecialchars($post_url) . "' target='_blank' rel='noopener'>Reply on Bluesky</a> to join the discussion.</p></div>";
        $html .= "</div>";
        return $html;
    }

    $html .= "<h4>This post has " . $boostCount . " reposts and " . $likeCount . " likes</h4>";
    $html .= "<h3>Comments from Bluesky</h3>";

    foreach ($comments as $node) {
        $post = $node['post'];
        $author = $post['author'];
        $record = $post['record'];

        $avatarRaw = $author['avatar'] ?? '';
        $avatarProxy = $avatarRaw ? 'bluesky_image_proxy.php?url=' . rawurlencode($avatarRaw) : '';
        $avatar = htmlspecialchars($avatarProxy);

        $displayName = htmlspecialchars($author['displayName'] ?? $author['handle']);
        $handle = htmlspecialchars($author['handle']);
        
        // Build permalink for reply
        // https://bsky.app/profile/{handle}/post/{rkey}
        $replyUri = $post['uri']; // at://did:plc:.../app.bsky.feed.post/3...
        $replyRkey = basename($replyUri); // just the last part
        $replyUrl = "https://bsky.app/profile/" . $author['handle'] . "/post/" . $replyRkey;

        $createdAt = $post['indexedAt'];
        $timestamp = strtotime($createdAt);
        $dateText = $timestamp ? date('M j, Y', $timestamp) : '';
        
        $likes = $post['likeCount'] ?? 0;
        $reposts = $post['repostCount'] ?? 0;
        $reactionsText = "Reposts: $reposts · Likes: $likes";

        $contentText = htmlspecialchars($record['text'] ?? '');
        $contentHtml = nl2br($contentText);

        $html .= "<div class='bluesky-comment' style='margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;'>";
        $html .= "<div style='display: flex; align-items: center; margin-bottom: 5px;'>";
        
        if ($avatar) {
             $html .= "<img src='" . $avatar . "' alt='" . $handle . "' style='width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;'>";
        }

        $html .= "<div>";
        $html .= "<strong>" . $displayName . "</strong> <small>@" . $handle . "</small><br>";
        $html .= "<small><a href='" . htmlspecialchars($replyUrl) . "' target='_blank' rel='noopener' style='color: #888;'>" . $dateText . "</a> <span class='bluesky-reactions' style='color: #888;'>" . htmlspecialchars($reactionsText) . "</span></small>";
        $html .= "</div></div>";
        
        $html .= "<div class='comment-body'>" . $contentHtml . "</div>";
        $html .= "</div>";
    }

    $html .= "<p><a href='" . htmlspecialchars($post_url) . "' target='_blank' rel='noopener' class='button'>Reply to this post on Bluesky</a></p>";
    $html .= "</div>";

    return $html;
}

function bluesky_resolve_handle($handle, $cacheDir) {
    $cacheFile = $cacheDir . DIRECTORY_SEPARATOR . 'bsky_handle_' . md5($handle) . '.json';
    $cacheTtl = 86400; // 24 hours

    if (is_file($cacheFile) && (time() - filemtime($cacheFile) < $cacheTtl)) {
        $raw = @file_get_contents($cacheFile);
        $data = json_decode($raw, true);
        if (isset($data['did'])) {
            return $data['did'];
        }
    }

    $url = "https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=" . urlencode($handle);
    $response = bluesky_http_get($url);
    if ($response) {
        $json = json_decode($response, true);
        if (isset($json['did'])) {
            @file_put_contents($cacheFile, json_encode(['did' => $json['did']]));
            return $json['did'];
        }
    }
    return null;
}

function bluesky_flatten_replies($replies, &$comments) {
    foreach ($replies as $node) {
        // We only care about nodes that have a 'post' object
        // Blocked posts or not-found posts might appear differently
        if (isset($node['post'])) {
            $comments[] = $node;
        }

        if (isset($node['replies']) && is_array($node['replies'])) {
            bluesky_flatten_replies($node['replies'], $comments);
        }
    }
}

function bluesky_http_get($url) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_USERAGENT, 'PHP Bluesky Comments');
        $body = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($status >= 200 && $status < 300) {
            return $body;
        }
        return null;
    }
    // Fallback? (Maybe omit for now to keep it simple, or use stream_context like Mastodon)
    return @file_get_contents($url);
}
?>
