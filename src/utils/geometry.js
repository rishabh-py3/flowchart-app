// Calculates connection points (ports) on a node's actual shape boundary
export function getNodePorts(node) {
  const { x, y, width, height, type } = node;
  const halfW = width / 2;
  const halfH = height / 2;
  const centerX = x + halfW;
  const centerY = y + halfH;

  // Parallelogram (Input / Output) has sloped left and right sides
  if (type === 'input' || type === 'parallelogram') {
    const skew = Math.min(20, width * 0.15);
    return {
      top: { x: centerX, y: y, dir: 'top' },
      right: { x: x + width - skew / 2, y: centerY, dir: 'right' },
      bottom: { x: centerX, y: y + height, dir: 'bottom' },
      left: { x: x + skew / 2, y: centerY, dir: 'left' },
      center: { x: centerX, y: centerY, dir: 'center' }
    };
  }

  // Document shape has a wavy bottom edge
  if (type === 'document') {
    return {
      top: { x: centerX, y: y, dir: 'top' },
      right: { x: x + width, y: centerY - 3, dir: 'right' },
      bottom: { x: centerX, y: y + height - 6, dir: 'bottom' },
      left: { x: x, y: centerY - 3, dir: 'left' },
      center: { x: centerX, y: centerY, dir: 'center' }
    };
  }

  return {
    top: { x: centerX, y: y, dir: 'top' },
    right: { x: x + width, y: centerY, dir: 'right' },
    bottom: { x: centerX, y: y + height, dir: 'bottom' },
    left: { x: x, y: centerY, dir: 'left' },
    center: { x: centerX, y: centerY, dir: 'center' }
  };
}

// Find optimal ports between source and target node (respecting explicit ports if set on edge)
export function getBestPortPair(sourceNode, targetNode, edge = null) {
  const sPorts = getNodePorts(sourceNode);
  const tPorts = getNodePorts(targetNode);

  if (edge && edge.fromPort && edge.toPort && sPorts[edge.fromPort] && tPorts[edge.toPort]) {
    return {
      fromPort: sPorts[edge.fromPort],
      toPort: tPorts[edge.toPort],
      fromDir: edge.fromPort,
      toDir: edge.toPort
    };
  }

  const sCenter = sPorts.center;
  const tCenter = tPorts.center;
  const dx = tCenter.x - sCenter.x;
  const dy = tCenter.y - sCenter.y;

  // Smart directional heuristic combined with port distance
  const portKeys = ['top', 'right', 'bottom', 'left'];
  let bestScore = Infinity;
  let bestPair = { fromPort: sPorts.right, toPort: tPorts.left, fromDir: 'right', toDir: 'left' };

  portKeys.forEach(sKey => {
    portKeys.forEach(tKey => {
      if (sourceNode.id === targetNode.id && sKey === tKey) return;
      const sp = sPorts[sKey];
      const tp = tPorts[tKey];
      const dist = Math.hypot(tp.x - sp.x, tp.y - sp.y);

      // Penalize ports that face away from the general direction of the other node
      let penalty = 0;
      if (sKey === 'right' && dx < -20) penalty += 120;
      if (sKey === 'left' && dx > 20) penalty += 120;
      if (sKey === 'bottom' && dy < -20) penalty += 120;
      if (sKey === 'top' && dy > 20) penalty += 120;

      if (tKey === 'left' && dx < -20) penalty += 120;
      if (tKey === 'right' && dx > 20) penalty += 120;
      if (tKey === 'top' && dy < -20) penalty += 120;
      if (tKey === 'bottom' && dy > 20) penalty += 120;

      // Prefer natural flow pairs (right->left, bottom->top, left->right, top->bottom)
      const isNaturalOpposite =
        (sKey === 'right' && tKey === 'left' && dx >= 0) ||
        (sKey === 'left' && tKey === 'right' && dx <= 0) ||
        (sKey === 'bottom' && tKey === 'top' && dy >= 0) ||
        (sKey === 'top' && tKey === 'bottom' && dy <= 0);

      if (isNaturalOpposite) penalty -= 35;

      const score = dist + penalty;
      if (score < bestScore) {
        bestScore = score;
        bestPair = {
          fromPort: edge?.fromPort && sPorts[edge.fromPort] ? sPorts[edge.fromPort] : sp,
          toPort: edge?.toPort && tPorts[edge.toPort] ? tPorts[edge.toPort] : tp,
          fromDir: edge?.fromPort || sKey,
          toDir: edge?.toPort || tKey
        };
      }
    });
  });

  return bestPair;
}

// Helper to step out in a port's normal direction
function stepPort(pt, dist = 24) {
  if (pt.dir === 'right') return { x: pt.x + dist, y: pt.y };
  if (pt.dir === 'left') return { x: pt.x - dist, y: pt.y };
  if (pt.dir === 'bottom') return { x: pt.x, y: pt.y + dist };
  if (pt.dir === 'top') return { x: pt.x, y: pt.y - dist };
  return { x: pt.x, y: pt.y };
}

