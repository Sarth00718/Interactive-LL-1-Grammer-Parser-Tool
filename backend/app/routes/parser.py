from fastapi import APIRouter, HTTPException
from app.models.api_models import ParseRequest, GrammarInput
from app.models.grammar import GrammarError
from app.services import grammar_parser, transformations, parse_tree

router = APIRouter(prefix="/api", tags=["parser"])


@router.post("/parser/parse")
def parse_input(body: ParseRequest):
    try:
        g = grammar_parser.parse_grammar_text(body.grammar_text, body.start_symbol)
    except GrammarError as e:
        raise HTTPException(status_code=400, detail=e.to_dict())

    analysis = transformations.analyze_grammar(g)
    if analysis.get("stopped_after_validation"):
        raise HTTPException(status_code=400, detail=analysis["validation"])

    # Rebuild the final grammar + internal table objects (Production objects,
    # not the JSON-serializable strings) needed to actually run the parser.
    from app.services import left_recursion, left_factoring, first, follow, parsing_table

    recursion_elim = left_recursion.eliminate_left_recursion(g)
    factoring_result = left_factoring.left_factor(recursion_elim["grammar"])
    final_grammar = factoring_result["grammar"]
    final_grammar.renumber()

    final_first = first.compute_first_sets(final_grammar)
    final_follow = follow.compute_follow_sets(final_grammar, final_first["_internal_first_table"])
    final_table = parsing_table.build_parsing_table(
        final_grammar, final_first["_internal_first_table"], final_follow["_internal_follow_table"]
    )

    if not final_table["is_ll1"]:
        return {
            "accepted": False,
            "error": {
                "message": (
                    "This grammar is not LL(1) (parsing-table conflicts exist), so predictive "
                    "parsing cannot proceed deterministically. See the LL(1) tab for conflict details."
                )
            },
            "steps": [],
            "final_grammar": final_grammar.to_dict(),
            "conflicts": final_table["conflicts"],
        }

    from app.services.predictive_parser import run_predictive_parse

    parse_result = run_predictive_parse(final_grammar, final_table["_internal_table"], body.input_string)
    tree_result = parse_tree.build_parse_tree(final_grammar, final_table["_internal_table"], body.input_string)

    return {
        "final_grammar": final_grammar.to_dict(),
        "tokens": parse_result["tokens"],
        "steps": parse_result["steps"],
        "accepted": parse_result["accepted"],
        "error": parse_result["error"],
        "parse_tree": tree_result["tree"] if parse_result["accepted"] else None,
    }
