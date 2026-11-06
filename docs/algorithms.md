# Parsing Algorithms & Mathematical Foundations

## 1. Top-Down Parsing: LL(1)

### FIRST Set Computation
For a symbol $X$:
1. If $X$ is a terminal, $\text{FIRST}(X) = \{X\}$.
2. If $X \to \epsilon$, add $\epsilon$ to $\text{FIRST}(X)$.
3. If $X$ is a non-terminal with production $X \to Y_1 Y_2 \dots Y_k$:
   - Add all non-$\epsilon$ symbols from $\text{FIRST}(Y_1)$ to $\text{FIRST}(X)$.
   - If $\epsilon \in \text{FIRST}(Y_1)$, add non-$\epsilon$ symbols of $\text{FIRST}(Y_2)$, and so on.
   - If $\epsilon \in \text{FIRST}(Y_i)$ for all $1 \le i \le k$, add $\epsilon$ to $\text{FIRST}(X)$.

### FOLLOW Set Computation
For a non-terminal $A$:
1. Add $\$$ to $\text{FOLLOW}(S)$, where $S$ is the start symbol.
2. If there is a production $A \to \alpha B \beta$:
   - Everything in $\text{FIRST}(\beta) \setminus \{\epsilon\}$ is in $\text{FOLLOW}(B)$.
3. If there is a production $A \to \alpha B$, or $A \to \alpha B \beta$ where $\epsilon \in \text{FIRST}(\beta)$:
   - Everything in $\text{FOLLOW}(A)$ is in $\text{FOLLOW}(B)$.

### LL(1) Table Construction & Conflict Classification
For each production $A \to \alpha$:
- For each terminal $a \in \text{FIRST}(\alpha)$, add $A \to \alpha$ to $M[A, a]$.
- If $\epsilon \in \text{FIRST}(\alpha)$, for each $b \in \text{FOLLOW}(A)$ (including $\$$), add $A \to \alpha$ to $M[A, b]$.

**Conflicts:**
- **FIRST/FIRST Conflict**: Two alternatives for $A$ share a terminal in their FIRST sets ($\text{FIRST}(\alpha) \cap \text{FIRST}(\beta) \neq \emptyset$).
- **FIRST/FOLLOW Conflict**: One alternative derives $\epsilon$ and another alternative's FIRST set intersects $\text{FOLLOW}(A)$ ($\text{FIRST}(\beta) \cap \text{FOLLOW}(A) \neq \emptyset$).

---

## 2. Bottom-Up Parsing: The LR Family

### Grammar Augmentation
Given grammar $G = (V, \Sigma, R, S)$, augment with $S' \to S$.
Productions are indexed deterministically:
- Production 0: $S' \to S$.
- Productions $1 \dots P-1$: original productions in canonical order.

### LR(0) Automaton
- **LR(0) Item**: A production with a dot, e.g., $A \to \alpha \cdot \beta$.
- **CLOSURE($I$)**:
  Repeat until no more items can be added:
  If $A \to \alpha \cdot B \beta \in I$, for each production $B \to \gamma$, add $B \to \cdot \gamma$ to $I$.
- **GOTO($I, X$)**:
  $\text{GOTO}(I, X) = \text{CLOSURE}(\{ A \to \alpha X \cdot \beta \mid A \to \alpha \cdot X \beta \in I \})$.
- **LR(0) Table**:
  - Shift: If $A \to \alpha \cdot a \beta \in I_i$ and $\text{GOTO}(I_i, a) = I_j$, set $\text{ACTION}[i, a] = \text{shift } j$.
  - Reduce: If $A \to \alpha \cdot \in I_i$ ($A \neq S'$), set $\text{ACTION}[i, a] = \text{reduce } A \to \alpha$ for **all** terminals $a \in \Sigma \cup \{\$\}$.
  - Accept: If $S' \to S \cdot \in I_i$, set $\text{ACTION}[i, \$] = \text{accept}$.

### SLR(1) Parsing
SLR(1) constructs the exact same LR(0) automaton. Reductions are restricted using **FOLLOW** sets:
- If $A \to \alpha \cdot \in I_i$ ($A \neq S'$), set $\text{ACTION}[i, a] = \text{reduce } A \to \alpha$ **only for** $a \in \text{FOLLOW}(A)$.

### Canonical LR(1) (CLR)
- **LR(1) Item**: $[A \to \alpha \cdot \beta, a]$ where $a \in \Sigma \cup \{\$\}$ is the lookahead.
- **LR(1) CLOSURE**:
  For each item $[A \to \alpha \cdot B \beta, a] \in I$, for each production $B \to \gamma$, and each terminal $b \in \text{FIRST}(\beta a)$, add $[B \to \cdot \gamma, b]$ to $I$.
- **CLR(1) Table**:
  - Shift: If $[A \to \alpha \cdot a \beta, b] \in I_i$ and $\text{GOTO}(I_i, a) = I_j$, set $\text{ACTION}[i, a] = \text{shift } j$.
  - Reduce: If $[A \to \alpha \cdot, a] \in I_i$ ($A \neq S'$), set $\text{ACTION}[i, a] = \text{reduce } A \to \alpha$ **only for lookahead** $a$.

### LALR(1) Parsing
1. Build Canonical LR(1) collection.
2. Group states having the exact same LR(0) core: $\text{core}(I) = \{ (p, \text{dot}) \mid [A \to \alpha \cdot \beta, a] \in I \}$.
3. For each group with identical cores, merge into a single LALR state and union their lookahead sets:
   $[A \to \alpha \cdot \beta, \bigcup a_i]$.
4. Reconstruct transitions: If transition on $X$ existed from state $p$ to $q$ in LR(1), in LALR there is a transition from $\text{merged}(p)$ to $\text{merged}(q)$.
5. Build ACTION and GOTO tables.
6. **Merge-Induced Conflicts**:
   Merging cores cannot introduce Shift/Reduce conflicts, but **can** introduce Reduce/Reduce conflicts (Dragon Book Example 4.55). The system isolates and explains these conflicts mathematically.

---

## 3. Dynamic Parse Tree Construction

### Top-Down (LL(1))
Constructed recursively during predictive expansion: each non-terminal expansion attaches the right-hand side symbols as ordered children of the non-terminal node.

### Bottom-Up (LR Shift-Reduce)
Constructed directly from parser actions using a parallel node stack:
1. When shifting terminal $a$: Push a leaf node `Node(symbol=a, children=[])` to the node stack.
2. When reducing by $A \to X_1 \dots X_k$:
   - Pop $k$ nodes from the node stack.
   - For epsilon ($k=0$), create a leaf child `Node(symbol='ε', children=[])`.
   - Create non-terminal node `Node(symbol=A, children=popped_nodes)`.
   - Push non-terminal node to the node stack.
3. Upon accept: The top of the node stack is the root of the complete parse tree.
