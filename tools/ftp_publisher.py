"""Upload generated website files over plain, insecure FTP."""

from __future__ import annotations

import ftplib
import posixpath
import time
import uuid
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Callable, Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit, urlunsplit
from urllib.request import Request, urlopen


class FTPPublishingError(RuntimeError):
    """Raised when an FTP upload or public preview verification fails."""


ProgressCallback = Callable[[str], None]


@dataclass(frozen=True)
class FTPDirectoryListing:
    """A canonical remote directory and its immediate child directories."""

    current_path: str
    directories: tuple[str, ...]


def _parse_ftp_host(value: str) -> tuple[str, int]:
    value = value.strip()
    parsed = urlsplit(value if "://" in value else f"ftp://{value}")
    if parsed.scheme.lower() != "ftp" or not parsed.hostname:
        raise ValueError("Enter a valid FTP host, optionally followed by :port.")
    if parsed.path not in {"", "/"} or parsed.query or parsed.fragment:
        raise ValueError("Put the remote directory in Publishing Path, not FTP Host.")
    try:
        port = parsed.port or 21
    except ValueError as exc:
        raise ValueError("The FTP port is invalid.") from exc
    return parsed.hostname, port


def _safe_remote_path(path: str) -> str:
    normalized = path.replace("\\", "/").strip()
    if any(part == ".." for part in PurePosixPath(normalized).parts):
        raise ValueError("FTP publishing paths cannot contain '..'.")
    return normalized


def join_remote_path(publishing_path: str, relative_path: str) -> str:
    """Join an optional remote root with a repository-relative web path."""
    publishing_path = _safe_remote_path(publishing_path).rstrip("/")
    relative_path = _safe_remote_path(relative_path).lstrip("/")
    if not relative_path:
        raise ValueError("The FTP destination filename cannot be empty.")
    if not publishing_path:
        return relative_path
    return posixpath.join(publishing_path, relative_path)


