<?php

require_once __DIR__ . '/CommentProvider.php';

class BlueskyCommentProvider extends CommentProvider {
    public function getComments($config) {
        $post_url = trim((string)($config['post_url'] ?? ''));

        $result = [
            'platform' => 'bluesky',
            'platformLabel' => 'Bluesky',
            'sourceId' => $post_url,
            'comments' => [],
            'postMetrics' => [
                'reposts' => ['label' => 'Reposts', 'value' => 0],
                'likes' => ['label' => 'Likes', 'value' => 0],
            ],
            'cta' => [
                'label' => 'Reply to this post on Bluesky',
                'url' => $post_url,
            ],
            'emptyMessage' => 'No comments yet. Reply on Bluesky to join the discussion.',
            'errors' => [],
        ];

        if (empty($post_url)) {
            $result['errors'][] = 'No comments yet.';
            return $result;
        }

        // 1. Parse URL
        $parts = parse_url($post_url);
        if (!isset($parts['path']) || $parts['host'] !== 'bsky.app') {
            $result['errors'][] = 'Invalid Bluesky URL.';
            return $result;
        }

        $pathSegments = explode('/', trim($parts['path'], '/'));
        if (count($pathSegments) < 4 || $pathSegments[0] !== 'profile' || $pathSegments[2] !== 'post') {
            $result['errors'][] = 'Invalid Bluesky URL format.';
            return $result;
        }

        $handleOrDid = $pathSegments[1];
        $rkey = $pathSegments[3];

        // 3. Resolve Handle -> DID (if needed)
        // Cache dir is handled by parent, but we need to pass it to resolveHandle or use setCache
        $did = $handleOrDid;
        if (strpos($handleOrDid, 'did:') !== 0) {
            $did = $this->resolveHandle($handleOrDid);
            if (!$did) {
                $result['errors'][] = 'Could not resolve user handle.';
                return $result;
            }
        }

        // 4. Build AT URI
        $atUri = "at://$did/app.bsky.feed.post/$rkey";

        // 5. Fetch Thread
        $cacheKey = 'bsky_thread_' . hash('sha256', $atUri);
        $threadData = $this->getCache($cacheKey);

        if (!$threadData) {
            $apiUrl = "https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=" . urlencode($atUri) . "&depth=6&parentHeight=0";
            $response = $this->httpGet($apiUrl, 'PHP Bluesky Comments');
            if ($response) {
                $json = json_decode($response, true);
                if (isset($json['thread'])) {
                    $threadData = $json['thread'];
                    $this->setCache($cacheKey, $threadData);
                }
            }
        }

        if (!$threadData) {
            $result['errors'][] = 'Could not load comments from Bluesky.';
            return $result;
        }

        // 6. Flatten Thread
        $comments = [];
        if (isset($threadData['replies'])) {
            $this->flattenReplies($threadData['replies'], $comments);
        }

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
        $result['postMetrics']['reposts']['value'] = $boostCount;
        $result['postMetrics']['likes']['value'] = $likeCount;
        $result['cta']['url'] = $post_url;

        if (empty($comments)) {
            return $result;
        }

        foreach ($comments as $node) {
            $post = $node['post'];
            $author = $post['author'];
            $record = $post['record'];

            $avatarRaw = $author['avatar'] ?? '';
            $avatarProxy = $avatarRaw ? 'BlueskyImageProxy.php?url=' . rawurlencode($avatarRaw) : '';

            $displayName = $author['displayName'] ?? $author['handle'];
            $handle = $author['handle'];
            
            $replyUri = $post['uri'];
            $replyRkey = basename($replyUri);
            $replyUrl = "https://bsky.app/profile/" . $author['handle'] . "/post/" . $replyRkey;

            $createdAt = $post['indexedAt'];
            $timestamp = strtotime($createdAt);
            $dateText = $timestamp ? date('M j, Y', $timestamp) : '';
            
            $likes = $post['likeCount'] ?? 0;
            $reposts = $post['repostCount'] ?? 0;

            $contentText = htmlspecialchars($record['text'] ?? '');
            $contentHtml = nl2br($contentText);

            $result['comments'][] = [
                'id' => $post['uri'] ?? '',
                'platform' => 'bluesky',
                'timestamp' => $timestamp ?: 0,
                'dateText' => $dateText,
                'permalink' => $replyUrl,
                'author' => [
                    'displayName' => $displayName,
                    'handle' => $handle,
                    'avatar' => $avatarProxy,
                ],
                'contentHtml' => $contentHtml,
                'contentText' => $record['text'] ?? '',
                'metrics' => [
                    'reposts' => [
                        'label' => 'Reposts',
                        'value' => $reposts,
                    ],
                    'likes' => [
                        'label' => 'Likes',
                        'value' => $likes,
                    ],
                ],
            ];
        }

        return $result;
    }

