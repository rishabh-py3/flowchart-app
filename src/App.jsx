import React, { useState } from 'react';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import Inspector from './components/Inspector';
import PresentationMode from './components/PresentationMode';
import ExportModal from './components/ExportModal';
import TemplateModal from './components/TemplateModal';
import { PRESENTATION_THEMES, PRESET_TEMPLATES } from './utils/templates';

const DEFAULT_TEMPLATE = PRESET_TEMPLATES[0];

export default function App() {
  const [theme, setTheme] = useState(PRESENTATION_THEMES[0]);
  const [nodes, setNodes] = useState(DEFAULT_TEMPLATE.nodes);
  const [edges, setEdges] = useState(DEFAULT_TEMPLATE.edges);

  const [selectedNodeIds, setSelectedNodeIds] = useState([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);

  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [activeConnectorStyle, setActiveConnectorStyle] = useState('orthogonal');

  // History stack for Undo / Redo
  const [history, setHistory] = useState([{ nodes: DEFAULT_TEMPLATE.nodes, edges: DEFAULT_TEMPLATE.edges }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Modals state
  const [showPresentation, setShowPresentation] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Save state snapshot into history stack
  const saveSnapshot = (newNodes, newEdges) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: newNodes, edges: newEdges });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setNodes(prev.nodes);
      setEdges(prev.edges);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setNodes(next.nodes);
      setEdges(next.edges);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Node Mutations
  const handleUpdateNode = (nodeId, updates, isAdd = false) => {
    let nextNodes;
    if (isAdd) {
      nextNodes = [...nodes, updates];
    } else {
      nextNodes = nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n);
    }
    setNodes(nextNodes);
    saveSnapshot(nextNodes, edges);
  };

  const handleDeleteNode = (nodeId) => {
    const nextNodes = nodes.filter(n => n.id !== nodeId);
    const nextEdges = edges.filter(e => e.from !== nodeId && e.to !== nodeId);
    setNodes(nextNodes);
    setEdges(nextEdges);
    setSelectedNodeIds([]);
    saveSnapshot(nextNodes, nextEdges);
  };

  // Edge Mutations
  const handleAddEdge = (newEdge) => {
    // Prevent duplicate edges
    const exists = edges.some(e => e.from === newEdge.from && e.to === newEdge.to);
    if (exists) return;

    const nextEdges = [...edges, newEdge];
    setEdges(nextEdges);
    saveSnapshot(nodes, nextEdges);
  };

  const handleUpdateEdge = (edgeId, updates) => {
    const nextEdges = edges.map(e => e.id === edgeId ? { ...e, ...updates } : e);
    setEdges(nextEdges);
    saveSnapshot(nodes, nextEdges);
  };

  const handleDeleteEdge = (edgeId) => {
    const nextEdges = edges.filter(e => e.id !== edgeId);
    setEdges(nextEdges);
    setSelectedEdgeId(null);
    saveSnapshot(nodes, nextEdges);
  };

  // Clear Canvas
  const handleClear = () => {
    if (confirm('Clear all blocks and connections on canvas?')) {
      setNodes([]);
      setEdges([]);
      setSelectedNodeIds([]);
      setSelectedEdgeId(null);
      saveSnapshot([], []);
    }
  };

  // Add node from Sidebar click
  const handleAddNodeFromSidebar = (shapeItem) => {
    const themeColors = theme.nodeColors[shapeItem.id] || theme.nodeColors.process;
    const newNode = {
      id: 'node_' + Date.now(),
      type: shapeItem.id,
      label: shapeItem.name,
      x: 350 + Math.random() * 40,
      y: 200 + Math.random() * 40,
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

    handleUpdateNode(newNode.id, newNode, true);
    setSelectedNodeIds([newNode.id]);
  };

  // Load Template
  const handleLoadTemplate = (tpl) => {
    setNodes(tpl.nodes);
    setEdges(tpl.edges);
    setSelectedNodeIds([]);
    setSelectedEdgeId(null);
    saveSnapshot(tpl.nodes, tpl.edges);
  };

  // Import JSON Project
  const handleImportJson = (projectData) => {
    if (projectData.nodes) setNodes(projectData.nodes);
    if (projectData.edges) setEdges(projectData.edges);
    if (projectData.theme) {
      const matchTheme = PRESENTATION_THEMES.find(t => t.id === projectData.theme);
      if (matchTheme) setTheme(matchTheme);
    }
    saveSnapshot(projectData.nodes || [], projectData.edges || []);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeIds[0]);
  const selectedEdge = edges.find(e => e.id === selectedEdgeId);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden font-sans">
      {/* Header Toolbar */}
      <Toolbar
        theme={theme}
        setTheme={setTheme}
        zoom={zoom}
        setZoom={setZoom}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onOpenTemplates={() => setShowTemplates(true)}
        onStartPresentation={() => setShowPresentation(true)}
        onOpenExport={() => setShowExport(true)}
        nodeCount={nodes.length}
        edgeCount={edges.length}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          onAddNode={handleAddNodeFromSidebar}
          activeConnectorStyle={activeConnectorStyle}
          setActiveConnectorStyle={setActiveConnectorStyle}
        />

        <Canvas
          nodes={nodes}
          edges={edges}
          theme={theme}
          zoom={zoom}
          pan={pan}
          setPan={setPan}
          selectedNodeIds={selectedNodeIds}
          setSelectedNodeIds={setSelectedNodeIds}
          selectedEdgeId={selectedEdgeId}
          setSelectedEdgeId={setSelectedEdgeId}
          onUpdateNode={handleUpdateNode}
          onUpdateEdge={handleUpdateEdge}
          onAddEdge={handleAddEdge}
          onDeleteEdge={handleDeleteEdge}
          onDeleteNode={handleDeleteNode}
          activeConnectorStyle={activeConnectorStyle}
        />

        <Inspector
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onUpdateNode={handleUpdateNode}
          onUpdateEdge={handleUpdateEdge}
          onDeleteNode={handleDeleteNode}
          onDeleteEdge={handleDeleteEdge}
        />
      </div>

      {/* Presentation Fullscreen Mode */}
      {showPresentation && (
        <PresentationMode
          nodes={nodes}
          edges={edges}
          theme={theme}
          onClose={() => setShowPresentation(false)}
        />
      )}

      {/* Export Modal */}
      {showExport && (
        <ExportModal
          nodes={nodes}
          edges={edges}
          theme={theme}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* Templates & Import Modal */}
      {showTemplates && (
        <TemplateModal
          onLoadTemplate={handleLoadTemplate}
          onImportJson={handleImportJson}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
}
