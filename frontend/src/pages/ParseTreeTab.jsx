import React from 'react'
import ParseTreeView from '../components/ParseTreeView.jsx'

export default function ParseTreeTab({ parseResult }) {
  if (!parseResult) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-400 text-sm">
        Run a parse on the Parser tab to see its parse tree here.
      </div>
    )
  }

  if (!parseResult.accepted || !parseResult.parse_tree) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-400 text-sm">
        No parse tree available — the last input was rejected (or the grammar is not LL(1)).
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Parse Tree</h3>
      <ParseTreeView tree={parseResult.parse_tree} />
      <div className="flex gap-4 mt-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-indigo-50 border border-indigo-300 inline-block" /> non-terminal
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-amber-50 border border-amber-300 inline-block" /> terminal / ε
        </span>
      </div>
    </div>
  )
}
