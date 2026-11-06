"""
automaton.py

Implements Canonical LR(1) CLOSURE, GOTO, and Canonical Collection construction.
Uses exact FIRST(beta a) calculation for lookahead propagation with deterministic
state numbering and transition graph generation.
"""

from typing import Set, List, Dict, Tuple, Optional
from app.models.grammar import EPSILON, END_MARKER
from app.services.bottom_up.augmented import AugmentedGrammar
from app.services.bottom_up.item import LR1Item


def first_of_sequence_with_lookahead(
    seq: Tuple[str, ...],
    lookahead: str,
    first_table: Dict[str, Set[str]]
) -> Set[str]:
    """
    Computes FIRST(beta a) where seq is beta and lookahead is a terminal/$.
    """
    result: Set[str] = set()
    all_nullable = True

    for sym in seq:
        sym_first = first_table.get(sym, {sym})
        result |= (sym_first - {EPSILON})
        if EPSILON not in sym_first:
            all_nullable = False
            break

    if all_nullable:
        result.add(lookahead)

    return result


def closure_lr1(
    kernel_items: Set[LR1Item],
    aug_grammar: AugmentedGrammar,
    first_table: Dict[str, Set[str]]
) -> Tuple[Set[LR1Item], List[str]]:
    """
    Computes CLOSURE for a set of LR(1) items.
    For each [A -> alpha . B beta, a] in items:
      For each production B -> gamma:
        For each b in FIRST(beta a):
          add [B -> . gamma, b]
    """
    items = set(kernel_items)
    worklist = list(kernel_items)
    explanation: List[str] = []

    while worklist:
        item = worklist.pop()
        sym = item.next_symbol
        if sym and sym in aug_grammar.non_terminals:
            # beta is the sequence after sym
            if item.is_epsilon:
                beta = ()
            else:
                beta = item.rhs[item.dot + 1:]

            lookaheads = first_of_sequence_with_lookahead(beta, item.lookahead, first_table)

            for p in aug_grammar.productions_by_lhs.get(sym, []):
                for b in lookaheads:
                    new_item = LR1Item(
                        prod_index=p.index,
                        lhs=p.lhs,
                        rhs=p.rhs,
                        dot=0,
                        lookahead=b,
                    )
                    if new_item not in items:
                        items.add(new_item)
                        worklist.append(new_item)
                        beta_str = " ".join(beta) if beta else "\u03b5"
                        explanation.append(
                            f"From '{item}': FIRST({beta_str} {item.lookahead}) contains '{b}'. Added '{new_item}'."
                        )

    return items, explanation


def goto_lr1(
    items: Set[LR1Item],
    symbol: str,
    aug_grammar: AugmentedGrammar,
    first_table: Dict[str, Set[str]]
) -> Tuple[Set[LR1Item], Set[LR1Item]]:
    """
    Computes GOTO(I, X) for LR(1) items.
    """
    kernel = set()
    for item in items:
        if item.next_symbol == symbol:
            kernel.add(item.advance())

    if not kernel:
        return set(), set()

    closure_items, _ = closure_lr1(kernel, aug_grammar, first_table)
    return closure_items, kernel


class CLR1Automaton:
    def __init__(self, aug_grammar: AugmentedGrammar, first_table: Dict[str, Set[str]]):
        self.aug_grammar = aug_grammar
        self.first_table = first_table
        self.states: List[Dict] = []
        self.transitions: List[Dict] = []
        self.state_items_map: Dict[int, Set[LR1Item]] = {}
        self.transition_map: Dict[Tuple[int, str], int] = {}
        self._build()

    def _build(self):
        # Initial item: [S' -> . S, $]
        p0 = self.aug_grammar.productions[0]
        init_kernel = {LR1Item(prod_index=0, lhs=p0.lhs, rhs=p0.rhs, dot=0, lookahead=END_MARKER)}
        init_items, init_steps = closure_lr1(init_kernel, self.aug_grammar, self.first_table)

        canonical_sets: List[frozenset[LR1Item]] = [frozenset(init_items)]
        canonical_map: Dict[frozenset[LR1Item], int] = {frozenset(init_items): 0}
        self.state_items_map[0] = init_items

        queue = [0]
        state_kernels: Dict[int, Set[LR1Item]] = {0: init_kernel}
        state_closure_steps: Dict[int, List[str]] = {0: init_steps}

        while queue:
            state_id = queue.pop(0)
            current_items = self.state_items_map[state_id]

            symbols_to_check = []
            for item in current_items:
                sym = item.next_symbol
                if sym and sym not in symbols_to_check:
                    symbols_to_check.append(sym)

            symbols_to_check.sort(
                key=lambda s: (
                    0 if s in self.aug_grammar.non_terminals else 1,
                    s
                )
            )

            for sym in symbols_to_check:
                next_items, next_kernel = goto_lr1(current_items, sym, self.aug_grammar, self.first_table)
                if not next_items:
                    continue

                f_next = frozenset(next_items)
                if f_next not in canonical_map:
                    new_id = len(canonical_sets)
                    canonical_sets.append(f_next)
                    canonical_map[f_next] = new_id
                    self.state_items_map[new_id] = next_items
                    state_kernels[new_id] = next_kernel
                    _, steps = closure_lr1(next_kernel, self.aug_grammar, self.first_table)
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

        aug_start = self.aug_grammar.augmented_start_symbol
        orig_start = self.aug_grammar.start_symbol

        for sid in range(len(canonical_sets)):
            items = self.state_items_map[sid]
            sorted_items = sorted(
                items,
                key=lambda it: (it.prod_index, it.dot, it.lookahead)
            )
            kernel_items = [it for it in sorted_items if it.is_kernel]
            non_kernel = [it for it in sorted_items if not it.is_kernel]

            is_accepting = any(
                it.lhs == aug_start and it.rhs == (orig_start,) and it.dot == 1 and it.lookahead == END_MARKER
                for it in items
            )

            # Group items with identical core for compact visualization
            core_grouped: Dict[Tuple, List[str]] = {}
            core_item_ref: Dict[Tuple, LR1Item] = {}
            for it in sorted_items:
                c_key = (it.prod_index, it.dot)
                if c_key not in core_grouped:
                    core_grouped[c_key] = []
                    core_item_ref[c_key] = it
                core_grouped[c_key].append(it.lookahead)

            grouped_items_display = []
            for c_key, las in core_grouped.items():
                ref_it = core_item_ref[c_key]
                grouped_items_display.append({
                    "prod_index": ref_it.prod_index,
                    "lhs": ref_it.lhs,
                    "rhs": list(ref_it.rhs),
                    "dot": ref_it.dot,
                    "lookaheads": sorted(las),
                    "text": f"[{ref_it.core}, {', '.join(sorted(las))}]",
                    "is_reduction": ref_it.is_reduction,
                    "is_kernel": ref_it.is_kernel,
                })

            self.states.append({
                "id": sid,
                "label": f"I{sid}",
                "items": [it.to_dict() for it in sorted_items],
                "grouped_items": grouped_items_display,
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

