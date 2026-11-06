"""
first.py

Computes FIRST sets for every symbol in a grammar using the standard
fixed-point algorithm, and records human-readable derivation steps so the
UI can explain *why* a symbol ended up in FIRST(A).

Rules implemented:
  FIRST(terminal a) = {a}
  FIRST(ε)          = {ε}
  For A -> X1 X2 ... Xk:
      add FIRST(X1) - {ε} to FIRST(A)
      if ε in FIRST(X1): add FIRST(X2) - {ε} to FIRST(A), continue...
      if ε in FIRST(X1)...FIRST(Xk): add ε to FIRST(A)
"""

from typing import Dict, List, Set
from app.models.grammar import Grammar, EPSILON


def compute_first_sets(g: Grammar) -> Dict:
    first: Dict[str, Set[str]] = {nt: set() for nt in g.non_terminals}
    for t in g.terminals:
        first[t] = {t}
    first[EPSILON] = {EPSILON}

    explanation_log: Dict[str, List[str]] = {nt: [] for nt in g.non_terminals}

    def first_of_sequence(seq: List[str]) -> Set[str]:
        """FIRST of a symbol sequence, using current (possibly partial) sets."""
        result: Set[str] = set()
        all_nullable = True
        for sym in seq:
            sym_first = first.get(sym, {sym})  # terminal not yet registered defaults to itself
            result |= (sym_first - {EPSILON})
            if EPSILON not in sym_first:
                all_nullable = False
                break
        if all_nullable:
            result.add(EPSILON)
        return result

    changed = True
    iteration = 0
    while changed:
        changed = False
        iteration += 1
        for nt in g.non_terminals:
            for p in g.productions.get(nt, []):
                seq = p.rhs
                added_before = set(first[nt])
                contribution = first_of_sequence(seq)
                first[nt] |= contribution
                if first[nt] != added_before:
                    changed = True

    # Build explanation text per non-terminal (final pass, using converged sets)
    for nt in g.non_terminals:
        lines = []
        for p in g.productions.get(nt, []):
            seq = p.rhs
            if seq == [EPSILON]:
                lines.append(f"{p}  \u21d2  contributes {{\u03b5}} to FIRST({nt})")
                continue
            contributed = set()
            trace_parts = []
            all_nullable = True
            for sym in seq:
                sym_first = first.get(sym, {sym})
                trace_parts.append(f"FIRST({sym}) = {{{', '.join(sorted(sym_first))}}}")
                contributed |= (sym_first - {EPSILON})
                if EPSILON not in sym_first:
                    all_nullable = False
                    break
            if all_nullable:
                contributed.add(EPSILON)
            lines.append(
                f"{p}  \u21d2  " + "; ".join(trace_parts) +
                f"  \u21d2  adds {{{', '.join(sorted(contributed))}}} to FIRST({nt})"
            )
        explanation_log[nt] = lines

    first_nt_only = {nt: sorted(first[nt]) for nt in g.non_terminals}
    return {
        "first_sets": first_nt_only,
        "explanations": explanation_log,
        "_internal_first_table": first,  # used internally by follow.py / ll1
    }
