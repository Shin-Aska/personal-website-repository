<?php

require_once __DIR__ . '/CommentProvider.php';

class MastodonCommentProvider extends CommentProvider {
    public function getComments($config) {
        $post_id = trim((string)($config['post_id'] ?? ''));
        $host = trim((string)($config['host'] ?? 'mastodon.social'));
        $user = trim((string)($config['user'] ?? 'your_handle'));

        $result = [
            'platform' => 'mastodon',
            'platformLabel' => 'Fediverse',
            'sourceId' => $post_id,
            'host' => '',
            'comments' => [],
            'postMetrics' => [
                'boosts' => ['label' => 'Boosts', 'value' => 0],
                'favorites' => ['label' => 'Favorites', 'value' => 0],
            ],
            'cta' => [
                'label' => 'Reply to this post on Mastodon',
                'url' => '',
            ],
            'emptyMessage' => 'No comments yet. Reply on Mastodon to join the discussion.',
            'errors' => [],
        ];

        if ($post_id === '') {
            $result['errors'][] = 'No comments yet. Reply on Mastodon to join the discussion.';
            return $result;
        }

        $host = preg_replace('#^https?://#i', '', $host);
        $host = preg_replace('#/.*$#', '', $host);
        $result['host'] = $host;

        $user = trim((string)$user);

        // Cache setup is now handled by parent constructor, but we need specific key
        $safePostId = preg_replace('/[^A-Za-z0-9_-]/', '_', $post_id);
        
        $data = $this->getCache('comments_' . $safePostId);
        
        if ($data === null) {
            $apiUrl = 'https://' . $host . '/api/v1/statuses/' . rawurlencode($post_id) . '/context';
            $response = $this->httpGet($apiUrl);

            if (is_string($response) && $response !== '') {
                $json = json_decode($response, true);
                if (is_array($json)) {
                    $desc = $json['descendants'] ?? [];
                    if (is_array($desc)) {
                        $data = $this->processLatest($desc, 50);
                        $this->setCache('comments_' . $safePostId, $data);
                    }
                }
            }
        }

        if (is_array($data)) {
            $data = $this->processLatest($data, 50);
        }

        if (!is_array($data)) {
            $data = [];
        }

        $postReactions = $this->getPostReactions($host, $post_id, $safePostId);
        $result['postMetrics']['boosts']['value'] = $postReactions['boosts'];
        $result['postMetrics']['favorites']['value'] = $postReactions['favorites'];

        $result['cta']['url'] = $this->getReplyUrl($host, $post_id, $user);

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
            $avatarProxy = $avatarRaw ? 'MastodonImageProxy.php?url=' . rawurlencode($avatarRaw) : '';
            $displayName = (string)($account['display_name'] ?? '');
            $username = (string)($account['acct'] ?? '');
            $url = (string)($comment['url'] ?? '');

            $createdAt = (string)($comment['created_at'] ?? '');
            $timestamp = strtotime($createdAt);
            $dateText = $timestamp ? date('M j, Y', $timestamp) : '';

            $boostsCount = (int)($comment['reblogs_count'] ?? 0);
            $favesCount = (int)($comment['favourites_count'] ?? 0);

            $content = (string)($comment['content'] ?? '');
            $cleanContent = $this->sanitizeHtml($content);

            $result['comments'][] = [
                'id' => (string)($comment['id'] ?? ''),
                'platform' => 'mastodon',
                'timestamp' => $timestamp ?: 0,
                'dateText' => $dateText,
                'permalink' => $url,
                'author' => [
                    'displayName' => $displayName,
                    'handle' => $username,
                    'avatar' => $avatarProxy,
                ],
                'contentHtml' => $cleanContent,
                'contentText' => trim(strip_tags($cleanContent)),
                'metrics' => [
                    'boosts' => [
                        'label' => 'Boosts',
                        'value' => $boostsCount,
                    ],
                    'favorites' => [
                        'label' => 'Faves',
                        'value' => $favesCount,
                    ],
                ],
            ];
        }

