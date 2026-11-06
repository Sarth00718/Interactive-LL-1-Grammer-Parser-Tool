"""
item.py

Defines immutable LR(0) and LR(1) item structures with dot positioning,
reduction detection, lookahead tracking, and formatting.
"""

from dataclasses import dataclass
from typing import Tuple, Optional
from app.models.grammar import EPSILON
from app.services.bottom_up.augmented import IndexedProduction


@dataclass(frozen=True)
class LR0Item:
    prod_index: int
    lhs: str
    rhs: Tuple[str, ...]
    dot: int

    @property
    def is_epsilon(self) -> bool:
        return len(self.rhs) == 1 and self.rhs[0] == EPSILON

    @property
    def next_symbol(self) -> Optional[str]:
        if self.is_epsilon:
            return None
        if self.dot < len(self.rhs):
            return self.rhs[self.dot]
        return None

    @property
    def is_reduction(self) -> bool:
        if self.is_epsilon:
            return True
        return self.dot >= len(self.rhs)

    @property
    def is_kernel(self) -> bool:
        # Kernel items are S' -> . S or any item where dot > 0
        return self.prod_index == 0 or self.dot > 0

    def advance(self) -> "LR0Item":
        if self.is_reduction:
            raise ValueError(f"Cannot advance dot past end in reduction item: {self}")
        return LR0Item(
            prod_index=self.prod_index,
            lhs=self.lhs,
            rhs=self.rhs,
            dot=self.dot + 1,
        )

    def __str__(self) -> str:
        if self.is_epsilon:
            return f"{self.lhs} -> \u2022 \u03b5"
        before = list(self.rhs[:self.dot])
        after = list(self.rhs[self.dot:])
        rhs_with_dot = " ".join(before + ["\u2022"] + after).strip()
        return f"{self.lhs} -> {rhs_with_dot}"

    def to_dict(self) -> dict:
        return {
            "prod_index": self.prod_index,
            "lhs": self.lhs,
            "rhs": list(self.rhs),
            "dot": self.dot,
            "next_symbol": self.next_symbol,
            "is_reduction": self.is_reduction,
            "is_kernel": self.is_kernel,
            "text": str(self),
        }


@dataclass(frozen=True)
class LR1Item:
    prod_index: int
    lhs: str
    rhs: Tuple[str, ...]
    dot: int
    lookahead: str

    @property
    def core(self) -> LR0Item:
        return LR0Item(
            prod_index=self.prod_index,
            lhs=self.lhs,
            rhs=self.rhs,
            dot=self.dot,
        )

    @property
    def is_epsilon(self) -> bool:
        return len(self.rhs) == 1 and self.rhs[0] == EPSILON

    @property
    def next_symbol(self) -> Optional[str]:
        return self.core.next_symbol

    @property
    def is_reduction(self) -> bool:
        return self.core.is_reduction

    @property
    def is_kernel(self) -> bool:
        return self.core.is_kernel

    def advance(self) -> "LR1Item":
        advanced_core = self.core.advance()
        return LR1Item(
            prod_index=advanced_core.prod_index,
            lhs=advanced_core.lhs,
            rhs=advanced_core.rhs,
            dot=advanced_core.dot,
            lookahead=self.lookahead,
        )

    def __str__(self) -> str:
        return f"[{self.core}, {self.lookahead}]"

    def to_dict(self) -> dict:
        return {
            "prod_index": self.prod_index,
            "lhs": self.lhs,
            "rhs": list(self.rhs),
            "dot": self.dot,
            "lookahead": self.lookahead,
            "next_symbol": self.next_symbol,
            "is_reduction": self.is_reduction,
            "is_kernel": self.is_kernel,
            "text": str(self),
        }

