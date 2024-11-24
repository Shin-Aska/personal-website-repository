from abc import ABC
from typing import TextIO

from parsers.markdown.constants import heading_markdown_element_type, MarkdownElementType, \
    publisher_heading_characters_ignore_for_heading_tag, heading_markdown_element_type_mapping
from parsers.markdown.models import MarkdownElement, HeadingContent
from parsers.markdown.parser import MarkdownParser


class Publisher(ABC):

    template: TextIO = None
    markdown: TextIO = None
    article: list[MarkdownElement] = None
    images: list[str] = None
    base_padding: int = 3

    def __init__(self, template: TextIO, article: TextIO, file_id: str):
        self.template = template
        self.markdown = article
        self.file_id = file_id
        self.article = MarkdownParser.parse(self._fetch_content(self.markdown))
        self.images = []

    def _generate_content(self) -> str:
        # Read each line of the markdown file
        html_content: str = ''
        table_of_contents: str = ''
        elements: list[MarkdownElement] = self.article
        table_contents: list[HeadingContent] = []

        for element in elements:
            if element.element_type in heading_markdown_element_type:
                html_content = self._generate_heading_content(html_content, element.content, element, table_contents)
            elif element.element_type == MarkdownElementType.p:
                html_content = self._push_to_html_content(html_content, f'<p>{element.content}</p>')
            elif element.element_type == MarkdownElementType.ul:
                print([element.element_type, element.content])
            elif element.element_type == MarkdownElementType.ol:
                print([element.element_type, element.content])
            elif element.element_type == MarkdownElementType.checkbox:
                html_content = self._generate_checkbox_content(html_content, element.content, element)

            elif element.element_type == MarkdownElementType.image:
                print([element.element_type, element.content])
            elif element.element_type == MarkdownElementType.codeblock:
                html_content = self._generate_codeblock_content(html_content, element.content, element)

        html_content = self._generate_bottom_options(html_content)

        table_of_contents = self._push_to_html_content(table_of_contents,
                                                       '<h2 id="tableContents">Table of Contents</h2>')
        table_of_contents = self._push_to_html_content(table_of_contents, '<ul>')
        for content in table_contents:
            if content.heading_id != 'headingBlog':
                table_of_contents = self._push_to_html_content(table_of_contents,
                                                               f'<li><a href="#{content.heading_id}">{content.heading_value}</a></li>',
                                                               1)
        table_of_contents = self._push_to_html_content(table_of_contents, '</ul>')

        return table_of_contents + '\n' + ('\t' * Publisher.base_padding) + html_content

    def _generate_meta_title(self) -> str:
        title: str = ''
        elements: list[MarkdownElement] = self.article

        for element in elements:
            if element.element_type == MarkdownElementType.h1:
                title = element.content
                break

        return title

    @staticmethod
    def _push_to_html_content(content: str, value: str, tab_padding: int = 0, add_new_line_per_join: bool = True) -> str:
        if content == '':
            return f"{'\t' * tab_padding}{value}"
        return f"{content}{"\n" if add_new_line_per_join else ''}{'\t' * (Publisher.base_padding + tab_padding)}{value}"

    @staticmethod
    def _fetch_content(textio: TextIO) -> list[str]:
        return [line for line in textio]


    def _fill_template(self, content, meta_title) -> str:
        # Get all string from the template
        template = self.template.read()
        # Replace the content placeholder with the content
        template = template.replace('{{Content}}', content)
        # Replace the meta title placeholder with the meta title
        template = template.replace('{{Title}}', meta_title)
        # Return the filled template
        return template

    def publish(self, filepath: str):
        # Generate Content base from the markdown
        content = self._generate_content()
        # Generate Meta Title base on the Header
        meta_title = self._generate_meta_title()
        # Fill the template with the content and meta title
        output = self._fill_template(content, meta_title)
        # Write the HTML string to the output file
        with open(filepath, 'w') as file:
            file.write(output)

    def _generate_heading_content(self, html_content: str, line: str, element: MarkdownElement, table_contents: list[HeadingContent]) -> str:
        heading_id: str = 'headingBlog'
        if element.element_type != MarkdownElementType.h1:
            heading_id = ''.join([' ' + i.lower() if i.isupper() else i for i in element.content]).lstrip()
            heading_id = heading_id.replace(' ', '_')
            for char in publisher_heading_characters_ignore_for_heading_tag:
                heading_id = heading_id.replace(char, '')
            # Remove double or more underscores
            new_heading_id = ''
            for idx, char in enumerate(heading_id):
                if char == '_' and (idx + 1) < len(heading_id) and heading_id[idx + 1] == '_':
                    continue
                new_heading_id += char
            heading_id = new_heading_id

        table_contents.append(HeadingContent(heading_id, element.content))
        heading_tag = heading_markdown_element_type_mapping[element.element_type]
        html_content = self._push_to_html_content(html_content, f'<{heading_tag} id="{heading_id}">{element.content}</{heading_tag}>')
        return html_content

    def _generate_checkbox_content(self, html_content: str, line: str, element: MarkdownElement) -> str:
        is_image_with_figure: bool = False
        if len(element.content) == 2:
            markdown_elements: list[MarkdownElement] = MarkdownParser.parse(element.content)
            link_content: list[MarkdownElement] = MarkdownParser.parse([markdown_elements[0].content])
            if (markdown_elements[0].element_type == MarkdownElementType.link and
                markdown_elements[1].element_type == MarkdownElementType.p and
                link_content[0].element_type == MarkdownElementType.image):
                is_image_with_figure = True

            if is_image_with_figure:
                html_content = self._push_to_html_content(html_content, '<figure>')
                html_content = self._push_to_html_content(html_content, f'<a href="{markdown_elements[0].extra["link"]}" target="_blank"><img class="preview center" src="{link_content[0].content}"></a>', 1)
                html_content = self._push_to_html_content(html_content, f'<figcaption>{markdown_elements[1].content}</figcaption>', 1)
                html_content = self._push_to_html_content(html_content, '</figure>')
                self.images.append('articles/' + link_content[0].content)

        return html_content

    def _generate_codeblock_content(self, html_content: str, line: str, element: MarkdownElement) -> str:
        html_content = self._push_to_html_content(html_content, '<pre>')
        html_content = self._push_to_html_content(html_content, f'<code language="{element.extra["language"]}">', 1)
        for line in element.content:
            html_content = self._push_to_html_content(html_content, line, Publisher.base_padding * -1, add_new_line_per_join=False)
        html_content = self._push_to_html_content(html_content, '</code>', 1)
        html_content = self._push_to_html_content(html_content, '</pre>')
        return html_content

    def _generate_bottom_options(self, html_content: str) -> str:
        html_content = self._push_to_html_content(html_content, '<h3>~ End ~</h3>')
        html_content = self._push_to_html_content(html_content, '<h4>')
        html_content = self._push_to_html_content(html_content, 'There are', 1)
        html_content = self._push_to_html_content(html_content, '<?php', 1)
        html_content = self._push_to_html_content(html_content, 'include "site_counter.php";', 2)
        html_content = self._push_to_html_content(html_content, f'echo get_page_count("{self.file_id}");', 2)
        html_content = self._push_to_html_content(html_content, '?>', 1)
        html_content = self._push_to_html_content(html_content, 'viewers that have read this page.', 1)
        html_content = self._push_to_html_content(html_content, '</h4>')
        html_content = self._push_to_html_content(html_content, '<h4>')
        html_content = self._push_to_html_content(html_content, '<a href="#headingBlog">Go back to top</a>', 1)
        html_content = self._push_to_html_content(html_content, '</h4>')
        html_content = self._push_to_html_content(html_content, '<h4>')
        html_content = self._push_to_html_content(html_content, f'<a href="blog.html">Go back to list of articles</a>',                                                 1)
        html_content = self._push_to_html_content(html_content, '</h4>')
        return html_content
