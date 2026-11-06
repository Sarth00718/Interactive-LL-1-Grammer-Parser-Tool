"""
table.py

Constructs the ACTION and GOTO tables for an SLR(1) parser.
Uses the LR(0) automaton and restricts reduction placement strictly to FOLLOW(A).
Detects conflicts and provides mathematical explanations.
"""

from typing import Dict, List, Any, Set
from app.services.bottom_up.augmented import AugmentedGrammar
from app.services.bottom_up.lr0.automaton import LR0Automaton


def build_slr_table(
    aug_grammar: AugmentedGrammar,
    automaton: LR0Automaton,
    follow_sets: Dict[str, Set[str]]
) -> Dict[str, Any]:
    terminals = [t for t in aug_grammar.terminals if t != "$"] + ["$"]
    non_terminals = [nt for nt in aug_grammar.non_terminals if nt != aug_grammar.augmented_start_symbol]

    action_table: Dict[int, Dict[str, List[Dict[str, Any]]]] = {
        s["id"]: {t: [] for t in terminals} for s in automaton.states
    }
    goto_table: Dict[int, Dict[str, Any]] = {
        s["id"]: {nt: None for nt in non_terminals} for s in automaton.states
    }

    # 1. Fill Shift and GOTO actions from automaton transitions
    for tr in automaton.transitions:
        src = tr["from_state"]
        tgt = tr["to_state"]
        sym = tr["symbol"]

        if sym in terminals:
            action_table[src][sym].append({
                "type": "shift",
                "target": tgt,
                "display": f"s{tgt}",
                "reason": f"Transition on terminal '{sym}' leads to state I{tgt}.",
            })
        elif sym in non_terminals:
            goto_table[src][sym] = tgt

    # 2. Fill Reduce and Accept actions using FOLLOW sets
    aug_start = aug_grammar.augmented_start_symbol
    orig_start = aug_grammar.start_symbol

    for state in automaton.states:
        sid = state["id"]
        for it_dict in state["items"]:
            lhs = it_dict["lhs"]
            rhs = it_dict["rhs"]
            prod_idx = it_dict["prod_index"]
            is_red = it_dict["is_reduction"]

            if not is_red:
                continue

            # Accept item: S' -> S .
            if lhs == aug_start and rhs == [orig_start]:
                action_table[sid]["$"].append({
                    "type": "accept",
                    "display": "acc",
                    "reason": f"Augmented start symbol completed ({lhs} -> {orig_start} \u2022). Accept on end marker $.",
                })
                continue

            # In SLR(1), reductions for A -> alpha are ONLY placed for terminals in FOLLOW(A)
            nt_follow = follow_sets.get(lhs, set())
            for a in nt_follow:
                if a in terminals:
                    action_table[sid][a].append({
                        "type": "reduce",
                        "production_index": prod_idx,
                        "lhs": lhs,
                        "rhs": rhs,
                        "display": f"r{prod_idx}",
                        "reason": f"SLR(1) places reduction by ({prod_idx}) {lhs} -> {' '.join(rhs)} under symbol '{a}' because '{a}' \u2208 FOLLOW({lhs}) = {{{', '.join(sorted(nt_follow))}}}.",
                    })

    # 3. Detect conflicts
    conflicts: List[Dict[str, Any]] = []
    has_conflicts = False

    for sid in range(len(automaton.states)):
        for t in terminals:
            acts = action_table[sid][t]
            if len(acts) > 1:
                has_conflicts = True
                shifts = [a for a in acts if a["type"] == "shift"]
                reduces = [a for a in acts if a["type"] == "reduce"]

                if shifts and reduces:
                    c_type = "Shift/Reduce"
                    shift_targets = ", ".join([f"s{s['target']}" for s in shifts])
                    reduce_prods = ", ".join([f"r{r['production_index']} ({r['lhs']} -> {' '.join(r['rhs'])})" for r in reduces])
                    expl = (
                        f"State I{sid} has a Shift/Reduce conflict on '{t}'. It can shift ({shift_targets}) or reduce ({reduce_prods}). "
                        f"Even though SLR(1) uses FOLLOW sets, '{t}' \u2208 FOLLOW({reduces[0]['lhs']}), so the conflict persists."
                    )
                elif len(reduces) > 1:
                    c_type = "Reduce/Reduce"
                    reduce_prods = ", ".join([f"r{r['production_index']} ({r['lhs']} -> {' '.join(r['rhs'])})" for r in reduces])
                    expl = (
                        f"State I{sid} has a Reduce/Reduce conflict on '{t}' between: {reduce_prods}. "
                        f"Both non-terminals share '{t}' in their FOLLOW sets."
                    )
                else:
                    c_type = "Action Conflict"
                    expl = f"State I{sid} has {len(acts)} competing actions on terminal '{t}'."

                conflicts.append({
                    "state": sid,
                    "symbol": t,
                    "conflict_type": c_type,
                    "actions": acts,
                    "explanation": expl,
                })

    # Display tables
    display_action_table: Dict[int, Dict[str, str]] = {}
    display_goto_table: Dict[int, Dict[str, str]] = {}

    for sid in range(len(automaton.states)):
        display_action_table[sid] = {}
        for t in terminals:
            acts = action_table[sid][t]
            if not acts:
                display_action_table[sid][t] = ""
            elif len(acts) == 1:
                display_action_table[sid][t] = acts[0]["display"]
            else:
                display_action_table[sid][t] = " / ".join(a["display"] for a in acts)

        display_goto_table[sid] = {}
        for nt in non_terminals:
            val = goto_table[sid][nt]
            display_goto_table[sid][nt] = str(val) if val is not None else ""

    return {
        "terminals": terminals,
        "non_terminals": non_terminals,
        "action_table": display_action_table,
        "goto_table": display_goto_table,
        "_raw_action_table": action_table,
        "_raw_goto_table": goto_table,
        "is_conflict_free": not has_conflicts,
        "is_slr1": not has_conflicts,
        "conflicts": conflicts,
        "conflict_count": len(conflicts),
        "shift_reduce_conflicts": sum(1 for c in conflicts if c["conflict_type"] == "Shift/Reduce"),
        "reduce_reduce_conflicts": sum(1 for c in conflicts if c["conflict_type"] == "Reduce/Reduce"),
    }

