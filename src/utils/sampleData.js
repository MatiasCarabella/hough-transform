/**
 * Generate sample points for line detection
 */
export const generateLinePoints = (canvasSize) => {
  const points = [];

  // Diagonal line
  for (let i = 0; i < 50; i++) {
    const x = 50 + i * 6;
    const y = 50 + i * 4 + (Math.random() - 0.5) * 10;
    if (x < canvasSize && y < canvasSize) {
      points.push({ x: Math.round(x), y: Math.round(y) });
    }
  }

  // Horizontal line
  for (let i = 0; i < 40; i++) {
    const x = 50 + i * 7;
    const y = 200 + (Math.random() - 0.5) * 15;
    if (x < canvasSize && y < canvasSize) {
      points.push({ x: Math.round(x), y: Math.round(y) });
    }
  }

  // Noise
  for (let i = 0; i < 20; i++) {
    points.push({
      x: Math.round(Math.random() * canvasSize),
      y: Math.round(Math.random() * canvasSize)
    });
  }

  return points;
};

/**
 * Generate sample points for circle detection
 */
export const generateCirclePoints = (canvasSize, radius) => {
  const points = [];

  // Circle 1
  const cx1 = 150, cy1 = 150;
  for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
    const x = cx1 + radius * Math.cos(angle) + (Math.random() - 0.5) * 5;
    const y = cy1 + radius * Math.sin(angle) + (Math.random() - 0.5) * 5;
    if (x >= 0 && x < canvasSize && y >= 0 && y < canvasSize) {
      points.push({ x: Math.round(x), y: Math.round(y) });
    }
  }

  // Circle 2
  const cx2 = 80, cy2 = 80;
  for (let angle = 0; angle < Math.PI * 2; angle += 0.25) {
    const x = cx2 + (radius / 2) * Math.cos(angle) + (Math.random() - 0.5) * 5;
    const y = cy2 + (radius / 2) * Math.sin(angle) + (Math.random() - 0.5) * 5;
    if (x >= 0 && x < canvasSize && y >= 0 && y < canvasSize) {
      points.push({ x: Math.round(x), y: Math.round(y) });
    }
  }

  // Noise
  for (let i = 0; i < 15; i++) {
    points.push({
      x: Math.round(Math.random() * canvasSize),
      y: Math.round(Math.random() * canvasSize)
    });
  }

  return points;
};
