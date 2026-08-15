import re
from typing import Optional

from parsers.markdown.constants import MarkdownElementType, element_type_mapping, multi_content_markdown_element_type
from parsers.markdown.models import MarkdownElement


class MarkdownParser:

    @staticmethod
    def _is_paragraph_line(line: str) -> bool:
        """Return whether a source line belongs to ordinary paragraph prose."""
        if not line.strip():
            return False

        for element_prefix, element_type in element_type_mapping.items():
            if element_prefix.__contains__('{num}'):
                if re.match(r'^\d+\. ', line):
                    return False
            elif line.startswith(element_prefix):
                # A link split across physical lines is paragraph content, while
                # a complete link on its own line keeps the existing link element.
                if element_type == MarkdownElementType.link:
                    return not MarkdownParser._check_if_valid_link(line)
                return False
        return True

    @staticmethod
    def _merge_paragraph_lines(markdown_file_contents: list[str]) -> list[str]:
        """Join soft-wrapped prose until a blank line or block element.

        Markdown treats consecutive prose lines as one paragraph. The original
        parser emitted one paragraph per physical line, which inflated spacing
        and broke inline markup that crossed a source line boundary.
        """
        merged_lines: list[str] = []
        paragraph_lines: list[str] = []
        inside_code_block = False

        def flush_paragraph() -> None:
            if paragraph_lines:
                merged_lines.append(' '.join(part.strip() for part in paragraph_lines))
                paragraph_lines.clear()

        for line in markdown_file_contents:
            stripped_line = line.strip()

            if stripped_line.startswith('```'):
                flush_paragraph()
                merged_lines.append(line)
                inside_code_block = not inside_code_block
                continue

            if inside_code_block:
                merged_lines.append(line)
                continue

            if MarkdownParser._is_paragraph_line(line):
                paragraph_lines.append(line)
                continue

            flush_paragraph()
            merged_lines.append(line)

        flush_paragraph()
        return merged_lines

    @staticmethod
    def _generate_non_multi_content_markdown_element(element_type: MarkdownElementType, line: str, value: str) -> MarkdownElement:
        element: Optional[MarkdownElement] = None
        if element_type == MarkdownElementType.link or element_type == MarkdownElementType.image:
            square_bracket_open_index: int = -1
            square_bracket_close_index: int  = -1
            square_bracket_open_counter: int  = 0

            for square_bracket_index, char in enumerate(line):
                if char == '[':
                    if square_bracket_open_counter == 0:
                        square_bracket_open_index = square_bracket_index
                    square_bracket_open_counter += 1
                elif char == ']':
                    square_bracket_open_counter -= 1
                    if square_bracket_open_counter == 0:
                        square_bracket_close_index = square_bracket_index
                        break

            if square_bracket_open_index != -1 and square_bracket_close_index != -1:
                value = line[square_bracket_open_index + 1:square_bracket_close_index]
                link = line[square_bracket_close_index + 2:-1]

                if element_type == MarkdownElementType.link:
                    element = MarkdownElement(element_type, value)
                    element.extra['link'] = link
                elif element_type == MarkdownElementType.image:
                    element = MarkdownElement(element_type, link)
                    element.extra['alt'] = value
        else:
            element = MarkdownElement(element_type, value)
        return element

    @staticmethod
    def _check_if_valid_link(line: str) -> bool:
        square_bracket_open_index: int = -1
        square_bracket_close_index: int  = -1
        square_bracket_open_counter: int  = 0

        for square_bracket_index, char in enumerate(line):
            if char == '[':
                if square_bracket_open_counter == 0:
                    square_bracket_open_index = square_bracket_index
                square_bracket_open_counter += 1
            elif char == ']':
                square_bracket_open_counter -= 1
                if square_bracket_open_counter == 0:
                    square_bracket_close_index = square_bracket_index
                    break

        if square_bracket_open_index != -1 and square_bracket_close_index != -1:
            if line[-1] == ')' and line[square_bracket_close_index + 1] == '(':
                return True
        return False

    @staticmethod
    def parse(markdown_file_contents: list[str], debug = False) -> list[MarkdownElement]:
        markdown_file_contents = MarkdownParser._merge_paragraph_lines(markdown_file_contents)
        elements = []
        element_type: Optional[MarkdownElementType] = None
        code_block_flag: bool = False
        element: Optional[MarkdownElement] = None
        last_line_was_empty: bool = False

        if debug:
            import pdb
            pdb.set_trace()

        for idx, line in enumerate(markdown_file_contents):

            prefix: str = ''
            element_type = None

            if line.strip().rstrip() == '':
                if idx == len(markdown_file_contents) - 1:
                    if element and element.element_type in multi_content_markdown_element_type:
                        elements.append(element)
                        element = None
                    break
                else:
                    last_line_was_empty = True
                    continue

            for e_prefix, e_type in element_type_mapping.items():
                if e_prefix.__contains__('{num}'):
                    starts_with_digit = False
                    is_done_accessing_number = False
                    for idy, char in enumerate(line):
                        if idy == 0:
                            if char.isdigit():
                                starts_with_digit = True
                            else:
                                break
                        elif char == '.' and starts_with_digit and line[idy - 1].isdigit() and idy < len(line) - 1 and line[idy + 1] == ' ':
                            element_type = e_type
                            prefix = line[:idy + 1]
                            is_done_accessing_number = True
                            break
                    if is_done_accessing_number:
                        break
                elif line.startswith(e_prefix):
                    element_type = e_type
                    prefix = e_prefix
                    break

            if element_type is None:
                element_type = MarkdownElementType.p
            elif element_type == MarkdownElementType.link:
                if not MarkdownParser._check_if_valid_link(line):
                    element_type = MarkdownElementType.p
                    prefix = ''

            if element_type == MarkdownElementType.table:
                value: str = line.strip().rstrip()
            else:
                value: str = line.replace(prefix, '').strip().rstrip().replace('\\', '')

            if element_type == MarkdownElementType.codeblock:
                if (element and element.element_type != MarkdownElementType.codeblock) or not element:
                    code_block_flag = True
                    element = MarkdownElement(element_type, [])
                    element.extra['language'] = value
                else:
                    code_block_flag = False

            if not code_block_flag:
                # The idea is simple, normally we can map the prefix to the element type and is usually a single line element
                # But if the element is a multi content element, we need to append the content until we find the new element

                # To do this, we will persist the element until we find a new element

                # If the element is None, we will create a new element
                if not element:
                    # The only difference between a single content element and a multi content element is the content
                    # If the element is not a multi content element then the content is a string, otherwise it is a list
                    if element_type not in multi_content_markdown_element_type:
                        element = MarkdownParser._generate_non_multi_content_markdown_element(element_type, line, value)
                        elements.append(element)
                        element = None
                    else:
                        content: list[str] = [value]
                        element = MarkdownElement(element_type, content)
                        if idx == len(markdown_file_contents) - 1:
                            elements.append(element)
                            element = None
                # If we are holding an element. it means we are in a multi content element
                # If this is the case we will just append the content to the element as long as the element type is the same
                # If the element type is different, we will append the element to the elements list and create a new element
                else:
                    if element.element_type == element_type and element.element_type == MarkdownElementType.ul and last_line_was_empty:
                        elements.append(element)
                        element = None
                        if element_type not in multi_content_markdown_element_type:
                            element = MarkdownParser._generate_non_multi_content_markdown_element(element_type, line, value)
                            elements.append(element)
                            element = None
                        else:
                            content: list[str] = [value]
                            element = MarkdownElement(element_type, content)
                            if idx == len(markdown_file_contents) - 1:
                                elements.append(element)
                                element = None

                    elif element.element_type == element_type:
                        element.content.append(value)
                        if idx == len(markdown_file_contents) - 1:
                            elements.append(element)
                            element = None
                    else:
                        elements.append(element)
                        if element_type not in multi_content_markdown_element_type:
                            element = MarkdownParser._generate_non_multi_content_markdown_element(element_type, line, value)
                            elements.append(element)
                            element = None
                        else:
                            content: list[str] = [value]
                            element = MarkdownElement(element_type, content)
                            if idx == len(markdown_file_contents) - 1:
                                elements.append(element)
                                element = None
            else:
                # If line contains ``` and a language after that, then we will not append the line to the content
                if not (line.strip().startswith('```') and len(line.strip()) > 3):
                    element.content.append(line)
                else:
                    element.content.append('\n')
            last_line_was_empty = False

        return elements
