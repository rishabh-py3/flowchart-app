import React, { useState } from 'react';
import { X, Download, Copy, FileCode, Check, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function ExportModal({ nodes, edges, theme, onClose }) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Generate SVG string representation of canvas
  const generateSvgString = () => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      minX = Math.min(minX, n.x - 40);
      minY = Math.min(minY, n.y - 40);
      maxX = Math.max(maxX, n.x + n.width + 40);
      maxY = Math.max(maxY, n.y + n.height + 40);
    });

    if (nodes.length === 0) {
      minX = 0; minY = 0; maxX = 800; maxY = 600;
    }

    const width = maxX - minX;
    const height = maxY - minY;

    let svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">`;
    svgStr += `<rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="${theme.bgColor || '#0f172a'}"/>`;

    // Connections
    edges.forEach(e => {
      const sn = nodes.find(n => n.id === e.from);
      const tn = nodes.find(n => n.id === e.to);
      if (!sn || !tn) return;
      const x1 = sn.x + sn.width / 2;
      const y1 = sn.y + sn.height / 2;
      const x2 = tn.x + tn.width / 2;
      const y2 = tn.y + tn.height / 2;
      svgStr += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${e.stroke || '#64748b'}" stroke-width="2" />`;
      if (e.label) {
        svgStr += `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 5}" fill="#94a3b8" font-size="12" font-family="sans-serif" text-anchor="middle">${e.label}</text>`;
      }
    });

    // Nodes
    nodes.forEach(n => {
      svgStr += `<rect x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" rx="10" fill="${n.fill}" stroke="${n.stroke}" stroke-width="2"/>`;
      svgStr += `<text x="${n.x + n.width / 2}" y="${n.y + n.height / 2 + 4}" fill="${n.text || '#ffffff'}" font-size="${n.fontSize || 14}" font-family="sans-serif" text-anchor="middle" font-weight="500">${n.label}</text>`;
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
      canvas.width = width * 2; // High resolution
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);

      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `flowchart-${Date.now()}.png`;
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
    link.download = `flowchart-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy PNG image to clipboard for instant PowerPoint / Keynote paste
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
          alert('Copy failed: Your browser permissions may require downloading the image file directly.');
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
    link.download = `flowchart-project-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Export Flowchart</h2>
            <p className="text-xs text-slate-400">Ready for PowerPoint, Keynote, & Google Slides</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Copy to Clipboard (Primary for Presentation Decks) */}
          <button
            onClick={handleCopyToClipboard}
            disabled={exporting}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-600/25 group"
          >
            <div className="flex items-center gap-3">
              <Copy className="w-4 h-4" />
              <div className="text-left">
                <div>Copy Image to Clipboard</div>
                <div className="text-[10px] font-normal opacity-80">Instant paste into presentation slide decks</div>
              </div>
            </div>
            {copied ? (
              <span className="flex items-center gap-1 text-[11px] bg-emerald-500 text-white px-2 py-0.5 rounded-md font-bold">
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
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition"
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <div className="text-left">
              <div>Download High-Res PNG</div>
              <div className="text-[10px] text-slate-400">High dpi image export with theme background</div>
            </div>
          </button>

          {/* Vector SVG Download */}
          <button
            onClick={handleExportSvg}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <div className="text-left">
              <div>Download Vector SVG</div>
              <div className="text-[10px] text-slate-400">Scalable vector graphics format</div>
            </div>
          </button>

          {/* JSON Save */}
          <button
            onClick={handleSaveJson}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition"
          >
            <FileCode className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <div>Save Editable JSON Project</div>
              <div className="text-[10px] text-slate-400">Save project file locally to edit later</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
