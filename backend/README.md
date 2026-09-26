# Breaking Down Grammars — Backend

FastAPI service implementing every Compiler Design algorithm used by the tool:
grammar parsing, validation, left-recursion detection/elimination, left
factoring, FIRST/FOLLOW computation, LL(1) table construction, predictive
parsing, and parse-tree construction. All algorithms are hand-implemented in
`app/services/` — no parser-generator library is used for any of it.

## Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

The API is then available at `http://localhost:8000`, with interactive docs
at `http://localhost:8000/docs`.

## Test

```bash
pytest -q
```

## API

| Method | Path                          | Purpose                                             |
|--------|-------------------------------|------------------------------------------------------|
| POST   | `/api/grammar/validate`       | Parse + validate a grammar                           |
| POST   | `/api/grammar/analyze`        | **Full pipeline**: validate → diagnose → transform → FIRST/FOLLOW → LL(1) table |
| POST   | `/api/grammar/transform`      | Just the transformation stage                         |
| POST   | `/api/grammar/first`          | FIRST sets of the final transformed grammar           |
| POST   | `/api/grammar/follow`         | FOLLOW sets of the final transformed grammar          |
| POST   | `/api/grammar/ll1`            | LL(1) verdict + classified conflicts                  |
| POST   | `/api/grammar/table`          | LL(1) parsing table                                   |
| POST   | `/api/grammar/explain-cell`   | Derivation reasoning for one table cell                |
| POST   | `/api/grammar/explain-first`  | Derivation reasoning for FIRST(X)                      |
| POST   | `/api/grammar/explain-follow` | Derivation reasoning for FOLLOW(X)                     |
| POST   | `/api/parser/parse`           | Runs the table-driven predictive parser + builds a parse tree |
| GET    | `/api/examples`               | Bundled example grammars                               |

All POST endpoints accept:
```json
{ "grammar_text": "E -> T E'\n...", "start_symbol": null }
```
`/api/parser/parse` additionally requires `"input_string": "id + id * id"`.

## Pipeline

```
Original CFG → Validate → Diagnose (left recursion) → Eliminate left recursion
  → Left factor → FINAL grammar → FIRST → FOLLOW → LL(1) table → Predictive parser
```

FIRST/FOLLOW/the LL(1) table are always computed on the **final transformed
grammar**. The original grammar's own FIRST/FOLLOW/LL(1) status is also
computed, but only as a separate, clearly labeled educational diagnostic
(`original_diagnostics` in the `/api/grammar/analyze` response) — it is never
used to build the parsing table.
