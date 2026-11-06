"""
tree_builder.py

Formats parse tree node structures for rendering.
"""

from typing import Dict, Any, Optional


def count_tree_nodes(node: Optional[Dict[str, Any]]) -> int:
    if not node:
        return 0
    count = 1
    for ch in node.get("children", []):
        count += count_tree_nodes(ch)
    return count

