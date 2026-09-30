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
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
          Predictive Parser Simulation
        </h3>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. id + id * id"
            className="mono flex-1 text-sm border border-gray-300 bg-gray-50 text-gray-900 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={runParse}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold px-4 py-2 rounded-lg transition shadow-md"
          >
            {loading ? 'Parsing…' : 'Parse Input'}
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Enter whitespace-separated tokens; $ is appended automatically.
        </p>
      </div>

      {err && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-sm text-rose-800">
          {err.error}
        </div>
      )}

      {result && result.conflicts && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-sm text-amber-800">
          {result.error?.message}
        </div>
      )}

      {result && !result.conflicts && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 scroll-x shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={
                'px-3 py-1 rounded-full text-xs font-bold ' +
                (result.accepted
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300')
              }
            >
              {result.accepted ? '✓ INPUT ACCEPTED' : '✗ INPUT REJECTED'}
            </span>
          </div>

          <table className="mono text-xs w-full border-collapse">
            <thead>
              <tr>
                {['Step', 'Stack', 'Input', 'Action'].map((h) => (
                  <th
                    key={h}
                    className="border border-gray-300 bg-indigo-50 text-indigo-900 font-bold px-3 py-2 text-left"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.steps.map((s) => (
                <tr key={s.step} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-1.5 text-gray-600 font-medium">
                    {s.step}
                  </td>
                  <td className="border border-gray-300 px-3 py-1.5 text-indigo-700 font-semibold">
                    {s.stack}
                  </td>
                  <td className="border border-gray-300 px-3 py-1.5 text-gray-800 font-semibold">
                    {s.input}
                  </td>
                  <td
                    className={
                      'border border-gray-300 px-3 py-1.5 ' +
                      (s.action.startsWith('ERROR')
                        ? 'text-rose-700 font-bold'
                        : 'text-amber-700 font-medium')
                    }
                  >
                    {s.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {result.error && (
            <div className="mt-4 bg-rose-50 border border-rose-300 rounded-lg p-4 text-sm text-rose-800">
              <p className="font-bold mb-1 text-rose-700">Parsing Error</p>
              <p className="mono text-xs mb-1 text-gray-700">Stack: {result.error.stack}</p>
              <p className="mono text-xs mb-1 text-gray-700">Input remaining: {result.error.input}</p>
              <p className="mt-2 text-rose-800">{result.error.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


