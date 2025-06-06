from parsers.base import Tokenizer, Token
from parsers.markdown.constants import MarkdownElementType, element_type_mapping


class MarkdownToken(Token):
    def __init__(self, value: MarkdownElementType, content: str | list[Token]):
        super().__init__(value, content)


class MarkdownTokenizer(Tokenizer):
    def tokenize(self, content: str) -> list[MarkdownToken]:
        result: list[MarkdownToken] = []
        # Break down the content per line
        lines: list[str] = content.splitlines()

        # Get a base Markdown token for each line
        for line in lines:
            pass
        return result
