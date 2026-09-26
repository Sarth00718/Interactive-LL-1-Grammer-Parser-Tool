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
      <div className="bg-[#0f172a] border border-[#1e2d4a] rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
            FIRST & FOLLOW Sets Reference
          </h3>
          <span className="text-xs text-slate-400">
            Parsing table entries M[A, a] depend directly on these sets
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {nonTerminals.map((nt) => (
            <div
              key={nt}
              className="flex items-center justify-between p-2.5 rounded-lg border border-[#1e2d4a] bg-[#090d16] text-xs"
            >
              <span className="mono font-bold text-indigo-400 w-10 text-sm">{nt}</span>
              <div className="flex-1 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 font-medium">FIRST:</span>
                  <span className="mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80">
                    {'{' + (firstSets[nt] || []).join(', ') + '}'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 font-medium">FOLLOW:</span>
                  <span className="mono font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
                    {'{' + (followSets[nt] || []).join(', ') + '}'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LL(1) Parsing Table */}
      <div className="bg-[#0f172a] border border-[#1e2d4a] rounded-xl p-5 scroll-x shadow-xl">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
            LL(1) Parsing Table
          </h3>
          <p className="text-xs text-slate-400">
            Click any populated cell to see why that production was placed there
          </p>
        </div>

        <table className="mono text-xs border-collapse w-full">
          <thead>
            <tr>
              <th className="border border-[#1e2d4a] bg-[#18243c] text-indigo-300 font-bold px-3 py-2.5 sticky left-0 z-10 shadow-md">
                M[A, a]
              </th>
              {pt.columns.map((col) => (
                <th
                  key={col}
                  className="border border-[#1e2d4a] bg-[#131d33] text-indigo-300 font-bold px-3 py-2.5 min-w-[120px]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nonTerminals.map((nt) => (
              <tr key={nt}>
                <td className="border border-[#1e2d4a] bg-[#162036] text-indigo-300 font-bold px-3 py-2.5 sticky left-0 z-10 shadow-md">
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
                        'border border-[#1e2d4a] px-3 py-2.5 align-top transition-colors ' +
                        (entries.length > 0
                          ? 'cursor-pointer hover:bg-indigo-950/80 bg-[#0c1322] '
                          : 'bg-[#060a12] ') +
                        (isConflict ? 'bg-rose-950/90 text-rose-200 ' : '') +
                        (isSel ? 'ring-2 ring-indigo-400 ring-inset bg-indigo-950 ' : '')
                      }
                    >
                      {entries.map((e, i) => (
                        <div
                          key={i}
                          className={
                            'font-bold ' +
                            (isConflict ? 'text-rose-300' : 'text-indigo-200')
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
        <div className="bg-[#0f172a] border border-indigo-500/50 rounded-xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-indigo-300 mb-2">
            Selected Cell Reasoning: M[{selected.nt}, {selected.col}]
          </h3>
          <div className="text-xs mono space-y-1.5 text-slate-200">
            {cell.reasons.map((r, i) => (
              <p key={i} className="bg-[#090d16] p-2.5 rounded border border-[#1e2d4a] font-medium text-slate-300">
                {r}
              </p>
            ))}
          </div>
        </div>
      )}

      {pt.conflicts.length > 0 && (
        <p className="text-xs font-bold text-rose-400">
          ⚠️ Cells highlighted in red contain more than one production — indicating an LL(1) conflict.
        </p>
      )}
    </div>
  )
}


