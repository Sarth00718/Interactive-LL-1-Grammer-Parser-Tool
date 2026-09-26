# Algorithms

Pseudocode matches the actual implementation in `backend/app/services/`.

## FIRST(X)

```
FIRST(a)  = {a}                       for terminal a
FIRST(ε)  = {ε}
FIRST(A)  = ⋃ FIRST(X1 X2 ... Xk)     over every production A -> X1 X2 ... Xk

FIRST(X1 X2 ... Xk):
    result = {}
    for Xi in X1..Xk:
        result += FIRST(Xi) - {ε}
        if ε not in FIRST(Xi): break
    else:
        result += {ε}      # every Xi was nullable
    return result
```

Implemented as a fixed-point iteration in `first.py`: repeatedly apply the
above to every production until no FIRST set changes. This correctly handles
recursive and mutually-recursive definitions.

## FOLLOW(A)

```
Rule 1:  $ ∈ FOLLOW(start_symbol)
Rule 2:  for each production  B -> α A β:
             FOLLOW(A) += FIRST(β) - {ε}
Rule 3:  for each production  B -> α A β  where β is empty or nullable:
             FOLLOW(A) += FOLLOW(B)
```

Also a fixed-point iteration (`follow.py`) — Rule 3 is why iteration is
required: FOLLOW(A) can depend on FOLLOW(B), which may not be fully known yet
on a single pass.

## Left recursion elimination

Standard ordered algorithm (handles indirect recursion too):

```
order non-terminals A1, A2, ..., An
for i = 1 to n:
    for j = 1 to i-1:
        replace every production  Ai -> Aj γ
        with                      Ai -> δ1 γ | δ2 γ | ...
        where Aj -> δ1 | δ2 | ... are Aj's CURRENT productions
    // now eliminate any immediate left recursion introduced/already present on Ai:
    group Ai's productions into
        recursive:     Ai -> Ai α1 | Ai α2 | ...
        non-recursive: Ai -> β1 | β2 | ...
    if recursive is non-empty:
        introduce Ai'
        Ai  -> β1 Ai' | β2 Ai' | ...
        Ai' -> α1 Ai' | α2 Ai' | ε
```

`left_recursion.py` implements this exactly, tracking `steps` (before/after
text + a plain-English explanation) at both the substitution stage and the
immediate-elimination stage.

## Left factoring

```
for each non-terminal A with alternatives that share a common prefix α:
    A  -> α A'
    A' -> β1 | β2 | ...      # βi = what remained of each alternative after α
```

`left_factoring.py` repeatedly finds the *largest* group of alternatives
sharing a prefix, factors it, and re-queues the newly introduced non-terminal
in case it itself needs further factoring (handles multi-level common
prefixes of different lengths).

## LL(1) parsing table construction

```
for each production  A -> α:
    for each terminal a in FIRST(α):
        M[A, a] = A -> α
    if ε ∈ FIRST(α):
        for each terminal b in FOLLOW(A):
            M[A, b] = A -> α
```

If any cell would receive more than one production, that is a **conflict**
and the grammar is not LL(1). `parsing_table.py` records, for every non-empty
cell, exactly which FIRST/FOLLOW fact justified placing that production there
(used for the "explain this cell" feature).

Conflict classification (`ll1_analyzer.py`): if any of the colliding
productions in a cell is an ε-production, it's classified as a
**FIRST/FOLLOW** conflict; otherwise it's a **FIRST/FIRST** conflict.

## Predictive parsing

```
push $ then start_symbol onto the stack
append $ to the input
loop:
    top = stack top
    a   = current lookahead token
    if top == a == $:            accept
    elif top is a terminal:
        if top == a: pop top, advance input
        else: error (mismatch)
    else:                          # top is a non-terminal
        look up M[top, a]
        if empty: error (no rule — report what WAS expected)
        else: pop top, push the production's RHS (reversed), record the step
```

`predictive_parser.py` implements this directly and records a full
step/stack/input/action trace as it runs, plus a structured error object
(`stack`, `input`, `found`, `expected`, `message`) on failure — never a bare
"syntax error".

## Parse tree construction

A parse tree cannot be derived from the trace alone without re-tracking
structure, so `parse_tree.py` re-runs the identical parsing loop with a
**node stack** kept perfectly in sync with the symbol stack: whenever a
production `A -> X1 X2 ... Xk` is applied, `k` new child nodes are created
under A's node and pushed (in the same reversed order as the symbols). This
guarantees the tree is always an exact structural record of what the parser
actually did — never a hand-authored shape.
