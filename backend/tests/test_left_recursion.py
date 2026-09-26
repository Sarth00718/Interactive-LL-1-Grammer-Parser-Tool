from app.services.grammar_parser import parse_grammar_text
from app.services.left_recursion import detect_left_recursion, eliminate_left_recursion


def test_direct_left_recursion_detected():
    g = parse_grammar_text("E -> E + T | T\nT -> id")
    result = detect_left_recursion(g)
    assert result["has_direct_left_recursion"] is True
    assert result["has_indirect_left_recursion"] is False


def test_no_left_recursion():
    g = parse_grammar_text("E -> T E'\nE' -> + T | epsilon\nT -> id")
    result = detect_left_recursion(g)
    assert result["has_direct_left_recursion"] is False


def test_indirect_left_recursion_detected():
    g = parse_grammar_text("A -> B a | c\nB -> A b | d")
    result = detect_left_recursion(g)
    assert result["has_indirect_left_recursion"] is True


def test_eliminate_direct_left_recursion():
    g = parse_grammar_text("E -> E + T | T\nT -> id")
    result = eliminate_left_recursion(g)
    new_g = result["grammar"]
    detect_after = detect_left_recursion(new_g)
    assert detect_after["has_direct_left_recursion"] is False
    assert "E'" in new_g.non_terminals
    # E should now start with T (beta), not itself
    for p in new_g.productions["E"]:
        assert p.rhs[0] != "E"


def test_eliminate_multiple_recursive_alternatives():
    g = parse_grammar_text("E -> E + T | E - T | T\nT -> id")
    result = eliminate_left_recursion(g)
    new_g = result["grammar"]
    detect_after = detect_left_recursion(new_g)
    assert detect_after["has_direct_left_recursion"] is False


def test_eliminate_indirect_left_recursion():
    g = parse_grammar_text("A -> B a | c\nB -> A b | d")
    result = eliminate_left_recursion(g)
    new_g = result["grammar"]
    detect_after = detect_left_recursion(new_g)
    assert detect_after["has_direct_left_recursion"] is False
    assert detect_after["has_indirect_left_recursion"] is False
