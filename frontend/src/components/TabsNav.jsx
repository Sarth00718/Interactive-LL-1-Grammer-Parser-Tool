import React from 'react'

const TABS = [
  { id: 'grammar', label: 'Grammar' },
  { id: 'diagnostics', label: 'Diagnostics' },
  { id: 'transform', label: 'Transform' },
  { id: 'first', label: 'FIRST' },
  { id: 'follow', label: 'FOLLOW' },
  { id: 'll1', label: 'LL(1)' },
  { id: 'table', label: 'Parsing Table' },
  { id: 'parser', label: 'Parser' },
  { id: 'tree', label: 'Parse Tree' },
  { id: 'learn', label: 'Learn' },
]

export default function TabsNav({ active, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-xl px-2">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={
            'whitespace-nowrap px-3.5 py-2.5 text-sm font-medium border-b-2 transition-colors ' +
            (active === t.id
              ? 'border-indigo-600 dark:border-indigo-400 text-indigo-700 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200')
          }
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

