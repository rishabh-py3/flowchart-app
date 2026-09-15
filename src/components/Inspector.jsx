import React from 'react';
import {
  Sliders, Type, Paintbrush, Move, Hash, Trash2, ArrowRightLeft,
  CornerDownRight, GitCommit, ArrowRight
} from 'lucide-react';
import { SHAPE_TYPES } from '../utils/templates';

const COLOR_PRESETS = [
  { fill: '#1e293b', stroke: '#3b82f6', text: '#f8fafc', name: 'Navy Blue' },
  { fill: '#064e3b', stroke: '#34d399', text: '#f8fafc', name: 'Emerald' },
  { fill: '#312e81', stroke: '#818cf8', text: '#f8fafc', name: 'Indigo' },
  { fill: '#451a03', stroke: '#fb923c', text: '#f8fafc', name: 'Amber' },
  { fill: '#881337', stroke: '#f43f5e', text: '#ffe4e6', name: 'Crimson' },
  { fill: '#371b58', stroke: '#c084fc', text: '#f8fafc', name: 'Purple' },
  { fill: '#ffffff', stroke: '#2563eb', text: '#0f172a', name: 'Deck White' },
  { fill: '#fefce8', stroke: '#ca8a04', text: '#713f12', name: 'Sticky Yellow' }
];

export default function Inspector({
  selectedNode,
  selectedEdge,
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge
}) {
  if (!selectedNode && !selectedEdge) {
    return (
      <aside className="w-72 bg-slate-900 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center select-none z-20">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mb-3">
          <Sliders className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-medium text-slate-300">No Element Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-[180px]">
          Click any block or connector line to customize its presentation styling.
        </p>
      </aside>
    );
  }

  return (
    <aside className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col z-20 select-none overflow-y-auto">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          {selectedNode ? 'Node Inspector' : 'Connection Inspector'}
        </h2>
        <button
          onClick={() => selectedNode ? onDeleteNode(selectedNode.id) : onDeleteEdge(selectedEdge.id)}
          className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 transition"
          title="Delete element"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-5 text-xs text-slate-300">
        {/* NODE INSPECTOR */}
        {selectedNode && (
          <>
            {/* Label Input */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-400 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-blue-400" /> Block Text
              </label>
              <textarea
                value={selectedNode.label}
                onChange={(e) => onUpdateNode(selectedNode.id, { label: e.target.value })}
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Presentation Sequence Index */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-400 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-blue-400" /> Slide Presentation Step Order
              </label>
              <input
                type="number"
                min="1"
                value={selectedNode.stepIndex || 1}
                onChange={(e) => onUpdateNode(selectedNode.id, { stepIndex: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-blue-500"
              />
            </div>

            {/* Shape Selector */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-400">Shape Type</label>
              <select
                value={selectedNode.type}
                onChange={(e) => onUpdateNode(selectedNode.id, { type: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-blue-500 capitalize"
              >
                {SHAPE_TYPES.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Color Palette Presets */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-400 flex items-center gap-1.5">
                <Paintbrush className="w-3.5 h-3.5 text-blue-400" /> Color Preset
              </label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => onUpdateNode(selectedNode.id, { fill: p.fill, stroke: p.stroke, text: p.text })}
                    title={p.name}
                    className="h-7 rounded-lg border border-slate-700 flex items-center justify-center p-0.5 hover:scale-105 transition shadow-sm"
                    style={{ backgroundColor: p.fill }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.stroke }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Overrides */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Fill</span>
                <input
                  type="color"
                  value={selectedNode.fill || '#1e293b'}
                  onChange={(e) => onUpdateNode(selectedNode.id, { fill: e.target.value })}
                  className="w-full h-8 bg-transparent rounded cursor-pointer"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Border</span>
                <input
                  type="color"
                  value={selectedNode.stroke || '#3b82f6'}
                  onChange={(e) => onUpdateNode(selectedNode.id, { stroke: e.target.value })}
                  className="w-full h-8 bg-transparent rounded cursor-pointer"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Text Color</span>
                <input
                  type="color"
                  value={selectedNode.text || '#f8fafc'}
                  onChange={(e) => onUpdateNode(selectedNode.id, { text: e.target.value })}
                  className="w-full h-8 bg-transparent rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="font-semibold text-slate-400">Typography</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedNode.font || 'Inter'}
                  onChange={(e) => onUpdateNode(selectedNode.id, { font: e.target.value })}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none"
                >
                  <option value="Inter">Inter (Clean)</option>
                  <option value="Outfit">Outfit (Modern)</option>
                  <option value="Fira Code">Fira Code (Code)</option>
                  <option value="Playfair Display">Playfair (Serif)</option>
                </select>

                <select
                  value={selectedNode.fontSize || 14}
                  onChange={(e) => onUpdateNode(selectedNode.id, { fontSize: parseInt(e.target.value) })}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none"
                >
                  <option value={12}>12 px</option>
                  <option value={14}>14 px</option>
                  <option value={16}>16 px</option>
                  <option value={18}>18 px</option>
                </select>
              </div>
            </div>

            {/* Dimensions */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="font-semibold text-slate-400 flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-blue-400" /> Size (W × H)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={selectedNode.width}
                  onChange={(e) => onUpdateNode(selectedNode.id, { width: parseInt(e.target.value) || 100 })}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none"
                />
                <input
                  type="number"
                  value={selectedNode.height}
                  onChange={(e) => onUpdateNode(selectedNode.id, { height: parseInt(e.target.value) || 60 })}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none"
                />
              </div>
            </div>
          </>
        )}

        {/* EDGE INSPECTOR */}
        {selectedEdge && (
          <>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-400 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-blue-400" /> Connection Label
              </label>
              <input
                type="text"
                value={selectedEdge.label || ''}
                onChange={(e) => onUpdateEdge(selectedEdge.id, { label: e.target.value })}
                placeholder="e.g., Yes / Success / Next"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-400">Line Style</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  onClick={() => onUpdateEdge(selectedEdge.id, { style: 'orthogonal' })}
                  className={`p-2 rounded-lg flex flex-col items-center gap-1 ${
                    selectedEdge.style === 'orthogonal' ? 'bg-blue-600 text-white' : 'text-slate-400'
                  }`}
                >
                  <CornerDownRight className="w-4 h-4" />
                  <span>Step</span>
                </button>
                <button
                  onClick={() => onUpdateEdge(selectedEdge.id, { style: 'curved' })}
                  className={`p-2 rounded-lg flex flex-col items-center gap-1 ${
                    selectedEdge.style === 'curved' ? 'bg-blue-600 text-white' : 'text-slate-400'
                  }`}
                >
                  <GitCommit className="w-4 h-4" />
                  <span>Curve</span>
                </button>
                <button
                  onClick={() => onUpdateEdge(selectedEdge.id, { style: 'straight' })}
                  className={`p-2 rounded-lg flex flex-col items-center gap-1 ${
                    selectedEdge.style === 'straight' ? 'bg-blue-600 text-white' : 'text-slate-400'
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Line</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
