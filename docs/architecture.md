# Architecture: Complete Grammar Analysis & Parsing Laboratory

## System Overview

The **Complete Grammar Analysis & Parsing Laboratory** is an interactive compiler design system supporting:
- **Top-Down Parsing**: LL(1) predictive parsing with step derivations, recursion elimination, left factoring, and parse trees.
- **Bottom-Up Parsing**: The complete LR family: LR(0), SLR(1), Canonical LR(1) (CLR), and LALR(1).
- **Automata Visualization**: Interactive DFA transition graphs rendered with React Flow from backend state collections.
- **Parsing Simulation**: Step-by-step trace of state stacks, symbol stacks, remaining input, actions, and dynamically generated parse trees.
- **Multi-Algorithm Comparison**: 5-way comparative matrix across all supported parsers.

The backend (FastAPI + Pydantic) serves as the **single source of truth**. All grammar transformations, first/follow derivations, item closures, GOTO transitions, parsing tables, conflict classifications, and parse trees are computed from scratch in pure Python without external parser-generator libraries (no PLY, Lark, ANTLR, SLY, or yacc).

---

## Directory Organization

```
breaking-down-grammars/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entrypoint
│   │   ├── models/
│   │   │   ├── grammar.py           # Core CFG dataclasses (Grammar, Production)
│   │   │   └── api_models.py        # Pydantic request & response schemas
│   │   ├── routes/
│   │   │   ├── grammar.py           # /api/grammar/* routes (validation, analyze, FIRST/FOLLOW)
│   │   │   ├── parser.py            # /api/parser/* (top-down & bottom-up analyze, parse, compare)
│   │   │   └── bottom_up.py         # /api/bottom-up/* routes
│   │   ├── services/
│   │   │   ├── grammar/             # Shared CFG engine
│   │   │   │   ├── parser.py        # BNF syntax tokenizer & parser
│   │   │   │   ├── validator.py     # Semantic diagnostics & non-generating symbols
│   │   │   │   ├── transformations.py # Grammar orchestration
│   │   │   │   └── augmented.py     # Grammar augmentation (S' -> S)
│   │   │   ├── top_down/            # Top-down LL(1) parsing pipeline
│   │   │   │   ├── first.py         # FIRST sets computation & derivation logs
│   │   │   │   ├── follow.py        # FOLLOW sets computation & derivation logs
│   │   │   │   ├── left_recursion.py# Direct & indirect left-recursion elimination
│   │   │   │   ├── left_factoring.py# Multi-step common prefix factoring
│   │   │   │   ├── ll1_analyzer.py  # Conflict classification (FIRST/FIRST vs FIRST/FOLLOW)
│   │   │   │   ├── parsing_table.py # Predictive table M[A, a] builder
│   │   │   │   ├── predictive_parser.py # Stack trace simulator
│   │   │   │   ├── parse_tree.py    # Top-down expansion tree builder
│   │   │   │   └── explanations.py  # Educational derivations
│   │   │   └── bottom_up/           # Bottom-up LR parsing pipeline
│   │   │       ├── item.py          # LR(0) and LR(1) immutable item structures
│   │   │       ├── lr0/             # LR(0) closure, GOTO, DFA, and table
│   │   │       ├── slr/             # SLR(1) FOLLOW-based reduction table
│   │   │       ├── clr/             # Canonical LR(1) items with FIRST(β a) lookahead
│   │   │       ├── lalr/            # LALR(1) LR(0) core merging & conflict diagnostics
│   │   │       ├── parsing/         # Table-driven shift-reduce engine & parse tree
│   │   │       ├── analyzer.py      # Unified bottom-up analysis orchestrator
│   │   │       └── comparison.py    # 5-way comparative matrix engine
│   │   └── utils/
│   │       └── examples.py          # Curated CFG examples covering all categories
│   └── tests/                       # Pytest suite with 60 comprehensive tests
│
└── frontend/
    └── src/
        ├── App.jsx                  # Main application container
        ├── context/
        │   └── ThemeContext.jsx     # Dark mode context & persistence
        ├── components/
        │   ├── SidebarNav.jsx       # Left sidebar navigation
        │   ├── Header.jsx           # Top header with dark mode toggle
        │   ├── AutomatonGraph.jsx   # React Flow DFA graph component
        │   ├── ParsingTableComponent.jsx # Color-coded ACTION/GOTO table
        │   ├── ParsingSimulator.jsx # Step-by-step trace simulator
        │   └── ParseTreeView.jsx    # SVG dynamic parse tree visualizer
        └── pages/
            ├── DashboardView.jsx    # Welcome dashboard & quick starts
            ├── WorkspaceView.jsx    # CFG grammar editor & validator
            ├── ComparisonView.jsx   # 5-way comparative matrix
            ├── ExamplesView.jsx     # Grammar library browser
            ├── DocsView.jsx         # Theoretical algorithm documentation
            ├── top_down/            # Dedicated top-down LL(1) pages
            │   ├── TopDownView.jsx  # LL(1) laboratory view
            │   ├── FirstTab.jsx     # FIRST sets derivation
            │   ├── FollowTab.jsx    # FOLLOW sets derivation
            │   ├── LL1Tab.jsx       # LL(1) conflicts
            │   ├── TableTab.jsx     # Predictive table M[A, a]
            │   ├── TransformTab.jsx # Recursion & factoring steps
            │   ├── ParserTab.jsx    # Predictive simulator
            │   └── ParseTreeTab.jsx # Top-down parse tree
            └── bottom_up/           # Dedicated bottom-up LR pages
                ├── BottomUpLabView.jsx # Unified bottom-up laboratory
                ├── LR0View.jsx      # Dedicated LR(0) Automaton page
                ├── SLR1View.jsx     # Dedicated SLR(1) Parser page
                ├── CLR1View.jsx     # Dedicated CLR(1) Parser page
                └── LALR1View.jsx    # Dedicated LALR(1) Parser page
```
