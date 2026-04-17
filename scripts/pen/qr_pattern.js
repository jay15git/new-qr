/**
 * @schema 2.10
 */
const size = Math.min(pencil.width, pencil.height);
const modules = 21;
const gap = 4;
const cell = Math.floor((size - gap * (modules - 1)) / modules);
const total = cell * modules + gap * (modules - 1);
const ox = Math.floor((pencil.width - total) / 2);
const oy = Math.floor((pencil.height - total) / 2);

function inFinder(r, c, fr, fc) {
  return r >= fr && r < fr + 7 && c >= fc && c < fc + 7;
}

function isFinderEdge(r, c, fr, fc) {
  return r === fr || r === fr + 6 || c === fc || c === fc + 6;
}

function isFinderCenter(r, c, fr, fc) {
  return r >= fr + 2 && r <= fr + 4 && c >= fc + 2 && c <= fc + 4;
}

function keepCell(r, c) {
  const avoidCenter = r >= 8 && r <= 12 && c >= 8 && c <= 12;
  if (avoidCenter) return false;

  if (inFinder(r, c, 0, 0)) return isFinderEdge(r, c, 0, 0) || isFinderCenter(r, c, 0, 0);
  if (inFinder(r, c, 0, modules - 7)) return isFinderEdge(r, c, 0, modules - 7) || isFinderCenter(r, c, 0, modules - 7);
  if (inFinder(r, c, modules - 7, 0)) return isFinderEdge(r, c, modules - 7, 0) || isFinderCenter(r, c, modules - 7, 0);

  const t = ((r * 17 + c * 31 + r * c * 7) % 11);
  return t < 6;
}

const nodes = [];
for (let r = 0; r < modules; r++) {
  for (let c = 0; c < modules; c++) {
    if (!keepCell(r, c)) continue;
    nodes.push({
      type: 'rectangle',
      x: ox + c * (cell + gap),
      y: oy + r * (cell + gap),
      width: cell,
      height: cell,
      cornerRadius: 2,
      fill: '#111111',
    });
  }
}

nodes.push({
  type: 'frame',
  x: Math.floor(pencil.width / 2) - 27,
  y: Math.floor(pencil.height / 2) - 27,
  width: 54,
  height: 54,
  cornerRadius: 4,
  layout: 'none',
  fill: '#111111',
  stroke: { align: 'inside', fill: '#FFFFFF', thickness: 2 },
  children: [
    { type: 'ellipse', x: 12, y: 12, width: 30, height: 30, fill: '#111111', stroke: { align: 'inside', fill: '#FFFFFF', thickness: 2 } },
    { type: 'ellipse', x: 19, y: 19, width: 16, height: 16, fill: '#111111', stroke: { align: 'inside', fill: '#FFFFFF', thickness: 2 } },
  ],
});

return nodes;
