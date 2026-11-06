"""
ll1_analyzer.py

Grammar-level LL(1) verdict, built directly from the FIRST/FIRST and
FIRST/FOLLOW conflicts already detected while constructing the parsing
table (parsing_table.py). This module exists as its own service (per the
required architecture / phase breakdown) and additionally classifies each
conflict as FIRST/FIRST vs FIRST/FOLLOW so the UI can explain it precisely.
"""

from typing import Dict, List
from app.models.grammar import EPSILON


def classify_and_summarize(table_result: Dict) -> Dict:
    conflicts = table_result["conflicts"]
    classified = []
    for c in conflicts:
        # A FIRST/FOLLOW conflict involves an epsilon production among the
        # colliding productions; otherwise it's a FIRST/FIRST conflict.
        has_epsilon_alt = any(p.strip().endswith(f"-> {EPSILON}") or p.strip().endswith(EPSILON) for p in c["productions"])
        kind = "FIRST/FOLLOW" if has_epsilon_alt else "FIRST/FIRST"
        classified.append({**c, "kind": kind})

    return {
        "is_ll1": len(conflicts) == 0,
        "conflict_count": len(conflicts),
        "conflicts": classified,
        "summary": (
            "\u2713 Grammar is LL(1)" if len(conflicts) == 0
            else f"\u2717 Grammar is NOT LL(1) ({len(conflicts)} conflict(s) found)"
        ),
    }
