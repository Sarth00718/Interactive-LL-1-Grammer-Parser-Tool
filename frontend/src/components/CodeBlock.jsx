import React from 'react'

export default function CodeBlock({ children, className = '' }) {
  return (
    <pre
      className={
        'mono text-sm bg-slate-100 border border-slate-200 rounded-lg p-3 whitespace-pre-wrap break-words ' +
        className
      }
    >
      {children}
    </pre>
  )
}
