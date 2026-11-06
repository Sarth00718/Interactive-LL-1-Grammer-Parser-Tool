"""
test_lalr.py

Tests LALR(1) core grouping, state merging, lookahead unioning, and
detection of merge-induced Reduce/Reduce conflicts (Dragon Book Example 4.55).
"""

from app.services.grammar.parser import parse_grammar_text
from app.services.top_down.first import compute_first_sets
from app.services.bottom_up.augmented import augment_grammar
from app.services.bottom_up.clr.automaton import CLR1Automaton
from app.services.bottom_up.clr.table import build_clr_table
from app.services.bottom_up.lalr.table import build_lalr_table


def test_lalr1_merges_states_on_dragon_book_grammar():
    # S -> L = R | R
    # L -> * R | id
    # R -> L
    g = parse_grammar_text("S -> L = R | R\nL -> * R | id\nR -> L")
    aug = augment_grammar(g)
    first_res = compute_first_sets(g)

    clr_auto = CLR1Automaton(aug, first_res["_internal_first_table"])
    clr_table = build_clr_table(aug, clr_auto)
    lalr_table = build_lalr_table(aug, clr_auto, clr_table["conflicts"])

    assert lalr_table["is_lalr1"] is True
    assert lalr_table["is_conflict_free"] is True
    assert lalr_table["conflict_count"] == 0
    # Merged states count is strictly less than CLR state count
    assert lalr_table["state_count"] < clr_auto.to_dict()["state_count"]
    assert len(lalr_table["merged_state_groups"]) > 0


def test_lalr1_merge_induced_reduce_reduce_conflict():
    # Classic Dragon Book Example 4.55:
    # S -> a A d | b B d | a B e | b A e
    # A -> c
    # B -> c
    # This grammar is CLR(1) compatible, but NOT LALR(1) due to merge-induced R/R conflict
    g = parse_grammar_text("S -> a A d | b B d | a B e | b A e\nA -> c\nB -> c")
    aug = augment_grammar(g)
    first_res = compute_first_sets(g)

    clr_auto = CLR1Automaton(aug, first_res["_internal_first_table"])
    clr_table = build_clr_table(aug, clr_auto)

    # In CLR(1), this grammar has NO conflicts
    assert clr_table["is_clr1"] is True
    assert clr_table["conflict_count"] == 0

    # In LALR(1), merging cores creates a merge-induced Reduce/Reduce conflict!
    lalr_table = build_lalr_table(aug, clr_auto, clr_table["conflicts"])
    assert lalr_table["is_lalr1"] is False
    assert lalr_table["merge_induced_conflicts"] > 0
    assert any("Merge-Induced" in c["conflict_type"] for c in lalr_table["conflicts"])

