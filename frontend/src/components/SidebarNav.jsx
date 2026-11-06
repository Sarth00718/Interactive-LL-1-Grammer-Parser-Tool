import React, { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Code2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Terminal,
  CircleDot,
  Filter,
  Eye,
  GitMerge,
  Scale,
  BookOpen,
  FileText,
  GraduationCap,
  ChevronRight,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Network,
  Table as TableIcon,
  Play,
  FileCheck2,
  ListOrdered,
  GitFork,
  ArrowRightToLine,
  ArrowLeftToLine,
} from 'lucide-react'

export const NAV_HIERARCHY = {
  workspace: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workspace', label: 'Grammar Workspace', icon: Code2 },
  ],
  topDown: {
    id: 'top-down-parent',
    label: 'Top-Down Parsing',
    icon: ArrowDownToLine,
    parsers: [
      {
        id: 'top-down',
        name: 'LL(1) Parser',
        badge: 'LL(1)',
        icon: ArrowDownToLine,
        subItems: [
          { id: 'overview', label: 'LL(1) Analysis & Conflicts', icon: FileCheck2 },
          { id: 'first', label: 'FIRST Sets Derivation', icon: ArrowRightToLine },
          { id: 'follow', label: 'FOLLOW Sets Derivation', icon: ArrowLeftToLine },
          { id: 'transform', label: 'Left Recursion & Factoring', icon: GitFork },
          { id: 'table', label: 'Predictive Table M[A, a]', icon: TableIcon },
          { id: 'simulator', label: 'Predictive Parsing Simulation', icon: Play },
          { id: 'tree', label: 'Parse Tree Construction', icon: Network },
        ],
      },
    ],
  },
  bottomUp: {
    id: 'bottom-up-parent',
    label: 'Bottom-Up Parsing',
    icon: ArrowUpFromLine,
    parsers: [
      {
        id: 'lr0',
        name: 'LR(0) Parser',
        badge: 'LR(0)',
        icon: CircleDot,
        subItems: [
          { id: 'automaton', label: 'Canonical Collection', icon: Network },
          { id: 'items', label: 'Closure & GOTO', icon: ListOrdered },
          { id: 'table', label: 'LR(0) Parsing Table', icon: TableIcon },
          { id: 'simulator', label: 'Parsing Simulation', icon: Play },
        ],
      },
      {
        id: 'slr1',
        name: 'SLR(1) Parser',
        badge: 'SLR(1)',
        icon: Filter,
        subItems: [
          { id: 'automaton', label: 'LR(0) Item Sets', icon: Network },
          { id: 'items', label: 'FOLLOW Sets Reduction', icon: ListOrdered },
          { id: 'table', label: 'SLR(1) Parsing Table', icon: TableIcon },
          { id: 'simulator', label: 'Parsing Simulation', icon: Play },
        ],
      },
      {
        id: 'clr1',
        name: 'CLR(1) Parser',
        badge: 'CLR(1)',
        icon: Eye,
        subItems: [
          { id: 'automaton', label: 'LR(1) Item Sets', icon: Network },
          { id: 'items', label: 'Closure & Lookaheads', icon: ListOrdered },
          { id: 'table', label: 'CLR(1) Parsing Table', icon: TableIcon },
          { id: 'simulator', label: 'Parsing Simulation', icon: Play },
        ],
      },
      {
        id: 'lalr1',
        name: 'LALR(1) Parser',
        badge: 'LALR(1)',
        icon: GitMerge,
        subItems: [
          { id: 'automaton', label: 'LR(1) States & Graph', icon: Network },
          { id: 'items', label: 'State Merging', icon: ListOrdered },
          { id: 'table', label: 'LALR(1) Parsing Table', icon: TableIcon },
          { id: 'simulator', label: 'Parsing Simulation', icon: Play },
        ],
      },
    ],
  },
  learning: [
    { id: 'compare', label: 'Parser Comparison', icon: Scale },
    { id: 'examples', label: 'Examples Library', icon: BookOpen },
    { id: 'docs', label: 'Algorithm Docs', icon: FileText },
    { id: 'viva', label: 'Viva Preparation', icon: GraduationCap },
  ],
}

