import React, { useState } from 'react'
import { Empty } from './GrammarTab.jsx'

export default function FollowTab({ analysis }) {
  const [open, setOpen] = useState(null)
  if (!analysis) return <Empty />
  const sets = analysis.final_follow.follow_sets
  const explanations = analysis.final_follow.explanations

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xl">
      <h3 className="text-sm font-bold text-gray-800 mb-1 uppercase tracking-wide">
        FOLLOW Sets (Final Transformed Grammar)
      </h3>
      <p className="text-xs text-gray-600 mb-4">
        Click any row to view its step-by-step derivation reasoning.
      </p>

      <div className="space-y-2">
        {Object.entries(sets).map(([nt, set_]) => (
          <div key={nt} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpen(open === nt ? null : nt)}
              className="w-full flex justify-between items-center px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-left transition-colors"
            >
              <span className="mono text-sm font-bold text-gray-900">
                FOLLOW(<span className="text-emerald-700">{nt}</span>) = {'{' + set_.join(', ') + '}'}
              </span>
              <span className="text-gray-600 text-xs">{open === nt ? '▲' : '▼'}</span>
            </button>
            {open === nt && (
              <div className="px-4 py-3 bg-gray-50 text-xs mono space-y-1.5 text-gray-700 border-t border-gray-200">
                {explanations[nt].length === 0 ? (
                  <p className="italic text-gray-500">
                    (No direct contributions found besides base rules — see Rule 1 for the start symbol.)
                  </p>
                ) : (
                  explanations[nt].map((line, i) => <p key={i}>{line}</p>)
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}


