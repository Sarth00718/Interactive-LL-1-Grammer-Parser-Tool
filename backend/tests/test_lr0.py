"""
test_lr0.py

Tests LR(0) item generation, closure, GOTO, canonical collection, ACTION/GOTO tables,
and Shift/Reduce conflict detection.
"""

import pytest
from app.services.grammar.parser import parse_grammar_text
from app.services.bottom_up.augmented import augment_grammar
from app.services.bottom_up.lr0.automaton import LR0Automaton, closure_lr0, goto_lr0
from app.services.bottom_up.lr0.table import build_lr0_table
from app.services.bottom_up.item import LR0Item


def test_lr0_item_properties():
    item = LR0Item(prod_index=1, lhs="E", rhs=("E", "+", "T"), dot=1)
    assert item.next_symbol == "+"
    assert not item.is_reduction
    assert item.is_kernel

    advanced = item.advance()
    assert advanced.dot == 2
    assert advanced.next_symbol == "T"

    red_item = advanced.advance()
    assert red_item.dot == 3
    assert red_item.is_reduction
    assert red_item.next_symbol is None


def test_lr0_epsilon_item():
    item = LR0Item(prod_index=1, lhs="A", rhs=("\u03b5",), dot=0)
    assert item.is_epsilon
    assert item.is_reduction
    assert item.next_symbol is None


def test_lr0_closure_and_goto():
    g = parse_grammar_text("S -> ( S ) | a")
    aug = augment_grammar(g)
    init_item = LR0Item(prod_index=0, lhs=aug.augmented_start_symbol, rhs=("S",), dot=0)
    closure_items, steps = closure_lr0({init_item}, aug)

    # Must contain S' -> . S, S -> . ( S ), S -> . a
    lhs_set = {it.lhs for it in closure_items}
    assert aug.augmented_start_symbol in lhs_set
    assert "S" in lhs_set
    assert len(closure_items) == 3

    # GOTO on '('
    goto_items, kernel = goto_lr0(closure_items, "(", aug)
    assert len(kernel) == 1
    assert any(it.lhs == "S" and it.rhs == ("(", "S", ")") and it.dot == 1 for it in kernel)


def test_lr0_compatible_grammar_has_no_conflicts():
    g = parse_grammar_text("S -> ( S ) | a")
    aug = augment_grammar(g)
    automaton = LR0Automaton(aug)
    table_res = build_lr0_table(aug, automaton)

    assert table_res["is_lr0"] is True
    assert table_res["is_conflict_free"] is True
    assert table_res["conflict_count"] == 0
    assert len(automaton.states) > 0


def test_lr0_shift_reduce_conflict():
    # S -> A
    # A -> A + id | id
    # In LR(0), state with A -> A . + id and S -> A . has a shift/reduce conflict on '+'
    g = parse_grammar_text("S -> A\nA -> A + id | id")
    aug = augment_grammar(g)
    automaton = LR0Automaton(aug)
    table_res = build_lr0_table(aug, automaton)

    assert table_res["is_lr0"] is False
    assert table_res["is_conflict_free"] is False
    assert table_res["shift_reduce_conflicts"] > 0
    assert any(c["conflict_type"] == "Shift/Reduce" for c in table_res["conflicts"])


def test_ambiguous_expression_shift_reduce():
    g = parse_grammar_text("E -> E + E | id")
    aug = augment_grammar(g)
    automaton = LR0Automaton(aug)
    table_res = build_lr0_table(aug, automaton)

    assert table_res["is_lr0"] is False
    assert table_res["shift_reduce_conflicts"] > 0


def test_reduce_reduce_conflict():
    g = parse_grammar_text("S -> A a | B a\nA -> id\nB -> id")
    aug = augment_grammar(g)
    automaton = LR0Automaton(aug)
    table_res = build_lr0_table(aug, automaton)

    assert table_res["is_lr0"] is False
    assert table_res["reduce_reduce_conflicts"] > 0
    assert any(c["conflict_type"] == "Reduce/Reduce" for c in table_res["conflicts"])
