export const PRESENTATION_THEMES = [
  {
    id: 'atelier-parchment',
    name: 'Studio Parchment (Default)',
    bgType: 'parchment-dots',
    bgColor: '#f3ede0',
    panelBg: '#ede4d3',
    headerBg: '#efe7d6',
    borderColor: '#d5c7ad',
    canvasBgClass: 'bg-[#f3ede0] canvas-grid-parchment',
    textDark: true,
    accent: '#7a5c3e',
    edgeStroke: '#736049',
    nodeColors: {
      terminal: { fill: '#cbd5b8', stroke: '#6d624d', text: '#2c251d' },
      process: { fill: '#eadcc5', stroke: '#6d624d', text: '#2c251d' },
      decision: { fill: '#e3d2b4', stroke: '#6d624d', text: '#2c251d' },
      database: { fill: '#e4be93', stroke: '#6d624d', text: '#2c251d' },
      document: { fill: '#dfc8b2', stroke: '#6d624d', text: '#2c251d' },
      input: { fill: '#eadcc5', stroke: '#6d624d', text: '#2c251d' },
      note: { fill: '#f2e5bd', stroke: '#8c7651', text: '#2c251d' }
    }
  },
  {
    id: 'clean-light',
    name: 'Clean Light (Deck Ready)',
    bgType: 'light-dots',
    bgColor: '#f8fafc',
    panelBg: '#ffffff',
    headerBg: '#ffffff',
    borderColor: '#e2e8f0',
    canvasBgClass: 'bg-slate-50 canvas-grid-light-dots',
    textDark: true,
    accent: '#2563eb',
    edgeStroke: '#64748b',
    nodeColors: {
      terminal: { fill: '#dcfce7', stroke: '#16a34a', text: '#14532d' },
      process: { fill: '#ffffff', stroke: '#2563eb', text: '#0f172a' },
      decision: { fill: '#eff6ff', stroke: '#3b82f6', text: '#1e3a8a' },
      database: { fill: '#ffedd5', stroke: '#ea580c', text: '#7c2d12' },
      document: { fill: '#f3e8ff', stroke: '#9333ea', text: '#581c87' },
      input: { fill: '#e0f2fe', stroke: '#0284c7', text: '#0c4a6e' },
      note: { fill: '#fef9c3', stroke: '#ca8a04', text: '#713f12' }
    }
  },
  {
    id: 'executive-dark',
    name: 'Executive Dark',
    bgType: 'dots',
    bgColor: '#0f172a',
    panelBg: '#1e293b',
    headerBg: '#0f172a',
    borderColor: '#334155',
    canvasBgClass: 'bg-slate-900 canvas-grid-dots',
    textDark: false,
    accent: '#3b82f6',
    edgeStroke: '#94a3b8',
    nodeColors: {
      terminal: { fill: '#064e3b', stroke: '#34d399', text: '#f8fafc' },
      process: { fill: '#1e293b', stroke: '#3b82f6', text: '#f8fafc' },
      decision: { fill: '#312e81', stroke: '#818cf8', text: '#f8fafc' },
      database: { fill: '#451a03', stroke: '#fb923c', text: '#f8fafc' },
      document: { fill: '#371b58', stroke: '#c084fc', text: '#f8fafc' },
      input: { fill: '#164e63', stroke: '#22d3ee', text: '#f8fafc' },
      note: { fill: '#713f12', stroke: '#facc15', text: '#fef08a' }
    }
  }
];

export const SHAPE_TYPES = [
  { id: 'terminal', name: 'Start / End', code: 'S', icon: 'CircleDot', defaultWidth: 150, defaultHeight: 74, shape: 'pill' },
  { id: 'process', name: 'Process Block', code: 'P', icon: 'Square', defaultWidth: 160, defaultHeight: 74, shape: 'rectangle' },
  { id: 'decision', name: 'Decision Point', code: 'D', icon: 'Diamond', defaultWidth: 155, defaultHeight: 115, shape: 'diamond' },
  { id: 'database', name: 'Database', code: 'DB', icon: 'Database', defaultWidth: 150, defaultHeight: 82, shape: 'cylinder' },
  { id: 'document', name: 'Document', code: 'D', icon: 'FileText', defaultWidth: 150, defaultHeight: 80, shape: 'document' },
  { id: 'input', name: 'Input / Output', code: 'IO', icon: 'MoveHorizontal', defaultWidth: 160, defaultHeight: 74, shape: 'parallelogram' },
  { id: 'note', name: 'Sticky Note', code: 'N', icon: 'StickyNote', defaultWidth: 150, defaultHeight: 95, shape: 'note' }
];

