import React, { useState } from 'react'
import {
  BookOpen,
  Search,
  CheckCircle2,
  XCircle,
  Play,
  ArrowRight,
  Filter,
} from 'lucide-react'

export default function ExamplesView({
  examples = [],
  onLoadExample,
  onNavigate,
}) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = [
    'All',
    'Arithmetic',
    'Left Recursion',
    'Left Factoring',
    'LR(0)',
    'SLR(1)',
    'CLR(1) / LALR(1)',
    'LALR(1) Conflict',
    'Conflicts',
    'Epsilon Handling',
  ]

  const filtered = examples.filter((ex) => {
    const matchesCategory =
      selectedCategory === 'All' || ex.category === selectedCategory
    const q = search.toLowerCase()
    const matchesSearch =
      ex.title.toLowerCase().includes(q) ||
      ex.description.toLowerCase().includes(q) ||
      ex.grammar_text.toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Curated Context-Free Grammar Library
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mathematically verified textbook and challenge grammars demonstrating the capabilities and edge cases of LL(1) and the LR family.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search examples by title, concept, or grammar rule..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((ex) => {
          const compat = ex.expected_compatibility || {}
          return (
            <div
              key={ex.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-800 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {ex.title}
                    </h3>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {ex.category || 'General'}
                    </span>
                  </div>

                  {/* Compatibility badges */}
                  <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                    {['LL1', 'LR0', 'SLR1', 'CLR1', 'LALR1'].map((m) => {
                      const isOk = compat[m]
                      return (
                        <span
                          key={m}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${isOk
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            }`}
                        >
                          <span>{m}</span>
                          {isOk ? (
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <XCircle className="w-2.5 h-2.5 text-rose-500 dark:text-rose-400" />
                          )}
                        </span>
                      )
                    })}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {ex.description}
                </p>

                {/* Grammar text code preview */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre">
                  {ex.grammar_text}
                </div>

                {/* Learning Objective */}
                {ex.learning_objective && (
                  <div className="text-[11px] text-indigo-700 dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/60 leading-relaxed">
                    <span className="font-bold">Key Insight:</span> {ex.learning_objective}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-2">
                <span className="text-[11px] text-slate-500 font-mono">
                  Sample: {ex.sample_input || 'ε'}
                </span>

                <button
                  onClick={() => {
                    onLoadExample(ex.id)
                    onNavigate('workspace')
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-1.5 transition"
                >
                  <span>Load in Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

