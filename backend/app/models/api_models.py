from typing import Optional
from pydantic import BaseModel, Field


class GrammarInput(BaseModel):
    grammar_text: str = Field(..., description="Raw CFG text, one production per line.")
    start_symbol: Optional[str] = Field(None, description="Override the default (first-declared) start symbol.")


class ParseRequest(BaseModel):
    grammar_text: str
    start_symbol: Optional[str] = None
    input_string: str = Field(..., description="Whitespace-separated input tokens, e.g. 'id + id * id'.")


class CellExplainRequest(BaseModel):
    grammar_text: str
    start_symbol: Optional[str] = None
    non_terminal: str
    terminal: str


class SetExplainRequest(BaseModel):
    grammar_text: str
    start_symbol: Optional[str] = None
    non_terminal: str
