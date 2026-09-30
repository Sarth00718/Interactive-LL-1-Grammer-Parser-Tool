import React, { useState, useMemo, useRef, useEffect } from 'react'

// Tree layout algorithm: assigns (X, Y) coordinates to each node in parse tree
function computeTreeLayout(rootNode, { nodeWidth = 72, levelHeight = 78, paddingX = 60, paddingY = 50 }) {
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
  const treeWidth = Math.max(totalLeaves * nodeWidth + paddingX * 2, 450)
  const maxDepth = nodesByDepth.length - 1
  const treeHeight = maxDepth * levelHeight + paddingY * 2 + 50
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
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [lineStyle, setLineStyle] = useState('orthogonal')
  const [density, setDensity] = useState('normal') // compact | normal | spacious
  const [hoveredNodeId, setHoveredNodeId] = useState(null)
  const [showMinimap, setShowMinimap] = useState(true)

  const canvasRef = useRef(null)

  // Reset pan when tree or density changes
  useEffect(() => {
    setPan({ x: 0, y: 0 })
  }, [tree, density])

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

  // Mouse Drag / Pan Handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.node-badge') || e.target.closest('.control-bar')) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleCenterView = () => {
    setZoom(1.0)
    setPan({ x: 0, y: 0 })
  }

  // Export as PNG
  const handleExportPNG = () => {
    if (!canvasRef.current || !layoutData) return
    const svgEl = canvasRef.current.querySelector('svg')
    if (!svgEl) return

    const width = layoutData.treeWidth
    const height = layoutData.treeHeight

    const canvas = document.createElement('canvas')
    canvas.width = width * 2
    canvas.height = height * 2
    const ctx = canvas.getContext('2d')
    ctx.scale(2, 2)

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // Render node boxes onto canvas
    const svgData = new XMLSerializer().serializeToString(svgEl)
    const img = new Image()
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)

      // Draw HTML nodes on top of canvas
      layoutData.allNodes.forEach((node) => {
        ctx.fillStyle = node.is_terminal ? '#fef3c7' : '#e0e7ff'
        ctx.strokeStyle = node.is_terminal ? '#f59e0b' : '#6366f1'
        ctx.lineWidth = 1.5

        const bw = 48
        const bh = 24
        const nx = node.x - bw / 2
        const ny = node.y - bh / 2

        ctx.beginPath()
        ctx.roundRect(nx, ny, bw, bh, 6)
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = node.is_terminal ? '#92400e' : '#3730a3'
        ctx.font = 'bold 12px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(node.symbol, node.x, node.y)
      })

      const pngUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = pngUrl
      a.download = `parse_tree_${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
    img.src = url
  }

  if (!tree || !layoutData) return null

  // Minimap scale calculation
  const miniWidth = 160
  const miniHeight = 100
  const miniScale = Math.min(miniWidth / layoutData.treeWidth, miniHeight / layoutData.treeHeight)

  return (
    <div className="space-y-3">
      {/* Control Bar */}
      <div className="control-bar flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
        {/* Stats */}
        <div className="flex items-center gap-2 font-medium text-gray-700">
          <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-gray-200">
            <span className="text-gray-600">Nodes:</span>
            <strong className="text-gray-900">{layoutData.totalNodes}</strong>
          </span>
          <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-gray-200">
            <span className="text-gray-600">Depth:</span>
            <strong className="text-gray-900">{layoutData.maxDepth}</strong>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-gray-200">
            <span className="text-indigo-700 font-bold">Non-terminals:</span>
            <strong className="text-gray-900">{layoutData.nonTerminalCount}</strong>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-gray-200">
            <span className="text-amber-700 font-bold">Terminals / ε:</span>
            <strong className="text-gray-900">{layoutData.terminalCount}</strong>
          </span>
        </div>

        {/* Display Options */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Connector style */}
          <div className="flex bg-white rounded border border-gray-200 p-0.5">
            {['orthogonal', 'curved', 'straight'].map((style) => (
              <button
                key={style}
                onClick={() => setLineStyle(style)}
                className={
                  'px-2 py-0.5 rounded text-xs capitalize transition-colors ' +
                  (lineStyle === style
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-gray-600 hover:text-gray-900')
                }
              >
                {style}
              </button>
            ))}
          </div>

          {/* Density toggle */}
          <select
            value={density}
            onChange={(e) => setDensity(e.target.value)}
            className="bg-white border border-gray-200 text-gray-800 px-2 py-1 rounded text-xs outline-none"
          >
            <option value="compact" className="bg-white text-gray-800">Compact</option>
            <option value="normal" className="bg-white text-gray-800">Normal</option>
            <option value="spacious" className="bg-white text-gray-800">Spacious</option>
          </select>

          {/* Zoom & Pan Controls */}
          <div className="flex items-center gap-1 bg-white rounded border border-gray-200 p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.15).toFixed(2)))}
              className="px-2 py-0.5 text-gray-700 hover:bg-gray-100 rounded font-bold"
              title="Zoom out"
            >
              -
            </button>
            <span className="w-10 text-center text-indigo-700 font-mono text-xs">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.15).toFixed(2)))}
              className="px-2 py-0.5 text-gray-700 hover:bg-gray-100 rounded font-bold"
              title="Zoom in"
            >
              +
            </button>
            <button
              onClick={handleCenterView}
              className="px-1.5 py-0.5 text-indigo-700 hover:bg-indigo-50 rounded text-xs font-medium border-l border-gray-200"
              title="Reset Zoom & Pan"
            >
              Reset
            </button>
          </div>

          {/* Minimap toggle */}
          <button
            onClick={() => setShowMinimap(!showMinimap)}
            className={
              'px-2 py-1 rounded text-xs border transition-colors ' +
              (showMinimap
                ? 'bg-indigo-100 border-indigo-400 text-indigo-700 font-medium'
                : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900')
            }
            title="Toggle Minimap"
          >
            🗺️ Minimap
          </button>

          {/* PNG Export */}
          <button
            onClick={handleExportPNG}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded text-xs font-medium transition shadow-md flex items-center gap-1"
            title="Export parse tree as PNG image"
          >
            📷 Export Image
          </button>
        </div>
      </div>

      {/* Interactive Drag & Pan Canvas Area */}
      <div
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={
          'overflow-hidden relative max-h-[640px] h-[520px] bg-gray-50 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:16px_16px] rounded-xl border border-gray-200 flex justify-center items-start transition-colors select-none ' +
          (isDragging ? 'cursor-grabbing' : 'cursor-grab')
        }
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'top center',
            width: layoutData.treeWidth,
            height: layoutData.treeHeight,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          className="relative shrink-0 mt-8"
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
                      ? '#6366f1'
                      : hasActiveHighlight
                      ? '#cbd5e1'
                      : '#94a3b8'
                  }
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
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
                  'node-badge absolute cursor-pointer transition-all duration-150 z-10 flex items-center justify-center ' +
                  (hasActiveHighlight && !isHighlighted ? 'opacity-35 scale-95' : 'opacity-100 ') +
                  (isHovered ? 'scale-110 z-20' : '')
                }
              >
                <div
                  className={
                    'mono text-xs px-3 py-1 rounded-lg border shadow-lg transition-colors whitespace-nowrap flex items-center gap-1 ' +
                    (node.is_terminal
                      ? 'bg-amber-100 border-amber-400 text-amber-800 font-bold hover:bg-amber-200 shadow-amber-200'
                      : 'bg-indigo-100 border-indigo-400 text-indigo-800 font-semibold hover:bg-indigo-200 shadow-indigo-200') +
                    (isHighlighted ? ' ring-2 ring-indigo-500 shadow-indigo-300' : '')
                  }
                >
                  {node.symbol}
                </div>
              </div>
            )
          })}
        </div>

        {/* Interactive Minimap Overlay */}
        {showMinimap && (
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg p-2 shadow-2xl z-30 pointer-events-auto">
            <div className="flex items-center justify-between mb-1 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
              <span>Minimap</span>
              <span className="font-mono text-[9px] text-indigo-700">{Math.round(zoom * 100)}%</span>
            </div>
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const clickX = e.clientX - rect.left
                const clickY = e.clientY - rect.top
                const targetX = clickX / miniScale
                const targetY = clickY / miniScale
                setPan({
                  x: -(targetX - layoutData.treeWidth / 2) * zoom,
                  y: -(targetY - 100) * zoom
                })
              }}
              style={{ width: miniWidth, height: miniHeight }}
              className="relative bg-gray-100 rounded border border-gray-200 overflow-hidden cursor-crosshair"
            >
              {/* Mini nodes */}
              {layoutData.allNodes.map((node) => (
                <div
                  key={node.id}
                  style={{
                    left: node.x * miniScale,
                    top: node.y * miniScale,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className={
                    'absolute w-1.5 h-1.5 rounded-full ' +
                    (node.is_terminal ? 'bg-amber-600' : 'bg-indigo-600')
                  }
                />
              ))}

              {/* Viewport Box Indicator */}
              <div
                style={{
                  width: Math.min(miniWidth, (380 / zoom) * miniScale),
                  height: Math.min(miniHeight, (260 / zoom) * miniScale),
                  left: Math.max(0, Math.min(miniWidth - 30, (miniWidth / 2) - (pan.x / zoom) * miniScale)),
                  top: Math.max(0, Math.min(miniHeight - 20, -(pan.y / zoom) * miniScale))
                }}
                className="absolute border-2 border-indigo-600 bg-indigo-200/40 rounded-xs pointer-events-none transition-all duration-75"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



