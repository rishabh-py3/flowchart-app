import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play, RotateCcw } from 'lucide-react';
import { calculatePathData, getBestPortPair, computeAutoNodeLayout } from '../utils/geometry';
import { renderNodeSvgShape } from './Canvas';

export default function PresentationMode({ nodes, edges, theme, onClose }) {
  // Compute auto-sized nodes and sort by stepIndex ascending
  const sizedNodesMap = {};
  const sizedNodes = nodes.map(n => {
    const layout = computeAutoNodeLayout(n);
    const sn = { ...n, width: layout.width, height: layout.height, _lines: layout.lines, _lineHeight: layout.lineHeight };
    sizedNodesMap[n.id] = sn;
    return sn;
  });

  const sortedNodes = [...sizedNodes].sort((a, b) => (a.stepIndex || 1) - (b.stepIndex || 1));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentNode = sortedNodes[currentStepIndex];

  // Calculate bounding box of entire flowchart to center nicely on stage
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  sizedNodes.forEach(n => {
    minX = Math.min(minX, n.x - 60);
    minY = Math.min(minY, n.y - 60);
    maxX = Math.max(maxX, n.x + n.width + 60);
    maxY = Math.max(maxY, n.y + n.height + 60);
  });
  if (sizedNodes.length === 0) {
    minX = 0; minY = 0; maxX = 1000; maxY = 600;
  }
  const vbWidth = Math.max(600, maxX - minX);
  const vbHeight = Math.max(400, maxY - minY);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentStepIndex(prev => Math.min(sortedNodes.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentStepIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sortedNodes.length, onClose]);

  if (!sortedNodes.length) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#231d16]/95 backdrop-blur-md flex flex-col justify-between p-6 select-none animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#7c6143] text-[#fdfaf3] flex items-center justify-center shadow">
            <Play className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#f6efe0] flex items-center gap-2.5">
              <span>FlowCanvas Presentation Walkthrough</span>
              <span className="text-[11px] font-mono bg-[#3a3024] text-[#e6dcc8] px-2.5 py-0.5 rounded-full border border-[#574938]">
                Step {currentStepIndex + 1} of {sortedNodes.length}
              </span>
            </h2>
            <p className="text-xs text-[#b5a489]">Use Left / Right Arrow keys or Spacebar to step through the workflow</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-[#3a3024] hover:bg-[#4d4030] text-[#e6dcc8] hover:text-white transition border border-[#574938]"
          title="Exit Presentation (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Flow Presentation Stage */}
      <div className={`relative flex-1 my-5 rounded-2xl border border-[#cfc0a5] overflow-hidden shadow-2xl flex items-center justify-center ${theme.canvasBgClass}`}>
        <svg
          className="w-full h-full"
          viewBox={`${minX} ${minY} ${vbWidth} ${vbHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker
              id="pres-arrow-active"
              markerWidth="9"
              markerHeight="7"
              refX="8"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0.5, 8.5 3.5, 0 6.5" fill="#7c6143" />
            </marker>
            <marker
              id="pres-arrow-dim"
              markerWidth="9"
              markerHeight="7"
              refX="8"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0.5, 8.5 3.5, 0 6.5" fill="#a89982" />
            </marker>
          </defs>

          <g>
            {edges.map(edge => {
              const sourceNode = sizedNodesMap[edge.from];
              const targetNode = sizedNodesMap[edge.to];
              if (!sourceNode || !targetNode) return null;

              const sourceStep = sourceNode.stepIndex || 1;
              const targetStep = targetNode.stepIndex || 1;
              const activeStep = currentNode?.stepIndex || 1;

              const isPastOrActive = sourceStep <= activeStep && targetStep <= activeStep;
              const { fromPort, toPort } = getBestPortPair(sourceNode, targetNode, edge);
              const pathInfo = calculatePathData(fromPort, toPort, edge.style || 'orthogonal');

              return (
                <g key={edge.id} className="transition-all duration-500">
                  <path
                    d={pathInfo.d}
                    fill="none"
                    stroke={isPastOrActive ? '#7c6143' : '#a89982'}
                    strokeWidth={isPastOrActive ? '2.5' : '1.4'}
                    strokeOpacity={isPastOrActive ? '1' : '0.35'}
                    markerEnd={isPastOrActive ? 'url(#pres-arrow-active)' : 'url(#pres-arrow-dim)'}
                    className={isPastOrActive ? 'animate-flow' : ''}
                  />

                  {edge.label && isPastOrActive && (
                    <g transform={`translate(${pathInfo.midPoint.x}, ${pathInfo.midPoint.y - 10})`}>
                      <rect
                        x={-(edge.label.length * 3.5 + 8)}
                        y="-10"
                        width={edge.label.length * 7 + 16}
                        height="20"
                        rx="4"
                        fill="#fdfaf3"
                        stroke="#7c6143"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fill="#3b3023"
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

            {sortedNodes.map((node, index) => {
              const isActive = index === currentStepIndex;
              const isPassed = index < currentStepIndex;
              const lines = node._lines || [node.label];
              const lineHeight = node._lineHeight || 18;
              const fontSize = node.fontSize || 13;
              const totalTextHeight = lines.length * lineHeight;
              const startTextY = (node.height - totalTextHeight) / 2 + fontSize * 0.82 + (node.type === 'database' ? 6 : 0) - (node.type === 'document' ? 4 : 0);

              const badgeX = node.type === 'decision'
                ? node.width / 2
                : node.type === 'input'
                  ? node.width - 10
                  : node.width - 6;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setCurrentStepIndex(index)}
                  className="cursor-pointer transition-opacity duration-300"
                  style={{ opacity: isActive ? 1 : isPassed ? 0.85 : 0.3 }}
                >
                  {renderNodeSvgShape(node, isActive, theme)}

                  <text
                    x={node.width / 2}
                    textAnchor="middle"
                    fill={node.text || '#2c251d'}
                    fontSize={fontSize}
                    fontWeight={isActive ? '600' : '500'}
                    fontFamily={node.font || 'Inter'}
                  >
                    {lines.map((line, i) => (
                      <tspan key={i} x={node.width / 2} y={startTextY + i * lineHeight}>
                        {line}
                      </tspan>
                    ))}
                  </text>

                  {/* Step Number Badge */}
                  <g transform={`translate(${badgeX}, -4)`}>
                    <circle
                      r="12"
                      fill={isActive ? '#7c6143' : '#f6efe0'}
                      stroke="#6d5d47"
                      strokeWidth="1.5"
                    />
                    <text
                      y="4"
                      textAnchor="middle"
                      fill={isActive ? '#fdfaf3' : '#3b3023'}
                      fontSize="11"
                      fontWeight="bold"
                    >
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
      <div className="flex items-center justify-between bg-[#efe7d6] border border-[#cfc0a5] rounded-2xl px-6 py-3 z-10 shadow-xl text-[#3b3023]">
        <button
          onClick={() => setCurrentStepIndex(0)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#e3d8c3] hover:bg-[#d8cbb3] text-xs font-medium transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restart
        </button>

        {/* Step dots */}
        <div className="flex items-center gap-2">
          {sortedNodes.map((n, idx) => (
            <button
              key={n.id}
              onClick={() => setCurrentStepIndex(idx)}
              title={`Step ${n.stepIndex}: ${n.label}`}
              className={`h-2.5 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'w-8 bg-[#7c6143]'
                  : 'w-2.5 bg-[#cbbba0] hover:bg-[#a89678]'
              }`}
            />
          ))}
        </div>

        {/* Next / Prev Step */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#e3d8c3] hover:bg-[#d8cbb3] disabled:opacity-40 text-xs font-medium transition"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button
            onClick={() => setCurrentStepIndex(prev => Math.min(sortedNodes.length - 1, prev + 1))}
            disabled={currentStepIndex === sortedNodes.length - 1}
            className="flex items-center gap-1 px-5 py-2 rounded-xl bg-[#7c6143] hover:bg-[#695136] disabled:opacity-40 text-xs font-semibold text-[#fdfaf3] transition shadow-sm"
          >
            Next Step <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
