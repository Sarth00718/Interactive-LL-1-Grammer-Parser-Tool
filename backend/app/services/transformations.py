"""
transformations.py

Orchestrates the full pipeline described in the project spec:

    Original CFG
      -> Validate
      -> Symbol identification
      -> Original grammar diagnostics (left recursion, LL(1)-ability, first/follow -- diagnostic only)
      -> Eliminate left recursion
      -> Left factor
      -> FINAL transformed grammar
      -> FIRST (on final grammar)
      -> FOLLOW (on final grammar)
      -> LL(1) analysis
      -> LL(1) parsing table
      -> (parsing / parse tree happen in separate calls, using the final grammar + table)

This module is the "single comprehensive analysis" entry point the API
route calls, matching the API design principle that the backend, not the
frontend, is the single source of truth.
"""

from typing import Dict
from app.models.grammar import Grammar, GrammarError
from app.services import grammar_validator, left_recursion, left_factoring, first, follow, parsing_table, ll1_analyzer


def analyze_grammar(g: Grammar) -> Dict:
    validation = grammar_validator.validate_grammar(g)
    if not validation["is_valid"]:
        return {
            "original_grammar": g.to_dict(),
            "validation": validation,
            "stopped_after_validation": True,
        }

    # --- Original grammar diagnostics (educational only; NOT used for final table) ---
    original_recursion = left_recursion.detect_left_recursion(g)
    original_first = first.compute_first_sets(g)
    original_follow = follow.compute_follow_sets(g, original_first["_internal_first_table"])
    original_table = parsing_table.build_parsing_table(
        g, original_first["_internal_first_table"], original_follow["_internal_follow_table"]
    )
    original_ll1 = ll1_analyzer.classify_and_summarize(original_table)

    original_diagnostics = {
        "left_recursion": original_recursion,
        "first_sets": original_first["first_sets"],
        "follow_sets": original_follow["follow_sets"],
        "ll1_status_if_used_directly": original_ll1["summary"],
        "note": (
            "This FIRST/FOLLOW/LL(1) analysis is computed directly on the ORIGINAL grammar "
            "for educational comparison only. It is NOT used to build the final parsing table "
            "if the grammar required transformation."
        ),
    }

    # --- Transform: eliminate left recursion, then left factor ---
    recursion_elim = left_recursion.eliminate_left_recursion(g)
    grammar_after_recursion = recursion_elim["grammar"]

    factoring_result = left_factoring.left_factor(grammar_after_recursion)
    final_grammar = factoring_result["grammar"]
    final_grammar.renumber()

    was_transformed = recursion_elim["changed"] or factoring_result["changed"]

    # --- FIRST / FOLLOW / LL(1) table on the FINAL grammar ---
    final_first = first.compute_first_sets(final_grammar)
    final_follow = follow.compute_follow_sets(final_grammar, final_first["_internal_first_table"])
    final_table = parsing_table.build_parsing_table(
        final_grammar, final_first["_internal_first_table"], final_follow["_internal_follow_table"]
    )
    final_ll1 = ll1_analyzer.classify_and_summarize(final_table)

    return {
        "original_grammar": g.to_dict(),
        "validation": validation,
        "stopped_after_validation": False,
        "original_diagnostics": original_diagnostics,
        "transform": {
            "was_transformed": was_transformed,
            "left_recursion_elimination_steps": recursion_elim["steps"],
            "left_factoring_steps": factoring_result["steps"],
            "grammar_after_recursion_elimination": grammar_after_recursion.to_dict(),
        },
        "final_grammar": final_grammar.to_dict(),
        "final_first": {"first_sets": final_first["first_sets"], "explanations": final_first["explanations"]},
        "final_follow": {"follow_sets": final_follow["follow_sets"], "explanations": final_follow["explanations"]},
        "ll1": final_ll1,
        "parsing_table": {
            "columns": final_table["columns"],
            "table": final_table["table"],
            "cell_reasons": final_table["cell_reasons"],
            "conflicts": final_table["conflicts"],
            "is_ll1": final_table["is_ll1"],
        },
    }
