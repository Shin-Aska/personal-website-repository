import ftplib
import io
import posixpath
import tempfile
import unittest
from pathlib import Path

from tools.ftp_publisher import (
    FTPPublisher,
    FTPPublishingError,
    join_remote_path,
)


class FakeFTP:
    def __init__(self, *, enable_size: bool = True) -> None:
        self.connected = None
        self.credentials = None
        self.directories = []
        self.uploads = []
        self.renames = []
        self.deletes = []
        self.size_calls = []
        self.sizes = {}
        self.mlsd_entries = {}
        self.closed = False
        self.current_path = "/"
        self._enable_size = enable_size

    def connect(self, host: str, port: int, timeout: float) -> None:
        self.connected = (host, port, timeout)

    def login(self, username: str, password: str) -> None:
        self.credentials = (username, password)

    def set_pasv(self, pasv: bool) -> None:
        self.pasv = pasv

    def mkd(self, directory: str) -> None:
        self.directories.append(directory)

    def pwd(self) -> str:
        return self.current_path

    def cwd(self, directory: str) -> None:
        if directory.startswith("/"):
            self.current_path = posixpath.normpath(directory)
        else:
            self.current_path = posixpath.normpath(
                posixpath.join(self.current_path, directory)
            )

    def mlsd(self, directory: str):
        entries = self.mlsd_entries.get(directory, {})
        return iter(entries.items())

    def size(self, path: str) -> int:
        self.size_calls.append(path)
        if not self._enable_size:
            raise ftplib.error_perm("SIZE not allowed")
        if path not in self.sizes:
            raise ftplib.error_perm("File not found")
        return self.sizes[path]

    def nlst(self, directory: str = "."):
        entries = self.mlsd_entries.get(directory, {})
        return [
            posixpath.join(directory, name)
            for name, facts in entries.items()
            if facts.get("type") != "dir"
        ]

    def storbinary(self, command: str, source: io.BufferedReader) -> None:
        data = source.read()
        self.uploads.append((command, data))
        if command.startswith("STOR "):
            path = command[5:].strip()
            self.sizes[path] = len(data)

    def rename(self, source: str, destination: str) -> None:
        self.renames.append((source, destination))
        if source in self.sizes:
            self.sizes[destination] = self.sizes.pop(source)

    def delete(self, path: str) -> None:
        self.deletes.append(path)

    def quit(self) -> None:
        self.closed = True

    def close(self) -> None:
        self.closed = True


