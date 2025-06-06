from parsers.markdown.models import MarkdownElement
from publishers.base import Publisher


class DefaultThemePublisher(Publisher):
    def _generate_codeblock_content(self, html_content: str, line: str, element: MarkdownElement) -> str:
        language: str = element.extra.get('language', 'text')
        if language == 'mermaid':
            language = 'text'
        html_content = self._push_to_html_content(html_content, '<pre>')
        html_content = self._push_to_html_content(html_content, f'<code class="language-{language}">', 1)
        for line in element.content:
            html_content = self._push_to_html_content(html_content, line, Publisher.base_padding * -1, add_new_line_per_join=False)
        html_content = self._push_to_html_content(html_content, '</code>', 1)
        html_content = self._push_to_html_content(html_content, '</pre>')
        return html_content
    pass
