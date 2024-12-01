from enum import StrEnum


class MarkdownElementType(StrEnum):
    h1 = "heading1"
    h2 = "heading2"
    h3 = "heading3"
    h4 = "heading4"
    h5 = "heading5"
    h6 = "heading6"
    p = "paragraph"
    ul = "unordered_list"
    ol = "ordered_list"
    checkbox = "checkbox"
    image = "image"
    codeblock = "codeblock"
    link = "link"

element_type_mapping: dict[str, MarkdownElementType] = {
    '######': MarkdownElementType.h6,
    '#####': MarkdownElementType.h5,
    '####': MarkdownElementType.h4,
    '###': MarkdownElementType.h3,
    '##': MarkdownElementType.h2,
    '#': MarkdownElementType.h1,
    '- [ ]': MarkdownElementType.checkbox,
    '-': MarkdownElementType.ul,
    '1.': MarkdownElementType.ol,
    '![': MarkdownElementType.image,
    '```': MarkdownElementType.codeblock,
    '[': MarkdownElementType.link
}

multi_content_markdown_element_type: list[MarkdownElementType] = [
    MarkdownElementType.ul,
    MarkdownElementType.ol,
    MarkdownElementType.checkbox,
    MarkdownElementType.codeblock
]

heading_markdown_element_type: list[MarkdownElementType] = [
    MarkdownElementType.h1,
    MarkdownElementType.h2,
    MarkdownElementType.h3,
    MarkdownElementType.h4,
    MarkdownElementType.h5,
    MarkdownElementType.h6
]

heading_with_ids_upon_publishing: list[MarkdownElementType] = [
    MarkdownElementType.h1,
    MarkdownElementType.h2,
    MarkdownElementType.h3
]

heading_markdown_element_type_mapping: dict[MarkdownElementType, str] = {
    MarkdownElementType.h1: 'h1',
    MarkdownElementType.h2: 'h2',
    MarkdownElementType.h3: 'h3',
    MarkdownElementType.h4: 'h4',
    MarkdownElementType.h5: 'h5',
    MarkdownElementType.h6: 'h6'
}

publisher_heading_characters_ignore_for_heading_tag: list[str] = [' ', '(', ')', '?', '!', '.', ':', ',', '-']
