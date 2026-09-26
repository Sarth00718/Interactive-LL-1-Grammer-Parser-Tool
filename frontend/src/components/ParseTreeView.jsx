import React, { useState, useMemo } from 'react'

// Tree layout algorithm: assigns (X, Y) coordinates to each node in parse tree
function computeTreeLayout(rootNode, { nodeWidth = 72, levelHeight = 75, paddingX = 60, paddingY = 50 }) {
  if (!rootNode) return null

  let leafIndex = 0
  const nodeMap = new Map()
  const edges = []
  const nodesByDepth = []

  function layout(node, depth = 0, parentId = null) {
    const isLeaf = !node.children || node.children.length === 0
    const nodeId = String(node.id !== undefined && node.id !== null ? node.id : Math.random())

    const layoutItem = {
      id: nodeId,
      symbol: node.symbol,
      is_terminal: !!node.is_terminal,
      depth,
      parentId,
      x: 0,
      y: depth * levelHeight + paddingY,
      children: []
    }

    if (!nodesByDepth[depth]) {
      nodesByDepth[depth] = []
    }
    nodesByDepth[depth].push(layoutItem)

    if (isLeaf) {
      layoutItem.x = leafIndex * nodeWidth + paddingX + nodeWidth / 2
      leafIndex++
    } else {
      const childItems = node.children.map((child) => layout(child, depth + 1, nodeId))
      layoutItem.children = childItems

      const firstChildX = childItems[0].x
      const lastChildX = childItems[childItems.length - 1].x
      layoutItem.x = (firstChildX + lastChildX) / 2

      childItems.forEach((child) => {
        edges.push({
          id: `${nodeId}->${child.id}`,
          sourceId: nodeId,
          targetId: child.id,
          sourceX: layoutItem.x,
          sourceY: layoutItem.y,
          targetX: child.x,
          targetY: child.y
        })
      })
    }

    nodeMap.set(nodeId, layoutItem)
    return layoutItem
  }

  const rootLayout = layout(rootNode, 0)
  const totalLeaves = Math.max(leafIndex, 1)
  const treeWidth = Math.max(totalLeaves * nodeWidth + paddingX * 2, 400)
  const maxDepth = nodesByDepth.length - 1
  const treeHeight = maxDepth * levelHeight + paddingY * 2 + 40
  const allNodes = Array.from(nodeMap.values())

  let terminalCount = 0
  let nonTerminalCount = 0
  allNodes.forEach((n) => {
    if (n.is_terminal) terminalCount++
    else nonTerminalCount++
  })

  return {
    root: rootLayout,
    allNodes,
    edges,
    nodeMap,
    treeWidth,
    treeHeight,
    maxDepth,
    totalNodes: allNodes.length,
    leafCount: totalLeaves,
    terminalCount,
    nonTerminalCount
  }
}

