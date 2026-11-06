"""
test_clr.py

Tests Canonical LR(1) item sets, lookahead propagation via FIRST(beta a),
and CLR(1) conflict resolution.
"""

from app.services.grammar.parser import parse_grammar_text
from app.services.top_down.first import compute_first_sets
from app.services.bottom_up.augmented import augment_grammar
from app.services.bottom_up.clr.automaton import CLR1Automaton, first_of_sequence_with_lookahead
from app.services.bottom_up.clr.table import build_clr_table


def test_first_of_sequence_with_lookahead():
    first_table = {"T": {"*", "\u03b5"}, "id": {"id"}}
    # Sequence ('T',), lookahead '$' -> FIRST('T' '$') = {'*', '$'}
    res = first_of_sequence_with_lookahead(("T",), "$", first_table)
    assert res == {"*", "$"}

    # Sequence ('id',), lookahead '$' -> FIRST('id' '$') = {'id'}
    res2 = first_of_sequence_with_lookahead(("id",), "$", first_table)
    assert res2 == {"id"}


def test_clr1_succeeds_on_dragon_book_grammar():
    # S -> L = R | R
    # L -> * R | id
    # R -> L
    # Fails in SLR(1) but passes in CLR(1)
    g = parse_grammar_text("S -> L = R | R\nL -> * R | id\nR -> L")
    aug = augment_grammar(g)
    first_res = compute_first_sets(g)

    automaton = CLR1Automaton(aug, first_res["_internal_first_table"])
    table_res = build_clr_table(aug, automaton)

    assert table_res["is_clr1"] is True
    assert table_res["is_conflict_free"] is True
    assert table_res["conflict_count"] == 0
    # In Dragon Book, canonical LR(1) has more states than LR(0)
    assert automaton.to_dict()["state_count"] > 0

