import React, { useState } from 'react'
import { Empty } from './GrammarTab.jsx'

export default function TableTab({ analysis }) {
  const [selected, setSelected] = useState(null)
  if (!analysis) return <Empty />
  const pt = analysis.parsing_table
  const nonTerminals = Object.keys(pt.table)

  const firstSets = analysis.final_first?.first_sets || {}
  const followSets = analysis.final_follow?.follow_sets || {}

  const cell = selected
    ? {
        entries: pt.table[selected.nt][selected.col],
        reasons: pt.cell_reasons[selected.nt][selected.col],
      }
    : null

  return (
    <div className="space-y-5">
      {/* FIRST & FOLLOW Quick Reference Panel */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
            FIRST & FOLLOW Sets Reference
          </h3>
          <span className="text-xs text-gray-600">
            Parsing table entries M[A, a] depend directly on these sets
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {nonTerminals.map((nt) => (
            <div
              key={nt}
              className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs"
            >
              <span className="mono font-bold text-indigo-700 w-10 text-sm">{nt}</span>
              <div className="flex-1 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-gray-600 font-medium">FIRST:</span>
                  <span className="mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                    {'{' + (firstSets[nt] || []).join(', ') + '}'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-600 font-medium">FOLLOW:</span>
                  <span className="mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    {'{' + (followSets[nt] || []).join(', ') + '}'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LL(1) Parsing Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 scroll-x shadow-xl">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
            LL(1) Parsing Table
          </h3>
          <p className="text-xs text-gray-600">
            Click any populated cell to see why that production was placed there
          </p>
        </div>

        <table className="mono text-xs border-collapse w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-indigo-100 text-indigo-900 font-bold px-3 py-2.5 sticky left-0 z-10 shadow-md">
                M[A, a]
              </th>
              {pt.columns.map((col) => (
                <th
                  key={col}
                  className="border border-gray-300 bg-indigo-50 text-indigo-900 font-bold px-3 py-2.5 min-w-[120px]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nonTerminals.map((nt) => (
              <tr key={nt}>
                <td className="border border-gray-300 bg-indigo-50 text-indigo-900 font-bold px-3 py-2.5 sticky left-0 z-10 shadow-md">
                  {nt}
                </td>
                {pt.columns.map((col) => {
                  const entries = pt.table[nt][col]
                  const isConflict = entries.length > 1
                  const isSel = selected && selected.nt === nt && selected.col === col
                  return (
                    <td
                      key={col}
                      onClick={() => entries.length > 0 && setSelected({ nt, col })}
                      className={
                        'border border-gray-300 px-3 py-2.5 align-top transition-colors ' +
                        (entries.length > 0
                          ? 'cursor-pointer hover:bg-indigo-50 bg-white '
                          : 'bg-gray-50 ') +
                        (isConflict ? 'bg-rose-100 text-rose-900 ' : '') +
                        (isSel ? 'ring-2 ring-indigo-500 ring-inset bg-indigo-100 ' : '')
                      }
                    >
                      {entries.map((e, i) => (
                        <div
                          key={i}
                          className={
                            'font-bold ' +
                            (isConflict ? 'text-rose-700' : 'text-indigo-700')
                          }
                        >
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
        <div className="bg-white border border-indigo-300 rounded-xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-indigo-700 mb-2">
            Selected Cell Reasoning: M[{selected.nt}, {selected.col}]
          </h3>
          <div className="text-xs mono space-y-1.5 text-gray-800">
            {cell.reasons.map((r, i) => (
              <p key={i} className="bg-gray-50 p-2.5 rounded border border-gray-200 font-medium text-gray-700">
                {r}
              </p>
            ))}
          </div>
        </div>
      )}

      {pt.conflicts.length > 0 && (
        <p className="text-xs font-bold text-rose-700">
          ⚠️ Cells highlighted in red contain more than one production — indicating an LL(1) conflict.
        </p>
      )}
    </div>
  )
}


