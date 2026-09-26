import React from 'react'
import ParseTreeView from '../components/ParseTreeView.jsx'

export default function ParseTreeTab({ parseResult }) {
  if (!parseResult) {
    return (
      <div className="bg-[#090d16] border border-dashed border-[#1e2d4a] rounded-xl p-10 text-center text-slate-400 text-sm">
        Run a parse on the <span className="font-semibold text-indigo-400">Parser</span> tab to see its parse tree here.
      </div>
    )
  }

  if (!parseResult.accepted || !parseResult.parse_tree) {
    return (
      <div className="bg-[#090d16] border border-dashed border-[#1e2d4a] rounded-xl p-10 text-center text-slate-400 text-sm">
        No parse tree available — the last input was rejected (or the grammar is not LL(1)).
      </div>
    )
  }

  return (
    <div className="bg-[#0f172a] border border-[#1e2d4a] rounded-xl p-5 transition-colors">
      <h3 className="text-sm font-semibold text-slate-200 mb-3 uppercase tracking-wide">
        Parse Tree Visualizer
      </h3>
      <ParseTreeView tree={parseResult.parse_tree} />
      <div className="flex gap-4 mt-3 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-indigo-950/80 border border-indigo-500/60 inline-block" />{' '}
          non-terminal
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-amber-950/80 border border-amber-500/60 inline-block" />{' '}
          terminal / ε
        </span>
      </div>
    </div>
  )
}

