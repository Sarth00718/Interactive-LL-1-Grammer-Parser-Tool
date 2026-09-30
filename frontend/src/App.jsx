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
  const [selectedExampleId, setSelectedExampleId] = useState('arithmetic-ll1')
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('grammar')
  const [examples, setExamples] = useState([])
  const [sampleInput, setSampleInput] = useState('id + id * id')
  const [parseResult, setParseResult] = useState(null)

  useEffect(() => {
    document.documentElement.classList.remove('dark')
    api.examples().then(setExamples).catch(() => {})
  }, [])

  const handleGrammarTextChange = (text) => {
    setGrammarText(text)
    const normalizedInput = text.replace(/\r\n/g, '\n').trim()
    const matchingEx = examples.find(
      (e) => e.grammar_text.replace(/\r\n/g, '\n').trim() === normalizedInput
    )
    setSelectedExampleId(matchingEx ? matchingEx.id : '')
  }

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
    setSelectedExampleId(id)
    setGrammarText(ex.grammar_text)
    setStartSymbol('')
    setSampleInput(ex.sample_input || '')
    setAnalysis(null)
    setError(null)
    setParseResult(null)
  }

  const analysisValid = analysis && !analysis.stopped_after_validation

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50 text-gray-800 selection:bg-indigo-200 selection:text-indigo-900 font-sans relative">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-100/50 via-gray-50/50 to-transparent pointer-events-none"></div>
      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        <GrammarInputPanel
          grammarText={grammarText}
          setGrammarText={handleGrammarTextChange}
          startSymbol={startSymbol}
          setStartSymbol={setStartSymbol}
          onAnalyze={runAnalyze}
          examples={examples}
          selectedExampleId={selectedExampleId}
          onLoadExample={loadExample}
          loading={loading}
          error={error}
          analysis={analysis}
        />

        <div className="bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <TabsNav active={tab} onChange={setTab} />
          <div className="p-5 sm:p-7">
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

        <p className="text-center text-sm font-medium text-gray-500 pb-8 pt-4">
          Principles of Compiler Design — Interactive LL(1) Parsing Tool
        </p>
      </div>
    </div>
  )
}



