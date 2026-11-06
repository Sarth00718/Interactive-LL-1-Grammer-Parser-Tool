"""
left_factoring.py

Detects and eliminates common prefixes among a non-terminal's alternatives.

Standard transformation:
    A -> alpha beta1 | alpha beta2 | ... | gamma  (gamma has no common prefix)
becomes
    A  -> alpha A' | gamma
    A' -> beta1 | beta2 | ...

Applied repeatedly (a newly introduced A' might itself need factoring, and
factoring one non-terminal doesn't affect others) until no non-terminal has
alternatives sharing a common first symbol.
"""

from typing import Dict, List, Set
from app.models.grammar import Grammar, Production, EPSILON


def _longest_common_prefix(rhss: List[List[str]]) -> List[str]:
    if len(rhss) < 2:
        return []
    prefix = list(rhss[0])
    for rhs in rhss[1:]:
        new_len = 0
        for a, b in zip(prefix, rhs):
            if a == b:
                new_len += 1
            else:
                break
        prefix = prefix[:new_len]
        if not prefix:
            break
    return prefix


def _fresh_name(base: str, existing: Set[str]) -> str:
    candidate = base + "'"
    while candidate in existing:
        candidate = candidate + "'"
    return candidate


def left_factor(g: Grammar) -> Dict:
    prods: Dict[str, List[List[str]]] = {
        nt: [list(p.rhs) for p in g.productions.get(nt, [])] for nt in g.non_terminals
    }
    order: List[str] = list(g.non_terminals)
    all_names: Set[str] = set(order)
    steps = []

    changed_overall = False
    # Process a work queue since factoring can introduce new non-terminals
    # that themselves may need factoring.
    queue = list(order)
    while queue:
        nt = queue.pop(0)
        alts = prods.get(nt, [])
        if len(alts) < 2:
            continue

        # Group alternatives by their first symbol to find candidates.
        by_first: Dict[str, List[List[str]]] = {}
        for alt in alts:
            key = alt[0] if alt else EPSILON
            by_first.setdefault(key, []).append(alt)

        needs_factoring = any(len(v) > 1 for v in by_first.values())
        if not needs_factoring:
            continue

        before_snapshot = f"{nt} -> " + " | ".join(" ".join(a) for a in alts)

        # Repeatedly factor the longest common prefix group with the most sharers.
        remaining = list(alts)
        new_alts: List[List[str]] = []
        introduced = []
        while remaining:
            first_syms: Dict[str, List[List[str]]] = {}
            for alt in remaining:
                key = alt[0] if alt else EPSILON
                first_syms.setdefault(key, []).append(alt)
            # pick a group with >1 alt sharing prefix (prefer the largest group)
            group_key = None
            for k, v in first_syms.items():
                if len(v) > 1 and (group_key is None or len(v) > len(first_syms[group_key])):
                    group_key = k

            if group_key is None:
                # no more grouping needed; keep remaining as-is
                new_alts.extend(remaining)
                break

            group = first_syms[group_key]
            prefix = _longest_common_prefix(group)
            if not prefix:
                # shouldn't happen since they share first symbol, but guard anyway
                new_alts.extend(group)
                for alt in group:
                    remaining.remove(alt)
                continue

            new_nt = _fresh_name(nt, all_names)
            all_names.add(new_nt)
            introduced.append(new_nt)

            suffixes = []
            for alt in group:
                suf = alt[len(prefix):]
                suffixes.append(suf if suf else [EPSILON])

            prods[new_nt] = suffixes
            queue.append(new_nt)  # the new non-terminal may itself need factoring
            if new_nt not in order:
                insert_at = order.index(nt) + 1
                order.insert(insert_at, new_nt)

            new_alts.append(prefix + [new_nt])
            for alt in group:
                remaining.remove(alt)

        prods[nt] = new_alts
        after_lines = [f"{nt} -> " + " | ".join(" ".join(a) for a in prods[nt])]
        for inb in introduced:
            after_lines.append(f"{inb} -> " + " | ".join(" ".join(a) for a in prods[inb]))

        steps.append({
            "non_terminal": nt,
            "common_prefix_examples": before_snapshot,
            "before": before_snapshot,
            "after": "\n".join(after_lines),
            "explanation": (
                f"Alternatives of '{nt}' shared a common prefix, which prevents the parser from "
                f"choosing a production by looking at only one lookahead symbol. The common prefix is "
                f"factored out into a new non-terminal."
            ),
        })
        changed_overall = True

    new_terminals = list(g.terminals)
    new_productions: Dict[str, List[Production]] = {}
    for nt in order:
        plist = []
        for idx, rhs in enumerate(prods.get(nt, [])):
            plist.append(Production(id=f"{nt}::{idx}", lhs=nt, rhs=rhs))
        new_productions[nt] = plist

    new_grammar = Grammar(
        start_symbol=g.start_symbol,
        non_terminals=order,
        terminals=new_terminals,
        productions=new_productions,
    )

    return {"grammar": new_grammar, "steps": steps, "changed": changed_overall}
