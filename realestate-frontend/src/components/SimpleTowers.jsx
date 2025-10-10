// SimpleTowers.jsx
import React from 'react';

const SimpleTowers = () => {
  return (
    <div style={styles.container}>
      {/* Left Tower */}
      <div style={styles.tower}>
        <div style={styles.towerBody}>
          <div style={styles.towerWindows}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={styles.windowRow}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} style={styles.window}></div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={styles.towerTop}></div>
      </div>

      {/* Right Tower */}
      <div style={{...styles.tower, height: '320px'}}>
        <div style={styles.towerBody}>
          <div style={styles.towerWindows}>
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} style={styles.windowRow}>
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} style={styles.window}></div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={styles.towerTop}></div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 80px',
    height: '300px',
    alignItems: 'flex-end',
    zIndex: 1,
  },
  tower: {
    position: 'relative',
    height: '280px',
  },
  towerBody: {
    background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
    width: '100px',
    height: '100%',
    borderRadius: '12px 12px 0 0',
    overflow: 'hidden',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
    border: '3px solid #1f2937',
  },
  towerWindows: {
    padding: '10px 8px',
  },
  windowRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  window: {
    width: '18px',
    height: '25px',
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    borderRadius: '3px',
    opacity: 0.7,
    animation: 'windowGlow 4s ease-in-out infinite',
  },
  towerTop: {
    position: 'absolute',
    top: '-20px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '120px',
    height: '20px',
    background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
    borderRadius: '8px 8px 0 0',
  },
};

export default SimpleTowers;