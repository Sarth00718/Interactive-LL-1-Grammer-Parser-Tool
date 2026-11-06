"""
bottom_up.py

FastAPI routes for Bottom-Up Parsing (LR0, SLR1, CLR1, LALR1) and algorithm comparison.
"""

from fastapi import APIRouter, HTTPException
from app.models.api_models import (
    BottomUpAnalysisRequest,
    BottomUpParseRequest,
    AlgorithmComparisonRequest,
)
from app.models.grammar import GrammarError
from app.services.grammar.parser import parse_grammar_text
from app.services.bottom_up.analyzer import (
    analyze_bottom_up,
    parse_with_bottom_up,
    SUPPORTED_ALGORITHMS,
)
from app.services.bottom_up.comparison import compare_all_algorithms
from app.utils.examples import EXAMPLES

router = APIRouter(prefix="/api/bottom-up", tags=["bottom-up"])


def _parse_grammar_or_400(grammar_text: str, start_symbol: str = None):
    try:
        return parse_grammar_text(grammar_text, start_symbol)
    except GrammarError as e:
        raise HTTPException(status_code=400, detail=e.to_dict())


@router.get("/algorithms")
def get_algorithms():
    """Returns supported bottom-up algorithms and metadata."""
    return SUPPORTED_ALGORITHMS


@router.get("/examples")
def get_bottom_up_examples():
    """Returns demonstration examples with category, compatibility, and learning objectives."""
    return EXAMPLES


@router.post("/analyze")
def analyze(body: BottomUpAnalysisRequest):
    """
    Performs full bottom-up analysis (automaton, parsing table, conflict detection)
    for the requested algorithm (LR0, SLR1, CLR1, LALR1).
    """
    grammar = _parse_grammar_or_400(body.grammar_text, body.start_symbol)
    result = analyze_bottom_up(grammar, body.algorithm)
    if result.get("stopped_after_validation"):
        raise HTTPException(status_code=400, detail=result["validation"])

    # Clean out internal objects before returning JSON
    cleaned = {k: v for k, v in result.items() if not k.startswith("_internal")}
    return cleaned


@router.post("/parse")
def parse(body: BottomUpParseRequest):
    """
    Executes shift-reduce parsing using the selected bottom-up algorithm.
    Returns step-by-step trace and parse tree generated directly from actual parser actions.
    """
    grammar = _parse_grammar_or_400(body.grammar_text, body.start_symbol)
    result = parse_with_bottom_up(grammar, body.algorithm, body.input_string)
    return result


@router.post("/compare")
def compare(body: AlgorithmComparisonRequest):
    """
    Dynamically compares LL(1), LR(0), SLR(1), CLR(1), and LALR(1) on the provided grammar.
    """
    grammar = _parse_grammar_or_400(body.grammar_text, body.start_symbol)
    return compare_all_algorithms(grammar)
