import React from 'react';
import {
  Type, Paintbrush, Move, Hash, Trash2,
  CornerDownRight, GitCommit, ArrowRight, Settings, Copy, Sparkles
} from 'lucide-react';
import { SHAPE_TYPES } from '../utils/templates';

const COLOR_PRESETS = [
  { fill: '#cbd5b8', stroke: '#6d624d', text: '#2c251d', name: 'Sage Olive' },
  { fill: '#eadcc5', stroke: '#6d624d', text: '#2c251d', name: 'Warm Cream' },
  { fill: '#e3d2b4', stroke: '#6d624d', text: '#2c251d', name: 'Sand Gold' },
  { fill: '#e4be93', stroke: '#6d624d', text: '#2c251d', name: 'Ochre Amber' },
  { fill: '#dcab91', stroke: '#6d624d', text: '#2c251d', name: 'Terracotta' },
  { fill: '#dfc8b2', stroke: '#6d624d', text: '#2c251d', name: 'Muted Clay' },
  { fill: '#f2e5bd', stroke: '#8c7651', text: '#2c251d', name: 'Parchment Note' },
  { fill: '#c8d6df', stroke: '#5a6b78', text: '#202a30', name: 'Slate Mist' }
];

export default function Inspector({
  selectedNode,
  selectedEdge,
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge,
  onDuplicateNode,
  onClose
}) {
  return (
    <aside className="w-full md:w-[272px] bg-[#ede4d3] border-l border-[#d5c7ad] flex flex-col z-20 select-none overflow-y-auto">
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4a3e2e]">
          INSPECTOR
        </h2>
        <div className="flex items-center gap-1">
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-[#72634f] hover:bg-[#ded2bc] transition"
            >
              ✕
            </button>
          )}
            {selectedNode && onDuplicateNode && (
              <button
                onClick={() => onDuplicateNode(selectedNode)}
                className="p-1.5 rounded-lg text-[#5c4d3a] hover:bg-[#ded2bc] transition"
                title="Duplicate block (Ctrl+D)"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => selectedNode ? onDeleteNode(selectedNode.id) : onDeleteEdge(selectedEdge.id)}
              className="p-1.5 rounded-lg text-[#a14538] hover:bg-[#e5c8c2] transition"
              title="Delete selected item (Del)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Empty State matching reference design */}
      {!selectedNode && !selectedEdge ? (
        <div className="flex-1 px-6 flex flex-col items-center justify-center text-center">
          <p className="text-[13px] text-[#72634f] leading-relaxed max-w-[185px]">
            Select a block or connection to edit its properties.
          </p>
          <div className="flex items-center gap-3 mt-5 text-[#9c8b70]">
            <span className="w-8 h-[1px] bg-[#c5b69c] relative">
              <span className="w-1 h-1 rounded-full bg-[#b5a489] absolute -left-0.5 -top-[1.5px]" />
            </span>
            <Settings className="w-4 h-4 text-[#a39176]" />
            <span className="w-8 h-[1px] bg-[#c5b69c] relative">
              <span className="w-1 h-1 rounded-full bg-[#b5a489] absolute -right-0.5 -top-[1.5px]" />
            </span>
          </div>
        </div>
      ) : (
        <div className="px-5 pb-6 pt-2 space-y-5 text-xs text-[#3b3023]">
          {/* NODE INSPECTOR */}
          {selectedNode && (
            <>
              {/* Label Input */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[#5c4d3a] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-[#7c6143]" /> Block Text
                  </span>
                  <span className="text-[10px] font-normal text-[#87755d]">Auto-fits box</span>
                </label>
                <textarea
                  value={selectedNode.label}
                  onChange={(e) => onUpdateNode(selectedNode.id, { label: e.target.value })}
                  rows={3}
                  placeholder="Enter block text..."
                  className="w-full bg-[#f6f1e6] border border-[#cfc0a5] rounded-xl p-2.5 text-[#2c251d] outline-none focus:border-[#7c6143] resize-none leading-relaxed shadow-inner"
                />
              </div>

              {/* Presentation Sequence Index */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[#5c4d3a] flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#7c6143]" /> Step Badge Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={selectedNode.stepIndex || 1}
                  onChange={(e) => onUpdateNode(selectedNode.id, { stepIndex: parseInt(e.target.value) || 1 })}
                  className="w-full bg-[#f6f1e6] border border-[#cfc0a5] rounded-xl p-2 text-[#2c251d] outline-none focus:border-[#7c6143]"
                />
              </div>

              {/* Shape Selector */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[#5c4d3a]">Block Shape</label>
                <select
                  value={selectedNode.type}
                  onChange={(e) => onUpdateNode(selectedNode.id, { type: e.target.value })}
                  className="w-full bg-[#f6f1e6] border border-[#cfc0a5] rounded-xl p-2 text-[#2c251d] outline-none focus:border-[#7c6143]"
                >
                  {SHAPE_TYPES.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Color Palette Presets */}
              <div className="space-y-2">
                <label className="font-semibold text-[#5c4d3a] flex items-center gap-1.5">
                  <Paintbrush className="w-3.5 h-3.5 text-[#7c6143]" /> Studio Palette
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => onUpdateNode(selectedNode.id, { fill: p.fill, stroke: p.stroke, text: p.text })}
                      title={p.name}
                      className="h-7 rounded-lg border border-[#b5a489] flex items-center justify-center p-0.5 hover:scale-105 transition shadow-sm"
                      style={{ backgroundColor: p.fill }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.stroke }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Overrides */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#d8cbb3]">
                <div>
                  <span className="text-[10px] text-[#72634f] block mb-1">Fill</span>
                  <input
                    type="color"
                    value={selectedNode.fill || '#eadcc5'}
                    onChange={(e) => onUpdateNode(selectedNode.id, { fill: e.target.value })}
                    className="w-full h-7 bg-transparent rounded cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[#72634f] block mb-1">Border</span>
                  <input
                    type="color"
                    value={selectedNode.stroke || '#6d624d'}
                    onChange={(e) => onUpdateNode(selectedNode.id, { stroke: e.target.value })}
                    className="w-full h-7 bg-transparent rounded cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[#72634f] block mb-1">Text</span>
                  <input
                    type="color"
                    value={selectedNode.text || '#2c251d'}
                    onChange={(e) => onUpdateNode(selectedNode.id, { text: e.target.value })}
                    className="w-full h-7 bg-transparent rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-2 pt-3 border-t border-[#d8cbb3]">
                <label className="font-semibold text-[#5c4d3a]">Typography</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedNode.font || 'Inter'}
                    onChange={(e) => onUpdateNode(selectedNode.id, { font: e.target.value })}
                    className="bg-[#f6f1e6] border border-[#cfc0a5] rounded-xl p-2 text-[#2c251d] outline-none"
                  >
                    <option value="Inter">Inter (Sans)</option>
                    <option value="Playfair Display">Playfair (Serif)</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Fira Code">Fira Code</option>
                  </select>

                  <select
                    value={selectedNode.fontSize || 13}
                    onChange={(e) => onUpdateNode(selectedNode.id, { fontSize: parseInt(e.target.value) })}
                    className="bg-[#f6f1e6] border border-[#cfc0a5] rounded-xl p-2 text-[#2c251d] outline-none"
                  >
                    <option value={12}>12 px</option>
                    <option value={13}>13 px</option>
                    <option value={14}>14 px</option>
                    <option value={16}>16 px</option>
                    <option value={18}>18 px</option>
                  </select>
                </div>
              </div>

              {/* Dimensions with Auto-Size Reset */}
              <div className="space-y-1.5 pt-3 border-t border-[#d8cbb3]">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#5c4d3a] flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-[#7c6143]" /> Box Size (W × H)
                  </label>
                  <button
                    onClick={() => onUpdateNode(selectedNode.id, { manualMinWidth: 0, manualMinHeight: 0, label: selectedNode.label })}
                    className="text-[10px] text-[#7c6143] hover:underline flex items-center gap-0.5 font-medium"
                    title="Auto-fit box tightly to text"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-fit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={Math.round(selectedNode.width)}
                    onChange={(e) => {
                      const val = Math.max(90, parseInt(e.target.value) || 120);
                      onUpdateNode(selectedNode.id, { width: val, manualMinWidth: val });
                    }}
                    className="bg-[#f6f1e6] border border-[#cfc0a5] rounded-xl p-2 text-[#2c251d] outline-none"
                  />
                  <input
                    type="number"
                    value={Math.round(selectedNode.height)}
                    onChange={(e) => {
                      const val = Math.max(50, parseInt(e.target.value) || 70);
                      onUpdateNode(selectedNode.id, { height: val, manualMinHeight: val });
                    }}
                    className="bg-[#f6f1e6] border border-[#cfc0a5] rounded-xl p-2 text-[#2c251d] outline-none"
                  />
                </div>
              </div>

              <button
                onClick={() => onDeleteNode(selectedNode.id)}
                className="w-full py-2 mt-2 rounded-xl bg-[#a14538]/15 hover:bg-[#a14538]/25 text-[#8f3529] font-semibold transition flex items-center justify-center gap-1.5 border border-[#a14538]/30"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Block
              </button>
            </>
          )}

          {/* EDGE INSPECTOR */}
          {selectedEdge && (
            <>
              <div className="space-y-1.5">
                <label className="font-semibold text-[#5c4d3a] flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-[#7c6143]" /> Connection Label
                </label>
                <input
                  type="text"
                  value={selectedEdge.label || ''}
                  onChange={(e) => onUpdateEdge(selectedEdge.id, { label: e.target.value })}
                  placeholder="e.g., Submit / Yes / No"
                  className="w-full bg-[#f6f1e6] border border-[#cfc0a5] rounded-xl p-2.5 text-[#2c251d] outline-none focus:border-[#7c6143]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#5c4d3a]">Flow Line Style</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#e3d8c3] rounded-xl border border-[#cfc0a5]">
                  <button
                    onClick={() => onUpdateEdge(selectedEdge.id, { style: 'orthogonal' })}
                    className={`p-2 rounded-lg flex flex-col items-center gap-1 transition ${
                      (selectedEdge.style || 'orthogonal') === 'orthogonal'
                        ? 'bg-[#7c6143] text-[#fdfaf3] shadow-sm'
                        : 'text-[#5c4d3a] hover:bg-[#d8cbb3]/60'
                    }`}
                  >
                    <CornerDownRight className="w-4 h-4" />
                    <span>Step</span>
                  </button>
                  <button
                    onClick={() => onUpdateEdge(selectedEdge.id, { style: 'curved' })}
                    className={`p-2 rounded-lg flex flex-col items-center gap-1 transition ${
                      selectedEdge.style === 'curved'
                        ? 'bg-[#7c6143] text-[#fdfaf3] shadow-sm'
                        : 'text-[#5c4d3a] hover:bg-[#d8cbb3]/60'
                    }`}
                  >
                    <GitCommit className="w-4 h-4" />
                    <span>Curve</span>
                  </button>
                  <button
                    onClick={() => onUpdateEdge(selectedEdge.id, { style: 'straight' })}
                    className={`p-2 rounded-lg flex flex-col items-center gap-1 transition ${
                      selectedEdge.style === 'straight'
                        ? 'bg-[#7c6143] text-[#fdfaf3] shadow-sm'
                        : 'text-[#5c4d3a] hover:bg-[#d8cbb3]/60'
                    }`}
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Direct</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#d8cbb3]">
                <label className="font-semibold text-[#5c4d3a]">Anchor Ports</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#72634f] block mb-1">From Side</span>
                    <select
                      value={selectedEdge.fromPort || 'auto'}
                      onChange={(e) => onUpdateEdge(selectedEdge.id, { fromPort: e.target.value === 'auto' ? null : e.target.value })}
                      className="w-full bg-[#f6f1e6] border border-[#cfc0a5] rounded-xl p-2 text-[#2c251d] outline-none"
                    >
                      <option value="auto">Auto</option>
                      <option value="top">Top</option>
                      <option value="right">Right</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#72634f] block mb-1">To Side</span>
                    <select
                      value={selectedEdge.toPort || 'auto'}
                      onChange={(e) => onUpdateEdge(selectedEdge.id, { toPort: e.target.value === 'auto' ? null : e.target.value })}
                      className="w-full bg-[#f6f1e6] border border-[#cfc0a5] rounded-xl p-2 text-[#2c251d] outline-none"
                    >
                      <option value="auto">Auto</option>
                      <option value="top">Top</option>
                      <option value="right">Right</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDeleteEdge(selectedEdge.id)}
                className="w-full py-2 mt-3 rounded-xl bg-[#a14538]/15 hover:bg-[#a14538]/25 text-[#8f3529] font-semibold transition flex items-center justify-center gap-1.5 border border-[#a14538]/30"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Connection
              </button>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
