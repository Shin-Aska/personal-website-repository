from parsers.markdown.constants import MarkdownElementType, multi_content_markdown_element_type


class HeadingContent:
    heading_id: str = None
    heading_value: str = None

    def __init__(self, heading_id: str, heading_value: str):
        self.heading_id = heading_id
        self.heading_value = heading_value


class MarkdownElement:
    element_type: MarkdownElementType = None
    content: str | list[str] = None
    extra: dict = None

    def __init__(self, element_type: MarkdownElementType, content: str | list[str]):
        self.element_type = element_type
        self.content = content
        self.extra: dict = {}

    def is_multi_content(self) -> bool:
        return self.element_type in multi_content_markdown_element_type
