import React, { useState } from 'react';
import { X, Download, Copy, FileCode, Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import { calculatePathData, getBestPortPair, computeAutoNodeLayout } from '../utils/geometry';

export default function ExportModal({ nodes, edges, theme, onClose }) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Generate faithful SVG string representation of canvas (with all shapes, arrows, and wrapped text)
  const generateSvgString = () => {
    const sizedNodesMap = {};
    const sizedNodes = nodes.map(n => {
      const layout = computeAutoNodeLayout(n);
      const sn = { ...n, width: layout.width, height: layout.height, _lines: layout.lines, _lineHeight: layout.lineHeight };
      sizedNodesMap[n.id] = sn;
      return sn;
    });

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    sizedNodes.forEach(n => {
      minX = Math.min(minX, n.x - 50);
      minY = Math.min(minY, n.y - 50);
      maxX = Math.max(maxX, n.x + n.width + 50);
      maxY = Math.max(maxY, n.y + n.height + 50);
    });

    if (sizedNodes.length === 0) {
      minX = 0; minY = 0; maxX = 800; maxY = 500;
    }

    const width = Math.max(400, maxX - minX);
    const height = Math.max(300, maxY - minY);
    const edgeColor = theme.edgeStroke || '#736049';

    const escapeXml = (str) =>
      String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    let svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">`;
    svgStr += `<defs>
      <marker id="exp-arrow" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
        <polygon points="0 0.5, 8.5 3.5, 0 6.5" fill="${edgeColor}" />
      </marker>
    </defs>`;
    svgStr += `<rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="${theme.bgColor || '#f3ede0'}"/>`;

    // Connections
    edges.forEach(e => {
      const sn = sizedNodesMap[e.from];
      const tn = sizedNodesMap[e.to];
      if (!sn || !tn) return;
      const { fromPort, toPort } = getBestPortPair(sn, tn, e);
      const pathInfo = calculatePathData(fromPort, toPort, e.style || 'orthogonal');
      svgStr += `<path d="${pathInfo.d}" fill="none" stroke="${e.stroke || edgeColor}" stroke-width="1.8" marker-end="url(#exp-arrow)" />`;
      if (e.label) {
        const isMostlyHoriz = Math.abs(toPort.x - fromPort.x) >= Math.abs(toPort.y - fromPort.y);
        const lx = pathInfo.midPoint.x + (isMostlyHoriz ? 0 : 18);
        const ly = pathInfo.midPoint.y + (isMostlyHoriz ? -12 : 0);
        svgStr += `<text x="${lx}" y="${ly}" fill="${theme.textDark ? '#3b3023' : '#f8fafc'}" font-size="12" font-family="Inter, sans-serif" font-weight="500" text-anchor="middle">${escapeXml(e.label)}</text>`;
      }
    });

    // Nodes
    sizedNodes.forEach(n => {
      const { x, y, width: nw, height: nh, type, fill, stroke } = n;
      const st = stroke || '#6d624d';
      svgStr += `<g transform="translate(${x}, ${y})">`;

      if (type === 'decision' || type === 'diamond') {
        svgStr += `<polygon points="${nw / 2},0 ${nw},${nh / 2} ${nw / 2},${nh} 0,${nh / 2}" fill="${fill}" stroke="${st}" stroke-width="1.5" />`;
      } else if (type === 'database' || type === 'cylinder') {
        const rx = nw / 2;
        const ry = 10;
        svgStr += `<path d="M 0 ${ry} v ${nh - 2 * ry} a ${rx} ${ry} 0 0 0 ${nw} 0 v -${nh - 2 * ry}" fill="${fill}" stroke="${st}" stroke-width="1.5" />`;
        svgStr += `<ellipse cx="${rx}" cy="${ry}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${st}" stroke-width="1.5" />`;
      } else if (type === 'document') {
        svgStr += `<path d="M 0 0 H ${nw} V ${nh - 11} Q ${nw * 0.75} ${nh + 2} ${nw * 0.5} ${nh - 9} T 0 ${nh - 11} Z" fill="${fill}" stroke="${st}" stroke-width="1.5" />`;
      } else if (type === 'input' || type === 'parallelogram') {
        const skew = Math.min(20, nw * 0.15);
        svgStr += `<polygon points="${skew},0 ${nw},0 ${nw - skew},${nh} 0,${nh}" fill="${fill}" stroke="${st}" stroke-width="1.5" />`;
      } else {
        svgStr += `<rect width="${nw}" height="${nh}" rx="9" fill="${fill}" stroke="${st}" stroke-width="1.5"/>`;
      }

      const lines = n._lines || [n.label];
      const lineHeight = n._lineHeight || 18;
      const fontSize = n.fontSize || 13;
      const totalTextHeight = lines.length * lineHeight;
      const startTextY = (nh - totalTextHeight) / 2 + fontSize * 0.82 + (type === 'database' ? 6 : 0) - (type === 'document' ? 4 : 0);

      svgStr += `<text x="${nw / 2}" fill="${n.text || '#2c251d'}" font-size="${fontSize}" font-family="Inter, sans-serif" text-anchor="middle" font-weight="500">`;
      lines.forEach((line, i) => {
        svgStr += `<tspan x="${nw / 2}" y="${startTextY + i * lineHeight}">${escapeXml(line)}</tspan>`;
      });
      svgStr += `</text>`;

      if (n.stepIndex) {
        const bx = type === 'decision' ? nw / 2 : type === 'input' ? nw - 10 : nw - 6;
        svgStr += `<g transform="translate(${bx}, -4)">
          <circle r="11.5" fill="#f6efe0" stroke="#7a6852" stroke-width="1.2"/>
          <text y="3.8" text-anchor="middle" fill="#3b3023" font-size="11" font-family="Inter, sans-serif" font-weight="600">${n.stepIndex}</text>
        </g>`;
      }

      svgStr += `</g>`;
    });

    svgStr += `</svg>`;
    return { svgStr, width, height };
  };

  // Export as PNG
  const handleExportPng = () => {
    setExporting(true);
    const { svgStr, width, height } = generateSvgString();
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);

      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `flowcanvas-${Date.now()}.png`;
      link.href = pngUrl;
      link.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    };
    img.src = url;
  };

  // Export as SVG
  const handleExportSvg = () => {
    const { svgStr } = generateSvgString();
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `flowcanvas-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy PNG image to clipboard
  const handleCopyToClipboard = async () => {
    setExporting(true);
    const { svgStr, width, height } = generateSvgString();
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(async (pngBlob) => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': pngBlob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch (err) {
          console.error('Clipboard write failed', err);
          alert('Copy failed: Your browser permissions may require downloading the PNG directly.');
        } finally {
          URL.revokeObjectURL(url);
          setExporting(false);
        }
      }, 'image/png');
    };
    img.src = url;
  };

  // Save JSON local project
  const handleSaveJson = () => {
    const projectData = {
      version: '1.0',
      theme: theme.id,
      nodes,
      edges
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `flowcanvas-project-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2c251d]/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#f5efe2] border border-[#cfc0a5] rounded-2xl shadow-2xl p-6 relative text-[#2c251d]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#72634f] hover:text-[#2c251d] hover:bg-[#e5dac5] transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#7c6143]/15 text-[#7c6143] flex items-center justify-center border border-[#7c6143]/30">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2c251d]">Export Flowchart</h2>
            <p className="text-xs text-[#72634f]">High-resolution export for slides, documents, or backup</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {/* Copy to Clipboard */}
          <button
            onClick={handleCopyToClipboard}
            disabled={exporting}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#7c6143] hover:bg-[#695136] text-[#fdfaf3] font-semibold text-xs transition shadow-md"
          >
            <div className="flex items-center gap-3">
              <Copy className="w-4 h-4" />
              <div className="text-left">
                <div>Copy Image to Clipboard</div>
                <div className="text-[10px] font-normal opacity-85">Instant paste into slide decks or docs</div>
              </div>
            </div>
            {copied ? (
              <span className="flex items-center gap-1 text-[11px] bg-[#4c7a52] text-white px-2 py-0.5 rounded-md font-bold">
                <Check className="w-3 h-3" /> Copied!
              </span>
            ) : (
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md uppercase tracking-wider">Fast</span>
            )}
          </button>

          {/* High Res PNG Download */}
          <button
            onClick={handleExportPng}
            disabled={exporting}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#ede4d3] hover:bg-[#e3d7c1] border border-[#cfc0a5] text-[#2c251d] text-xs font-medium transition"
          >
            <ImageIcon className="w-4 h-4 text-[#557a46]" />
            <div className="text-left">
              <div>Download High-Res PNG</div>
              <div className="text-[10px] text-[#72634f]">Crisp 2x retina image with studio background</div>
            </div>
          </button>

          {/* Vector SVG Download */}
          <button
            onClick={handleExportSvg}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#ede4d3] hover:bg-[#e3d7c1] border border-[#cfc0a5] text-[#2c251d] text-xs font-medium transition"
          >
            <Sparkles className="w-4 h-4 text-[#8c583a]" />
            <div className="text-left">
              <div>Download Vector SVG</div>
              <div className="text-[10px] text-[#72634f]">Lossless scalable vector graphics</div>
            </div>
          </button>

          {/* JSON Save */}
          <button
            onClick={handleSaveJson}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#ede4d3] hover:bg-[#e3d7c1] border border-[#cfc0a5] text-[#2c251d] text-xs font-medium transition"
          >
            <FileCode className="w-4 h-4 text-[#7c6143]" />
            <div className="text-left">
              <div>Save Editable JSON Project</div>
              <div className="text-[10px] text-[#72634f]">Download file to import later (no browser data kept on exit)</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
