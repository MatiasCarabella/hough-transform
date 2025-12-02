import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Canvas component with automatic rendering
 * @param {Object} props - Component props
 * @param {number} props.width - Canvas width in pixels
 * @param {number} props.height - Canvas height in pixels
 * @param {Function} props.draw - Drawing function that receives (ctx, canvas)
 * @param {Object} props.style - Additional inline styles
 */
const Canvas = ({ width, height, draw, style = {} }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    draw(ctx, canvas);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        border: '2px solid #475569',
        borderRadius: '4px',
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
        ...style
      }}
    />
  );
};

Canvas.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  draw: PropTypes.func.isRequired,
  style: PropTypes.object
};

export default Canvas;
