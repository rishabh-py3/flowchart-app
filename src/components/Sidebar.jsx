import React from 'react';
import {
  CircleDot, Square, Diamond, Database, FileText, MoveHorizontal,
  StickyNote, Layers, HelpCircle, ArrowRight, CornerDownRight, GitCommit
} from 'lucide-react';
import { SHAPE_TYPES } from '../utils/templates';

const ICON_MAP = {
  CircleDot,
  Square,
  Diamond,
  Database,
  FileText,
  MoveHorizontal,
  StickyNote
};

export default function Sidebar({ onAddNode, activeConnectorStyle, setActiveConnectorStyle }) {
  const handleDragStart = (e, shapeItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(shapeItem));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20 select-none">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          Flow Shapes Library
        </h2>
        <p className="text-[11px] text-slate-500 mt-1">Drag or click shapes into your presentation canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {SHAPE_TYPES.map((shape) => {
          const IconComp = ICON_MAP[shape.icon] || Square;
          return (
            <div
              key={shape.id}
              draggable
              onDragStart={(e) => handleDragStart(e, shape)}
              onClick={() => onAddNode(shape)}
              className="group flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 cursor-grab active:cursor-grabbing transition shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-transform">
                <IconComp className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                  {shape.name}
                </div>
                <div className="text-[10px] text-slate-500 capitalize truncate">
                  {shape.shape} block
                </div>
              </div>
            </div>
          );
        })}

        <div className="pt-4 border-t border-slate-800 mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Connector Line Style
          </h3>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveConnectorStyle('orthogonal')}
              className={`p-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition ${
                activeConnectorStyle === 'orthogonal'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <CornerDownRight className="w-4 h-4" />
              <span>Step</span>
            </button>
            <button
              onClick={() => setActiveConnectorStyle('curved')}
              className={`p-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition ${
                activeConnectorStyle === 'curved'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <GitCommit className="w-4 h-4" />
              <span>Curve</span>
            </button>
            <button
              onClick={() => setActiveConnectorStyle('straight')}
              className={`p-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition ${
                activeConnectorStyle === 'straight'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
              <span>Line</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pro Tips Footer */}
      <div className="p-3 m-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-[11px] text-slate-400 space-y-1.5">
        <div className="font-semibold text-slate-300 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Quick Tips
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-400 leading-tight">
          <li>Hover node dot & drag to connect</li>
          <li>Double-click text to quick edit</li>
          <li>Drag background to pan view</li>
        </ul>
      </div>
    </aside>
  );
}
