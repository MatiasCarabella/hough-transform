const SHAPE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

/**
 * Draw grid on canvas
 */
const drawGrid = (ctx, size) => {
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  for (let i = 0; i <= size; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }
};

/**
 * Draw points on canvas
 */
const drawPoints = (ctx, points) => {
  ctx.fillStyle = '#64748b';
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fill();
  });
};

/**
 * Draw detected lines
 */
const drawLines = (ctx, lines, canvasSize) => {
  lines.forEach((line, idx) => {
    ctx.strokeStyle = SHAPE_COLORS[idx % SHAPE_COLORS.length];
    ctx.lineWidth = 2;
    ctx.beginPath();

    const { theta, rho } = line;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    if (Math.abs(sin) > 0.001) {
      const x1 = 0;
      const y1 = (rho - x1 * cos) / sin;
      const x2 = canvasSize;
      const y2 = (rho - x2 * cos) / sin;

      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    } else {
      const x = rho / cos;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasSize);
    }

    ctx.stroke();
  });
};

/**
 * Draw detected circles
 */
const drawCircles = (ctx, circles) => {
  circles.forEach((circle, idx) => {
    const color = SHAPE_COLORS[idx % SHAPE_COLORS.length];
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(circle.xo, circle.yo, circle.r, 0, Math.PI * 2);
    ctx.stroke();

    // Draw center marker
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(circle.xo, circle.yo, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw crosshair
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(circle.xo - 10, circle.yo);
    ctx.lineTo(circle.xo + 10, circle.yo);
    ctx.moveTo(circle.xo, circle.yo - 10);
    ctx.lineTo(circle.xo, circle.yo + 10);
    ctx.stroke();
  });
};

/**
 * Render original space canvas
 */
export const renderOriginalSpace = (ctx, canvas, points, detectedShapes, mode) => {
  const size = canvas.width;

  // Clear and fill background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, size, size);

  // Draw grid
  drawGrid(ctx, size);

  // Draw points
  drawPoints(ctx, points);

  // Draw detected shapes
  if (mode === 'lines') {
    drawLines(ctx, detectedShapes, size);
  } else {
    drawCircles(ctx, detectedShapes);
  }
};

/**
 * Get color for heatmap based on normalized value
 */
const getHeatmapColor = (normalizedValue) => {
  let r, g, b;
  if (normalizedValue < 0.25) {
    const t = normalizedValue / 0.25;
    r = 0;
    g = Math.floor(t * 150);
    b = Math.floor(150 + t * 105);
  } else if (normalizedValue < 0.5) {
    const t = (normalizedValue - 0.25) / 0.25;
    r = 0;
    g = Math.floor(150 + t * 105);
    b = Math.floor(255 - t * 155);
  } else if (normalizedValue < 0.75) {
    const t = (normalizedValue - 0.5) / 0.25;
    r = Math.floor(t * 255);
    g = 255;
    b = Math.floor(100 - t * 100);
  } else {
    const t = (normalizedValue - 0.75) / 0.25;
    r = 255;
    g = Math.floor(255 - t * 155);
    b = 0;
  }
  return { r, g, b };
};

/**
 * Draw color legend
 */
const drawLegend = (ctx, size, maxVal) => {
  const legendHeight = 20;
  const legendWidth = size - 40;
  const legendX = 20;
  const legendY = size - 30;

  for (let i = 0; i < legendWidth; i++) {
    const t = i / legendWidth;
    const { r, g, b } = getHeatmapColor(t);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(legendX + i, legendY, 1, legendHeight);
  }

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);

  ctx.fillStyle = '#ffffff';
  ctx.font = '10px monospace';
  ctx.fillText('0', legendX, legendY - 4);
  ctx.fillText(`${maxVal}`, legendX + legendWidth - 20, legendY - 4);
};

/**
 * Draw detected maxima markers
 */
const drawMaximaMarkers = (ctx, detectedShapes, mode, houghSpace, canvasSize, houghSize, resolution) => {
  detectedShapes.forEach(shape => {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();

    if (mode === 'lines') {
      const rhoMax = Math.sqrt(canvasSize * canvasSize * 2);
      const thetaIdx = (shape.theta / Math.PI) * 180;
      const rhoIdx = shape.rho + rhoMax / 2;

      const x = (rhoIdx / houghSpace[0].length) * houghSize;
      const y = (thetaIdx / houghSpace.length) * houghSize;

      ctx.arc(x, y, 5, 0, Math.PI * 2);
    } else {
      const x = (shape.xo / resolution / houghSpace.length) * houghSize;
      const y = (shape.yo / resolution / houghSpace[0].length) * houghSize;

      ctx.arc(x, y, 6, 0, Math.PI * 2);
    }

    ctx.stroke();
  });
};

/**
 * Render Hough space canvas
 */
export const renderHoughSpace = (
  ctx,
  canvas,
  houghSpace,
  detectedShapes,
  mode,
  canvasSize,
  resolution
) => {
  const size = canvas.width;

  // Clear and fill background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, size, size);

  if (houghSpace.length === 0) return;

  const maxVal = Math.max(...houghSpace.flat());
  if (maxVal === 0) return;

  const rows = houghSpace.length;
  const cols = houghSpace[0].length;
  const cellWidth = size / cols;
  const cellHeight = size / rows;

  // Draw heatmap
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const value = houghSpace[i][j];

      if (value === 0) {
        ctx.fillStyle = '#0f172a';
      } else {
        const normalizedValue = Math.log(value + 1) / Math.log(maxVal + 1);
        const { r, g, b } = getHeatmapColor(normalizedValue);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      }

      ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth + 1, cellHeight + 1);
    }
  }

  // Draw maxima markers
  drawMaximaMarkers(ctx, detectedShapes, mode, houghSpace, canvasSize, size, resolution);

  // Draw legend
  drawLegend(ctx, size, maxVal);
};
