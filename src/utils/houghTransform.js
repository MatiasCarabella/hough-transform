/**
 * Hough Transform for Line Detection
 * Transforms points from Cartesian (x,y) to polar (ρ,θ) space
 */
export const houghTransformLines = (points, canvasSize, threshold) => {
  const rhoMax = Math.sqrt(canvasSize * canvasSize * 2);
  const thetaSteps = 180;
  const rhoSteps = Math.floor(rhoMax);

  const accumulator = Array(thetaSteps)
    .fill(0)
    .map(() => Array(rhoSteps).fill(0));

  // Vote for each point
  points.forEach(point => {
    for (let t = 0; t < thetaSteps; t++) {
      const theta = (t * Math.PI) / thetaSteps;
      const rho = point.x * Math.cos(theta) + point.y * Math.sin(theta);
      const rhoIdx = Math.floor(rho + rhoMax / 2);

      if (rhoIdx >= 0 && rhoIdx < rhoSteps) {
        accumulator[t][rhoIdx]++;
      }
    }
  });

  // Find local maxima
  const detected = [];
  for (let t = 1; t < thetaSteps - 1; t++) {
    for (let r = 1; r < rhoSteps - 1; r++) {
      if (accumulator[t][r] >= threshold) {
        let isMax = true;
        for (let dt = -1; dt <= 1; dt++) {
          for (let dr = -1; dr <= 1; dr++) {
            if (accumulator[t + dt][r + dr] > accumulator[t][r]) {
              isMax = false;
              break;
            }
          }
          if (!isMax) break;
        }

        if (isMax) {
          const theta = (t * Math.PI) / thetaSteps;
          const rho = r - rhoMax / 2;
          detected.push({ theta, rho, votes: accumulator[t][r] });
        }
      }
    }
  }

  detected.sort((a, b) => b.votes - a.votes);
  return {
    accumulator,
    detected: detected.slice(0, 100)
  };
};

/**
 * Hough Transform for Circle Detection
 * Transforms points to center space (xo,yo) with known radius
 */
export const houghTransformCircles = (points, canvasSize, radius, threshold, resolution) => {
  const accSize = Math.floor(canvasSize / resolution);
  const accumulator = Array(accSize)
    .fill(0)
    .map(() => Array(accSize).fill(0));

  const angleStep = 5;

  // Vote for each point
  points.forEach(point => {
    for (let angle = 0; angle < 360; angle += angleStep) {
      const theta = (angle * Math.PI) / 180;
      const xo = (point.x - radius * Math.cos(theta)) / resolution;
      const yo = (point.y - radius * Math.sin(theta)) / resolution;

      const xoIdx = Math.round(xo);
      const yoIdx = Math.round(yo);

      if (xoIdx >= 0 && xoIdx < accSize && yoIdx >= 0 && yoIdx < accSize) {
        accumulator[xoIdx][yoIdx]++;
      }
    }
  });

  // Find local maxima
  const detected = [];
  const searchRadius = 3;

  for (let x = searchRadius; x < accSize - searchRadius; x++) {
    for (let y = searchRadius; y < accSize - searchRadius; y++) {
      if (accumulator[x][y] >= threshold) {
        let isMax = true;
        for (let dx = -searchRadius; dx <= searchRadius && isMax; dx++) {
          for (let dy = -searchRadius; dy <= searchRadius && isMax; dy++) {
            if (accumulator[x + dx][y + dy] > accumulator[x][y]) {
              isMax = false;
            }
          }
        }

        if (isMax) {
          detected.push({
            xo: x * resolution,
            yo: y * resolution,
            r: radius,
            votes: accumulator[x][y]
          });
        }
      }
    }
  }

  detected.sort((a, b) => b.votes - a.votes);
  return {
    accumulator,
    detected: detected.slice(0, 5)
  };
};
