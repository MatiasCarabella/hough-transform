import PropTypes from 'prop-types';

const SHAPE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

/**
 * Display list of detected shapes with their parameters
 * @param {Object} props - Component props
 * @param {Array} props.shapes - Array of detected shapes
 * @param {string} props.mode - Detection mode ('lines' or 'circles')
 */
const DetectedShapesList = ({ shapes, mode }) => {
  if (shapes.length === 0) return null;

  return (
    <div style={{
      background: '#0f172a',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #334155'
    }}>
      <h4 style={{
        color: '#cbd5e1',
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '12px'
      }}>
        {mode === 'lines' ? 'Detected Lines' : 'Detected Circles'}
      </h4>
      <div style={{ display: 'grid', gap: '8px' }}>
        {shapes.map((shape, idx) => {
          const color = SHAPE_COLORS[idx % SHAPE_COLORS.length];

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: '#1e293b',
                borderRadius: '8px',
                borderLeft: `4px solid ${color}`
              }}
            >
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
                    : 'Invalid data'
                ) : (
                  shape.xo !== undefined && shape.yo !== undefined && shape.r !== undefined
                    ? `Center: (${shape.xo}, ${shape.yo}), R = ${shape.r}`
                    : 'Invalid data'
                )}
              </span>
              <span style={{
                color: '#64748b',
                fontSize: '12px',
                background: '#0f172a',
                padding: '4px 8px',
                borderRadius: '4px'
              }}>
                {shape.votes !== undefined ? shape.votes : 0} votes
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

DetectedShapesList.propTypes = {
  shapes: PropTypes.arrayOf(PropTypes.object).isRequired,
  mode: PropTypes.oneOf(['lines', 'circles']).isRequired
};

export default DetectedShapesList;
