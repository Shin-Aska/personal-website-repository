import base64
import json
import tempfile
import unittest
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

from publisher import render_portable_article
from tools.wordpress_publisher import WordPressClient


REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_TEMPLATE = REPO_ROOT / "articles" / "templates" / "default.html"


class FakeResponse:
    def __init__(self, payload: object) -> None:
        self.payload = payload

    def __enter__(self) -> "FakeResponse":
        return self

    def __exit__(self, *_args: object) -> None:
        return None

    def read(self) -> bytes:
        return json.dumps(self.payload).encode("utf-8")


class FakeOpener:
    def __init__(self, responses: list[object]) -> None:
        self.responses = iter(responses)
        self.requests = []

    def __call__(self, request, *, timeout: float):
        self.requests.append((request, timeout))
        return FakeResponse(next(self.responses))


class PortableArticleRenderingTests(unittest.TestCase):
    def test_render_omits_static_php_and_collects_linked_images(self) -> None:
        markdown = """# Portable title

## First section

Article body.

- [ ] [![](images/preview.png)](images/full.png)
- [ ] A caption
"""
        with tempfile.TemporaryDirectory() as temp_dir:
            markdown_path = Path(temp_dir) / "portable.md"
            markdown_path.write_text(markdown, encoding="utf-8")

            article = render_portable_article(
                str(DEFAULT_TEMPLATE),
                str(markdown_path),
            )

        self.assertEqual(article.title, "Portable title")
        self.assertNotIn("<h1", article.content)
        self.assertIn('<h2 id="first_section">First section</h2>', article.content)
        self.assertNotIn("<?php", article.content)
        self.assertNotIn("site_counter.php", article.content)
        self.assertEqual(
            article.images,
            (
                "articles/images/preview.png",
                "articles/images/full.png",
            ),
        )


class WordPressClientTests(unittest.TestCase):
    def test_create_post_uses_basic_auth_and_draft_status(self) -> None:
        opener = FakeOpener(
            [
                [],
                {
                    "id": 42,
                    "link": "https://wordpress.example/posts/article",
                    "status": "draft",
                },
            ]
        )
        client = WordPressClient(
            "https://wordpress.example",
            "writer",
            "application password",
            opener=opener,
        )

        result = client.publish_article(
            title="Article title",
            content="<p>Body</p>",
            slug="article",
        )

        self.assertTrue(result.created)
        self.assertEqual(result.post_id, 42)
        lookup_request = opener.requests[0][0]
        lookup_query = parse_qs(urlsplit(lookup_request.full_url).query)
        self.assertEqual(lookup_query["slug"], ["article"])
        self.assertEqual(lookup_query["status"], ["any"])

        save_request = opener.requests[1][0]
        expected_token = base64.b64encode(
            b"writer:application password"
        ).decode("ascii")
        self.assertEqual(
            save_request.get_header("Authorization"),
            f"Basic {expected_token}",
        )
        self.assertEqual(save_request.get_method(), "POST")
        self.assertTrue(save_request.full_url.endswith("/wp-json/wp/v2/posts"))
        payload = json.loads(save_request.data.decode("utf-8"))
        self.assertEqual(payload["status"], "draft")
        self.assertEqual(payload["title"], "Article title")

    def test_existing_post_is_updated_by_id(self) -> None:
        opener = FakeOpener(
            [
                [{"id": 17, "status": "publish"}],
                {
                    "id": 17,
                    "link": "https://wordpress.example/posts/article",
                    "status": "publish",
                },
            ]
        )
        client = WordPressClient(
            "https://wordpress.example",
            "writer",
            "secret",
            opener=opener,
        )

        result = client.publish_article(
            title="Updated title",
            content="<p>Updated</p>",
            slug="article",
            status="publish",
        )

        self.assertFalse(result.created)
        self.assertTrue(
            opener.requests[1][0].full_url.endswith("/wp-json/wp/v2/posts/17")
        )

    def test_images_are_uploaded_and_urls_are_rewritten(self) -> None:
        opener = FakeOpener(
            [
                [],
                {
                    "id": 9,
                    "source_url": "https://wordpress.example/uploads/photo.png",
                },
                [],
                {
                    "id": 51,
                    "link": "https://wordpress.example/posts/article",
                    "status": "draft",
                },
            ]
        )
        client = WordPressClient(
            "https://wordpress.example",
            "writer",
            "secret",
            opener=opener,
        )

        with tempfile.TemporaryDirectory() as temp_dir:
            repository_root = Path(temp_dir)
            image_path = repository_root / "articles" / "images" / "photo.png"
            image_path.parent.mkdir(parents=True)
            image_path.write_bytes(b"fake-png")

            client.publish_article(
                title="With image",
                content='<figure><img src="images/photo.png"></figure>',
                slug="article",
                image_paths=("articles/images/photo.png",),
                repository_root=repository_root,
            )

        upload_request = opener.requests[1][0]
        self.assertEqual(upload_request.data, b"fake-png")
        self.assertEqual(upload_request.get_header("Content-type"), "image/png")
        self.assertIn(
            'filename="photo.png"',
            upload_request.get_header("Content-disposition"),
        )

        save_request = opener.requests[3][0]
        payload = json.loads(save_request.data.decode("utf-8"))
        self.assertIn(
            'src="https://wordpress.example/uploads/photo.png"',
            payload["content"],
        )

    def test_plain_http_is_rejected_except_for_localhost(self) -> None:
        with self.assertRaisesRegex(ValueError, "HTTPS"):
            WordPressClient("http://wordpress.example", "writer", "secret")

        WordPressClient("http://localhost:8080", "writer", "secret")


if __name__ == "__main__":
    unittest.main()
