import React, { useState } from 'react'
import { Empty } from './GrammarTab.jsx'

export default function FollowTab({ analysis }) {
  const [open, setOpen] = useState(null)
  if (!analysis) return <Empty />
  const sets = analysis.final_follow.follow_sets
  const explanations = analysis.final_follow.explanations

  return (
    <div className="bg-[#0f172a] border border-[#1e2d4a] rounded-xl p-5 shadow-xl">
      <h3 className="text-sm font-bold text-slate-200 mb-1 uppercase tracking-wide">
        FOLLOW Sets (Final Transformed Grammar)
      </h3>
      <p className="text-xs text-slate-400 mb-4">
        Click any row to view its step-by-step derivation reasoning.
      </p>

      <div className="space-y-2">
        {Object.entries(sets).map(([nt, set_]) => (
          <div key={nt} className="border border-[#1e2d4a] rounded-lg overflow-hidden">
            <button
              onClick={() => setOpen(open === nt ? null : nt)}
              className="w-full flex justify-between items-center px-4 py-2.5 bg-[#131d33] hover:bg-[#18243c] text-left transition-colors"
            >
              <span className="mono text-sm font-bold text-slate-100">
                FOLLOW(<span className="text-emerald-400">{nt}</span>) = {'{' + set_.join(', ') + '}'}
              </span>
              <span className="text-slate-400 text-xs">{open === nt ? '▲' : '▼'}</span>
            </button>
            {open === nt && (
              <div className="px-4 py-3 bg-[#090d16] text-xs mono space-y-1.5 text-slate-300 border-t border-[#1e2d4a]">
                {explanations[nt].length === 0 ? (
                  <p className="italic text-slate-400">
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


