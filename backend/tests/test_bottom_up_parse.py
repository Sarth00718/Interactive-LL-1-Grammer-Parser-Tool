"""
test_bottom_up_parse.py

Tests table-driven shift-reduce execution, dynamic parse tree generation,
syntax error diagnostics, and epsilon reductions.
"""

from app.services.grammar.parser import parse_grammar_text
from app.services.bottom_up.analyzer import parse_with_bottom_up


def test_lr0_parsing_valid_input():
    g = parse_grammar_text("S -> ( S ) | a")
    result = parse_with_bottom_up(g, "LR0", "( ( a ) )")

    assert result["accepted"] is True
    assert result["error"] is None
    assert len(result["steps"]) > 0
    assert result["parse_tree"] is not None
    assert result["parse_tree"]["symbol"] == "S"


def test_slr1_parsing_valid_input_and_tree():
    g = parse_grammar_text("S -> A\nA -> A + id | id")
    result = parse_with_bottom_up(g, "SLR1", "id + id")

    assert result["accepted"] is True
    assert result["error"] is None
    tree = result["parse_tree"]
    assert tree is not None
    assert tree["symbol"] == "S"
    assert len(tree["children"]) == 1
    a_node = tree["children"][0]
    assert a_node["symbol"] == "A"
    # A -> A + id has 3 children
    assert len(a_node["children"]) == 3


def test_bottom_up_syntax_error():
    g = parse_grammar_text("S -> ( S ) | a")
    result = parse_with_bottom_up(g, "LR0", "( a ) )")

    assert result["accepted"] is False
    assert result["error"] is not None
    assert "Unexpected token" in result["error"]["message"]
    assert result["parse_tree"] is None


def test_bottom_up_epsilon_reduction():
    # Epsilon grammar
    g = parse_grammar_text("S -> A a\nA -> \u03b5")
    result = parse_with_bottom_up(g, "SLR1", "a")

    assert result["accepted"] is True
    tree = result["parse_tree"]
    assert tree is not None
    assert tree["symbol"] == "S"
    a_child = tree["children"][0]
    assert a_child["symbol"] == "A"
    # Epsilon child
    assert a_child["children"][0]["symbol"] == "\u03b5"

