# Testing

All tests live in `backend/tests/` and run with `pytest -q` (32 tests, all
passing). No frontend test framework is included — the frontend is a thin
rendering layer verified manually via the demo flow below.

| File | Coverage |
|---|---|
| `test_first.py` | terminals only, epsilon, nullable chains, multiple productions, the full arithmetic grammar's exact expected FIRST sets |
| `test_follow.py` | start-symbol `$` rule, nested dependency, epsilon propagation, recursive dependency, the full arithmetic grammar's exact expected FOLLOW sets |
| `test_left_recursion.py` | direct detection, no-false-positive on clean grammars, indirect detection (cycle), elimination of direct recursion, elimination with multiple recursive alternatives, elimination of indirect recursion |
| `test_left_factoring.py` | simple common prefix, no-op when nothing to factor, multiple prefixes of different lengths |
| `test_ll1.py` | a valid LL(1) grammar, a genuine FIRST/FIRST conflict, a FIRST/FOLLOW conflict (dangling-else), a left-recursive grammar that becomes LL(1) after transformation |
| `test_parser.py` | valid expression accepted, invalid expression rejected with an error, an unexpected-token case, empty input on a nullable grammar, a parenthesized expression |
| `test_validation.py` | missing RHS raises, empty grammar raises, invalid epsilon placement raises, unreachable-symbol warning, duplicate-production warning |

## Manual end-to-end verification performed during development

- Backend started with `uvicorn`, hit every route with `curl` (`/health`,
  `/api/examples`, `/api/grammar/analyze`, `/api/grammar/explain-cell`,
  `/api/parser/parse`) and confirmed responses matched the algorithms' own
  unit-test expectations.
- Confirmed the left-recursive arithmetic grammar produces the **exact**
  transformed grammar, FIRST/FOLLOW sets, and step-by-step parse trace shown
  in the project specification for input `id + id * id`.
- Confirmed the dangling-else style grammar is left-factored, and that the
  resulting FIRST/FOLLOW conflict (inherent ambiguity, not a prefix issue) is
  correctly detected and correctly classified as FIRST/FOLLOW rather than
  FIRST/FIRST.
- Confirmed `S -> aA | aB` (looks like a conflict) is fully resolved by left
  factoring, while `S -> A | B, A -> a, B -> a` (a genuine ambiguity) remains
  a conflict after the full pipeline — used this distinction to correct one
  of the example grammars in the bundled library.
- `npm run build` succeeds with zero errors/warnings; `npm run preview` serves
  the production build, confirmed reachable via `curl`.
