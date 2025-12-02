import { useState, useEffect, useCallback } from 'react';
import ControlPanel from './components/ControlPanel';
import Canvas from './components/Canvas';
import InfoPanel from './components/InfoPanel';
import DetectedShapesList from './components/DetectedShapesList';
import { houghTransformLines, houghTransformCircles } from './utils/houghTransform';
import { generateLinePoints, generateCirclePoints } from './utils/sampleData';
import { renderOriginalSpace, renderHoughSpace } from './utils/canvasRenderer';
import './App.css';

const CANVAS_SIZE = 280;
const HOUGH_SIZE = 280;

const HoughTransform = () => {
  const [mode, setMode] = useState('lines');
  const [points, setPoints] = useState([]);
  const [houghSpace, setHoughSpace] = useState([]);
  const [detectedShapes, setDetectedShapes] = useState([]);
  const [threshold, setThreshold] = useState(3);
  const [radius, setRadius] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);

  const houghResolution = mode === 'circles' ? 2 : 1;

  // Generate sample points
  const generateSamplePoints = useCallback(() => {
    const newPoints = mode === 'lines'
      ? generateLinePoints(CANVAS_SIZE)
      : generateCirclePoints(CANVAS_SIZE, radius);
    setPoints(newPoints);
  }, [mode, radius]);

  // Handle mode change
  useEffect(() => {
    const newPoints = mode === 'lines'
      ? generateLinePoints(CANVAS_SIZE)
      : generateCirclePoints(CANVAS_SIZE, radius);
    setPoints(newPoints);
    setDetectedShapes([]);
    setHoughSpace([]);
    setThreshold(3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Run transform when inputs change
  useEffect(() => {
    if (points.length === 0) return;

    if (mode === 'lines') {
      const result = houghTransformLines(points, CANVAS_SIZE, threshold);
      setHoughSpace(result.accumulator);
      setDetectedShapes(result.detected);
    } else {
      setIsProcessing(true);
      setTimeout(() => {
        const result = houghTransformCircles(
          points,
          CANVAS_SIZE,
          radius,
          threshold,
          houghResolution
        );
        setHoughSpace(result.accumulator);
        setDetectedShapes(result.detected);
        setIsProcessing(false);
      }, 10);
    }
  }, [points, threshold, radius, mode, houghResolution]);

  // Canvas draw functions
  const drawOriginalSpace = useCallback(
    (ctx, canvas) => {
      renderOriginalSpace(ctx, canvas, points, detectedShapes, mode);
    },
    [points, detectedShapes, mode]
  );

  const drawHoughSpace = useCallback(
    (ctx, canvas) => {
      renderHoughSpace(
        ctx,
        canvas,
        houghSpace,
        detectedShapes,
        mode,
        CANVAS_SIZE,
        houghResolution
      );
    },
    [houghSpace, detectedShapes, mode, houghResolution]
  );

  return (
    <div className="app-container">
      <div className="app-content">
        <h2 className="app-title">
          Hough Transform - Shape Detection
        </h2>
        <p className="app-subtitle">
          Algorithmic detection of lines and circles through coordinate transformation
        </p>

        <ControlPanel
          mode={mode}
          onModeChange={setMode}
          threshold={threshold}
          onThresholdChange={setThreshold}
          radius={radius}
          onRadiusChange={setRadius}
          onGeneratePoints={generateSamplePoints}
          isProcessing={isProcessing}
        />

        <div className="canvas-grid">
          <div className="canvas-container">
            <h3 className="canvas-title">Original Space (x, y)</h3>
            <div className="canvas-wrapper">
              <Canvas
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                draw={drawOriginalSpace}
              />
            </div>
            <p className="canvas-info">
              {points.length} points | {detectedShapes.length}{' '}
              {mode === 'lines' ? 'lines' : 'circles'} detected
            </p>
          </div>

          <div className="canvas-container">
            <h3 className="canvas-title">
              Hough Space {mode === 'lines' ? '(ρ, θ)' : '(xo, yo)'}
            </h3>
            <div className="canvas-wrapper">
              <Canvas
                width={HOUGH_SIZE}
                height={HOUGH_SIZE}
                draw={drawHoughSpace}
              />
            </div>
            <p className="canvas-info">
              Heatmap: Blue (low) → Red (high). White circles = maxima
            </p>
          </div>
        </div>

        <InfoPanel mode={mode} />
        <DetectedShapesList shapes={detectedShapes} mode={mode} />
      </div>
    </div>
  );
};

export default HoughTransform;
