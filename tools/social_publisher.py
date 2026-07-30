"""Mastodon and Bluesky publishing using only Python's standard library."""

from __future__ import annotations

import html
import json
import mimetypes
import re
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Callable
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode, urljoin, urlsplit
from urllib.request import Request, urlopen


SOCIAL_POST_LIMIT = 300


class SocialPublishingError(RuntimeError):
    """Raised when a social network rejects a publishing request."""


@dataclass(frozen=True)
class MastodonPostResult:
    post_id: str
    url: str
    account_handle: str


@dataclass(frozen=True)
class BlueskyPostResult:
    uri: str
    url: str


class _FirstParagraphParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_paragraph = False
        self.finished = False
        self.parts: list[str] = []

    def handle_starttag(
        self, tag: str, _attrs: list[tuple[str, str | None]]
    ) -> None:
        if tag.lower() == "p" and not self.finished:
            self.in_paragraph = True

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "p" and self.in_paragraph:
            self.in_paragraph = False
            self.finished = True

    def handle_data(self, data: str) -> None:
        if self.in_paragraph and not self.finished:
            self.parts.append(data)


def extract_article_description(content: str, maximum_length: int = 240) -> str:
    parser = _FirstParagraphParser()
    parser.feed(content)
    description = re.sub(r"\s+", " ", "".join(parser.parts)).strip()
    if len(description) <= maximum_length:
        return description
    return description[: maximum_length - 1].rstrip() + "…"


def select_social_image(image_paths: tuple[str, ...]) -> str | None:
    """Prefer an existing lightweight ``_tmb`` social-card thumbnail."""
    unique_paths = tuple(dict.fromkeys(image_paths))
    for image_path in unique_paths:
        if Path(image_path).stem.lower().endswith("_tmb"):
            return image_path
    return unique_paths[0] if unique_paths else None


def build_public_urls(
    public_base_url: str,
    slug: str,
    social_image: str | None,
) -> tuple[str, str | None]:
    base_url = public_base_url.strip().rstrip("/") + "/"
    parsed = urlsplit(base_url)
    if parsed.scheme != "https" or not parsed.hostname:
        raise ValueError("The public article base URL must use HTTPS.")
    if parsed.query or parsed.fragment:
        raise ValueError("The public article base URL cannot contain ? or #.")

    article_url = urljoin(base_url, f"{quote(slug)}.html")
    image_url = None
    if social_image:
        article_relative = social_image.removeprefix("articles/").replace("\\", "/")
        image_url = urljoin(
            base_url,
            "/".join(quote(part) for part in article_relative.split("/")),
        )
    return article_url, image_url


def build_social_post(message: str, article_url: str) -> str:
    message = message.strip()
    post = f"{message}\n\n{article_url}" if message else article_url
    if len(post) > SOCIAL_POST_LIMIT:
        raise ValueError(
            f"Social post is {len(post)} characters; the limit is "
            f"{SOCIAL_POST_LIMIT} including the article URL."
        )
    return post


_SOCIAL_META_PATTERN = re.compile(
    r"\s*<!-- publisher-social-meta:start -->.*?"
    r"<!-- publisher-social-meta:end -->\s*",
    re.DOTALL,
)


def inject_social_metadata(
    html_path: Path,
    *,
    title: str,
    description: str,
    article_url: str,
    image_url: str | None,
) -> None:
    """Add stable Open Graph metadata to a generated article document."""
    document = html_path.read_text(encoding="utf-8")
    document = _SOCIAL_META_PATTERN.sub("\n", document)

    escaped_title = html.escape(title, quote=True)
    escaped_description = html.escape(description, quote=True)
    escaped_article_url = html.escape(article_url, quote=True)
    lines = [
        "\t\t<!-- publisher-social-meta:start -->",
        '\t\t<meta property="og:type" content="article">',
        f'\t\t<meta property="og:title" content="{escaped_title}">',
        (
            '\t\t<meta property="og:description" '
            f'content="{escaped_description}">'
        ),
        f'\t\t<meta property="og:url" content="{escaped_article_url}">',
        f'\t\t<link rel="canonical" href="{escaped_article_url}">',
    ]
    if image_url:
        escaped_image_url = html.escape(image_url, quote=True)
        lines.append(
            f'\t\t<meta property="og:image" content="{escaped_image_url}">'
        )
    lines.append("\t\t<!-- publisher-social-meta:end -->")
    metadata = "\n".join(lines)

    head_end_matches = list(re.finditer(r"</head\s*>", document, flags=re.IGNORECASE))
    if not head_end_matches:
        raise ValueError(f"Generated article has no </head> element: {html_path}")
    head_end = head_end_matches[-1]
    document = (
        document[: head_end.start()]
        + metadata
        + "\n"
        + document[head_end.start() :]
    )
    html_path.write_text(document, encoding="utf-8")


