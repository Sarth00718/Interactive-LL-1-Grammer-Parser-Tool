import React from 'react'

export default function StatusBadge({ ok, okText, badText }) {
  return (
    <span
      className={
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ' +
        (ok ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800')
      }
    >
      <span className={'h-1.5 w-1.5 rounded-full ' + (ok ? 'bg-emerald-600' : 'bg-rose-600')} />
      {ok ? okText : badText}
    </span>
  )
}
