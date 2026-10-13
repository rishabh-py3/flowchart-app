import { calculatePathData, getBestPortPair, computeAutoNodeLayout } from './geometry';

/**
 * Generates an SVG string containing ONLY the flowchart elements:
 * neatly cropped to the nodes & connections bounding box with balanced padding,
 * clean theme background, and no UI controls, grid dots, or selection handles.
 */
export function generateFlowchartSvg({ nodes, edges, theme, padding = 48 }) {
  const sizedNodesMap = {};
  const sizedNodes = nodes.map(n => {
    const layout = computeAutoNodeLayout(n);
    const sn = {
      ...n,
      width: layout.width,
      height: layout.height,
      _lines: layout.lines,
      _lineHeight: layout.lineHeight
    };
    sizedNodesMap[n.id] = sn;
    return sn;
  });

  if (sizedNodes.length === 0) {
    return null;
  }

  // Calculate tight bounding box containing all nodes
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  sizedNodes.forEach(n => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + n.width);
    maxY = Math.max(maxY, n.y + n.height);
  });

  const exportMinX = Math.round(minX - padding);
  const exportMinY = Math.round(minY - padding);
  const width = Math.max(200, Math.round(maxX - minX + padding * 2));
  const height = Math.max(160, Math.round(maxY - minY + padding * 2));

  const edgeColor = theme?.edgeStroke || '#736049';
  const bgColor = theme?.bgColor || '#f3ede0';

  const escapeXml = (str) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${exportMinX} ${exportMinY} ${width} ${height}" width="${width}" height="${height}">`;

  // Defs & Markers
  svg += `<defs>
    <filter id="fc-node-shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(74, 60, 44, 0.12)" />
    </filter>
    <marker id="fc-arrow" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
      <polygon points="0 0.5, 8.5 3.5, 0 6.5" fill="${edgeColor}" />
    </marker>
  </defs>`;

  // Clean background of the board (no grid, no UI)
  svg += `<rect x="${exportMinX}" y="${exportMinY}" width="${width}" height="${height}" fill="${bgColor}"/>`;

  // Edges / Connections
  edges.forEach(e => {
    const sn = sizedNodesMap[e.from];
    const tn = sizedNodesMap[e.to];
    if (!sn || !tn) return;
    const { fromPort, toPort } = getBestPortPair(sn, tn, e);
    const pathInfo = calculatePathData(fromPort, toPort, e.style || 'orthogonal');
    const strokeColor = e.stroke || edgeColor;

    svg += `<path d="${pathInfo.d}" fill="none" stroke="${strokeColor}" stroke-width="2" marker-end="url(#fc-arrow)" />`;

    if (e.label) {
      const isMostlyHoriz = Math.abs(toPort.x - fromPort.x) >= Math.abs(toPort.y - fromPort.y);
      const lx = pathInfo.midPoint.x + (isMostlyHoriz ? 0 : 18);
      const ly = pathInfo.midPoint.y + (isMostlyHoriz ? -12 : 0);
      const labelText = escapeXml(e.label);
      const labelWidth = Math.max(28, labelText.length * 7 + 12);
      
      svg += `<rect x="${lx - labelWidth / 2}" y="${ly - 9}" width="${labelWidth}" height="18" rx="5" fill="${bgColor}" stroke="${strokeColor}" stroke-width="0.8" opacity="0.95"/>`;
      svg += `<text x="${lx}" y="${ly + 4}" fill="${theme?.textDark ? '#3b3023' : '#2c251d'}" font-size="11" font-family="Inter, -apple-system, sans-serif" font-weight="500" text-anchor="middle">${labelText}</text>`;
    }
  });

  // Nodes
  sizedNodes.forEach(n => {
    const { x, y, width: nw, height: nh, type, fill, stroke } = n;
    const st = stroke || '#6d624d';
    svg += `<g transform="translate(${x}, ${y})">`;

    if (type === 'terminal' || type === 'pill') {
      const pillRadius = Math.round(Math.min(nw, nh) / 2);
      svg += `<rect width="${nw}" height="${nh}" rx="${pillRadius}" fill="${fill}" stroke="${st}" stroke-width="1.6" filter="url(#fc-node-shadow)"/>`;
    } else if (type === 'decision' || type === 'diamond') {
      svg += `<polygon points="${nw / 2},0 ${nw},${nh / 2} ${nw / 2},${nh} 0,${nh / 2}" stroke-linejoin="round" fill="${fill}" stroke="${st}" stroke-width="1.6" filter="url(#fc-node-shadow)"/>`;
    } else if (type === 'database' || type === 'cylinder') {
      const rx = nw / 2;
      const ry = 10;
      svg += `<g filter="url(#fc-node-shadow)">`;
      svg += `<path d="M 0 ${ry} v ${nh - 2 * ry} a ${rx} ${ry} 0 0 0 ${nw} 0 v -${nh - 2 * ry}" fill="${fill}" stroke="${st}" stroke-width="1.6"/>`;
      svg += `<ellipse cx="${rx}" cy="${ry}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${st}" stroke-width="1.6"/>`;
      svg += `</g>`;
    } else if (type === 'document') {
      svg += `<path d="M 0 0 H ${nw} V ${nh - 11} Q ${nw * 0.75} ${nh + 2} ${nw * 0.5} ${nh - 9} T 0 ${nh - 11} Z" fill="${fill}" stroke="${st}" stroke-width="1.6" filter="url(#fc-node-shadow)"/>`;
    } else if (type === 'input' || type === 'parallelogram') {
      const skew = Math.min(20, nw * 0.15);
      svg += `<polygon points="${skew},0 ${nw},0 ${nw - skew},${nh} 0,${nh}" stroke-linejoin="round" fill="${fill}" stroke="${st}" stroke-width="1.6" filter="url(#fc-node-shadow)"/>`;
    } else if (type === 'note') {
      svg += `<g filter="url(#fc-node-shadow)">`;
      svg += `<rect width="${nw}" height="${nh}" rx="6" fill="${fill}" stroke="${st}" stroke-width="1.5"/>`;
      svg += `<polygon points="${nw - 14},${nh} ${nw},${nh - 14} ${nw - 14},${nh - 14}" fill="rgba(90, 70, 45, 0.22)"/>`;
      svg += `</g>`;
    } else {
      svg += `<rect width="${nw}" height="${nh}" rx="10" fill="${fill}" stroke="${st}" stroke-width="1.6" filter="url(#fc-node-shadow)"/>`;
    }

    // Node Text (Centered, multi-line)
    const lines = n._lines || [n.label];
    const lineHeight = n._lineHeight || 18;
    const fontSize = n.fontSize || 13;
    const totalTextHeight = lines.length * lineHeight;
    const startTextY = (nh - totalTextHeight) / 2 + fontSize * 0.82 + (type === 'database' ? 6 : 0) - (type === 'document' ? 4 : 0);

    svg += `<text x="${nw / 2}" fill="${n.text || '#2c251d'}" font-size="${fontSize}" font-family="Inter, -apple-system, sans-serif" text-anchor="middle" font-weight="500">`;
    lines.forEach((line, i) => {
      svg += `<tspan x="${nw / 2}" y="${startTextY + i * lineHeight}">${escapeXml(line)}</tspan>`;
    });
    svg += `</text>`;

    // Step Badge Number
    if (n.stepIndex) {
      const bx = type === 'decision' ? nw / 2 : type === 'input' ? nw - 10 : nw - 6;
      svg += `<g transform="translate(${bx}, -4)">
        <circle r="11" fill="#f6efe0" stroke="#7a6852" stroke-width="1.2"/>
        <text y="3.8" text-anchor="middle" fill="#3b3023" font-size="11" font-family="Inter, -apple-system, sans-serif" font-weight="600">${n.stepIndex}</text>
      </g>`;
    }

    svg += `</g>`;
  });

  svg += `</svg>`;
  return { svgStr: svg, width, height };
}

/**
 * Downloads a high-definition PNG image showing ONLY the flowchart
 * with clean cropping, high DPI scaling, and nothing else.
 */
export function downloadFlowchartImage({ nodes, edges, theme, filename }) {
  if (!nodes || nodes.length === 0) {
    alert('Your canvas is empty. Add flowchart blocks before downloading.');
    return;
  }

  const result = generateFlowchartSvg({ nodes, edges, theme });
  if (!result) return;
  const { svgStr, width, height } = result;

  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.onload = () => {
    try {
      const scale = 2; // 2x Retina scale for crisp sharpness
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = filename || `flowchart-${Date.now()}.png`;
        link.href = pngUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      // Fallback to SVG if canvas toDataURL fails
      const link = document.createElement('a');
      link.download = (filename ? filename.replace(/\.png$/, '') : `flowchart-${Date.now()}`) + '.svg';
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  img.onerror = () => {
    // If image loading fails, download SVG directly
    const link = document.createElement('a');
    link.download = (filename ? filename.replace(/\.png$/, '') : `flowchart-${Date.now()}`) + '.svg';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  img.src = url;
}
