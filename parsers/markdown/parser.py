from typing import Optional

from parsers.markdown.constants import MarkdownElementType, element_type_mapping, multi_content_markdown_element_type
from parsers.markdown.models import MarkdownElement


class MarkdownParser:

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
