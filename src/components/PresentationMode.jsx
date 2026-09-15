import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play, RotateCcw, Sparkles } from 'lucide-react';
import { calculatePathData, getBestPortPair } from '../utils/geometry';

export default function PresentationMode({ nodes, edges, theme, onClose }) {
  // Sort nodes by stepIndex ascending
  const sortedNodes = [...nodes].sort((a, b) => (a.stepIndex || 1) - (b.stepIndex || 1));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentNode = sortedNodes[currentStepIndex];

  // Auto focus node bounds in center
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        if (currentStepIndex < sortedNodes.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIndex > 0) {
          setCurrentStepIndex(prev => prev - 1);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, sortedNodes.length, onClose]);

  if (!sortedNodes.length) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-6 select-none animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Play className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Slide Deck Presentation Mode
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                Step {currentStepIndex + 1} of {sortedNodes.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400">Use Left / Right Arrow keys to step through process flow</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Flow Presentation Stage */}
      <div className="relative flex-1 my-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden shadow-2xl flex items-center justify-center">
        <svg className="w-full h-full absolute inset-0">
          <defs>
            <marker
              id="pres-arrow"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
          </defs>

          {/* Render Connections up to current step */}
          <g>
            {edges.map(edge => {
              const sourceNode = nodes.find(n => n.id === edge.from);
              const targetNode = nodes.find(n => n.id === edge.to);
              if (!sourceNode || !targetNode) return null;

              const sourceStep = sourceNode.stepIndex || 1;
              const targetStep = targetNode.stepIndex || 1;
              const activeStep = currentNode?.stepIndex || 1;

              // Only highlight connection if it relates to steps up to current step
              const isPastOrActive = sourceStep <= activeStep && targetStep <= activeStep;

              const { fromPort, toPort } = getBestPortPair(sourceNode, targetNode);
              const pathInfo = calculatePathData(fromPort, toPort, edge.style || 'orthogonal');

              return (
                <g key={edge.id} className="transition-all duration-500">
                  <path
                    d={pathInfo.d}
                    fill="none"
                    stroke={isPastOrActive ? '#3b82f6' : '#334155'}
                    strokeWidth={isPastOrActive ? '3' : '1.5'}
                    strokeOpacity={isPastOrActive ? '1' : '0.2'}
                    markerEnd={isPastOrActive ? 'url(#pres-arrow)' : undefined}
                    className={isPastOrActive ? 'animate-flow' : ''}
                  />

                  {edge.label && isPastOrActive && (
                    <g transform={`translate(${pathInfo.midPoint.x}, ${pathInfo.midPoint.y})`}>
                      <rect
                        x={-(edge.label.length * 3.5 + 8)}
                        y="-10"
                        width={edge.label.length * 7 + 16}
                        height="20"
                        rx="4"
                        fill="#0f172a"
                        stroke="#3b82f6"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="11"
                        fontWeight="600"
                      >
                        {edge.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Render Nodes with spotlight effect on current step node */}
            {sortedNodes.map((node, index) => {
              const isActive = index === currentStepIndex;
              const isPassed = index < currentStepIndex;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="transition-all duration-500"
                  style={{
                    opacity: isActive ? 1 : isPassed ? 0.75 : 0.25,
                    transform: `translate(${node.x}px, ${node.y}px) scale(${isActive ? 1.08 : 1})`,
                    transformOrigin: `${node.x + node.width / 2}px ${node.y + node.height / 2}px`
                  }}
                >
                  {/* Spotlight pulse glow */}
                  {isActive && (
                    <rect
                      x="-8"
                      y="-8"
                      width={node.width + 16}
                      height={node.height + 16}
                      rx="16"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      className="animate-ping opacity-50"
                    />
                  )}

                  <rect
                    width={node.width}
                    height={node.height}
                    rx="12"
                    fill={node.fill || '#1e293b'}
                    stroke={isActive ? '#60a5fa' : (node.stroke || '#475569')}
                    strokeWidth={isActive ? '4' : '2'}
                    style={{ filter: isActive ? 'drop-shadow(0px 0px 20px rgba(59, 130, 246, 0.6))' : 'none' }}
                  />

                  <text
                    x={node.width / 2}
                    y={node.height / 2 + 4}
                    textAnchor="middle"
                    fill={node.text || '#ffffff'}
                    fontSize={node.fontSize || 14}
                    fontWeight={isActive ? 'bold' : '500'}
                  >
                    {node.label}
                  </text>

                  {/* Step Number Badge */}
                  <g transform={`translate(${node.width - 8}, -6)`}>
                    <circle r="11" fill={isActive ? '#2563eb' : '#334155'} stroke="#ffffff" strokeWidth="2" />
                    <text y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                      {node.stepIndex}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Bottom Controls Toolbar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-6 py-3 z-10 shadow-2xl">
        <button
          onClick={() => setCurrentStepIndex(0)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restart
        </button>

        {/* Step dots */}
        <div className="flex items-center gap-2">
          {sortedNodes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-2.5 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'w-8 bg-blue-500 shadow-md shadow-blue-500/50'
                  : 'w-2.5 bg-slate-700 hover:bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Next / Prev Step */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-medium text-white transition"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button
            onClick={() => setCurrentStepIndex(prev => Math.min(sortedNodes.length - 1, prev + 1))}
            disabled={currentStepIndex === sortedNodes.length - 1}
            className="flex items-center gap-1 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-xs font-semibold text-white transition shadow-lg shadow-blue-600/30"
          >
            Next Step <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
