import React, { useState, useMemo } from 'react'
import {
  GraduationCap,
  Search,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  RotateCcw,
  Award,
  ArrowDownToLine,
  Filter,
  Network,
} from 'lucide-react'

const VIVA_QUESTIONS = [
  {
    id: 1,
    category: 'CFG Fundamentals',
    difficulty: 'Basic',
    question: 'What is a Context-Free Grammar (CFG) and what are its four formal components?',
    answer:
      'A Context-Free Grammar is a 4-tuple G = (V, Σ, R, S), where:\n• V (or N): Finite set of Non-terminal symbols (syntactic variables).\n• Σ (or T): Finite set of Terminal symbols disjoint from V (tokens/alphabet).\n• R (or P): Finite set of Production rules of the form A → α, where A ∈ V and α ∈ (V ∪ Σ)*.\n• S: Distinguished Start symbol (S ∈ V).\nContext-free means each production replaces exactly one non-terminal on the LHS, regardless of the surrounding context.',
    tip: 'Examiners often ask why it is called "context-free" — contrast it with Context-Sensitive grammars where rules look like αAβ → αγβ.',
  },
  {
    id: 2,
    category: 'CFG Fundamentals',
    difficulty: 'Basic',
    question: 'What is an ambiguous grammar? Why is ambiguity problematic for compilers?',
    answer:
      'A grammar is ambiguous if there exists at least one string in its language that has two or more distinct parse trees (or leftmost/rightmost derivations).\nAmbiguity is fatal for programming language compilers because each parse tree induces a different semantic interpretation (e.g. expression precedence in 2 + 3 * 4 or the dangling-else problem in if-then-else statements).',
    tip: 'Remember: checking whether an arbitrary CFG is ambiguous is undecidable. However, ambiguity can often be resolved by rewriting grammar rules to enforce operator precedence and associativity.',
  },
  {
    id: 3,
    category: 'CFG Fundamentals',
    difficulty: 'Basic',
    question: 'What is the role of the special epsilon (ε) symbol in grammar productions?',
    answer:
      'Epsilon (ε) denotes the empty string (length 0). A production A → ε is called an ε-production or erasure rule. It signifies that the non-terminal A can derive nothing, making A nullable. Epsilon productions allow optional syntax (such as optional else clauses or parameter lists) but require careful handling in FIRST/FOLLOW set computation and table construction.',
    tip: 'Mention that if A is nullable, FIRST(A) contains ε, which triggers the addition of productions to M[A, b] for all b in FOLLOW(A).',
  },
  {
    id: 4,
    category: 'Top-Down LL(1)',
    difficulty: 'Basic',
    question: 'What does the abbreviation LL(1) represent?',
    answer:
      '• First "L": Left-to-right scan of the input tokens.\n• Second "L": Leftmost derivation constructed top-down from start symbol.\n• "(1)": Exactly 1 token of lookahead buffer is inspected to choose the production rule deterministically.',
    tip: 'Contrasted with LR(1): Left-to-right scan, Rightmost derivation in reverse, 1 lookahead.',
  },
  {
    id: 5,
    category: 'Top-Down LL(1)',
    difficulty: 'Intermediate',
    question: 'Define FIRST(α) and explain how it is mathematically computed.',
    answer:
      'FIRST(α) is the set of terminals that can appear as the first symbol of some string derived from α. If α can derive ε, then ε ∈ FIRST(α).\nComputation rules:\n1. If X is a terminal: FIRST(X) = {X}.\n2. If X → ε is a production: ε ∈ FIRST(X).\n3. If X → Y₁ Y₂ ... Yₖ: add (FIRST(Y₁) - {ε}) to FIRST(X). If Y₁ is nullable, add (FIRST(Y₂) - {ε}), and continue until a non-nullable Yᵢ is reached. If all Y₁...Yₖ are nullable, add ε to FIRST(X).',
    tip: 'Emphasize that FIRST is computed iteratively using a worklist fixed-point algorithm until no sets grow.',
  },
  {
    id: 6,
    category: 'Top-Down LL(1)',
    difficulty: 'Intermediate',
    question: 'Define FOLLOW(A) and explain why the end-marker "$" is placed in FOLLOW(S).',
    answer:
      'FOLLOW(A) is the set of terminals that can appear immediately to the right of non-terminal A in some sentential form: S ⇒* α A a β, where a ∈ FOLLOW(A).\nComputation rules:\n1. Place $ in FOLLOW(S), where S is the start symbol ($ marks end-of-input).\n2. If A → α B β: add (FIRST(β) - {ε}) to FOLLOW(B).\n3. If A → α B or A → α B β where β is nullable (ε ∈ FIRST(β)): add all symbols of FOLLOW(A) to FOLLOW(B).\n$ is essential so the parser knows when input is exhausted and can accept.',
    tip: 'Common examiner trick: Can ε ever be an element of a FOLLOW set? Answer: NEVER. FOLLOW contains only terminals and $.',
  },
  {
    id: 7,
    category: 'Top-Down LL(1)',
    difficulty: 'Intermediate',
    question: 'Why does Left Recursion break Top-Down LL(1) predictive parsing?',
    answer:
      'A production A → A α has direct left recursion. When a top-down parser tries to expand A, it consults M[A, a] and replaces A with A α. On the next step, stack top is still A, so it repeatedly expands A → A α forever without consuming any input token, causing an infinite loop.\nRemedy: Eliminate left recursion by converting A → Aα | β into:\nA → β A\'\nA\' → α A\' | ε (where β does not begin with A).',
    tip: 'Be ready to write the transformation formula on a whiteboard. Mention that indirect left recursion (e.g. A → B, B → A) is eliminated by systematic non-terminal substitution.',
  },
  {
    id: 8,
    category: 'Top-Down LL(1)',
    difficulty: 'Intermediate',
    question: 'What is Left Factoring and why is it mandatory for LL(1) grammars?',
    answer:
      'Left Factoring is a grammar restructuring technique applied when two or more alternatives of a non-terminal share a common prefix:\nA → α β₁ | α β₂\nBecause both alternatives begin with α, the parser cannot decide whether to apply the first or second production when viewing a single lookahead token from FIRST(α).\nTransformation: Factor out the common prefix α:\nA → α A\'\nA\' → β₁ | β₂',
    tip: 'Classic example: The Dangling-Else rule: Stmt → if (E) Stmt | if (E) Stmt else Stmt is factored into Stmt → if (E) Stmt ElsePart, ElsePart → else Stmt | ε.',
  },
  {
    id: 9,
    category: 'Top-Down LL(1)',
    difficulty: 'Advanced',
    question: 'What are the two conditions for a grammar to be strictly LL(1)?',
    answer:
      'A grammar G is LL(1) if and only if for every non-terminal A with distinct alternatives A → α | β:\n1. FIRST/FIRST condition: FIRST(α) ∩ FIRST(β) = ∅ (No two alternatives can start with the same terminal).\n2. FIRST/FOLLOW condition: If ε ∈ FIRST(α), then FIRST(β) ∩ FOLLOW(A) = ∅ (If one alternative is nullable, no other alternative can begin with a token that can follow A).\nEquivalently: The predictive parsing table M[A, a] contains at most one production in every cell.',
    tip: 'If an examiner asks "Can an ambiguous grammar be LL(1)?", the answer is always NO. Ambiguity always introduces multiple entries in table cells.',
  },
  {
    id: 10,
    category: 'Bottom-Up LR Family',
    difficulty: 'Basic',
    question: 'What does LR parsing mean and why is bottom-up parsing called "Shift-Reduce" parsing?',
    answer:
      'LR parsing: Left-to-right scan (L), Rightmost derivation in reverse (R).\nIt is called Shift-Reduce parsing because the parser maintains a stack and input buffer, executing two primary operations:\n• SHIFT: Read the next input token and push it onto the stack (advancing the input).\n• REDUCE: When a substring on the stack matches the RHS of a production A → γ (a "handle"), replace γ on the stack with the LHS non-terminal A.\nThe parser starts with input tokens and reduces upward toward the start symbol S.',
    tip: 'Define a "handle": A handle is a production A → β and a position in the right sentential form αβw where β can be replaced by A to yield the previous right-sentential form in reverse rightmost derivation.',
  },
  {
    id: 11,
    category: 'Bottom-Up LR Family',
    difficulty: 'Intermediate',
    question: 'What is an LR(0) item? What are kernel and non-kernel items?',
    answer:
      'An LR(0) item is a production with a distinguished dot (•) placed at some position in the RHS: A → α • β.\nThe dot indicates how much of the production has already been seen (shifted/reduced):\n• Symbols before the dot (α) have already been recognized on the stack.\n• Symbols after the dot (β) are expected in the upcoming input.\n\nKernel items: S\' → • S (augmented start) and any item where the dot is not at the leftmost position (dot > 0).\nNon-kernel items: Items where the dot is at the beginning (A → • γ), generated during CLOSURE.',
    tip: 'Point out that LALR(1) parsers group CLR(1) states by their LR(0) core (the set of LR(0) items stripped of lookaheads).',
  },
  {
    id: 12,
    category: 'Bottom-Up LR Family',
    difficulty: 'Intermediate',
    question: 'Explain the CLOSURE and GOTO operations for LR(0) item sets.',
    answer:
      '• CLOSURE(I):\n  1. Initially, add all items in I to CLOSURE(I).\n  2. If A → α • B β is in CLOSURE(I) where B is a non-terminal, add B → • γ for every production of B. Repeat until no new items can be added.\n\n• GOTO(I, X):\n  Let J = { A → α X • β | A → α • X β ∈ I }. Then GOTO(I, X) = CLOSURE(J).\n  GOTO represents the state transition from state I on grammar symbol X (terminal or non-terminal).',
    tip: 'State that the Canonical Collection of LR(0) items is computed by taking CLOSURE({S\' → • S}) as I₀, and iteratively computing GOTO(I, X) for all states and symbols.',
  },
  {
    id: 13,
    category: 'Bottom-Up LR Family',
    difficulty: 'Intermediate',
    question: 'How does SLR(1) differ from LR(0)? Why is SLR(1) strictly more powerful?',
    answer:
      'Both LR(0) and SLR(1) use the exact same DFA states and transitions (the canonical collection of LR(0) item sets).\nThe sole difference is in the reduction placement in the ACTION table:\n• LR(0): For a reduction item A → α •, places "reduce A → α" unconditionally on ALL terminals (including $).\n• SLR(1): For A → α •, places "reduce A → α" ONLY on terminals a ∈ FOLLOW(A).\nRestricting reductions to FOLLOW(A) eliminates many Shift/Reduce and Reduce/Reduce conflicts where an upcoming terminal could never legally follow A.',
    tip: 'SLR stands for Simple LR. Mention that SLR still fails when a terminal in FOLLOW(A) is not valid in this particular state context (e.g. S → L = R | R, where = ∈ FOLLOW(R)).',
  },
  {
    id: 14,
    category: 'Bottom-Up LR Family',
    difficulty: 'Advanced',
    question: 'What is a CLR(1) item and how does CLOSURE propagate lookaheads in CLR(1)?',
    answer:
      'A Canonical LR(1) item is a pair [A → α • β, a], where A → α • β is an LR(0) item and "a" is a lookahead terminal or $.\nIn CLR(1), reduction A → α • is executed only if the current lookahead token equals "a".\n\nCLOSURE propagation rule:\nIf [A → α • B β, a] is in I, then for each production B → γ and for every terminal b ∈ FIRST(β a):\nAdd [B → • γ, b] to CLOSURE(I).\nHere FIRST(β a) accounts for whether β is nullable: if β derives ε, the lookahead "a" is propagated directly to B.',
    tip: 'CLR(1) has the maximum parsing power of all LR parsers, but can generate hundreds or thousands of states for real languages.',
  },
  {
    id: 15,
    category: 'Bottom-Up LR Family',
    difficulty: 'Advanced',
    question: 'How does LALR(1) achieve state compression? Can state merging introduce conflicts?',
    answer:
      'LALR(1) (Look-Ahead LR) starts with the Canonical LR(1) automaton, identifies states that have identical LR(0) cores (same productions and dot positions, differing only in lookahead sets), and merges them into a single state, taking the union of their lookahead sets.\n\nConflict effects:\n• Shift/Reduce conflicts: Merging states with identical cores CANNOT introduce new Shift/Reduce conflicts (because shift actions depend only on the core, not the lookaheads).\n• Reduce/Reduce conflicts: Merging states CAN introduce new Reduce/Reduce conflicts if two reductions now share a unioned lookahead terminal that was separate in CLR(1).',
    tip: 'This is the most famous viva question: "Can LALR merging cause shift/reduce conflicts?" Answer: No, never. "Can it cause reduce/reduce conflicts?" Answer: Yes. Yacc and Bison are LALR(1) parser generators.',
  },
  {
    id: 16,
    category: 'Conflicts & Diagnostics',
    difficulty: 'Intermediate',
    question: 'Explain the difference between a Shift/Reduce conflict and a Reduce/Reduce conflict.',
    answer:
      '• Shift/Reduce (S/R) Conflict:\n  A state contains at least one item ready to shift on terminal "a" (A → α • a β) and at least one item ready to reduce on "a" (B → γ •, where a is in the reduction set). The parser cannot decide whether to consume "a" or reduce γ to B.\n\n• Reduce/Reduce (R/R) Conflict:\n  A state contains two or more distinct reduction items (A → α • and B → β •) whose reduction sets both contain terminal "a". The parser cannot decide which production rule to reduce.',
    tip: 'R/R conflicts are almost always a symptom of grammar ambiguity or serious architectural design flaws; S/R conflicts can often be resolved by operator precedence declarations.',
  },
  {
    id: 17,
    category: 'Conflicts & Diagnostics',
    difficulty: 'Advanced',
    question: 'Summarize the language/grammar inclusion hierarchy among LR parsers.',
    answer:
      'Strict inclusion hierarchy:\nLR(0) ⊂ SLR(1) ⊂ LALR(1) ⊂ CLR(1)\n\n• Every LR(0) grammar is SLR(1).\n• Every SLR(1) grammar is LALR(1).\n• Every LALR(1) grammar is CLR(1).\n• Every LL(1) grammar is also LR(1), but LL(1) and LR(0)/SLR(1) are incomparable (neither is a subset of the other).\n• All deterministic context-free languages (DCFL) can be parsed by CLR(1) and LALR(1).',
    tip: 'Draw the Venn diagram mentally: LR(0) is the smallest circle, inside SLR(1), inside LALR(1), inside CLR(1).',
  },
  {
    id: 18,
    category: 'Compiler Architecture',
    difficulty: 'Basic',
    question: 'What is the difference between a Concrete Syntax Tree (Parse Tree) and an Abstract Syntax Tree (AST)?',
    answer:
      '• Parse Tree (Concrete Syntax Tree):\n  Represents every single grammar rule application and token in the derivation, including parentheses, semicolons, and chain intermediate non-terminals (e.g. E → T → F → id).\n\n• Abstract Syntax Tree (AST):\n  Retains only the semantic hierarchy and operations, discarding syntactic noise (punctuation, chain derivations). For example, 3 + 4 in an AST is a binary node (+) with children 3 and 4.',
    tip: 'Compilers construct parse trees internally during parsing, then synthesize an AST for semantic analysis and code generation.',
  },
  {
    id: 19,
    category: 'Compiler Architecture',
    difficulty: 'Intermediate',
    question: 'Why do modern production tools prefer LALR(1) or LL(*) over pure CLR(1)?',
    answer:
      'Pure CLR(1) generates an explosion of states (often 10x to 20x more states than LR(0)).\n• LALR(1) has the exact same state count as LR(0) while retaining lookahead precision, making tables small enough to fit in cache (e.g. GNU Bison, Yacc).\n• LL(*) (used in ANTLR) dynamically inspects arbitrary lookaheads via DFAs rather than fixed 1-token tables, allowing more intuitive recursive-descent syntax with grammar actions.',
    tip: 'Grammar Lab demonstrates this exact state compression: notice how CLR(1) generates 14 states for the classic Dragon Book grammar, while LALR(1) compresses them back to 10 states.',
  },
  {
    id: 20,
    category: 'Compiler Architecture',
    difficulty: 'Advanced',
    question: 'What is Panic-Mode error recovery and how does it operate in top-down vs bottom-up parsers?',
    answer:
      'Panic-mode is a straightforward, reliable syntactic error recovery strategy:\n• Top-Down LL(1): When M[A, a] is empty, the parser skips input tokens until a synchronizing token (from a designated sync set, usually FOLLOW(A) or statement terminators like ";") is found, then pops A from the stack to resume.\n• Bottom-Up LR: The parser pops states from the stack until a state with an outgoing transition on a designated "error" token is uncovered. It shifts "error", then discards input tokens until a token that can legally follow error is seen.',
    tip: 'Mention that Yacc/Bison supports the "error" pseudo-terminal explicitly for this purpose.',
  },
]

