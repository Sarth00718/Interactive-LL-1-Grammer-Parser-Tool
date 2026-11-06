import React, { useState, useEffect, useRef } from 'react'
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react'

export default function ParsingSimulator({
  steps = [],
  accepted = false,
  error = null,
  inputString = '',
  tokens = [],
  onParse,
  loading = false,
  algorithm = 'LR',
}) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(700) // ms per step
  const [customInput, setCustomInput] = useState(inputString)
  const timerRef = useRef(null)

  useEffect(() => {
    setCustomInput(inputString)
  }, [inputString])

  useEffect(() => {
    setCurrentStepIdx(0)
    setIsPlaying(false)
  }, [steps])

  // Play / Pause loop
  useEffect(() => {
    if (isPlaying) {
      if (currentStepIdx < steps.length - 1) {
        timerRef.current = setTimeout(() => {
          setCurrentStepIdx(idx => idx + 1)
        }, speed)
      } else {
        setIsPlaying(false)
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStepIdx, steps.length, speed])

  const handlePlayPause = () => {
    if (currentStepIdx >= steps.length - 1) {
      setCurrentStepIdx(0)
    }
    setIsPlaying(p => !p)
  }

  const handleNext = () => {
    setIsPlaying(false)
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(idx => idx + 1)
    }
  }

  const handlePrev = () => {
    setIsPlaying(false)
    if (currentStepIdx > 0) {
      setCurrentStepIdx(idx => idx - 1)
    }
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentStepIdx(0)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onParse && customInput.trim()) {
      setIsPlaying(false)
      onParse(customInput.trim())
    }
  }

  const currStep = steps[currentStepIdx] || null

  return (
    <div className="space-y-5">
      {/* Input bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Input String:
            </span>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. id + id * id (space-separated)"
              className="flex-1 font-mono text-sm px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !customInput.trim()}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : null}
            Simulate Parse
          </button>
        </form>
      </div>

      {/* Simulator Control Deck */}
      {steps.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Simulation Controls
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Step {currentStepIdx + 1} of {steps.length}
              </span>
            </div>

            {/* Play / Step Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                title="Reset to beginning"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handlePrev}
                disabled={currentStepIdx === 0}
                title="Previous step"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={handlePlayPause}
                title={isPlaying ? 'Pause simulation' : 'Play simulation'}
                className="px-3.5 py-1.5 rounded-lg font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={handleNext}
                disabled={currentStepIdx >= steps.length - 1}
                title="Next step"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Speed:</span>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                <option value={1200}>0.5x (Slow)</option>
                <option value={700}>1x (Normal)</option>
                <option value={300}>2x (Fast)</option>
              </select>
            </div>
          </div>

          {/* Current Step State Visualizer */}
          {currStep && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stack Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  Parser Stack
                </div>
                <div className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 break-words shadow-sm">
                  {currStep.stack || '$'}
                </div>
              </div>

              {/* Remaining Input Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                  Remaining Input
                </div>
                <div className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 break-words shadow-sm">
                  {currStep.input || '$'}
                </div>
              </div>

              {/* Action Box */}
              <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60">
                <div className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-1.5">
                  Parser Action
                </div>
                <div className="font-mono text-sm font-bold text-indigo-900 dark:text-indigo-200 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-900/80 shadow-sm">
                  {currStep.action}
                </div>
              </div>
            </div>
          )}

          {/* Step Explanation Text */}
          {currStep?.explanation && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Step Explanation: </span>
              {currStep.explanation}
            </div>
          )}
        </div>
      )}

      {/* Parse Outcome Banner */}
      {steps.length > 0 && currentStepIdx === steps.length - 1 && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            accepted
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
          }`}
        >
          {accepted ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          )}
          <div>
            <div className="font-bold text-sm">
              {accepted ? 'Parse Succeeded (Accepted)' : 'Parse Failed (Syntax Error)'}
            </div>
            <div className="text-xs opacity-90 mt-0.5">
              {accepted
                ? `The string was successfully derived and accepted by the ${algorithm} parser in ${steps.length} steps.`
                : error?.message || 'A syntax error occurred and the input string was rejected.'}
            </div>
          </div>
        </div>
      )}

      {/* Full Step Execution Trace Table */}
      {steps.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Complete Execution Trace</span>
            <span className="text-[11px] text-slate-500 font-normal">Click any row to jump to that step</span>
          </div>
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3 w-16">Step</th>
                  <th className="py-2.5 px-3">Stack</th>
                  <th className="py-2.5 px-3">Remaining Input</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {steps.map((st, i) => {
                  const isCurrent = i === currentStepIdx
                  return (
                    <tr
                      key={i}
                      onClick={() => {
                        setIsPlaying(false)
                        setCurrentStepIdx(i)
                      }}
                      className={`cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 font-semibold text-indigo-900 dark:text-indigo-200'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-400 dark:text-slate-500">{st.step}</td>
                      <td className="py-2 px-3 break-all">{st.stack}</td>
                      <td className="py-2 px-3 break-all">{st.input}</td>
                      <td className="py-2 px-3 font-semibold text-indigo-600 dark:text-indigo-400">
                        {st.action}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
