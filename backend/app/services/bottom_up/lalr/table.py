"""
table.py

Constructs the LALR(1) parser by:
1. Generating canonical LR(1) states and transitions.
2. Grouping states with identical LR(0) cores.
3. Merging states, unioning their lookaheads, and reconstructing transitions.
4. Building ACTION and GOTO tables.
5. Detecting conflicts and explaining the effects of merging (including merge-induced Reduce/Reduce conflicts).
"""

from typing import Dict, List, Set, Tuple, Any
from app.models.grammar import END_MARKER
from app.services.bottom_up.augmented import AugmentedGrammar
from app.services.bottom_up.clr.automaton import CLR1Automaton
from app.services.bottom_up.item import LR0Item


def build_lalr_table(
    aug_grammar: AugmentedGrammar,
    clr_automaton: CLR1Automaton,
    clr_conflicts: List[Dict[str, Any]]
) -> Dict[str, Any]:
    terminals = [t for t in aug_grammar.terminals if t != "$"] + ["$"]
    non_terminals = [nt for nt in aug_grammar.non_terminals if nt != aug_grammar.augmented_start_symbol]

    # 1. Group CLR(1) states by their LR(0) core
    core_to_clr_states: Dict[frozenset, List[int]] = {}
    for state in clr_automaton.states:
        sid = state["id"]
        # LR(0) core is set of (prod_index, dot)
        core = frozenset((it["prod_index"], it["dot"]) for it in state["items"])
        if core not in core_to_clr_states:
            core_to_clr_states[core] = []
        core_to_clr_states[core].append(sid)

    # 2. Assign deterministic merged state IDs (ordered by the lowest CLR state ID in each group)
    sorted_groups = sorted(core_to_clr_states.values(), key=lambda g: g[0])
    clr_to_lalr: Dict[int, int] = {}
    merged_states: List[Dict[str, Any]] = []

    for lalr_id, clr_group in enumerate(sorted_groups):
        for clr_id in clr_group:
            clr_to_lalr[clr_id] = lalr_id

        # Merge items and union lookaheads
        merged_items_dict: Dict[Tuple[int, int], Dict[str, Any]] = {}

        for clr_id in clr_group:
            clr_state = clr_automaton.states[clr_id]
            for it in clr_state["items"]:
                key = (it["prod_index"], it["dot"])
                if key not in merged_items_dict:
                    merged_items_dict[key] = {
                        "prod_index": it["prod_index"],
                        "lhs": it["lhs"],
                        "rhs": it["rhs"],
                        "dot": it["dot"],
                        "lookaheads": set(),
                        "is_reduction": it["is_reduction"],
                        "is_kernel": it["is_kernel"],
                        "next_symbol": it["next_symbol"],
                    }
                merged_items_dict[key]["lookaheads"].add(it["lookahead"])

        merged_items_list = []
        for key in sorted(merged_items_dict.keys()):
            entry = merged_items_dict[key]
            las = sorted(entry["lookaheads"])
            core_obj = LR0Item(
                prod_index=entry["prod_index"],
                lhs=entry["lhs"],
                rhs=tuple(entry["rhs"]),
                dot=entry["dot"],
            )
            merged_items_list.append({
                "prod_index": entry["prod_index"],
                "lhs": entry["lhs"],
                "rhs": entry["rhs"],
                "dot": entry["dot"],
                "lookaheads": las,
                "text": f"[{core_obj}, {', '.join(las)}]",
                "is_reduction": entry["is_reduction"],
                "is_kernel": entry["is_kernel"],
                "next_symbol": entry["next_symbol"],
            })

        is_start = 0 in clr_group
        aug_start = aug_grammar.augmented_start_symbol
        orig_start = aug_grammar.start_symbol
        is_accepting = any(clr_automaton.states[cid]["is_accepting"] for cid in clr_group)

        if len(clr_group) > 1:
            label = f"I{'_'.join(str(cid) for cid in clr_group)}"
        else:
            label = f"I{clr_group[0]}"

        merged_states.append({
            "id": lalr_id,
            "label": label,
            "merged_from": clr_group,
            "items": merged_items_list,
            "kernel_items": [it for it in merged_items_list if it["is_kernel"]],
            "non_kernel_items": [it for it in merged_items_list if not it["is_kernel"]],
            "is_start": is_start,
            "is_accepting": is_accepting,
        })

    # 3. Reconstruct transitions between merged states
    transition_set: Set[Tuple[int, int, str, bool]] = set()
    for tr in clr_automaton.transitions:
        m_from = clr_to_lalr[tr["from_state"]]
        m_to = clr_to_lalr[tr["to_state"]]
        sym = tr["symbol"]
        is_term = tr["is_terminal"]
        transition_set.add((m_from, m_to, sym, is_term))

    lalr_transitions = [
        {"from_state": m_from, "to_state": m_to, "symbol": sym, "is_terminal": is_term}
        for (m_from, m_to, sym, is_term) in sorted(transition_set)
    ]

    # 4. Construct ACTION and GOTO tables
    action_table: Dict[int, Dict[str, List[Dict[str, Any]]]] = {
        s["id"]: {t: [] for t in terminals} for s in merged_states
    }
    goto_table: Dict[int, Dict[str, Any]] = {
        s["id"]: {nt: None for nt in non_terminals} for s in merged_states
    }

    # Transitions -> Shift and GOTO
    for tr in lalr_transitions:
        src = tr["from_state"]
        tgt = tr["to_state"]
        sym = tr["symbol"]

        if sym in terminals:
            action_table[src][sym].append({
                "type": "shift",
                "target": tgt,
                "display": f"s{tgt}",
                "reason": f"Transition on terminal '{sym}' leads to state {merged_states[tgt]['label']}.",
            })
        elif sym in non_terminals:
            goto_table[src][sym] = tgt

    # Reductions and Accept from merged items
    aug_start = aug_grammar.augmented_start_symbol
    orig_start = aug_grammar.start_symbol

    for state in merged_states:
        sid = state["id"]
        for it in state["items"]:
            lhs = it["lhs"]
            rhs = it["rhs"]
            prod_idx = it["prod_index"]
            is_red = it["is_reduction"]
            lookaheads = it["lookaheads"]

            if not is_red:
                continue

            # Accept item
            if lhs == aug_start and rhs == [orig_start] and END_MARKER in lookaheads:
                action_table[sid]["$"].append({
                    "type": "accept",
                    "display": "acc",
                    "reason": f"Augmented start symbol completed ({lhs} -> {orig_start} \u2022). Accept on end marker $.",
                })

            if prod_idx == 0:
                continue

            for la in lookaheads:
                if la in terminals:
                    action_table[sid][la].append({
                        "type": "reduce",
                        "production_index": prod_idx,
                        "lhs": lhs,
                        "rhs": rhs,
                        "display": f"r{prod_idx}",
                        "reason": f"LALR(1) item [{lhs} -> {' '.join(rhs)} \u2022, {la}] (merged lookahead) prescribes reduction on '{la}'.",
                    })

    # 5. Conflict detection and Merge-Induced analysis
    conflicts: List[Dict[str, Any]] = []
    has_conflicts = False

    clr_conflict_signatures = set()
    for c in clr_conflicts:
        clr_conflict_signatures.add((c["conflict_type"], c["symbol"]))

    for state in merged_states:
        sid = state["id"]
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
                        f"State {state['label']} has a Shift/Reduce conflict on '{t}': can shift ({shift_targets}) or reduce ({reduce_prods})."
                    )
                elif len(reduces) > 1:
                    is_merge_induced = (
                        len(state["merged_from"]) > 1 and
                        ("Reduce/Reduce", t) not in clr_conflict_signatures
                    )
                    c_type = "Merge-Induced Reduce/Reduce" if is_merge_induced else "Reduce/Reduce"
                    reduce_prods = ", ".join([f"r{r['production_index']} ({r['lhs']} -> {' '.join(r['rhs'])})" for r in reduces])
                    if is_merge_induced:
                        orig_ids = ", ".join(f"I{cid}" for cid in state["merged_from"])
                        expl = (
                            f"Merge-Induced Reduce/Reduce conflict on '{t}' in {state['label']} ({reduce_prods}). "
                            f"In CLR(1), the constituent states ({orig_ids}) had disjoint lookaheads. "
                            f"Merging their identical LR(0) cores unified lookaheads on '{t}', creating a conflict not present in CLR(1)."
                        )
                    else:
                        expl = (
                            f"State {state['label']} has a Reduce/Reduce conflict on '{t}' between: {reduce_prods}."
                        )
                else:
                    c_type = "Action Conflict"
                    expl = f"State {state['label']} has {len(acts)} competing actions on '{t}'."

                conflicts.append({
                    "state": sid,
                    "state_label": state["label"],
                    "symbol": t,
                    "conflict_type": c_type,
                    "actions": acts,
                    "explanation": expl,
                })

    # Display tables
    display_action_table: Dict[int, Dict[str, str]] = {}
    display_goto_table: Dict[int, Dict[str, str]] = {}

    for state in merged_states:
        sid = state["id"]
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
        "states": merged_states,
        "transitions": lalr_transitions,
        "state_count": len(merged_states),
        "transition_count": len(lalr_transitions),
        "action_table": display_action_table,
        "goto_table": display_goto_table,
        "_raw_action_table": action_table,
        "_raw_goto_table": goto_table,
        "is_conflict_free": not has_conflicts,
        "is_lalr1": not has_conflicts,
        "conflicts": conflicts,
        "conflict_count": len(conflicts),
        "shift_reduce_conflicts": sum(1 for c in conflicts if "Shift/Reduce" in c["conflict_type"]),
        "reduce_reduce_conflicts": sum(1 for c in conflicts if "Reduce/Reduce" in c["conflict_type"]),
        "merge_induced_conflicts": sum(1 for c in conflicts if "Merge-Induced" in c["conflict_type"]),
        "merged_state_groups": [
            {"lalr_state": s["id"], "label": s["label"], "clr_states": s["merged_from"]}
            for s in merged_states if len(s["merged_from"]) > 1
        ],
    }

