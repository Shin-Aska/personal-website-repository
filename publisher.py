"""
Article Publisher

Usage

python publisher.py -t template_file_path -f markdown_file_path -o output_file_path

This script is licensed under the MIT License.

"""

import optparse
import os
import shutil
from typing import TextIO, Optional

from factories.publisher import PublisherFactory

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

    publisher = PublisherFactory.get_publisher(options.template.split('/')[-1], template_file, markdown_file, options.file.split('/')[-1].split('.')[0])
    publisher.publish(options.output)

    # Check if the images under publisher.images exists on the {{template}} directory
    # If not, copy the images to the {{template}} directory

    for image in publisher.images:
        head, tail = os.path.split(image)
        folder: str = options.template.split('/')[-1].split('.')[0]

        if not os.path.exists(f'{folder}/images/{tail}'):
            print(f'Copying {image} to {folder}/images/{tail}')
            shutil.copy(image, f'{folder}/images/{tail}')