    private function resolveHandle($handle) {
        $cacheKey = 'bsky_handle_' . md5($handle);
        // We need to implement manual cache get/set here because getCache expects no extension logic
        // But our parent getCache appends .json so it's fine.
        
        // Wait, parent getCache does: $this->getCacheFilePath($key) -> $key . '.json'
        // Original code used: 'bsky_handle_' . md5($handle) . '.json' with 24h TTL.
        // My parent uses default TTL (set in constructor).
        // I should stick to parent methods for consistency, even if TTL differs slightly (default 1h vs 24h).
        // If I strictly need 24h, I can ignore it or just accept 1h. 1h is probably fine.
        // Or I can override getCache/setCache? No, just use what we have.
        
        $data = $this->getCache($cacheKey);
        if (isset($data['did'])) {
            return $data['did'];
        }

        $url = "https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=" . urlencode($handle);
        $response = $this->httpGet($url, 'PHP Bluesky Comments');
        if ($response) {
            $json = json_decode($response, true);
            if (isset($json['did'])) {
                $this->setCache($cacheKey, ['did' => $json['did']]);
                return $json['did'];
            }
        }
        return null;
    }

    private function flattenReplies($replies, &$comments) {
        foreach ($replies as $node) {
            if (isset($node['post'])) {
                $comments[] = $node;
            }

            if (isset($node['replies']) && is_array($node['replies'])) {
                $this->flattenReplies($node['replies'], $comments);
            }
        }
    }
}

// Procedural Wrappers

function get_bluesky_comments($post_url) {
    $bundle = bluesky_comment_bundle($post_url);
    return bluesky_render_comments_bundle($bundle);
}

function bluesky_comment_bundle($post_url) {
    $provider = new BlueskyCommentProvider();
    return $provider->getComments(['post_url' => $post_url]);
}

function bluesky_render_comments_bundle($bundle) {
    // Keep original logic
    if (!empty($bundle['errors'])) {
        $message = htmlspecialchars($bundle['errors'][0], ENT_QUOTES, 'UTF-8');
        $link = htmlspecialchars($bundle['sourceId'] ?? '', ENT_QUOTES, 'UTF-8');
        return "<div class='bluesky-nocomments'><p>" . $message . " " . ($link ? "<a href='" . $link . "' target='_blank' rel='noopener'>View on Bluesky</a>" : '') . "</p></div>";
    }

    $repostCount = (int)($bundle['postMetrics']['reposts']['value'] ?? 0);
    $likeCount = (int)($bundle['postMetrics']['likes']['value'] ?? 0);
    $postUrl = htmlspecialchars($bundle['cta']['url'] ?? '', ENT_QUOTES, 'UTF-8');

    $html = "<div class='bluesky-comments-list'>";

    if (empty($bundle['comments'])) {
        $html .= "<div class='bluesky-nocomments'><h4>This post has " . $repostCount . " reposts and " . $likeCount . " likes</h4><p>No comments yet. <a href='" . $postUrl . "' target='_blank' rel='noopener'>Reply on Bluesky</a> to join the discussion.</p></div>";
        $html .= "</div>";
        return $html;
    }

    $html .= "<h4>This post has " . $repostCount . " reposts and " . $likeCount . " likes</h4>";
    $html .= "<h3>Comments from Bluesky</h3>";

    foreach ($bundle['comments'] as $comment) {
        $author = $comment['author'] ?? [];
        $avatar = htmlspecialchars((string)($author['avatar'] ?? ''), ENT_QUOTES, 'UTF-8');
        $displayName = htmlspecialchars((string)($author['displayName'] ?? ''), ENT_QUOTES, 'UTF-8');
        $handle = htmlspecialchars((string)($author['handle'] ?? ''), ENT_QUOTES, 'UTF-8');
        $permalink = htmlspecialchars((string)($comment['permalink'] ?? ''), ENT_QUOTES, 'UTF-8');
        $dateText = htmlspecialchars((string)($comment['dateText'] ?? ''), ENT_QUOTES, 'UTF-8');
        $reposts = (int)($comment['metrics']['reposts']['value'] ?? 0);
        $likes = (int)($comment['metrics']['likes']['value'] ?? 0);
        $reactionsText = htmlspecialchars("Reposts: $reposts · Likes: $likes", ENT_QUOTES, 'UTF-8');

        $html .= "<div class='bluesky-comment' style='margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;'>";
        $html .= "<div style='display: flex; align-items: center; margin-bottom: 5px;'>";

        if ($avatar) {
             $html .= "<img src='" . $avatar . "' alt='" . $handle . "' style='width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;'>";
        }

        $html .= "<div>";
        $html .= "<strong>" . $displayName . "</strong> <small>@" . $handle . "</small><br>";
        $html .= "<small><a href='" . $permalink . "' target='_blank' rel='noopener' style='color: #888;'>" . $dateText . "</a> <span class='bluesky-reactions' style='color: #888;'>" . $reactionsText . "</span></small>";
        $html .= "</div></div>";
        
        $html .= "<div class='comment-body'>" . ($comment['contentHtml'] ?? '') . "</div>";
        $html .= "</div>";
    }

    $html .= "<p><a href='" . $postUrl . "' target='_blank' rel='noopener' class='button'>Reply to this post on Bluesky</a></p>";
    $html .= "</div>";

    return $html;
}

// Helpers removed (moved to class) logic for http_get, resolve_handle, flatten_replies are now in class.
?>
