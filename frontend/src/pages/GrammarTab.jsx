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
          <p className="text-emerald-700 dark:text-emerald-400 text-sm font-medium">✓ Grammar syntax valid</p>
        ) : (
          <ul className="text-sm text-rose-700 dark:text-rose-400 space-y-1">
            {analysis.validation.errors.map((e, i) => (
              <li key={i}>✗ {e.message}</li>
            ))}
          </ul>
        )}
        {analysis.validation.warnings.length > 0 && (
          <ul className="text-sm text-amber-700 dark:text-amber-400 mt-2 space-y-1">
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 transition-colors">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-colors">
      <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">{label}</p>
      <p className="mono text-sm text-slate-800 dark:text-slate-200 break-words">{value}</p>
    </div>
  )
}

export function Empty() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-10 text-center text-slate-400 dark:text-slate-500 text-sm transition-colors">
      Enter a grammar above and click <span className="font-medium text-slate-600 dark:text-slate-300">Analyze</span> to get started.
    </div>
  )
}

