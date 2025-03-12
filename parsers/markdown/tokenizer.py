from parsers.base import Tokenizer, Token


class MarkdownToken(Token):
    pass


class MarkdownTokenizer(Tokenizer):
    def tokenize(self, content: str) -> list[MarkdownToken]:
        result: list[MarkdownToken] = []
        for character in content:
            pass
        return result
