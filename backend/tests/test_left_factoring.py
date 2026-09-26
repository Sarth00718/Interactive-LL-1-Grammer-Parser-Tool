from app.services.grammar_parser import parse_grammar_text
from app.services.left_factoring import left_factor


def test_simple_common_prefix():
    g = parse_grammar_text("S -> if E then S else S | if E then S\nE -> id")
    result = left_factor(g)
    new_g = result["grammar"]
    assert result["changed"] is True
    s_prods = [" ".join(p.rhs) for p in new_g.productions["S"]]
    assert len(s_prods) == 1
    assert s_prods[0].startswith("if E then S")


def test_no_factoring_needed():
    g = parse_grammar_text("S -> a | b")
    result = left_factor(g)
    assert result["changed"] is False


def test_multiple_common_prefixes_different_lengths():
    g = parse_grammar_text("S -> a b c | a b d | a e")
    result = left_factor(g)
    new_g = result["grammar"]
    assert result["changed"] is True
    # No two alternatives of S should share a first symbol after factoring
    firsts = [p.rhs[0] for p in new_g.productions["S"]]
    assert len(firsts) == len(set(firsts))
