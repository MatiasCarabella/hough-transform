import { Info } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Information panel explaining the Hough Transform algorithm
 * @param {Object} props - Component props
 * @param {string} props.mode - Detection mode ('lines' or 'circles')
 */
const InfoPanel = ({ mode }) => {
  return (
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
          <h4 style={{
            color: '#93c5fd',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            {mode === 'lines' ? 'Line Transform' : 'Circle Transform'}
          </h4>
          {mode === 'lines' ? (
            <div style={{ color: '#bfdbfe', fontSize: '14px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>Formula:</strong> <code>ρ = x·cos(θ) + y·sin(θ)</code>
              </p>
              <p style={{ marginBottom: '8px' }}>
                • Each point generates a sinusoid in (ρ,θ) space
              </p>
              <p style={{ marginBottom: '8px' }}>
                • Collinear points → sinusoids intersecting at one point
              </p>
              <p>
                • Local maxima (bright red pixels) reveal detected lines
              </p>
            </div>
          ) : (
            <div style={{ color: '#bfdbfe', fontSize: '14px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>Formula:</strong> With known radius R: <code>(x-xo)² + (y-yo)² = R²</code>
              </p>
              <p style={{ marginBottom: '8px' }}>
                • Each point votes for all possible centers at distance R
              </p>
              <p style={{ marginBottom: '8px' }}>
                • Generates a circle of votes in (xo,yo) space
              </p>
              <p>
                • Local maxima (bright red pixels) reveal circle centers
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

InfoPanel.propTypes = {
  mode: PropTypes.oneOf(['lines', 'circles']).isRequired
};

export default InfoPanel;