// Build a rounded SVG path from an array of orthogonal waypoints
function buildRoundedOrthogonalPath(points, radius = 8) {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  // Filter out duplicate consecutive points
  const pts = [points[0]];
  for (let i = 1; i < points.length; i++) {
    if (Math.hypot(points[i].x - pts[pts.length - 1].x, points[i].y - pts[pts.length - 1].y) > 0.5) {
      pts.push(points[i]);
    }
  }
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const next = pts[i + 1];

    const v1x = curr.x - prev.x;
    const v1y = curr.y - prev.y;
    const len1 = Math.hypot(v1x, v1y);

    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;
    const len2 = Math.hypot(v2x, v2y);

    const r = Math.min(radius, len1 / 2, len2 / 2);
    if (r < 1) {
      d += ` L ${curr.x} ${curr.y}`;
    } else {
      const startX = curr.x - (v1x / len1) * r;
      const startY = curr.y - (v1y / len1) * r;
      const endX = curr.x + (v2x / len2) * r;
      const endY = curr.y + (v2y / len2) * r;
      d += ` L ${startX.toFixed(1)} ${startY.toFixed(1)} Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`;
    }
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

// Generate SVG Path data based on connection line style
export function calculatePathData(fromPoint, toPoint, style = 'orthogonal') {
  const { x: x1, y: y1, dir: dir1 = 'right' } = fromPoint;
  const { x: x2, y: y2, dir: dir2 = 'left' } = toPoint;

  if (style === 'straight') {
    return {
      d: `M ${x1} ${y1} L ${x2} ${y2}`,
      midPoint: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }
    };
  }

  if (style === 'curved') {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const offset = Math.max(Math.min(dist * 0.45, 140), 40);
    let cx1 = x1, cy1 = y1, cx2 = x2, cy2 = y2;

    if (dir1 === 'right') cx1 += offset;
    else if (dir1 === 'left') cx1 -= offset;
    else if (dir1 === 'bottom') cy1 += offset;
    else if (dir1 === 'top') cy1 -= offset;

    if (dir2 === 'right') cx2 += offset;
    else if (dir2 === 'left') cx2 -= offset;
    else if (dir2 === 'bottom') cy2 += offset;
    else if (dir2 === 'top') cy2 -= offset;
    else {
      // Target is free cursor ('center')
      cx2 = (x1 + x2) / 2;
      cy2 = (y1 + y2) / 2;
    }

    const midPoint = {
      x: 0.125 * x1 + 0.375 * cx1 + 0.375 * cx2 + 0.125 * x2,
      y: 0.125 * y1 + 0.375 * cy1 + 0.375 * cy2 + 0.125 * y2
    };

    return {
      d: `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`,
      midPoint
    };
  }

  // Default: Smart Orthogonal routing with proper exit and entry normal directions
  const isHoriz1 = dir1 === 'left' || dir1 === 'right';
  const isHoriz2 = dir2 === 'left' || dir2 === 'right' || dir2 === 'center';

  const margin = 22;
  const p1 = { x: x1, y: y1 };
  const p2 = { x: x2, y: y2 };
  const s1 = stepPort(fromPoint, margin);
  const s2 = dir2 === 'center' ? p2 : stepPort(toPoint, margin);

  let points = [];

  if (dir2 === 'center') {
    // Dragging preview line
    if (isHoriz1) {
      const midX = (x1 + x2) / 2;
      points = [p1, { x: midX, y: y1 }, { x: midX, y: y2 }, p2];
    } else {
      const midY = (y1 + y2) / 2;
      points = [p1, { x: x1, y: midY }, { x: x2, y: midY }, p2];
    }
  } else if (isHoriz1 && isHoriz2) {
    // Both ports are horizontal (e.g. right -> left, right -> right, left -> left)
    const canGoDirectMid =
      (dir1 === 'right' && dir2 === 'left' && x2 >= x1 + 10) ||
      (dir1 === 'left' && dir2 === 'right' && x2 <= x1 - 10);

    if (canGoDirectMid) {
      const midX = (x1 + x2) / 2;
      points = [p1, { x: midX, y: y1 }, { x: midX, y: y2 }, p2];
    } else {
      const midY = (y1 + y2) / 2;
      points = [p1, s1, { x: s1.x, y: midY }, { x: s2.x, y: midY }, s2, p2];
    }
  } else if (!isHoriz1 && !isHoriz2) {
    // Both ports are vertical (e.g. bottom -> top, bottom -> bottom, top -> top)
    const canGoDirectMid =
      (dir1 === 'bottom' && dir2 === 'top' && y2 >= y1 + 10) ||
      (dir1 === 'top' && dir2 === 'bottom' && y2 <= y1 - 10);

    if (canGoDirectMid) {
      const midY = (y1 + y2) / 2;
      points = [p1, { x: x1, y: midY }, { x: x2, y: midY }, p2];
    } else {
      const midX = (x1 + x2) / 2;
      points = [p1, s1, { x: midX, y: s1.y }, { x: midX, y: s2.y }, s2, p2];
    }
  } else if (isHoriz1 && !isHoriz2) {
    // Horizontal exit -> Vertical entry (e.g. right -> top, left -> bottom)
    const dir1Ok = (dir1 === 'right' && x2 >= s1.x) || (dir1 === 'left' && x2 <= s1.x);
    const dir2Ok = (dir2 === 'top' && y1 <= s2.y) || (dir2 === 'bottom' && y1 >= s2.y);

    if (dir1Ok && dir2Ok) {
      points = [p1, { x: x2, y: y1 }, p2];
    } else {
      points = [p1, s1, { x: s1.x, y: s2.y }, s2, p2];
    }
  } else {
    // Vertical exit -> Horizontal entry (e.g. bottom -> left, top -> right)
    const dir1Ok = (dir1 === 'bottom' && y2 >= s1.y) || (dir1 === 'top' && y2 <= s1.y);
    const dir2Ok = (dir2 === 'left' && x1 <= s2.x) || (dir2 === 'right' && x1 >= s2.x);

    if (dir1Ok && dir2Ok) {
      points = [p1, { x: x1, y: y2 }, p2];
    } else {
      points = [p1, s1, { x: s2.x, y: s1.y }, s2, p2];
    }
  }

  // Calculate midpoint along the polyline for label placement
  let totalLen = 0;
  const segLens = [];
  for (let i = 1; i < points.length; i++) {
    const l = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    segLens.push(l);
    totalLen += l;
  }

  let midPoint = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
  let halfLen = totalLen / 2;
  let accum = 0;
  for (let i = 0; i < segLens.length; i++) {
    if (accum + segLens[i] >= halfLen && segLens[i] > 0) {
      const t = (halfLen - accum) / segLens[i];
      midPoint = {
        x: points[i].x + (points[i + 1].x - points[i].x) * t,
        y: points[i].y + (points[i + 1].y - points[i].y) * t
      };
      break;
    }
    accum += segLens[i];
  }

  return {
    d: buildRoundedOrthogonalPath(points, 8),
    midPoint
  };
}

