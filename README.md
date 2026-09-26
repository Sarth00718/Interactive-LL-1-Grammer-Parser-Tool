# Breaking Down Grammars

**An Interactive LL(1) Grammar Analysis and Predictive Parsing Tool**

A 2-student Innovative Assignment for Principles of Compiler Design.

## What it does

Given a raw Context-Free Grammar, the tool:

1. Validates it and identifies terminals, non-terminals, and the start symbol
2. Diagnoses the **original** grammar (left recursion — direct and indirect)
3. Eliminates left recursion and performs left factoring where needed
4. Computes FIRST and FOLLOW sets **on the final transformed grammar**, with
   a full derivation trace for every set
5. Builds the LL(1) parsing table and detects/classifies conflicts
   (FIRST/FIRST vs FIRST/FOLLOW), with a reasoning trace for every populated cell
6. Runs a table-driven predictive parser on a user-supplied input string,
   producing a full stack/input/action trace and useful error diagnostics
7. Builds and renders a parse tree generated directly from the parser's own
   operations (never hard-coded)

Every algorithm (grammar parsing, FIRST, FOLLOW, left-recursion
detection/elimination, left factoring, LL(1) table construction, predictive
parsing, parse-tree construction) is implemented from scratch in
`backend/app/services/` — no parser-generator library is used anywhere in
the pipeline.

## Architecture

```
backend/   FastAPI + Pydantic. All Compiler Design algorithms live here.
           This is the single source of truth — the frontend never
           computes FIRST/FOLLOW/the table/parse results itself.
frontend/  React + Vite + Tailwind (no TypeScript). Pure visualization
           layer over the backend's JSON responses.
examples/  (see backend/app/utils/examples.py — the example grammar
           library used by both the API and the UI's "Load example" menu)
docs/      Algorithm notes and architecture write-up.
```

## Quick start

**Backend** (terminal 1):
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend** (terminal 2):
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Testing

```bash
cd backend
pytest -q
```

32 tests cover FIRST, FOLLOW, left-recursion detection/elimination (direct
and indirect), left factoring, LL(1) conflict classification, the predictive
parser (valid/invalid input, empty input, error messages), and grammar
validation.

## Demo grammars (bundled, also available via `GET /api/examples`)

| Example | Demonstrates |
|---|---|
| Arithmetic (`E -> T E' | ...`) | Already-LL(1) grammar, full pipeline, accept trace |
| Left-recursive arithmetic (`E -> E + T | T`) | Direct left-recursion elimination |
| `S -> A | B`, `A -> a`, `B -> a` | A genuine, non-removable FIRST/FIRST conflict |
| `S -> a A | a B` | A conflict that *is* removable — resolved by left factoring |
| Dangling-else style grammar | Left factoring, and a FIRST/FOLLOW conflict that factoring alone cannot remove |
| `S -> A B`, `A -> a\|ε`, `B -> b\|ε` | Nullable non-terminals, FOLLOW propagation |
| `A -> B a \| c`, `B -> A b \| d` | Indirect left recursion |
| Malformed grammar | Validation error reporting |

## Key design principle

The backend is the single source of truth. The frontend sends raw grammar
text (and, for parsing, an input string) to `/api/grammar/analyze` or
`/api/parser/parse`, and renders the structured result — it never
independently recomputes FIRST, FOLLOW, the parsing table, or parse results.

## Documentation

See `docs/architecture.md` and `docs/algorithms.md` for a deeper write-up of
the pipeline and each algorithm (with pseudocode), suitable for the project
report and viva.
