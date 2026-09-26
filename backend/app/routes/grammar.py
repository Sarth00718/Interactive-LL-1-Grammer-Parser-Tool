from fastapi import APIRouter, HTTPException
from app.models.api_models import GrammarInput, CellExplainRequest, SetExplainRequest
from app.models.grammar import GrammarError
from app.services import grammar_parser, grammar_validator, transformations, first, follow, parsing_table, explanations
from app.utils.examples import EXAMPLES

router = APIRouter(prefix="/api", tags=["grammar"])


def _parse_or_400(body: GrammarInput):
    try:
        g = grammar_parser.parse_grammar_text(body.grammar_text, body.start_symbol)
        return g
    except GrammarError as e:
        raise HTTPException(status_code=400, detail=e.to_dict())


@router.post("/grammar/validate")
def validate(body: GrammarInput):
    g = _parse_or_400(body)
    result = grammar_validator.validate_grammar(g)
    return {"grammar": g.to_dict(), "validation": result}


@router.post("/grammar/analyze")
def analyze(body: GrammarInput):
    """Single comprehensive analysis endpoint: runs the entire pipeline."""
    g = _parse_or_400(body)
    return transformations.analyze_grammar(g)


@router.post("/grammar/transform")
def transform(body: GrammarInput):
    g = _parse_or_400(body)
    result = transformations.analyze_grammar(g)
    if result.get("stopped_after_validation"):
        return result
    return {
        "original_grammar": result["original_grammar"],
        "transform": result["transform"],
        "final_grammar": result["final_grammar"],
    }


@router.post("/grammar/first")
def get_first(body: GrammarInput):
    g = _parse_or_400(body)
    result = transformations.analyze_grammar(g)
    if result.get("stopped_after_validation"):
        return result
    return result["final_first"]


@router.post("/grammar/follow")
def get_follow(body: GrammarInput):
    g = _parse_or_400(body)
    result = transformations.analyze_grammar(g)
    if result.get("stopped_after_validation"):
        return result
    return result["final_follow"]


@router.post("/grammar/ll1")
def get_ll1(body: GrammarInput):
    g = _parse_or_400(body)
    result = transformations.analyze_grammar(g)
    if result.get("stopped_after_validation"):
        return result
    return result["ll1"]


@router.post("/grammar/table")
def get_table(body: GrammarInput):
    g = _parse_or_400(body)
    result = transformations.analyze_grammar(g)
    if result.get("stopped_after_validation"):
        return result
    return result["parsing_table"]


@router.post("/grammar/explain-cell")
def explain_cell(body: CellExplainRequest):
    g = _parse_or_400(GrammarInput(grammar_text=body.grammar_text, start_symbol=body.start_symbol))
    result = transformations.analyze_grammar(g)
    if result.get("stopped_after_validation"):
        raise HTTPException(status_code=400, detail=result["validation"])
    table_result = {
        "table": result["parsing_table"]["table"],
        "cell_reasons": result["parsing_table"]["cell_reasons"],
    }
    return explanations.explain_cell(table_result, body.non_terminal, body.terminal)


@router.post("/grammar/explain-first")
def explain_first_set(body: SetExplainRequest):
    g = _parse_or_400(GrammarInput(grammar_text=body.grammar_text, start_symbol=body.start_symbol))
    result = transformations.analyze_grammar(g)
    if result.get("stopped_after_validation"):
        raise HTTPException(status_code=400, detail=result["validation"])
    return explanations.explain_first(result["final_first"], body.non_terminal)


@router.post("/grammar/explain-follow")
def explain_follow_set(body: SetExplainRequest):
    g = _parse_or_400(GrammarInput(grammar_text=body.grammar_text, start_symbol=body.start_symbol))
    result = transformations.analyze_grammar(g)
    if result.get("stopped_after_validation"):
        raise HTTPException(status_code=400, detail=result["validation"])
    return explanations.explain_follow(result["final_follow"], body.non_terminal)


@router.get("/examples")
def get_examples():
    return EXAMPLES
