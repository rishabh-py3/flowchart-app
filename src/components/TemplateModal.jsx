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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Flowchart Starter Templates</h2>
            <p className="text-xs text-slate-400">Choose a presentation template or import a project file</p>
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
              className="group p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 cursor-pointer transition flex items-center justify-between"
            >
              <div>
                <h3 className="text-xs font-semibold text-slate-100 group-hover:text-blue-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {tpl.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                  {tpl.description}
                </p>
                <div className="text-[10px] text-slate-500 mt-2 font-mono">
                  {tpl.nodes.length} Blocks • {tpl.edges.length} Connections
                </div>
              </div>

              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}

          {/* Import JSON file */}
          <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-medium cursor-pointer transition mt-4">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Import JSON Project File</span>
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}
