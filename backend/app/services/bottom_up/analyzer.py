"""
analyzer.py

Unified analysis orchestrator for Bottom-Up parsing algorithms (LR(0), SLR(1), CLR(1), LALR(1)).
Generates state automata, Action/Goto parsing tables, conflict diagnostics, and graph layouts.
"""

from typing import Dict, Any, List
import math
from app.models.grammar import Grammar
from app.services.grammar.validator import validate_grammar
from app.services.top_down.first import compute_first_sets
from app.services.top_down.follow import compute_follow_sets
from app.services.bottom_up.augmented import augment_grammar, AugmentedGrammar
from app.services.bottom_up.lr0.automaton import LR0Automaton
from app.services.bottom_up.lr0.table import build_lr0_table
from app.services.bottom_up.slr.table import build_slr_table
from app.services.bottom_up.clr.automaton import CLR1Automaton
from app.services.bottom_up.clr.table import build_clr_table
from app.services.bottom_up.lalr.table import build_lalr_table
from app.services.bottom_up.parsing.engine import run_bottom_up_parse

SUPPORTED_ALGORITHMS = {
    "LR0": {
        "id": "LR0",
        "name": "LR(0)",
        "full_name": "Simple LR with 0 Lookahead",
        "type": "Bottom-Up",
        "description": "Constructs canonical LR(0) item sets and places reductions unconditionally on all terminals.",
    },
    "SLR1": {
        "id": "SLR1",
        "name": "SLR(1)",
        "full_name": "Simple LR with 1 Lookahead",
        "type": "Bottom-Up",
        "description": "Uses the LR(0) DFA but restricts reduction placement strictly to terminals in FOLLOW(A).",
    },
    "CLR1": {
        "id": "CLR1",
        "name": "CLR(1)",
        "full_name": "Canonical LR with 1 Lookahead",
        "type": "Bottom-Up",
        "description": "Constructs LR(1) items carrying individual lookahead contexts, computing FIRST(beta a) during closure.",
    },
    "LALR1": {
        "id": "LALR1",
        "name": "LALR(1)",
        "full_name": "Look-Ahead LR with 1 Lookahead",
        "type": "Bottom-Up",
        "description": "Merges Canonical LR(1) states with identical LR(0) cores and unions lookaheads, retaining compact DFA size.",
    },
}


