import React from 'react';
import { CornerDownRight, GitCommit, ArrowRight } from 'lucide-react';
import { SHAPE_TYPES } from '../utils/templates';

function ShapeMiniature({ id }) {
  const stroke = '#736049';
  const fill = 'rgba(229, 217, 195, 0.5)';

  if (id === 'terminal') {
    return (
      <svg className="w-8 h-8" viewBox="0 0 36 36">
        <rect x="4" y="6" width="28" height="24" rx="4" fill={fill} stroke={stroke} strokeWidth="1.4" />
        <text x="18" y="22" textAnchor="middle" fill="#433627" fontSize="11" fontWeight="600">S</text>
      </svg>
    );
  }
  if (id === 'process') {
    return (
      <svg className="w-8 h-8" viewBox="0 0 36 36">
        <rect x="4" y="6" width="28" height="24" rx="3" fill={fill} stroke={stroke} strokeWidth="1.4" />
        <text x="18" y="22" textAnchor="middle" fill="#433627" fontSize="11" fontWeight="600">P</text>
      </svg>
    );
  }
  if (id === 'decision') {
    return (
      <svg className="w-8 h-8" viewBox="0 0 36 36">
        <polygon points="18,3 33,18 18,33 3,18" fill={fill} stroke={stroke} strokeWidth="1.4" />
        <text x="18" y="22" textAnchor="middle" fill="#433627" fontSize="10.5" fontWeight="600">D</text>
      </svg>
    );
  }
  if (id === 'database') {
    return (
      <svg className="w-8 h-8" viewBox="0 0 36 36">
        <path d="M 6 10 v 16 a 12 4.5 0 0 0 24 0 v -16" fill={fill} stroke={stroke} strokeWidth="1.4" />
        <ellipse cx="18" cy="10" rx="12" ry="4.5" fill={fill} stroke={stroke} strokeWidth="1.4" />
      </svg>
    );
  }
  if (id === 'document') {
    return (
      <svg className="w-8 h-8" viewBox="0 0 36 36">
        <path d="M 5 6 H 31 V 26 Q 24.5 31 18 26.5 T 5 26 Z" fill={fill} stroke={stroke} strokeWidth="1.4" />
        <text x="18" y="20" textAnchor="middle" fill="#433627" fontSize="10" fontWeight="600">D</text>
      </svg>
    );
  }
  if (id === 'input') {
    return (
      <svg className="w-8 h-8" viewBox="0 0 36 36">
        <polygon points="10,7 32,7 26,29 4,29" fill={fill} stroke={stroke} strokeWidth="1.4" />
      </svg>
    );
  }
  // Sticky Note
  return (
    <svg className="w-8 h-8" viewBox="0 0 36 36">
      <rect x="5" y="5" width="26" height="26" rx="3" fill={fill} stroke={stroke} strokeWidth="1.4" />
      <path d="M 24 31 L 31 24 L 24 24 Z" fill="rgba(115, 96, 73, 0.35)" />
    </svg>
  );
}

export default function Sidebar({ onAddNode, activeConnectorStyle, setActiveConnectorStyle, onClose }) {
  const handleDragStart = (e, shapeItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(shapeItem));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside className="w-full md:w-[248px] bg-[#ede4d3] border-r border-[#d5c7ad] flex flex-col z-20 select-none">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4a3e2e]">
          FLOW SHAPES
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-lg text-[#72634f] hover:bg-[#d8cbb3] transition"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2.5">
        {SHAPE_TYPES.map((shape) => (
          <div
            key={shape.id}
            draggable
            onDragStart={(e) => handleDragStart(e, shape)}
            onClick={() => onAddNode(shape)}
            title={`Click or drag to add ${shape.name}`}
            className="group flex items-center gap-3.5 px-3.5 py-3 rounded-xl bg-[#f3ecde]/80 hover:bg-[#f8f3e8] border border-[#d6c8b0] hover:border-[#9e8462] cursor-grab active:cursor-grabbing transition-all shadow-[0_1px_2px_rgba(74,60,44,0.04)] hover:shadow-md"
          >
            <div className="flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShapeMiniature id={shape.id} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-[#3b3023] group-hover:text-[#221b13] truncate">
                {shape.name}
              </div>
            </div>
          </div>
        ))}

        {/* Default Connector Style Picker */}
        <div className="pt-4 mt-4 border-t border-[#d8cbb3]">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6d5d47] mb-2 px-1">
            Default Flow Line
          </h3>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#e3d8c3] rounded-xl border border-[#cfc0a5]">
            <button
              onClick={() => setActiveConnectorStyle('orthogonal')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-medium flex flex-col items-center gap-0.5 transition ${
                activeConnectorStyle === 'orthogonal'
                  ? 'bg-[#7c6143] text-[#fdfaf3] shadow-sm'
                  : 'text-[#5c4d3a] hover:bg-[#d8cbb3]/60'
              }`}
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              <span>Step</span>
            </button>
            <button
              onClick={() => setActiveConnectorStyle('curved')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-medium flex flex-col items-center gap-0.5 transition ${
                activeConnectorStyle === 'curved'
                  ? 'bg-[#7c6143] text-[#fdfaf3] shadow-sm'
                  : 'text-[#5c4d3a] hover:bg-[#d8cbb3]/60'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Curve</span>
            </button>
            <button
              onClick={() => setActiveConnectorStyle('straight')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-medium flex flex-col items-center gap-0.5 transition ${
                activeConnectorStyle === 'straight'
                  ? 'bg-[#7c6143] text-[#fdfaf3] shadow-sm'
                  : 'text-[#5c4d3a] hover:bg-[#d8cbb3]/60'
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Direct</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
