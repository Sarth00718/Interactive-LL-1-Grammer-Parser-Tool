import React from 'react'
import { Empty } from './GrammarTab.jsx'
import CodeBlock from '../components/CodeBlock.jsx'

export default function LL1Tab({ analysis }) {
  if (!analysis) return <Empty />
  const ll1 = analysis.ll1

  return (
    <div className="space-y-5">
      <div
        className={
          'rounded-xl p-5 border text-sm font-medium transition-colors ' +
          (ll1.is_ll1
            ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
            : 'bg-rose-950/60 border-rose-800 text-rose-200')
        }
      >
        {ll1.summary}
      </div>

      {ll1.conflicts.length > 0 && (
        <div className="bg-[#0f172a] border border-[#1e2d4a] rounded-xl p-5 transition-colors">
          <h3 className="text-sm font-semibold text-slate-200 mb-3 uppercase tracking-wide">
            Conflicts Detected
          </h3>
          <div className="space-y-4">
            {ll1.conflicts.map((c, i) => (
              <div key={i} className="border-l-2 border-rose-500 pl-3">
                <p className="mono text-sm font-semibold text-rose-300">
                  M[{c.non_terminal}, {c.terminal}] — {c.kind} conflict
                </p>
                <CodeBlock className="my-2">{c.productions.join('\n')}</CodeBlock>
                <p className="text-xs text-slate-400">{c.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

