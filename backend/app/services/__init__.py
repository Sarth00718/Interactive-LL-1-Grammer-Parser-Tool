"""
Services package for Complete Grammar Analysis & Parsing Laboratory.
Organized into modular domains:
  - grammar: Context-free grammar parsing, validation, and transformations
  - top_down: LL(1) predictive parsing pipeline (FIRST, FOLLOW, left-recursion, left-factoring, table, tree)
  - bottom_up: LR family (LR(0), SLR(1), CLR(1), LALR(1))
"""

from . import grammar
from . import top_down
from . import bottom_up

__all__ = [
    "grammar",
    "top_down",
    "bottom_up",
]