class FTPPublisherTests(unittest.TestCase):
    def test_optional_publishing_path_is_joined_safely(self) -> None:
        self.assertEqual(
            join_remote_path("", "article.html"),
            "article.html",
        )
        self.assertEqual(
            join_remote_path("/public_html", "images/photo.png"),
            "/public_html/images/photo.png",
        )
        with self.assertRaisesRegex(ValueError, "cannot contain"):
            join_remote_path("../private", "article.html")

    def test_upload_logs_in_and_atomically_renames_file(self) -> None:
        fake_ftp = FakeFTP()
        with tempfile.TemporaryDirectory() as temp_dir:
            source = Path(temp_dir) / "article.html"
            source.write_bytes(b"<html>article</html>")
            publisher = FTPPublisher(
                "ftp.example.test:2121",
                "writer",
                "plain-password",
                ftp_factory=lambda: fake_ftp,
            )
            publisher.upload(
                [(source, "/public_html/article.html")]
            )

        self.assertEqual(
            fake_ftp.connected,
            ("ftp.example.test", 2121, 30.0),
        )
        self.assertEqual(
            fake_ftp.credentials,
            ("writer", "plain-password"),
        )
        self.assertEqual(fake_ftp.uploads[0][1], b"<html>article</html>")
        self.assertEqual(fake_ftp.deletes[0], "/public_html/article.html")
        self.assertIn(".publisher-", fake_ftp.deletes[1])
        temporary_path, final_path = fake_ftp.renames[0]
        self.assertIn(".publisher-", temporary_path)
        self.assertEqual(final_path, "/public_html/article.html")
        self.assertTrue(fake_ftp.closed)
        self.assertEqual(
            fake_ftp.size_calls,
            ["/public_html/article.html"],
        )

    def test_upload_verifies_with_mlsd_when_size_is_unavailable(self) -> None:
        fake_ftp = FakeFTP(enable_size=False)
        fake_ftp.mlsd_entries = {
            "/public_html": {
                "article.html": {"type": "file", "size": "20"},
            }
        }
        with tempfile.TemporaryDirectory() as temp_dir:
            source = Path(temp_dir) / "article.html"
            source.write_bytes(b"<html>article</html>")
            publisher = FTPPublisher(
                "ftp.example.test",
                "writer",
                "plain-password",
                ftp_factory=lambda: fake_ftp,
            )
            publisher.upload(
                [(source, "/public_html/article.html")]
            )

        self.assertEqual(
            fake_ftp.size_calls,
            ["/public_html/article.html"],
        )
        self.assertTrue(fake_ftp.closed)

    def test_upload_falls_back_to_nlst_when_size_and_mlsd_unavailable(self) -> None:
        fake_ftp = FakeFTP(enable_size=False)
        fake_ftp.mlsd_entries = {
            "/public_html": {
                "article.html": {"type": "file"},
            }
        }
        with tempfile.TemporaryDirectory() as temp_dir:
            source = Path(temp_dir) / "article.html"
            source.write_bytes(b"<html>article</html>")
            publisher = FTPPublisher(
                "ftp.example.test",
                "writer",
                "plain-password",
                ftp_factory=lambda: fake_ftp,
            )
            publisher.upload(
                [(source, "/public_html/article.html")]
            )

        self.assertEqual(
            fake_ftp.size_calls,
            ["/public_html/article.html"],
        )
        self.assertTrue(fake_ftp.closed)

    def test_upload_raises_when_remote_file_missing_after_upload(self) -> None:
        fake_ftp = FakeFTP(enable_size=False)
        fake_ftp.mlsd_entries = {"/public_html": {}}
        with tempfile.TemporaryDirectory() as temp_dir:
            source = Path(temp_dir) / "article.html"
            source.write_bytes(b"<html>article</html>")
            publisher = FTPPublisher(
                "ftp.example.test",
                "writer",
                "plain-password",
                ftp_factory=lambda: fake_ftp,
            )
            with self.assertRaisesRegex(
                FTPPublishingError,
                "not found after upload",
            ):
                publisher.upload(
                    [(source, "/public_html/article.html")]
                )

        self.assertFalse(fake_ftp.closed)

    def test_upload_raises_when_remote_size_does_not_match(self) -> None:
        class FixedSizeFTP(FakeFTP):
            def storbinary(self, command: str, source: io.BufferedReader) -> None:
                self.uploads.append((command, source.read()))

            def rename(self, source: str, destination: str) -> None:
                self.renames.append((source, destination))

        fake_ftp = FixedSizeFTP()
        fake_ftp.sizes = {"/public_html/article.html": 5}
        with tempfile.TemporaryDirectory() as temp_dir:
            source = Path(temp_dir) / "article.html"
            source.write_bytes(b"<html>article</html>")
            publisher = FTPPublisher(
                "ftp.example.test",
                "writer",
                "plain-password",
                ftp_factory=lambda: fake_ftp,
            )
            with self.assertRaisesRegex(FTPPublishingError, "size mismatch"):
                publisher.upload(
                    [(source, "/public_html/article.html")]
                )

    def test_directory_listing_validates_login_and_hides_files(self) -> None:
        fake_ftp = FakeFTP()
        fake_ftp.mlsd_entries = {
            "/public_html": {
                "images": {"type": "dir"},
                "articles": {"type": "dir"},
                "index.html": {"type": "file"},
            }
        }
        publisher = FTPPublisher(
            "ftp.example.test",
            "writer",
            "plain-password",
            ftp_factory=lambda: fake_ftp,
        )

        listing = publisher.list_directories("public_html")

        self.assertEqual(listing.current_path, "/public_html")
        self.assertEqual(listing.directories, ("articles", "images"))
        self.assertEqual(
            fake_ftp.credentials,
            ("writer", "plain-password"),
        )
        self.assertTrue(fake_ftp.closed)
        self.assertTrue(getattr(fake_ftp, "pasv", False))

    def test_failed_login_closes_the_connection(self) -> None:
        class LoginFailureFTP(FakeFTP):
            def login(self, username: str, password: str) -> None:
                raise ftplib.error_perm("530 Login incorrect")

        fake_ftp = LoginFailureFTP()
        publisher = FTPPublisher(
            "ftp.example.test",
            "writer",
            "wrong-password",
            ftp_factory=lambda: fake_ftp,
        )

        with self.assertRaisesRegex(FTPPublishingError, "log in"):
            publisher.list_directories()

        self.assertTrue(fake_ftp.closed)


if __name__ == "__main__":
    unittest.main()
