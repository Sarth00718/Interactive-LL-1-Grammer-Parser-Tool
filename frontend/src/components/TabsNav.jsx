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
    <div className="flex gap-2 overflow-x-auto border-b border-gray-200 bg-gray-50 px-3 pt-3">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={
            'whitespace-nowrap px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all ' +
            (active === t.id
              ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:bg-gray-100')
          }
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}


