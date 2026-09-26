import React from 'react'
import { Empty } from './GrammarTab.jsx'
import CodeBlock from '../components/CodeBlock.jsx'

export default function TransformTab({ analysis }) {
  if (!analysis) return <Empty />
  const t = analysis.transform

  return (
    <div className="space-y-5">
      {!t.was_transformed && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
          Grammar required no transformation — it was already free of left recursion and common prefixes.
        </div>
      )}

      {t.left_recursion_elimination_steps.length > 0 && (
        <Section title="Left Recursion Elimination">
          {t.left_recursion_elimination_steps.map((s, i) => (
            <StepCard key={i} step={s} />
          ))}
        </Section>
      )}

      {t.left_factoring_steps.length > 0 && (
        <Section title="Left Factoring">
          {t.left_factoring_steps.map((s, i) => (
            <div key={i} className="mb-4">
              <p className="text-xs text-slate-500 mb-1">Common prefix in productions of '{s.non_terminal}'</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs uppercase text-slate-400 mb-1">Before</p>
                  <CodeBlock>{s.before}</CodeBlock>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400 mb-1">After</p>
                  <CodeBlock>{s.after}</CodeBlock>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">{s.explanation}</p>
            </div>
          ))}
        </Section>
      )}

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-indigo-900 mb-2 uppercase tracking-wide">
          Final Grammar for LL(1) Analysis
        </h3>
        <CodeBlock className="bg-white">{analysis.final_grammar.text}</CodeBlock>
        <p className="text-xs text-indigo-800 mt-2">
          ✓ Grammar transformation complete. FIRST and FOLLOW sets (see the FIRST / FOLLOW tabs) and the LL(1)
          parsing table are calculated from this transformed grammar.
        </p>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  )
}

function StepCard({ step }) {
  return (
    <div className="mb-4 border-l-2 border-indigo-200 pl-3">
      <p className="text-xs text-slate-500 mb-1">{step.explanation}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <p className="text-xs uppercase text-slate-400 mb-1">Before</p>
          <CodeBlock>{step.before}</CodeBlock>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-400 mb-1">After</p>
          <CodeBlock>{step.after}</CodeBlock>
        </div>
      </div>
    </div>
  )
}