class FTPPublisher:
    """Plain FTP uploader with best-effort atomic replacement."""

    def __init__(
        self,
        host: str,
        username: str,
        password: str,
        *,
        timeout: float = 30.0,
        ftp_factory: Callable[..., ftplib.FTP] = ftplib.FTP,
    ) -> None:
        self.host, self.port = _parse_ftp_host(host)
        self.username = username.strip()
        self.password = password
        self.timeout = timeout
        self._ftp_factory = ftp_factory
        if not self.username or not self.password:
            raise ValueError("FTP username and password are required.")

    def _connect(self) -> ftplib.FTP:
        ftp = self._ftp_factory()
        try:
            ftp.connect(self.host, self.port, timeout=self.timeout)
            ftp.set_pasv(True)
            ftp.login(self.username, self.password)
            return ftp
        except ftplib.all_errors as exc:
            try:
                ftp.close()
            except ftplib.all_errors:
                pass
            raise FTPPublishingError(
                f"Could not connect or log in to FTP: {exc}"
            ) from exc

    @staticmethod
    def _close(ftp: ftplib.FTP) -> None:
        try:
            ftp.quit()
        except ftplib.all_errors:
            ftp.close()

    @staticmethod
    def _list_directories_with_nlst(
        ftp: ftplib.FTP,
        current_path: str,
    ) -> tuple[str, ...]:
        original_path = ftp.pwd()
        names: list[str] = []
        try:
            ftp.cwd(current_path)
            canonical_path = ftp.pwd()
            for entry in ftp.nlst():
                name = posixpath.basename(entry.rstrip("/"))
                if name in {"", ".", ".."}:
                    continue
                try:
                    ftp.cwd(entry)
                except ftplib.error_perm:
                    continue
                else:
                    names.append(name)
                    ftp.cwd(canonical_path)
        finally:
            ftp.cwd(original_path)
        return tuple(sorted(set(names), key=str.casefold))

    def list_directories(self, path: str = "") -> FTPDirectoryListing:
        """List remote folders after validating the configured credentials."""
        requested_path = _safe_remote_path(path)
        ftp = self._connect()
        try:
            login_root = ftp.pwd()
            if not requested_path:
                requested_path = login_root
            elif not requested_path.startswith("/"):
                requested_path = posixpath.join(login_root, requested_path)

            ftp.cwd(requested_path)
            current_path = ftp.pwd()
            try:
                directories = tuple(
                    sorted(
                        {
                            name
                            for name, facts in ftp.mlsd(current_path)
                            if facts.get("type") == "dir"
                            and name not in {".", ".."}
                        },
                        key=str.casefold,
                    )
                )
            except (AttributeError, ftplib.error_perm):
                directories = self._list_directories_with_nlst(
                    ftp,
                    current_path,
                )
            return FTPDirectoryListing(
                current_path=current_path,
                directories=directories,
            )
        except ftplib.all_errors as exc:
            raise FTPPublishingError(
                f"Could not browse FTP directories: {exc}"
            ) from exc
        finally:
            self._close(ftp)

    @staticmethod
    def _ensure_remote_directory(ftp: ftplib.FTP, remote_file: str) -> None:
        directory = posixpath.dirname(remote_file)
        if not directory:
            return

        current = "/" if directory.startswith("/") else ""
        for part in PurePosixPath(directory).parts:
            if part in {"", "/"}:
                continue
            current = posixpath.join(current, part)
            try:
                ftp.mkd(current)
            except ftplib.error_perm:
                # Existing directories normally report a 550 response.
                pass

    @staticmethod
    def _delete_if_present(ftp: ftplib.FTP, remote_path: str) -> None:
        try:
            ftp.delete(remote_path)
        except ftplib.all_errors:
            pass

    @staticmethod
    def _verify_remote_file(
        ftp: ftplib.FTP,
        local_path: Path,
        remote_path: str,
    ) -> None:
        """Confirm that *remote_path* matches *local_path* in size, if possible."""
        expected_size = local_path.stat().st_size

        # Prefer SIZE because it is exact and avoids parsing directory listings.
        try:
            remote_size = ftp.size(remote_path)
            if remote_size != expected_size:
                raise FTPPublishingError(
                    f"{remote_path} size mismatch: uploaded {expected_size} bytes, "
                    f"remote reports {remote_size} bytes."
                )
            return
        except (ftplib.error_perm, ftplib.error_temp):
            # SIZE may be disabled on shared hosts; fall through.
            pass

        # MLSD can expose a size fact with the same semantics.
        try:
            directory = posixpath.dirname(remote_path) or "."
            filename = posixpath.basename(remote_path)
            for name, facts in ftp.mlsd(directory):
                if name == filename:
                    mlsd_size = facts.get("size")
                    if mlsd_size is not None and int(mlsd_size) != expected_size:
                        raise FTPPublishingError(
                            f"{remote_path} size mismatch from MLSD: "
                            f"expected {expected_size} bytes, got {mlsd_size} bytes."
                        )
                    return
        except ftplib.all_errors:
            pass

        # Last resort: confirm the exact basename exists in NLST.
        try:
            directory = posixpath.dirname(remote_path) or "."
            filename = posixpath.basename(remote_path)
            if filename not in {posixpath.basename(entry) for entry in ftp.nlst(directory)}:
                raise FTPPublishingError(
                    f"Remote verification failed: {remote_path} not found after upload."
                )
        except ftplib.all_errors as exc:
            raise FTPPublishingError(
                f"Remote verification unavailable for {remote_path}: {exc}. "
                "The file may have uploaded, but the server does not support "
                "SIZE, MLSD facts, or directory listings."
            ) from exc

    @staticmethod
    def _upload_one(
        ftp: ftplib.FTP,
        local_path: Path,
        remote_path: str,
        *,
        progress: ProgressCallback | None = None,
    ) -> None:
        if not local_path.is_file():
            raise FTPPublishingError(f"Upload source does not exist: {local_path}")

        FTPPublisher._ensure_remote_directory(ftp, remote_path)
        temporary_path = f"{remote_path}.publisher-{uuid.uuid4().hex}.tmp"

        FTPPublisher._delete_if_present(ftp, remote_path)
        FTPPublisher._delete_if_present(ftp, temporary_path)

        if progress:
            progress(f"Uploading {local_path.name} -> {remote_path}")
        with local_path.open("rb") as source:
            ftp.storbinary(f"STOR {temporary_path}", source)

        try:
            ftp.rename(temporary_path, remote_path)
        except ftplib.all_errors:
            FTPPublisher._delete_if_present(ftp, remote_path)
            with local_path.open("rb") as source:
                if progress:
                    progress(f"Falling back to direct STOR for {remote_path}")
                ftp.storbinary(f"STOR {remote_path}", source)
        finally:
            FTPPublisher._delete_if_present(ftp, temporary_path)

        if progress:
            progress(f"Verifying {remote_path}...")
        FTPPublisher._verify_remote_file(ftp, local_path, remote_path)
        if progress:
            progress(f"Verified {remote_path}")

    def upload(
        self,
        files: Iterable[tuple[Path, str]],
        *,
        progress: ProgressCallback | None = None,
    ) -> None:
        upload_files = tuple(files)
        if not upload_files:
            return

        ftp = self._connect()
        try:
            for index, (local_path, remote_path) in enumerate(upload_files, start=1):
                if progress:
                    progress(f"FTP upload {index}/{len(upload_files)}")
                self._upload_one(ftp, local_path, remote_path, progress=progress)
            self._close(ftp)
        except ftplib.all_errors as exc:
            try:
                ftp.close()
            except ftplib.all_errors:
                pass
            raise FTPPublishingError(f"FTP upload failed: {exc}") from exc


def _cache_busted_url(url: str) -> str:
    parsed = urlsplit(url)
    query = parsed.query
    suffix = f"publisher_preview={time.time_ns()}"
    query = f"{query}&{suffix}" if query else suffix
    return urlunsplit(
        (parsed.scheme, parsed.netloc, parsed.path, query, parsed.fragment)
    )


def verify_public_preview(
    article_url: str,
    *,
    expected_title: str,
    image_url: str | None = None,
    attempts: int = 5,
    delay_seconds: float = 2.0,
    opener: Callable[..., object] = urlopen,
) -> None:
    """Wait until the staged article and optional social image are public."""
    last_error = "preview was not available"
    for attempt in range(1, attempts + 1):
        try:
            request = Request(
                _cache_busted_url(article_url),
                headers={"User-Agent": "pytk-publisher-preview-check/1.0"},
            )
            response = opener(request, timeout=20)
            with response:
                body = response.read().decode("utf-8", errors="replace")
            if expected_title not in body:
                raise FTPPublishingError(
                    "The public page responded, but its title did not match."
                )
            if 'property="og:title"' not in body:
                raise FTPPublishingError(
                    "The public page is missing its Open Graph metadata."
                )

            if image_url:
                image_request = Request(
                    _cache_busted_url(image_url),
                    headers={"User-Agent": "pytk-publisher-preview-check/1.0"},
                )
                image_response = opener(image_request, timeout=20)
                with image_response:
                    image_response.read(1)
            return
        except (HTTPError, URLError, OSError, FTPPublishingError) as exc:
            last_error = str(exc)
            if attempt < attempts:
                time.sleep(delay_seconds)

    raise FTPPublishingError(
        f"Public preview verification failed after {attempts} attempts: {last_error}"
    )