export default function VivaPrepView() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCards, setExpandedCards] = useState(new Set([1, 4, 10, 13, 15]))
  const [testMode, setTestMode] = useState(false)
  const [currentTestIndex, setCurrentTestIndex] = useState(0)
  const [revealedCurrent, setRevealedCurrent] = useState(false)
  const [masteredIds, setMasteredIds] = useState(new Set())

  const categories = useMemo(() => {
    const set = new Set(VIVA_QUESTIONS.map((q) => q.category))
    return ['All', ...Array.from(set)]
  }, [])

  const filteredQuestions = useMemo(() => {
    return VIVA_QUESTIONS.filter((q) => {
      const matchCat = selectedCategory === 'All' || q.category === selectedCategory
      const query = searchQuery.toLowerCase().trim()
      const matchQuery =
        !query ||
        q.question.toLowerCase().includes(query) ||
        q.answer.toLowerCase().includes(query) ||
        q.category.toLowerCase().includes(query)
      return matchCat && matchQuery
    })
  }, [selectedCategory, searchQuery])

  const toggleExpand = (id) => {
    setExpandedCards((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => {
    setExpandedCards(new Set(filteredQuestions.map((q) => q.id)))
  }

  const collapseAll = () => {
    setExpandedCards(new Set())
  }

  const toggleMastered = (id) => {
    setMasteredIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Viva & Oral Exam Preparation
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Curated Compiler Design oral examination questions, model answers, derivations, and examiner tips.
              </p>
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTestMode(!testMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              testMode
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/25'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{testMode ? 'Exit Quiz Mode' : 'Interactive Quiz Mode'}</span>
          </button>
        </div>
      </div>

      {/* Quiz Mode View */}
      {testMode ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Question {currentTestIndex + 1} of {VIVA_QUESTIONS.length}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {VIVA_QUESTIONS[currentTestIndex].category}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {VIVA_QUESTIONS[currentTestIndex].difficulty}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Award className="w-4 h-4" />
              <span>{masteredIds.size} Mastered</span>
            </div>
          </div>

          <div className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug">
            {VIVA_QUESTIONS[currentTestIndex].question}
          </div>

          {revealedCurrent ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                {VIVA_QUESTIONS[currentTestIndex].answer}
              </div>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
                <span className="font-bold">Examiner Insight: </span>
                {VIVA_QUESTIONS[currentTestIndex].tip}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <p className="text-xs text-slate-500 mb-3">
                Try reciting or noting down your answer before revealing the model explanation.
              </p>
              <button
                onClick={() => setRevealedCurrent(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-sm"
              >
                Reveal Model Answer
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                toggleMastered(VIVA_QUESTIONS[currentTestIndex].id)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                masteredIds.has(VIVA_QUESTIONS[currentTestIndex].id)
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {masteredIds.has(VIVA_QUESTIONS[currentTestIndex].id) ? 'Mastered' : 'Mark as Mastered'}
              </span>
            </button>

            <div className="flex items-center gap-2">
              <button
                disabled={currentTestIndex === 0}
                onClick={() => {
                  setCurrentTestIndex((i) => i - 1)
                  setRevealedCurrent(false)
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40 text-slate-700 dark:text-slate-300"
              >
                Previous
              </button>
              <button
                disabled={currentTestIndex === VIVA_QUESTIONS.length - 1}
                onClick={() => {
                  setCurrentTestIndex((i) => i + 1)
                  setRevealedCurrent(false)
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-sm"
              >
                Next Question
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Quick Cheat Sheet Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>LL(1) Condition</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                FIRST(α) ∩ FIRST(β) = ∅<br />
                If ε ∈ FIRST(α) ⇒ FIRST(β) ∩ FOLLOW(A) = ∅
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <Filter className="w-3.5 h-3.5" />
                <span>SLR(1) vs LR(0)</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                LR(0): Reduce on all terminals.<br />
                SLR(1): Reduce on a ∈ FOLLOW(A) only.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <Network className="w-3.5 h-3.5" />
                <span>LR Hierarchy</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                LR(0) ⊂ SLR(1) ⊂ LALR(1) ⊂ CLR(1)<br />
                LALR merge can cause R/R, never S/R.
              </p>
            </div>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions, concepts, derivations..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Expand / Collapse All */}
            <div className="flex items-center gap-2">
              <button
                onClick={expandAll}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Question List Accordion */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                No questions found matching your search.
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const isExpanded = expandedCards.has(q.id)
                const isMastered = masteredIds.has(q.id)

                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border transition-all duration-150 ${
                      isExpanded
                        ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/60 shadow-sm'
                        : 'bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <button
                      onClick={() => toggleExpand(q.id)}
                      className="w-full p-4 flex items-start justify-between text-left gap-3"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            Q{q.id}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {q.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              q.difficulty === 'Basic'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : q.difficulty === 'Intermediate'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                          {isMastered && (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                              <CheckCircle2 className="w-3 h-3" /> Mastered
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                          {q.question}
                        </h3>
                      </div>
                      <div className="pt-1 text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-3 text-xs">
                        <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-sans pl-1">
                          {q.answer}
                        </div>

                        {q.tip && (
                          <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-200">
                            <span className="font-bold">Examiner Tip: </span>
                            {q.tip}
                          </div>
                        )}

                        <div className="flex items-center justify-end pt-1">
                          <button
                            onClick={() => toggleMastered(q.id)}
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 transition ${
                              isMastered
                                ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isMastered ? 'Marked Mastered' : 'Mark as Mastered'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}

