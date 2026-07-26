import tempfile
import unittest
from pathlib import Path

from tools.pytk_publisher_tool import (
    SocialPostParameters,
    extract_social_parameters,
    load_published_social_parameters,
)


class SocialParameterLoadingTests(unittest.TestCase):
    def test_extract_social_parameters_from_generated_html(self) -> None:
        html = """
            $commentBundles = [
                mastodon_comment_bundle(
                    "116585647444340240",
                    "mastodon.social",
                    "@richardorilla"
                ),
                bluesky_comment_bundle(
                    "https://bsky.app/profile/example.test/post/abc123"
                ),
            ];
        """

        self.assertEqual(
            extract_social_parameters(html),
            SocialPostParameters(
                mastodon_post_id="116585647444340240",
                mastodon_instance="mastodon.social",
                mastodon_user_handle="@richardorilla",
                bluesky_post_url=(
                    "https://bsky.app/profile/example.test/post/abc123"
                ),
            ),
        )

    def test_load_uses_classic_as_fallback_for_missing_default_values(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            default_dir = temp_path / "default"
            classic_dir = temp_path / "classic"
            default_dir.mkdir()
            classic_dir.mkdir()

            (default_dir / "article.html").write_text(
                'mastodon_comment_bundle("123", "social.example", "@writer")',
                encoding="utf-8",
            )
            (classic_dir / "article.html").write_text(
                'bluesky_comment_bundle('
                '"https://bsky.app/profile/writer/post/456")',
                encoding="utf-8",
            )

            parameters, sources = load_published_social_parameters(
                "article", (default_dir, classic_dir)
            )

            self.assertEqual(
                parameters,
                SocialPostParameters(
                    mastodon_post_id="123",
                    mastodon_instance="social.example",
                    mastodon_user_handle="@writer",
                    bluesky_post_url=(
                        "https://bsky.app/profile/writer/post/456"
                    ),
                ),
            )
            self.assertEqual(
                sources,
                (
                    default_dir / "article.html",
                    classic_dir / "article.html",
                ),
            )

    def test_load_returns_empty_values_when_article_has_not_been_published(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            parameters, sources = load_published_social_parameters(
                "new-article",
                (temp_path / "default", temp_path / "classic"),
            )

            self.assertEqual(parameters, SocialPostParameters())
            self.assertEqual(sources, ())


if __name__ == "__main__":
    unittest.main()
