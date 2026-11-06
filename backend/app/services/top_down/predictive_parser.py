"""
predictive_parser.py

Standard table-driven LL(1) predictive parser.

Given:
  - the (transformed) grammar
  - the parsing table (Production objects, keyed [non_terminal][terminal])
  - an input token string

Produces a full step-by-step trace (stack / remaining input / action) and
either an "accept" or a structured parse error, plus the raw sequence of
production applications needed to build the parse tree.
"""

from typing import Dict, List
from app.models.grammar import Grammar, EPSILON, END_MARKER


def tokenize_input(input_text: str) -> List[str]:
    tokens = input_text.strip().split()
    return tokens


def run_predictive_parse(g: Grammar, internal_table: Dict, input_text: str) -> Dict:
    tokens = tokenize_input(input_text)
    tokens.append(END_MARKER)

    stack = [END_MARKER, g.start_symbol]
    pos = 0
    steps = []
    production_sequence = []  # list of (production_or_None, kind) applied, in order, for parse-tree building
    step_no = 0

    def stack_str(s):
        return " ".join(s[::-1]) if False else " ".join(s)

    error = None

    while True:
        step_no += 1
        top = stack[-1]
        remaining_input = " ".join(tokens[pos:])
        current_token = tokens[pos] if pos < len(tokens) else END_MARKER

        if top == END_MARKER and current_token == END_MARKER:
            steps.append({
                "step": step_no,
                "stack": stack_str(stack),
                "input": remaining_input,
                "action": "Accept",
            })
            break

        if top not in g.non_terminals:
            # top is a terminal (or $) -- must match
            if top == current_token:
                steps.append({
                    "step": step_no,
                    "stack": stack_str(stack),
                    "input": remaining_input,
                    "action": f"Match '{top}'",
                })
                stack.pop()
                pos += 1
                continue
            else:
                error = {
                    "step": step_no,
                    "stack": stack_str(stack),
                    "input": remaining_input,
                    "found": current_token,
                    "expected": [top],
                    "message": (
                        f"Expected '{top}' but found '{current_token}'."
                    ),
                }
                steps.append({
                    "step": step_no,
                    "stack": stack_str(stack),
                    "input": remaining_input,
                    "action": f"ERROR: expected '{top}', found '{current_token}'",
                })
                break
        else:
            # top is a non-terminal -- consult the table
            entries = internal_table.get(top, {}).get(current_token, [])
            if len(entries) == 0:
                expected = [
                    col for col, plist in internal_table.get(top, {}).items() if plist
                ]
                error = {
                    "step": step_no,
                    "stack": stack_str(stack),
                    "input": remaining_input,
                    "found": current_token,
                    "expected": expected,
                    "message": (
                        f"No production exists for M[{top}, {current_token}]. "
                        f"Expected one of: {', '.join(expected) if expected else '(nothing -- grammar exhausted)'}"
                    ),
                }
                steps.append({
                    "step": step_no,
                    "stack": stack_str(stack),
                    "input": remaining_input,
                    "action": f"ERROR: no rule for M[{top}, {current_token}]",
                })
                break

            production = entries[0]  # if a conflict exists, we deterministically pick the first for demo purposes
            steps.append({
                "step": step_no,
                "stack": stack_str(stack),
                "input": remaining_input,
                "action": f"{top} \u2192 {' '.join(production.rhs)}",
            })
            production_sequence.append({"non_terminal": top, "production": str(production), "rhs": list(production.rhs)})
            stack.pop()
            if production.rhs != [EPSILON]:
                for sym in reversed(production.rhs):
                    stack.append(sym)

        if step_no > 5000:
            error = {"message": "Parsing exceeded maximum step limit (possible infinite loop)."}
            break

    accepted = error is None
    return {
        "tokens": tokens,
        "steps": steps,
        "accepted": accepted,
        "error": error,
        "production_sequence": production_sequence,
    }
