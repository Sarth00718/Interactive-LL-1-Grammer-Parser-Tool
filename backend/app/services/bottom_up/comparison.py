"""
comparison.py

Runs multi-algorithm comparison across LL(1), LR(0), SLR(1), CLR(1), and LALR(1).
Computes compatibility matrix, conflict distributions, state metrics, and theoretical insights.
"""

from typing import Dict, Any, List
from app.models.grammar import Grammar
from app.services.grammar.transformations import analyze_grammar
from app.services.bottom_up.analyzer import analyze_bottom_up


def compare_all_algorithms(grammar: Grammar) -> Dict[str, Any]:
    """
    Analyzes the provided grammar using all five parsing methods:
    LL(1), LR(0), SLR(1), CLR(1), and LALR(1).
    """
    # 1. Top-Down LL(1) Analysis
    ll1_analysis = analyze_grammar(grammar)
    is_ll1 = False
    ll1_conflicts = []
    ll1_ff_count = 0
    ll1_ffol_count = 0

    if not ll1_analysis.get("stopped_after_validation"):
        ll1_info = ll1_analysis.get("ll1", {})
        is_ll1 = ll1_info.get("is_ll1", False)
        ll1_conflicts = ll1_info.get("conflicts", [])
        ll1_ff_count = sum(1 for c in ll1_conflicts if c.get("conflict_type") == "FIRST/FIRST")
        ll1_ffol_count = sum(1 for c in ll1_conflicts if c.get("conflict_type") == "FIRST/FOLLOW")

    # 2. Bottom-Up Analyses
    lr0_analysis = analyze_bottom_up(grammar, "LR0")
    slr1_analysis = analyze_bottom_up(grammar, "SLR1")
    clr1_analysis = analyze_bottom_up(grammar, "CLR1")
    lalr1_analysis = analyze_bottom_up(grammar, "LALR1")

    # Helper to extract bottom-up stats
    def extract_bu_row(name: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        stats = analysis.get("statistics", {})
        is_cf = analysis.get("is_conflict_free", False)
        return {
            "method": name,
            "type": "Bottom-Up",
            "is_compatible": is_cf,
            "conflict_free": is_cf,
            "states_count": stats.get("state_count", 0),
            "transitions_count": stats.get("transition_count", 0),
            "conflicts_count": stats.get("conflict_count", 0),
            "shift_reduce_conflicts": stats.get("shift_reduce_conflicts", 0),
            "reduce_reduce_conflicts": stats.get("reduce_reduce_conflicts", 0),
            "merge_induced_conflicts": stats.get("merge_induced_conflicts", 0),
        }

    comparison_rows = [
        {
            "method": "LL(1)",
            "type": "Top-Down",
            "is_compatible": is_ll1,
            "conflict_free": is_ll1,
            "states_count": None,
            "transitions_count": None,
            "conflicts_count": len(ll1_conflicts),
            "shift_reduce_conflicts": 0,
            "reduce_reduce_conflicts": 0,
            "first_first_conflicts": ll1_ff_count,
            "first_follow_conflicts": ll1_ffol_count,
            "notes": (
                "Predictive top-down parser. Requires left-factored grammar without left-recursion."
                if not is_ll1 else "Conflict-free LL(1) predictive parsing table."
            ),
        },
        extract_bu_row("LR(0)", lr0_analysis),
        extract_bu_row("SLR(1)", slr1_analysis),
        extract_bu_row("CLR(1)", clr1_analysis),
        extract_bu_row("LALR(1)", lalr1_analysis),
    ]

    # Theoretical insights
    theoretical_hierarchy = (
        "Power Hierarchy: LR(0) \u2282 SLR(1) \u2282 LALR(1) \u2282 CLR(1). "
        "LL(1) is neither a subset nor superset of the LR family; however, every LL(1) grammar is LR(1)."
    )

    return {
        "grammar_summary": {
            "start_symbol": grammar.start_symbol,
            "non_terminals_count": len(grammar.non_terminals),
            "terminals_count": len(grammar.terminals),
            "productions_count": len(grammar.all_productions()),
        },
        "comparison_matrix": comparison_rows,
        "theoretical_insights": theoretical_hierarchy,
        "details": {
            "LL1": {"is_compatible": is_ll1, "conflicts": ll1_conflicts},
            "LR0": {"is_compatible": lr0_analysis.get("is_conflict_free", False), "conflicts": lr0_analysis.get("conflicts", [])},
            "SLR1": {"is_compatible": slr1_analysis.get("is_conflict_free", False), "conflicts": slr1_analysis.get("conflicts", [])},
            "CLR1": {"is_compatible": clr1_analysis.get("is_conflict_free", False), "conflicts": clr1_analysis.get("conflicts", [])},
            "LALR1": {"is_compatible": lalr1_analysis.get("is_conflict_free", False), "conflicts": lalr1_analysis.get("conflicts", [])},
        },
    }

