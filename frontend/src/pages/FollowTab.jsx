import React, { useState } from 'react'
import { Empty } from './GrammarTab.jsx'

export default function FollowTab({ analysis }) {
  const [open, setOpen] = useState(null)
  if (!analysis) return <Empty />
  const sets = analysis.final_follow.follow_sets
  const explanations = analysis.final_follow.explanations

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1 uppercase tracking-wide">
        FOLLOW Sets (Final Transformed Grammar)
      </h3>
      <p className="text-xs text-slate-500 mb-4">Click a row to see the derivation reasoning.</p>

      <div className="space-y-2">
        {Object.entries(sets).map(([nt, set_]) => (
          <div key={nt} className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpen(open === nt ? null : nt)}
              className="w-full flex justify-between items-center px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-left"
            >
              <span className="mono text-sm">
                FOLLOW({nt}) = {'{' + set_.join(', ') + '}'}
              </span>
              <span className="text-slate-400 text-xs">{open === nt ? '\u25b2' : '\u25bc'}</span>
            </button>
            {open === nt && (
              <div className="px-4 py-3 bg-white text-xs mono space-y-1.5 text-slate-600 border-t border-slate-100">
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
