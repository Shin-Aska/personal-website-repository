from abc import ABC
from typing import TextIO, Optional

from parsers.markdown.constants import heading_markdown_element_type, MarkdownElementType, \
    publisher_heading_characters_ignore_for_heading_tag, heading_markdown_element_type_mapping, \
    heading_with_ids_upon_publishing
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

        print('[', end='')
        for element in elements:
            print(element.element_type, end=', ')
        print(']')

        table_contents: list[HeadingContent] = []

        for element in elements:
            if element.element_type in heading_markdown_element_type:
                html_content = self._generate_heading_content(html_content, element.content, element, table_contents)
            elif element.element_type == MarkdownElementType.p:
                html_content = self._push_to_html_content(html_content, f'<p>{element.content}</p>', convert_formatting_markers_to_html=True, convert_link_markers_to_html=True)
            elif element.element_type == MarkdownElementType.ul or element.element_type == MarkdownElementType.ol:
                html_content = self._generate_list_content(html_content, element)
            elif element.element_type == MarkdownElementType.checkbox:
                html_content = self._generate_checkbox_content(html_content, element.content, element)
            elif element.element_type == MarkdownElementType.image:
                # Remove dangling ) in element.content if it exists, just a minor hack for now because
                # my fucking parser sucks donkey balls
                if element.content[-1] == ')':
                    element.content = element.content[:-1]
                print([element.element_type, element.content, element.extra])
                html_content = self._push_to_html_content(html_content, '<figure>')
                html_content = self._push_to_html_content(html_content, f'<img class="preview center" src="{element.content}">')
                if element.extra.get('caption'):
                    html_content = self._push_to_html_content(html_content, f'<figcaption>{element.extra["caption"]}</figcaption>', 1, convert_formatting_markers_to_html=True)
                html_content = self._push_to_html_content(html_content, '</figure>')
                self.images.append('articles/' + element.content)

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
    def _process_italic_and_bold_markers(value: str) -> str:
        result = []
        i: int = 0
        starting_i: int = i
        while i < len(value):
            if value[i:i + 2] == '**':  # Detect double asterisks for bold
                starting_i = i
                i += 2
                bold_content = []
                while i < len(value) and value[i:i + 2] != '**':
                    bold_content.append(value[i])
                    i += 1
                if i < len(value) and value[i:i + 2] == '**':
                    i += 2
                    result.append(f"<b>{''.join(bold_content)}</b>")
                else:
                    for x in range(starting_i, i):
                        result.append(value[x])
            elif value[i] == '*':  # Detect single asterisk for italic
                starting_i = i
                i += 1
                italic_content = []
                while i < len(value) and value[i] != '*':
                    italic_content.append(value[i])
                    i += 1
                if i < len(value) and value[i] == '*':
                    i += 1  # Skip the closing *
                    result.append(f"<i>{''.join(italic_content)}</i>")
                else:
                    for x in range(starting_i, i):
                        result.append(value[x])

            else:
                result.append(value[i])
                i += 1
        return ''.join(result)

    @staticmethod
    def _process_link_markers(value: str) -> str:
        new_value: str = ''

        # Important variables during loop

        # Current Index
        index: int = 0

        # Square bracket counter
        square_bracket_counter: int = 0
        square_bracket_index: int = 0
        link_text: Optional[str] = None
        link_url: Optional[str] = None

        # Parenthesis counter
        parenthesis_counter: int = 0
        parenthesis_bracket_index: int = 0

        # The algorithm is simple, we traverse the whole string, everytime it encounters the square or parenthesis bracket
        # It keeps track of their respective indexes and then that will be used to determine the link text and link url
        # Which will then be converted to an anchor tag
        while index < len(value):
            if value[index] not in ['[', '(', ')', ']'] and (square_bracket_counter == 0 and parenthesis_counter == 0):
                new_value += value[index]
            elif value[index] in ['(', ')'] and square_bracket_counter != 0:
                pass
            elif value[index] in ['[', ']'] and parenthesis_counter != 0:
                pass
            elif value[index] == '[':
                if square_bracket_counter == 0:
                    square_bracket_index = index
                square_bracket_counter += 1
            elif value[index] == '(':
                if parenthesis_counter == 0:
                    parenthesis_bracket_index = index
                parenthesis_counter += 1
            elif value[index] == ']':
                square_bracket_counter -= 1
                # Get substring from the square bracket index to the current index
                if square_bracket_counter == 0:
                    link_text = value[square_bracket_index + 1:index]
            elif value[index] == ')':
                parenthesis_counter -= 1
                # Get substring from the parenthesis bracket index to the current index
                if parenthesis_counter == 0 and link_text is not None:
                    link_url: str = value[parenthesis_bracket_index + 1:index]
                    new_value += f'<a href="{link_url}">{link_text}</a>'
                    link_text = None
                else:
                    new_value += value[parenthesis_bracket_index:index + 1]
            index += 1
        return new_value

    @staticmethod
    def _convert_markdown_markers_to_html(value: str) -> str:
        new_value: str = Publisher._process_italic_and_bold_markers(value)
        return new_value

    @staticmethod
    def _push_to_html_content(content: str, value: str, tab_padding: int = 0, add_new_line_per_join: bool = True, convert_formatting_markers_to_html = False, convert_link_markers_to_html = False) -> str:
        value = Publisher._convert_markdown_markers_to_html(value) if convert_formatting_markers_to_html else value
        value = Publisher._process_link_markers(value) if convert_link_markers_to_html else value
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

        heading_tag = heading_markdown_element_type_mapping[element.element_type]
        if element.element_type in heading_with_ids_upon_publishing:
            table_contents.append(HeadingContent(heading_id, element.content))
            html_content = self._push_to_html_content(html_content, f'<{heading_tag} id="{heading_id}">{element.content}</{heading_tag}>')
        else:
            html_content = self._push_to_html_content(html_content, f'<{heading_tag}>{element.content}</{heading_tag}>')
        return html_content

    def _generate_list_content(self, html_content: str, element: MarkdownElement) -> str:
        html_tag: str = 'ol' if element.element_type == MarkdownElementType.ol else 'ul'
        html_content = self._push_to_html_content(html_content, f'<{html_tag}>')
        for line in element.content:
            line = self._convert_markdown_markers_to_html(line)
            line = self._process_link_markers(line)
            html_content = self._push_to_html_content(html_content, f'<li>{line}</li>', 1)
        html_content = self._push_to_html_content(html_content, f'</{html_tag}>')
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
                html_content = self._push_to_html_content(html_content, f'<figcaption>{markdown_elements[1].content}</figcaption>', 1, convert_formatting_markers_to_html=True)
                html_content = self._push_to_html_content(html_content, '</figure>')
                self.images.append('articles/' + link_content[0].content)

        return html_content

    def _generate_codeblock_content(self, html_content: str, line: str, element: MarkdownElement) -> str:
        language: str = element.extra.get('language', 'text')
        # TODO: Perhaps scan the languages folder and check if the language is supported, otherwise default to text
        if language == 'mermaid':
            language = 'text'
        html_content = self._push_to_html_content(html_content, '<pre>')
        html_content = self._push_to_html_content(html_content, f'<code language="{language}">', 1)
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
