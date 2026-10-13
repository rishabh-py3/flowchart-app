import React, { useState, useRef } from 'react';
import { Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Trash2, X, Edit3, Download } from 'lucide-react';
import { calculatePathData, getNodePorts, getBestPortPair, computeAutoNodeLayout } from '../utils/geometry';

export default function Canvas({
  nodes,
  edges,
  theme,
  zoom,
  setZoom,
  pan,
  setPan,
  selectedNodeIds,
  setSelectedNodeIds,
  selectedEdgeId,
  setSelectedEdgeId,
  onUpdateNode,
  onUpdateEdge,
  onAddEdge,
  onDeleteEdge,
  onDeleteNode,
  onCommitHistory,
  activeConnectorStyle,
  onOpenMobileInspector,
  onOpenMobileShapes,
  fitNodesToView,
  onDownloadImage,
  canUndo,
  canRedo,
  onUndo,
  onRedo
}) {
  const containerRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanMouse, setStartPanMouse] = useState({ x: 0, y: 0 });

  // Node Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [snapLines, setSnapLines] = useState([]);
  const [hasMovedDuringDrag, setHasMovedDuringDrag] = useState(false);

  // Connecting line state
  const [connectingFrom, setConnectingFrom] = useState(null); // { nodeId, portDir, port }
  const [hoveredPort, setHoveredPort] = useState(null); // { nodeId, portDir }
  const [mouseCanvasPos, setMouseCanvasPos] = useState({ x: 0, y: 0 });

  // Touch gesture tracking refs
  const touchStateRef = useRef({
    isPinching: false,
    startDist: 0,
    startZoom: 1,
    startCenter: { x: 0, y: 0 },
    startPan: { x: 0, y: 0 },
    touchStartPos: { x: 0, y: 0 },
    touchStartTime: 0,
    hasMoved: false
  });
  const draggingTouchNodeRef = useRef(null);
  const connectingTouchPortRef = useRef(null);

  // Inline editing state
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [editingEdgeId, setEditingEdgeId] = useState(null);
  const [tempLabel, setTempLabel] = useState('');

  // Helper to convert Screen Coordinates to Canvas World Coordinates
  const screenToCanvas = (screenX, screenY) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (screenX - rect.left - pan.x) / zoom,
      y: (screenY - rect.top - pan.y) / zoom
    };
  };

  // Smooth Wheel Zoom / Pan
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.0015;
      const nextZoom = Math.min(2.2, Math.max(0.35, +(zoom + delta).toFixed(2)));
      setZoom(nextZoom);
    } else {
      setPan(prev => ({
        x: prev.x - e.deltaX * 0.6,
        y: prev.y - e.deltaY * 0.6
      }));
    }
  };

  // Canvas Mouse Down: Start Pan or Deselect
  const handleCanvasMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.classList.contains('canvas-bg')) {
      if (editingNodeId || editingEdgeId) {
        saveInlineLabel();
      }
      setSelectedNodeIds([]);
      setSelectedEdgeId(null);

      setIsPanning(true);
      setStartPanMouse({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  // Canvas Mouse Move
  const handleCanvasMouseMove = (e) => {
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    setMouseCanvasPos(canvasPos);

    if (isPanning) {
      setPan({
        x: e.clientX - startPanMouse.x,
        y: e.clientY - startPanMouse.y
      });
      return;
    }

    if (draggingNodeId) {
      let newX = canvasPos.x - dragOffset.x;
      let newY = canvasPos.y - dragOffset.y;

      const currentNode = nodes.find(n => n.id === draggingNodeId);
      if (currentNode) {
        const layout = computeAutoNodeLayout(currentNode);
        const snapThreshold = 8;
        const newSnapLines = [];
        const currentCenterX = newX + layout.width / 2;
        const currentCenterY = newY + layout.height / 2;

        nodes.forEach(other => {
          if (other.id === draggingNodeId) return;
          const otherLayout = computeAutoNodeLayout(other);
          const otherCenterX = other.x + otherLayout.width / 2;
          const otherCenterY = other.y + otherLayout.height / 2;

          if (Math.abs(currentCenterX - otherCenterX) < snapThreshold) {
            newX = otherCenterX - layout.width / 2;
            newSnapLines.push({ type: 'x', x: otherCenterX });
          }

          if (Math.abs(currentCenterY - otherCenterY) < snapThreshold) {
            newY = otherCenterY - layout.height / 2;
            newSnapLines.push({ type: 'y', y: otherCenterY });
          }
        });

        setSnapLines(newSnapLines);
      }

      setHasMovedDuringDrag(true);
      onUpdateNode(draggingNodeId, { x: Math.round(newX), y: Math.round(newY) }, false, true);
    }
  };

  // Canvas Mouse Up
  const handleCanvasMouseUp = () => {
    if (draggingNodeId && hasMovedDuringDrag && onCommitHistory) {
      onCommitHistory();
    }
    setIsPanning(false);
    setDraggingNodeId(null);
    setHasMovedDuringDrag(false);
    setSnapLines([]);

    if (connectingFrom) {
      setConnectingFrom(null);
    }
  };

  // --- MOBILE TOUCH EVENT HANDLERS ---
  const handleCanvasTouchStart = (e) => {
    if (editingNodeId || editingEdgeId) {
      saveInlineLabel();
    }

    if (e.touches.length === 1) {
      const t = e.touches[0];
      touchStateRef.current = {
        isPinching: false,
        startDist: 0,
        startZoom: zoom,
        startCenter: { x: t.clientX, y: t.clientY },
        startPan: { ...pan },
        touchStartPos: { x: t.clientX, y: t.clientY },
        touchStartTime: Date.now(),
        hasMoved: false
      };
      setIsPanning(true);
      setStartPanMouse({ x: t.clientX - pan.x, y: t.clientY - pan.y });
    } else if (e.touches.length === 2) {
      setIsPanning(false);
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const center = { x: (t0.clientX + t1.clientX) / 2, y: (t0.clientY + t1.clientY) / 2 };
      touchStateRef.current = {
        isPinching: true,
        startDist: dist,
        startZoom: zoom,
        startCenter: center,
        startPan: { ...pan },
        touchStartPos: center,
        touchStartTime: Date.now(),
        hasMoved: true
      };
    }
  };

  const handleCanvasTouchMove = (e) => {
    if (e.cancelable) e.preventDefault();

    // 1. Touch drag a node
    if (draggingTouchNodeRef.current && e.touches.length === 1) {
      const t = e.touches[0];
      const info = draggingTouchNodeRef.current;
      const dx = (t.clientX - info.startX) / zoom;
      const dy = (t.clientY - info.startY) / zoom;
      if (Math.hypot(dx, dy) > 3) info.hasMoved = true;

      let newX = info.nodeStartX + dx;
      let newY = info.nodeStartY + dy;

      const currentNode = nodes.find(n => n.id === info.nodeId);
      if (currentNode) {
        const layout = computeAutoNodeLayout(currentNode);
        const snapThreshold = 8;
        const newSnapLines = [];
        const currentCenterX = newX + layout.width / 2;
        const currentCenterY = newY + layout.height / 2;

        nodes.forEach(other => {
          if (other.id === info.nodeId) return;
          const otherLayout = computeAutoNodeLayout(other);
          const otherCenterX = other.x + otherLayout.width / 2;
          const otherCenterY = other.y + otherLayout.height / 2;

          if (Math.abs(currentCenterX - otherCenterX) < snapThreshold) {
            newX = otherCenterX - layout.width / 2;
            newSnapLines.push({ type: 'x', x: otherCenterX });
          }
          if (Math.abs(currentCenterY - otherCenterY) < snapThreshold) {
            newY = otherCenterY - layout.height / 2;
            newSnapLines.push({ type: 'y', y: otherCenterY });
          }
        });
        setSnapLines(newSnapLines);
      }

      onUpdateNode(info.nodeId, { x: Math.round(newX), y: Math.round(newY) }, false, true);
      return;
    }

    // 2. Touch connecting line
    if (connectingTouchPortRef.current && e.touches.length === 1) {
      const t = e.touches[0];
      const cPos = screenToCanvas(t.clientX, t.clientY);
      setMouseCanvasPos(cPos);
      return;
    }

    // 3. Pinch-to-zoom (2 fingers)
    if (touchStateRef.current.isPinching && e.touches.length === 2) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const currCenter = { x: (t0.clientX + t1.clientX) / 2, y: (t0.clientY + t1.clientY) / 2 };
      const { startDist, startZoom, startCenter, startPan } = touchStateRef.current;
      if (startDist > 0) {
        const scale = dist / startDist;
        const nextZoom = Math.min(2.2, Math.max(0.3, +(startZoom * scale).toFixed(2)));
        const ratio = nextZoom / startZoom;
        const nextPanX = currCenter.x - (startCenter.x - startPan.x) * ratio;
        const nextPanY = currCenter.y - (startCenter.y - startPan.y) * ratio;
        setZoom(nextZoom);
        setPan({ x: Math.round(nextPanX), y: Math.round(nextPanY) });
      }
      return;
    }

    // 4. Touch pan canvas (1 finger)
    if (isPanning && e.touches.length === 1) {
      const t = e.touches[0];
      const dx = t.clientX - touchStateRef.current.touchStartPos.x;
      const dy = t.clientY - touchStateRef.current.touchStartPos.y;
      if (Math.hypot(dx, dy) > 3) touchStateRef.current.hasMoved = true;
      setPan({
        x: touchStateRef.current.startPan.x + dx,
        y: touchStateRef.current.startPan.y + dy
      });
    }
  };

  const handleCanvasTouchEnd = (e) => {
    // Drop dragged node
    if (draggingTouchNodeRef.current) {
      if (draggingTouchNodeRef.current.hasMoved && onCommitHistory) {
        onCommitHistory();
      }
      draggingTouchNodeRef.current = null;
      setDraggingNodeId(null);
      setSnapLines([]);
      return;
    }

    // Connect port
    if (connectingTouchPortRef.current) {
      const fromInfo = connectingTouchPortRef.current;
      const t = e.changedTouches[0];
      if (t) {
        const cPos = screenToCanvas(t.clientX, t.clientY);
        const target = sizedNodes.find(n =>
          n.id !== fromInfo.nodeId &&
          cPos.x >= n.x && cPos.x <= n.x + n.width &&
          cPos.y >= n.y && cPos.y <= n.y + n.height
        );
        if (target) {
          const sn = sizedNodesMap[fromInfo.nodeId];
          const pair = getBestPortPair(sn, target, { fromPort: fromInfo.portDir });
          onAddEdge({
            id: 'edge_' + Date.now(),
            from: fromInfo.nodeId,
            to: target.id,
            fromPort: fromInfo.portDir,
            toPort: pair.toDir,
            label: '',
            style: activeConnectorStyle || 'orthogonal',
            arrow: 'end'
          });
        }
      }
      connectingTouchPortRef.current = null;
      setConnectingFrom(null);
      return;
    }

    if (e.touches.length === 0) {
      if (!touchStateRef.current.hasMoved && (Date.now() - touchStateRef.current.touchStartTime < 300)) {
        setSelectedNodeIds([]);
        setSelectedEdgeId(null);
      }
      setIsPanning(false);
      touchStateRef.current.isPinching = false;
    }
  };

  const handleNodeTouchStart = (e, node) => {
    e.stopPropagation();
    if (editingNodeId && editingNodeId !== node.id) {
      saveInlineLabel();
    }
    setSelectedEdgeId(null);
    setSelectedNodeIds([node.id]);

    if (e.touches.length === 1) {
      const t = e.touches[0];
      draggingTouchNodeRef.current = {
        nodeId: node.id,
        startX: t.clientX,
        startY: t.clientY,
        nodeStartX: node.x,
        nodeStartY: node.y,
        hasMoved: false
      };
      setDraggingNodeId(node.id);
    }
  };

  const handlePortTouchStart = (e, node, dir, portPos) => {
    e.stopPropagation();
    if (e.touches.length === 1) {
      connectingTouchPortRef.current = {
        nodeId: node.id,
        portDir: dir
      };
      setConnectingFrom({ nodeId: node.id, portDir: dir, port: portPos });
      const t = e.touches[0];
      const cPos = screenToCanvas(t.clientX, t.clientY);
      setMouseCanvasPos(cPos);
    }
  };

  // Drag and Drop shape from sidebar into Canvas
  const handleDrop = (e) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('application/json');
    if (!dataStr) return;

    try {
      const shapeItem = JSON.parse(dataStr);
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const themeColors = theme.nodeColors[shapeItem.id] || theme.nodeColors.process;

      const baseNode = {
        id: 'node_' + Date.now(),
        type: shapeItem.id,
        label: shapeItem.name,
        width: shapeItem.defaultWidth,
        height: shapeItem.defaultHeight,
        fill: themeColors.fill,
        stroke: themeColors.stroke,
        text: themeColors.text,
        font: 'Inter',
        fontSize: 13,
        fontWeight: '500',
        stepIndex: nodes.length + 1
      };
      const layout = computeAutoNodeLayout(baseNode);

      const newNode = {
        ...baseNode,
        width: layout.width,
        height: layout.height,
        x: Math.round(canvasPos.x - layout.width / 2),
        y: Math.round(canvasPos.y - layout.height / 2)
      };

      onUpdateNode(newNode.id, newNode, true);
      setSelectedNodeIds([newNode.id]);
      setSelectedEdgeId(null);
    } catch (err) {
      console.error('Failed to parse dropped shape:', err);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Node Mouse Down: Select & Drag
  const handleNodeMouseDown = (e, node) => {
    e.stopPropagation();
    if (editingNodeId && editingNodeId !== node.id) {
      saveInlineLabel();
    }
    setSelectedEdgeId(null);

    if (e.shiftKey) {
      if (selectedNodeIds.includes(node.id)) {
        setSelectedNodeIds(selectedNodeIds.filter(id => id !== node.id));
      } else {
        setSelectedNodeIds([...selectedNodeIds, node.id]);
      }
    } else {
      setSelectedNodeIds([node.id]);
    }

    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    setDraggingNodeId(node.id);
    setHasMovedDuringDrag(false);
    setDragOffset({
      x: canvasPos.x - node.x,
      y: canvasPos.y - node.y
    });
  };

  // Node Mouse Up: Finish connection if dropped anywhere on a target node
  const handleNodeMouseUp = (e, targetNode) => {
    if (connectingFrom && connectingFrom.nodeId !== targetNode.id) {
      e.stopPropagation();
      const sourceNode = nodes.find(n => n.id === connectingFrom.nodeId);
      let targetPortDir = hoveredPort?.nodeId === targetNode.id ? hoveredPort.portDir : null;

      if (!targetPortDir && sourceNode) {
        const pair = getBestPortPair(sourceNode, targetNode, { fromPort: connectingFrom.portDir });
        targetPortDir = pair.toDir;
      }

      onAddEdge({
        id: 'edge_' + Date.now(),
        from: connectingFrom.nodeId,
        to: targetNode.id,
        fromPort: connectingFrom.portDir,
        toPort: targetPortDir,
        label: '',
        style: activeConnectorStyle || 'orthogonal',
        arrow: 'end'
      });
      setConnectingFrom(null);
    }
  };

  // Connection Port Click/Drag
  const handlePortMouseDown = (e, node, portDir) => {
    e.stopPropagation();
    const sizedNode = { ...node, ...computeAutoNodeLayout(node) };
    const ports = getNodePorts(sizedNode);
    setConnectingFrom({
      nodeId: node.id,
      portDir,
      port: ports[portDir]
    });
  };

  const handlePortMouseUp = (e, targetNode, portDir) => {
    e.stopPropagation();
    if (connectingFrom && connectingFrom.nodeId !== targetNode.id) {
      onAddEdge({
        id: 'edge_' + Date.now(),
        from: connectingFrom.nodeId,
        to: targetNode.id,
        fromPort: connectingFrom.portDir,
        toPort: portDir,
        label: '',
        style: activeConnectorStyle || 'orthogonal',
        arrow: 'end'
      });
    }
    setConnectingFrom(null);
  };

  // Inline editing handler
  const saveInlineLabel = () => {
    if (editingNodeId) {
      onUpdateNode(editingNodeId, { label: tempLabel });
      setEditingNodeId(null);
    }
    if (editingEdgeId) {
      onUpdateEdge(editingEdgeId, { label: tempLabel });
      setEditingEdgeId(null);
    }
  };

  // Compute live auto-sized nodes map so ports and boxes are always 100% in sync with text
  const sizedNodesMap = {};
  const sizedNodes = nodes.map(n => {
    const activeNode = editingNodeId === n.id ? { ...n, label: tempLabel } : n;
    const layout = computeAutoNodeLayout(activeNode);
    const sn = {
      ...n,
      width: layout.width,
      height: layout.height,
      _lines: layout.lines,
      _lineHeight: layout.lineHeight
    };
    sizedNodesMap[n.id] = sn;
    return sn;
  });

  const defaultEdgeColor = theme.edgeStroke || '#736049';
  const selectedColor = theme.accent || '#7a5c3e';

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onTouchStart={handleCanvasTouchStart}
      onTouchMove={handleCanvasTouchMove}
      onTouchEnd={handleCanvasTouchEnd}
      onTouchCancel={handleCanvasTouchEnd}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{ touchAction: 'none' }}
      className={`relative flex-1 h-full w-full overflow-hidden select-none cursor-default canvas-bg ${theme.canvasBgClass}`}
    >
      <svg className="w-full h-full absolute inset-0 pointer-events-none" style={{ touchAction: 'none' }}>
        <defs>
          <marker
            id="arrowhead-end"
            markerWidth="9"
            markerHeight="7"
            refX="8"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0.5, 8.5 3.5, 0 6.5" fill={defaultEdgeColor} />
          </marker>
          <marker
            id="arrowhead-selected"
            markerWidth="9"
            markerHeight="7"
            refX="8"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0.5, 8.5 3.5, 0 6.5" fill={selectedColor} />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Snap Guidelines */}
          {snapLines.map((line, idx) => (
            line.type === 'x' ? (
              <line
                key={'snap_x_' + idx}
                x1={line.x}
                y1={-10000}
                x2={line.x}
                y2={10000}
                stroke="#9e7b56"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ) : (
              <line
                key={'snap_y_' + idx}
                x1={-10000}
                y1={line.y}
                x2={10000}
                y2={line.y}
                stroke="#9e7b56"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            )
          ))}

          {/* Render Connections / Edges */}
          {edges.map(edge => {
            const sourceNode = sizedNodesMap[edge.from];
            const targetNode = sizedNodesMap[edge.to];
            if (!sourceNode || !targetNode) return null;

            const { fromPort, toPort } = getBestPortPair(sourceNode, targetNode, edge);
            const pathInfo = calculatePathData(fromPort, toPort, edge.style || 'orthogonal');
            const isSelected = selectedEdgeId === edge.id;

            // Position label cleanly above horizontal segments or beside vertical segments
            const isMostlyHoriz = Math.abs(toPort.x - fromPort.x) >= Math.abs(toPort.y - fromPort.y);
            const labelOffsetX = isMostlyHoriz ? 0 : 18;
            const labelOffsetY = isMostlyHoriz ? -12 : 0;

            return (
              <g key={edge.id} className="pointer-events-auto group cursor-pointer">
                {/* Thick clickable hit area */}
                <path
                  d={pathInfo.d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="16"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEdgeId(edge.id);
                    setSelectedNodeIds([]);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingEdgeId(edge.id);
                    setTempLabel(edge.label || '');
                  }}
                />
                {/* Visible flow line */}
                <path
                  d={pathInfo.d}
                  fill="none"
                  stroke={isSelected ? selectedColor : (edge.stroke || defaultEdgeColor)}
                  strokeWidth={isSelected ? '2.4' : '1.6'}
                  markerEnd={isSelected ? 'url(#arrowhead-selected)' : 'url(#arrowhead-end)'}
                  className="transition-colors"
                />

                {/* Connection Label */}
                {editingEdgeId === edge.id ? (
                  <foreignObject
                    x={pathInfo.midPoint.x - 60}
                    y={pathInfo.midPoint.y - 16}
                    width="120"
                    height="32"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={tempLabel}
                      onChange={(e) => setTempLabel(e.target.value)}
                      onBlur={saveInlineLabel}
                      onKeyDown={(e) => e.key === 'Enter' && saveInlineLabel()}
                      placeholder="Label..."
                      className="w-full h-full bg-[#fdfaf3] text-[#2c251d] text-xs px-2 py-0.5 rounded-md border border-[#7c6143] outline-none text-center shadow-md"
                    />
                  </foreignObject>
                ) : (
                  edge.label && (
                    <g
                      transform={`translate(${pathInfo.midPoint.x + labelOffsetX}, ${pathInfo.midPoint.y + labelOffsetY})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEdgeId(edge.id);
                        setSelectedNodeIds([]);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingEdgeId(edge.id);
                        setTempLabel(edge.label);
                      }}
                    >
                      <rect
                        x={-(edge.label.length * 3.4 + 6)}
                        y="-9"
                        width={edge.label.length * 6.8 + 12}
                        height="18"
                        rx="4"
                        fill={theme.bgColor || '#f3ede0'}
                        fillOpacity="0.88"
                      />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fill={theme.textDark ? '#3b3023' : '#f8fafc'}
                        fontSize="12"
                        fontWeight="500"
                        className="pointer-events-none select-none"
                      >
                        {edge.label}
                      </text>
                    </g>
                  )
                )}
              </g>
            );
          })}

          {/* Render Active Dragging Connection Line */}
          {connectingFrom && (
            <path
              d={calculatePathData(
                connectingFrom.port,
                { x: mouseCanvasPos.x, y: mouseCanvasPos.y, dir: 'center' },
                activeConnectorStyle
              ).d}
              fill="none"
              stroke={selectedColor}
              strokeWidth="2"
              strokeDasharray="5 4"
              markerEnd="url(#arrowhead-selected)"
            />
          )}

          {/* Render Nodes */}
          {sizedNodes.map(node => {
            const isSelected = selectedNodeIds.includes(node.id);
            const isEditing = editingNodeId === node.id;
            const ports = getNodePorts(node);
            const lines = node._lines || [node.label];
            const lineHeight = node._lineHeight || 18;
            const fontSize = node.fontSize || 13;

            // Vertical center calculation for multi-line SVG text
            const totalTextHeight = lines.length * lineHeight;
            const startTextY = (node.height - totalTextHeight) / 2 + fontSize * 0.82 + (node.type === 'database' ? 6 : 0) - (node.type === 'document' ? 4 : 0);

            // Step badge position adjusted accurately for each shape geometry
            const badgeX = node.type === 'decision'
              ? node.width / 2
              : node.type === 'input'
                ? node.width - 10
                : node.width - 6;
            const badgeY = node.type === 'decision' ? -4 : -4;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                style={{ touchAction: 'none' }}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                onTouchStart={(e) => handleNodeTouchStart(e, node)}
                onMouseUp={(e) => handleNodeMouseUp(e, node)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingNodeId(node.id);
                  setTempLabel(node.label);
                }}
                className="pointer-events-auto cursor-grab active:cursor-grabbing group"
              >
                {/* Node Shape SVG Graphics */}
                {renderNodeSvgShape(node, isSelected, theme)}

                {/* Node Multi-line Auto-Fitting Text or Inline Editor */}
                {isEditing ? (
                  <foreignObject
                    x="8"
                    y="8"
                    width={Math.max(80, node.width - 16)}
                    height={Math.max(40, node.height - 16)}
                  >
                    <div className="h-full w-full flex items-center justify-center">
                      <textarea
                        autoFocus
                        value={tempLabel}
                        onChange={(e) => {
                          setTempLabel(e.target.value);
                          onUpdateNode(node.id, { label: e.target.value }, false, true);
                        }}
                        onBlur={saveInlineLabel}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            saveInlineLabel();
                          } else if (e.key === 'Escape') {
                            setEditingNodeId(null);
                          }
                        }}
                        className="w-full h-full bg-[#fdfaf3]/95 text-[#2c251d] text-xs p-1.5 rounded-lg border border-[#7c6143] outline-none text-center resize-none shadow-inner font-medium leading-snug"
                      />
                    </div>
                  </foreignObject>
                ) : (
                  <text
                    x={node.width / 2}
                    textAnchor="middle"
                    fill={node.text || (theme.textDark ? '#2c251d' : '#f8fafc')}
                    fontSize={fontSize}
                    fontWeight={node.fontWeight || '500'}
                    fontFamily={node.font || 'Inter'}
                    className="pointer-events-none select-none"
                  >
                    {lines.map((line, i) => (
                      <tspan
                        key={i}
                        x={node.width / 2}
                        y={startTextY + i * lineHeight}
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>
                )}

                {/* Presentation Step Index Badge */}
                {node.stepIndex && (
                  <g transform={`translate(${badgeX}, ${badgeY})`} className="pointer-events-none">
                    <circle
                      r="11.5"
                      fill="#f6efe0"
                      stroke="#7a6852"
                      strokeWidth="1.2"
                      style={{ filter: 'drop-shadow(0px 1px 2px rgba(60, 45, 30, 0.15))' }}
                    />
                    <text
                      y="3.8"
                      textAnchor="middle"
                      fill="#3b3023"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {node.stepIndex}
                    </text>
                  </g>
                )}

                {/* Connection Ports (Visible on hover or when connecting) */}
                {['top', 'right', 'bottom', 'left'].map(dir => {
                  const p = ports[dir];
                  const localX = p.x - node.x;
                  const localY = p.y - node.y;
                  const isPortHovered = hoveredPort?.nodeId === node.id && hoveredPort?.portDir === dir;

                  return (
                    <g key={dir}>
                      {/* Larger invisible hit area for effortless connection dragging */}
                      <circle
                        cx={localX}
                        cy={localY}
                        r="16"
                        fill="transparent"
                        onMouseEnter={() => setHoveredPort({ nodeId: node.id, portDir: dir })}
                        onMouseLeave={() => setHoveredPort(null)}
                        onMouseDown={(e) => handlePortMouseDown(e, node, dir)}
                        onTouchStart={(e) => handlePortTouchStart(e, node, dir, ports[dir])}
                        onMouseUp={(e) => handlePortMouseUp(e, node, dir)}
                        className="cursor-crosshair pointer-events-auto"
                      />
                      <circle
                        cx={localX}
                        cy={localY}
                        r={isPortHovered ? '6.5' : '5'}
                        fill={isPortHovered ? '#7c6143' : '#f6efe0'}
                        stroke="#6d5d47"
                        strokeWidth="1.8"
                        className={`pointer-events-none transition-opacity ${
                          connectingFrom || isSelected
                            ? 'opacity-90'
                            : 'opacity-60 md:opacity-0 group-hover:opacity-100'
                        }`}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Canvas Controls */}
      <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 bg-[#ede4d3]/95 backdrop-blur-xs border border-[#cfc0a5] shadow-lg rounded-xl p-1 text-[#4a3e2e]">
        {onUndo && (
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded-lg hover:bg-[#ded2bc] disabled:opacity-30 transition"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
        )}
        {onRedo && (
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded-lg hover:bg-[#ded2bc] disabled:opacity-30 transition"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        )}
        <span className="h-4 w-[1px] bg-[#cfc0a5] mx-0.5" />
        <button
          onClick={() => setZoom(Math.max(0.3, +(zoom - 0.1).toFixed(2)))}
          className="p-2 rounded-lg hover:bg-[#ded2bc] transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => fitNodesToView && fitNodesToView()}
          className="px-2 py-1 rounded-lg hover:bg-[#ded2bc] font-mono text-xs font-semibold transition"
          title="Center & Fit Flowchart"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => setZoom(Math.min(2.2, +(zoom + 0.1).toFixed(2)))}
          className="p-2 rounded-lg hover:bg-[#ded2bc] transition"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        {onDownloadImage && (
          <>
            <span className="h-4 w-[1px] bg-[#cfc0a5] mx-0.5" />
            <button
              onClick={onDownloadImage}
              className="p-2 rounded-lg hover:bg-[#ded2bc] text-[#5c442d] transition"
              title="Download Flowchart Image (PNG)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Mobile Floating Action Pill when block or edge is selected */}
      {(selectedNodeIds.length > 0 || selectedEdgeId) && (
        <div className="md:hidden fixed bottom-18 left-1/2 -translate-x/1/2 z-40 bg-[#f5efe2] border border-[#cfc0a5] shadow-2xl rounded-full px-3.5 py-2 flex items-center gap-2.5 text-xs text-[#2c251d]">
          <span className="font-semibold max-w-[120px] truncate text-[#4a3e2e]">
            {sizedNodes.find(n => n.id === selectedNodeIds[0])?.label || 'Connection'}
          </span>
          {onOpenMobileInspector && (
            <button
              onClick={onOpenMobileInspector}
              className="px-2.5 py-1 rounded-lg bg-[#7c6143] text-[#fdfaf3] font-medium"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => {
              if (selectedNodeIds.length > 0) onDeleteNode(selectedNodeIds[0]);
              else if (selectedEdgeId) onDeleteEdge(selectedEdgeId);
            }}
            className="p-1 text-rose-700 font-bold"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setSelectedNodeIds([]); setSelectedEdgeId(null); }}
            className="p-1 text-[#72634f]"
            title="Deselect"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// Helper SVG Shape Generator for all 7 Flowchart Node Types
export function renderNodeSvgShape(node, isSelected, theme) {
  const { width, height, type, fill, stroke } = node;
  const strokeColor = isSelected ? (theme?.accent || '#7a5c3e') : (stroke || '#6d624d');
  const strokeW = isSelected ? '2.4' : '1.4';
  const shadowFilter = isSelected
    ? 'drop-shadow(0px 4px 10px rgba(90, 70, 45, 0.22))'
    : 'drop-shadow(0px 2px 4px rgba(74, 60, 44, 0.1))';

  if (type === 'terminal' || type === 'pill') {
    return (
      <rect
        width={width}
        height={height}
        rx="10"
        fill={fill}
        stroke={strokeColor}
        strokeWidth={strokeW}
        style={{ filter: shadowFilter }}
      />
    );
  }

  if (type === 'decision' || type === 'diamond') {
    const pts = `${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`;
    return (
      <polygon
        points={pts}
        strokeLinejoin="round"
        fill={fill}
        stroke={strokeColor}
        strokeWidth={strokeW}
        style={{ filter: shadowFilter }}
      />
    );
  }

  if (type === 'database' || type === 'cylinder') {
    const rx = width / 2;
    const ry = 10;
    return (
      <g style={{ filter: shadowFilter }}>
        <path
          d={`M 0 ${ry} v ${height - 2 * ry} a ${rx} ${ry} 0 0 0 ${width} 0 v -${height - 2 * ry}`}
          fill={fill}
          stroke={strokeColor}
          strokeWidth={strokeW}
        />
        <ellipse
          cx={rx}
          cy={ry}
          rx={rx}
          ry={ry}
          fill={fill}
          stroke={strokeColor}
          strokeWidth={strokeW}
        />
      </g>
    );
  }

  if (type === 'document') {
    return (
      <path
        d={`M 0 0 H ${width} V ${height - 11} Q ${width * 0.75} ${height + 2} ${width * 0.5} ${height - 9} T 0 ${height - 11} Z`}
        fill={fill}
        stroke={strokeColor}
        strokeWidth={strokeW}
        style={{ filter: shadowFilter }}
      />
    );
  }

  if (type === 'input' || type === 'parallelogram') {
    const skew = Math.min(20, width * 0.15);
    const pts = `${skew},0 ${width},0 ${width - skew},${height} 0,${height}`;
    return (
      <polygon
        points={pts}
        strokeLinejoin="round"
        fill={fill}
        stroke={strokeColor}
        strokeWidth={strokeW}
        style={{ filter: shadowFilter }}
      />
    );
  }

  if (type === 'note') {
    return (
      <g style={{ filter: shadowFilter }}>
        <rect
          width={width}
          height={height}
          rx="6"
          fill={fill}
          stroke={strokeColor}
          strokeWidth={strokeW}
        />
        <path
          d={`M ${width - 14} ${height} L ${width} ${height - 14} L ${width - 14} ${height - 14} Z`}
          fill="rgba(90, 70, 45, 0.22)"
        />
      </g>
    );
  }

  // Default Process Rectangle
  return (
    <rect
      width={width}
      height={height}
      rx="9"
      fill={fill}
      stroke={strokeColor}
      strokeWidth={strokeW}
      style={{ filter: shadowFilter }}
    />
  );
}
