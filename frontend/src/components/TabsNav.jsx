import React from 'react'

const TABS = [
  { id: 'grammar', label: 'Grammar' },
  { id: 'diagnostics', label: 'Diagnostics' },
  { id: 'transform', label: 'Transform' },
  { id: 'first', label: 'FIRST' },
  { id: 'follow', label: 'FOLLOW' },
  { id: 'table', label: 'Parsing Table' },
  { id: 'll1', label: 'LL(1)' },
  { id: 'parser', label: 'Parser' },
  { id: 'tree', label: 'Parse Tree' },
  { id: 'learn', label: 'Learn' },
]

export default function TabsNav({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-slate-800/80 bg-slate-900/40 px-3 pt-3">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={
            'whitespace-nowrap px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all ' +
            (active === t.id
              ? 'bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-500'
              : 'text-slate-400 border-b-2 border-transparent hover:text-slate-200 hover:bg-slate-800/40')
          }
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}


