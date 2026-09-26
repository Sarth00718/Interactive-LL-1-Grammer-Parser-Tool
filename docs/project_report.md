# Breaking Down Grammars: An Interactive LL(1) Grammar Analysis and Predictive Parsing Tool

## 1. Title
Breaking Down Grammars: An Interactive LL(1) Grammar Analysis and Predictive Parsing Tool

## 2. Abstract
Compiler front-ends rely on LL(1) predictive parsing whenever a grammar
permits it, but the path from a "natural" grammar to an LL(1)-ready one —
detecting left recursion, eliminating it, factoring common prefixes,
recomputing FIRST/FOLLOW, and building a conflict-free parsing table — is
usually taught as a sequence of disconnected pencil-and-paper exercises. This
project builds a full-stack tool that takes a raw context-free grammar,
performs every one of these steps algorithmically (not via any
parser-generator library), and exposes the reasoning behind each step:
why a symbol is in FIRST(A), why a table cell contains a given production,
and why the parser accepted or rejected a given input.

## 3. Introduction
This project was built for the Principles of Compiler Design course as a
2-student Innovative Assignment. It targets the specific gap between
"knowing the FIRST/FOLLOW rules" and "seeing why they apply to a specific,
possibly messy, grammar a student writes themselves."

## 4. Problem Statement
Given an arbitrary context-free grammar, determine whether it is suitable
for LL(1) predictive parsing; if not, transform it (left-recursion
elimination, left factoring) into an equivalent grammar that is; construct
the LL(1) parsing table for the final grammar; and use that table to parse
a given input string, reporting either a full derivation trace or a precise
syntax error.

## 5. Motivation
Static textbook examples don't help a student debug their *own* grammar.
An interactive tool that explains every derived set and every table cell in
terms of the specific productions the student wrote closes that gap.

## 6. Objectives
- Implement FIRST, FOLLOW, left-recursion detection/elimination, left
  factoring, LL(1) table construction, and predictive parsing from scratch.
- Clearly separate "original grammar" diagnostics from the "final
  transformed grammar" that the parser actually uses.
- Explain, not just compute: every set and every table cell should be
  traceable back to the specific rule that produced it.
- Report actionable, specific parsing errors instead of "syntax error."

## 7. Existing Approach
Most classroom tools either (a) only compute FIRST/FOLLOW for a grammar the
student is told is already LL(1), or (b) are full parser generators (e.g.
ANTLR, PLY) that hide the algorithms behind a black box, which is
pedagogically the opposite of what a compiler-design course needs.

## 8. Proposed System
A FastAPI backend implements every algorithm as an explicit, inspectable
Python module (see `docs/algorithms.md`), orchestrated by a single pipeline
function. A React frontend visualizes the JSON that pipeline returns,
without performing any grammar logic itself. See `docs/architecture.md` for
the full data flow.

## 9. Compiler Design Concepts Used
Context-free grammars, derivations, left recursion, left factoring, FIRST
and FOLLOW sets, the LL(1) condition, table-driven predictive parsing, and
parse trees. See the in-app "Learn" tab for a plain-language explanation of
each.

## 10. System Architecture
```
frontend (React/Vite/Tailwind)  --HTTP JSON-->  backend (FastAPI)
                                                    │
                                     grammar_parser → grammar_validator
                                     → left_recursion → left_factoring
                                     → first → follow → parsing_table
                                     → ll1_analyzer → predictive_parser
                                     → parse_tree
```

## 11. Grammar Representation
A `Grammar` is `{start_symbol, non_terminals: [...], terminals: [...],
productions: {LHS: [Production, ...]}}`, where each `Production` carries a
stable id, its LHS, and its RHS as a list of symbols (epsilon is the single
symbol `ε`). See `backend/app/models/grammar.py`.

## 12. FIRST Algorithm
Fixed-point computation over all productions; see `docs/algorithms.md` for
pseudocode. Verified against the specification's worked arithmetic-grammar
example exactly (`test_first.py`).

## 13. FOLLOW Algorithm
Fixed-point computation implementing the three standard rules (start-symbol
`$`, FIRST(β) propagation, FOLLOW(A) propagation across nullable β). Verified
against the specification's worked example exactly (`test_follow.py`).

