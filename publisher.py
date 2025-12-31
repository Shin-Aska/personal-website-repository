"""
Article Publisher

Usage

python publisher.py -t template_file_path -f markdown_file_path -o output_file_path

This script is licensed under the MIT License.

"""

import optparse
import os
import shutil
from typing import Optional

from factories.publisher import PublisherFactory


def publish_article(
    template_path: str,
    markdown_path: str,
    output_path: str,
    mastodon_post_id: Optional[str] = None,
    mastodon_instance: Optional[str] = None,
    mastodon_user_handle: Optional[str] = None,
    bluesky_post_url: Optional[str] = None,
) -> None:
    """Publish a markdown file using the provided template to the given output path."""
    template_path = os.path.normpath(template_path)
    markdown_path = os.path.normpath(markdown_path)
    output_path = os.path.normpath(output_path)

    try:
        with open(template_path, 'r', encoding='utf-8') as template_file, open(
            markdown_path, 'r', encoding='utf-8'
        ) as markdown_file:
            publisher = PublisherFactory.get_publisher(
                os.path.basename(template_path),
                template_file,
                markdown_file,
                os.path.splitext(os.path.basename(markdown_path))[0],
                mastodon_post_id=mastodon_post_id,
                mastodon_instance=mastodon_instance,
                mastodon_user_handle=mastodon_user_handle,
                bluesky_post_url=bluesky_post_url,
            )
            publisher.publish(output_path)
            images = list(publisher.images)
    except FileNotFoundError as exc:
        raise FileNotFoundError('File not found for either template or markdown file') from exc

    folder = os.path.splitext(os.path.basename(template_path))[0]
    target_images_dir = os.path.join(folder, 'images')
    os.makedirs(target_images_dir, exist_ok=True)

    for image in images:
        _, tail = os.path.split(image)
        destination = os.path.join(target_images_dir, tail)

        if not os.path.exists(destination):
            print(f'Copying {image} to {destination}')
            if os.path.exists(image):
                print(f'Source image exists: {image}')
                shutil.copy(image, destination)
            else:
                print(f'Source image does not exist: {image}')


def main() -> None:
    parser = optparse.OptionParser()

    parser.add_option('-t', '--template', dest='template', help='Template file path')
    parser.add_option('-f', '--file', dest='file', help='Markdown file path')
    parser.add_option('-o', '--output', dest='output', help='Output file path')
    parser.add_option('--mastodon-post-id', dest='mastodon_post_id', help='Mastodon post id for comments section')
    parser.add_option('--mastodon-instance', dest='mastodon_instance', help='Mastodon instance/domain for comments section')
    parser.add_option('--mastodon-user-handle', dest='mastodon_user_handle', help='Mastodon user handle for comments section')
    parser.add_option('--bluesky-post-url', dest='bluesky_post_url', help='Bluesky post url for comments section')


    (options, _args) = parser.parse_args()

    if not options.template or not options.file or not options.output:
        parser.print_help()
        exit()

    try:
        publish_article(
            options.template,
            options.file,
            options.output,
            mastodon_post_id=options.mastodon_post_id,
            mastodon_instance=options.mastodon_instance,
            mastodon_user_handle=options.mastodon_user_handle,
            bluesky_post_url=options.bluesky_post_url,
        )
    except FileNotFoundError as exc:
        print(str(exc))
        exit()


if __name__ == '__main__':
    main()
