import unittest

from parsers.markdown.constants import MarkdownElementType
from parsers.markdown.parser import MarkdownParser


class MarkdownParagraphParsingTests(unittest.TestCase):
    def test_soft_wrapped_lines_form_one_paragraph(self):
        elements = MarkdownParser.parse([
            "A paragraph wrapped across\n",
            "two physical lines.\n",
            "\n",
            "A second paragraph.\n",
        ])

        self.assertEqual(
            [(element.element_type, element.content) for element in elements],
            [
                (MarkdownElementType.p, "A paragraph wrapped across two physical lines."),
                (MarkdownElementType.p, "A second paragraph."),
            ],
        )

    def test_inline_link_can_span_physical_lines(self):
        elements = MarkdownParser.parse([
            "There have been [archiving\n",
            "projects <sup>\\[1\\]</sup>](https://example.com/) that help.\n",
        ])

        self.assertEqual(len(elements), 1)
        self.assertEqual(elements[0].element_type, MarkdownElementType.p)
        self.assertEqual(
            elements[0].content,
            "There have been [archiving projects <sup>[1]</sup>](https://example.com/) that help.",
        )

    def test_block_elements_end_a_paragraph(self):
        elements = MarkdownParser.parse([
            "Introductory prose\n",
            "continues here.\n",
            "## Heading\n",
            "- First item\n",
            "- Second item\n",
            "| Name | Value |\n",
            "|---|---|\n",
            "| One | Two |\n",
        ])

        self.assertEqual(
            [element.element_type for element in elements],
            [
                MarkdownElementType.p,
                MarkdownElementType.h2,
                MarkdownElementType.ul,
                MarkdownElementType.table,
            ],
        )
        self.assertEqual(elements[0].content, "Introductory prose continues here.")

    def test_code_block_lines_are_not_joined(self):
        elements = MarkdownParser.parse([
            "```text\n",
            "first line\n",
            "second line\n",
            "```\n",
        ])

        self.assertEqual(len(elements), 1)
        self.assertEqual(elements[0].element_type, MarkdownElementType.codeblock)
        self.assertIn("first line\n", elements[0].content)
        self.assertIn("second line\n", elements[0].content)


if __name__ == "__main__":
    unittest.main()
