// Calculates connection points (ports) on a node bounding box
export function getNodePorts(node) {
  const { x, y, width, height } = node;
  const halfW = width / 2;
  const halfH = height / 2;
  const centerX = x + halfW;
  const centerY = y + halfH;

  return {
    top: { x: centerX, y: y, dir: 'top' },
    right: { x: x + width, y: centerY, dir: 'right' },
    bottom: { x: centerX, y: y + height, dir: 'bottom' },
    left: { x: x, y: centerY, dir: 'left' },
    center: { x: centerX, y: centerY, dir: 'center' }
  };
}

// Find closest ports between source and target node
export function getBestPortPair(sourceNode, targetNode) {
  const sPorts = getNodePorts(sourceNode);
  const tPorts = getNodePorts(targetNode);

  const portKeys = ['top', 'right', 'bottom', 'left'];
  let minDist = Infinity;
  let bestPair = { fromPort: sPorts.right, toPort: tPorts.left };

  portKeys.forEach(sKey => {
    portKeys.forEach(tKey => {
      const sp = sPorts[sKey];
      const tp = tPorts[tKey];
      const dist = Math.hypot(tp.x - sp.x, tp.y - sp.y);
      if (dist < minDist) {
        minDist = dist;
        bestPair = { fromPort: sp, toPort: tp };
      }
    });
  });

  return bestPair;
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
    let dx = Math.abs(x2 - x1) / 2;
    let dy = Math.abs(y2 - y1) / 2;
    let cx1 = x1, cy1 = y1, cx2 = x2, cy2 = y2;

    if (dir1 === 'right') cx1 += Math.max(dx, 40);
    else if (dir1 === 'left') cx1 -= Math.max(dx, 40);
    else if (dir1 === 'bottom') cy1 += Math.max(dy, 40);
    else if (dir1 === 'top') cy1 -= Math.max(dy, 40);

    if (dir2 === 'right') cx2 += Math.max(dx, 40);
    else if (dir2 === 'left') cx2 -= Math.max(dx, 40);
    else if (dir2 === 'bottom') cy2 += Math.max(dy, 40);
    else if (dir2 === 'top') cy2 -= Math.max(dy, 40);

    const midPoint = {
      x: 0.125 * x1 + 0.375 * cx1 + 0.375 * cx2 + 0.125 * x2,
      y: 0.125 * y1 + 0.375 * cy1 + 0.375 * cy2 + 0.125 * y2
    };

    return {
      d: `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`,
      midPoint
    };
  }

  // Default: Orthogonal (stepping line with rounded elbow corners)
  let midX = (x1 + x2) / 2;
  let midY = (y1 + y2) / 2;

  let pathString = `M ${x1} ${y1} `;
  
  if (dir1 === 'left' || dir1 === 'right') {
    pathString += `L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
  } else {
    pathString += `L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
  }

  return {
    d: pathString,
    midPoint: { x: midX, y: midY }
  };
}
