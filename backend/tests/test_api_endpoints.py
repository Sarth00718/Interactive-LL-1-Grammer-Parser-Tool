"""
test_api_endpoints.py

Tests all FastAPI routes for Top-Down and Bottom-Up endpoints.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "LL(1)" in data["methods"]
    assert "LALR(1)" in data["methods"]


def test_examples_endpoint():
    res = client.get("/api/examples")
    assert res.status_code == 200
    examples = res.json()
    assert isinstance(examples, list)
    assert len(examples) > 0


def test_grammar_validate():
    res = client.post("/api/grammar/validate", json={"grammar_text": "S -> a"})
    assert res.status_code == 200
    data = res.json()
    assert data["validation"]["is_valid"] is True


def test_ll1_analyze_and_parse():
    grammar = "E -> T E'\nE' -> + T E' | epsilon\nT -> F T'\nT' -> * F T' | epsilon\nF -> ( E ) | id"
    res_a = client.post("/api/parser/ll1/analyze", json={"grammar_text": grammar})
    assert res_a.status_code == 200
    assert res_a.json()["is_ll1"] is True

    res_p = client.post("/api/parser/ll1/parse", json={"grammar_text": grammar, "input_string": "id + id"})
    assert res_p.status_code == 200
    assert res_p.json()["accepted"] is True


def test_lr0_endpoints():
    grammar = "S -> ( S ) | a"
    res_a = client.post("/api/parser/lr0/analyze", json={"grammar_text": grammar})
    assert res_a.status_code == 200
    assert res_a.json()["is_conflict_free"] is True

    res_p = client.post("/api/parser/lr0/parse", json={"grammar_text": grammar, "input_string": "( a )"})
    assert res_p.status_code == 200
    assert res_p.json()["accepted"] is True


def test_slr_endpoints():
    grammar = "S -> A\nA -> A + id | id"
    res_a = client.post("/api/parser/slr/analyze", json={"grammar_text": grammar})
    assert res_a.status_code == 200
    assert res_a.json()["is_conflict_free"] is True

    res_p = client.post("/api/parser/slr/parse", json={"grammar_text": grammar, "input_string": "id + id"})
    assert res_p.status_code == 200
    assert res_p.json()["accepted"] is True


def test_clr_and_lalr_endpoints():
    grammar = "S -> L = R | R\nL -> * R | id\nR -> L"
    # CLR
    res_clr = client.post("/api/parser/clr/analyze", json={"grammar_text": grammar})
    assert res_clr.status_code == 200
    assert res_clr.json()["is_conflict_free"] is True

    # LALR
    res_lalr = client.post("/api/parser/lalr/analyze", json={"grammar_text": grammar})
    assert res_lalr.status_code == 200
    assert res_lalr.json()["is_conflict_free"] is True

    res_p = client.post("/api/parser/lalr/parse", json={"grammar_text": grammar, "input_string": "* id = id"})
    assert res_p.status_code == 200
    assert res_p.json()["accepted"] is True


def test_compare_endpoint():
    grammar = "S -> ( S ) | a"
    res = client.post("/api/parser/compare", json={"grammar_text": grammar})
    assert res.status_code == 200
    data = res.json()
    assert "comparison_matrix" in data
    assert len(data["comparison_matrix"]) == 5

