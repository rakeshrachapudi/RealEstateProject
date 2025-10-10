// TowerGraphics.jsx
import React from 'react';

const TowerGraphics = () => {
  return (
    <div style={styles.towersContainer}>
      {/* Left Tower */}
      <div style={styles.towerLeft}>
        <div style={styles.towerBase}>
          <div style={styles.towerBody}>
            {/* Windows */}
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={`left-${i}`} style={styles.windowRow} className="window-row">
                {Array.from({ length: 8 }).map((_, j) => (
                  <div key={`left-window-${i}-${j}`} style={styles.window} className="tower-window"></div>
                ))}
              </div>
            ))}
          </div>
          <div style={styles.towerTop}>
            <div style={styles.towerSpire}></div>
            <div style={styles.towerLight}></div>
          </div>
        </div>
      </div>

      {/* Right Tower */}
      <div style={styles.towerRight}>
        <div style={styles.towerBase}>
          <div style={styles.towerBody}>
            {/* Windows */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={`right-${i}`} style={styles.windowRow} className="window-row">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={`right-window-${i}-${j}`} style={styles.window} className="tower-window"></div>
                ))}
              </div>
            ))}
          </div>
          <div style={styles.towerTop}>
            <div style={styles.towerSpire}></div>
            <div style={styles.towerLight}></div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div style={styles.floatingElement1}>✨</div>
      <div style={styles.floatingElement2}>🏠</div>
      <div style={styles.floatingElement3}>🌆</div>
    </div>
  );
};

const styles = {
  towersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: '0 50px',
    zIndex: 1,
  },
  towerLeft: {
    position: 'relative',
    height: '400px',
    display: 'flex',
    alignItems: 'flex-end',
  },
  towerRight: {
    position: 'relative',
    height: '350px',
    display: 'flex',
    alignItems: 'flex-end',
  },
  towerBase: {
    position: 'relative',
  },
  towerBody: {
    background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
    width: '120px',
    borderRadius: '8px 8px 0 0',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    overflow: 'hidden',
    border: '2px solid #1a202c',
  },
  towerTop: {
    position: 'relative',
    height: '40px',
    background: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
    borderRadius: '8px 8px 0 0',
  },
  towerSpire: {
    position: 'absolute',
    top: '-15px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '20px',
    height: '15px',
    background: '#e53e3e',
    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
  },
  towerLight: {
    position: 'absolute',
    top: '5px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '8px',
    height: '8px',
    background: '#f6e05e',
    borderRadius: '50%',
    boxShadow: '0 0 20px 5px #f6e05e',
    animation: 'lightPulse 2s ease-in-out infinite',
  },
  windowRow: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '4px 8px',
    gap: '2px',
  },
  window: {
    width: '8px',
    height: '12px',
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    borderRadius: '2px',
    opacity: 0.8,
    boxShadow: '0 0 8px rgba(251, 191, 36, 0.5)',
    transition: 'all 0.3s ease',
  },
  floatingElement1: {
    position: 'absolute',
    top: '20%',
    left: '25%',
    fontSize: '48px',
    animation: 'float 6s ease-in-out infinite',
  },
  floatingElement2: {
    position: 'absolute',
    top: '60%',
    right: '30%',
    fontSize: '64px',
    animation: 'float 8s ease-in-out infinite 1s',
  },
  floatingElement3: {
    position: 'absolute',
    bottom: '20%',
    left: '35%',
    fontSize: '56px',
    animation: 'float 7s ease-in-out infinite 0.5s',
  },
};

// Add window animation styles
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .tower-window {
      animation: windowGlow 3s ease-in-out infinite;
    }

    .window-row:nth-child(odd) .tower-window {
      animation-delay: 0.5s;
    }

    .window-row:nth-child(even) .tower-window {
      animation-delay: 1s;
    }

    @keyframes windowGlow {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.1); box-shadow: 0 0 12px rgba(251, 191, 36, 0.8); }
    }

    @keyframes lightPulse {
      0%, 100% { opacity: 0.7; transform: translateX(-50%) scale(1); }
      50% { opacity: 1; transform: translateX(-50%) scale(1.2); }
    }
  `;
  document.head.appendChild(style);
}

export default TowerGraphics;