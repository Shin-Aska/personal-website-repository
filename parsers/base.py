from abc import ABC, abstractmethod
from enum import StrEnum

class Token(ABC):
    def __init__(self, value: str, content: any):
        self.value = value
        self.content = content

class Element(ABC):
    def __init__(self, element_type: StrEnum, content: any):
        self.element_type = element_type
        self.content = content

class Tokenizer(ABC):
    @abstractmethod
    def tokenize(self, content: str) -> list[Token]:
        raise NotImplementedError

class Parser(ABC):
    @abstractmethod
    def parse(self, content: list[Token]) -> list[Element]:
        raise NotImplementedError
