import React, { useState, useEffect, useCallback } from 'react';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import Inspector from './components/Inspector';
import PresentationMode from './components/PresentationMode';
import ExportModal from './components/ExportModal';
import TemplateModal from './components/TemplateModal';
import { PRESENTATION_THEMES, PRESET_TEMPLATES } from './utils/templates';
import { computeAutoNodeLayout } from './utils/geometry';

const DEFAULT_TEMPLATE = PRESET_TEMPLATES[0];

// Purge all browser storage, caches, and cookies to save memory and storage on exit
function purgeAllUserDataAndStorage() {
  try {
    window.localStorage?.clear();
  } catch (e) {}
  try {
    window.sessionStorage?.clear();
  } catch (e) {}
  try {
    if (window.indexedDB && typeof window.indexedDB.databases === 'function') {
      window.indexedDB.databases().then((dbs) => {
        dbs.forEach((db) => {
          if (db && db.name) window.indexedDB.deleteDatabase(db.name);
        });
      }).catch(() => {});
    }
  } catch (e) {}
  try {
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      }).catch(() => {});
    }
  } catch (e) {}
  try {
    if (document.cookie) {
      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
      });
    }
  } catch (e) {}
}

export default function App() {
  const [theme, setTheme] = useState(PRESENTATION_THEMES[0]);
  const [nodes, setNodes] = useState(() =>
    DEFAULT_TEMPLATE.nodes.map(n => {
      const layout = computeAutoNodeLayout(n);
      return { ...n, width: layout.width, height: layout.height };
    })
  );
  const [edges, setEdges] = useState(DEFAULT_TEMPLATE.edges);

  const [selectedNodeIds, setSelectedNodeIds] = useState([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);

  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [activeConnectorStyle, setActiveConnectorStyle] = useState('orthogonal');

  // History stack for Undo / Redo (bounded to 40 snapshots to save RAM)
  const [history, setHistory] = useState([{ nodes: DEFAULT_TEMPLATE.nodes, edges: DEFAULT_TEMPLATE.edges }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Modals state
  const [showPresentation, setShowPresentation] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Ensure all user storage is wiped on startup and immediately when exiting/closing the website
  useEffect(() => {
    purgeAllUserDataAndStorage();

    const handleExitCleanup = () => {
      purgeAllUserDataAndStorage();
    };

    window.addEventListener('beforeunload', handleExitCleanup);
    window.addEventListener('pagehide', handleExitCleanup);
    window.addEventListener('unload', handleExitCleanup);

    return () => {
      window.removeEventListener('beforeunload', handleExitCleanup);
      window.removeEventListener('pagehide', handleExitCleanup);
      window.removeEventListener('unload', handleExitCleanup);
      purgeAllUserDataAndStorage();
    };
  }, []);

  // Save state snapshot into history stack
  const saveSnapshot = useCallback((newNodes, newEdges) => {
    setHistory(prev => {
      const sliced = prev.slice(Math.max(0, historyIndex - 39), historyIndex + 1);
      const next = [...sliced, { nodes: newNodes, edges: newEdges }];
      setHistoryIndex(next.length - 1);
      return next;
    });
  }, [historyIndex]);

  const handleCommitHistory = useCallback(() => {
    saveSnapshot(nodes, edges);
  }, [nodes, edges, saveSnapshot]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setNodes(prev.nodes);
      setEdges(prev.edges);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setNodes(next.nodes);
      setEdges(next.edges);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // Node Mutations with automatic box resizing when label, fontSize, or type changes
  const handleUpdateNode = useCallback((nodeId, updates, isAdd = false, skipHistory = false) => {
    setNodes(prevNodes => {
      let nextNodes;
      if (isAdd) {
        const layout = computeAutoNodeLayout(updates);
        nextNodes = [...prevNodes, { ...updates, width: layout.width, height: layout.height }];
      } else {
        nextNodes = prevNodes.map(n => {
          if (n.id !== nodeId) return n;
          const merged = { ...n, ...updates };
          const layout = computeAutoNodeLayout(merged);
          // Center-anchor horizontal adjustment if width grows/shrinks from text editing
          const dw = layout.width - n.width;
          const dh = layout.height - n.height;
          const shouldRecenter = ('label' in updates || 'fontSize' in updates || 'type' in updates) && !('x' in updates);
          return {
            ...merged,
            width: layout.width,
            height: layout.height,
            x: shouldRecenter ? Math.round(merged.x - dw / 2) : merged.x,
            y: shouldRecenter ? Math.round(merged.y - dh / 2) : merged.y
          };
        });
      }
      if (!skipHistory) {
        saveSnapshot(nextNodes, edges);
      }
      return nextNodes;
    });
  }, [edges, saveSnapshot]);

  const handleDeleteNode = useCallback((nodeId) => {
    const nextNodes = nodes.filter(n => n.id !== nodeId);
    const nextEdges = edges.filter(e => e.from !== nodeId && e.to !== nodeId);
    setNodes(nextNodes);
    setEdges(nextEdges);
    setSelectedNodeIds([]);
    saveSnapshot(nextNodes, nextEdges);
  }, [nodes, edges, saveSnapshot]);

  const handleDuplicateNode = useCallback((node) => {
    if (!node) return;
    const dup = {
      ...node,
      id: 'node_' + Date.now(),
      x: node.x + 36,
      y: node.y + 36,
      stepIndex: nodes.length + 1
    };
    const nextNodes = [...nodes, dup];
    setNodes(nextNodes);
    setSelectedNodeIds([dup.id]);
    saveSnapshot(nextNodes, edges);
  }, [nodes, edges, saveSnapshot]);

  // Edge Mutations
  const handleAddEdge = useCallback((newEdge) => {
    const exists = edges.some(e => e.from === newEdge.from && e.to === newEdge.to);
    if (exists) return;

    const nextEdges = [...edges, newEdge];
    setEdges(nextEdges);
    setSelectedEdgeId(newEdge.id);
    setSelectedNodeIds([]);
    saveSnapshot(nodes, nextEdges);
  }, [edges, nodes, saveSnapshot]);

  const handleUpdateEdge = useCallback((edgeId, updates) => {
    const nextEdges = edges.map(e => e.id === edgeId ? { ...e, ...updates } : e);
    setEdges(nextEdges);
    saveSnapshot(nodes, nextEdges);
  }, [edges, nodes, saveSnapshot]);

  const handleDeleteEdge = useCallback((edgeId) => {
    const nextEdges = edges.filter(e => e.id !== edgeId);
    setEdges(nextEdges);
    setSelectedEdgeId(null);
    saveSnapshot(nodes, nextEdges);
  }, [edges, nodes, saveSnapshot]);

  // Keyboard shortcuts (Delete, Undo, Redo, Duplicate)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        if (selectedNodeIds.length > 0) {
          e.preventDefault();
          const n = nodes.find(item => item.id === selectedNodeIds[0]);
          if (n) handleDuplicateNode(n);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeIds.length > 0) {
          e.preventDefault();
          handleDeleteNode(selectedNodeIds[0]);
        } else if (selectedEdgeId) {
          e.preventDefault();
          handleDeleteEdge(selectedEdgeId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeIds, selectedEdgeId, nodes, handleUndo, handleRedo, handleDeleteNode, handleDeleteEdge, handleDuplicateNode]);

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

  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Add node from Sidebar click
  const handleAddNodeFromSidebar = (shapeItem) => {
    const themeColors = theme.nodeColors[shapeItem.id] || theme.nodeColors.process;
    const offset = (nodes.length % 6) * 28;
    const baseNode = {
      id: 'node_' + Date.now(),
      type: shapeItem.id,
      label: shapeItem.name,
      x: Math.round((340 + offset - pan.x) / zoom),
      y: Math.round((190 + offset - pan.y) / zoom),
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
    const newNode = { ...baseNode, width: layout.width, height: layout.height };

    handleUpdateNode(newNode.id, newNode, true);
    setSelectedNodeIds([newNode.id]);
    setSelectedEdgeId(null);
  };

  // Load Template
  const handleLoadTemplate = (tpl) => {
    const fittedNodes = tpl.nodes.map(n => {
      const layout = computeAutoNodeLayout(n);
      return { ...n, width: layout.width, height: layout.height };
    });
    setNodes(fittedNodes);
    setEdges(tpl.edges);
    setSelectedNodeIds([]);
    setSelectedEdgeId(null);
    setPan({ x: 0, y: 0 });
    setZoom(1.0);
    saveSnapshot(fittedNodes, tpl.edges);
  };

  // Import JSON Project
  const handleImportJson = (projectData) => {
    const importedNodes = (projectData.nodes || []).map(n => {
      const layout = computeAutoNodeLayout(n);
      return { ...n, width: layout.width, height: layout.height };
    });
    const importedEdges = projectData.edges || [];
    setNodes(importedNodes);
    setEdges(importedEdges);
    if (projectData.theme) {
      const matchTheme = PRESENTATION_THEMES.find(t => t.id === projectData.theme);
      if (matchTheme) setTheme(matchTheme);
    }
    setSelectedNodeIds([]);
    setSelectedEdgeId(null);
    saveSnapshot(importedNodes, importedEdges);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeIds[0]);
  const selectedEdge = edges.find(e => e.id === selectedEdgeId);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f3ede0] overflow-hidden font-sans">
      {/* Header Toolbar */}
      <Toolbar
        theme={theme}
        setTheme={setTheme}
        zoom={zoom}
        setZoom={setZoom}
        onResetView={handleResetView}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onOpenTemplates={() => setShowTemplates(true)}
        onImportJson={handleImportJson}
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
          setZoom={setZoom}
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
          onCommitHistory={handleCommitHistory}
          activeConnectorStyle={activeConnectorStyle}
        />

        <Inspector
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onUpdateNode={handleUpdateNode}
          onUpdateEdge={handleUpdateEdge}
          onDeleteNode={handleDeleteNode}
          onDeleteEdge={handleDeleteEdge}
          onDuplicateNode={handleDuplicateNode}
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
