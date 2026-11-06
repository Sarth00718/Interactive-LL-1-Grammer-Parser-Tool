import React, { useState, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext.jsx'
import SidebarNav from './components/SidebarNav.jsx'
import Header from './components/Header.jsx'
import DashboardView from './pages/DashboardView.jsx'
import WorkspaceView from './pages/WorkspaceView.jsx'
import { TopDownView } from './pages/top_down/index.js'
import { BottomUpLabView, LR0View, SLR1View, CLR1View, LALR1View } from './pages/bottom_up/index.js'
import ComparisonView from './pages/ComparisonView.jsx'
import ExamplesView from './pages/ExamplesView.jsx'
import DocsView from './pages/DocsView.jsx'
import VivaPrepView from './pages/VivaPrepView.jsx'
import { api } from './services/api.js'

const DEFAULT_GRAMMAR = "E -> T E'\nE' -> + T E' | epsilon\nT -> F T'\nT' -> * F T' | epsilon\nF -> ( E ) | id"

export function AppContent() {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [activeSubTab, setActiveSubTab] = useState(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [grammarText, setGrammarText] = useState(DEFAULT_GRAMMAR)
  const [startSymbol, setStartSymbol] = useState('')
  const [selectedExampleId, setSelectedExampleId] = useState('arithmetic-ll1')
  const [sampleInput, setSampleInput] = useState('id + id * id')

  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [examples, setExamples] = useState([])
  const [parseResult, setParseResult] = useState(null)

  // Load examples on mount
  useEffect(() => {
    api.examples().then(setExamples).catch(() => {})
    // Auto-analyze initial grammar
    runAnalyze(DEFAULT_GRAMMAR, '')
  }, [])

  const handleSelectNav = (navId, subTabId = null) => {
    setActiveNav(navId)
    setActiveSubTab(subTabId)
  }

  const handleGrammarTextChange = (text) => {
    setGrammarText(text)
    const normalizedInput = text.replace(/\r\n/g, '\n').trim()
    const matchingEx = examples.find(
      (e) => e.grammar_text.replace(/\r\n/g, '\n').trim() === normalizedInput
    )
    setSelectedExampleId(matchingEx ? matchingEx.id : '')
  }

  const runAnalyze = async (textToAnalyze, symbolOverride) => {
    const text = textToAnalyze !== undefined ? textToAnalyze : grammarText
    const sym = symbolOverride !== undefined ? symbolOverride : startSymbol
    setLoading(true)
    setError(null)
    setParseResult(null)
    try {
      const res = await api.analyze(text, sym || null)
      if (res.stopped_after_validation) {
        setAnalysis(res)
        setError(
          res.validation.errors[0]
            ? { error: res.validation.errors[0].message }
            : { error: 'Grammar validation failed.' }
        )
      } else {
        setAnalysis(res)
      }
    } catch (e) {
      setAnalysis(null)
      setError(e.detail?.detail || e.detail || { error: e.message })
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async () => {
    try {
      const res = await api.validateGrammar(grammarText, startSymbol || null)
      return res.validation
    } catch (e) {
      return {
        is_valid: false,
        errors: [{ type: 'syntax_error', message: e.message || 'Validation error' }],
        warnings: [],
      }
    }
  }

  const loadExample = (id) => {
    const ex = examples.find((e) => e.id === id)
    if (!ex) return
    setSelectedExampleId(id)
    setGrammarText(ex.grammar_text)
    setStartSymbol('')
    setSampleInput(ex.sample_input || '')
    setAnalysis(null)
    setError(null)
    setParseResult(null)
    runAnalyze(ex.grammar_text, '')
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0B0F19] text-[#172033] dark:text-[#F8FAFC] flex transition-colors">
      {/* Sidebar Navigation */}
      <SidebarNav
        activeNav={activeNav}
        activeSubTab={activeSubTab}
        onSelectNav={handleSelectNav}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapsed={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Pane */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          isSidebarCollapsed ? 'lg:pl-[68px]' : 'lg:pl-[270px]'
        }`}
      >
        {/* Top Header */}
        <Header
          activeNav={activeNav}
          activeSubTab={activeSubTab}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          loading={loading}
          grammarText={grammarText}
          isCollapsed={isSidebarCollapsed}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeNav === 'dashboard' && (
            <DashboardView
              analysis={analysis}
              onNavigate={handleSelectNav}
              onLoadExample={loadExample}
              examples={examples}
            />
          )}

          {activeNav === 'workspace' && (
            <WorkspaceView
              grammarText={grammarText}
              setGrammarText={handleGrammarTextChange}
              startSymbol={startSymbol}
              setStartSymbol={setStartSymbol}
              onAnalyze={() => runAnalyze()}
              onValidate={handleValidate}
              loading={loading}
              error={error}
              analysis={analysis}
              examples={examples}
              selectedExampleId={selectedExampleId}
              onLoadExample={loadExample}
              onNavigate={handleSelectNav}
            />
          )}

          {activeNav === 'top-down' && (
            <TopDownView
              analysis={analysis}
              grammarText={grammarText}
              startSymbol={startSymbol}
              sampleInput={sampleInput}
              parseResult={parseResult}
              setParseResult={setParseResult}
              initialSubTab={activeSubTab}
              onNavigate={handleSelectNav}
            />
          )}

          {activeNav === 'bottom-up' && (
            <BottomUpLabView
              grammarText={grammarText}
              startSymbol={startSymbol}
              sampleInput={sampleInput}
              initialAlgorithm="SLR1"
              initialTab={activeSubTab}
              onNavigate={handleSelectNav}
            />
          )}

          {activeNav === 'lr0' && (
            <LR0View
              grammarText={grammarText}
              startSymbol={startSymbol}
              sampleInput={sampleInput}
              initialTab={activeSubTab}
              onNavigate={handleSelectNav}
            />
          )}

          {activeNav === 'slr1' && (
            <SLR1View
              grammarText={grammarText}
              startSymbol={startSymbol}
              sampleInput={sampleInput}
              initialTab={activeSubTab}
              onNavigate={handleSelectNav}
            />
          )}

          {activeNav === 'clr1' && (
            <CLR1View
              grammarText={grammarText}
              startSymbol={startSymbol}
              sampleInput={sampleInput}
              initialTab={activeSubTab}
              onNavigate={handleSelectNav}
            />
          )}

          {activeNav === 'lalr1' && (
            <LALR1View
              grammarText={grammarText}
              startSymbol={startSymbol}
              sampleInput={sampleInput}
              initialTab={activeSubTab}
              onNavigate={handleSelectNav}
            />
          )}

          {activeNav === 'compare' && (
            <ComparisonView
              grammarText={grammarText}
              startSymbol={startSymbol}
              sampleInput={sampleInput}
              onNavigate={handleSelectNav}
            />
          )}

          {activeNav === 'examples' && (
            <ExamplesView
              examples={examples}
              onLoadExample={loadExample}
              onNavigate={handleSelectNav}
            />
          )}

          {activeNav === 'docs' && <DocsView />}

          {activeNav === 'viva' && <VivaPrepView />}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