function getEdgePath(edge, lineStyle, nodeHeight = 32) {
  const startX = edge.sourceX
  const startY = edge.sourceY + nodeHeight / 2
  const endX = edge.targetX
  const endY = edge.targetY - nodeHeight / 2

  if (lineStyle === 'orthogonal') {
    const midY = (startY + endY) / 2
    return `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`
  }
  if (lineStyle === 'curved') {
    const midY = (startY + endY) / 2
    return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`
  }
  // straight
  return `M ${startX} ${startY} L ${endX} ${endY}`
}

export default function ParseTreeView({ tree }) {
  const [zoom, setZoom] = useState(1.0)
  const [lineStyle, setLineStyle] = useState('orthogonal')
  const [density, setDensity] = useState('normal') // compact | normal | spacious
  const [hoveredNodeId, setHoveredNodeId] = useState(null)

  const spacingConfig = useMemo(() => {
    if (density === 'compact') return { nodeWidth: 56, levelHeight: 62, paddingX: 40, paddingY: 40 }
    if (density === 'spacious') return { nodeWidth: 96, levelHeight: 95, paddingX: 80, paddingY: 60 }
    return { nodeWidth: 72, levelHeight: 78, paddingX: 60, paddingY: 50 }
  }, [density])

  const layoutData = useMemo(() => {
    return computeTreeLayout(tree, spacingConfig)
  }, [tree, spacingConfig])

  const highlightedNodeIds = useMemo(() => {
    if (!hoveredNodeId || !layoutData) return new Set()
    const set = new Set()

    function collectDescendants(id) {
      set.add(id)
      const n = layoutData.nodeMap.get(id)
      if (n && n.children) {
        n.children.forEach((c) => collectDescendants(c.id))
      }
    }
    collectDescendants(hoveredNodeId)

    let curr = layoutData.nodeMap.get(hoveredNodeId)
    while (curr && curr.parentId) {
      set.add(curr.parentId)
      curr = layoutData.nodeMap.get(curr.parentId)
    }

    return set
  }, [hoveredNodeId, layoutData])

  if (!tree || !layoutData) return null

  return (
    <div className="space-y-3">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100/80 p-3 rounded-lg border border-slate-200 text-xs">
        {/* Stats */}
        <div className="flex items-center gap-3 font-medium text-slate-600">
          <span className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs">
            <span className="text-slate-400">Nodes:</span>
            <strong className="text-slate-700">{layoutData.totalNodes}</strong>
          </span>
          <span className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs">
            <span className="text-slate-400">Depth:</span>
            <strong className="text-slate-700">{layoutData.maxDepth}</strong>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs">
            <span className="text-indigo-600 font-bold">Non-terminals:</span>
            <strong className="text-slate-700">{layoutData.nonTerminalCount}</strong>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs">
            <span className="text-amber-600 font-bold">Terminals / ε:</span>
            <strong className="text-slate-700">{layoutData.terminalCount}</strong>
          </span>
        </div>

        {/* Display Options */}
        <div className="flex items-center gap-2">
          {/* Connector style */}
          <div className="flex bg-white rounded border border-slate-200 p-0.5 shadow-2xs">
            <button
              title="Orthogonal lines"
              onClick={() => setLineStyle('orthogonal')}
              className={
                'px-2 py-0.5 rounded text-xs transition-colors ' +
                (lineStyle === 'orthogonal'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-600 hover:text-slate-900')
              }
            >
              Orthogonal
            </button>
            <button
              title="Curved lines"
              onClick={() => setLineStyle('curved')}
              className={
                'px-2 py-0.5 rounded text-xs transition-colors ' +
                (lineStyle === 'curved'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-600 hover:text-slate-900')
              }
            >
              Curved
            </button>
            <button
              title="Straight lines"
              onClick={() => setLineStyle('straight')}
              className={
                'px-2 py-0.5 rounded text-xs transition-colors ' +
                (lineStyle === 'straight'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-600 hover:text-slate-900')
              }
            >
              Straight
            </button>
          </div>

          {/* Density toggle */}
          <select
            value={density}
            onChange={(e) => setDensity(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded text-xs shadow-2xs outline-none"
          >
            <option value="compact">Compact</option>
            <option value="normal">Normal Spacing</option>
            <option value="spacious">Spacious</option>
          </select>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-white rounded border border-slate-200 p-0.5 shadow-2xs">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.15).toFixed(2)))}
              className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 rounded font-bold"
              title="Zoom out"
            >
              -
            </button>
            <span className="w-10 text-center text-slate-700 font-mono text-xs">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.15).toFixed(2)))}
              className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 rounded font-bold"
              title="Zoom in"
            >
              +
            </button>
            {zoom !== 1.0 && (
              <button
                onClick={() => setZoom(1.0)}
                className="px-1.5 py-0.5 text-indigo-600 hover:bg-indigo-50 rounded text-xs font-medium border-l border-slate-200"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="overflow-auto max-h-[620px] p-6 bg-slate-900/5 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] rounded-xl border border-slate-200 flex justify-center items-start min-h-[380px]">
        <div
          style={{
            width: layoutData.treeWidth,
            height: layoutData.treeHeight,
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
          className="relative shrink-0 select-none"
        >
          {/* SVG Lines */}
          <svg
            width={layoutData.treeWidth}
            height={layoutData.treeHeight}
            className="absolute inset-0 pointer-events-none overflow-visible"
          >
            {layoutData.edges.map((edge) => {
              const isHighlighted =
                highlightedNodeIds.has(edge.sourceId) && highlightedNodeIds.has(edge.targetId)
              const hasActiveHighlight = highlightedNodeIds.size > 0

              const pathD = getEdgePath(edge, lineStyle)
              return (
                <path
                  key={edge.id}
                  d={pathD}
                  fill="none"
                  stroke={
                    isHighlighted
                      ? '#4f46e5'
                      : hasActiveHighlight
                      ? '#cbd5e1'
                      : '#94a3b8'
                  }
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  strokeDasharray={isHighlighted ? undefined : undefined}
                  className="transition-all duration-150"
                />
              )
            })}
          </svg>

          {/* HTML Nodes */}
          {layoutData.allNodes.map((node) => {
            const isHovered = hoveredNodeId === node.id
            const isHighlighted = highlightedNodeIds.has(node.id)
            const hasActiveHighlight = highlightedNodeIds.size > 0

            return (
              <div
                key={node.id}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                style={{
                  left: node.x,
                  top: node.y,
                  transform: 'translate(-50%, -50%)'
                }}
                className={
                  'absolute cursor-pointer transition-all duration-150 z-10 flex items-center justify-center ' +
                  (hasActiveHighlight && !isHighlighted ? 'opacity-40 scale-95' : 'opacity-100 ') +
                  (isHovered ? 'scale-110 z-20' : '')
                }
              >
                <div
                  className={
                    'mono text-xs px-3 py-1 rounded-lg border shadow-xs transition-colors whitespace-nowrap flex items-center gap-1 ' +
                    (node.is_terminal
                      ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold hover:bg-amber-100 hover:border-amber-400'
                      : 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold hover:bg-indigo-100 hover:border-indigo-400') +
                    (isHighlighted ? ' ring-2 ring-indigo-500/50 shadow-md' : '')
                  }
                >
                  {node.symbol}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

