import React, { useState } from 'react'
import { Empty } from './GrammarTab.jsx'
import { api } from '../services/api.js'

export default function ParserTab({ analysis, grammarText, startSymbol, sampleInput, result, setResult }) {
  const [input, setInput] = useState(sampleInput || '')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)

  React.useEffect(() => {
    if (sampleInput !== undefined) setInput(sampleInput)
  }, [sampleInput])

  if (!analysis) return <Empty />

  const runParse = async () => {
    setLoading(true)
    setErr(null)
    setResult(null)
    try {
      const res = await api.parse(grammarText, startSymbol || null, input)
      setResult(res)
    } catch (e) {
      setErr(e.detail?.detail || e.detail || { error: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 transition-colors">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
          Predictive Parser
        </h3>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. id + id * id"
            className="mono flex-1 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={runParse}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            {loading ? 'Parsing…' : 'Parse'}
          </button>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          Enter whitespace-separated tokens; $ is appended automatically.
        </p>
      </div>

      {err && (
        <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl p-4 text-sm text-rose-800 dark:text-rose-200">
          {err.error}
        </div>
      )}

      {result && result.conflicts && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-200">
          {result.error?.message}
        </div>
      )}

      {result && !result.conflicts && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 scroll-x transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={
                'px-2.5 py-1 rounded-full text-xs font-semibold ' +
                (result.accepted
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300')
              }
            >
              {result.accepted ? 'ACCEPTED' : 'REJECTED'}
            </span>
          </div>

          <table className="mono text-xs w-full border-collapse">
            <thead>
              <tr>
                {['Step', 'Stack', 'Input', 'Action'].map((h) => (
                  <th
                    key={h}
                    className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 px-3 py-1.5 text-left"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.steps.map((s) => (
                <tr key={s.step} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-slate-500 dark:text-slate-400">
                    {s.step}
                  </td>
                  <td className="border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-slate-800 dark:text-slate-200">
                    {s.stack}
                  </td>
                  <td className="border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-slate-800 dark:text-slate-200">
                    {s.input}
                  </td>
                  <td
                    className={
                      'border border-slate-200 dark:border-slate-800 px-3 py-1.5 ' +
                      (s.action.startsWith('ERROR')
                        ? 'text-rose-700 dark:text-rose-400 font-semibold'
                        : 'text-slate-800 dark:text-slate-200')
                    }
                  >
                    {s.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {result.error && (
            <div className="mt-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-lg p-4 text-sm text-rose-800 dark:text-rose-200">
              <p className="font-semibold mb-1">Parsing Error</p>
              <p className="mono text-xs mb-1">Stack: {result.error.stack}</p>
              <p className="mono text-xs mb-1">Input remaining: {result.error.input}</p>
              <p className="mt-2">{result.error.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

