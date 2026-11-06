from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from app.models.api_models import (
    ParseRequest,
    GrammarInput,
    BottomUpAnalysisRequest,
    BottomUpParseRequest,
    AlgorithmComparisonRequest,
)
from app.models.grammar import GrammarError
from app.services.grammar import parse_grammar_text, analyze_grammar
from app.services.top_down import (
    left_recursion,
    left_factoring,
    first,
    follow,
    parsing_table,
    run_predictive_parse,
    build_parse_tree,
)
from app.services.bottom_up import (
    analyze_bottom_up,
    parse_with_bottom_up,
    compare_all_algorithms,
)

router = APIRouter(prefix="/api/parser", tags=["parser"])


def _parse_grammar_or_400(grammar_text: str, start_symbol: Optional[str] = None):
    try:
        return parse_grammar_text(grammar_text, start_symbol)
    except GrammarError as e:
        raise HTTPException(status_code=400, detail=e.to_dict())


def _execute_ll1_parse(grammar_text: str, start_symbol: Optional[str], input_string: str) -> Dict[str, Any]:
    g = _parse_grammar_or_400(grammar_text, start_symbol)
    analysis = analyze_grammar(g)
    if analysis.get("stopped_after_validation"):
        raise HTTPException(status_code=400, detail=analysis["validation"])

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
            "parse_tree": None,
        }

    parse_result = run_predictive_parse(final_grammar, final_table["_internal_table"], input_string)
    tree_result = build_parse_tree(final_grammar, final_table["_internal_table"], input_string)

    return {
        "final_grammar": final_grammar.to_dict(),
        "tokens": parse_result["tokens"],
        "steps": parse_result["steps"],
        "accepted": parse_result["accepted"],
        "error": parse_result["error"],
        "parse_tree": tree_result["tree"] if parse_result["accepted"] else None,
    }


def _run_bottom_up_analysis(grammar_text: str, start_symbol: Optional[str], algorithm: str) -> Dict[str, Any]:
    grammar = _parse_grammar_or_400(grammar_text, start_symbol)
    result = analyze_bottom_up(grammar, algorithm)
    if result.get("stopped_after_validation"):
        raise HTTPException(status_code=400, detail=result["validation"])
    return {k: v for k, v in result.items() if not k.startswith("_internal")}


def _run_bottom_up_parse_endpoint(grammar_text: str, start_symbol: Optional[str], algorithm: str, input_string: str) -> Dict[str, Any]:
    grammar = _parse_grammar_or_400(grammar_text, start_symbol)
    return parse_with_bottom_up(grammar, algorithm, input_string)


# --- Legacy / Standard LL(1) Parsing Endpoint ---
@router.post("/parse")
def parse_input(body: ParseRequest):
    return _execute_ll1_parse(body.grammar_text, body.start_symbol, body.input_string)


# --- Top-Down LL(1) Endpoints ---
@router.post("/ll1/analyze")
def ll1_analyze(body: GrammarInput):
    g = _parse_grammar_or_400(body.grammar_text, body.start_symbol)
    res = analyze_grammar(g)
    # Include convenient top-level flags for API consistency
    if not res.get("stopped_after_validation"):
        res["is_ll1"] = res.get("ll1", {}).get("is_ll1", False)
        res["is_conflict_free"] = res["is_ll1"]
    return res


@router.post("/ll1/parse")
def ll1_parse(body: ParseRequest):
    return _execute_ll1_parse(body.grammar_text, body.start_symbol, body.input_string)


# --- Bottom-Up LR(0) Endpoints ---
@router.post("/lr0/analyze")
def lr0_analyze(body: GrammarInput):
    return _run_bottom_up_analysis(body.grammar_text, body.start_symbol, "LR0")


@router.post("/lr0/parse")
def lr0_parse(body: ParseRequest):
    return _run_bottom_up_parse_endpoint(body.grammar_text, body.start_symbol, "LR0", body.input_string)


# --- Bottom-Up SLR(1) Endpoints ---
@router.post("/slr/analyze")
def slr_analyze(body: GrammarInput):
    return _run_bottom_up_analysis(body.grammar_text, body.start_symbol, "SLR1")


@router.post("/slr/parse")
def slr_parse(body: ParseRequest):
    return _run_bottom_up_parse_endpoint(body.grammar_text, body.start_symbol, "SLR1", body.input_string)


# --- Bottom-Up CLR(1) Endpoints ---
@router.post("/clr/analyze")
def clr_analyze(body: GrammarInput):
    return _run_bottom_up_analysis(body.grammar_text, body.start_symbol, "CLR1")


@router.post("/clr/parse")
def clr_parse(body: ParseRequest):
    return _run_bottom_up_parse_endpoint(body.grammar_text, body.start_symbol, "CLR1", body.input_string)


# --- Bottom-Up LALR(1) Endpoints ---
@router.post("/lalr/analyze")
def lalr_analyze(body: GrammarInput):
    return _run_bottom_up_analysis(body.grammar_text, body.start_symbol, "LALR1")


@router.post("/lalr/parse")
def lalr_parse(body: ParseRequest):
    return _run_bottom_up_parse_endpoint(body.grammar_text, body.start_symbol, "LALR1", body.input_string)


# --- Comprehensive 5-Parser Comparison Endpoint ---
@router.post("/compare")
def compare_parsers(body: GrammarInput):
    grammar = _parse_grammar_or_400(body.grammar_text, body.start_symbol)
    return compare_all_algorithms(grammar)
