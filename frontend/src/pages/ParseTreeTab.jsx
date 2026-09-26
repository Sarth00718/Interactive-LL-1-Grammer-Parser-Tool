import React from 'react'
import ParseTreeView from '../components/ParseTreeView.jsx'

export default function ParseTreeTab({ parseResult }) {
  if (!parseResult) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-10 text-center text-slate-400 dark:text-slate-500 text-sm">
        Run a parse on the Parser tab to see its parse tree here.
      </div>
    )
  }

  if (!parseResult.accepted || !parseResult.parse_tree) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-10 text-center text-slate-400 dark:text-slate-500 text-sm">
        No parse tree available — the last input was rejected (or the grammar is not LL(1)).
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 transition-colors">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
        Parse Tree Visualizer
      </h3>
      <ParseTreeView tree={parseResult.parse_tree} />
      <div className="flex gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-600 inline-block" />{' '}
          non-terminal
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-600 inline-block" />{' '}
          terminal / ε
        </span>
      </div>
    </div>
  )
}

