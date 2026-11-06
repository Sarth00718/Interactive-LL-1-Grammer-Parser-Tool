import React, { useState, useMemo } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  ArrowRight,
  Code2,
  FileText,
  Network,
  GitMerge,
  HelpCircle,
  Table as TableIcon,
  ChevronRight,
  ListOrdered,
  ArrowRightLeft,
  RefreshCw,
  Split,
  CircleDot,
  Filter,
  Eye,
  ArrowDownToLine,
  ArrowRightToLine,
  ArrowLeftToLine,
} from 'lucide-react'

export default function WorkspaceView({
  grammarText,
  setGrammarText,
  startSymbol,
  setStartSymbol,
  onAnalyze,
  onValidate,
  loading = false,
  error = null,
  analysis = null,
  examples = [],
  selectedExampleId = '',
  onLoadExample,
  onNavigate,
}) {
  const [activeInspectorTab, setActiveInspectorTab] = useState('productions')
  const [validationResult, setValidationResult] = useState(null)
  const [validating, setValidating] = useState(false)

  const handleValidateClick = async () => {
    if (onValidate) {
      setValidating(true)
      try {
        const res = await onValidate()
        setValidationResult(res)
      } finally {
        setValidating(false)
      }
    }
  }

  const origGrammar = analysis?.original_grammar
  const finalGrammar = analysis?.final_grammar
  const validation = analysis?.validation || validationResult

  const getFlatProductions = (grammar) => {
    if (!grammar?.productions) return []
    if (Array.isArray(grammar.productions)) return grammar.productions
    return Object.values(grammar.productions).flat()
  }

  const productions = getFlatProductions(origGrammar)
  const finalProductions = getFlatProductions(finalGrammar)

  // Compute line numbers for editor
  const lineCount = useMemo(() => {
    return Math.max(grammarText.split('\n').length, 7)
  }, [grammarText])

  const insertToken = (token) => {
    setGrammarText((prev) => prev + token)
  }

  const isLL1 = analysis?.ll1?.is_ll1

  return (
    <div className="space-y-6">
      {/* Workspace Header Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-600" />
              <span>Grammar Workspace</span>
            </h1>
            {validation && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  validation.is_valid
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {validation.is_valid ? 'Valid CFG' : 'Syntax Issues'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Specify productions in Backus-Naur Form (BNF). Syntax: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">A -&gt; alpha | beta</span>. Use <span className="font-mono font-semibold">epsilon</span> or <span className="font-mono font-semibold">&epsilon;</span> for empty strings.
          </p>
        </div>

        {/* Quick Example Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Load Preset:</span>
          <select
            value={selectedExampleId}
            onChange={(e) => onLoadExample && onLoadExample(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Select Grammar Preset --</option>
            {examples.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} ({ex.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor & Symbol Detection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code-Editor Grammar Spec */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {/* Editor Toolbar */}
            <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Grammar Editor
              </span>

              {/* Syntax Helper Chips */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 mr-1 hidden sm:inline">Insert:</span>
                {[
                  { label: '->', val: ' -> ' },
                  { label: '|', val: ' | ' },
                  { label: 'ε', val: ' epsilon' },
                  { label: 'id', val: ' id' },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => insertToken(chip.val)}
                    className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-600 transition"
                  >
                    {chip.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setGrammarText('')
                    setStartSymbol('')
                  }}
                  className="ml-2 text-[11px] font-semibold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition"
                  title="Clear editor"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Code Editor Body with Line Numbers */}
            <div className="relative flex bg-[#FAFBFD] dark:bg-[#070A12] font-mono text-xs">
              {/* Line Numbers Gutter */}
              <div className="select-none py-3.5 px-3 bg-slate-100/70 dark:bg-slate-900/60 text-slate-400 text-right font-mono text-xs border-r border-slate-200 dark:border-slate-800/80 w-10 shrink-0 leading-6">
                {Array.from({ length: lineCount }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                rows={9}
                value={grammarText}
                onChange={(e) => setGrammarText(e.target.value)}
                placeholder="E -> E + T | T&#10;T -> T * F | F&#10;F -> ( E ) | id"
                className="w-full font-mono text-xs p-3.5 bg-transparent focus:outline-none dark:text-slate-100 leading-6 resize-y focus:ring-0"
                spellCheck="false"
              />
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-3 bg-slate-50/60 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                  Start Symbol:
                </span>
                <input
                  type="text"
                  value={startSymbol}
                  onChange={(e) => setStartSymbol(e.target.value)}
                  placeholder="Defaults to 1st LHS"
                  className="w-36 text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleValidateClick}
                  disabled={validating || !grammarText.trim()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
                >
                  {validating ? 'Validating...' : 'Validate Only'}
                </button>

                <button
                  type="button"
                  onClick={onAnalyze}
                  disabled={loading || !grammarText.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs flex items-center gap-1.5 transition active:scale-95"
                >
                  {loading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>Run Analysis</span>
                </button>
              </div>
            </div>
          </div>

          {/* Validation & Error Alerts */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Grammar Validation Error</span>
              </div>
              <p className="pl-5 font-mono">{error.error || error.message || JSON.stringify(error)}</p>
            </div>
          )}

          {validation?.warnings?.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Compiler Warnings ({validation.warnings.length})</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-2 text-[11px]">
                {validation.warnings.map((w, i) => (
                  <li key={i}>{w.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Parser Launcher Pills */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Quick Launch Into Parsers
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'top-down', name: 'LL(1) Parser' },
                { id: 'lr0', name: 'LR(0) Parser' },
                { id: 'slr1', name: 'SLR(1) Parser' },
                { id: 'clr1', name: 'CLR(1) Parser' },
                { id: 'lalr1', name: 'LALR(1) Parser' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => onNavigate && onNavigate(p.id)}
                  className="px-2.5 py-2 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition text-center"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Symbol Telemetry */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-100 dark:border-slate-800 pb-2">
              Detected Grammar Symbols
            </span>

            {origGrammar ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block mb-1">Start Symbol:</span>
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                    {origGrammar.start_symbol}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">
                    Non-Terminals ({origGrammar.non_terminals?.length || 0}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {origGrammar.non_terminals?.map((nt) => (
                      <span
                        key={nt}
                        className="font-mono px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold"
                      >
                        {nt}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">
                    Terminals ({origGrammar.terminals?.length || 0}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {origGrammar.terminals?.map((t) => (
                      <span
                        key={t}
                        className="font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-medium block mb-1">Special Compiler Symbols:</span>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      epsilon (&epsilon;)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      $ (End-marker)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs">
                Run analysis to detect and classify grammar symbols.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Tab Deep Inspector Section */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Inspector Navigation Tabs */}
        <div className="flex gap-1 p-2 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          {[
            { id: 'productions', label: 'Production Rules', icon: ListOrdered },
            { id: 'first_follow', label: 'FIRST & FOLLOW Sets', icon: ArrowRightLeft },
            { id: 'left_recursion', label: 'Left Recursion', icon: RefreshCw },
            { id: 'left_factoring', label: 'Left Factoring', icon: Split },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeInspectorTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveInspectorTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/60 dark:border-slate-800'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Inspector Body Content */}
        <div className="p-5">
          {/* Tab 1: Productions */}
          {activeInspectorTab === 'productions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Indexed production rules for parser generation:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {productions.length} productions
                </span>
              </div>

              {productions.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No productions parsed yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {productions.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 font-mono text-xs"
                    >
                      <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[11px]">
                        ({idx + 1})
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{p.lhs}</span>
                      <span className="text-slate-400">&rarr;</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {p.rhs.join(' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: FIRST & FOLLOW */}
          {activeInspectorTab === 'first_follow' && (
            <div className="space-y-4">
              {!analysis ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Run grammar analysis to calculate FIRST and FOLLOW sets.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* FIRST Sets */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <ArrowRightToLine className="w-3.5 h-3.5 text-indigo-600" />
                      <span>FIRST Sets</span>
                    </h3>
                    <div className="space-y-1.5 font-mono text-xs">
                      {origGrammar?.non_terminals?.map((nt) => {
                        const setVals = analysis.final_first?.first_sets?.[nt] || []
                        return (
                          <div
                            key={nt}
                            className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                          >
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                              FIRST({nt})
                            </span>
                            <span className="text-slate-800 dark:text-slate-200 font-bold">
                              {`{ ${setVals.join(', ')} }`}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* FOLLOW Sets */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <ArrowLeftToLine className="w-3.5 h-3.5 text-indigo-600" />
                      <span>FOLLOW Sets</span>
                    </h3>
                    <div className="space-y-1.5 font-mono text-xs">
                      {origGrammar?.non_terminals?.map((nt) => {
                        const setVals = analysis.final_follow?.follow_sets?.[nt] || []
                        return (
                          <div
                            key={nt}
                            className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                          >
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                              FOLLOW({nt})
                            </span>
                            <span className="text-slate-800 dark:text-slate-200 font-bold">
                              {`{ ${setVals.join(', ')} }`}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Left Recursion */}
          {activeInspectorTab === 'left_recursion' && (
            <div className="space-y-3">
              {analysis?.transform?.left_recursion_elimination_steps ? (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500">
                    Step-by-step transformation traces for direct and indirect left recursion:
                  </div>
                  {analysis.transform.left_recursion_elimination_steps.map((st, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300"
                    >
                      {st}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No left recursion detected in this grammar.
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Left Factoring */}
          {activeInspectorTab === 'left_factoring' && (
            <div className="space-y-3">
              {analysis?.transform?.left_factoring_steps ? (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500">
                    Common prefix detection and factoring steps:
                  </div>
                  {analysis.transform.left_factoring_steps.map((st, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300"
                    >
                      {st}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No common prefixes found requiring left factoring.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
