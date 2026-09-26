# Viva Preparation

1. **What is a CFG?** A 4-tuple (N, Σ, P, S): non-terminals, terminals,
   productions, and a start symbol, generating a context-free language.
2. **What is FIRST?** The set of terminals that can begin some string
   derivable from a grammar symbol or symbol sequence.
3. **What is FOLLOW?** The set of terminals that can immediately follow a
   non-terminal in some derivation from the start symbol.
4. **Why is `$` placed in FOLLOW(start)?** It marks end-of-input so the
   parser can recognize acceptance when both the stack and input are
   simultaneously exhausted.
5. **What is epsilon?** The empty string; `A -> ε` means A can derive
   nothing.
6. **Why is left recursion a problem for LL(1)?** A top-down parser
   expanding `A -> Aα` would recurse on A forever without consuming any
   input.
7. **How is left recursion eliminated?** `A -> Aα | β` becomes
   `A -> βA'`, `A' -> αA' | ε`.
8. **What is left factoring?** Factoring a common prefix shared by two or
   more alternatives of a non-terminal into a new non-terminal.
9. **Why is left factoring required?** Without it the parser can't decide,
   with only one lookahead token, which alternative to expand.
10. **What does LL(1) mean?** Left-to-right scan, Leftmost derivation, 1
    token of lookahead.
11. **How is the parsing table constructed?** For `A -> α`: add it to
    `M[A,a]` for every `a` in `FIRST(α)`; if `ε ∈ FIRST(α)`, also add it to
    `M[A,b]` for every `b` in `FOLLOW(A)`.
12. **What is a FIRST/FIRST conflict?** Two alternatives of the same
    non-terminal have overlapping FIRST sets.
13. **What is a FIRST/FOLLOW conflict?** One alternative is nullable and
    its non-terminal's FOLLOW set overlaps another alternative's FIRST set.
14. **Why must FIRST/FOLLOW be recalculated after transformation?** They
    describe the actual productions in play; after left-recursion
    elimination/left factoring, the productions are different, so the old
    sets no longer correspond to what the parser will use.
15. **How does predictive parsing work?** A stack, initialized with `$`
    and the start symbol, is repeatedly expanded (via the table) or matched
    (against the input) one symbol at a time until both are `$`.
16. **What happens when a parsing-table cell is empty?** It signals a
    syntax error — there is no way to continue the derivation for the
    current lookahead.
17. **How does the parser handle an invalid token?** It reports the
    current stack, the remaining input, the offending token, and the set
    of tokens that would have been valid.
18. **Difference between parse tree and AST?** A parse tree records every
    grammar rule applied, including intermediate non-terminals; an AST
    keeps only the semantically significant structure.
19. **Difference between LL(1) and LR parsing?** LL(1) is top-down,
    builds a leftmost derivation with 1 token of lookahead; LR is
    bottom-up, builds a rightmost derivation in reverse, and accepts a
    strictly larger class of grammars.
20. **Why use a stack?** It naturally represents the pending
    (not-yet-expanded) suffix of the current sentential form during a
    top-down derivation.
21. **Why is `$` used?** As an unambiguous end-of-input marker so
    acceptance can be detected deterministically.
22. **What are nullable non-terminals?** Non-terminals that can derive the
    empty string.
23. **How are indirect dependencies (in FIRST/FOLLOW) handled?** Via a
    fixed-point (worklist) algorithm: recompute every set from the current
    approximations, repeat until nothing changes.
24. **How is the start symbol selected?** By default, the first
    non-terminal declared; the user may override it.
25. **What limitations does this implementation have?** Left-recursion
    elimination uses the standard ordered-substitution algorithm taught in
    this course; grammars needing more exotic restructuring outside that
    scope are not specially supported.
26. **What is indirect left recursion? Give an example.** A cycle of
    derivations that eventually re-derives the same non-terminal as its own
    first symbol, e.g. `A -> Bα`, `B -> Aβ`.
27. **Why can't left factoring alone fix every apparent conflict?** Some
    conflicts stem from genuine grammatical ambiguity (e.g. the
    dangling-else grammar), not merely a shared textual prefix — no
    amount of factoring removes the ambiguity itself.
28. **What does it mean for a grammar to be ambiguous, and how does that
    relate to LL(1)?** A grammar is ambiguous if some string has more than
    one distinct parse tree; every ambiguous grammar is automatically not
    LL(1), since a deterministic table couldn't encode two valid
    derivations for the same input.
29. **Why does the parsing table use only the FINAL transformed grammar,
    never the original?** Because the parser is going to execute the final
    grammar's productions — FIRST/FOLLOW must match the productions
    actually being used, or the table would be constructed for a different
    grammar than the one being parsed.
30. **What's the practical difference between a FIRST/FIRST conflict and
    one caused by a shared prefix?** A shared literal prefix (e.g.
    `S -> aA | aB`) is removable by left factoring; a true FIRST/FIRST
    conflict (e.g. `S -> A | B` where both A and B can derive the same
    terminal) reflects an underlying choice the grammar cannot make
    deterministically, and survives transformation.
31. **How would you extend this tool to LR parsing?** Add an `lr_items.py`
    module computing LR(0)/SLR(1) item sets and action/goto tables from the
    same `Grammar` object, reusing the existing FIRST/FOLLOW modules for
    the lookahead computations SLR(1) needs.
