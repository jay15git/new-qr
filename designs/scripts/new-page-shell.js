/**
 * @schema 2.10
 */

const DASH = 2;
const GAP = 4;
const STROKE = "#00000024";
const CORNER = "#00000059";
const DASH_THICKNESS = 1;
const CROSS_THICKNESS = 1.25;

function buildHorizontalGeometry(width) {
  const commands = [];
  for (let cursor = 0; cursor < width; cursor += DASH + GAP) {
    const end = Math.min(cursor + DASH, width);
    commands.push(`M${cursor} 0.5 H${end}`);
  }
  return commands.join(" ");
}

function buildVerticalGeometry(height) {
  const commands = [];
  for (let cursor = 0; cursor < height; cursor += DASH + GAP) {
    const end = Math.min(cursor + DASH, height);
    commands.push(`M0.5 ${cursor} V${end}`);
  }
  return commands.join(" ");
}

function dashedHorizontalPath(x, y, width) {
  return {
    type: "path",
    x,
    y,
    width,
    height: DASH_THICKNESS,
    viewBox: [0, 0, width, DASH_THICKNESS],
    geometry: buildHorizontalGeometry(width),
    stroke: {
      align: "center",
      thickness: DASH_THICKNESS,
      cap: "round",
      fill: STROKE,
    },
  };
}

function dashedVerticalPath(x, y, height) {
  return {
    type: "path",
    x,
    y,
    width: DASH_THICKNESS,
    height,
    viewBox: [0, 0, DASH_THICKNESS, height],
    geometry: buildVerticalGeometry(height),
    stroke: {
      align: "center",
      thickness: DASH_THICKNESS,
      cap: "round",
      fill: STROKE,
    },
  };
}

function plusCorner(x, y) {
  return [
    {
      type: "rectangle",
      x: x + 7.5,
      y,
      width: CROSS_THICKNESS,
      height: 16,
      fill: CORNER,
    },
    {
      type: "rectangle",
      x,
      y: y + 7.5,
      width: 16,
      height: CROSS_THICKNESS,
      fill: CORNER,
    },
  ];
}

const nodes = [
  dashedHorizontalPath(32, 32, 1376),
  dashedVerticalPath(32, 32, 63),
  dashedVerticalPath(1408, 32, 63),
  dashedHorizontalPath(32, 95, 1376),
  dashedVerticalPath(32, 95, 896),
  dashedVerticalPath(160, 95, 896),
  dashedVerticalPath(415, 95, 896),
  dashedVerticalPath(1408, 95, 896),
  dashedHorizontalPath(32, 991, 1376),
  ...plusCorner(24, 24),
  ...plusCorner(1400, 24),
  ...plusCorner(24, 87),
  ...plusCorner(152, 87),
  ...plusCorner(407, 87),
  ...plusCorner(1400, 87),
  ...plusCorner(24, 983),
  ...plusCorner(152, 983),
  ...plusCorner(407, 983),
  ...plusCorner(1400, 983),
];

return nodes;
