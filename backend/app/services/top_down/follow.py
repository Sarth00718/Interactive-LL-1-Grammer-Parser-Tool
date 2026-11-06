"""
follow.py

Computes FOLLOW sets for every non-terminal using the standard fixed-point
algorithm, with derivation-step explanations.

Rules implemented:
  Rule 1: $ in FOLLOW(start_symbol)
  Rule 2: for A -> alpha B beta:  FIRST(beta) - {ε}  is added to FOLLOW(B)
  Rule 3: for A -> alpha B beta where beta is nullable (or beta is empty):
          FOLLOW(A) is added to FOLLOW(B)
"""

from typing import Dict, List, Set
from app.models.grammar import Grammar, EPSILON, END_MARKER


def _first_of_sequence(first_table: Dict[str, Set[str]], seq: List[str]) -> Set[str]:
    result: Set[str] = set()
    all_nullable = True
    for sym in seq:
        sym_first = first_table.get(sym, {sym})
        result |= (sym_first - {EPSILON})
        if EPSILON not in sym_first:
            all_nullable = False
            break
    if all_nullable:
        result.add(EPSILON)
    return result


def compute_follow_sets(g: Grammar, first_table: Dict[str, Set[str]]) -> Dict:
    follow: Dict[str, Set[str]] = {nt: set() for nt in g.non_terminals}
    follow[g.start_symbol].add(END_MARKER)

    explanation_log: Dict[str, List[str]] = {nt: [] for nt in g.non_terminals}
    explanation_log[g.start_symbol].append(
        f"Rule 1: '{g.start_symbol}' is the start symbol, so $ \u2208 FOLLOW({g.start_symbol})."
    )

    changed = True
    while changed:
        changed = False
        for nt in g.non_terminals:
            for p in g.productions.get(nt, []):
                seq = p.rhs
                if seq == [EPSILON]:
                    continue
                for i, sym in enumerate(seq):
                    if sym not in g.non_terminals:
                        continue
                    beta = seq[i + 1:]
                    before = set(follow[sym])

                    if beta:
                        first_beta = _first_of_sequence(first_table, beta)
                        follow[sym] |= (first_beta - {EPSILON})
                        if EPSILON in first_beta:
                            follow[sym] |= follow[nt]
                    else:
                        follow[sym] |= follow[nt]

                    if follow[sym] != before:
                        changed = True

    # Build explanation text (final descriptive pass over converged sets)
    for nt in g.non_terminals:
        for p in g.productions.get(nt, []):
            seq = p.rhs
            if seq == [EPSILON]:
                continue
            for i, sym in enumerate(seq):
                if sym not in g.non_terminals:
                    continue
                beta = seq[i + 1:]
                if beta:
                    first_beta = _first_of_sequence(first_table, beta)
                    added = first_beta - {EPSILON}
                    line = (
                        f"{p}: beta after '{sym}' is '{' '.join(beta)}'. "
                        f"FIRST(\u03b2) = {{{', '.join(sorted(first_beta))}}} "
                        f"\u21d2 adds {{{', '.join(sorted(added))}}} to FOLLOW({sym})."
                    )
                    if EPSILON in first_beta:
                        line += f" Since \u03b2 is nullable, FOLLOW({nt}) is also added to FOLLOW({sym})."
                    explanation_log[sym].append(line)
                else:
                    explanation_log[sym].append(
                        f"{p}: '{sym}' is the last symbol on the RHS, so FOLLOW({nt}) is added to FOLLOW({sym})."
                    )

    follow_out = {nt: sorted(follow[nt]) for nt in g.non_terminals}
    return {"follow_sets": follow_out, "explanations": explanation_log, "_internal_follow_table": follow}