// Compute automatic dynamic node dimensions and wrapped lines so text NEVER overflows its shape
export function computeAutoNodeLayout(node) {
  const label = (node.label ?? '').toString();
  const fontSize = node.fontSize || 14;
  const type = node.type || 'process';

  // Base minimum dimensions per shape type
  const minDims = {
    terminal: { w: 130, h: 54 },
    process: { w: 145, h: 68 },
    decision: { w: 145, h: 100 },
    database: { w: 135, h: 86 },
    document: { w: 145, h: 80 },
    input: { w: 155, h: 66 },
    note: { w: 145, h: 96 }
  }[type] || { w: 145, h: 68 };

  // Shape-specific geometric padding multipliers
  // Diamonds inscribed rectangle takes ~50% width/height, parallelograms have side skew, cylinders have top/bottom caps
  const shapeFactor = {
    terminal: { padX: 36, padY: 26, scaleW: 1.0, scaleH: 1.0, maxCharsPerLine: 22 },
    process: { padX: 28, padY: 26, scaleW: 1.0, scaleH: 1.0, maxCharsPerLine: 22 },
    decision: { padX: 36, padY: 32, scaleW: 1.65, scaleH: 1.65, maxCharsPerLine: 16 },
    database: { padX: 28, padY: 42, scaleW: 1.0, scaleH: 1.0, maxCharsPerLine: 20 },
    document: { padX: 28, padY: 36, scaleW: 1.0, scaleH: 1.0, maxCharsPerLine: 20 },
    input: { padX: 48, padY: 26, scaleW: 1.0, scaleH: 1.0, maxCharsPerLine: 20 },
    note: { padX: 28, padY: 28, scaleW: 1.0, scaleH: 1.0, maxCharsPerLine: 22 }
  }[type] || { padX: 28, padY: 26, scaleW: 1.0, scaleH: 1.0, maxCharsPerLine: 22 };

  // Word-wrap text into balanced lines
  const rawParagraphs = label.split('\n');
  const lines = [];
  const targetWrapChars = Math.max(
    shapeFactor.maxCharsPerLine,
    Math.ceil(Math.sqrt(label.length) * 2.4)
  );

  rawParagraphs.forEach(para => {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      return;
    }
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      if ((currentLine + ' ' + word).length <= targetWrapChars) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
  });

  if (lines.length === 0) lines.push('');

  const charWidth = fontSize * 0.6;
  const lineHeight = Math.round(fontSize * 1.35);

  const longestLineChars = Math.max(...lines.map(l => l.length), 1);
  const textBlockWidth = longestLineChars * charWidth;
  const textBlockHeight = lines.length * lineHeight;

  const requiredWidth = Math.ceil(textBlockWidth * shapeFactor.scaleW + shapeFactor.padX);
  const requiredHeight = Math.ceil(textBlockHeight * shapeFactor.scaleH + shapeFactor.padY);

  // Respect manual resizing if larger, or shrink/expand dynamically with text
  const finalWidth = Math.max(minDims.w, requiredWidth, node.manualMinWidth || 0);
  const finalHeight = Math.max(minDims.h, requiredHeight, node.manualMinHeight || 0);

  return {
    width: finalWidth,
    height: finalHeight,
    lines,
    lineHeight
  };
}
