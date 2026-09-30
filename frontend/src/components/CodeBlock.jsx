import React from 'react'

export default function CodeBlock({ children, className = '' }) {
  return (
    <pre
      className={
        'mono text-sm bg-gray-50 text-gray-900 border border-gray-300 rounded-lg p-3 whitespace-pre-wrap break-words transition-colors ' +
        className
      }
    >
      {children}
    </pre>
  )
}

