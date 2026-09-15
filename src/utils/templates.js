export const PRESENTATION_THEMES = [
  {
    id: 'executive-dark',
    name: 'Executive Dark',
    bgType: 'dots',
    bgColor: '#0f172a',
    canvasBgClass: 'bg-slate-900 canvas-grid-dots',
    textDark: false,
    accent: '#3b82f6',
    nodeColors: {
      process: { fill: '#1e293b', stroke: '#3b82f6', text: '#f8fafc' },
      decision: { fill: '#312e81', stroke: '#818cf8', text: '#f8fafc' },
      terminal: { fill: '#064e3b', stroke: '#34d399', text: '#f8fafc' },
      database: { fill: '#451a03', stroke: '#fb923c', text: '#f8fafc' },
      document: { fill: '#371b58', stroke: '#c084fc', text: '#f8fafc' },
      note: { fill: '#713f12', stroke: '#facc15', text: '#fef08a' }
    }
  },
  {
    id: 'clean-light',
    name: 'Clean Light (Deck ready)',
    bgType: 'light-dots',
    bgColor: '#f8fafc',
    canvasBgClass: 'bg-slate-50 canvas-grid-light-dots',
    textDark: true,
    accent: '#2563eb',
    nodeColors: {
      process: { fill: '#ffffff', stroke: '#2563eb', text: '#0f172a' },
      decision: { fill: '#eff6ff', stroke: '#3b82f6', text: '#1e3a8a' },
      terminal: { fill: '#f0fdf4', stroke: '#16a34a', text: '#14532d' },
      database: { fill: '#fff7ed', stroke: '#ea580c', text: '#7c2d12' },
      document: { fill: '#faf5ff', stroke: '#9333ea', text: '#581c87' },
      note: { fill: '#fefce8', stroke: '#ca8a04', text: '#713f12' }
    }
  },
  {
    id: 'cyber-neon',
    name: 'Vibrant Cyber Neon',
    bgType: 'lines',
    bgColor: '#050515',
    canvasBgClass: 'bg-zinc-950 canvas-grid-lines',
    textDark: false,
    accent: '#06b6d4',
    nodeColors: {
      process: { fill: '#090d16', stroke: '#06b6d4', text: '#e0f2fe' },
      decision: { fill: '#160d29', stroke: '#d946ef', text: '#fae8ff' },
      terminal: { fill: '#051b14', stroke: '#10b981', text: '#d1fae5' },
      database: { fill: '#1f1300', stroke: '#f59e0b', text: '#fef3c7' },
      document: { fill: '#1a0928', stroke: '#a855f7', text: '#f3e8ff' },
      note: { fill: '#241a02', stroke: '#eab308', text: '#fef9c3' }
    }
  },
  {
    id: 'soft-pastel',
    name: 'Soft Pastel Corporate',
    bgType: 'light-lines',
    bgColor: '#f1f5f9',
    canvasBgClass: 'bg-slate-100 canvas-grid-light-lines',
    textDark: true,
    accent: '#0d9488',
    nodeColors: {
      process: { fill: '#e0f2fe', stroke: '#0284c7', text: '#0c4a6e' },
      decision: { fill: '#f3e8ff', stroke: '#7e22ce', text: '#3b0764' },
      terminal: { fill: '#dcfce7', stroke: '#15803d', text: '#14532d' },
      database: { fill: '#ffedd5', stroke: '#c2410c', text: '#7c2d12' },
      document: { fill: '#fce7f3', stroke: '#be185d', text: '#701a75' },
      note: { fill: '#fef9c3', stroke: '#a16207', text: '#713f12' }
    }
  }
];

export const SHAPE_TYPES = [
  { id: 'terminal', name: 'Start / End', icon: 'CircleDot', defaultWidth: 140, defaultHeight: 60, shape: 'pill' },
  { id: 'process', name: 'Process Block', icon: 'Square', defaultWidth: 160, defaultHeight: 80, shape: 'rectangle' },
  { id: 'decision', name: 'Decision Point', icon: 'Diamond', defaultWidth: 150, defaultHeight: 100, shape: 'diamond' },
  { id: 'database', name: 'Database', icon: 'Database', defaultWidth: 140, defaultHeight: 90, shape: 'cylinder' },
  { id: 'document', name: 'Document', icon: 'FileText', defaultWidth: 150, defaultHeight: 85, shape: 'document' },
  { id: 'input', name: 'Input / Output', icon: 'MoveHorizontal', defaultWidth: 160, defaultHeight: 70, shape: 'parallelogram' },
  { id: 'note', name: 'Sticky Note', icon: 'StickyNote', defaultWidth: 150, defaultHeight: 110, shape: 'note' }
];

