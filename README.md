# Complete Grammar Analysis & Parsing Laboratory

**An Interactive Compiler Design Laboratory Supporting Top-Down and Bottom-Up Parsing**

A comprehensive educational compiler design platform implementing all major parsing paradigms from scratch:
- **Top-Down Parsing**: LL(1) Predictive Parsing with derivation explanations, left-recursion elimination, left factoring, conflict classification, and dynamic parse trees.
- **Bottom-Up Parsing**: The complete LR family:
  - **LR(0)**: Canonical collection of LR(0) item sets, closure, GOTO, DFA transition graphs, and unconditional reduction analysis.
  - **SLR(1)**: FOLLOW-based reduction placement, resolving shift/reduce conflicts without extra states.
  - **CLR(1) / Canonical LR(1)**: Explicit lookahead propagation using $\text{FIRST}(\beta a)$ context for maximal deterministic parsing power.
  - **LALR(1)**: Canonical LR(1) core merging, lookahead unioning, state compression, and merge-induced Reduce/Reduce conflict diagnostics.
- **Automata Visualization**: Interactive state automata transition graphs powered by React Flow (`@xyflow/react`).
- **Step-by-Step Simulation**: Interactive play, pause, single-step forward/backward, and speed controls for stack and symbol execution traces.
- **Dynamic Parse Tree Generation**: Rendered directly from actual parser actions (expansion steps for LL(1); shift/reduce operations for LR).
- **Multi-Parser Comparison**: Real-time 5-way comparative matrix across LL(1), LR(0), SLR(1), CLR(1), and LALR(1).

Every algorithm is implemented from scratch in pure Python without external parser generators (no PLY, Lark, ANTLR, SLY, or yacc).

---

## Architecture

```
backend/   FastAPI + Pydantic. The single source of truth for all grammar
           and parsing algorithms. React never calculates parsing tables,
           automata states, or parse results independently.
frontend/  React + Vite + JavaScript + Tailwind CSS. Developer-tool
           interface with dark mode, interactive graph automata,
           parse tree visualizer, and step-by-step simulator.
docs/      Theoretical algorithms, system architecture, and viva notes.
```

---

## Quick Start Instructions

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend API will be available at: `http://localhost:8000`  
Interactive Swagger docs: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend application will run at: `http://localhost:5173`

---

## Testing

Run the full pytest suite:

```bash
# From workspace root
backend\venv\Scripts\pytest backend\tests
```

Run frontend build check:

```bash
npm --prefix frontend run build
```

---

## API Summary

- `GET  /api/health` — Service health and supported parsing methods
- `GET  /api/examples` — Curated CFG library with expected compatibility
- `POST /api/grammar/validate` — Syntax and semantic validation
- `POST /api/grammar/analyze` — Unified top-down grammar analysis
- `POST /api/parser/ll1/analyze` — LL(1) predictive table and conflicts
- `POST /api/parser/ll1/parse` — LL(1) input string parsing with step trace and parse tree
- `POST /api/parser/lr0/analyze` — LR(0) canonical collection and ACTION/GOTO table
- `POST /api/parser/lr0/parse` — LR(0) table-driven shift-reduce execution
- `POST /api/parser/slr/analyze` — SLR(1) FOLLOW-based reduction table and conflicts
- `POST /api/parser/slr/parse` — SLR(1) shift-reduce execution
- `POST /api/parser/clr/analyze` — Canonical LR(1) item sets and parsing table
- `POST /api/parser/clr/parse` — CLR(1) shift-reduce execution
- `POST /api/parser/lalr/analyze` — LALR(1) core merging and conflict diagnostics
- `POST /api/parser/lalr/parse` — LALR(1) shift-reduce execution
- `POST /api/parser/compare` — 5-way comparative matrix across all parsers
