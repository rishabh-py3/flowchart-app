import React from 'react';
import { X, FolderOpen, Upload, ArrowRight, Sparkles } from 'lucide-react';
import { PRESET_TEMPLATES } from '../utils/templates';

export default function TemplateModal({ onLoadTemplate, onImportJson, onClose }) {
  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const projectData = JSON.parse(event.target.result);
        if (projectData.nodes && projectData.edges) {
          onImportJson(projectData);
          onClose();
        } else {
          alert('Invalid project file format.');
        }
      } catch (err) {
        alert('Failed to read JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2c251d]/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#f5efe2] border border-[#cfc0a5] rounded-2xl shadow-2xl p-6 relative text-[#2c251d]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#72634f] hover:text-[#2c251d] hover:bg-[#e5dac5] transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#7c6143]/15 text-[#7c6143] flex items-center justify-center border border-[#7c6143]/30">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2c251d]">Templates & Presets</h2>
            <p className="text-xs text-[#72634f]">Load a ready-to-edit flowchart or import a JSON file</p>
          </div>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {PRESET_TEMPLATES.map(tpl => (
            <div
              key={tpl.id}
              onClick={() => {
                onLoadTemplate(tpl);
                onClose();
              }}
              className="group p-4 rounded-xl bg-[#ede4d3] hover:bg-[#e5d9c3] border border-[#cfc0a5] hover:border-[#8c7051] cursor-pointer transition flex items-center justify-between"
            >
              <div>
                <h3 className="text-xs font-bold text-[#2c251d] group-hover:text-[#695136] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#8c6b3f]" />
                  {tpl.name}
                </h3>
                <p className="text-[11px] text-[#6d5d47] mt-1 max-w-sm">
                  {tpl.description}
                </p>
                <div className="text-[10px] text-[#84735c] mt-2 font-mono">
                  {tpl.nodes.length} Blocks • {tpl.edges.length} Connections
                </div>
              </div>

              <div className="w-8 h-8 rounded-lg bg-[#f5efe2] border border-[#d5c7ad] flex items-center justify-center text-[#5c4d3a] group-hover:bg-[#7c6143] group-hover:text-[#fdfaf3] group-hover:translate-x-0.5 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}

          {/* Import JSON file */}
          <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#ede4d3]/60 hover:bg-[#e5d9c3] border border-dashed border-[#b5a489] hover:border-[#7c6143] text-[#4a3e2e] text-xs font-medium cursor-pointer transition mt-4">
            <Upload className="w-4 h-4 text-[#7c6143]" />
            <span>Import JSON Project File</span>
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}
