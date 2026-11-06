import React, { useState, useEffect } from 'react'
import {
  Scale,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  ArrowRight,
  Info,
} from 'lucide-react'
import { api } from '../services/api.js'

export default function ComparisonView({
  grammarText,
  startSymbol,
  sampleInput = '',
  onNavigate,
}) {
  const [comparisonData, setComparisonData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Multi-parse test
  const [testInput, setTestInput] = useState(sampleInput)
  const [parseResults, setParseResults] = useState({})
  const [parsingAll, setParsingAll] = useState(false)

  const fetchComparison = async () => {
    if (!grammarText || !grammarText.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.compare(grammarText, startSymbol || null)
      setComparisonData(res)
    } catch (err) {
      setError(err.message || 'Failed to compare parsers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComparison()
  }, [grammarText, startSymbol])

  const handleTestParseAll = async () => {
    if (!testInput || !testInput.trim()) return
    setParsingAll(true)
    const results = {}

    try {
      // 1. LL(1)
      try {
        const ll1Res = await api.parseLL1(grammarText, startSymbol || null, testInput)
        results['LL(1)'] = { accepted: ll1Res.accepted, steps: ll1Res.steps?.length || 0, error: ll1Res.error }
      } catch (e) {
        results['LL(1)'] = { accepted: false, steps: 0, error: e.message }
      }

      // 2. LR(0)
      try {
        const lr0Res = await api.parseLR0(grammarText, startSymbol || null, testInput)
        results['LR(0)'] = { accepted: lr0Res.accepted, steps: lr0Res.steps?.length || 0, error: lr0Res.error }
      } catch (e) {
        results['LR(0)'] = { accepted: false, steps: 0, error: e.message }
      }

      // 3. SLR(1)
      try {
        const slrRes = await api.parseSLR1(grammarText, startSymbol || null, testInput)
        results['SLR(1)'] = { accepted: slrRes.accepted, steps: slrRes.steps?.length || 0, error: slrRes.error }
      } catch (e) {
        results['SLR(1)'] = { accepted: false, steps: 0, error: e.message }
      }

      // 4. CLR(1)
      try {
        const clrRes = await api.parseCLR1(grammarText, startSymbol || null, testInput)
        results['CLR(1)'] = { accepted: clrRes.accepted, steps: clrRes.steps?.length || 0, error: clrRes.error }
      } catch (e) {
        results['CLR(1)'] = { accepted: false, steps: 0, error: e.message }
      }

      // 5. LALR(1)
      try {
        const lalrRes = await api.parseLALR1(grammarText, startSymbol || null, testInput)
        results['LALR(1)'] = { accepted: lalrRes.accepted, steps: lalrRes.steps?.length || 0, error: lalrRes.error }
      } catch (e) {
        results['LALR(1)'] = { accepted: false, steps: 0, error: e.message }
      }

      setParseResults(results)
    } finally {
      setParsingAll(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            5-Parser Comprehensive Comparison Matrix
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simultaneous comparative analysis across LL(1), LR(0), SLR(1), CLR(1), and LALR(1) derived strictly from backend calculations.
          </p>
        </div>
        <button
          onClick={fetchComparison}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Running 5-way parser analysis...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-600" />
          <h3 className="text-sm font-bold">Comparison Error</h3>
          <p className="text-xs mt-1">{error}</p>
        </div>
      ) : comparisonData ? (
        <>
          {/* Main Matrix Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Parser Compatibility & Complexity Matrix
              </span>
              <span className="text-xs text-slate-500">
                Grammar: {comparisonData.grammar_summary?.productions_count} Productions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold">
                    <th className="py-3 px-4">Parser Method</th>
                    <th className="py-3 px-4">Parsing Direction</th>
                    <th className="py-3 px-4 text-center">Conflict-Free?</th>
                    <th className="py-3 px-4 text-center">Total States</th>
                    <th className="py-3 px-4 text-center">Transitions</th>
                    <th className="py-3 px-4 text-center">S/R Conflicts</th>
                    <th className="py-3 px-4 text-center">R/R Conflicts</th>
                    <th className="py-3 px-4 text-center">String Parse</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {comparisonData.comparison_matrix?.map((row) => {
                    const isComp = row.is_compatible
                    const parseOutcome = parseResults[row.method]
                    return (
                      <tr
                        key={row.method}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
                          {row.method}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-sans">
                          {row.type}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isComp ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-sans">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-sans">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              No ({row.conflicts_count})
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300">
                          {row.states_count !== null ? row.states_count : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300">
                          {row.transitions_count !== null ? row.transitions_count : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={
                              row.shift_reduce_conflicts > 0
                                ? 'text-rose-600 font-bold'
                                : 'text-slate-400'
                            }
                          >
                            {row.shift_reduce_conflicts}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={
                              row.reduce_reduce_conflicts > 0
                                ? 'text-rose-600 font-bold'
                                : 'text-slate-400'
                            }
                          >
                            {row.reduce_reduce_conflicts}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-sans">
                          {parseOutcome ? (
                            parseOutcome.accepted ? (
                              <span className="text-emerald-600 font-bold text-xs inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Accepted ({parseOutcome.steps} steps)</span>
                              </span>
                            ) : (
                              <span className="text-rose-600 font-bold text-xs inline-flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>Rejected</span>
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400 text-xs">Not tested</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-sans">
                          <button
                            onClick={() => {
                              if (row.method === 'LL(1)') onNavigate('top-down')
                              else if (row.method === 'LR(0)') onNavigate('lr0')
                              else if (row.method === 'SLR(1)') onNavigate('slr1')
                              else if (row.method === 'CLR(1)') onNavigate('clr1')
                              else if (row.method === 'LALR(1)') onNavigate('lalr1')
                            }}
                            className="px-2.5 py-1 rounded text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition inline-flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Test Input String Across All 5 Parsers */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Play className="w-4 h-4 text-indigo-600" />
              Multi-Parser Input String Verification
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter input string e.g. id + id"
                className="flex-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              />
              <button
                onClick={handleTestParseAll}
                disabled={parsingAll || !testInput.trim()}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-sm flex items-center justify-center gap-2 transition"
              >
                {parsingAll ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>Test All 5 Parsers</span>
              </button>
            </div>
          </div>

          {/* Theoretical Foundations & Hierarchy */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-slate-50 dark:from-indigo-950/20 dark:to-slate-900 border border-indigo-100 dark:border-indigo-950 space-y-3">
            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-600" />
              Formal Language Theory & Parser Power Relations
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {comparisonData.theoretical_insights}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs text-slate-700 dark:text-slate-300 font-sans">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                  Bottom-Up Hierarchy: LR(0) ⊂ SLR(1) ⊂ LALR(1) ⊂ CLR(1)
                </span>
                SLR(1) restricts reductions to FOLLOW sets. LALR(1) merges CLR(1) states with identical LR(0) cores, retaining compact state count while occasionally introducing merge-induced Reduce/Reduce conflicts. CLR(1) provides maximum power with distinct lookaheads.
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                  Top-Down vs Bottom-Up: LL(1) vs LR(1)
                </span>
                Every LL(1) grammar is LR(1), but not every LR(1) grammar is LL(1). LL(1) cannot parse left-recursive grammars directly without transformation, whereas LR parsers naturally handle left recursion with minimal stack depth.
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

