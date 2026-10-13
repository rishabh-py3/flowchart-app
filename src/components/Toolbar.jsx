import React, { useState, useRef } from 'react';
import {
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize2,
  Trash2, Menu, RotateCcw, Palette
} from 'lucide-react';
import { PRESENTATION_THEMES } from '../utils/templates';

export default function Toolbar({
  theme,
  setTheme,
  zoom,
  setZoom,
  onResetView,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onOpenTemplates,
  onImportJson,
  onStartPresentation,
  onOpenExport,
  nodeCount
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const projectData = JSON.parse(event.target.result);
        if (projectData.nodes && projectData.edges) {
          onImportJson(projectData);
        } else {
          alert('Invalid flowchart JSON file.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="h-[68px] bg-[#efe7d6] border-b border-[#d5c7ad] px-6 flex items-center justify-between z-30 select-none shadow-[0_1px_3px_rgba(74,60,44,0.06)] relative">
      {/* Left: Brand & Main Navigation Links */}
      <div className="flex items-center gap-10">
        {/* FlowCanvas STUDIO Logo */}
        <div className="flex flex-col items-center cursor-pointer" onClick={onResetView} title="Reset Canvas View">
          <span
            className="text-[22px] font-semibold tracking-tight text-[#433627] leading-none"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            FlowCanvas
          </span>
          <div className="flex items-center gap-2 mt-1 w-full justify-center">
            <span className="h-[1px] flex-1 bg-[#9c8b70]" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#6d5d47]">
              STUDIO
            </span>
            <span className="h-[1px] flex-1 bg-[#9c8b70]" />
          </div>
        </div>

        {/* Navigation Links matching reference design */}
        <nav className="flex items-center gap-6 text-[13px] font-medium text-[#4a3e2e]">
          <button
            onClick={onOpenTemplates}
            className="hover:text-[#7c5d3b] transition-colors py-1 px-2 rounded-md hover:bg-[#e5dac5]/60"
          >
            Templates & Presets
          </button>

          <span className="h-3.5 w-[1px] bg-[#d5c7ad]" />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="hover:text-[#7c5d3b] transition-colors py-1 px-2 rounded-md hover:bg-[#e5dac5]/60"
          >
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <span className="h-3.5 w-[1px] bg-[#d5c7ad]" />

          <button
            onClick={onOpenExport}
            className="hover:text-[#7c5d3b] transition-colors py-1 px-2 rounded-md hover:bg-[#e5dac5]/60"
          >
            Export
          </button>
        </nav>
      </div>

      {/* Center / Right Quick Controls & Present Flow */}
      <div className="flex items-center gap-4">
        {/* Subtle Quick Undo/Redo & Zoom Pill */}
        <div className="hidden md:flex items-center gap-1 bg-[#e6dcc8]/80 px-2 py-1 rounded-lg border border-[#d2c3a8] text-[#544634]">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded hover:bg-[#dcd0b8] disabled:opacity-30 transition"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded hover:bg-[#dcd0b8] disabled:opacity-30 transition"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <div className="h-3.5 w-[1px] bg-[#cbbba0] mx-1" />

          <button
            onClick={() => setZoom(Math.max(0.35, +(zoom - 0.1).toFixed(2)))}
            title="Zoom Out"
            className="p-1 rounded hover:bg-[#dcd0b8] transition"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span
            onClick={onResetView}
            title="Click to reset zoom & pan"
            className="text-[11px] font-mono font-medium w-11 text-center cursor-pointer hover:underline"
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(2.2, +(zoom + 0.1).toFixed(2)))}
            title="Zoom In"
            className="p-1 rounded hover:bg-[#dcd0b8] transition"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Present Flow Button */}
        <button
          onClick={onStartPresentation}
          disabled={nodeCount === 0}
          className="px-5 py-2 rounded-lg bg-[#7c6143] hover:bg-[#695136] active:bg-[#59442d] disabled:opacity-40 text-[#fdfaf3] font-medium text-[13px] shadow-sm transition-all border border-[#634c33]"
        >
          Present Flow
        </button>

        {/* Hamburger Menu for extra canvas tools */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg text-[#5c4d3a] hover:bg-[#e4d9c3] transition"
            title="Studio Options"
          >
            <Menu className="w-5 h-5" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#f5efe2] border border-[#cfc0a5] shadow-xl py-2 px-3 z-50 text-xs text-[#3d3225] space-y-2">
                <div className="font-semibold text-[10px] uppercase tracking-wider text-[#7d6c55] px-1 pt-1">
                  Canvas Theme
                </div>
                <div className="space-y-1">
                  {PRESENTATION_THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t);
                        setMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                        theme.id === t.id
                          ? 'bg-[#7c6143] text-[#fdfaf3] font-medium'
                          : 'hover:bg-[#e6dcc8]'
                      }`}
                    >
                      <span>{t.name}</span>
                      <Palette className="w-3.5 h-3.5 opacity-70" />
                    </button>
                  ))}
                </div>

                <div className="border-t border-[#d8cbb3] my-1 pt-1.5 space-y-1">
                  <button
                    onClick={() => {
                      onResetView();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#e6dcc8] flex items-center gap-2"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-[#7c6143]" />
                    <span>Center & Reset Zoom</span>
                  </button>
                  <button
                    onClick={() => {
                      onClear();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-500/15 text-rose-700 flex items-center gap-2 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Entire Canvas</span>
                  </button>
                </div>

                <div className="border-t border-[#d8cbb3] pt-1.5 px-1 text-[10px] text-[#84735c] leading-snug">
                  Privacy Mode Active: All data is automatically wiped when exiting the tab.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
