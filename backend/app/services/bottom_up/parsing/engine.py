"""
engine.py

Generic table-driven LR parsing engine and dynamic parse tree construction
from actual shift/reduce operations.
Supports LR(0), SLR(1), CLR(1), and LALR(1).
"""

from typing import List, Dict, Any, Optional
from app.models.grammar import END_MARKER, EPSILON
from app.services.bottom_up.augmented import AugmentedGrammar


def tokenize_input(input_str: str, terminals: List[str]) -> List[str]:
    """
    Tokenizes input string. Supports space-separated tokens or matches against
    known grammar terminals.
    """
    cleaned = input_str.strip()
    if not cleaned:
        return [END_MARKER]

    # If the user separated tokens with spaces, use them
    raw_tokens = cleaned.split()

    # Verify if all space-split tokens are in terminals
    valid_terms = set(terminals)
    valid_terms.add(END_MARKER)

    # If tokens directly match, return them
    all_match = all(t in valid_terms for t in raw_tokens)
    if all_match:
        if raw_tokens[-1] != END_MARKER:
            raw_tokens.append(END_MARKER)
        return raw_tokens

    # Otherwise, fallback tokenization using longest-match against known terminals
    # Sort terminals by length descending to match multi-char terminals like 'id', '==' before 'i', '='
    sorted_terms = sorted([t for t in terminals if t != "$" and t != EPSILON], key=len, reverse=True)

    tokens: List[str] = []
    idx = 0
    text_len = len(cleaned)

    while idx < text_len:
        if cleaned[idx].isspace():
            idx += 1
            continue

        matched = False
        for t in sorted_terms:
            if cleaned.startswith(t, idx):
                tokens.append(t)
                idx += len(t)
                matched = True
                break

        if not matched:
            # Single non-space character as unknown token
            tokens.append(cleaned[idx])
            idx += 1

    tokens.append(END_MARKER)
    return tokens


