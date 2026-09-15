import React, { useState, useRef, useEffect } from 'react';
import { calculatePathData, getNodePorts, getBestPortPair } from '../utils/geometry';

export default function Canvas({
  nodes,
  edges,
  theme,
  zoom,
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
  activeConnectorStyle
}) {
  const containerRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanMouse, setStartPanMouse] = useState({ x: 0, y: 0 });

  // Node Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [snapLines, setSnapLines] = useState([]);

  // Connecting line state
  const [connectingFrom, setConnectingFrom] = useState(null); // { nodeId, portDir }
  const [mouseCanvasPos, setMouseCanvasPos] = useState({ x: 0, y: 0 });

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

  // Canvas Mouse Down: Start Pan or Deselect
  const handleCanvasMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.classList.contains('canvas-bg')) {
      setSelectedNodeIds([]);
      setSelectedEdgeId(null);
      setEditingNodeId(null);
      setEditingEdgeId(null);

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

      // Calculate Snap Alignment Lines (X & Y)
      const currentNode = nodes.find(n => n.id === draggingNodeId);
      if (currentNode) {
        const snapThreshold = 10;
        const newSnapLines = [];
        const currentCenterX = newX + currentNode.width / 2;
        const currentCenterY = newY + currentNode.height / 2;

        nodes.forEach(other => {
          if (other.id === draggingNodeId) return;
          const otherCenterX = other.x + other.width / 2;
          const otherCenterY = other.y + other.height / 2;

          // X alignment (vertical line)
          if (Math.abs(currentCenterX - otherCenterX) < snapThreshold) {
            newX = otherCenterX - currentNode.width / 2;
            newSnapLines.push({ type: 'x', x: otherCenterX });
          }

          // Y alignment (horizontal line)
          if (Math.abs(currentCenterY - otherCenterY) < snapThreshold) {
            newY = otherCenterY - currentNode.height / 2;
            newSnapLines.push({ type: 'y', y: otherCenterY });
          }
        });

        setSnapLines(newSnapLines);
      }

      onUpdateNode(draggingNodeId, { x: Math.round(newX), y: Math.round(newY) });
    }
  };

  // Canvas Mouse Up
  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
    setSnapLines([]);

    if (connectingFrom) {
      setConnectingFrom(null);
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

      const newNode = {
        id: 'node_' + Date.now(),
        type: shapeItem.id,
        label: shapeItem.name,
        x: Math.round(canvasPos.x - shapeItem.defaultWidth / 2),
        y: Math.round(canvasPos.y - shapeItem.defaultHeight / 2),
        width: shapeItem.defaultWidth,
        height: shapeItem.defaultHeight,
        fill: themeColors.fill,
        stroke: themeColors.stroke,
        text: themeColors.text,
        font: 'Inter',
        fontSize: 14,
        fontWeight: '500',
        stepIndex: nodes.length + 1
      };

      onUpdateNode(newNode.id, newNode, true); // add
      setSelectedNodeIds([newNode.id]);
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
    setDragOffset({
      x: canvasPos.x - node.x,
      y: canvasPos.y - node.y
    });
  };

  // Connection Port Click/Drag
  const handlePortMouseDown = (e, node, portDir) => {
    e.stopPropagation();
    const ports = getNodePorts(node);
    setConnectingFrom({
      nodeId: node.id,
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

  return (
    <div
      ref={containerRef}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`relative flex-1 h-full w-full overflow-hidden select-none cursor-crosshair canvas-bg ${theme.canvasBgClass}`}
    >
      <svg className="w-full h-full absolute inset-0 pointer-events-none">
        <defs>
          <marker
            id="arrowhead-end"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
          </marker>
          <marker
            id="arrowhead-selected"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
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
                stroke="#3b82f6"
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
                stroke="#3b82f6"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            )
          ))}

          {/* Render Connections / Edges */}
          {edges.map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.from);
            const targetNode = nodes.find(n => n.id === edge.to);
            if (!sourceNode || !targetNode) return null;

            const { fromPort, toPort } = getBestPortPair(sourceNode, targetNode);
            const pathInfo = calculatePathData(fromPort, toPort, edge.style || 'orthogonal');
            const isSelected = selectedEdgeId === edge.id;

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
                {/* Visible line */}
                <path
                  d={pathInfo.d}
                  fill="none"
                  stroke={isSelected ? '#3b82f6' : (edge.stroke || '#64748b')}
                  strokeWidth={isSelected ? '3' : '2'}
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
                      className="w-full h-full bg-slate-900 text-white text-xs px-2 py-0.5 rounded border border-blue-500 outline-none text-center shadow-lg"
                    />
                  </foreignObject>
                ) : (
                  edge.label && (
                    <g
                      transform={`translate(${pathInfo.midPoint.x}, ${pathInfo.midPoint.y})`}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingEdgeId(edge.id);
                        setTempLabel(edge.label);
                      }}
                    >
                      <rect
                        x={-(edge.label.length * 3.5 + 8)}
                        y="-10"
                        width={edge.label.length * 7 + 16}
                        height="20"
                        rx="4"
                        fill={theme.textDark ? '#ffffff' : '#0f172a'}
                        stroke={isSelected ? '#3b82f6' : '#475569'}
                        strokeWidth="1"
                        className="shadow-sm"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill={theme.textDark ? '#0f172a' : '#f8fafc'}
                        fontSize="11"
                        fontWeight="500"
                        className="pointer-events-none"
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
              d={calculatePathData(connectingFrom.port, { x: mouseCanvasPos.x, y: mouseCanvasPos.y, dir: 'center' }, activeConnectorStyle).d}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
          )}

          {/* Render Nodes */}
          {nodes.map(node => {
            const isSelected = selectedNodeIds.includes(node.id);
            const isEditing = editingNodeId === node.id;
            const ports = getNodePorts(node);

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingNodeId(node.id);
                  setTempLabel(node.label);
                }}
                className="pointer-events-auto cursor-grab active:cursor-grabbing group"
              >
                {/* Node Shape SVG Graphics */}
                {renderNodeSvgShape(node, isSelected, theme)}

                {/* Node Text Content or Inline Input */}
                {isEditing ? (
                  <foreignObject
                    x="10"
                    y="10"
                    width={node.width - 20}
                    height={node.height - 20}
                  >
                    <div className="h-full w-full flex items-center justify-center">
                      <textarea
                        autoFocus
                        value={tempLabel}
                        onChange={(e) => setTempLabel(e.target.value)}
                        onBlur={saveInlineLabel}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            saveInlineLabel();
                          }
                        }}
                        className="w-full h-full bg-slate-900/90 text-white text-xs p-1 rounded border border-blue-500 outline-none text-center resize-none shadow-xl"
                      />
                    </div>
                  </foreignObject>
                ) : (
                  <text
                    x={node.width / 2}
                    y={node.height / 2 + 4}
                    textAnchor="middle"
                    fill={node.text || (theme.textDark ? '#0f172a' : '#f8fafc')}
                    fontSize={node.fontSize || 14}
                    fontWeight={node.fontWeight || '500'}
                    fontFamily={node.font || 'Inter'}
                    className="pointer-events-none select-none"
                  >
                    {node.label}
                  </text>
                )}

                {/* Presentation Step Index Badge */}
                {node.stepIndex && (
                  <g transform={`translate(${node.width - 8}, -6)`}>
                    <circle r="10" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                    <text
                      y="3.5"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
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

                  return (
                    <circle
                      key={dir}
                      cx={localX}
                      cy={localY}
                      r="6"
                      fill="#3b82f6"
                      stroke="#ffffff"
                      strokeWidth="2"
                      onMouseDown={(e) => handlePortMouseDown(e, node, dir)}
                      onMouseUp={(e) => handlePortMouseUp(e, node, dir)}
                      className="opacity-0 group-hover:opacity-100 hover:scale-125 transition-all cursor-crosshair"
                    />
                  );
                })}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

