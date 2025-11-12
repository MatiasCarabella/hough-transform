import React, { useState, useRef, useEffect } from 'react';
import { Circle, TrendingUp, Zap, RotateCcw, Play, Info } from 'lucide-react';

const HoughTransform = () => {
  const [mode, setMode] = useState('lines');
  const [points, setPoints] = useState([]);
  const [houghSpace, setHoughSpace] = useState([]);
  const [detectedShapes, setDetectedShapes] = useState([]);
  const [threshold, setThreshold] = useState(3);
  const [radius, setRadius] = useState(50);
  const [showHoughSpace, setShowHoughSpace] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  
  const canvasRef = useRef(null);
  const houghCanvasRef = useRef(null);
  
  const CANVAS_SIZE = 400;
  const HOUGH_SIZE = 300;
  // Optimización: reducir resolución para círculos
  const HOUGH_RESOLUTION = mode === 'circles' ? 2 : 1; // 2 = mitad de resolución

  const generateSamplePoints = () => {
    const newPoints = [];
    
    if (mode === 'lines') {
      // Línea diagonal
      for (let i = 0; i < 50; i++) {
        const x = 50 + i * 6;
        const y = 50 + i * 4 + (Math.random() - 0.5) * 10;
        if (x < CANVAS_SIZE && y < CANVAS_SIZE) {
          newPoints.push({ x: Math.round(x), y: Math.round(y) });
        }
      }
      
      // Línea horizontal
      for (let i = 0; i < 40; i++) {
        const x = 50 + i * 7;
        const y = 300 + (Math.random() - 0.5) * 15;
        if (x < CANVAS_SIZE && y < CANVAS_SIZE) {
          newPoints.push({ x: Math.round(x), y: Math.round(y) });
        }
      }
      
      // Ruido
      for (let i = 0; i < 20; i++) {
        newPoints.push({
          x: Math.round(Math.random() * CANVAS_SIZE),
          y: Math.round(Math.random() * CANVAS_SIZE)
        });
      }
    } else {
      // Círculo 1 - Menos puntos para mejor performance
      const cx1 = 150, cy1 = 150;
      for (let angle = 0; angle < Math.PI * 2; angle += 0.2) { // Reducido de 0.1 a 0.2
        const x = cx1 + radius * Math.cos(angle) + (Math.random() - 0.5) * 5;
        const y = cy1 + radius * Math.sin(angle) + (Math.random() - 0.5) * 5;
        if (x >= 0 && x < CANVAS_SIZE && y >= 0 && y < CANVAS_SIZE) {
          newPoints.push({ x: Math.round(x), y: Math.round(y) });
        }
      }
      
      // Círculo 2
      const cx2 = 280, cy2 = 280;
      for (let angle = 0; angle < Math.PI * 2; angle += 0.25) {
        const x = cx2 + radius * Math.cos(angle) + (Math.random() - 0.5) * 5;
        const y = cy2 + radius * Math.sin(angle) + (Math.random() - 0.5) * 5;
        if (x >= 0 && x < CANVAS_SIZE && y >= 0 && y < CANVAS_SIZE) {
          newPoints.push({ x: Math.round(x), y: Math.round(y) });
        }
      }
      
      // Menos ruido
      for (let i = 0; i < 15; i++) {
        newPoints.push({
          x: Math.round(Math.random() * CANVAS_SIZE),
          y: Math.round(Math.random() * CANVAS_SIZE)
        });
      }
    }
    
    setPoints(newPoints);
  };

  const houghTransformLines = () => {
    const rhoMax = Math.sqrt(CANVAS_SIZE * CANVAS_SIZE * 2);
    const thetaSteps = 180;
    const rhoSteps = Math.floor(rhoMax);
    
    const accumulator = Array(thetaSteps).fill(0).map(() => Array(rhoSteps).fill(0));
    
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
    
    setHoughSpace(accumulator);
    
    const detected = [];
    const maxVal = Math.max(...accumulator.flat());
    
    for (let t = 1; t < thetaSteps - 1; t++) {
      for (let r = 1; r < rhoSteps - 1; r++) {
        if (accumulator[t][r] >= threshold && accumulator[t][r] >= maxVal * 0.3) {
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
    
    setDetectedShapes(detected.slice(0, 5));
  };

  const houghTransformCircles = () => {
    setIsProcessing(true);
    
    // Usar setTimeout para no bloquear el UI
    setTimeout(() => {
      const accSize = Math.floor(CANVAS_SIZE / HOUGH_RESOLUTION);
      const accumulator = Array(accSize).fill(0).map(() => Array(accSize).fill(0));
      
      // Optimización: menos ángulos, step más grande
      const angleStep = 10; // Grados (antes era 5)
      
      points.forEach(point => {
        for (let angle = 0; angle < 360; angle += angleStep) {
          const theta = (angle * Math.PI) / 180;
          const xo = (point.x - radius * Math.cos(theta)) / HOUGH_RESOLUTION;
          const yo = (point.y - radius * Math.sin(theta)) / HOUGH_RESOLUTION;
          
          const xoIdx = Math.round(xo);
          const yoIdx = Math.round(yo);
          
          if (xoIdx >= 0 && xoIdx < accSize && yoIdx >= 0 && yoIdx < accSize) {
            accumulator[xoIdx][yoIdx]++;
          }
        }
      });
      
      setHoughSpace(accumulator);
      
      const detected = [];
      const maxVal = Math.max(...accumulator.flat());
      
      const searchRadius = 3; // Ventana de búsqueda reducida
      
      for (let x = searchRadius; x < accSize - searchRadius; x++) {
        for (let y = searchRadius; y < accSize - searchRadius; y++) {
          if (accumulator[x][y] >= threshold * 2 && accumulator[x][y] >= maxVal * 0.5) {
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
                xo: x * HOUGH_RESOLUTION, 
                yo: y * HOUGH_RESOLUTION, 
                r: radius, 
                votes: accumulator[x][y] 
              });
            }
          }
        }
      }
      
      setDetectedShapes(detected.slice(0, 5));
      setIsProcessing(false);
    }, 10);
  };

  const runTransform = () => {
    if (points.length === 0) return;
    
    if (mode === 'lines') {
      houghTransformLines();
    } else {
      houghTransformCircles();
    }
  };

  // Dibujar canvas principal
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Grid de referencia
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }
    
    // Dibujar puntos
    ctx.fillStyle = '#64748b';
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Dibujar formas detectadas
    if (mode === 'lines') {
      detectedShapes.forEach((line, idx) => {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        ctx.strokeStyle = colors[idx % colors.length];
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const { theta, rho } = line;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        
        if (Math.abs(sin) > 0.001) {
          const x1 = 0;
          const y1 = (rho - x1 * cos) / sin;
          const x2 = CANVAS_SIZE;
          const y2 = (rho - x2 * cos) / sin;
          
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        } else {
          const x = rho / cos;
          ctx.moveTo(x, 0);
          ctx.lineTo(x, CANVAS_SIZE);
        }
        
        ctx.stroke();
      });
    } else {
      detectedShapes.forEach((circle, idx) => {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        ctx.strokeStyle = colors[idx % colors.length];
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(circle.xo, circle.yo, circle.r, 0, Math.PI * 2);
        ctx.stroke();
        
        // Marcar centro con cruz
        ctx.fillStyle = colors[idx % colors.length];
        ctx.beginPath();
        ctx.arc(circle.xo, circle.yo, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Cruz
        ctx.strokeStyle = colors[idx % colors.length];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(circle.xo - 10, circle.yo);
        ctx.lineTo(circle.xo + 10, circle.yo);
        ctx.moveTo(circle.xo, circle.yo - 10);
        ctx.lineTo(circle.xo, circle.yo + 10);
        ctx.stroke();
      });
    }
  }, [points, detectedShapes, mode]);

  // Dibujar espacio de Hough MEJORADO
  useEffect(() => {
    if (!showHoughSpace || houghSpace.length === 0) return;
    
    const canvas = houghCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, HOUGH_SIZE, HOUGH_SIZE);
    
    const maxVal = Math.max(...houghSpace.flat());
    if (maxVal === 0) return;
    
    const rows = houghSpace.length;
    const cols = houghSpace[0].length;
    const cellWidth = HOUGH_SIZE / cols;
    const cellHeight = HOUGH_SIZE / rows;
    
    // Encontrar percentil 95 para mejor contraste
    const flatValues = houghSpace.flat().filter(v => v > 0).sort((a, b) => a - b);
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const value = houghSpace[i][j];
        
        if (value === 0) {
          ctx.fillStyle = '#0f172a';
        } else {
          // Siempre usar escala logarítmica para mejor contraste
          const normalizedValue = Math.log(value + 1) / Math.log(maxVal + 1);
          
          // Mapa de calor mejorado: azul -> cyan -> amarillo -> rojo
          let r, g, b;
          if (normalizedValue < 0.25) {
            // Azul a Cyan
            const t = normalizedValue / 0.25;
            r = 0;
            g = Math.floor(t * 150);
            b = Math.floor(150 + t * 105);
          } else if (normalizedValue < 0.5) {
            // Cyan a Verde
            const t = (normalizedValue - 0.25) / 0.25;
            r = 0;
            g = Math.floor(150 + t * 105);
            b = Math.floor(255 - t * 155);
          } else if (normalizedValue < 0.75) {
            // Verde a Amarillo
            const t = (normalizedValue - 0.5) / 0.25;
            r = Math.floor(t * 255);
            g = 255;
            b = Math.floor(100 - t * 100);
          } else {
            // Amarillo a Rojo
            const t = (normalizedValue - 0.75) / 0.25;
            r = 255;
            g = Math.floor(255 - t * 155);
            b = 0;
          }
          
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        }
        
        ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth + 1, cellHeight + 1);
      }
    }
    
    // Marcar máximos detectados
    const maxValFlat = Math.max(...houghSpace.flat());
    detectedShapes.forEach(shape => {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      if (mode === 'lines') {
        const rhoMax = Math.sqrt(CANVAS_SIZE * CANVAS_SIZE * 2);
        const thetaIdx = (shape.theta / Math.PI) * 180;
        const rhoIdx = shape.rho + rhoMax / 2;
        const x = (rhoIdx / houghSpace[0].length) * HOUGH_SIZE;
        const y = (thetaIdx / houghSpace.length) * HOUGH_SIZE;
        
        ctx.arc(x, y, 5, 0, Math.PI * 2);
      } else {
        const x = (shape.xo / HOUGH_RESOLUTION / houghSpace[0].length) * HOUGH_SIZE;
        const y = (shape.yo / HOUGH_RESOLUTION / houghSpace.length) * HOUGH_SIZE;
        
        ctx.arc(x, y, 6, 0, Math.PI * 2);
      }
      
      ctx.stroke();
    });
    
    // Leyenda de escala
    const legendHeight = 20;
    const legendWidth = HOUGH_SIZE - 40;
    const legendX = 20;
    const legendY = HOUGH_SIZE - 30;
    
    for (let i = 0; i < legendWidth; i++) {
      const t = i / legendWidth;
      let r, g, b;
      if (t < 0.25) {
        const tt = t / 0.25;
        r = 0; g = Math.floor(tt * 150); b = Math.floor(150 + tt * 105);
      } else if (t < 0.5) {
        const tt = (t - 0.25) / 0.25;
        r = 0; g = Math.floor(150 + tt * 105); b = Math.floor(255 - tt * 155);
      } else if (t < 0.75) {
        const tt = (t - 0.5) / 0.25;
        r = Math.floor(tt * 255); g = 255; b = Math.floor(100 - tt * 100);
      } else {
        const tt = (t - 0.75) / 0.25;
        r = 255; g = Math.floor(255 - tt * 155); b = 0;
      }
      
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
    
  }, [houghSpace, showHoughSpace, detectedShapes, mode]);

  useEffect(() => {
    generateSamplePoints();
    // Limpiar estados al cambiar de modo para evitar errores
    setDetectedShapes([]);
    setHoughSpace([]);
  }, [mode]);

  useEffect(() => {
    if (points.length > 0) {
      runTransform();
    }
  }, [points, threshold, radius]);

  return (
    <div style={{ 
      width: '100vw',
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
      padding: '20px',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        width: '100%',
        margin: '0 auto', 
        background: '#1e293b', 
        borderRadius: '16px', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', 
        padding: '24px',
        border: '1px solid #334155',
        boxSizing: 'border-box'
      }}>
        <h2 style={{ 
          fontSize: 'clamp(20px, 5vw, 28px)', 
          fontWeight: 'bold', 
          color: '#f1f5f9', 
          marginBottom: '8px'
        }}>
          Transformada de Hough - Detección de Formas
        </h2>
        <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: 'clamp(13px, 2.5vw, 15px)' }}>
          Detección algorítmica de rectas y circunferencias mediante transformación de coordenadas
        </p>

        {isProcessing && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Zap size={20} style={{ color: '#60a5fa' }} />
            <span style={{ color: '#93c5fd', fontSize: '14px' }}>
              Procesando transformada de Hough...
            </span>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '20px',
          background: '#0f172a',
          padding: '8px',
          borderRadius: '12px',
          width: '100%',
          maxWidth: 'fit-content',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setMode('lines')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: mode === 'lines' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : '#1e293b',
              color: mode === 'lines' ? 'white' : '#94a3b8',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            <TrendingUp size={20} />
            Rectas (ρ-θ)
          </button>
          
          <button
            onClick={() => setMode('circles')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: mode === 'circles' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#1e293b',
              color: mode === 'circles' ? 'white' : '#94a3b8',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            <Circle size={20} />
            Circunferencias (xo-yo)
          </button>
        </div>

        <div style={{ 
          background: '#0f172a', 
          padding: '16px', 
          borderRadius: '12px', 
          marginBottom: '20px',
          border: '1px solid #334155'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ color: '#94a3b8', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                Umbral de Detección: {threshold}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {mode === 'circles' && (
              <div>
                <label style={{ color: '#94a3b8', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  Radio Conocido: {radius}px
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={generateSamplePoints}
                disabled={isProcessing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: isProcessing ? '#475569' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  width: '100%'
                }}
              >
                <RotateCcw size={18} />
                Nuevos Puntos
              </button>
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', 
          gap: '20px', 
          marginBottom: '20px' 
        }}>
          <div style={{ 
            background: '#0f172a', 
            padding: '16px', 
            borderRadius: '12px',
            border: '1px solid #334155',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#cbd5e1', fontSize: 'clamp(14px, 3vw, 16px)', fontWeight: '600', marginBottom: '12px' }}>
              Espacio Original (x, y)
            </h3>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <canvas 
                ref={canvasRef} 
                width={CANVAS_SIZE} 
                height={CANVAS_SIZE}
                style={{ 
                  border: '2px solid #475569',
                  borderRadius: '4px',
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </div>
            <p style={{ color: '#64748b', fontSize: 'clamp(11px, 2vw, 13px)', marginTop: '12px' }}>
              {points.length} puntos | {detectedShapes.length} {mode === 'lines' ? 'líneas' : 'círculos'} detectados
            </p>
          </div>

          {showHoughSpace && (
            <div style={{ 
              background: '#0f172a', 
              padding: '16px', 
              borderRadius: '12px',
              border: '1px solid #334155',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#cbd5e1', fontSize: 'clamp(14px, 3vw, 16px)', fontWeight: '600', marginBottom: '12px' }}>
                Espacio de Hough {mode === 'lines' ? '(ρ, θ)' : '(xo, yo)'}
              </h3>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <canvas 
                  ref={houghCanvasRef} 
                  width={HOUGH_SIZE} 
                  height={HOUGH_SIZE}
                  style={{ 
                    border: '2px solid #475569',
                    borderRadius: '4px',
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                />
              </div>
              <p style={{ color: '#64748b', fontSize: 'clamp(11px, 2vw, 13px)', marginTop: '12px' }}>
                Mapa de calor: Azul (bajo) → Rojo (alto). Círculos blancos = máximos
              </p>
            </div>
          )}
        </div>

        <div style={{ 
          background: 'rgba(59, 130, 246, 0.1)', 
          padding: '20px', 
          borderRadius: '12px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Info size={24} style={{ color: '#60a5fa', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ color: '#93c5fd', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                {mode === 'lines' ? 'Transformada para Rectas' : 'Transformada para Circunferencias'}
              </h4>
              {mode === 'lines' ? (
                <div style={{ color: '#bfdbfe', fontSize: '14px', lineHeight: '1.6' }}>
                  <p style={{ marginBottom: '8px' }}>
                    <strong>Formulación:</strong> <code>ρ = x·cos(θ) + y·sin(θ)</code>
                  </p>
                  <p style={{ marginBottom: '8px' }}>
                    • Cada punto genera una sinusoide en el espacio (ρ,θ)
                  </p>
                  <p style={{ marginBottom: '8px' }}>
                    • Puntos colineales → sinusoides que se intersectan en un punto
                  </p>
                  <p>
                    • Los máximos locales (píxeles rojos brillantes) revelan las rectas presentes
                  </p>
                </div>
              ) : (
                <div style={{ color: '#bfdbfe', fontSize: '14px', lineHeight: '1.6' }}>
                  <p style={{ marginBottom: '8px' }}>
                    <strong>Formulación:</strong> Con radio R conocido: <code>(x-xo)² + (y-yo)² = R²</code>
                  </p>
                  <p style={{ marginBottom: '8px' }}>
                    • Cada punto vota por todos los centros posibles a distancia R
                  </p>
                  <p style={{ marginBottom: '8px' }}>
                    • Genera un círculo de votos en el espacio (xo,yo)
                  </p>
                  <p>
                    • Los máximos (píxeles rojos brillantes) revelan los centros de circunferencias
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {detectedShapes.length > 0 && (
          <div style={{ 
            background: '#0f172a', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid #334155'
          }}>
            <h4 style={{ color: '#cbd5e1', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
              {mode === 'lines' ? 'Líneas Detectadas' : 'Círculos Detectados'}
            </h4>
            <div style={{ display: 'grid', gap: '8px' }}>
              {detectedShapes.map((shape, idx) => {
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                const color = colors[idx % colors.length];
                
                return (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '12px',
                    background: '#1e293b',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${color}`
                  }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      background: color 
                    }} />
                    <span style={{ color: '#cbd5e1', fontSize: '14px', flex: 1 }}>
                      {mode === 'lines' ? (
                        shape.theta !== undefined && shape.rho !== undefined 
                          ? `ρ = ${shape.rho.toFixed(1)}, θ = ${(shape.theta * 180 / Math.PI).toFixed(1)}°`
                          : 'Datos inválidos'
                      ) : (
                        shape.xo !== undefined && shape.yo !== undefined && shape.r !== undefined
                          ? `Centro: (${shape.xo}, ${shape.yo}), R = ${shape.r}`
                          : 'Datos inválidos'
                      )}
                    </span>
                    <span style={{ 
                      color: '#64748b', 
                      fontSize: '12px',
                      background: '#0f172a',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      {shape.votes !== undefined ? shape.votes : 0} votos
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ 
          marginTop: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '12px'
        }}>
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <h5 style={{ color: '#6ee7b7', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              ✓ Ventajas
            </h5>
            <ul style={{ color: '#a7f3d0', fontSize: '13px', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
              <li>Algoritmo determinístico, no iterativo</li>
              <li>Robusto ante ruido y oclusiones</li>
              <li>Complejidad temporal acotada O(n·m)</li>
              <li>No requiere entrenamiento previo</li>
            </ul>
          </div>

          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <h5 style={{ color: '#fca5a5', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              ⚠ Limitaciones
            </h5>
            <ul style={{ color: '#fecaca', fontSize: '13px', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
              <li>Círculos: requiere conocer el radio</li>
              <li>Alto costo de memoria (espacio 3D para círculos)</li>
              <li>Sensible a la discretización del espacio</li>
              <li>Necesita preprocesamiento de imagen</li>
            </ul>
          </div>
        </div>

        <div style={{ 
          marginTop: '20px',
          background: 'rgba(251, 191, 36, 0.1)', 
          padding: '16px', 
          borderRadius: '8px',
          border: '1px solid rgba(251, 191, 36, 0.3)'
        }}>
          <h5 style={{ color: '#fbbf24', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            💡 Tips de Interpretación
          </h5>
          <ul style={{ color: '#fcd34d', fontSize: '13px', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
            <li><strong>Espacio de Hough:</strong> Los colores cálidos (amarillo-rojo) indican alta acumulación de votos</li>
            <li><strong>Círculos blancos:</strong> Marcan los máximos locales detectados como formas válidas</li>
            <li><strong>Visualización logarítmica:</strong> Mejora el contraste visual automáticamente</li>
            <li><strong>Optimización:</strong> En círculos, menor resolución (×2) para mejor rendimiento</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HoughTransform;