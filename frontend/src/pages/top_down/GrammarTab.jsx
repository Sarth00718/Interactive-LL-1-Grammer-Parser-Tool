import React from 'react'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import CodeBlock from '../../components/CodeBlock.jsx'

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
          <p className="text-emerald-700 text-sm font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Grammar syntax valid</span>
          </p>
        ) : (
          <ul className="text-sm text-rose-700 space-y-1">
            {analysis.validation.errors.map((e, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{e.message}</span>
              </li>
            ))}
          </ul>
        )}
        {analysis.validation.warnings.length > 0 && (
          <ul className="text-sm text-amber-700 mt-2 space-y-1">
            {analysis.validation.warnings.map((w, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{w.message}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 transition-colors">
      <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 transition-colors">
      <p className="text-xs uppercase tracking-wide text-gray-600 mb-1">{label}</p>
      <p className="mono text-sm text-indigo-700 font-semibold break-words">{value}</p>
    </div>
  )
}

export function Empty() {
  return (
    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-600 text-sm transition-colors">
      Enter a grammar above and click <span className="font-semibold text-indigo-600">Analyze</span> to get started.
    </div>
  )
}

