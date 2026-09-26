import React from 'react'
import StatusBadge from './StatusBadge.jsx'

export default function GrammarInputPanel({
  grammarText,
  setGrammarText,
  startSymbol,
  setStartSymbol,
  onAnalyze,
  examples,
  onLoadExample,
  loading,
  error,
  analysis,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Breaking Down Grammars</h1>
          <p className="text-sm text-slate-500">Interactive LL(1) Grammar Analysis and Predictive Parsing Tool</p>
        </div>
        {analysis && !analysis.stopped_after_validation && (
          <StatusBadge
            ok={analysis.ll1?.is_ll1}
            okText="LL(1) Grammar"
            badText={`Not LL(1) \u2014 ${analysis.ll1?.conflict_count} conflict(s)`}
          />
        )}
      </div>

      <textarea
        value={grammarText}
        onChange={(e) => setGrammarText(e.target.value)}
        rows={7}
        spellCheck={false}
        className="mono w-full text-sm border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        placeholder={"E -> T E'\nE' -> + T E' | epsilon\nT -> F T'\nT' -> * F T' | epsilon\nF -> ( E ) | id"}
      />

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <label className="text-sm text-slate-600">Start symbol override:</label>
        <input
          value={startSymbol}
          onChange={(e) => setStartSymbol(e.target.value)}
          placeholder="(default: first non-terminal)"
          className="mono text-sm border border-slate-300 rounded-md px-2 py-1 w-56"
        />

        <button
          onClick={onAnalyze}
          disabled={loading}
          className="ml-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          {loading ? 'Analyzing\u2026' : 'Analyze'}
        </button>

        <select
          onChange={(e) => {
            if (e.target.value) onLoadExample(e.target.value)
            e.target.value = ''
          }}
          defaultValue=""
          className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
        >
          <option value="" disabled>
            Load example…
          </option>
          {examples.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.title}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mt-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3 text-sm">
          <p className="font-semibold">Grammar Error</p>
          <p className="mt-1">{error.error || error.message}</p>
          {error.production && (
            <p className="mono mt-1 text-rose-700">Production: {error.production}</p>
          )}
          {error.hint && <p className="mt-1 text-rose-600">{error.hint}</p>}
        </div>
      )}
    </div>
  )
}
