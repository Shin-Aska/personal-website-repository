from typing import TextIO, Callable, Optional

from factories.constants import publisher_to_template_mapping
from publishers.base import Publisher


class PublisherFactory:
    lookup: dict[str, Callable] = publisher_to_template_mapping

    @staticmethod
    def get_publisher(
        filename: str,
        t_file: TextIO,
        m_file: TextIO,
        file_id: str,
        mastodon_post_id: Optional[str] = None,
        mastodon_instance: Optional[str] = None,
        mastodon_user_handle: Optional[str] = None,
        bluesky_post_url: Optional[str] = None,
    ) -> Publisher:
        return PublisherFactory.lookup[filename](
            t_file,
            m_file,
            file_id,
            mastodon_post_id=mastodon_post_id,
            mastodon_instance=mastodon_instance,
            mastodon_user_handle=mastodon_user_handle,
            bluesky_post_url=bluesky_post_url,
        )
