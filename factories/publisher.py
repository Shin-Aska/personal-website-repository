from typing import TextIO, Callable

from factories.constants import publisher_to_template_mapping
from publishers.base import Publisher


class PublisherFactory:
    lookup: dict[str, Callable] = publisher_to_template_mapping

    @staticmethod
    def get_publisher(filename: str, t_file: TextIO, m_file: TextIO, file_id: str) -> Publisher:
        return PublisherFactory.lookup[filename](t_file, m_file, file_id)
