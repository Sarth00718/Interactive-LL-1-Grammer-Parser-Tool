"""
left_recursion.py

Two responsibilities:

1. detect_left_recursion(grammar)
   - finds DIRECT left recursion:  A -> A alpha
   - finds INDIRECT left recursion via cycle detection on the "can-start-with"
     graph: A -> B ... creates an edge A -> B whenever B can be the first
     symbol derived by A (i.e. B is the first RHS symbol, or a nullable
     prefix precedes it). A cycle in this graph (A -> B -> ... -> A) is
     indirect left recursion.

2. eliminate_left_recursion(grammar)
   - implements the standard textbook algorithm (Aho/Ullman "Dragon Book"):

        arrange non-terminals A1 ... An in some order
        for i = 1 to n:
            for j = 1 to i-1:
                replace each production of the form Ai -> Aj gamma
                with Ai -> delta1 gamma | delta2 gamma | ...
                where Aj -> delta1 | delta2 | ... are the current Aj productions
            eliminate the immediate left recursion among the Ai productions

   This removes BOTH direct and indirect left recursion (for grammars without
   epsilon-cycles/left-recursive-only non-terminals, which is the standard
   scope taught in a compiler design course).
"""

from typing import Dict, List, Set, Tuple
from app.models.grammar import Grammar, Production, EPSILON, GrammarError


def _nullable_first_symbol_chain(g: Grammar, rhs: List[str]) -> List[str]:
    """
    Returns the list of non-terminals that could be "reached first" while
    scanning rhs left to right (used for indirect-left-recursion graph
    building). We only need to know which non-terminal(s) could legitimately
    be the FIRST symbol actually derived -- for a simple, teachable version
    we just look at rhs[0] if it's a non-terminal (this captures the cases
    used in the standard course examples: A -> B a, B -> A b | c).
    """
    if not rhs:
        return []
    first = rhs[0]
    if first == EPSILON:
        return []
    return [first] if g.is_non_terminal(first) else []


def detect_left_recursion(g: Grammar) -> Dict:
    direct = []
    for nt in g.non_terminals:
        for p in g.productions.get(nt, []):
            if p.rhs and p.rhs[0] == nt:
                direct.append({
                    "non_terminal": nt,
                    "production": str(p),
                    "production_id": p.id,
                    "reason": f"'{nt}' appears as the first symbol on the RHS of a production whose LHS is also '{nt}'.",
                })

    # Build "can start with" graph for indirect recursion.
    graph: Dict[str, Set[str]] = {nt: set() for nt in g.non_terminals}
    edge_examples: Dict[Tuple[str, str], str] = {}
    for nt in g.non_terminals:
        for p in g.productions.get(nt, []):
            for start_nt in _nullable_first_symbol_chain(g, p.rhs):
                graph[nt].add(start_nt)
                edge_examples.setdefault((nt, start_nt), str(p))

    indirect_cycles = []
    visited_global = set()

    def find_cycle_from(start: str):
        # DFS to find a cycle back to `start`
        stack = [(start, [start])]
        seen_paths = set()
        while stack:
            node, path = stack.pop()
            for nxt in graph.get(node, []):
                if nxt == start and len(path) > 1:
                    return path + [start]
                if nxt not in path:
                    stack.append((nxt, path + [nxt]))
        return None

    for nt in g.non_terminals:
        if nt in visited_global:
            continue
        cycle = find_cycle_from(nt)
        if cycle:
            key = frozenset(cycle[:-1])
            if key not in {frozenset(c["cycle"][:-1]) for c in indirect_cycles}:
                indirect_cycles.append({
                    "cycle": cycle,
                    "description": " \u2192 ".join(cycle),
                })
        visited_global.add(nt)

    # Direct recursion already shows as a 1-node cycle; exclude those from indirect list.
    indirect_only = [c for c in indirect_cycles if len(set(c["cycle"])) > 1]

    return {
        "has_direct_left_recursion": len(direct) > 0,
        "has_indirect_left_recursion": len(indirect_only) > 0,
        "direct": direct,
        "indirect": indirect_only,
    }


def _fresh_name(base: str, existing: Set[str]) -> str:
    candidate = base + "'"
    while candidate in existing:
        candidate = candidate + "'"
    return candidate


