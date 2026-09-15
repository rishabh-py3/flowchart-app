import React from 'react';
import {
  Play, Download, Undo2, Redo2, ZoomIn, ZoomOut, Maximize2,
  Palette, LayoutGrid, Trash2, Sparkles, FolderOpen, Share2, Eye
} from 'lucide-react';
import { PRESENTATION_THEMES } from '../utils/templates';

export default function Toolbar({
  theme,
  setTheme,
  zoom,
  setZoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onOpenTemplates,
  onStartPresentation,
  onOpenExport,
  nodeCount,
  edgeCount
}) {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Brand & Template Trigger */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-base leading-tight tracking-tight flex items-center gap-2">
              FlowCanvas Studio
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                Deck Edition
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Presentation Flowchart Builder</p>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-800 mx-2" />

        <button
          onClick={onOpenTemplates}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
        >
          <FolderOpen className="w-4 h-4 text-blue-400" />
          Templates & Presets
        </button>
      </div>

      {/* Center: Canvas Controls & Actions */}
      <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-slate-700 mx-1" />

        <button
          onClick={() => setZoom(Math.max(0.4, zoom - 0.1))}
          title="Zoom Out"
          className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono font-medium text-slate-300 w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(Math.min(2.0, zoom + 0.1))}
          title="Zoom In"
          className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => setZoom(1.0)}
          title="Reset Zoom (100%)"
          className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition text-xs font-medium"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-slate-700 mx-1" />

        {/* Theme Selector */}
        <div className="flex items-center gap-1.5 px-2">
          <Palette className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={theme.id}
            onChange={(e) => {
              const selected = PRESENTATION_THEMES.find(t => t.id === e.target.value);
              if (selected) setTheme(selected);
            }}
            className="bg-transparent text-xs font-medium text-slate-200 outline-none cursor-pointer"
          >
            {PRESENTATION_THEMES.map(t => (
              <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="h-4 w-[1px] bg-slate-700 mx-1" />

        <button
          onClick={onClear}
          title="Clear Canvas"
          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Presentation & Export Actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onStartPresentation}
          disabled={nodeCount === 0}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-medium text-xs shadow-md shadow-emerald-600/20 transition"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Present Flow
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/30 transition"
        >
          <Download className="w-4 h-4" />
          Export for Deck
        </button>
      </div>
    </header>
  );
}
