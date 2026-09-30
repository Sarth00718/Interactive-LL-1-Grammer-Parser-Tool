import React from 'react'
import ParseTreeView from '../components/ParseTreeView.jsx'

export default function ParseTreeTab({ parseResult }) {
  if (!parseResult) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-600 text-sm">
        Run a parse on the <span className="font-semibold text-indigo-600">Parser</span> tab to see its parse tree here.
      </div>
    )
  }

  if (!parseResult.accepted || !parseResult.parse_tree) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-600 text-sm">
        No parse tree available — the last input was rejected (or the grammar is not LL(1)).
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 transition-colors">
      <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
        Parse Tree Visualizer
      </h3>
      <ParseTreeView tree={parseResult.parse_tree} />
      <div className="flex gap-4 mt-3 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-indigo-100 border border-indigo-400 inline-block" />{' '}
          non-terminal
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-amber-100 border border-amber-400 inline-block" />{' '}
          terminal / ε
        </span>
      </div>
    </div>
  )
}

