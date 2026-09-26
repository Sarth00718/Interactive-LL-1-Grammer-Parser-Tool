from app.services.grammar_parser import parse_grammar_text
from app.services.transformations import analyze_grammar


def test_valid_ll1_grammar():
    g = parse_grammar_text(
        "E -> T E'\nE' -> + T E' | epsilon\nT -> F T'\nT' -> * F T' | epsilon\nF -> ( E ) | id"
    )
    res = analyze_grammar(g)
    assert res["ll1"]["is_ll1"] is True
    assert res["ll1"]["conflict_count"] == 0


def test_first_first_conflict():
    g = parse_grammar_text("S -> A | B\nA -> a\nB -> a")
    res = analyze_grammar(g)
    assert res["ll1"]["is_ll1"] is False
    assert res["ll1"]["conflicts"][0]["kind"] == "FIRST/FIRST"


def test_first_follow_conflict_dangling_else():
    g = parse_grammar_text("S -> if E then S else S | if E then S\nE -> id")
    res = analyze_grammar(g)
    assert res["ll1"]["is_ll1"] is False


def test_left_recursive_grammar_becomes_ll1_after_transform():
    g = parse_grammar_text("E -> E + T | T\nT -> id")
    res = analyze_grammar(g)
    assert res["ll1"]["is_ll1"] is True
