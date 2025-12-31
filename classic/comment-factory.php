<?php

function comment_factory_merge(array $bundles) {
    $merged = [
        'sources' => [],
        'comments' => [],
        'hasComments' => false,
    ];

    foreach ($bundles as $bundle) {
        if (!is_array($bundle) || empty($bundle)) {
            continue;
        }

        $platform = $bundle['platform'] ?? 'unknown';
        $platformLabel = $bundle['platformLabel'] ?? ucfirst($platform);

        $merged['sources'][] = [
            'platform' => $platform,
            'label' => $platformLabel,
            'metrics' => $bundle['postMetrics'] ?? [],
            'cta' => $bundle['cta'] ?? [],
            'emptyMessage' => $bundle['emptyMessage'] ?? '',
            'errors' => $bundle['errors'] ?? [],
        ];

        foreach ($bundle['comments'] ?? [] as $comment) {
            if (!is_array($comment)) {
                continue;
            }

            $comment['platform'] = $platform;
            $comment['platformLabel'] = $platformLabel;
            $merged['comments'][] = $comment;
        }
    }

    usort($merged['comments'], function ($a, $b) {
        $timeA = (int)($a['timestamp'] ?? 0);
        $timeB = (int)($b['timestamp'] ?? 0);
        return $timeB <=> $timeA;
    });

    $merged['hasComments'] = !empty($merged['comments']);

    return $merged;
}

function comment_factory_render(array $merged) {
    $html = "<div class='comment-factory'>";

    $html .= "<div class='comment-factory-summary'>";
    foreach ($merged['sources'] as $source) {
        $label = htmlspecialchars($source['label'], ENT_QUOTES, 'UTF-8');
        $html .= "<div class='comment-factory-source-card'>";
        $html .= "<h4>$label</h4>";

        if (!empty($source['metrics'])) {
            $html .= "<div class='comment-factory-metrics'>";
            foreach ($source['metrics'] as $metric) {
                $metricLabel = htmlspecialchars((string)($metric['label'] ?? ''), ENT_QUOTES, 'UTF-8');
                $metricValue = htmlspecialchars((string)($metric['value'] ?? '0'), ENT_QUOTES, 'UTF-8');
                $html .= "<div class='comment-factory-metric'><span>$metricLabel</span><strong>$metricValue</strong></div>";
            }
            $html .= "</div>";
        }

        if (!empty($source['errors'])) {
            $error = htmlspecialchars((string)($source['errors'][0] ?? ''), ENT_QUOTES, 'UTF-8');
            $html .= "<p class='comment-factory-note'>$error</p>";
        } elseif (!empty($source['cta']['url'])) {
            $ctaUrl = htmlspecialchars($source['cta']['url'], ENT_QUOTES, 'UTF-8');
            $ctaLabel = htmlspecialchars($source['cta']['label'] ?? 'Reply', ENT_QUOTES, 'UTF-8');
            $html .= "<p class='comment-factory-note'><a href='$ctaUrl' target='_blank' rel='noopener'>$ctaLabel</a></p>";
        }

        $html .= "</div>";
    }
    $html .= "</div>";

    if (!$merged['hasComments']) {
        $messages = [];
        foreach ($merged['sources'] as $source) {
            if (!empty($source['emptyMessage'])) {
                $messages[] = $source['emptyMessage'];
            }
        }

        if (count($merged['sources']) > 1) {
            $fallback = 'No comments yet. Reply on any of the platforms below to join the discussion.';
        } else {
            $fallback = !empty($messages) ? implode(' ', $messages) : 'No comments to display right now.';
        }

        $html .= "<div class='comment-factory-empty'><p>" . htmlspecialchars($fallback, ENT_QUOTES, 'UTF-8') . "</p></div></div>";
        return $html;
    }

    $html .= "<div class='comment-factory-feed'>";
    foreach ($merged['comments'] as $comment) {
        $author = $comment['author'] ?? [];
        $displayName = htmlspecialchars((string)($author['displayName'] ?? ''), ENT_QUOTES, 'UTF-8');
        $handle = htmlspecialchars((string)($author['handle'] ?? ''), ENT_QUOTES, 'UTF-8');
        $avatar = htmlspecialchars((string)($author['avatar'] ?? ''), ENT_QUOTES, 'UTF-8');
        $dateText = htmlspecialchars((string)($comment['dateText'] ?? ''), ENT_QUOTES, 'UTF-8');
        $permalink = htmlspecialchars((string)($comment['permalink'] ?? ''), ENT_QUOTES, 'UTF-8');
        $platformLabel = htmlspecialchars((string)($comment['platformLabel'] ?? ''), ENT_QUOTES, 'UTF-8');
        $platform = (string)($comment['platform'] ?? 'unknown');
        $platformColor = comment_factory_platform_color($platform);

        $metricsText = comment_factory_metrics_text($comment['metrics'] ?? []);
        $contentHtml = $comment['contentHtml'] ?? '';

        $html .= "<article class='comment-factory-item'>";
        $html .= "<div class='comment-factory-item-header'>";
        if ($avatar !== '') {
            $html .= "<img class='comment-factory-avatar' src='$avatar' alt='$handle'>";
        }
        $html .= "<div class='comment-factory-author'>";
        $html .= "<div class='comment-factory-author-row'>";
        $html .= "<strong>$displayName</strong> <small>@$handle</small>";
        $html .= "<span class='comment-factory-platform' style='background:$platformColor;'>$platformLabel</span>";
        $html .= "</div>";
        if ($permalink !== '' && $dateText !== '') {
            $html .= "<small><a href='$permalink' target='_blank' rel='noopener'>$dateText</a></small>";
        } elseif ($dateText !== '') {
            $html .= "<small>$dateText</small>";
        }
        if ($metricsText !== '') {
            $html .= "<small class='comment-factory-reactions'>$metricsText</small>";
        }
        $html .= "</div></div>";
        $html .= "<div class='comment-factory-body'>$contentHtml</div>";
        $html .= "</article>";
    }
    $html .= "</div></div>";

    return $html;
}

function comment_factory_metrics_text(array $metrics) {
    $parts = [];
    foreach ($metrics as $metric) {
        if (!isset($metric['label'])) {
            continue;
        }
        $label = htmlspecialchars((string)$metric['label'], ENT_QUOTES, 'UTF-8');
        $value = htmlspecialchars((string)($metric['value'] ?? '0'), ENT_QUOTES, 'UTF-8');
        $parts[] = "$label: $value";
    }
    return implode(' · ', $parts);
}

function comment_factory_platform_color($platform) {
    $map = [
        'mastodon' => '#19b89e',
        'bluesky' => '#1e90ff',
    ];
    return $map[$platform] ?? '#555';
}

?>
