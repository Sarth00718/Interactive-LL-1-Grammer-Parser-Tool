import React from 'react'
import {
  ArrowRight,
  GitMerge,
  Network,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Play,
  GraduationCap,
  FileCode2,
  Table as TableIcon,
  ShieldCheck,
  Terminal,
  Code2,
} from 'lucide-react'

export default function DashboardView({
  analysis,
  onNavigate,
  onLoadExample,
  examples = [],
}) {
  const isLL1Compatible = analysis && !analysis.stopped_after_validation && analysis.ll1?.is_ll1
  const origGrammar = analysis?.original_grammar
  const nonTerminalsCount = origGrammar?.non_terminals?.length || 0
  const terminalsCount = origGrammar?.terminals?.length || 0
  const productionsCount = origGrammar?.productions
    ? Object.values(origGrammar.productions).flat().length
    : 0

  const featuredExamples = [
    {
      id: 'arithmetic-ll1',
      title: 'Arithmetic (LL(1))',
      tag: 'Top-Down',
      badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    },
    {
      id: 'left-recursive-arithmetic',
      title: 'Left-Recursive Expression',
      tag: 'LR Standard',
      badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    },
    {
      id: 'lr0-compatible-parentheses',
      title: 'Balanced Parentheses',
      tag: 'LR(0)',
      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    {
      id: 'slr1-not-lr0',
      title: 'SLR(1) not LR(0)',
      tag: 'SLR(1)',
      badge: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    },
    {
      id: 'clr1-lalr1-not-slr1',
      title: 'Dragon Book Ex 4.48',
      tag: 'CLR & LALR',
      badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    },
    {
      id: 'clr1-not-lalr1',
      title: 'CLR(1) not LALR(1)',
      tag: 'LALR Conflict',
      badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    },
  ]

  const parsers = [
    {
      id: 'top-down',
      subTab: 'overview',
      name: 'LL(1)',
      title: 'Top-Down Predictive Parser',
      direction: 'Top-Down',
      lookahead: '1 Token',
      summary: 'Parses from start symbol downward to leaves using FIRST and FOLLOW sets.',
      highlight: 'Requires left-factored grammar free of left recursion.',
      badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    },
    {
      id: 'lr0',
      subTab: 'automaton',
      name: 'LR(0)',
      title: 'Canonical LR(0) Automaton',
      direction: 'Bottom-Up',
      lookahead: '0 Tokens',
      summary: 'Builds canonical item DFA; shifts and reduces without inspecting lookahead.',
      highlight: 'Every completed item triggers reduction across all terminals.',
      badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    },
    {
      id: 'slr1',
      subTab: 'table',
      name: 'SLR(1)',
      title: 'Simple LR(1) Parser',
      direction: 'Bottom-Up',
      lookahead: '1 Token (FOLLOW)',
      summary: 'Uses LR(0) states but restricts reductions strictly to terminals in FOLLOW(A).',
      highlight: 'Eliminates many LR(0) shift/reduce conflicts with zero additional states.',
      badgeColor: 'bg-teal-50 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    },
    {
      id: 'clr1',
      subTab: 'automaton',
      name: 'CLR(1)',
      title: 'Canonical LR(1) Parser',
      direction: 'Bottom-Up',
      lookahead: '1 Token (Item)',
      summary: 'Carries exact lookaheads directly inside items [A -> α • β, a] via FIRST(β a).',
      highlight: 'Maximum parsing power for deterministic context-free grammars.',
      badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    },
    {
      id: 'lalr1',
      subTab: 'table',
      name: 'LALR(1)',
      title: 'Look-Ahead LR(1) Parser',
      direction: 'Bottom-Up',
      lookahead: '1 Token (Merged)',
      summary: 'Merges CLR(1) states with identical LR(0) cores, uniting lookaheads into compact tables.',
      highlight: 'Industry standard in compiler generators (GNU Bison, Yacc, Tree-sitter).',
      badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Studio Banner */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Terminal className="w-3 h-3" />
            <span>Compiler Design Laboratory • Production SaaS</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Interactive Grammar Analysis & Parser Studio
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Analyze Context-Free Grammars across Top-Down (LL(1)) and Bottom-Up (LR(0), SLR(1), CLR(1), LALR(1)) compiler algorithms. Compute item sets, state transition DFAs, parse tables, and step-by-step stack execution traces directly in Python.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={() => onNavigate('workspace')}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs flex items-center gap-2 transition"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Grammar Workspace</span>
            </button>
            <button
              onClick={() => onNavigate('compare')}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition"
            >
              <GitMerge className="w-3.5 h-3.5" />
              <span>Compare All 5 Parsers</span>
            </button>
            <button
              onClick={() => onNavigate('viva')}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Viva & Exam Prep</span>
            </button>
          </div>
        </div>

        {/* Loaded Grammar Quick Telemetry Card */}
        {analysis && (
          <div className="w-full lg:w-72 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Active Grammar
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  isLL1Compatible
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {isLL1Compatible ? 'LL(1) Compatible' : 'Top-Down Conflicted'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {productionsCount}
                </div>
                <div className="text-[10px] text-slate-400">Rules</div>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {nonTerminalsCount}
                </div>
                <div className="text-[10px] text-slate-400">Non-Term</div>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {terminalsCount}
                </div>
                <div className="text-[10px] text-slate-400">Terminals</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>Start: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{origGrammar?.start_symbol || 'E'}</span></span>
              <button
                onClick={() => onNavigate('workspace')}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Edit Grammar &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Benchmark Grammars Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Benchmark & Textbook Presets
          </h2>
          <button
            onClick={() => onNavigate('examples')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All Examples</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {featuredExamples.map((ex) => (
            <button
              key={ex.id}
              onClick={() => {
                if (onLoadExample) onLoadExample(ex.id)
                onNavigate('workspace')
              }}
              className="p-3 text-left rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs transition group"
            >
              <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold border mb-1.5 ${ex.badge}`}>
                {ex.tag}
              </span>
              <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                {ex.title}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 5 Supported Parsers Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Supported Parsing Algorithms
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parsers.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${p.badgeColor}`}>
                    {p.name}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {p.direction} &bull; {p.lookahead}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {p.summary}
                </p>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Key rule: </span>
                  {p.highlight}
                </div>
              </div>

              <button
                onClick={() => onNavigate(p.id, p.subTab)}
                className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center justify-between group"
              >
                <span>Launch {p.name} Studio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ))}

          {/* Quick Comparison Card */}
          <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 shadow-xs flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                <GitMerge className="w-4 h-4" />
                <span>Side-by-Side Comparison</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Parser Comparison Matrix
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Run all five parsers against the active grammar simultaneously. Inspect conflict counts, state counts, transition totals, and input acceptance.
              </p>
            </div>
            <button
              onClick={() => onNavigate('compare')}
              className="mt-4 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs flex items-center justify-center gap-1.5 transition"
            >
              <span>View Full Comparison</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Theoretical Hierarchy & Compiler Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LR Inclusion Hierarchy */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Theoretical Language Hierarchy</span>
            </h3>
            <span className="text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400">
              LR(0) ⊂ SLR(1) ⊂ LALR(1) ⊂ CLR(1)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
            <p>
              • <strong className="text-slate-800 dark:text-slate-100">LR(0)</strong>: Smallest LR family; places reductions on all terminals unconditionally.
            </p>
            <p>
              • <strong className="text-slate-800 dark:text-slate-100">SLR(1)</strong>: Uses LR(0) states but filters reductions by FOLLOW(A) terminals.
            </p>
            <p>
              • <strong className="text-slate-800 dark:text-slate-100">LALR(1)</strong>: Merges CLR(1) states with identical LR(0) cores; state count equals LR(0).
            </p>
            <p>
              • <strong className="text-slate-800 dark:text-slate-100">CLR(1)</strong>: Maximum LR power; tracks specific lookaheads per item, but state count explodes.
            </p>
          </div>
        </div>

        {/* Studio Pipeline Flow */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pure Python Compiler Laboratory Engine</span>
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
              <div className="font-semibold text-slate-800 dark:text-slate-200">1. CFG Lexer & Parser</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Tokenizes rules, handles ε and quotes.</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
              <div className="font-semibold text-slate-800 dark:text-slate-200">2. FIRST & FOLLOW</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Worklist fixed-point algorithm.</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
              <div className="font-semibold text-slate-800 dark:text-slate-200">3. Canonical DFA</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Item sets, CLOSURE and GOTO transitions.</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
              <div className="font-semibold text-slate-800 dark:text-slate-200">4. Parse Simulator</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Step-by-step stack actions & parse tree.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
