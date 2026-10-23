import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch, Mock

from tools.build_offline_manifest import build_manifest, offline_uploads
from tools.ftp_publisher import FTPPublisher, FTPPublishingError


class OfflineManifestTests(unittest.TestCase):
    def site(self, root):
        site = root / 'default'
        (site / 'css').mkdir(parents=True)
        (site / 'images').mkdir()
        (site / 'offline.js').write_text('loader')
        (site / 'service-worker.js').write_text('worker')
        (site / 'css/site.css').write_text('original')
        return site

    def test_deterministic_versions_change_with_content_and_remove_deleted_files(self):
        with tempfile.TemporaryDirectory() as directory:
            site = self.site(Path(directory))
            manifest, marker = build_manifest(site)
            original = marker.read_bytes()
            self.assertEqual(hashlib.sha256(manifest.read_bytes()).hexdigest(), json.loads(original)['version'])
            build_manifest(site)
            self.assertEqual(marker.read_bytes(), original)
            (site / 'css/site.css').write_text('updated')
            build_manifest(site)
            self.assertNotEqual(marker.read_bytes(), original)
            (site / 'css/site.css').unlink()
            build_manifest(site)
            self.assertNotIn('css/site.css', json.loads(manifest.read_text())['files'])

    def test_partial_publish_versions_uploaded_bytes_without_announcing_other_edits(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); site = self.site(root)
            (site / 'images/photo.png').write_bytes(b'old image')
            build_manifest(site)
            old = json.loads((site / 'offline-manifest.json').read_text())
            (site / 'css/site.css').write_text('unpublished working copy')
            source = root / 'article-photo.png'; source.write_bytes(b'uploaded image')
            article = site / 'article.html'; article.write_text('article')
            with patch('tools.build_offline_manifest.ROOT', root):
                generated = offline_uploads(((article, '/public/article.html'),
                                            (source, '/public/images/photo.png')))
            current = json.loads((site / 'offline-manifest.json').read_text())
            self.assertEqual(current['files']['css/site.css'], old['files']['css/site.css'])
            self.assertEqual(current['files']['images/photo.png']['hash'], hashlib.sha256(b'uploaded image').hexdigest())
            self.assertEqual([remote for _, remote in generated],
                             ['/public/offline-manifest.json', '/public/offline-version.json'])
            self.assertFalse((root / 'classic/offline-version.json').exists())

    def test_ftp_metadata_is_generated_and_uploaded_after_verified_files(self):
        events = []
        publisher = FTPPublisher('ftp.example.test', 'test', 'test')
        publisher._connect = Mock(return_value=Mock())
        publisher._upload_one = lambda ftp, local, remote, **kw: events.append(remote)
        publisher._close = Mock()
        def generated(files):
            self.assertEqual(events, ['/public/article.html'])
            return ((Path('manifest'), '/public/offline-manifest.json'),
                    (Path('version'), '/public/offline-version.json'))
        with patch('tools.ftp_publisher.offline_uploads', side_effect=generated):
            publisher.upload(((Path('article'), '/public/article.html'),))
        self.assertEqual(events[-1], '/public/offline-version.json')

    def test_failed_upload_does_not_announce_a_release(self):
        publisher = FTPPublisher('ftp.example.test', 'test', 'test')
        publisher._connect = Mock(return_value=Mock())
        publisher._upload_one = Mock(side_effect=OSError('Upload failed'))
        with patch('tools.ftp_publisher.offline_uploads') as generated:
            with self.assertRaises(FTPPublishingError):
                publisher.upload(((Path('article'), '/public/article.html'),))
            generated.assert_not_called()
