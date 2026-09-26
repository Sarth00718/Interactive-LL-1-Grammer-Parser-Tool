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
  isDark,
  onToggleDark,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs p-5 transition-colors">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Breaking Down Grammars</h1>
            {/* Dark Theme Toggle Button */}
            <button
              onClick={onToggleDark}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <svg className="w-4 h-4 fill-amber-400" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 fill-indigo-600" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Interactive LL(1) Grammar Analysis and Predictive Parsing Tool</p>
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
        className="mono w-full text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-colors"
        placeholder={"E -> T E'\nE' -> + T E' | epsilon\nT -> F T'\nT' -> * F T' | epsilon\nF -> ( E ) | id"}
      />

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <label className="text-sm text-slate-600 dark:text-slate-300">Start symbol override:</label>
        <input
          value={startSymbol}
          onChange={(e) => setStartSymbol(e.target.value)}
          placeholder="(default: first non-terminal)"
          className="mono text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-md px-2 py-1 w-56 placeholder:text-slate-400 dark:placeholder:text-slate-600"
        />

        <button
          onClick={onAnalyze}
          disabled={loading}
          className="ml-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          {loading ? 'Analyzing\u2026' : 'Analyze'}
        </button>

        <select
          onChange={(e) => {
            if (e.target.value) onLoadExample(e.target.value)
            e.target.value = ''
          }}
          defaultValue=""
          className="text-sm border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
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
        <div className="mt-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 rounded-lg p-3 text-sm">
          <p className="font-semibold">Grammar Error</p>
          <p className="mt-1">{error.error || error.message}</p>
          {error.production && (
            <p className="mono mt-1 text-rose-700 dark:text-rose-300">Production: {error.production}</p>
          )}
          {error.hint && <p className="mt-1 text-rose-600 dark:text-rose-400">{error.hint}</p>}
        </div>
      )}
    </div>
  )
}

