"""
explanations.py

Small helpers that turn raw analysis structures (already produced by
first.py / follow.py / parsing_table.py) into the specific lookup shapes
the frontend wants, e.g. "explain FIRST(E)" or "explain M[E, id]".

The heavy lifting (actually deriving the explanation text) happens where
the set/table is computed, because that is where the derivation is known
step by step. This module just indexes into those results.
"""

from typing import Dict


def explain_first(first_result: Dict, non_terminal: str) -> Dict:
    return {
        "non_terminal": non_terminal,
        "set": first_result["first_sets"].get(non_terminal, []),
        "derivation": first_result["explanations"].get(non_terminal, []),
    }


def explain_follow(follow_result: Dict, non_terminal: str) -> Dict:
    return {
        "non_terminal": non_terminal,
        "set": follow_result["follow_sets"].get(non_terminal, []),
        "derivation": follow_result["explanations"].get(non_terminal, []),
    }


def explain_cell(table_result: Dict, non_terminal: str, terminal: str) -> Dict:
    entries = table_result["table"].get(non_terminal, {}).get(terminal, [])
    reasons = table_result["cell_reasons"].get(non_terminal, {}).get(terminal, [])
    return {
        "cell": f"M[{non_terminal}, {terminal}]",
        "productions": entries,
        "reasons": reasons,
        "is_conflict": len(entries) > 1,
    }