def run_bottom_up_parse(
    aug_grammar: AugmentedGrammar,
    action_table: Dict[int, Dict[str, List[Dict[str, Any]]]],
    goto_table: Dict[int, Dict[str, Any]],
    input_str: str,
    max_steps: int = 500
) -> Dict[str, Any]:
    """
    Executes shift-reduce parsing using provided ACTION and GOTO tables.
    Builds the exact parse tree dynamically from shift/reduce stack operations.
    """
    terminals = aug_grammar.terminals
    tokens = tokenize_input(input_str, terminals)

    state_stack: List[int] = [0]
    symbol_stack: List[str] = []
    node_stack: List[Dict[str, Any]] = []

    steps: List[Dict[str, Any]] = []
    node_id_counter = 0

    token_index = 0
    accepted = False
    error: Optional[Dict[str, Any]] = None
    step_count = 0

    while step_count < max_steps:
        step_count += 1
        current_state = state_stack[-1]
        current_token = tokens[token_index] if token_index < len(tokens) else END_MARKER

        # Remaining input tokens
        remaining = tokens[token_index:]
        remaining_str = " ".join(remaining)

        # Lookup action
        state_actions = action_table.get(current_state, {})
        actions = state_actions.get(current_token, [])

        if not actions:
            expected = [t for t, acts in state_actions.items() if acts]
            err_msg = (
                f"Syntax error at step {step_count}: Unexpected token '{current_token}' in state I{current_state}. "
                f"Expected one of: {', '.join(sorted(expected)) if expected else 'none'}."
            )
            error = {
                "message": err_msg,
                "step": step_count,
                "token": current_token,
                "state": current_state,
                "expected": sorted(expected),
            }
            steps.append({
                "step": step_count,
                "state_stack": list(state_stack),
                "symbol_stack": list(symbol_stack),
                "remaining_input": remaining_str,
                "action": f"Error: unexpected '{current_token}'",
                "action_type": "error",
                "explanation": err_msg,
            })
            break

        # If conflicts exist in table, report conflict in trace
        has_conflict = len(actions) > 1
        chosen_action = actions[0]

        act_type = chosen_action["type"]

        if act_type == "shift":
            target_state = chosen_action["target"]
            action_desc = f"Shift s{target_state}"
            if has_conflict:
                action_desc += f" (Conflict in I{current_state} on '{current_token}')"

            steps.append({
                "step": step_count,
                "state_stack": list(state_stack),
                "symbol_stack": list(symbol_stack),
                "remaining_input": remaining_str,
                "action": action_desc,
                "action_type": "shift",
                "explanation": chosen_action.get("reason", f"Shift '{current_token}' and push state I{target_state}."),
            })

            # Create leaf parse-tree node
            node_id_counter += 1
            leaf_node = {
                "id": f"node_{node_id_counter}",
                "symbol": current_token,
                "is_terminal": True,
                "children": [],
            }
            node_stack.append(leaf_node)

            # Update stacks
            state_stack.append(target_state)
            symbol_stack.append(current_token)
            token_index += 1

        elif act_type == "reduce":
            prod_idx = chosen_action["production_index"]
            prod = aug_grammar.get_production(prod_idx)
            lhs = prod.lhs
            rhs = prod.rhs
            is_eps = prod.is_epsilon
            rhs_len = 0 if is_eps else len(rhs)

            action_desc = f"Reduce r{prod_idx} ({lhs} -> {prod.rhs_str})"
            if has_conflict:
                action_desc += f" (Conflict in I{current_state} on '{current_token}')"

            # Pop rhs_len symbols and states
            popped_children: List[Dict[str, Any]] = []
            for _ in range(rhs_len):
                if state_stack:
                    state_stack.pop()
                if symbol_stack:
                    symbol_stack.pop()
                if node_stack:
                    popped_children.insert(0, node_stack.pop())

            if is_eps:
                node_id_counter += 1
                eps_child = {
                    "id": f"node_{node_id_counter}",
                    "symbol": "\u03b5",
                    "is_terminal": True,
                    "children": [],
                }
                popped_children = [eps_child]

            # Top of state stack after pop
            top_state = state_stack[-1]
            goto_target = goto_table.get(top_state, {}).get(lhs)

            if goto_target is None:
                err_msg = f"Internal parsing error: GOTO(I{top_state}, {lhs}) is undefined after reduction."
                error = {"message": err_msg, "step": step_count}
                steps.append({
                    "step": step_count,
                    "state_stack": list(state_stack),
                    "symbol_stack": list(symbol_stack),
                    "remaining_input": remaining_str,
                    "action": f"Error: no GOTO({top_state}, {lhs})",
                    "action_type": "error",
                    "explanation": err_msg,
                })
                break

            steps.append({
                "step": step_count,
                "state_stack": list(state_stack),
                "symbol_stack": list(symbol_stack),
                "remaining_input": remaining_str,
                "action": f"{action_desc} (GOTO I{goto_target})",
                "action_type": "reduce",
                "explanation": f"Popped {rhs_len} symbol(s), uncovered state I{top_state}. GOTO(I{top_state}, {lhs}) = I{goto_target}.",
            })

            # Create non-terminal node
            node_id_counter += 1
            nt_node = {
                "id": f"node_{node_id_counter}",
                "symbol": lhs,
                "is_terminal": False,
                "production": f"{lhs} -> {prod.rhs_str}",
                "children": popped_children,
            }
            node_stack.append(nt_node)

            # Push GOTO state and LHS
            state_stack.append(goto_target)
            symbol_stack.append(lhs)

        elif act_type == "accept":
            steps.append({
                "step": step_count,
                "state_stack": list(state_stack),
                "symbol_stack": list(symbol_stack),
                "remaining_input": remaining_str,
                "action": "Accept",
                "action_type": "accept",
                "explanation": "Augmented start symbol completed. Input successfully parsed!",
            })
            accepted = True
            break

    if step_count >= max_steps and not accepted and not error:
        error = {
            "message": f"Parsing halted: step limit ({max_steps}) exceeded. Possible cycle in parsing table.",
            "step": step_count,
        }

    # The parse tree root is the top node in node_stack upon acceptance
    parse_tree = node_stack[0] if (accepted and node_stack) else None

    return {
        "tokens": tokens,
        "steps": steps,
        "accepted": accepted,
        "error": error,
        "parse_tree": parse_tree,
        "step_count": len(steps),
    }

