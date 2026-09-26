# Architecture

## Pipeline

```
Original CFG (raw text)
        │
        ▼
grammar_parser.py        — text → internal Grammar object (Production list per LHS)
        │
        ▼
grammar_validator.py     — structural checks: empty LHS/RHS, duplicate productions,
        │                   unreachable non-terminals, missing productions
        ▼
left_recursion.py        — detect_left_recursion(): direct + indirect (cycle detection
        │                   on the "can-start-with" graph)
        │
        │  [Original Grammar Diagnostics — FIRST/FOLLOW/LL(1) computed directly on
        │   this untransformed grammar too, but only as an educational comparison;
        │   never used to build the parsing table]
        │
        ▼
left_recursion.py        — eliminate_left_recursion(): standard ordered-substitution
        │                   algorithm (handles direct AND indirect recursion)
        ▼
left_factoring.py        — left_factor(): repeatedly factors common prefixes until
        │                   none remain (including on newly introduced non-terminals)
        ▼
FINAL TRANSFORMED GRAMMAR
        │
        ▼
first.py                 — compute_first_sets(): fixed-point algorithm + derivation log
        ▼
follow.py                — compute_follow_sets(): fixed-point algorithm + derivation log
        ▼
parsing_table.py         — build_parsing_table(): M[A, a] from FIRST/FOLLOW,
        │                   conflict detection
        ▼
ll1_analyzer.py          — classify_and_summarize(): FIRST/FIRST vs FIRST/FOLLOW
        │
        ▼
predictive_parser.py     — run_predictive_parse(): stack-based table-driven parse,
        │                   full step trace, structured errors
        ▼
parse_tree.py            — build_parse_tree(): re-runs the parse with a parallel
                            node-stack so the tree mirrors real parser actions
```

`transformations.py` is the orchestrator: it calls every module above in order
and returns one JSON-serializable dict, which is exactly what
`POST /api/grammar/analyze` returns. This keeps the "single comprehensive
analysis endpoint" the API design principle asks for, while still letting each
algorithm live in its own single-responsibility module (also satisfying the
2-student work split: Student 1 owns everything up through `parsing_table.py`;
Student 2 owns `predictive_parser.py`, `parse_tree.py`, the FastAPI routes, and
the whole `frontend/`).

## Why FIRST/FOLLOW are computed twice

The spec requires that the **final** LL(1) table be built strictly from
FIRST/FOLLOW of the transformed grammar — never the original. But it also
asks for an *educational* diagnostic view of the original grammar. Rather than
skip that diagnostic, `transformations.analyze_grammar()` computes FIRST/
FOLLOW/the table **twice**: once on the untransformed grammar (labeled
`original_diagnostics`, explicitly marked "Not Used for Final LL(1) Table" in
both the API response and the UI), and once on the final grammar (labeled
`final_first` / `final_follow` / `parsing_table`, which is what
`/api/parser/parse` actually uses).

## Data model

`app/models/grammar.py` defines `Production` (stable `id`, `lhs`, `rhs` list
of symbols) and `Grammar` (`start_symbol`, `non_terminals` in declaration
order, `terminals`, and a `productions: Dict[str, List[Production]]` map).
Every transformation module takes a `Grammar` and returns either a **new**
`Grammar` (transformations never mutate in place, so "before/after" comparisons
stay valid) plus a list of human-readable `steps` describing what changed and
why.

## Frontend

The frontend is a pure rendering layer. `src/services/api.js` is the only
place that talks to the network; every tab component
(`src/pages/*.jsx`) receives the already-fetched `analysis` object as a prop
and renders it. No FIRST/FOLLOW/table/parsing logic exists anywhere in
`frontend/`.
