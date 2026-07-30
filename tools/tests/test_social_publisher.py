import json
import tempfile
import unittest
from pathlib import Path
from urllib.parse import parse_qs

from tools.social_publisher import (
    BlueskyClient,
    MastodonClient,
    SOCIAL_POST_LIMIT,
    build_public_urls,
    build_social_post,
    extract_article_description,
    inject_social_metadata,
    select_social_image,
)


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


class SocialContentTests(unittest.TestCase):
    def test_social_post_limit_includes_appended_url(self) -> None:
        article_url = "https://example.test/article.html"
        allowed_message = "x" * (
            SOCIAL_POST_LIMIT - len(article_url) - len("\n\n")
        )
        post = build_social_post(allowed_message, article_url)
        self.assertEqual(len(post), SOCIAL_POST_LIMIT)

        with self.assertRaisesRegex(ValueError, "301 characters"):
            build_social_post(allowed_message + "x", article_url)

    def test_description_and_thumbnail_image_are_selected(self) -> None:
        content = (
            "<h2>Table of Contents</h2>"
            "<p>This is the first <b>article</b> paragraph.</p>"
            "<p>Second paragraph.</p>"
        )
        self.assertEqual(
            extract_article_description(content),
            "This is the first article paragraph.",
        )
        self.assertEqual(
            select_social_image(
                (
                    "articles/images/preview_tmb.png",
                    "articles/images/preview.png",
                )
            ),
            "articles/images/preview_tmb.png",
        )

    def test_public_urls_and_metadata_are_stable(self) -> None:
        article_url, image_url = build_public_urls(
            "https://www.example.test/blog/",
            "article name",
            "articles/images/photo name.png",
        )
        self.assertEqual(
            article_url,
            "https://www.example.test/blog/article%20name.html",
        )
        self.assertEqual(
            image_url,
            "https://www.example.test/blog/images/photo%20name.png",
        )

        with tempfile.TemporaryDirectory() as temp_dir:
            html_path = Path(temp_dir) / "article.html"
            html_path.write_text(
                "<html><head><title>Article</title></head><body></body></html>",
                encoding="utf-8",
            )
            arguments = {
                "title": "Title & more",
                "description": 'A "description"',
                "article_url": article_url,
                "image_url": image_url,
            }
            inject_social_metadata(html_path, **arguments)
            inject_social_metadata(html_path, **arguments)
            document = html_path.read_text(encoding="utf-8")

        self.assertEqual(document.count('property="og:title"'), 1)
        self.assertIn("Title &amp; more", document)
        self.assertIn("&quot;description&quot;", document)
        self.assertIn(image_url, document)


class MastodonClientTests(unittest.TestCase):
    def test_create_post_returns_comment_parameters(self) -> None:
        opener = FakeOpener(
            [
                {
                    "id": "123456",
                    "url": "https://mastodon.social/@writer/123456",
                    "account": {"acct": "writer"},
                }
            ]
        )
        client = MastodonClient(
            "mastodon.social",
            "session-token",
            opener=opener,
        )

        result = client.create_post(
            "Article\n\nhttps://example.test/article.html",
            idempotency_key="stable-key",
        )

        self.assertEqual(result.post_id, "123456")
        self.assertEqual(result.account_handle, "writer")
        request = opener.requests[0][0]
        self.assertEqual(
            request.get_header("Authorization"),
            "Bearer session-token",
        )
        self.assertEqual(request.get_header("Idempotency-key"), "stable-key")
        payload = parse_qs(request.data.decode("utf-8"))
        self.assertEqual(payload["visibility"], ["public"])
        self.assertIn("https://example.test/article.html", payload["status"][0])


class BlueskyClientTests(unittest.TestCase):
    def test_create_post_uploads_card_thumbnail_and_link_facet(self) -> None:
        opener = FakeOpener(
            [
                {
                    "accessJwt": "access-token",
                    "did": "did:plc:abc123",
                    "handle": "writer.example",
                },
                {"records": []},
                {
                    "blob": {
                        "$type": "blob",
                        "ref": {"$link": "bafkreiblob"},
                        "mimeType": "image/png",
                        "size": 8,
                    }
                },
                {
                    "uri": (
                        "at://did:plc:abc123/app.bsky.feed.post/3example"
                    ),
                    "cid": "bafkrecord",
                },
            ]
        )
        client = BlueskyClient(
            "https://bsky.social",
            "writer.example",
            "app-password",
            opener=opener,
        )
        article_url = "https://example.test/article.html"
        text = f"Read this\n\n{article_url}"

        with tempfile.TemporaryDirectory() as temp_dir:
            thumbnail = Path(temp_dir) / "thumbnail.png"
            thumbnail.write_bytes(b"fake-png")
            result = client.create_post(
                text,
                article_url=article_url,
                title="Article title",
                description="Article description",
                thumbnail_path=thumbnail,
            )

        self.assertEqual(
            result.url,
            "https://bsky.app/profile/writer.example/post/3example",
        )
        session_payload = json.loads(
            opener.requests[0][0].data.decode("utf-8")
        )
        self.assertEqual(session_payload["password"], "app-password")

        listing_request = opener.requests[1][0]
        self.assertEqual(listing_request.get_method(), "GET")
        self.assertIn(
            "com.atproto.repo.listRecords",
            listing_request.full_url,
        )

        upload_request = opener.requests[2][0]
        self.assertEqual(
            upload_request.get_header("Authorization"),
            "Bearer access-token",
        )
        self.assertEqual(upload_request.data, b"fake-png")

        record_payload = json.loads(
            opener.requests[3][0].data.decode("utf-8")
        )
        record = record_payload["record"]
        self.assertEqual(
            record["embed"]["external"]["uri"],
            article_url,
        )
        self.assertEqual(
            record["embed"]["external"]["thumb"]["ref"]["$link"],
            "bafkreiblob",
        )
        facet = record["facets"][0]
        start = facet["index"]["byteStart"]
        end = facet["index"]["byteEnd"]
        self.assertEqual(text.encode("utf-8")[start:end].decode(), article_url)

    def test_existing_article_post_is_reused_without_creating_another(
        self,
    ) -> None:
        article_url = "https://example.test/article.html"
        existing_uri = (
            "at://did:plc:abc123/app.bsky.feed.post/3existing"
        )
        opener = FakeOpener(
            [
                {
                    "accessJwt": "access-token",
                    "did": "did:plc:abc123",
                    "handle": "writer.example",
                },
                {
                    "records": [
                        {
                            "uri": existing_uri,
                            "value": {
                                "embed": {
                                    "$type": "app.bsky.embed.external",
                                    "external": {"uri": article_url},
                                }
                            },
                        }
                    ]
                },
            ]
        )
        client = BlueskyClient(
            "https://bsky.social",
            "writer.example",
            "app-password",
            opener=opener,
        )

        result = client.create_post(
            f"Read this\n\n{article_url}",
            article_url=article_url,
            title="Article title",
            description="Article description",
        )

        self.assertEqual(result.uri, existing_uri)
        self.assertEqual(
            result.url,
            "https://bsky.app/profile/writer.example/post/3existing",
        )
        self.assertEqual(len(opener.requests), 2)


if __name__ == "__main__":
    unittest.main()
