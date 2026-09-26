import React from 'react'
import { Empty } from './GrammarTab.jsx'
import CodeBlock from '../components/CodeBlock.jsx'

export default function DiagnosticsTab({ analysis }) {
  if (!analysis) return <Empty />
  const rec = analysis.original_diagnostics.left_recursion

  return (
    <div className="space-y-5">
      <div className="bg-[#0f172a] border border-[#1e2d4a] rounded-xl p-5 transition-colors">
        <h3 className="text-sm font-semibold text-slate-200 mb-3 uppercase tracking-wide">
          Left Recursion Detection
        </h3>
        {!rec.has_direct_left_recursion && !rec.has_indirect_left_recursion && (
          <p className="text-emerald-400 text-sm font-medium">✓ No left recursion detected.</p>
        )}

        {rec.direct.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-rose-400 mb-2">Direct Left Recursion Detected</p>
            {rec.direct.map((d, i) => (
              <div key={i} className="mb-2 text-sm">
                <CodeBlock className="mb-1">{d.production}</CodeBlock>
                <p className="text-slate-400 text-xs">{d.reason}</p>
              </div>
            ))}
          </div>
        )}

        {rec.indirect.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-rose-400 mb-2">Indirect Left Recursion Detected</p>
            {rec.indirect.map((c, i) => (
              <CodeBlock key={i} className="mb-1">
                {'Cycle: ' + c.description}
              </CodeBlock>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#0f172a] border border-[#1e2d4a] rounded-xl p-5 transition-colors">
        <h3 className="text-sm font-semibold text-slate-200 mb-2 uppercase tracking-wide">
          Original Grammar Analysis — Not Used for Final LL(1) Table
        </h3>
        <p className="text-xs text-slate-400 mb-3">{analysis.original_diagnostics.note}</p>
        <p className="text-sm mb-2 font-medium text-slate-200">
          {analysis.original_diagnostics.ll1_status_if_used_directly}
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-3">
          <div>
            <p className="text-xs uppercase text-slate-400 mb-1">FIRST (original grammar)</p>
            <SetTable sets={analysis.original_diagnostics.first_sets} />
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400 mb-1">FOLLOW (original grammar)</p>
            <SetTable sets={analysis.original_diagnostics.follow_sets} />
          </div>
        </div>
      </div>
    </div>
  )
}

function SetTable({ sets }) {
  return (
    <div className="mono text-sm space-y-1">
      {Object.entries(sets).map(([k, v]) => (
        <div key={k}>
          <span className="text-indigo-400 font-semibold">{k}:</span>{' '}
          <span className="text-slate-200">{'{' + v.join(', ') + '}'}</span>
        </div>
      ))}
    </div>
  )
}

