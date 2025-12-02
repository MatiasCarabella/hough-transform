import { TrendingUp, Circle, RotateCcw } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Control panel for adjusting Hough Transform parameters
 * @param {Object} props - Component props
 */
const ControlPanel = ({
  mode,
  onModeChange,
  threshold,
  onThresholdChange,
  radius,
  onRadiusChange,
  onGeneratePoints,
  isProcessing
}) => {
  return (
    <div style={{
      background: '#0f172a',
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '1px solid #334155'
    }}>
      {/* Mode Selection */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
        width: '100%',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => onModeChange('lines')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: mode === 'lines'
              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              : '#1e293b',
            color: mode === 'lines' ? 'white' : '#94a3b8',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s',
            flex: 1
          }}
        >
          <TrendingUp size={20} />
          Lines (ρ-θ)
        </button>

        <button
          onClick={() => onModeChange('circles')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: mode === 'circles'
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : '#1e293b',
            color: mode === 'circles' ? 'white' : '#94a3b8',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s',
            flex: 1
          }}
        >
          <Circle size={20} />
          Circles (xo-yo)
        </button>
      </div>

      {/* Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px'
      }}>
        <div>
          <label style={{
            color: '#94a3b8',
            fontSize: '14px',
            display: 'block',
            marginBottom: '8px'
          }}>
            Vote Threshold: {threshold}
          </label>
          <input
            type="range"
            min="3"
            max="10"
            value={threshold}
            onChange={(e) => onThresholdChange(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {mode === 'circles' && (
          <div>
            <label style={{
              color: '#94a3b8',
              fontSize: '14px',
              display: 'block',
              marginBottom: '8px'
            }}>
              Known Radius: {radius}px
            </label>
            <input
              type="range"
              min="20"
              max="60"
              value={radius}
              onChange={(e) => onRadiusChange(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={onGeneratePoints}
            disabled={isProcessing}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: isProcessing
                ? '#475569'
                : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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
            New Points
          </button>
        </div>
      </div>
    </div>
  );
};

ControlPanel.propTypes = {
  mode: PropTypes.oneOf(['lines', 'circles']).isRequired,
  onModeChange: PropTypes.func.isRequired,
  threshold: PropTypes.number.isRequired,
  onThresholdChange: PropTypes.func.isRequired,
  radius: PropTypes.number.isRequired,
  onRadiusChange: PropTypes.func.isRequired,
  onGeneratePoints: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool.isRequired
};

export default ControlPanel;
