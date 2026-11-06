"""
augmented.py

Augments a Context-Free Grammar for bottom-up parsing by introducing a unique
augmented start symbol S' and production 0: S' -> S.
Preserves deterministic production indexing (0 to P-1) used across LR(0), SLR(1),
CLR(1), and LALR(1).
"""

from dataclasses import dataclass
from typing import List, Dict, Tuple
from app.models.grammar import Grammar, Production, EPSILON, END_MARKER


@dataclass(frozen=True)
class IndexedProduction:
    index: int
    lhs: str
    rhs: Tuple[str, ...]
    is_augmented: bool = False

    @property
    def is_epsilon(self) -> bool:
        return len(self.rhs) == 1 and self.rhs[0] == EPSILON

    @property
    def rhs_str(self) -> str:
        return " ".join(self.rhs)

    def __str__(self) -> str:
        return f"({self.index}) {self.lhs} -> {self.rhs_str}"

    def to_dict(self) -> dict:
        return {
            "index": self.index,
            "lhs": self.lhs,
            "rhs": list(self.rhs),
            "text": str(self),
            "is_augmented": self.is_augmented,
            "is_epsilon": self.is_epsilon,
        }


@dataclass
class AugmentedGrammar:
    start_symbol: str
    augmented_start_symbol: str
    non_terminals: List[str]
    terminals: List[str]
    productions: List[IndexedProduction]
    productions_by_lhs: Dict[str, List[IndexedProduction]]

    def get_production(self, index: int) -> IndexedProduction:
        return self.productions[index]

    def to_dict(self) -> dict:
        return {
            "start_symbol": self.start_symbol,
            "augmented_start_symbol": self.augmented_start_symbol,
            "non_terminals": self.non_terminals,
            "terminals": self.terminals,
            "productions": [p.to_dict() for p in self.productions],
        }


def augment_grammar(g: Grammar) -> AugmentedGrammar:
    """
    Constructs the augmented grammar G' with start symbol S' and production (0) S' -> S.
    Assigns sequential numeric indices 0, 1, ..., N.
    """
    orig_start = g.start_symbol

    # Find a unique augmented start symbol
    aug_start = f"{orig_start}'"
    counter = 1
    while aug_start in g.non_terminals or aug_start in g.terminals:
        aug_start = f"{orig_start}_aug{counter}"
        counter += 1

    indexed_prods: List[IndexedProduction] = []
    prods_by_lhs: Dict[str, List[IndexedProduction]] = {}

    # Production 0: S' -> S
    p0 = IndexedProduction(
        index=0,
        lhs=aug_start,
        rhs=(orig_start,),
        is_augmented=True,
    )
    indexed_prods.append(p0)
    prods_by_lhs[aug_start] = [p0]

    idx = 1
    for nt in g.non_terminals:
        prods_by_lhs[nt] = []
        for p in g.productions.get(nt, []):
            ip = IndexedProduction(
                index=idx,
                lhs=p.lhs,
                rhs=tuple(p.rhs),
                is_augmented=False,
            )
            indexed_prods.append(ip)
            prods_by_lhs[nt].append(ip)
            idx += 1

    non_terminals = [aug_start] + [nt for nt in g.non_terminals if nt != aug_start]
    # Terminals include all original terminals
    terminals = list(g.terminals)
    if END_MARKER not in terminals:
        terminals.append(END_MARKER)

    return AugmentedGrammar(
        start_symbol=orig_start,
        augmented_start_symbol=aug_start,
        non_terminals=non_terminals,
        terminals=terminals,
        productions=indexed_prods,
        productions_by_lhs=prods_by_lhs,
    )
