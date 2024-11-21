from typing import Optional

from constants import MarkdownElementType, MultiContentMarkdownElementType, ElementTypeMapping


class MarkdownElement:
    element_type: MarkdownElementType = None
    content: str | list[str] = None
    extra: dict = {}

    def __init__(self, element_type: MarkdownElementType, content: str | list[str]):
        self.element_type = element_type
        self.content = content

    def is_multi_content(self) -> bool:
        return self.element_type in MultiContentMarkdownElementType


class MarkdownParser:
    @staticmethod
    def parse(markdown_file_contents: list[str]) -> list[MarkdownElement]:
        elements = []
        element_type: Optional[MarkdownElementType] = None
        code_block_flag: bool = False
        element: Optional[MarkdownElement] = None

        for idx, line in enumerate(markdown_file_contents):

            prefix: str = ''
            element_type = None

            if line.strip().rstrip() == '':
                continue

            for e_prefix, e_type in ElementTypeMapping.items():
                if line.startswith(e_prefix):
                    element_type = e_type
                    prefix = e_prefix
                    break

            if element_type is None:
                 element_type = MarkdownElementType.p

            # print(["#", idx, line, element_type, code_block_flag, element, element.element_type if element else None, element.element_type not in MultiContentMarkdownElementType if element else None])
            value: str = line.replace(prefix, '').strip().rstrip()

            # if idx == 64:
            #     import pdb
            #     pdb.set_trace()

            if element_type == MarkdownElementType.codeblock:
                if element and element.element_type != MarkdownElementType.codeblock or not element:
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
                    if element_type not in MultiContentMarkdownElementType:
                        element = MarkdownElement(element_type, value)
                        elements.append(element)
                        element = None
                    else:
                        content: list[str] = [value]
                        element = MarkdownElement(element_type, content)
                # If we are holding an element. it means we are in a multi content element
                # If this is the case we will just append the content to the element as long as the element type is the same
                # If the element type is different, we will append the element to the elements list and create a new element
                else:
                    if element.element_type == element_type:
                        element.content.append(value)
                    else:
                        elements.append(element)
                        if element_type not in MultiContentMarkdownElementType:
                            element = MarkdownElement(element_type, value)
                            elements.append(element)
                            element = None
                        else:
                            content: list[str] = [value]
                            element = MarkdownElement(element_type, content)
            else:
                element.content.append(line)

        return elements
