"""
grammar_parser.py

Parses raw user-entered CFG text into the internal Grammar data structure.
Supports:
  - "->" as the production arrow
  - "|" to separate alternatives
  - "ε" or the literal word "epsilon" for empty productions
  - "#" line comments
  - blank lines
  - multi-character terminals (space separated tokens, e.g. "id", "if")
  - non-terminals with primes, e.g. E'

This module performs NO semantic validation (undefined symbols, duplicate
productions, etc.) -- that is grammar_validator.py's job. This module only
turns text into a structural Grammar object (or raises GrammarError on
malformed syntax it cannot parse at all).
"""

import re
from typing import List

from app.models.grammar import Grammar, Production, GrammarError, EPSILON

ARROW_PATTERN = re.compile(r"->|\u2192|::=")
EPSILON_WORDS = {"epsilon", "eps", "ε", EPSILON}


def _normalize_symbol(sym: str) -> str:
    if sym.lower() in EPSILON_WORDS:
        return EPSILON
    return sym


def _strip_comment(line: str) -> str:
    # '#' is a comment marker unless it is being used as an actual grammar
    # symbol (extremely unlikely in this project's context), so we simply
    # cut at the first '#'.
    idx = line.find("#")
    if idx != -1:
        return line[:idx]
    return line


def _tokenize_rhs_alt(alt_text: str) -> List[str]:
    alt_text = alt_text.strip()
    if alt_text == "":
        raise GrammarError(
            "A production alternative is empty.",
            hint="If you intend an empty (epsilon) production, write it explicitly as ε or 'epsilon'.",
        )
    tokens = alt_text.split()
    tokens = [_normalize_symbol(t) for t in tokens]
    return tokens


def parse_grammar_text(raw_text: str, start_symbol_override: str = None) -> Grammar:
    if raw_text is None or raw_text.strip() == "":
        raise GrammarError("The grammar is empty.", hint="Enter at least one production, e.g. 'S -> a'.")

    lines = raw_text.splitlines()
    non_terminals: List[str] = []
    productions_by_lhs = {}
    order_seen = []

    for raw_line in lines:
        line = _strip_comment(raw_line).strip()
        if line == "":
            continue

        if not ARROW_PATTERN.search(line):
            raise GrammarError(
                f"No arrow ('->') found in this line.",
                production_text=raw_line.strip(),
                hint="Every production must have the form 'A -> alpha | beta'.",
            )

        parts = ARROW_PATTERN.split(line, maxsplit=1)
        if len(parts) != 2:
            raise GrammarError(
                "Malformed production: could not split on '->'.",
                production_text=raw_line.strip(),
            )

        lhs_text, rhs_text = parts[0].strip(), parts[1].strip()

        if lhs_text == "":
            raise GrammarError(
                "The left-hand side is missing.",
                production_text=raw_line.strip(),
                hint="A production must start with a single non-terminal, e.g. 'A -> ...'.",
            )
        if " " in lhs_text or "\t" in lhs_text:
            raise GrammarError(
                f"The left-hand side '{lhs_text}' must be a single non-terminal symbol (no spaces).",
                production_text=raw_line.strip(),
            )

        if rhs_text == "":
            raise GrammarError(
                "The right-hand side is missing.",
                production_text=raw_line.strip(),
                hint="If an empty production is intended, use: " + f"{lhs_text} -> ε",
            )

        lhs = lhs_text
        if lhs not in productions_by_lhs:
            productions_by_lhs[lhs] = []
            order_seen.append(lhs)

        alternatives = rhs_text.split("|")
        for alt in alternatives:
            tokens = _tokenize_rhs_alt(alt)
            if len(tokens) > 1 and EPSILON in tokens:
                raise GrammarError(
                    f"Invalid epsilon placement in '{lhs} -> {alt.strip()}'.",
                    production_text=raw_line.strip(),
                    hint="ε must be the ONLY symbol on a production's right-hand side, e.g. 'A -> ε'.",
                )
            productions_by_lhs[lhs].append(tokens)

    if not order_seen:
        raise GrammarError("No valid productions were found.")

    non_terminals = list(order_seen)

    # Determine terminals: any RHS symbol that never appears as an LHS, and is not epsilon.
    terminal_set = set()
    for lhs, alts in productions_by_lhs.items():
        for alt in alts:
            for sym in alt:
                if sym == EPSILON:
                    continue
                if sym not in non_terminals:
                    terminal_set.add(sym)

    # Preserve a stable, human-friendly order for terminals: order of first appearance.
    terminals: List[str] = []
    seen = set()
    for lhs, alts in productions_by_lhs.items():
        for alt in alts:
            for sym in alt:
                if sym == EPSILON:
                    continue
                if sym in terminal_set and sym not in seen:
                    terminals.append(sym)
                    seen.add(sym)

    start_symbol = start_symbol_override if start_symbol_override else non_terminals[0]
    if start_symbol not in non_terminals:
        raise GrammarError(
            f"Requested start symbol '{start_symbol}' is not a non-terminal in this grammar."
        )

    productions = {}
    for lhs in non_terminals:
        prods = []
        for i, alt in enumerate(productions_by_lhs[lhs]):
            prods.append(Production(id=f"{lhs}::{i}", lhs=lhs, rhs=alt))
        productions[lhs] = prods

    grammar = Grammar(
        start_symbol=start_symbol,
        non_terminals=non_terminals,
        terminals=terminals,
        productions=productions,
    )
    return grammar
