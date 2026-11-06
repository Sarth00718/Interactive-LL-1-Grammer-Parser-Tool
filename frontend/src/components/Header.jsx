import React from 'react'
import {
  Menu,
  Moon,
  Sun,
  ChevronRight,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Header({
  activeNav,
  activeSubTab,
  onOpenSidebar,
  onQuickAnalyze,
  loading = false,
  grammarText = '',
  isCollapsed = false,
}) {
  const { isDark, toggleTheme } = useTheme()

  // Generate dynamic breadcrumb labels based on activeNav and activeSubTab
  const getBreadcrumb = () => {
    switch (activeNav) {
      case 'dashboard':
        return { section: 'Workspace', page: 'Dashboard', sub: null }
      case 'workspace':
        return { section: 'Workspace', page: 'Grammar Workspace', sub: null }
      case 'top-down': {
        const subMap = {
          overview: 'LL(1) Analysis',
          first: 'FIRST Sets',
          follow: 'FOLLOW Sets',
          table: 'Predictive Table M[A, a]',
          simulator: 'Predictive Parsing',
          transform: 'Left Recursion & Factoring',
          tree: 'Parse Tree',
        }
        return {
          section: 'Top-Down Parsing',
          page: 'LL(1) Parser',
          sub: subMap[activeSubTab] || 'Overview',
        }
      }
      case 'bottom-up':
      case 'lr0':
      case 'slr1':
      case 'clr1':
      case 'lalr1': {
        const parserNameMap = {
          'bottom-up': 'LR Laboratory',
          lr0: 'LR(0) Parser',
          slr1: 'SLR(1) Parser',
          clr1: 'CLR(1) Parser',
          lalr1: 'LALR(1) Parser',
        }
        const subMap = {
          automaton: 'Canonical Collection & DFA',
          items: 'Item Sets & Closures',
          table: 'ACTION & GOTO Table',
          simulator: 'Parsing Simulator',
          tree: 'Parse Tree',
        }
        return {
          section: 'Bottom-Up Parsing',
          page: parserNameMap[activeNav] || 'LR Parser',
          sub: subMap[activeSubTab] || null,
        }
      }
      case 'compare':
        return { section: 'Analysis & Learning', page: 'Parser Comparison', sub: null }
      case 'examples':
        return { section: 'Analysis & Learning', page: 'Examples Library', sub: null }
      case 'docs':
        return { section: 'Analysis & Learning', page: 'Algorithm Documentation', sub: null }
      case 'viva':
        return { section: 'Analysis & Learning', page: 'Viva & Oral Exam Prep', sub: null }
      default:
        return { section: 'Compiler Studio', page: activeNav, sub: null }
    }
  }

  const breadcrumb = getBreadcrumb()

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#0E131F]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clean SaaS Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 overflow-hidden">
          <span className="hidden sm:inline font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800">
            {breadcrumb.section}
          </span>
          <ChevronRight className="hidden sm:inline w-3 h-3 text-slate-400 shrink-0" />
          <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
            {breadcrumb.page}
          </span>
          {breadcrumb.sub && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                {breadcrumb.sub}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Toggle theme"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  )
}
