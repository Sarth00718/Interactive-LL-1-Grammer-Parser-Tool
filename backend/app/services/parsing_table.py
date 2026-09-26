"""
parsing_table.py

Builds the LL(1) predictive parsing table M[NonTerminal, Terminal-or-$] from
FIRST/FOLLOW sets computed on the (transformed) grammar, and detects
conflicts (two or more productions mapped to the same cell).

Table cell format: M[A][a] = list of Production (normally exactly one;
more than one means a conflict).
"""

from typing import Dict, List, Set
from app.models.grammar import Grammar, EPSILON, END_MARKER, Production


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


def build_parsing_table(
    g: Grammar,
    first_table: Dict[str, Set[str]],
    follow_table: Dict[str, Set[str]],
) -> Dict:
    columns = list(g.terminals) + [END_MARKER]
    table: Dict[str, Dict[str, List[Production]]] = {
        nt: {col: [] for col in columns} for nt in g.non_terminals
    }
    cell_reasons: Dict[str, Dict[str, List[str]]] = {
        nt: {col: [] for col in columns} for nt in g.non_terminals
    }

    conflicts = []

    for nt in g.non_terminals:
        for p in g.productions.get(nt, []):
            seq = p.rhs
            seq_first = _first_of_sequence(first_table, seq)

            for a in (seq_first - {EPSILON}):
                if a not in table[nt]:
                    continue
                table[nt][a].append(p)
                cell_reasons[nt][a].append(
                    f"{a} \u2208 FIRST({' '.join(seq)}) \u21d2 M[{nt}, {a}] includes {p}"
                )

            if EPSILON in seq_first:
                for b in follow_table.get(nt, set()):
                    if b not in table[nt]:
                        continue
                    table[nt][b].append(p)
                    cell_reasons[nt][b].append(
                        f"\u03b5 \u2208 FIRST({' '.join(seq)}) and {b} \u2208 FOLLOW({nt}) "
                        f"\u21d2 M[{nt}, {b}] includes {p}"
                    )

    for nt in g.non_terminals:
        for col in columns:
            entries = table[nt][col]
            if len(entries) > 1:
                conflicts.append({
                    "non_terminal": nt,
                    "terminal": col,
                    "productions": [str(p) for p in entries],
                    "reason": (
                        f"More than one production is applicable for M[{nt}, {col}]: "
                        + ", ".join(str(p) for p in entries) +
                        ". This violates the LL(1) condition."
                    ),
                })

    table_out = {
        nt: {col: [str(p) for p in table[nt][col]] for col in columns}
        for nt in g.non_terminals
    }

    return {
        "columns": columns,
        "table": table_out,
        "cell_reasons": cell_reasons,
        "conflicts": conflicts,
        "is_ll1": len(conflicts) == 0,
        "_internal_table": table,  # Production objects, used by predictive_parser
    }
