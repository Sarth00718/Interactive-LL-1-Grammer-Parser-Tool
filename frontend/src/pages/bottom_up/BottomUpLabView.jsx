import React, { useState, useEffect } from 'react'
import {
  CircleDot,
  Filter,
  Eye,
  GitMerge,
  Table as TableIcon,
  Play,
  Network,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  ListOrdered,
  RefreshCw,
} from 'lucide-react'
import AutomatonGraph from '../../components/AutomatonGraph.jsx'
import ParsingTableComponent from '../../components/ParsingTableComponent.jsx'
import ParsingSimulator from '../../components/ParsingSimulator.jsx'
import ParseTreeView from '../../components/ParseTreeView.jsx'
import { api } from '../../services/api.js'

export default function BottomUpLabView({
  grammarText,
  startSymbol,
  sampleInput = '',
  initialAlgorithm = 'SLR1',
  initialTab = 'automaton',
  onNavigate,
}) {
  const [algorithm, setAlgorithm] = useState(initialAlgorithm)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState(initialTab || 'automaton')

  // Sync initialTab if prop changes
  useEffect(() => {
    if (initialTab) {
      setTab(initialTab)
    }
  }, [initialTab])

  // Parsing simulation state
  const [parseInput, setParseInput] = useState(sampleInput)
  const [parseResult, setParseResult] = useState(null)
  const [parsingLoading, setParsingLoading] = useState(false)

  // Sync initialAlgorithm if prop changes
  useEffect(() => {
    if (initialAlgorithm) {
      setAlgorithm(initialAlgorithm)
    }
  }, [initialAlgorithm])

  // Fetch analysis whenever grammarText or algorithm changes
  useEffect(() => {
    if (!grammarText || !grammarText.trim()) return

    let cancelled = false
    setLoading(true)
    setError(null)
    setParseResult(null)

    const fetchAnalysis = async () => {
      try {
        let res
        if (algorithm === 'LR0') {
          res = await api.analyzeLR0(grammarText, startSymbol || null)
        } else if (algorithm === 'SLR1') {
          res = await api.analyzeSLR1(grammarText, startSymbol || null)
        } else if (algorithm === 'CLR1') {
          res = await api.analyzeCLR1(grammarText, startSymbol || null)
        } else if (algorithm === 'LALR1') {
          res = await api.analyzeLALR1(grammarText, startSymbol || null)
        }
        if (!cancelled) {
          setAnalysis(res)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to analyze bottom-up grammar.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchAnalysis()

    return () => {
      cancelled = true
    }
  }, [grammarText, startSymbol, algorithm])

  // Run bottom-up parse
  const handleParse = async (inputStringToParse) => {
    const textToParse = inputStringToParse !== undefined ? inputStringToParse : parseInput
    setParsingLoading(true)
    try {
      let res
      if (algorithm === 'LR0') {
        res = await api.parseLR0(grammarText, startSymbol || null, textToParse)
      } else if (algorithm === 'SLR1') {
        res = await api.parseSLR1(grammarText, startSymbol || null, textToParse)
      } else if (algorithm === 'CLR1') {
        res = await api.parseCLR1(grammarText, startSymbol || null, textToParse)
      } else if (algorithm === 'LALR1') {
        res = await api.parseLALR1(grammarText, startSymbol || null, textToParse)
      }
      setParseResult(res)
    } catch (err) {
      setParseResult({
        accepted: false,
        error: { message: err.message || 'Parsing failed.' },
        steps: [],
        parse_tree: null,
      })
    } finally {
      setParsingLoading(false)
    }
  }

  // Auto-run parse when analysis is ready if sample input provided
  useEffect(() => {
    if (analysis && analysis.is_conflict_free && parseInput && !parseResult) {
      handleParse(parseInput)
    }
  }, [analysis])

  const algoTabs = [
    { id: 'LR0', name: 'LR(0)', icon: CircleDot },
    { id: 'SLR1', name: 'SLR(1)', icon: Filter },
    { id: 'CLR1', name: 'CLR(1)', icon: Eye },
    { id: 'LALR1', name: 'LALR(1)', icon: GitMerge },
  ]

  const viewTabs = [
    { id: 'automaton', label: 'Automaton DFA Graph', icon: Network },
    { id: 'items', label: 'Item Sets & Closures', icon: ListOrdered },
    { id: 'table', label: 'ACTION & GOTO Table', icon: TableIcon },
    { id: 'simulator', label: 'Parsing Simulator', icon: Play },
    { id: 'tree', label: 'Dynamic Parse Tree', icon: Network },
  ]

  const isConflictFree = analysis?.is_conflict_free
  const conflictsCount = analysis?.conflicts?.length || 0
  const stats = analysis?.statistics || {}

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Controller: Algorithm Selector & Status */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-600" />
              Bottom-Up LR Parsing Laboratory
            </h1>
            {analysis && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isConflictFree
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                }`}
              >
                {isConflictFree ? `${algorithm} Compatible` : `${conflictsCount} Conflict(s)`}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            {analysis?.explanation ||
              'Bottom-up shift-reduce parser family. Reconstructs reverse rightmost derivations using state automata.'}
          </p>
        </div>

        {/* Algorithm Switcher Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {algoTabs.map((a) => {
            const Icon = a.icon
            const isSelected = algorithm === a.id
            return (
              <button
                key={a.id}
                onClick={() => setAlgorithm(a.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{a.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Metrics Row */}
      {analysis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Total States
            </span>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {stats.state_count || 0}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Transitions
            </span>
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {stats.transition_count || 0}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Shift/Reduce Conflicts
            </span>
            <div
              className={`text-lg font-bold mt-0.5 ${
                stats.shift_reduce_conflicts > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {stats.shift_reduce_conflicts || 0}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Reduce/Reduce Conflicts
            </span>
            <div
              className={`text-lg font-bold mt-0.5 ${
                stats.reduce_reduce_conflicts > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {stats.reduce_reduce_conflicts || 0}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex gap-1.5 overflow-x-auto p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
        {viewTabs.map((t) => {
          const Icon = t.icon
          const isActive = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-900/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm min-h-[500px]">
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Generating {algorithm} Automaton & Parsing Table...
            </p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-600" />
            <h3 className="text-sm font-bold">Analysis Error</h3>
            <p className="text-xs mt-1">{error}</p>
          </div>
        ) : !analysis ? (
          <div className="py-20 text-center text-slate-400">
            No grammar loaded. Please enter a grammar in the workspace.
          </div>
        ) : (
          <>
            {/* 1. Automaton View */}
            {tab === 'automaton' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Interactive DFA state transition graph. Drag to pan, scroll to zoom. Click node for item details.</span>
                  <span className="font-semibold text-indigo-600">{analysis.automaton.states.length} States</span>
                </div>
                <AutomatonGraph
                  states={analysis.automaton.states}
                  transitions={analysis.automaton.transitions}
                />
              </div>
            )}

            {/* 2. Item Sets & Closures */}
            {tab === 'items' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Canonical Collection of Item Sets ({analysis.automaton.states.length} states)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Each card shows kernel items, non-kernel closure items, and GOTO transitions.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysis.automaton.states.map((state) => {
                    const sid = state.state_id ?? state.id
                    const transitionsFrom = analysis.automaton.transitions.filter(
                      (t) => t.from_state === sid
                    )
                    return (
                      <div
                        key={sid}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-4 space-y-3 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                          <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            {state.label || `I${sid}`}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {state.is_start && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                                Start
                              </span>
                            )}
                            {state.is_accepting && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                                Accept
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Items
                          </span>
                          <div className="space-y-1 font-mono text-xs">
                            {(state.grouped_items || state.items || []).map((it, idx) => (
                              <div
                                key={idx}
                                className={`px-2 py-1 rounded text-xs leading-relaxed ${
                                  it.is_kernel
                                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-medium'
                                    : 'text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {it.text}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* GOTO Transitions */}
                        {transitionsFrom.length > 0 && (
                          <div className="border-t border-slate-200 dark:border-slate-800 pt-2 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Transitions
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {transitionsFrom.map((tr, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                  <span className="font-bold text-indigo-600">{tr.symbol}</span>
                                  <span className="text-slate-400">→</span>
                                  <span className="font-bold">I{tr.to_state}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 3. Parsing Table */}
            {tab === 'table' && (
              <div className="space-y-4">
                <ParsingTableComponent
                  terminals={analysis.parsing_table.terminals}
                  nonTerminals={analysis.parsing_table.non_terminals}
                  actionTable={analysis.parsing_table.action_table}
                  gotoTable={analysis.parsing_table.goto_table}
                  conflicts={analysis.parsing_table.conflicts}
                  algorithm={algorithm}
                />
              </div>
            )}

            {/* 4. Parsing Simulator */}
            {tab === 'simulator' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={parseInput}
                    onChange={(e) => setParseInput(e.target.value)}
                    placeholder="Enter space-separated tokens e.g. ( ( a ) )"
                    className="flex-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                  />
                  <button
                    onClick={() => handleParse(parseInput)}
                    disabled={parsingLoading}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center justify-center gap-2 transition"
                  >
                    {parsingLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    <span>Parse String</span>
                  </button>
                </div>

                {parseResult ? (
                  <ParsingSimulator
                    steps={parseResult.steps}
                    accepted={parseResult.accepted}
                    error={parseResult.error}
                    inputString={parseInput}
                    tokens={parseResult.tokens}
                    onParse={handleParse}
                    loading={parsingLoading}
                    algorithm={algorithm}
                  />
                ) : (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    Enter an input string and click "Parse String" to step through shift-reduce operations.
                  </div>
                )}
              </div>
            )}

            {/* 5. Dynamic Parse Tree */}
            {tab === 'tree' && (
              <div className="space-y-4">
                {parseResult && parseResult.parse_tree ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Dynamically reconstructed from bottom-up shift and reduce operations.</span>
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Successfully parsed
                      </span>
                    </div>
                    <div className="h-[600px] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/30 dark:bg-slate-950/40">
                      <ParseTreeView parseResult={parseResult} />
                    </div>
                  </div>
                ) : (
                  <div className="py-24 text-center text-slate-400 text-xs">
                    {parseResult && !parseResult.accepted
                      ? 'No parse tree generated because parsing failed with syntax errors or conflicts.'
                      : 'Run a successful parse in the Simulator tab to view the dynamic parse tree.'}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