class _JSONClient:
    def __init__(
        self,
        *,
        timeout: float = 30.0,
        opener: Callable[..., object] = urlopen,
    ) -> None:
        self.timeout = timeout
        self._opener = opener

    def request_json(
        self,
        url: str,
        *,
        data: bytes | None = None,
        headers: dict[str, str] | None = None,
    ) -> dict[str, object]:
        request = Request(
            url,
            data=data,
            headers=headers or {},
            method="POST" if data is not None else "GET",
        )
        try:
            response = self._opener(request, timeout=self.timeout)
            with response:
                raw_response = response.read()
        except HTTPError as exc:
            detail = ""
            try:
                payload = json.loads(exc.read().decode("utf-8"))
                detail = str(payload.get("message") or payload.get("error") or "")
            except (UnicodeDecodeError, json.JSONDecodeError, AttributeError):
                pass
            message = f"Social API returned HTTP {exc.code}"
            if detail:
                message += f": {detail}"
            raise SocialPublishingError(message) from exc
        except URLError as exc:
            raise SocialPublishingError(
                f"Could not connect to social API: {exc.reason}"
            ) from exc
        except OSError as exc:
            raise SocialPublishingError(
                f"Could not connect to social API: {exc}"
            ) from exc

        try:
            payload = json.loads(raw_response.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise SocialPublishingError(
                "Social API returned an invalid JSON response."
            ) from exc
        if not isinstance(payload, dict):
            raise SocialPublishingError(
                "Social API returned an unexpected response."
            )
        return payload


class MastodonClient(_JSONClient):
    def __init__(
        self,
        instance: str,
        access_token: str,
        **kwargs: object,
    ) -> None:
        super().__init__(**kwargs)
        instance = instance.strip()
        if "://" not in instance:
            instance = f"https://{instance}"
        parsed = urlsplit(instance)
        if parsed.scheme != "https" or not parsed.hostname:
            raise ValueError("The Mastodon instance must use HTTPS.")
        self.instance = parsed.hostname
        self.api_url = f"https://{parsed.hostname}/api/v1/statuses"
        self.access_token = access_token.strip()
        if not self.access_token:
            raise ValueError("A Mastodon access token is required.")

    def create_post(
        self,
        text: str,
        *,
        idempotency_key: str | None = None,
    ) -> MastodonPostResult:
        if len(text) > SOCIAL_POST_LIMIT:
            raise ValueError(f"Mastodon post exceeds {SOCIAL_POST_LIMIT} characters.")
        payload = self.request_json(
            self.api_url,
            data=urlencode(
                {
                    "status": text,
                    "visibility": "public",
                    "language": "en",
                }
            ).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/x-www-form-urlencoded",
                "Idempotency-Key": idempotency_key or str(uuid.uuid4()),
                "User-Agent": "pytk-publisher-tool/1.0",
            },
        )
        post_id = payload.get("id")
        if not isinstance(post_id, str) or not post_id:
            raise SocialPublishingError(
                "Mastodon created a post but returned no status ID."
            )
        account = payload.get("account")
        account_handle = ""
        if isinstance(account, dict):
            account_handle = str(account.get("acct", ""))
        return MastodonPostResult(
            post_id=post_id,
            url=str(payload.get("url", "")),
            account_handle=account_handle,
        )


