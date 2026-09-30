import React, { useState } from 'react'
import { Empty } from './GrammarTab.jsx'

export default function FirstTab({ analysis }) {
  const [open, setOpen] = useState(null)
  if (!analysis) return <Empty />
  const sets = analysis.final_first.first_sets
  const explanations = analysis.final_first.explanations

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xl">
      <h3 className="text-sm font-bold text-gray-800 mb-1 uppercase tracking-wide">
        FIRST Sets (Final Transformed Grammar)
      </h3>
      <p className="text-xs text-gray-600 mb-4">
        Click any row to view its step-by-step derivation reasoning.
      </p>

      <div className="space-y-2">
        {Object.entries(sets).map(([nt, set_]) => (
          <div key={nt} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpen(open === nt ? null : nt)}
              className="w-full flex justify-between items-center px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-left transition-colors"
            >
              <span className="mono text-sm font-bold text-gray-900">
                FIRST(<span className="text-indigo-700">{nt}</span>) = {'{' + set_.join(', ') + '}'}
              </span>
              <span className="text-gray-600 text-xs">{open === nt ? '▲' : '▼'}</span>
            </button>
            {open === nt && (
              <div className="px-4 py-3 bg-gray-50 text-xs mono space-y-1.5 text-gray-700 border-t border-gray-200">
                {explanations[nt].map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}


