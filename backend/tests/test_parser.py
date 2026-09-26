from app.services.grammar_parser import parse_grammar_text
from app.services import left_recursion, left_factoring, first, follow, parsing_table
from app.services.predictive_parser import run_predictive_parse


def _build(text):
    g = parse_grammar_text(text)
    rec = left_recursion.eliminate_left_recursion(g)
    fac = left_factoring.left_factor(rec["grammar"])
    final_g = fac["grammar"]
    final_g.renumber()
    ft = first.compute_first_sets(final_g)
    fw = follow.compute_follow_sets(final_g, ft["_internal_first_table"])
    tbl = parsing_table.build_parsing_table(final_g, ft["_internal_first_table"], fw["_internal_follow_table"])
    return final_g, tbl


ARITH = "E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id"


def test_valid_expression_accepted():
    g, tbl = _build(ARITH)
    res = run_predictive_parse(g, tbl["_internal_table"], "id + id * id")
    assert res["accepted"] is True


def test_invalid_expression_rejected():
    g, tbl = _build(ARITH)
    res = run_predictive_parse(g, tbl["_internal_table"], "id + * id")
    assert res["accepted"] is False
    assert res["error"] is not None


def test_unexpected_token_error_message():
    g, tbl = _build(ARITH)
    res = run_predictive_parse(g, tbl["_internal_table"], "id +")
    assert res["accepted"] is False


def test_empty_input_on_nullable_grammar():
    g, tbl = _build("S -> a | epsilon")
    res = run_predictive_parse(g, tbl["_internal_table"], "")
    assert res["accepted"] is True


def test_parenthesized_expression_accepted():
    g, tbl = _build(ARITH)
    res = run_predictive_parse(g, tbl["_internal_table"], "( id + id ) * id")
    assert res["accepted"] is True