class BlueskyClient(_JSONClient):
    def __init__(
        self,
        service_url: str,
        identifier: str,
        application_password: str,
        **kwargs: object,
    ) -> None:
        super().__init__(**kwargs)
        service_url = service_url.strip().rstrip("/")
        parsed = urlsplit(service_url)
        if parsed.scheme != "https" or not parsed.hostname:
            raise ValueError("The Bluesky service URL must use HTTPS.")
        self.service_url = service_url
        self.identifier = identifier.strip()
        self.application_password = application_password.strip()
        if not self.identifier or not self.application_password:
            raise ValueError(
                "Bluesky handle and Application Password are required."
            )

    def _xrpc_url(self, method: str) -> str:
        return f"{self.service_url}/xrpc/{method}"

    def create_session(self) -> dict[str, object]:
        session = self.request_json(
            self._xrpc_url("com.atproto.server.createSession"),
            data=json.dumps(
                {
                    "identifier": self.identifier,
                    "password": self.application_password,
                }
            ).encode("utf-8"),
            headers={
                "Content-Type": "application/json; charset=utf-8",
                "User-Agent": "pytk-publisher-tool/1.0",
            },
        )
        if not isinstance(session.get("accessJwt"), str) or not isinstance(
            session.get("did"), str
        ):
            raise SocialPublishingError(
                "Bluesky login succeeded but returned an invalid session."
            )
        return session

    def upload_blob(
        self,
        access_token: str,
        image_path: Path,
    ) -> dict[str, object]:
        if not image_path.is_file():
            raise SocialPublishingError(
                f"Bluesky thumbnail does not exist: {image_path}"
            )
        content_type = mimetypes.guess_type(image_path.name)[0] or "image/jpeg"
        payload = self.request_json(
            self._xrpc_url("com.atproto.repo.uploadBlob"),
            data=image_path.read_bytes(),
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": content_type,
                "Content-Length": str(image_path.stat().st_size),
                "User-Agent": "pytk-publisher-tool/1.0",
            },
        )
        blob = payload.get("blob")
        if not isinstance(blob, dict):
            raise SocialPublishingError(
                "Bluesky uploaded the thumbnail but returned no blob."
            )
        return blob

    @staticmethod
    def _post_result(uri: str, handle: str) -> BlueskyPostResult:
        rkey = uri.rsplit("/", 1)[-1]
        post_url = (
            f"https://bsky.app/profile/{quote(handle)}/post/{quote(rkey)}"
        )
        return BlueskyPostResult(uri=uri, url=post_url)

    def find_recent_post(
        self,
        *,
        access_token: str,
        did: str,
        handle: str,
        article_url: str,
    ) -> BlueskyPostResult | None:
        """Find a recent post whose external card targets this article."""
        query = urlencode(
            {
                "repo": did,
                "collection": "app.bsky.feed.post",
                "limit": 100,
                "reverse": "true",
            }
        )
        payload = self.request_json(
            self._xrpc_url(f"com.atproto.repo.listRecords?{query}"),
            headers={
                "Authorization": f"Bearer {access_token}",
                "User-Agent": "pytk-publisher-tool/1.0",
            },
        )
        records = payload.get("records")
        if not isinstance(records, list):
            raise SocialPublishingError(
                "Bluesky returned an invalid post listing."
            )

        for item in records:
            if not isinstance(item, dict):
                continue
            uri = item.get("uri")
            value = item.get("value")
            if not isinstance(uri, str) or not isinstance(value, dict):
                continue
            embed = value.get("embed")
            if not isinstance(embed, dict):
                continue
            external = embed.get("external")
            if (
                isinstance(external, dict)
                and external.get("uri") == article_url
            ):
                return self._post_result(uri, handle)
        return None

    def create_post(
        self,
        text: str,
        *,
        article_url: str,
        title: str,
        description: str,
        thumbnail_path: Path | None = None,
    ) -> BlueskyPostResult:
        if len(text) > SOCIAL_POST_LIMIT:
            raise ValueError(f"Bluesky post exceeds {SOCIAL_POST_LIMIT} characters.")

        session = self.create_session()
        access_token = str(session["accessJwt"])
        did = str(session["did"])
        handle = str(session.get("handle") or self.identifier)

        existing_post = self.find_recent_post(
            access_token=access_token,
            did=did,
            handle=handle,
            article_url=article_url,
        )
        if existing_post is not None:
            return existing_post

        external: dict[str, object] = {
            "uri": article_url,
            "title": title,
            "description": description,
        }
        if thumbnail_path is not None:
            external["thumb"] = self.upload_blob(access_token, thumbnail_path)

        record: dict[str, object] = {
            "$type": "app.bsky.feed.post",
            "text": text,
            "createdAt": datetime.now(timezone.utc).isoformat().replace(
                "+00:00", "Z"
            ),
            "embed": {
                "$type": "app.bsky.embed.external",
                "external": external,
            },
        }
        url_start = text.find(article_url)
        if url_start >= 0:
            byte_start = len(text[:url_start].encode("utf-8"))
            byte_end = byte_start + len(article_url.encode("utf-8"))
            record["facets"] = [
                {
                    "index": {
                        "byteStart": byte_start,
                        "byteEnd": byte_end,
                    },
                    "features": [
                        {
                            "$type": "app.bsky.richtext.facet#link",
                            "uri": article_url,
                        }
                    ],
                }
            ]

        payload = self.request_json(
            self._xrpc_url("com.atproto.repo.createRecord"),
            data=json.dumps(
                {
                    "repo": did,
                    "collection": "app.bsky.feed.post",
                    "record": record,
                }
            ).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json; charset=utf-8",
                "User-Agent": "pytk-publisher-tool/1.0",
            },
        )
        uri = payload.get("uri")
        if not isinstance(uri, str) or not uri:
            raise SocialPublishingError(
                "Bluesky created a post but returned no post URI."
            )
        return self._post_result(uri, handle)
