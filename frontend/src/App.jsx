import React, { useState, useEffect } from 'react'
import GrammarInputPanel from './components/GrammarInputPanel.jsx'
import TabsNav from './components/TabsNav.jsx'
import GrammarTab from './pages/GrammarTab.jsx'
import DiagnosticsTab from './pages/DiagnosticsTab.jsx'
import TransformTab from './pages/TransformTab.jsx'
import FirstTab from './pages/FirstTab.jsx'
import FollowTab from './pages/FollowTab.jsx'
import LL1Tab from './pages/LL1Tab.jsx'
import TableTab from './pages/TableTab.jsx'
import ParserTab from './pages/ParserTab.jsx'
import ParseTreeTab from './pages/ParseTreeTab.jsx'
import LearnTab from './pages/LearnTab.jsx'
import { api } from './services/api.js'

const DEFAULT_GRAMMAR = "E -> T E'\nE' -> + T E' | epsilon\nT -> F T'\nT' -> * F T' | epsilon\nF -> ( E ) | id"

export default function App() {
  const [grammarText, setGrammarText] = useState(DEFAULT_GRAMMAR)
  const [startSymbol, setStartSymbol] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('grammar')
  const [examples, setExamples] = useState([])
  const [sampleInput, setSampleInput] = useState('id + id * id')
  const [parseResult, setParseResult] = useState(null)

  useEffect(() => {
    api.examples().then(setExamples).catch(() => {})
  }, [])

  const runAnalyze = async () => {
    setLoading(true)
    setError(null)
    setParseResult(null)
    try {
      const res = await api.analyze(grammarText, startSymbol || null)
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

  const loadExample = (id) => {
    const ex = examples.find((e) => e.id === id)
    if (!ex) return
    setGrammarText(ex.grammar_text)
    setStartSymbol('')
    setSampleInput(ex.sample_input || '')
    setAnalysis(null)
    setError(null)
    setParseResult(null)
  }

  const analysisValid = analysis && !analysis.stopped_after_validation

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <GrammarInputPanel
          grammarText={grammarText}
          setGrammarText={setGrammarText}
          startSymbol={startSymbol}
          setStartSymbol={setStartSymbol}
          onAnalyze={runAnalyze}
          examples={examples}
          onLoadExample={loadExample}
          loading={loading}
          error={error}
          analysis={analysis}
        />

        <div className="bg-white rounded-xl shadow-sm">
          <TabsNav active={tab} onChange={setTab} />
          <div className="p-4 sm:p-5">
            {tab === 'grammar' && <GrammarTab analysis={analysisValid ? analysis : null} />}
            {tab === 'diagnostics' && <DiagnosticsTab analysis={analysisValid ? analysis : null} />}
            {tab === 'transform' && <TransformTab analysis={analysisValid ? analysis : null} />}
            {tab === 'first' && <FirstTab analysis={analysisValid ? analysis : null} />}
            {tab === 'follow' && <FollowTab analysis={analysisValid ? analysis : null} />}
            {tab === 'll1' && <LL1Tab analysis={analysisValid ? analysis : null} />}
            {tab === 'table' && <TableTab analysis={analysisValid ? analysis : null} />}
            {tab === 'parser' && (
              <ParserTab
                analysis={analysisValid ? analysis : null}
                grammarText={grammarText}
                startSymbol={startSymbol}
                sampleInput={sampleInput}
                result={parseResult}
                setResult={setParseResult}
              />
            )}
            {tab === 'tree' && <ParseTreeTab parseResult={parseResult} />}
            {tab === 'learn' && <LearnTab />}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 pb-6">
          Principles of Compiler Design — Innovative Assignment
        </p>
      </div>
    </div>
  )
}