// Helper SVG Shape Generator for Node Types
function renderNodeSvgShape(node, isSelected, theme) {
  const { width, height, type, fill, stroke } = node;
  const strokeColor = isSelected ? '#3b82f6' : (stroke || '#64748b');
  const strokeW = isSelected ? '3' : '2';
  const shadowFilter = 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.3))';

  if (type === 'terminal' || type === 'pill') {
    return (
      <rect
        width={width}
        height={height}
        rx={height / 2}
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
        fill={fill}
        stroke={strokeColor}
        strokeWidth={strokeW}
        style={{ filter: shadowFilter }}
      />
    );
  }

  if (type === 'database' || type === 'cylinder') {
    const rx = width / 2;
    const ry = 12;
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
        d={`M 0 0 H ${width} V ${height - 12} Q ${width * 0.75} ${height} ${width * 0.5} ${height - 10} T 0 ${height - 12} Z`}
        fill={fill}
        stroke={strokeColor}
        strokeWidth={strokeW}
        style={{ filter: shadowFilter }}
      />
    );
  }

  if (type === 'input' || type === 'parallelogram') {
    const skew = 20;
    const pts = `${skew},0 ${width},0 ${width - skew},${height} 0,${height}`;
    return (
      <polygon
        points={pts}
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
          rx="4"
          fill={fill}
          stroke={strokeColor}
          strokeWidth={strokeW}
        />
        <path
          d={`M ${width - 16} ${height} L ${width} ${height - 16} L ${width - 16} ${height - 16} Z`}
          fill="rgba(0,0,0,0.2)"
        />
      </g>
    );
  }

  // Default Rectangle
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
