"""
Core internal grammar representation used by every algorithm in this project.

A Grammar is intentionally a plain, explicit data structure (not hidden behind
a parser-generator library) so every algorithm module can read/write it
directly. This is the "single source of truth" object that flows through the
whole pipeline: parse -> validate -> diagnose -> transform -> FIRST/FOLLOW ->
LL(1) table -> parse.
"""

from dataclasses import dataclass, field
from typing import Dict, List

EPSILON = "\u03b5"  # ε
END_MARKER = "$"


@dataclass
class Production:
    """A single production A -> X1 X2 ... Xn (or A -> ε)."""
    id: str          # stable id like "E0", "E1" (LHS + index) so explanations can refer to it
    lhs: str
    rhs: List[str]    # list of grammar symbols; epsilon production is [EPSILON]

    def is_epsilon(self) -> bool:
        return self.rhs == [EPSILON]

    def rhs_str(self) -> str:
        return " ".join(self.rhs)

    def __str__(self) -> str:
        return f"{self.lhs} -> {self.rhs_str()}"


@dataclass
class Grammar:
    start_symbol: str
    non_terminals: List[str] = field(default_factory=list)
    terminals: List[str] = field(default_factory=list)
    # LHS -> ordered list of Production
    productions: Dict[str, List[Production]] = field(default_factory=dict)

    def all_productions(self) -> List[Production]:
        result: List[Production] = []
        for nt in self.non_terminals:
            result.extend(self.productions.get(nt, []))
        return result

    def is_non_terminal(self, symbol: str) -> bool:
        return symbol in self.non_terminals

    def is_terminal(self, symbol: str) -> bool:
        return symbol in self.terminals

    def renumber(self) -> None:
        """Reassign stable production ids after any structural transformation."""
        for nt in self.non_terminals:
            for i, p in enumerate(self.productions.get(nt, [])):
                p.id = f"{nt}::{i}"

    def to_dict(self) -> dict:
        return {
            "start_symbol": self.start_symbol,
            "non_terminals": self.non_terminals,
            "terminals": self.terminals,
            "productions": {
                nt: [{"id": p.id, "lhs": p.lhs, "rhs": p.rhs, "text": str(p)} for p in prods]
                for nt, prods in self.productions.items()
            },
            "text": grammar_to_text(self),
        }

    def clone(self) -> "Grammar":
        new_prods = {
            nt: [Production(p.id, p.lhs, list(p.rhs)) for p in prods]
            for nt, prods in self.productions.items()
        }
        return Grammar(
            start_symbol=self.start_symbol,
            non_terminals=list(self.non_terminals),
            terminals=list(self.terminals),
            productions=new_prods,
        )


def grammar_to_text(g: Grammar) -> str:
    lines = []
    for nt in g.non_terminals:
        prods = g.productions.get(nt, [])
        if not prods:
            continue
        rhs_parts = [p.rhs_str() for p in prods]
        lines.append(f"{nt} -> " + " | ".join(rhs_parts))
    return "\n".join(lines)


class GrammarError(Exception):
    """Raised for any user-facing grammar validation / parsing problem."""

    def __init__(self, message: str, production_text: str = None, hint: str = None):
        self.message = message
        self.production_text = production_text
        self.hint = hint
        super().__init__(message)

    def to_dict(self) -> dict:
        return {
            "error": self.message,
            "production": self.production_text,
            "hint": self.hint,
        }
