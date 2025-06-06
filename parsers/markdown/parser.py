from typing import Optional

from parsers.base import Parser
from parsers.markdown.constants import MarkdownElementType, element_type_mapping, multi_content_markdown_element_type
from parsers.markdown.models import MarkdownElement
from parsers.markdown.tokenizer import MarkdownTokenizer, MarkdownToken


class MarkdownParser(Parser):

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
    def parse(content: list[MarkdownToken], debug = False) -> list[MarkdownElement]:
        elements = []
        return elements
