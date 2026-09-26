import React from 'react'
import StatusBadge from './StatusBadge.jsx'

export default function GrammarInputPanel({
  grammarText,
  setGrammarText,
  startSymbol,
  setStartSymbol,
  onAnalyze,
  examples,
  selectedExampleId,
  onLoadExample,
  loading,
  error,
  analysis,
}) {
  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl p-6">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Breaking Down Grammars
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Interactive LL(1) Grammar Analysis & Predictive Parsing Tool</p>
        </div>

        {analysis && !analysis.stopped_after_validation && (
          <StatusBadge
            ok={analysis.ll1?.is_ll1}
            okText="LL(1) Grammar"
            badText={`Not LL(1) — ${analysis.ll1?.conflict_count} conflict(s)`}
          />
        )}
      </div>

      <textarea
        value={grammarText}
        onChange={(e) => setGrammarText(e.target.value)}
        rows={7}
        spellCheck={false}
        className="mono w-full text-sm border border-slate-700/60 bg-[#090d14] text-slate-100 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner placeholder:text-slate-600 leading-relaxed"
        placeholder={"E -> T E'\nE' -> + T E' | epsilon\nT -> F T'\nT' -> * F T' | epsilon\nF -> ( E ) | id"}
      />

      <div className="flex flex-wrap items-center gap-4 mt-5">
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-400 font-semibold">Start symbol</label>
          <input
            value={startSymbol}
            onChange={(e) => setStartSymbol(e.target.value)}
            placeholder="(default: first)"
            className="mono text-sm border border-slate-700/60 bg-[#090d14] text-slate-100 rounded-lg px-3 py-2 w-32 sm:w-48 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>

        <button
          onClick={onAnalyze}
          disabled={loading}
          className="ml-auto bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-indigo-900/20"
        >
          {loading ? 'Analyzing…' : 'Analyze Grammar'}
        </button>

        <select
          value={selectedExampleId || ''}
          onChange={(e) => {
            if (e.target.value) onLoadExample(e.target.value)
          }}
          className="text-sm border border-slate-700/60 rounded-lg px-4 py-2.5 bg-[#090d14] text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium transition-all cursor-pointer hover:bg-slate-800/50"
        >
          <option value="" disabled className="bg-slate-900 text-slate-400">
            Custom / Select Example…
          </option>
          {examples.map((ex) => (
            <option key={ex.id} value={ex.id} className="bg-slate-900 text-slate-200">
              {ex.title}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mt-5 bg-rose-950/40 border border-rose-900/50 text-rose-200 rounded-xl p-4 text-sm backdrop-blur-sm">
          <p className="font-bold text-rose-300 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Grammar Error
          </p>
          <p className="mt-1.5">{error.error || error.message}</p>
          {error.production && (
            <p className="mono mt-2 text-rose-300/80 bg-rose-950/50 inline-block px-2 py-1 rounded">Production: {error.production}</p>
          )}
          {error.hint && <p className="mt-2 text-rose-400/80">{error.hint}</p>}
        </div>
      )}
    </div>
  )
}


