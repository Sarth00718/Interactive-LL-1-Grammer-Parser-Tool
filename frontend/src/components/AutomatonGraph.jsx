import React, { useMemo, useState, useCallback } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Eye, Layers, ArrowRight, CheckCircle2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

// Helper to reliably format any grammar item object or string for display
function formatItem(it) {
  if (!it) return ''
  if (typeof it === 'string') return it
  if (it.text) return it.text
  if (it.lhs !== undefined && it.rhs !== undefined) {
    const dot = typeof it.dot === 'number' ? it.dot : 0
    const rhsArr = Array.isArray(it.rhs) ? it.rhs : (it.rhs ? [it.rhs] : [])
    const before = rhsArr.slice(0, dot).join(' ')
    const after = rhsArr.slice(dot).join(' ')
    const core = `${it.lhs} -> ${before ? before + ' ' : ''}•${after ? ' ' + after : ''}`
    if (it.lookahead) return `[${core}, ${it.lookahead}]`
    if (it.lookaheads && it.lookaheads.length > 0) return `[${core}, ${it.lookaheads.join(', ')}]`
    return core
  }
  return typeof it === 'object' ? JSON.stringify(it) : String(it)
}

// Custom State Node for Automaton DFA
function StateNode({ data, selected }) {
  const isAccepting = data.is_accepting
  const sid = data.state_id ?? data.id ?? 0
  const isStart = sid === 0
  const rawItems = data.grouped_items || data.items || []
  const items = (data.item_texts && data.item_texts.length > 0)
    ? data.item_texts
    : rawItems.map(formatItem).filter(Boolean)
  const outgoing = data.outgoing_transitions || []
  const itemCount = data.items?.length || items.length

  return (
    <div
      className={`relative rounded-xl border shadow-md transition-all duration-200 cursor-pointer min-w-[220px] max-w-[290px] ${
        selected
          ? 'border-indigo-600 ring-4 ring-indigo-500/20 shadow-indigo-500/10'
          : isStart
          ? 'border-blue-500 bg-white dark:bg-slate-900 shadow-blue-500/5'
          : isAccepting
          ? 'border-emerald-500 bg-white dark:bg-slate-900'
          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white dark:!border-slate-900 shadow-sm"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white dark:!border-slate-900 shadow-sm"
      />

      <div className="overflow-hidden rounded-[11px]">
        {/* Node Header */}
        <div
          className={`px-3 py-1.5 flex items-center justify-between border-b text-xs font-semibold ${
            isStart
              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300'
              : isAccepting
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300'
              : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span className="font-mono text-sm font-bold">{data.label || `I${sid}`}</span>
            {isStart && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-600 text-white font-medium">
                Start
              </span>
            )}
            {isAccepting && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-600 text-white font-medium">
                Accept
              </span>
            )}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Item Previews (Visible item set list) */}
        <div className="p-2 space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300 max-h-[140px] overflow-y-auto nowheel nodrag">
          {items.length > 0 ? (
            items.slice(0, 4).map((txt, idx) => (
              <div
                key={idx}
                className="truncate bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60 font-mono text-[11px]"
                title={txt}
              >
                {txt}
              </div>
            ))
          ) : (
            <div className="text-[10px] text-slate-400 italic py-1 text-center font-sans">
              No items in state
            </div>
          )}
          {items.length > 4 && (
            <div className="text-[10px] text-slate-400 dark:text-slate-500 pt-0.5 text-center font-sans font-medium">
              +{items.length - 4} more items...
            </div>
          )}
        </div>

        {/* Outgoing Transitions Summary */}
        {outgoing.length > 0 && (
          <div className="px-2.5 py-1.5 bg-slate-50/80 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span className="font-semibold text-slate-400">GOTO:</span>
            <div className="flex flex-wrap gap-1 justify-end max-w-[170px]">
              {outgoing.slice(0, 4).map((tr, idx) => (
                <span
                  key={idx}
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${
                    tr.is_terminal
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300'
                      : 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300'
                  }`}
                >
                  {tr.symbol}&rarr;I{tr.to_state}
                </span>
              ))}
              {outgoing.length > 4 && (
                <span className="text-[9px] text-slate-400 self-center">
                  +{outgoing.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const nodeTypes = {
  stateNode: StateNode,
}

export default function AutomatonGraph({
  states = [],
  transitions = [],
  onSelectState,
  selectedStateId,
}) {
  const [activeModalState, setActiveModalState] = useState(null)

  // Compute layered DAG coordinates for nodes based on BFS from state 0
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!states || states.length === 0) {
      return { initialNodes: [], initialEdges: [] }
    }

    // 1. BFS to determine depth of each state
    const depthMap = { 0: 0 }
    const queue = [0]
    const visited = new Set([0])

    while (queue.length > 0) {
      const curr = queue.shift()
      const currDepth = depthMap[curr] || 0
      const currTransitions = transitions.filter(t => t.from_state === curr)

      for (const tr of currTransitions) {
        const target = tr.to_state
        if (!visited.has(target)) {
          visited.add(target)
          depthMap[target] = currDepth + 1
          queue.push(target)
        }
      }
    }

    // Any unvisited states (disconnected)
    states.forEach(s => {
      const sid = s.state_id ?? s.id
      if (depthMap[sid] === undefined) {
        depthMap[sid] = 1
      }
    })

    // Group states by depth
    const levels = {}
    states.forEach(s => {
      const sid = s.state_id ?? s.id
      const d = depthMap[sid] || 0
      if (!levels[d]) levels[d] = []
      levels[d].push(s)
    })

    const nodeWidth = 260
    const nodeHeight = 160
    const colSpacing = 340
    const rowSpacing = 210

    const nodes = states.map(s => {
      const sid = s.state_id ?? s.id
      const d = depthMap[sid] || 0
      const indexInLevel = (levels[d] || []).findIndex(st => (st.state_id ?? st.id) === sid)
      const totalInLevel = levels[d]?.length || 1
      const yOffset = ((indexInLevel - (totalInLevel - 1) / 2) * rowSpacing) + 260
      const xOffset = d * colSpacing + 60

      const rawItems = s.grouped_items || s.items || []
      const itemTexts = (s.item_texts && s.item_texts.length > 0)
        ? s.item_texts
        : rawItems.map(formatItem)
      const outgoing = transitions.filter(t => t.from_state === sid)

      const stateData = {
        ...s,
        state_id: sid,
        items: rawItems,
        item_texts: itemTexts,
        outgoing_transitions: outgoing,
      }

      return {
        id: String(sid),
        type: 'stateNode',
        position: { x: xOffset, y: yOffset },
        data: stateData,
        selected: selectedStateId === sid,
      }
    })

    // Create edges with labeled symbols
    const edges = transitions.map((t, idx) => {
      const isLoop = t.from_state === t.to_state
      return {
        id: `e-${t.from_state}-${t.symbol}-${t.to_state}-${idx}`,
        source: String(t.from_state),
        target: String(t.to_state),
        label: t.symbol,
        animated: false,
        type: isLoop ? 'smoothstep' : 'default',
        style: {
          stroke: t.is_terminal ? '#4f46e5' : '#8b5cf6',
          strokeWidth: 2,
        },
        labelStyle: {
          fontWeight: 700,
          fontFamily: 'monospace',
          fill: t.is_terminal ? '#3730a3' : '#6d28d9',
          fontSize: 12,
        },
        labelBgStyle: {
          fill: '#ffffff',
          fillOpacity: 0.9,
          stroke: '#e2e8f0',
          strokeWidth: 1,
          rx: 4,
          ry: 4,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: t.is_terminal ? '#4f46e5' : '#8b5cf6',
          width: 16,
          height: 16,
        },
      }
    })

    return { initialNodes: nodes, initialEdges: edges }
  }, [states, transitions, selectedStateId])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Sync nodes when states change
  React.useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  const onNodeClick = useCallback(
    (_, node) => {
      if (onSelectState) onSelectState(node.data.state_id)
      setActiveModalState(node.data)
    },
    [onSelectState]
  )

  if (!states || states.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500">
        No automaton states available. Run grammar analysis to generate the transition graph.
      </div>
    )
  }

  return (
    <div className="relative w-full h-[580px] bg-slate-50/60 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.8}
      >
        <Background color="#94a3b8" gap={20} size={1} />
        <Controls className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-md" />
        <MiniMap
          nodeColor={n => (n.data?.is_accepting ? '#10b981' : n.data?.state_id === 0 ? '#3b82f6' : '#94a3b8')}
          className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg shadow-md"
        />
      </ReactFlow>

      {/* Graph Legend & Status Pill */}
      <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg text-xs flex items-center gap-4 z-10 pointer-events-auto">
        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          Start State (I0)
        </div>
        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          Accepting State
        </div>
        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <span className="w-3 h-0.5 bg-indigo-600"></span>
          Terminal Edge
        </div>
        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <span className="w-3 h-0.5 bg-purple-500"></span>
          Non-terminal Edge
        </div>
      </div>

      {/* State Detail Drawer Modal */}
      {activeModalState && (
        <div className="absolute bottom-4 right-4 max-w-sm w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 z-20 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400">
                State I{activeModalState.state_id}
              </span>
              {activeModalState.is_accepting && (
                <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-semibold">
                  Accept
                </span>
              )}
            </div>
            <button
              onClick={() => setActiveModalState(null)}
              className="text-xs px-2 py-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Items in State ({activeModalState.items?.length || 0})
          </div>
          <div className="max-h-56 overflow-y-auto space-y-1 font-mono text-xs pr-1 mb-3">
            {((activeModalState.item_texts && activeModalState.item_texts.length > 0)
              ? activeModalState.item_texts
              : (activeModalState.grouped_items || activeModalState.items || []).map(formatItem)
            ).map((txt, i) => (
              <div
                key={i}
                className="p-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono"
              >
                {txt}
              </div>
            ))}
          </div>

          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Outgoing Transitions
          </div>
          <div className="flex flex-wrap gap-1.5">
            {transitions.filter(t => t.from_state === (activeModalState.state_id ?? activeModalState.id)).length > 0 ? (
              transitions.filter(t => t.from_state === (activeModalState.state_id ?? activeModalState.id)).map((tr, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded-lg text-xs bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 font-mono flex items-center gap-1"
                >
                  <span className="font-bold">{tr.symbol}</span>
                  <ArrowRight className="w-3 h-3 text-indigo-400" />
                  <span>I{tr.to_state}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No outgoing transitions (reduce / accept state)</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
