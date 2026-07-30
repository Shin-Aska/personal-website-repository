"""Publish rendered articles to WordPress using only Python's standard library."""

from __future__ import annotations

import base64
import json
import mimetypes
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Callable
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode, urlsplit
from urllib.request import Request, urlopen


class WordPressPublishingError(RuntimeError):
    """Raised when WordPress rejects a request or cannot be reached."""


@dataclass(frozen=True)
class WordPressPostResult:
    """The useful fields returned after creating or updating a post."""

    post_id: int
    link: str
    status: str
    created: bool


ProgressCallback = Callable[[str], None]


def _is_safe_site_url(site_url: str) -> bool:
    parsed = urlsplit(site_url)
    return (
        bool(parsed.hostname)
        and not parsed.query
        and not parsed.fragment
        and (
            parsed.scheme == "https"
            or (
                parsed.scheme == "http"
                and parsed.hostname in {"localhost", "127.0.0.1", "::1"}
            )
        )
    )


def _media_slug(filename: str) -> str:
    """Approximate WordPress's filename slug for an exact lookup."""
    stem = Path(filename).stem.lower()
    return re.sub(r"[^a-z0-9]+", "-", stem).strip("-")


class WordPressClient:
    """Small WordPress REST client using Application Password authentication."""

    def __init__(
        self,
        site_url: str,
        username: str,
        application_password: str,
        *,
        timeout: float = 30.0,
        opener: Callable[..., object] = urlopen,
    ) -> None:
        site_url = site_url.strip().rstrip("/")
        username = username.strip()
        application_password = application_password.strip()

        if not site_url or not username or not application_password:
            raise ValueError(
                "WordPress site URL, username, and Application Password are required."
            )
        if not _is_safe_site_url(site_url):
            raise ValueError(
                "WordPress must use HTTPS (plain HTTP is allowed only for localhost)."
            )

        self.api_root = f"{site_url}/wp-json/wp/v2"
        credentials = f"{username}:{application_password}".encode("utf-8")
        self.authorization = (
            "Basic " + base64.b64encode(credentials).decode("ascii")
        )
        self.timeout = timeout
        self._opener = opener

    def _request(
        self,
        path: str,
        *,
        data: bytes | None = None,
        content_type: str | None = None,
        extra_headers: dict[str, str] | None = None,
    ) -> object:
        headers = {
            "Accept": "application/json",
            "Authorization": self.authorization,
            "User-Agent": "pytk-publisher-tool/1.0",
        }
        if content_type:
            headers["Content-Type"] = content_type
        if extra_headers:
            headers.update(extra_headers)

        request = Request(
            f"{self.api_root}/{path.lstrip('/')}",
            data=data,
            headers=headers,
            method="POST" if data is not None else "GET",
        )

        try:
            response = self._opener(request, timeout=self.timeout)
            with response:
                raw_response = response.read()
        except HTTPError as exc:
            detail = ""
            try:
                error_payload = json.loads(exc.read().decode("utf-8"))
                detail = str(
                    error_payload.get("message") or error_payload.get("code") or ""
                )
            except (UnicodeDecodeError, json.JSONDecodeError, AttributeError):
                detail = ""
            message = f"WordPress returned HTTP {exc.code}"
            if detail:
                message += f": {detail}"
            raise WordPressPublishingError(message) from exc
        except URLError as exc:
            raise WordPressPublishingError(
                f"Could not connect to WordPress: {exc.reason}"
            ) from exc
        except OSError as exc:
            raise WordPressPublishingError(
                f"Could not connect to WordPress: {exc}"
            ) from exc

        try:
            return json.loads(raw_response.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise WordPressPublishingError(
                "WordPress returned an invalid JSON response."
            ) from exc

    def _json_request(self, path: str, payload: dict[str, object]) -> object:
        return self._request(
            path,
            data=json.dumps(payload).encode("utf-8"),
            content_type="application/json; charset=utf-8",
        )

    def find_post(self, slug: str) -> dict[str, object] | None:
        query = urlencode(
            {
                "slug": slug,
                "context": "edit",
                "status": "any",
                "per_page": 1,
            }
        )
        response = self._request(f"posts?{query}")
        if not isinstance(response, list):
            raise WordPressPublishingError(
                "WordPress returned an unexpected post lookup response."
            )
        if not response:
            return None
        post = response[0]
        if not isinstance(post, dict):
            raise WordPressPublishingError(
                "WordPress returned an unexpected post lookup response."
            )
        return post

    def find_media(self, filename: str) -> dict[str, object] | None:
        slug = _media_slug(filename)
        if not slug:
            return None
        query = urlencode(
            {
                "slug": slug,
                "context": "edit",
                "per_page": 1,
            }
        )
        response = self._request(f"media?{query}")
        if not isinstance(response, list):
            raise WordPressPublishingError(
                "WordPress returned an unexpected media lookup response."
            )
        if not response:
            return None
        media = response[0]
        if not isinstance(media, dict):
            raise WordPressPublishingError(
                "WordPress returned an unexpected media lookup response."
            )
        return media

    def upload_media(self, image_path: Path) -> dict[str, object]:
        if not image_path.is_file():
            raise WordPressPublishingError(f"Article image not found: {image_path}")

        content_type = mimetypes.guess_type(image_path.name)[0]
        if not content_type:
            content_type = "application/octet-stream"

        response = self._request(
            "media",
            data=image_path.read_bytes(),
            content_type=content_type,
            extra_headers={
                "Content-Disposition": (
                    f'attachment; filename="{quote(image_path.name)}"'
                )
            },
        )
        if not isinstance(response, dict) or not response.get("source_url"):
            raise WordPressPublishingError(
                "WordPress uploaded media but did not return its URL."
            )
        return response

    def ensure_media(self, image_path: Path) -> dict[str, object]:
        existing = self.find_media(image_path.name)
        if existing and existing.get("source_url"):
            return existing
        return self.upload_media(image_path)

    def publish_article(
        self,
        *,
        title: str,
        content: str,
        slug: str,
        status: str = "draft",
        image_paths: tuple[str, ...] = (),
        repository_root: Path | None = None,
        progress: ProgressCallback | None = None,
    ) -> WordPressPostResult:
        if status not in {"draft", "publish"}:
            raise ValueError("WordPress post status must be 'draft' or 'publish'.")
        if not title.strip():
            raise ValueError("The article must have an H1 title.")
        if not slug.strip():
            raise ValueError("The WordPress post slug cannot be empty.")

        rewritten_content = content
        unique_image_paths = tuple(dict.fromkeys(image_paths))
        if unique_image_paths and repository_root is None:
            raise ValueError("repository_root is required when uploading images.")

        resolved_repository_root = (
            repository_root.resolve() if repository_root is not None else None
        )
        for index, relative_path in enumerate(unique_image_paths, start=1):
            if progress:
                progress(
                    f"Uploading WordPress image {index}/{len(unique_image_paths)}..."
                )
            if resolved_repository_root is None:
                raise ValueError(
                    "repository_root is required when uploading images."
                )
            local_path = (resolved_repository_root / relative_path).resolve()
            try:
                local_path.relative_to(resolved_repository_root)
            except ValueError as exc:
                raise WordPressPublishingError(
                    f"Article image is outside the repository: {relative_path}"
                ) from exc
            media = self.ensure_media(local_path)
            source_url = str(media["source_url"])
            article_relative_path = relative_path.removeprefix("articles/")
            rewritten_content = rewritten_content.replace(
                f'"{article_relative_path}"',
                f'"{source_url}"',
            )

        if progress:
            progress("Creating or updating WordPress post...")

        existing_post = self.find_post(slug)
        payload: dict[str, object] = {
            "title": title,
            "content": rewritten_content,
            "slug": slug,
            "status": status,
        }
        created = existing_post is None
        path = "posts"
        if existing_post is not None:
            post_id = existing_post.get("id")
            if not isinstance(post_id, int):
                raise WordPressPublishingError(
                    "WordPress returned a post without a valid ID."
                )
            path = f"posts/{post_id}"

        response = self._json_request(path, payload)
        if not isinstance(response, dict) or not isinstance(response.get("id"), int):
            raise WordPressPublishingError(
                "WordPress saved the post but returned an unexpected response."
            )

        return WordPressPostResult(
            post_id=response["id"],
            link=str(response.get("link", "")),
            status=str(response.get("status", status)),
            created=created,
        )