export default function SidebarNav({
  activeNav,
  activeSubTab,
  onSelectNav,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapsed,
}) {
  const isTopDownActive = activeNav === 'top-down'
  const isBottomUpActive = ['bottom-up', 'lr0', 'slr1', 'clr1', 'lalr1'].includes(activeNav)

  // Expandable accordions state
  const [topDownExpanded, setTopDownExpanded] = useState(true)
  const [bottomUpExpanded, setBottomUpExpanded] = useState(true)
  const [expandedParser, setExpandedParser] = useState(
    ['lr0', 'slr1', 'clr1', 'lalr1'].includes(activeNav) ? activeNav : 'slr1'
  )

  // Auto-expand active sections
  useEffect(() => {
    if (activeNav === 'top-down') {
      setTopDownExpanded(true)
    } else if (['lr0', 'slr1', 'clr1', 'lalr1'].includes(activeNav)) {
      setExpandedParser(activeNav)
      setBottomUpExpanded(true)
    }
  }, [activeNav])

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white dark:bg-[#0E131F] text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/80 flex flex-col transition-all duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-[68px]' : 'lg:w-[270px]'} w-[270px]`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-white dark:bg-[#0E131F]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-600/30">
              <Terminal className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-tight truncate">
                  Grammar Lab
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">
                  Compiler Studio
                </div>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapsed}
            className="hidden lg:flex p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Scrollable Body */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* 1. WORKSPACE SECTION */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Workspace
              </div>
            )}

            {NAV_HIERARCHY.workspace.map((item) => {
              const Icon = item.icon
              const isActive = activeNav === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectNav(item.id)
                    if (onClose) onClose()
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                </button>
              )
            })}
          </div>

          {/* 2. TOP-DOWN PARSING SECTION */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2.5 py-1">
              {!isCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Top-Down Parsing
                </span>
              )}
              {!isCollapsed && (
                <button
                  onClick={() => setTopDownExpanded(!topDownExpanded)}
                  className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition p-0.5"
                  title={topDownExpanded ? 'Collapse Top-Down' : 'Expand Top-Down'}
                >
                  {topDownExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>

            {isCollapsed ? (
              <button
                onClick={() => {
                  onSelectNav('top-down', 'overview')
                  if (onClose) onClose()
                }}
                className={`w-full flex items-center justify-center p-2 rounded-lg text-xs transition ${
                  isTopDownActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
                title="Top-Down Parser (LL1)"
              >
                <ArrowDownToLine className="w-4 h-4" />
              </button>
            ) : (
              topDownExpanded && (
                <div className="space-y-1">
                  {NAV_HIERARCHY.topDown.parsers.map((parser) => {
                    const Icon = parser.icon
                    return (
                      <div key={parser.id} className="space-y-1">
                        <button
                          onClick={() => {
                            onSelectNav(parser.id, 'overview')
                            if (onClose) onClose()
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                            isTopDownActive
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-600/15 dark:text-indigo-400 dark:border-indigo-500/20'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                isTopDownActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                              }`}
                            />
                            <span className="truncate">{parser.name}</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-transparent">
                            {parser.badge}
                          </span>
                        </button>

                        {/* Sub-items for LL(1) */}
                        <div className="ml-5 pl-2.5 border-l border-slate-200 dark:border-slate-800 space-y-0.5">
                          {parser.subItems.map((sub) => {
                            const SubIcon = sub.icon
                            const isSubActive =
                              isTopDownActive && (activeSubTab === sub.id || (!activeSubTab && sub.id === 'overview'))

                            return (
                              <button
                                key={sub.id}
                                onClick={() => {
                                  onSelectNav('top-down', sub.id)
                                  if (onClose) onClose()
                                }}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium transition ${
                                  isSubActive
                                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                                }`}
                              >
                                <SubIcon className="w-3 h-3 opacity-70" />
                                <span className="truncate">{sub.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            )}
          </div>

          {/* 3. BOTTOM-UP PARSING SECTION */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2.5 py-1">
              {!isCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Bottom-Up Parsing
                </span>
              )}
              {!isCollapsed && (
                <button
                  onClick={() => setBottomUpExpanded(!bottomUpExpanded)}
                  className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition p-0.5"
                  title={bottomUpExpanded ? 'Collapse Bottom-Up' : 'Expand Bottom-Up'}
                >
                  {bottomUpExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>

            {isCollapsed ? (
              <div className="space-y-1">
                {NAV_HIERARCHY.bottomUp.parsers.map((parser) => {
                  const Icon = parser.icon
                  const isCurrent = activeNav === parser.id
                  return (
                    <button
                      key={parser.id}
                      onClick={() => {
                        onSelectNav(parser.id, 'automaton')
                        if (onClose) onClose()
                      }}
                      className={`w-full flex items-center justify-center p-2 rounded-lg text-xs transition ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                      title={parser.name}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  )
                })}
              </div>
            ) : (
              bottomUpExpanded && (
                <div className="space-y-1">
                  {NAV_HIERARCHY.bottomUp.parsers.map((parser) => {
                    const Icon = parser.icon
                    const isParserActive = activeNav === parser.id
                    const isSubExpanded = expandedParser === parser.id

                    return (
                      <div key={parser.id} className="space-y-1">
                        <button
                          onClick={() => {
                            onSelectNav(parser.id, 'automaton')
                            setExpandedParser(isSubExpanded ? '' : parser.id)
                            if (onClose) onClose()
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                            isParserActive
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-600/15 dark:text-indigo-400 dark:border-indigo-500/20'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                isParserActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                              }`}
                            />
                            <span className="truncate">{parser.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-transparent">
                              {parser.badge}
                            </span>
                            <div
                              onClick={(e) => {
                                e.stopPropagation()
                                setExpandedParser(isSubExpanded ? '' : parser.id)
                              }}
                              className="p-0.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
                            >
                              {isSubExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Nested Sub-tabs for the parser */}
                        {isSubExpanded && (
                          <div className="ml-5 pl-2.5 border-l border-slate-200 dark:border-slate-800 space-y-0.5">
                            {parser.subItems.map((sub) => {
                              const SubIcon = sub.icon
                              const isSubActive = isParserActive && activeSubTab === sub.id

                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => {
                                    onSelectNav(parser.id, sub.id)
                                    if (onClose) onClose()
                                  }}
                                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium transition ${
                                    isSubActive
                                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                                  }`}
                                >
                                  <SubIcon className="w-3 h-3 opacity-70" />
                                  <span className="truncate">{sub.label}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            )}
          </div>

          {/* 4. ANALYSIS & LEARNING SECTION */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Analysis & Learning
              </div>
            )}

            {NAV_HIERARCHY.learning.map((item) => {
              const Icon = item.icon
              const isActive = activeNav === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectNav(item.id)
                    if (onClose) onClose()
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Footer info & Engine Pill */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0E131F]">
            <span className="font-mono">v2.0 • Pure Python</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Parser Engine Active" />
          </div>
        )}
      </aside>
    </>
  )
}
