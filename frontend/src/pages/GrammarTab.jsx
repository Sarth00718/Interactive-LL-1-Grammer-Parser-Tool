import React from 'react'
import CodeBlock from '../components/CodeBlock.jsx'

export default function GrammarTab({ analysis }) {
  if (!analysis) return <Empty />
  const g = analysis.original_grammar

  return (
    <div className="space-y-5">
      <Section title="Original Grammar">
        <CodeBlock>{g.text}</CodeBlock>
      </Section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Start Symbol" value={g.start_symbol} />
        <Field label="Non-Terminals" value={g.non_terminals.join(', ')} />
        <Field label="Terminals" value={g.terminals.join(', ')} />
      </div>

      <Section title="Validation">
        {analysis.validation.errors.length === 0 ? (
          <p className="text-emerald-700 text-sm font-medium">✓ Grammar syntax valid</p>
        ) : (
          <ul className="text-sm text-rose-700 space-y-1">
            {analysis.validation.errors.map((e, i) => (
              <li key={i}>✗ {e.message}</li>
            ))}
          </ul>
        )}
        {analysis.validation.warnings.length > 0 && (
          <ul className="text-sm text-amber-700 mt-2 space-y-1">
            {analysis.validation.warnings.map((w, i) => (
              <li key={i}>⚠ {w.message}</li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">{label}</p>
      <p className="mono text-sm text-slate-800 break-words">{value}</p>
    </div>
  )
}

export function Empty() {
  return (
    <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-400 text-sm">
      Enter a grammar above and click <span className="font-medium text-slate-500">Analyze</span> to get started.
    </div>
  )
}
