from app.services.grammar_parser import parse_grammar_text
from app.services.first import compute_first_sets


def test_first_simple_terminals():
    g = parse_grammar_text("S -> a b")
    result = compute_first_sets(g)
    assert result["first_sets"]["S"] == ["a"]


def test_first_with_epsilon():
    g = parse_grammar_text("S -> a | epsilon")
    result = compute_first_sets(g)
    assert set(result["first_sets"]["S"]) == {"a", "\u03b5"}


def test_first_nullable_chain():
    g = parse_grammar_text("S -> A B\nA -> a | epsilon\nB -> b | epsilon")
    result = compute_first_sets(g)
    assert set(result["first_sets"]["S"]) == {"a", "b", "\u03b5"}


def test_first_multiple_productions():
    g = parse_grammar_text("F -> ( E )\nF -> id\nE -> F")
    result = compute_first_sets(g)
    assert set(result["first_sets"]["F"]) == {"(", "id"}
    assert set(result["first_sets"]["E"]) == {"(", "id"}


def test_first_final_arithmetic_grammar():
    g = parse_grammar_text(
        "E -> T E'\nE' -> + T E' | epsilon\nT -> F T'\nT' -> * F T' | epsilon\nF -> ( E ) | id"
    )
    result = compute_first_sets(g)
    assert set(result["first_sets"]["E"]) == {"(", "id"}
    assert set(result["first_sets"]["E'"]) == {"+", "\u03b5"}
    assert set(result["first_sets"]["T"]) == {"(", "id"}
    assert set(result["first_sets"]["T'"]) == {"*", "\u03b5"}
    assert set(result["first_sets"]["F"]) == {"(", "id"}