export const PRESET_TEMPLATES = [
  {
    id: 'user-auth-flow',
    name: 'User Authentication Flow',
    description: 'Standard login, validation, and session creation flowchart for technical slides.',
    nodes: [
      { id: 'n1', type: 'terminal', label: 'User Opens App', x: 100, y: 220, width: 150, height: 60, fill: '#064e3b', stroke: '#34d399', text: '#f8fafc', font: 'Inter', fontSize: 14, fontWeight: '600', stepIndex: 1 },
      { id: 'n2', type: 'input', label: 'Enter Email & Password', x: 310, y: 215, width: 170, height: 70, fill: '#1e293b', stroke: '#3b82f6', text: '#f8fafc', font: 'Inter', fontSize: 14, fontWeight: '500', stepIndex: 2 },
      { id: 'n3', type: 'decision', label: 'Valid Credentials?', x: 540, y: 200, width: 160, height: 100, fill: '#312e81', stroke: '#818cf8', text: '#f8fafc', font: 'Inter', fontSize: 14, fontWeight: '600', stepIndex: 3 },
      { id: 'n4', type: 'database', label: 'Fetch User Profile', x: 760, y: 210, width: 150, height: 80, fill: '#451a03', stroke: '#fb923c', text: '#f8fafc', font: 'Inter', fontSize: 14, fontWeight: '500', stepIndex: 4 },
      { id: 'n5', type: 'terminal', label: 'Dashboard Access Granted', x: 970, y: 220, width: 160, height: 60, fill: '#064e3b', stroke: '#34d399', text: '#f8fafc', font: 'Inter', fontSize: 14, fontWeight: '600', stepIndex: 5 },
      { id: 'n6', type: 'process', label: 'Show Error & Increment Retry Count', x: 535, y: 380, width: 170, height: 80, fill: '#881337', stroke: '#f43f5e', text: '#ffe4e6', font: 'Inter', fontSize: 13, fontWeight: '500', stepIndex: 6 }
    ],
    edges: [
      { id: 'e1', from: 'n1', to: 'n2', label: '', style: 'orthogonal', arrow: 'end' },
      { id: 'e2', from: 'n2', to: 'n3', label: 'Submit', style: 'orthogonal', arrow: 'end' },
      { id: 'e3', from: 'n3', to: 'n4', label: 'Yes', style: 'orthogonal', arrow: 'end' },
      { id: 'e4', from: 'n4', to: 'n5', label: 'Success', style: 'orthogonal', arrow: 'end' },
      { id: 'e5', from: 'n3', to: 'n6', label: 'No', style: 'orthogonal', arrow: 'end' }
    ]
  },
  {
    id: 'sales-lead-qualification',
    name: 'Sales Lead Qualification Pipeline',
    description: 'Executive overview of lead ingestion, evaluation, and account assignment.',
    nodes: [
      { id: 'm1', type: 'terminal', label: 'Inbound Lead Arrives', x: 120, y: 180, width: 160, height: 60, fill: '#0284c7', stroke: '#38bdf8', text: '#ffffff', font: 'Outfit', fontSize: 14, fontWeight: '600', stepIndex: 1 },
      { id: 'm2', type: 'decision', label: 'Company Size > 100?', x: 340, y: 160, width: 160, height: 100, fill: '#4338ca', stroke: '#818cf8', text: '#ffffff', font: 'Outfit', fontSize: 14, fontWeight: '600', stepIndex: 2 },
      { id: 'm3', type: 'process', label: 'Assign to Enterprise AE', x: 570, y: 110, width: 170, height: 75, fill: '#047857', stroke: '#34d399', text: '#ffffff', font: 'Outfit', fontSize: 14, fontWeight: '600', stepIndex: 3 },
      { id: 'm4', type: 'process', label: 'Route to SMB Nurture Campaign', x: 570, y: 250, width: 170, height: 75, fill: '#b45309', stroke: '#fbbf24', text: '#ffffff', font: 'Outfit', fontSize: 14, fontWeight: '500', stepIndex: 4 },
      { id: 'm5', type: 'document', label: 'Send Demo Deck & Proposal', x: 790, y: 110, width: 160, height: 75, fill: '#6b21a8', stroke: '#c084fc', text: '#ffffff', font: 'Outfit', fontSize: 14, fontWeight: '500', stepIndex: 5 }
    ],
    edges: [
      { id: 'ge1', from: 'm1', to: 'm2', label: 'Form Submit', style: 'curved', arrow: 'end' },
      { id: 'ge2', from: 'm2', to: 'm3', label: 'Yes', style: 'orthogonal', arrow: 'end' },
      { id: 'ge3', from: 'm2', to: 'm4', label: 'No', style: 'orthogonal', arrow: 'end' },
      { id: 'ge4', from: 'm3', to: 'm5', label: 'Qualify', style: 'straight', arrow: 'end' }
    ]
  }
];
