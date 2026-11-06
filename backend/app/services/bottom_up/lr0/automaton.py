"""
automaton.py

Implements LR(0) CLOSURE, GOTO, and Canonical Collection construction of LR(0)
item sets with deterministic state numbering, step derivations, and transition
graph generation for visualization.
"""

from typing import Set, List, Dict, Tuple, Optional
from app.services.bottom_up.augmented import AugmentedGrammar
from app.services.bottom_up.item import LR0Item


def closure_lr0(
    kernel_items: Set[LR0Item],
    aug_grammar: AugmentedGrammar
) -> Tuple[Set[LR0Item], List[str]]:
    """
    Computes CLOSURE(I) for a set of LR(0) items.
    If A -> alpha . B beta is in I, add B -> . gamma for each production of B.
    Repeats until no new items are added.
    """
    items = set(kernel_items)
    worklist = list(kernel_items)
    explanation: List[str] = []

    while worklist:
        item = worklist.pop()
        sym = item.next_symbol
        if sym and sym in aug_grammar.non_terminals:
            for p in aug_grammar.productions_by_lhs.get(sym, []):
                new_item = LR0Item(
                    prod_index=p.index,
                    lhs=p.lhs,
                    rhs=p.rhs,
                    dot=0,
                )
                if new_item not in items:
                    items.add(new_item)
                    worklist.append(new_item)
                    explanation.append(
                        f"From '{item}', dot precedes non-terminal '{sym}': added '{new_item}'."
                    )

    return items, explanation


def goto_lr0(
    items: Set[LR0Item],
    symbol: str,
    aug_grammar: AugmentedGrammar
) -> Tuple[Set[LR0Item], Set[LR0Item]]:
    """
    Computes GOTO(I, X) = CLOSURE({ A -> alpha X . beta | A -> alpha . X beta in I }).
    Returns (full_closure_items, kernel_items).
    """
    kernel = set()
    for item in items:
        if item.next_symbol == symbol:
            kernel.add(item.advance())

    if not kernel:
        return set(), set()

    closure_items, _ = closure_lr0(kernel, aug_grammar)
    return closure_items, kernel


class LR0Automaton:
    def __init__(self, aug_grammar: AugmentedGrammar):
        self.aug_grammar = aug_grammar
        self.states: List[Dict] = []
        self.transitions: List[Dict] = []
        self.state_items_map: Dict[int, Set[LR0Item]] = {}
        self.transition_map: Dict[Tuple[int, str], int] = {}
        self._build()

    def _build(self):
        # Initial item: S' -> . S
        p0 = self.aug_grammar.productions[0]
        init_kernel = {LR0Item(prod_index=0, lhs=p0.lhs, rhs=p0.rhs, dot=0)}
        init_items, init_steps = closure_lr0(init_kernel, self.aug_grammar)

        # Canonical collection list of frozensets
        canonical_sets: List[frozenset[LR0Item]] = [frozenset(init_items)]
        canonical_map: Dict[frozenset[LR0Item], int] = {frozenset(init_items): 0}
        self.state_items_map[0] = init_items

        all_symbols = [nt for nt in self.aug_grammar.non_terminals if nt != self.aug_grammar.augmented_start_symbol]
        all_symbols += [t for t in self.aug_grammar.terminals if t != "$"]

        queue = [0]
        state_kernels: Dict[int, Set[LR0Item]] = {0: init_kernel}
        state_closure_steps: Dict[int, List[str]] = {0: init_steps}

        while queue:
            state_id = queue.pop(0)
            current_items = self.state_items_map[state_id]

            # Find all symbols following a dot in the current items
            symbols_to_check = []
            for item in current_items:
                sym = item.next_symbol
                if sym and sym not in symbols_to_check:
                    symbols_to_check.append(sym)

            # Sort symbols predictably: non-terminals first in grammar order, then terminals
            symbols_to_check.sort(
                key=lambda s: (
                    0 if s in self.aug_grammar.non_terminals else 1,
                    s
                )
            )

            for sym in symbols_to_check:
                next_items, next_kernel = goto_lr0(current_items, sym, self.aug_grammar)
                if not next_items:
                    continue

                f_next = frozenset(next_items)
                if f_next not in canonical_map:
                    new_id = len(canonical_sets)
                    canonical_sets.append(f_next)
                    canonical_map[f_next] = new_id
                    self.state_items_map[new_id] = next_items
                    state_kernels[new_id] = next_kernel
                    # Compute closure steps for explanation
                    _, steps = closure_lr0(next_kernel, self.aug_grammar)
                    state_closure_steps[new_id] = steps
                    queue.append(new_id)
                target_id = canonical_map[f_next]

                self.transition_map[(state_id, sym)] = target_id
                self.transitions.append({
                    "from_state": state_id,
                    "to_state": target_id,
                    "symbol": sym,
                    "is_terminal": sym in self.aug_grammar.terminals,
                })

        # Format state structures
        aug_start = self.aug_grammar.augmented_start_symbol
        orig_start = self.aug_grammar.start_symbol

        for sid in range(len(canonical_sets)):
            items = self.state_items_map[sid]
            sorted_items = sorted(
                items,
                key=lambda it: (it.prod_index, it.dot)
            )
            kernel_items = [it for it in sorted_items if it.is_kernel]
            non_kernel = [it for it in sorted_items if not it.is_kernel]

            # Accepting state has S' -> S .
            is_accepting = any(
                it.lhs == aug_start and it.rhs == (orig_start,) and it.dot == 1
                for it in items
            )

            self.states.append({
                "id": sid,
                "label": f"I{sid}",
                "items": [it.to_dict() for it in sorted_items],
                "kernel_items": [it.to_dict() for it in kernel_items],
                "non_kernel_items": [it.to_dict() for it in non_kernel],
                "is_start": sid == 0,
                "is_accepting": is_accepting,
                "closure_steps": state_closure_steps.get(sid, []),
            })

    def to_dict(self) -> dict:
        return {
            "states": self.states,
            "transitions": self.transitions,
            "state_count": len(self.states),
            "transition_count": len(self.transitions),
        }

