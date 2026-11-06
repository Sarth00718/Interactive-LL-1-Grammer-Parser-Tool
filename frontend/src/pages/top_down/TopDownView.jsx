import React, { useState, useEffect } from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  ArrowDownToLine,
  Network,
  ArrowRightToLine,
  ArrowLeftToLine,
  Table as TableIcon,
  Play,
  HelpCircle,
  GitFork,
  FileCheck2,
} from 'lucide-react'
import FirstTab from './FirstTab.jsx'
import FollowTab from './FollowTab.jsx'
import LL1Tab from './LL1Tab.jsx'
import TableTab from './TableTab.jsx'
import TransformTab from './TransformTab.jsx'
import ParserTab from './ParserTab.jsx'
import ParseTreeTab from './ParseTreeTab.jsx'

export default function TopDownView({
  analysis,
  grammarText,
  startSymbol,
  sampleInput,
  parseResult,
  setParseResult,
  initialSubTab,
  onNavigate,
}) {
  const [subTab, setSubTab] = useState(initialSubTab || 'overview')

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab)
    }
  }, [initialSubTab])

  if (!analysis) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <ArrowDownToLine className="w-10 h-10 text-indigo-500 mx-auto mb-3 opacity-60" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          No Grammar Analyzed Yet
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Load or enter a grammar in the Grammar Workspace to run the Top-Down LL(1) pipeline.
        </p>
        <button
          onClick={() => onNavigate && onNavigate('workspace')}
          className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
        >
          Go to Workspace
        </button>
      </div>
    )
  }

  const isLL1 = analysis?.ll1?.is_ll1
  const conflictsCount = analysis?.ll1?.conflicts?.length || 0

  const SUB_TABS = [
    { id: 'overview', label: 'LL(1) Status & Conflicts', icon: FileCheck2 },
    { id: 'transform', label: 'Transformations', icon: GitFork },
    { id: 'first', label: 'FIRST Sets', icon: ArrowRightToLine },
    { id: 'follow', label: 'FOLLOW Sets', icon: ArrowLeftToLine },
    { id: 'table', label: 'Parsing Table M[A, a]', icon: TableIcon },
    { id: 'simulator', label: 'Parsing Simulator', icon: Play },
    { id: 'tree', label: 'Parse Tree', icon: Network },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ArrowDownToLine className="w-5 h-5 text-indigo-600" />
              Top-Down LL(1) Predictive Parsing Laboratory
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${isLL1
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                }`}
            >
              {isLL1 ? 'LL(1) Compatible' : `${conflictsCount} Conflict(s)`}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Predictive top-down parser that scans tokens left-to-right (L) and constructs a leftmost derivation (L) with 1 lookahead token.
          </p>
        </div>
      </div>

      {/* Sub Tabs Bar */}
      <div className="flex gap-1.5 overflow-x-auto p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
        {SUB_TABS.map((t) => {
          const Icon = t.icon
          const isActive = subTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${isActive
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-900/40'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        {subTab === 'overview' && <LL1Tab analysis={analysis} />}
        {subTab === 'transform' && <TransformTab analysis={analysis} />}
        {subTab === 'first' && <FirstTab analysis={analysis} />}
        {subTab === 'follow' && <FollowTab analysis={analysis} />}
        {subTab === 'table' && <TableTab analysis={analysis} />}
        {subTab === 'simulator' && (
          <ParserTab
            analysis={analysis}
            grammarText={grammarText}
            startSymbol={startSymbol}
            sampleInput={sampleInput}
            result={parseResult}
            setResult={setParseResult}
          />
        )}
        {subTab === 'tree' && <ParseTreeTab parseResult={parseResult} />}
      </div>
    </div>
  )
}

