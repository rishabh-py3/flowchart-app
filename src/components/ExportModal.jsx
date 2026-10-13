import React, { useState } from 'react';
import { X, Download, Copy, FileCode, Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import { generateFlowchartSvg, downloadFlowchartImage } from '../utils/exportImage';

export default function ExportModal({ nodes, edges, theme, onClose }) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Export as PNG
  const handleExportPng = () => {
    downloadFlowchartImage({ nodes, edges, theme });
  };

  // Export as SVG
  const handleExportSvg = () => {
    const result = generateFlowchartSvg({ nodes, edges, theme });
    if (!result) {
      alert('Your canvas is empty. Add flowchart blocks before downloading.');
      return;
    }
    const blob = new Blob([result.svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `flowcanvas-${Date.now()}.svg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy PNG image to clipboard
  const handleCopyToClipboard = async () => {
    const result = generateFlowchartSvg({ nodes, edges, theme });
    if (!result) {
      alert('Your canvas is empty. Add flowchart blocks before copying.');
      return;
    }
    setExporting(true);
    const { svgStr, width, height } = result;
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * 2);
      canvas.height = Math.round(height * 2);
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
    img.onerror = () => {
      setExporting(false);
      URL.revokeObjectURL(url);
      alert('Could not copy image. Please use Download PNG instead.');
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
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <p className="text-xs text-[#72634f]">High-resolution picture showing only the flowchart</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {/* Download High-Res PNG */}
          <button
            onClick={() => {
              handleExportPng();
              onClose();
            }}
            disabled={exporting}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#7c6143] hover:bg-[#695136] text-[#fdfaf3] font-semibold text-xs transition shadow-md"
          >
            <div className="flex items-center gap-3">
              <ImageIcon className="w-4 h-4" />
              <div className="text-left">
                <div>Download Flowchart Picture (PNG)</div>
                <div className="text-[10px] font-normal opacity-85">Crops neatly to flowchart only, 2x retina sharpness</div>
              </div>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md uppercase tracking-wider">Image</span>
          </button>

          {/* Copy to Clipboard */}
          <button
            onClick={handleCopyToClipboard}
            disabled={exporting}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-[#ede4d3] hover:bg-[#e3d7c1] border border-[#cfc0a5] text-[#2c251d] text-xs font-medium transition"
          >
            <div className="flex items-center gap-3">
              <Copy className="w-4 h-4 text-[#7c6143]" />
              <div className="text-left">
                <div>Copy Picture to Clipboard</div>
                <div className="text-[10px] text-[#72634f]">Instant paste into slide decks or documents</div>
              </div>
            </div>
            {copied ? (
              <span className="flex items-center gap-1 text-[11px] bg-[#4c7a52] text-white px-2 py-0.5 rounded-md font-bold">
                <Check className="w-3 h-3" /> Copied!
              </span>
            ) : null}
          </button>

          {/* Vector SVG Download */}
          <button
            onClick={() => {
              handleExportSvg();
              onClose();
            }}
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
            onClick={() => {
              handleSaveJson();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#ede4d3] hover:bg-[#e3d7c1] border border-[#cfc0a5] text-[#2c251d] text-xs font-medium transition"
          >
            <FileCode className="w-4 h-4 text-[#7c6143]" />
            <div className="text-left">
              <div>Save Editable JSON Project</div>
              <div className="text-[10px] text-[#72634f]">Download project file to re-import anytime</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
