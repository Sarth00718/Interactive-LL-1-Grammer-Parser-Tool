from app.services.grammar_parser import parse_grammar_text
from app.services.first import compute_first_sets
from app.services.follow import compute_follow_sets


def _follow_for(text):
    g = parse_grammar_text(text)
    f = compute_first_sets(g)
    fw = compute_follow_sets(g, f["_internal_first_table"])
    return g, fw


def test_follow_start_symbol_has_dollar():
    g, fw = _follow_for("S -> a")
    assert "$" in fw["follow_sets"]["S"]


def test_follow_nested_dependency():
    g, fw = _follow_for("S -> A b\nA -> a")
    assert fw["follow_sets"]["A"] == ["b"]


def test_follow_epsilon_propagation():
    g, fw = _follow_for("S -> A B\nA -> a | epsilon\nB -> b | epsilon")
    # A is followed by whatever can start B, plus FOLLOW(S) if B is nullable
    assert set(fw["follow_sets"]["A"]) == {"b", "$"}
    assert set(fw["follow_sets"]["B"]) == {"$"}


def test_follow_recursive_dependency():
    g, fw = _follow_for(
        "E -> T E'\nE' -> + T E' | epsilon\nT -> F T'\nT' -> * F T' | epsilon\nF -> ( E ) | id"
    )
    assert set(fw["follow_sets"]["E"]) == {"$", ")"}
    assert set(fw["follow_sets"]["T"]) == {"$", ")", "+"}
    assert set(fw["follow_sets"]["F"]) == {"$", ")", "+", "*"}
