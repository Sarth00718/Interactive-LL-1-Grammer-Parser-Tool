import React, { useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

export default function ParsingTableComponent({
  terminals = [],
  nonTerminals = [],
  actionTable = {},
  gotoTable = {},
  cellDetails = {},
  conflicts = [],
  algorithm = 'LR',
}) {
  const [selectedCell, setSelectedCell] = useState(null)
  const [filterConflictsOnly, setFilterConflictsOnly] = useState(false)

  const statesCount = Object.keys(actionTable).length

  // Helper to determine styling of action table cells
  const getCellBadgeClass = (val) => {
    if (!val) return 'text-slate-300 dark:text-slate-700'
    if (val.includes('/')) {
      return 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 font-extrabold border border-rose-300 dark:border-rose-800 animate-pulse'
    }
    if (val === 'acc') {
      return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold border border-emerald-300 dark:border-emerald-800'
    }
    if (val.startsWith('s')) {
      return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
    }
    if (val.startsWith('r')) {
      return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 font-bold border border-amber-200 dark:border-amber-800'
    }
    return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
  }

  const handleCellClick = (stateId, symbol, isGoto = false) => {
    if (isGoto) {
      const target = gotoTable[stateId]?.[symbol]
      if (target !== null && target !== undefined && target !== '') {
        setSelectedCell({
          type: 'goto',
          stateId,
          symbol,
          target,
          details: [
            {
              code: String(target),
              reason: `When non-terminal '${symbol}' is reduced in state I${stateId}, transition to state I${target}.`,
            },
          ],
        })
      }
    } else {
      const details = cellDetails[stateId]?.[symbol] || []
      const code = actionTable[stateId]?.[symbol] || ''
      if (code) {
        setSelectedCell({
          type: 'action',
          stateId,
          symbol,
          code,
          details,
          hasConflict: code.includes('/'),
        })
      }
    }
  }

  // Conflict state filter
  const conflictStates = new Set(conflicts.map(c => c.state_id))

  const visibleStateIds = Array.from({ length: statesCount }, (_, i) => i).filter(id => {
    if (filterConflictsOnly) {
      return conflictStates.has(id)
    }
    return true
  })

  return (
    <div className="space-y-4">
      {/* Legend & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Legend:
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
            s{'{i}'} = Shift to state i
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 font-mono">
            r{'{j}'} = Reduce by rule j
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 font-mono font-bold">
            acc = Accept
          </span>
          {conflicts.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 font-mono font-bold">
              Conflict
            </span>
          )}
        </div>

        {conflicts.length > 0 && (
          <button
            onClick={() => setFilterConflictsOnly(f => !f)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filterConflictsOnly
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
            }`}
          >
            {filterConflictsOnly ? 'Show All Rows' : `Filter ${conflicts.length} Conflict Rows`}
          </button>
        )}
      </div>

      {/* Parsing Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
              <tr>
                <th
                  rowSpan={2}
                  className="py-3 px-3 font-bold border-r border-slate-300 dark:border-slate-700 bg-slate-200/80 dark:bg-slate-800 sticky left-0 z-30 min-w-[70px]"
                >
                  State
                </th>
                <th
                  colSpan={terminals.length}
                  className="py-2 px-3 font-extrabold uppercase tracking-wider bg-blue-50/80 dark:bg-blue-950/40 border-r border-slate-300 dark:border-slate-700 text-blue-900 dark:text-blue-300"
                >
                  ACTION Table (Terminals)
                </th>
                <th
                  colSpan={nonTerminals.length}
                  className="py-2 px-3 font-extrabold uppercase tracking-wider bg-purple-50/80 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300"
                >
                  GOTO Table (Non-Terminals)
                </th>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700 font-mono">
                {terminals.map(t => (
                  <th
                    key={t}
                    className="py-2 px-2.5 font-bold text-slate-700 dark:text-slate-300 bg-blue-50/30 dark:bg-blue-950/20 border-r border-slate-200 dark:border-slate-800 min-w-[55px]"
                  >
                    {t}
                  </th>
                ))}
                {nonTerminals.map(nt => (
                  <th
                    key={nt}
                    className="py-2 px-2.5 font-bold text-slate-700 dark:text-slate-300 bg-purple-50/30 dark:bg-purple-950/20 border-r border-slate-200 dark:border-slate-800 last:border-r-0 min-w-[55px]"
                  >
                    {nt}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {visibleStateIds.map(stateId => {
                const isConflictState = conflictStates.has(stateId)
                return (
                  <tr
                    key={stateId}
                    className={`transition-colors ${
                      isConflictState
                        ? 'bg-rose-50/30 dark:bg-rose-950/10'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-2 px-3 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 sticky left-0 z-10">
                      I{stateId}
                    </td>

                    {/* ACTION Cells */}
                    {terminals.map(t => {
                      const val = actionTable[stateId]?.[t] || ''
                      return (
                        <td
                          key={t}
                          onClick={() => handleCellClick(stateId, t, false)}
                          className={`py-1.5 px-2 border-r border-slate-100 dark:border-slate-800 ${
                            val ? 'cursor-pointer hover:opacity-80' : ''
                          }`}
                        >
                          {val ? (
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${getCellBadgeClass(val)}`}>
                              {val}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700 select-none">-</span>
                          )}
                        </td>
                      )
                    })}

                    {/* GOTO Cells */}
                    {nonTerminals.map(nt => {
                      const val = gotoTable[stateId]?.[nt]
                      const hasVal = val !== null && val !== undefined && val !== ''
                      return (
                        <td
                          key={nt}
                          onClick={() => handleCellClick(stateId, nt, true)}
                          className={`py-1.5 px-2 border-r border-slate-100 dark:border-slate-800 last:border-r-0 ${
                            hasVal ? 'cursor-pointer hover:opacity-80' : ''
                          }`}
                        >
                          {hasVal ? (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              {val}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700 select-none">-</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Cell Detail Modal */}
      {selectedCell && (
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                Cell [{selectedCell.stateId}, '{selectedCell.symbol}']
              </span>
              {selectedCell.hasConflict && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200">
                  Conflict Cell
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedCell(null)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {(selectedCell.details || []).map((det, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs"
              >
                <div className="flex items-center justify-between mb-1 font-mono font-bold text-indigo-700 dark:text-indigo-300">
                  <span>Action: {det.code}</span>
                  {det.production_text && (
                    <span className="text-slate-500 font-normal">Rule: {det.production_text}</span>
                  )}
                </div>
                {det.reason && (
                  <p className="text-slate-600 dark:text-slate-300 mt-1">{det.reason}</p>
                )}
                {det.item_text && (
                  <div className="mt-1 font-mono text-[11px] text-slate-500 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                    Source Item: {det.item_text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
