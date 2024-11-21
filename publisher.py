"""
Article Publisher

Usage

python publisher.py -t template_file_path -f markdown_file_path -o output_file_path

This script is licensed under the MIT License.

"""

import optparse
from abc import ABCMeta, abstractmethod, ABC
from io import TextIOWrapper
from typing import TextIO, Optional

from parser import MarkdownParser, MarkdownElement


class Publisher(ABC):

    template: TextIO = None
    markdown: TextIO = None

    @abstractmethod
    def __init__(self, template: TextIO, article: TextIO):
        self.template = template
        self.markdown = article

    @abstractmethod
    def _generate_content(self) -> str:
        raise NotImplementedError

    @abstractmethod
    def _generate_meta_title(self) -> str:
        raise NotImplementedError

    @abstractmethod
    def _fill_template(self, content, meta_title) -> str:
        raise NotImplementedError

    @staticmethod
    def _fetch_content(textio: TextIO) -> list[str]:
        return [line for line in textio]

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


class DefaultThemePublisher(Publisher):

    def __init__(self, template: TextIO, article: TextIO):
        super().__init__(template, article)

    def _generate_content(self) -> str:
        # Read each line of the markdown file
        elements: list[MarkdownElement] = MarkdownParser.parse(self._fetch_content(self.markdown))
        for element in elements:
            print([element.element_type, element.content])

        return 'Content'

    def _generate_meta_title(self) -> str:
        return 'Meta Title'

    def _fill_template(self, content, meta_title) -> str:
        return 'Template filled with content and meta title'



if __name__ == '__main__':
    # Use optparse
    parser = optparse.OptionParser()

    parser.add_option('-t', '--template', dest='template', help='Template file path')
    parser.add_option('-f', '--file', dest='file', help='Markdown file path')
    parser.add_option('-o', '--output', dest='output', help='Output file path')

    (options, args) = parser.parse_args()

    if not options.template or not options.file or not options.output:
        parser.print_help()
        exit()

    # Read the template file

    template_file: Optional[TextIO] = None
    markdown_file: Optional[TextIO] = None


    try:
        template_file = open(options.template, 'r')
        markdown_file = open(options.file, 'r')
    except FileNotFoundError:
        print('File not found for either template or markdown file')
        exit()

    publisher = DefaultThemePublisher(template_file, markdown_file)
    publisher.publish(options.output)