export const PRESET_TEMPLATES = [
  {
    id: 'user-auth-flow',
    name: 'User Authentication Flow',
    description: 'Standard login, validation, profile fetch, and error handling workflow.',
    nodes: [
      { id: 'n1', type: 'terminal', label: 'User Opens App', x: 90, y: 220, width: 155, height: 76, fill: '#cbd5b8', stroke: '#6d624d', text: '#2c251d', font: 'Inter', fontSize: 13, fontWeight: '500', stepIndex: 1 },
      { id: 'n2', type: 'process', label: 'Enter Credentials', x: 315, y: 220, width: 160, height: 76, fill: '#eadcc5', stroke: '#6d624d', text: '#2c251d', font: 'Inter', fontSize: 13, fontWeight: '500', stepIndex: 2 },
      { id: 'n3', type: 'decision', label: 'Valid Login?', x: 560, y: 196, width: 156, height: 124, fill: '#e3d2b4', stroke: '#6d624d', text: '#2c251d', font: 'Inter', fontSize: 13, fontWeight: '500', stepIndex: 3 },
      { id: 'n4', type: 'database', label: 'Fetch Profile', x: 800, y: 220, width: 155, height: 78, fill: '#e4be93', stroke: '#6d624d', text: '#2c251d', font: 'Inter', fontSize: 13, fontWeight: '500', stepIndex: 4 },
      { id: 'n5', type: 'process', label: 'Show Error Alert', x: 560, y: 390, width: 156, height: 76, fill: '#dcab91', stroke: '#6d624d', text: '#2c251d', font: 'Inter', fontSize: 13, fontWeight: '500', stepIndex: 5 },
      { id: 'n6', type: 'terminal', label: 'Success Access', x: 1030, y: 220, width: 150, height: 76, fill: '#cbd5b8', stroke: '#6d624d', text: '#2c251d', font: 'Inter', fontSize: 13, fontWeight: '500', stepIndex: 6 }
    ],
    edges: [
      { id: 'e1', from: 'n1', to: 'n2', fromPort: 'right', toPort: 'left', label: '', style: 'orthogonal', arrow: 'end' },
      { id: 'e2', from: 'n2', to: 'n3', fromPort: 'right', toPort: 'left', label: 'Submit', style: 'orthogonal', arrow: 'end' },
      { id: 'e3', from: 'n3', to: 'n4', fromPort: 'right', toPort: 'left', label: 'Yes', style: 'orthogonal', arrow: 'end' },
      { id: 'e4', from: 'n4', to: 'n6', fromPort: 'right', toPort: 'left', label: 'Success', style: 'orthogonal', arrow: 'end' },
      { id: 'e5', from: 'n3', to: 'n5', fromPort: 'bottom', toPort: 'top', label: 'No', style: 'orthogonal', arrow: 'end' }
    ]
  },
  {
    id: 'sales-lead-qualification',
    name: 'Sales Lead Qualification Pipeline',
    description: 'Executive overview of lead ingestion, evaluation, and account assignment.',
    nodes: [
      { id: 'm1', type: 'terminal', label: 'Inbound Lead', x: 100, y: 210, width: 155, height: 74, fill: '#cbd5b8', stroke: '#6d624d', text: '#2c251d', font: 'Inter', fontSize: 13, fontWeight: '500', stepIndex: 1 },
      { id: 'm2', type: 'input', label: 'Capture Form Data', x: 320, y: 210, width: 170, height: 74, fill: '#eadcc5', stroke: '#6d624d', text: '#2c251d', font: 'Inter', fontSize: 13, fontWeight: '500', stepIndex: 2 },
      { id: 'm3', type: 'decision', label: 'Size > 100?', x: 560, y: 185, width: 156, height: 124, fill: '#e3d2b4', stroke: '#6d624d', text: '#2c251d', font: 'Inter', fontSize: 13, fontWeight: '500', stepIndex: 3 },
      { id: 'm4', type: 'process', label: 'Assign Enterprise AE', x: 800, y: 120, width: 175, height: 76, fill: '#e4be93', stroke: '#6d624d', text: '#2c251d', font: 'Inter', fontSize: 13, fontWeight: '500', stepIndex: 4 },
      { id: 'm5', type: 'process', label: 'Route SMB Nurture', x: 800, y: 295, width: 175, height: 76, fill: '#dcab91', stroke: '#6d624d', text: '#2c251d', font: 'Inter', fontSize: 13, fontWeight: '500', stepIndex: 5 },
      { id: 'm6', type: 'document', label: 'Send Proposal Deck', x: 1045, y: 120, width: 170, height: 80, fill: '#dfc8b2', stroke: '#6d624d', text: '#2c251d', font: 'Inter', fontSize: 13, fontWeight: '500', stepIndex: 6 }
    ],
    edges: [
      { id: 'ge1', from: 'm1', to: 'm2', fromPort: 'right', toPort: 'left', label: '', style: 'orthogonal', arrow: 'end' },
      { id: 'ge2', from: 'm2', to: 'm3', fromPort: 'right', toPort: 'left', label: 'Evaluate', style: 'orthogonal', arrow: 'end' },
      { id: 'ge3', from: 'm3', to: 'm4', fromPort: 'top', toPort: 'left', label: 'Yes', style: 'orthogonal', arrow: 'end' },
      { id: 'ge4', from: 'm3', to: 'm5', fromPort: 'bottom', toPort: 'left', label: 'No', style: 'orthogonal', arrow: 'end' },
      { id: 'ge5', from: 'm4', to: 'm6', fromPort: 'right', toPort: 'left', label: 'Qualified', style: 'orthogonal', arrow: 'end' }
    ]
  },
  {
    id: 'order-fulfillment',
    name: 'E-Commerce Order Fulfillment',
    description: 'End-to-end payment verification, inventory check, and shipment dispatch flow.',
    nodes: [
      { id: 'o1', type: 'terminal', label: 'Order Placed', x: 90, y: 210, width: 150, height: 72, fill: '#cbd5b8', stroke: '#6d624d', text: '#2c251d', font: 'Inter', fontSize: 13, fontWeight: '500', stepIndex: 1 },
      { id: 'o2', type: 'decision', label: 'In Stock?', x: 310, y: 184, width: 156, height: 124, fill: '#e3d2b4', stroke: '#6d624d', text: '#2c251d', font: 'Inter', fontSize: 13, fontWeight: '500', stepIndex: 2 },
      { id: 'o3', type: 'process', label: 'Charge Card', x: 545, y: 210, width: 155, height: 72, fill: '#eadcc5', stroke: '#6d624d', text: '#2c251d', font: 'Inter', fontSize: 13, fontWeight: '500', stepIndex: 3 },
      { id: 'o4', type: 'document', label: 'Generate Invoice', x: 775, y: 207, width: 165, height: 78, fill: '#dfc8b2', stroke: '#6d624d', text: '#2c251d', font: 'Inter', fontSize: 13, fontWeight: '500', stepIndex: 4 },
      { id: 'o5', type: 'terminal', label: 'Ship Package', x: 1010, y: 210, width: 155, height: 72, fill: '#cbd5b8', stroke: '#6d624d', text: '#2c251d', font: 'Inter', fontSize: 13, fontWeight: '500', stepIndex: 5 },
      { id: 'o6', type: 'note', label: 'Notify Backorder Waitlist', x: 310, y: 375, width: 156, height: 84, fill: '#f2e5bd', stroke: '#8c7651', text: '#2c251d', font: 'Inter', fontSize: 13, fontWeight: '500', stepIndex: 6 }
    ],
    edges: [
      { id: 'oe1', from: 'o1', to: 'o2', fromPort: 'right', toPort: 'left', label: '', style: 'orthogonal', arrow: 'end' },
      { id: 'oe2', from: 'o2', to: 'o3', fromPort: 'right', toPort: 'left', label: 'Yes', style: 'orthogonal', arrow: 'end' },
      { id: 'oe3', from: 'o3', to: 'o4', fromPort: 'right', toPort: 'left', label: 'Paid', style: 'orthogonal', arrow: 'end' },
      { id: 'oe4', from: 'o4', to: 'o5', fromPort: 'right', toPort: 'left', label: 'Dispatch', style: 'orthogonal', arrow: 'end' },
      { id: 'oe5', from: 'o2', to: 'o6', fromPort: 'bottom', toPort: 'top', label: 'No', style: 'orthogonal', arrow: 'end' }
    ]
  }
];
