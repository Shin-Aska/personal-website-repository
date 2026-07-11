from parsers.markdown.parser import MarkdownParser
from parsers.markdown.constants import MarkdownElementType
from publishers.base import Publisher


class StubPublisher(Publisher):
    def __init__(self) -> None:
        pass


def test_blockquote_parsing():
    markdown_lines = [
        '> "They\'re illegal and they are not in any way affiliated with Microsoft."'
    ]
    elements = MarkdownParser.parse(markdown_lines)
    assert len(elements) == 1
    assert elements[0].element_type == MarkdownElementType.blockquote
    assert elements[0].content == '"They\'re illegal and they are not in any way affiliated with Microsoft."'


def test_blockquote_without_space_parsing():
    markdown_lines = [
        '>"They\'re illegal and they are not in any way affiliated with Microsoft."'
    ]
    elements = MarkdownParser.parse(markdown_lines)
    assert len(elements) == 1
    assert elements[0].element_type == MarkdownElementType.blockquote
    assert elements[0].content == '"They\'re illegal and they are not in any way affiliated with Microsoft."'


def test_blockquote_rendering():
    publisher = StubPublisher()
    from parsers.markdown.models import MarkdownElement
    
    element = MarkdownElement(
        MarkdownElementType.blockquote,
        '"They\'re **bold** and [link](https://test.com)"'
    )
    
    rendered = publisher._push_to_html_content(
        '',
        f'<blockquote><p>{element.content}</p></blockquote>',
        convert_formatting_markers_to_html=True,
        convert_link_markers_to_html=True
    )
    assert '<blockquote><p>"They\'re <b>bold</b> and <a href="https://test.com">link</a>"</p></blockquote>' in rendered