## 14. Left Recursion
Both direct (`A -> Aα`) and indirect (`A -> B..., B -> A...`) recursion are
detected. Elimination uses the standard ordered-substitution algorithm,
which removes both forms in one pass (`left_recursion.py`,
`test_left_recursion.py`).

## 15. Left Factoring
Implemented iteratively: the longest shared prefix among a non-terminal's
alternatives is factored out into a new non-terminal, which is re-queued in
case it itself needs further factoring (`left_factoring.py`,
`test_left_factoring.py`).

## 16. LL(1) Analysis
A grammar is LL(1) iff its parsing table has no cell containing more than
one production. Conflicts are further classified as FIRST/FIRST (colliding
non-ε alternatives) or FIRST/FOLLOW (an ε-alternative's FOLLOW set overlaps
another alternative's FIRST set) (`ll1_analyzer.py`, `test_ll1.py`).

## 17. Parsing Table
Built directly from the rules `a ∈ FIRST(α) ⇒ M[A,a] = A->α` and
`ε ∈ FIRST(α), b ∈ FOLLOW(A) ⇒ M[A,b] = A->α`, with a stored justification
string for every populated cell (`parsing_table.py`).

## 18. Predictive Parser
Standard stack-based table-driven parser producing a full
step/stack/input/action trace and a structured error (stack, remaining
input, found token, expected tokens, message) on failure
(`predictive_parser.py`, `test_parser.py`).

## 19. Implementation
Python 3.11 / FastAPI / Pydantic on the backend; React 18 / Vite / Tailwind
CSS (plain JavaScript, no TypeScript) on the frontend. See
`backend/requirements.txt` and `frontend/package.json` for exact versions.

## 20. UI Design
A single grammar-input panel drives ten tabs: Grammar, Diagnostics,
Transform, FIRST, FOLLOW, LL(1), Parsing Table, Parser, Parse Tree, and
Learn. Clicking a FIRST/FOLLOW row or a parsing-table cell expands its
derivation reasoning in place.

## 21. Test Cases
32 automated backend tests across 6 files; see `docs/testing.md` for the
full breakdown and manual end-to-end verification performed during
development.

## 22. Results
All 32 automated tests pass. The tool reproduces the specification's worked
arithmetic-grammar example (transformed grammar, FIRST/FOLLOW sets, and the
17-step parse trace for `id + id * id`) exactly. It also correctly
distinguishes a textual-prefix "conflict" that left factoring resolves
(`S -> aA | aB`) from a genuine, unresolvable ambiguity (`S -> A | B, A -> a,
B -> a`, and the classic dangling-else grammar).

## 23. Limitations
- Left-recursion elimination targets the standard scope taught in this
  course (the ordered-substitution algorithm); grammars requiring more
  exotic restructuring outside that scope are not silently mis-transformed,
  but are also not specially handled.
- On a genuine LL(1) conflict, the predictive parser deterministically picks
  the first production in a cell to keep demonstrating a trace, rather than
  refusing to parse — the LL(1) tab is the authority on whether the grammar
  is actually deterministic.
- No persistence layer: each request is stateless: the grammar text is
  resubmitted with every API call.

## 24. Future Scope
- LALR(1)/SLR(1) table construction for comparison against LL(1).
- A grammar-equivalence checker to confirm a transformed grammar generates
  the same language as the original.
- Persisting user grammars and sharing links.

## 25. Conclusion
The system demonstrates that every stage of the LL(1) pipeline — not just
FIRST/FOLLOW in isolation — can be made transparent and interactive without
sacrificing algorithmic correctness, closing a real gap between the
textbook algorithms and a student's ability to apply them to their own
grammar.

## 26. References
1. A. V. Aho, M. S. Lam, R. Sethi, J. D. Ullman, *Compilers: Principles,
   Techniques, and Tools* (2nd ed.), Pearson, 2006.
2. FastAPI documentation: https://fastapi.tiangolo.com/
3. React documentation: https://react.dev/
4. Vite documentation: https://vite.dev/
5. Tailwind CSS documentation: https://tailwindcss.com/docs
