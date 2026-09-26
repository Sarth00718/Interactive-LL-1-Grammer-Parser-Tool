import React from 'react'

export default function CodeBlock({ children, className = '' }) {
  return (
    <pre
      className={
        'mono text-sm bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg p-3 whitespace-pre-wrap break-words transition-colors ' +
        className
      }
    >
      {children}
    </pre>
  )
}