def eliminate_left_recursion(g: Grammar) -> Dict:
    """
    Returns a dict:
      {
        "grammar": <new Grammar, left-recursion free>,
        "steps": [ {before, after, kind, non_terminal, explanation}, ... ],
        "changed": bool
      }
    """
    detection = detect_left_recursion(g)
    if not detection["has_direct_left_recursion"] and not detection["has_indirect_left_recursion"]:
        return {"grammar": g.clone(), "steps": [], "changed": False}

    order = list(g.non_terminals)  # A1..An in declaration order
    # Work on a mutable copy: dict lhs -> list[List[str]] (list of rhs token lists)
    prods: Dict[str, List[List[str]]] = {
        nt: [list(p.rhs) for p in g.productions.get(nt, [])] for nt in order
    }
    all_names: Set[str] = set(order)
    steps = []
    new_non_terminal_order: List[str] = list(order)

    for i in range(len(order)):
        ai = order[i]
        # Step: substitute earlier non-terminals
        for j in range(i):
            aj = order[j]
            before_snapshot = list(prods[ai])
            expanded: List[List[str]] = []
            substituted_any = False
            for rhs in prods[ai]:
                if rhs and rhs[0] == aj:
                    substituted_any = True
                    tail = rhs[1:]
                    for aj_rhs in prods[aj]:
                        if aj_rhs == [EPSILON]:
                            combined = list(tail) if tail else [EPSILON]
                        else:
                            combined = list(aj_rhs) + tail
                        expanded.append(combined if combined else [EPSILON])
                else:
                    expanded.append(rhs)
            if substituted_any:
                prods[ai] = expanded
                steps.append({
                    "kind": "substitution",
                    "non_terminal": ai,
                    "explanation": f"Substituted productions of '{aj}' into '{ai}' productions that began with '{aj}', "
                                    f"since '{ai}' -> '{aj}' ... would otherwise leave indirect left recursion.",
                    "before": f"{ai} -> " + " | ".join(" ".join(r) for r in before_snapshot),
                    "after": f"{ai} -> " + " | ".join(" ".join(r) for r in prods[ai]),
                })

        # Step: eliminate immediate left recursion on ai now
        recursive_alts = [r for r in prods[ai] if r and r[0] == ai]
        non_recursive_alts = [r for r in prods[ai] if not (r and r[0] == ai)]

        if recursive_alts:
            before_snapshot = f"{ai} -> " + " | ".join(" ".join(r) for r in prods[ai])
            new_nt = _fresh_name(ai, all_names)
            all_names.add(new_nt)

            betas = non_recursive_alts if non_recursive_alts else [[EPSILON]]
            # β could itself be epsilon if original had A -> A a | ε (edge case); guard against empty
            betas = [b if b else [EPSILON] for b in betas]

            new_ai_prods = [list(b) + [new_nt] for b in betas]
            alphas = [r[1:] for r in recursive_alts]  # strip leading Ai
            alphas = [a if a else [EPSILON] for a in alphas]
            new_nt_prods = [list(a) + [new_nt] for a in alphas] + [[EPSILON]]

            prods[ai] = new_ai_prods
            prods[new_nt] = new_nt_prods
            # Insert new_nt immediately after ai in ordering
            insert_pos = new_non_terminal_order.index(ai) + 1
            new_non_terminal_order.insert(insert_pos, new_nt)

            after_snapshot = (
                f"{ai} -> " + " | ".join(" ".join(r) for r in prods[ai]) + "\n" +
                f"{new_nt} -> " + " | ".join(" ".join(r) for r in prods[new_nt])
            )
            steps.append({
                "kind": "immediate_elimination",
                "non_terminal": ai,
                "new_non_terminal": new_nt,
                "explanation": (
                    f"'{ai}' had immediate left recursion. Using the transformation "
                    f"A -> A\u03b1 | \u03b2  \u21d2  A -> \u03b2 A' , A' -> \u03b1 A' | \u03b5, "
                    f"we introduce '{new_nt}'."
                ),
                "before": before_snapshot,
                "after": after_snapshot,
            })

    # Rebuild Grammar object
    new_terminals = set(g.terminals)
    new_productions: Dict[str, List[Production]] = {}
    for nt in new_non_terminal_order:
        plist = []
        for idx, rhs in enumerate(prods.get(nt, [])):
            plist.append(Production(id=f"{nt}::{idx}", lhs=nt, rhs=rhs))
        new_productions[nt] = plist

    new_grammar = Grammar(
        start_symbol=g.start_symbol,
        non_terminals=new_non_terminal_order,
        terminals=list(g.terminals),
        productions=new_productions,
    )

    return {"grammar": new_grammar, "steps": steps, "changed": True}
