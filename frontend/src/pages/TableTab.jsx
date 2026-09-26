import React, { useState } from 'react'
import { Empty } from './GrammarTab.jsx'

export default function TableTab({ analysis }) {
  const [selected, setSelected] = useState(null)
  if (!analysis) return <Empty />
  const pt = analysis.parsing_table
  const nonTerminals = Object.keys(pt.table)

  const cell = selected
    ? {
        entries: pt.table[selected.nt][selected.col],
        reasons: pt.cell_reasons[selected.nt][selected.col],
      }
    : null

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-5 scroll-x">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">LL(1) Parsing Table</h3>
        <table className="mono text-xs border-collapse w-full">
          <thead>
            <tr>
              <th className="border border-slate-200 bg-slate-50 px-3 py-2 sticky left-0">M[A, a]</th>
              {pt.columns.map((col) => (
                <th key={col} className="border border-slate-200 bg-slate-50 px-3 py-2 min-w-[110px]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nonTerminals.map((nt) => (
              <tr key={nt}>
                <td className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold sticky left-0">{nt}</td>
                {pt.columns.map((col) => {
                  const entries = pt.table[nt][col]
                  const isConflict = entries.length > 1
                  const isSel = selected && selected.nt === nt && selected.col === col
                  return (
                    <td
                      key={col}
                      onClick={() => entries.length > 0 && setSelected({ nt, col })}
                      className={
                        'border border-slate-200 px-2 py-2 align-top ' +
                        (entries.length > 0 ? 'cursor-pointer hover:bg-indigo-50 ' : '') +
                        (isConflict ? 'bg-rose-50 ' : '') +
                        (isSel ? 'ring-2 ring-indigo-400 ring-inset ' : '')
                      }
                    >
                      {entries.map((e, i) => (
                        <div key={i} className={isConflict ? 'text-rose-700' : 'text-slate-700'}>
                          {e}
                        </div>
                      ))}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cell && (
        <div className="bg-white border border-indigo-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-indigo-900 mb-2">
            Selected Cell: M[{selected.nt}, {selected.col}]
          </h3>
          <div className="text-xs mono space-y-1.5 text-slate-700">
            {cell.reasons.map((r, i) => (
              <p key={i}>{r}</p>
            ))}
          </div>
        </div>
      )}

      {pt.conflicts.length > 0 && (
        <p className="text-xs text-rose-600">
          Cells highlighted in red contain more than one production — an LL(1) conflict.
        </p>
      )}
    </div>
  )
}
