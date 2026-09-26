# Presentation Outline (12–15 slides)

1. **Title** — Breaking Down Grammars: An Interactive LL(1) Grammar
   Analysis and Predictive Parsing Tool
2. **Problem** — Turning an arbitrary CFG into a working LL(1) parser is a
   multi-step pipeline that's easy to get wrong by hand
3. **Motivation** — Students need to see *why*, not just *that*, a grammar
   is or isn't LL(1)
4. **Objectives** — Implement every algorithm from scratch; explain every
   derived set/cell; give real parsing diagnostics
5. **Proposed Solution** — Full-stack tool: FastAPI algorithms + React
   visualization, backend as single source of truth
6. **Compiler Pipeline** — Validate → diagnose → eliminate left recursion →
   left factor → FIRST/FOLLOW (final grammar) → LL(1) table → parse
7. **Grammar Transformation** — Live example: `E -> E + T | T` becoming
   `E -> T E'`, `E' -> + T E' | ε`
8. **FIRST/FOLLOW** — Derivation-trace UI: click a set, see exactly which
   production and which rule contributed each member
9. **LL(1) Table** — Click-to-explain table cells; conflict highlighting
   and FIRST/FIRST vs FIRST/FOLLOW classification
10. **Predictive Parser** — Full stack/input/action trace on
    `id + id * id`; structured error messages on invalid input
11. **Application Demo** — Live walkthrough of all four demo grammars
    (LL(1) already, left-recursive, left-factoring, genuine conflict)
12. **Test Results** — 32/32 automated backend tests passing; exact match
    against the specification's worked example
13. **Innovation** — Explanation engines for FIRST/FOLLOW/table cells;
    distinguishing resolvable vs. genuine LL(1) conflicts
14. **Limitations / Future Scope** — Scope of left-recursion elimination;
    LALR/SLR comparison; grammar-equivalence checking
15. **Conclusion** — A transparent, algorithmically correct, end-to-end
    LL(1) pipeline students can use on their own grammars
