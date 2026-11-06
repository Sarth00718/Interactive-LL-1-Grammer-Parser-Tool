"""
test_slr.py

Tests SLR(1) parsing table construction, FOLLOW-based reduction placement,
and shift/reduce conflict resolution.
"""

from app.services.grammar.parser import parse_grammar_text
from app.services.top_down.first import compute_first_sets
from app.services.top_down.follow import compute_follow_sets
from app.services.bottom_up.augmented import augment_grammar
from app.services.bottom_up.lr0.automaton import LR0Automaton
from app.services.bottom_up.lr0.table import build_lr0_table
from app.services.bottom_up.slr.table import build_slr_table


def test_slr1_resolves_lr0_conflict():
    # S -> A
    # A -> A + id | id
    # Fails in LR(0) but succeeds in SLR(1)
    g = parse_grammar_text("S -> A\nA -> A + id | id")
    aug = augment_grammar(g)
    automaton = LR0Automaton(aug)

    lr0_table = build_lr0_table(aug, automaton)
    assert lr0_table["is_lr0"] is False

    first_res = compute_first_sets(g)
    follow_res = compute_follow_sets(g, first_res["_internal_first_table"])
    slr_table = build_slr_table(aug, automaton, follow_res["_internal_follow_table"])

    assert slr_table["is_slr1"] is True
    assert slr_table["is_conflict_free"] is True
    assert slr_table["conflict_count"] == 0


def test_slr1_dragon_book_grammar_fails():
    # S -> L = R | R
    # L -> * R | id
    # R -> L
    # Classic grammar that is NOT SLR(1) due to S/R conflict on '='
    g = parse_grammar_text("S -> L = R | R\nL -> * R | id\nR -> L")
    aug = augment_grammar(g)
    automaton = LR0Automaton(aug)

    first_res = compute_first_sets(g)
    follow_res = compute_follow_sets(g, first_res["_internal_first_table"])
    slr_table = build_slr_table(aug, automaton, follow_res["_internal_follow_table"])

    assert slr_table["is_slr1"] is False
    assert slr_table["shift_reduce_conflicts"] > 0
    # Conflict occurs on '='
    assert any(c["symbol"] == "=" and c["conflict_type"] == "Shift/Reduce" for c in slr_table["conflicts"])

