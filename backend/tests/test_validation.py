import pytest
from app.models.grammar import GrammarError
from app.services.grammar.parser import parse_grammar_text
from app.services.grammar.validator import validate_grammar


def test_missing_rhs_raises():
    with pytest.raises(GrammarError):
        parse_grammar_text("S -> A\nA ->")


def test_empty_grammar_raises():
    with pytest.raises(GrammarError):
        parse_grammar_text("")


def test_invalid_epsilon_placement_raises():
    with pytest.raises(GrammarError):
        parse_grammar_text("S -> a epsilon b")


def test_unreachable_symbol_warning():
    g = parse_grammar_text("S -> a\nX -> b")
    result = validate_grammar(g)
    assert result["is_valid"] is True
    assert any(w["type"] == "unreachable_symbol" for w in result["warnings"])


def test_duplicate_production_warning():
    g = parse_grammar_text("S -> a | a")
    result = validate_grammar(g)
    assert any(w["type"] == "duplicate_production" for w in result["warnings"])


def test_non_generating_symbol_warning():
    # A only produces A, cannot derive any terminal
    g = parse_grammar_text("S -> A\nA -> A")
    result = validate_grammar(g)
    assert any(w["type"] == "non_generating_symbol" for w in result["warnings"])


def test_quoted_terminals_parsing():
    g = parse_grammar_text("S -> 'id' '+' 'id'")
    assert "id" in g.terminals
    assert "+" in g.terminals
    assert "'id'" not in g.terminals