def _compute_graph_layout(states: List[Dict[str, Any]], transitions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes visual 2D layout coordinates for automaton states using layered BFS
    so nodes do not overlap when rendered in React Flow.
    """
    if not states:
        return {"nodes": [], "edges": []}

    adj: Dict[int, List[int]] = {s["id"]: [] for s in states}
    for tr in transitions:
        adj[tr["from_state"]].append(tr["to_state"])

    levels: Dict[int, int] = {0: 0}
    queue = [0]
    while queue:
        curr = queue.pop(0)
        curr_lvl = levels[curr]
        for neighbor in adj.get(curr, []):
            if neighbor not in levels:
                levels[neighbor] = curr_lvl + 1
                queue.append(neighbor)

    # Any unreachable states assigned to a final level
    max_lvl = max(levels.values()) if levels else 0
    for s in states:
        sid = s["id"]
        if sid not in levels:
            levels[sid] = max_lvl + 1

    level_nodes: Dict[int, List[int]] = {}
    for sid, lvl in levels.items():
        if lvl not in level_nodes:
            level_nodes[lvl] = []
        level_nodes[lvl].append(sid)

    node_positions: Dict[int, Dict[str, float]] = {}
    x_spacing = 340
    y_spacing = 260

    for lvl, sids in level_nodes.items():
        total = len(sids)
        y_offset_start = -((total - 1) * y_spacing) / 2
        for idx, sid in enumerate(sids):
            node_positions[sid] = {
                "x": lvl * x_spacing + 50,
                "y": y_offset_start + idx * y_spacing + 250,
            }

    graph_nodes = []
    for s in states:
        sid = s["id"]
        pos = node_positions.get(sid, {"x": sid * 100, "y": 100})
        raw = s.get("grouped_items") or s.get("items", [])
        item_texts = [
            it.get("text", str(it)) if isinstance(it, dict) else str(it)
            for it in raw
        ]
        s["item_texts"] = item_texts
        graph_nodes.append({
            "id": str(sid),
            "type": "stateNode",
            "position": pos,
            "data": {
                "state_id": sid,
                "label": s.get("label", f"I{sid}"),
                "items": s.get("items", []),
                "grouped_items": s.get("grouped_items", s.get("items", [])),
                "item_texts": item_texts,
                "is_start": s.get("is_start", False),
                "is_accepting": s.get("is_accepting", False),
            },
        })

    graph_edges = []
    seen_edges = set()
    for tr in transitions:
        src = str(tr["from_state"])
        tgt = str(tr["to_state"])
        sym = tr["symbol"]
        edge_key = (src, tgt, sym)
        if edge_key in seen_edges:
            continue
        seen_edges.add(edge_key)

        graph_edges.append({
            "id": f"e{src}-{tgt}-{sym}",
            "source": src,
            "target": tgt,
            "label": sym,
            "animated": tr.get("is_terminal", False),
            "style": {"stroke": "#4f46e5" if tr.get("is_terminal") else "#0ea5e9"},
        })

    return {"nodes": graph_nodes, "edges": graph_edges}


def analyze_bottom_up(grammar: Grammar, algorithm: str) -> Dict[str, Any]:
    """
    Performs full bottom-up analysis for LR0, SLR1, CLR1, or LALR1.
    """
    algo = algorithm.upper().replace("(", "").replace(")", "").replace("-", "")
    if algo not in SUPPORTED_ALGORITHMS:
        algo = "SLR1"

    validation = validate_grammar(grammar)
    if not validation["is_valid"]:
        return {
            "algorithm": algo,
            "original_grammar": grammar.to_dict(),
            "validation": validation,
            "stopped_after_validation": True,
        }

    # Augment grammar
    aug = augment_grammar(grammar)

    # Compute FIRST and FOLLOW
    first_res = compute_first_sets(grammar)
    first_table = first_res["_internal_first_table"]
    follow_res = compute_follow_sets(grammar, first_table)
    follow_sets = follow_res["_internal_follow_table"]

    automaton_dict: Dict[str, Any] = {}
    table_result: Dict[str, Any] = {}
    explanation = ""

    if algo == "LR0":
        lr0_auto = LR0Automaton(aug)
        table_result = build_lr0_table(aug, lr0_auto)
        automaton_dict = lr0_auto.to_dict()
        explanation = (
            "LR(0) parses without lookahead. Reductions are placed unconditionally on all terminals. "
            "It is the simplest bottom-up parser but susceptible to Shift/Reduce conflicts."
        )

    elif algo == "SLR1":
        lr0_auto = LR0Automaton(aug)
        table_result = build_slr_table(aug, lr0_auto, follow_sets)
        automaton_dict = lr0_auto.to_dict()
        explanation = (
            "SLR(1) constructs the exact same LR(0) automaton but restricts reduction placement "
            "for A -> alpha strictly to terminals in FOLLOW(A). This resolves many shift/reduce conflicts."
        )

    elif algo == "CLR1":
        clr_auto = CLR1Automaton(aug, first_table)
        table_result = build_clr_table(aug, clr_auto)
        automaton_dict = clr_auto.to_dict()
        explanation = (
            "Canonical LR(1) carries an individual lookahead terminal with each item [A -> alpha . beta, a]. "
            "This provides the maximum parsing power for LR grammars, though the state count is higher."
        )

    elif algo == "LALR1":
        clr_auto = CLR1Automaton(aug, first_table)
        clr_table = build_clr_table(aug, clr_auto)
        table_result = build_lalr_table(aug, clr_auto, clr_table["conflicts"])
        automaton_dict = {
            "states": table_result["states"],
            "transitions": table_result["transitions"],
            "state_count": table_result["state_count"],
            "transition_count": table_result["transition_count"],
        }
        explanation = (
            "LALR(1) identifies states in the Canonical LR(1) automaton with identical LR(0) cores, "
            "merges them, and unions their lookahead sets. This maintains the compact state count of LR(0) "
            "while retaining nearly the full parsing power of CLR(1)."
        )

    # Compute graph layout
    graph_layout = _compute_graph_layout(automaton_dict["states"], automaton_dict["transitions"])
    automaton_dict["graph_nodes"] = graph_layout["nodes"]
    automaton_dict["graph_edges"] = graph_layout["edges"]

    # Statistics
    stats = {
        "state_count": automaton_dict["state_count"],
        "transition_count": automaton_dict["transition_count"],
        "production_count": len(aug.productions),
        "conflict_count": table_result.get("conflict_count", 0),
        "shift_reduce_conflicts": table_result.get("shift_reduce_conflicts", 0),
        "reduce_reduce_conflicts": table_result.get("reduce_reduce_conflicts", 0),
        "merge_induced_conflicts": table_result.get("merge_induced_conflicts", 0),
    }

    # Clean parsing table for frontend
    clean_table = {
        "terminals": table_result["terminals"],
        "non_terminals": table_result["non_terminals"],
        "action_table": table_result["action_table"],
        "goto_table": table_result["goto_table"],
        "is_conflict_free": table_result["is_conflict_free"],
        "conflicts": table_result["conflicts"],
        "conflict_count": table_result["conflict_count"],
        "shift_reduce_conflicts": table_result["shift_reduce_conflicts"],
        "reduce_reduce_conflicts": table_result["reduce_reduce_conflicts"],
        "merge_induced_conflicts": table_result.get("merge_induced_conflicts", 0),
        "merged_state_groups": table_result.get("merged_state_groups", []),
    }

    return {
        "algorithm": algo,
        "algorithm_info": SUPPORTED_ALGORITHMS[algo],
        "original_grammar": grammar.to_dict(),
        "augmented_grammar": aug.to_dict(),
        "first_sets": first_res["first_sets"],
        "follow_sets": follow_res["follow_sets"],
        "automaton": automaton_dict,
        "parsing_table": clean_table,
        "is_conflict_free": table_result["is_conflict_free"],
        "conflicts": table_result["conflicts"],
        "statistics": stats,
        "explanation": explanation,
        "_internal_action_table": table_result["_raw_action_table"],
        "_internal_goto_table": table_result["_raw_goto_table"],
        "_internal_aug_grammar": aug,
    }


def parse_with_bottom_up(grammar: Grammar, algorithm: str, input_str: str) -> Dict[str, Any]:
    analysis = analyze_bottom_up(grammar, algorithm)
    if analysis.get("stopped_after_validation"):
        return {
            "accepted": False,
            "error": {"message": "Grammar validation failed."},
            "steps": [],
            "parse_tree": None,
        }

    raw_action = analysis["_internal_action_table"]
    raw_goto = analysis["_internal_goto_table"]
    aug_grammar = analysis["_internal_aug_grammar"]

    parse_result = run_bottom_up_parse(
        aug_grammar=aug_grammar,
        action_table=raw_action,
        goto_table=raw_goto,
        input_str=input_str,
    )

    return {
        "algorithm": analysis["algorithm"],
        "tokens": parse_result["tokens"],
        "steps": parse_result["steps"],
        "accepted": parse_result["accepted"],
        "error": parse_result["error"],
        "parse_tree": parse_result["parse_tree"],
        "step_count": parse_result["step_count"],
        "is_conflict_free": analysis["is_conflict_free"],
        "conflicts": analysis["conflicts"],
    }

