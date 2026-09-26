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
          'rounded-xl p-5 border text-sm font-medium ' +
          (ll1.is_ll1 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800')
        }
      >
        {ll1.summary}
      </div>

      {ll1.conflicts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Conflicts</h3>
          <div className="space-y-4">
            {ll1.conflicts.map((c, i) => (
              <div key={i} className="border-l-2 border-rose-300 pl-3">
                <p className="mono text-sm font-semibold">
                  M[{c.non_terminal}, {c.terminal}] — {c.kind} conflict
                </p>
                <CodeBlock className="my-2">{c.productions.join('\n')}</CodeBlock>
                <p className="text-xs text-slate-600">{c.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