        return $result;
    }

    private function getPostReactions($host, $post_id, $safePostId) {
        $key = 'post_' . $safePostId;
        $postData = $this->getCache($key);

        if ($postData === null) {
            $postApiUrl = 'https://' . $host . '/api/v1/statuses/' . rawurlencode($post_id);
            $response = $this->httpGet($postApiUrl);
            if (is_string($response) && $response !== '') {
                $json = json_decode($response, true);
                if (is_array($json)) {
                    $postData = $json;
                    $this->setCache($key, $postData);
                }
            }
        }

        $postBoostCount = 0;
        $postFavoriteCount = 0;

        if (is_array($postData)) {
            $postBoostCount = (int)($postData['reblogs_count'] ?? 0);
            $postFavoriteCount = (int)($postData['favourites_count'] ?? 0);
        }

        return [
            'boosts' => $postBoostCount,
            'favorites' => $postFavoriteCount,
        ];
    }

    private function getReplyUrl($host, $post_id, $user) {
        if ($user !== '' && $user !== 'your_handle') {
            $user = ltrim($user, '@');
            return 'https://' . $host . '/@' . rawurlencode($user) . '/' . rawurlencode($post_id);
        }
        return 'https://' . $host . '/web/statuses/' . rawurlencode($post_id);
    }

    private function sanitizeHtml($html) {
        $allowedTags = '<p><br><a><span><strong><em><b><i><code><pre><blockquote><ul><ol><li>';
        $clean = strip_tags((string)$html, $allowedTags);
        $clean = preg_replace('/\son\w+\s*=\s*("[^"]*"|\'[^\']*\')/i', '', $clean);
        $clean = preg_replace('/href\s*=\s*("|\')\s*javascript:[^"\']*("|\')/i', 'href="#"', $clean);
        return $clean;
    }

    private function processLatest($comments, $limit) {
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
}

// Procedural Wrappers

function get_mastodon_comments($post_id, $host = 'mastodon.social', $user = 'your_handle') {
    $bundle = mastodon_comment_bundle($post_id, $host, $user);
    return mastodon_render_comments_bundle($bundle);
}

function mastodon_comment_bundle($post_id, $host = 'mastodon.social', $user = 'your_handle') {
    $provider = new MastodonCommentProvider();
    return $provider->getComments([
        'post_id' => $post_id,
        'host' => $host,
        'user' => $user
    ]);
}

function mastodon_render_comments_bundle($bundle) {
    // Keep original rendering logic exactly as is or verify if it can be simplified?
    // The previous implementation was purely pure function over the bundle array.
    // I will preserve it exactly as it was to ensure UI doesn't break.
    
    $postBoostCount = (int)($bundle['postMetrics']['boosts']['value'] ?? 0);
    $postFavoriteCount = (int)($bundle['postMetrics']['favorites']['value'] ?? 0);
    $replyUrl = $bundle['cta']['url'] ?? '';

    if (!empty($bundle['errors'])) {
        $message = htmlspecialchars($bundle['errors'][0], ENT_QUOTES, 'UTF-8');
        return "<div class='mastodon-nocomments'><p>" . $message . "</p></div>";
    }

    if (empty($bundle['comments'])) {
        $replyLink = htmlspecialchars($replyUrl, ENT_QUOTES, 'UTF-8');
        return "<div class='mastodon-nocomments'><h4>This post has " . $postBoostCount . " boosts and " . $postFavoriteCount . " favorites</h4><p>No comments yet. <a href='" . $replyLink . "' target='_blank' rel='noopener'>Reply on Mastodon</a> to join the discussion.</p></div>";
    }

    $html = "<div class='mastodon-comments-list'>";
    $html .= "<h4>This post has " . $postBoostCount . " boosts and " . $postFavoriteCount . " favorites</h4>";
    $html .= "<h3>Comments from the Fediverse</h3>";

    foreach ($bundle['comments'] as $comment) {
        $author = $comment['author'] ?? [];
        $avatar = (string)($author['avatar'] ?? '');
        $avatarEsc = htmlspecialchars($avatar, ENT_QUOTES, 'UTF-8');
        $displayName = htmlspecialchars((string)($author['displayName'] ?? ''), ENT_QUOTES, 'UTF-8');
        $username = htmlspecialchars((string)($author['handle'] ?? ''), ENT_QUOTES, 'UTF-8');
        $url = htmlspecialchars((string)($comment['permalink'] ?? ''), ENT_QUOTES, 'UTF-8');
        $dateTextEsc = htmlspecialchars((string)($comment['dateText'] ?? ''), ENT_QUOTES, 'UTF-8');

        $boostsCount = (int)($comment['metrics']['boosts']['value'] ?? 0);
        $favesCount = (int)($comment['metrics']['favorites']['value'] ?? 0);
        $reactionsTextEsc = htmlspecialchars('Boosts: ' . $boostsCount . ' · Faves: ' . $favesCount, ENT_QUOTES, 'UTF-8');

        $html .= "<div class='mastodon-comment' style='margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;'>";
        $html .= "<div style='display: flex; align-items: center; margin-bottom: 5px;'>";

        if ($avatarEsc !== '') {
            $html .= "<img src='" . $avatarEsc . "' alt='" . $username . "' style='width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;'>";
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

        $html .= "<div class='comment-body'>" . ($comment['contentHtml'] ?? '') . "</div>";
        $html .= "</div>";
    }

    $replyLink = htmlspecialchars($replyUrl, ENT_QUOTES, 'UTF-8');
    $html .= "<p><a href='" . $replyLink . "' target='_blank' rel='noopener' class='button'>Reply to this post on Mastodon</a></p>";
    $html .= "</div>";

    return $html;
}
?>
