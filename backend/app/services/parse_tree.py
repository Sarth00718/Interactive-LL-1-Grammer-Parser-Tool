"""
parse_tree.py

Builds a parse tree dynamically from the actual sequence of stack
operations performed by the predictive parser (see predictive_parser.py).
No tree is ever hard-coded -- it is assembled node-by-node as productions
are applied / terminals are matched, using a node stack that mirrors the
parser's symbol stack exactly.
"""

from typing import Dict, List, Optional
from app.models.grammar import Grammar, EPSILON, END_MARKER


class TreeNode:
    _counter = 0

    def __init__(self, symbol: str, is_terminal: bool):
        self.id = TreeNode._counter
        TreeNode._counter += 1
        self.symbol = symbol
        self.is_terminal = is_terminal
        self.children: List["TreeNode"] = []

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "symbol": self.symbol,
            "is_terminal": self.is_terminal,
            "children": [c.to_dict() for c in self.children],
        }


def build_parse_tree(g: Grammar, internal_table: Dict, input_text: str) -> Dict:
    """
    Re-runs the table-driven parse (identical logic to predictive_parser),
    but maintains a parallel node-stack so a tree is constructed exactly in
    step with the real parsing actions. Returns the tree (or None if the
    input was rejected before a full tree could be formed) plus the same
    step trace for consistency.
    """
    TreeNode._counter = 0
    tokens = input_text.strip().split()
    tokens.append(END_MARKER)

    root = TreeNode(g.start_symbol, is_terminal=False)
    symbol_stack = [END_MARKER, g.start_symbol]
    node_stack = [None, root]  # None placeholder aligned with END_MARKER

    pos = 0
    accepted = False
    error = None

    while True:
        top = symbol_stack[-1]
        top_node = node_stack[-1]
        current_token = tokens[pos] if pos < len(tokens) else END_MARKER

        if top == END_MARKER and current_token == END_MARKER:
            accepted = True
            break

        if top not in g.non_terminals:
            if top == current_token:
                symbol_stack.pop()
                node_stack.pop()
                pos += 1
                continue
            else:
                error = f"Expected '{top}' but found '{current_token}'."
                break
        else:
            entries = internal_table.get(top, {}).get(current_token, [])
            if not entries:
                error = f"No production for M[{top}, {current_token}]."
                break
            production = entries[0]

            symbol_stack.pop()
            node_stack.pop()

            if production.rhs == [EPSILON]:
                eps_node = TreeNode(EPSILON, is_terminal=True)
                top_node.children.append(eps_node)
            else:
                child_nodes = []
                for sym in production.rhs:
                    is_term = sym not in g.non_terminals
                    child = TreeNode(sym, is_terminal=is_term)
                    top_node.children.append(child)
                    child_nodes.append(child)
                # push in reverse so leftmost symbol is processed first
                for sym, node in zip(reversed(production.rhs), reversed(child_nodes)):
                    symbol_stack.append(sym)
                    node_stack.append(node)

        if pos > 5000 or len(symbol_stack) > 5000:
            error = "Exceeded maximum steps."
            break

    return {
        "accepted": accepted,
        "error": error,
        "tree": root.to_dict() if root else None,
    }
