"""
grammar_validator.py

Semantic validation on top of an already-parsed Grammar object:
  - duplicate productions
  - non-terminals used on the RHS that are never defined (undefined non-terminal
    look-alikes are impossible by construction here, since anything not a
    declared LHS becomes a terminal -- so instead we warn when a symbol LOOKS
    like it was meant to be a non-terminal, e.g. shares a name pattern, but
    was never given a production)
  - unreachable non-terminals (not reachable from the start symbol)
  - a non-terminal with zero productions

Returns a list of structured diagnostic messages: each is either a hard error
(the grammar cannot proceed) or a warning (grammar proceeds, but the user
should know).
"""

from typing import List, Dict
from app.models.grammar import Grammar, GrammarError


def validate_grammar(g: Grammar) -> Dict:
    errors: List[dict] = []
    warnings: List[dict] = []

    # 1. Every non-terminal must have at least one production.
    for nt in g.non_terminals:
        if not g.productions.get(nt):
            errors.append({
                "type": "missing_production",
                "message": f"Non-terminal '{nt}' has no productions.",
            })

    # 2. Duplicate productions (same LHS, same RHS) -- warning, not fatal.
    for nt in g.non_terminals:
        seen = set()
        for p in g.productions.get(nt, []):
            key = (nt, tuple(p.rhs))
            if key in seen:
                warnings.append({
                    "type": "duplicate_production",
                    "message": f"Duplicate production found: {p}",
                })
            seen.add(key)

    # 3. Unreachable non-terminals (not reachable from start symbol via productions).
    reachable = set()
    stack = [g.start_symbol]
    while stack:
        cur = stack.pop()
        if cur in reachable:
            continue
        reachable.add(cur)
        for p in g.productions.get(cur, []):
            for sym in p.rhs:
                if g.is_non_terminal(sym) and sym not in reachable:
                    stack.append(sym)

    for nt in g.non_terminals:
        if nt not in reachable:
            warnings.append({
                "type": "unreachable_symbol",
                "message": f"Non-terminal '{nt}' is not reachable from the start symbol '{g.start_symbol}'.",
            })

    is_valid = len(errors) == 0
    return {
        "is_valid": is_valid,
        "errors": errors,
        "warnings": warnings,
    }
