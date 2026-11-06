"""
test_comparison.py

Tests the 5-way parser comparison matrix across LL(1), LR(0), SLR(1), CLR(1), and LALR(1).
"""

from app.services.grammar.parser import parse_grammar_text
from app.services.bottom_up.comparison import compare_all_algorithms


def test_compare_dragon_book_grammar():
    g = parse_grammar_text("S -> L = R | R\nL -> * R | id\nR -> L")
    res = compare_all_algorithms(g)

    matrix = {row["method"]: row for row in res["comparison_matrix"]}

    # LL(1) is incompatible
    assert matrix["LL(1)"]["is_compatible"] is False
    # LR(0) is incompatible
    assert matrix["LR(0)"]["is_compatible"] is False
    # SLR(1) is incompatible
    assert matrix["SLR(1)"]["is_compatible"] is False
    # CLR(1) is compatible!
    assert matrix["CLR(1)"]["is_compatible"] is True
    # LALR(1) is compatible!
    assert matrix["LALR(1)"]["is_compatible"] is True

    # State counts
    assert matrix["LALR(1)"]["states_count"] < matrix["CLR(1)"]["states_count"]

