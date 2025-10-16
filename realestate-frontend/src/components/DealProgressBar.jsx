import React, { useState } from 'react';

const DealProgressBar = ({ deal, onStageChange, isEditable }) => {
  const stages = [
    { key: 'INQUIRY', label: '🔍 Inquiry', color: '#3b82f6' },
    { key: 'SHORTLIST', label: '⭐ Shortlist', color: '#8b5cf6' },
    { key: 'NEGOTIATION', label: '💬 Negotiation', color: '#f59e0b' },
    { key: 'AGREEMENT', label: '✅ Agreement', color: '#10b981' },
    { key: 'REGISTRATION', label: '📋 Registration', color: '#06b6d4' },
    { key: 'PAYMENT', label: '💰 Payment', color: '#ec4899' },
    { key: 'COMPLETED', label: '🎉 Completed', color: '#22c55e' }
  ];

  const [showStageMenu, setShowStageMenu] = useState(false);
  const currentStageIndex = stages.findIndex(s => s.key === deal?.stage);

  const getProgressPercentage = () => {
    return ((currentStageIndex + 1) / stages.length) * 100;
  };

  const handleStageClick = (newStage) => {
    if (isEditable && onStageChange) {
      onStageChange(newStage);
      setShowStageMenu(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Deal Progress</span>
        {deal && (
          <span style={styles.currentStage}>
            {stages[currentStageIndex]?.label}
          </span>
        )}
      </div>

      <div style={styles.progressBarContainer}>
        <div style={styles.progressBarBackground}>
          <div
            style={{
              ...styles.progressBarFill,
              width: `${getProgressPercentage()}%`,
              backgroundColor: stages[currentStageIndex]?.color
            }}
          ></div>
        </div>
      </div>

      <div style={styles.stagesContainer}>
        {stages.map((stage, index) => {
          const isCompleted = index <= currentStageIndex;
          const isCurrent = index === currentStageIndex;

          return (
            <div
              key={stage.key}
              style={{
                ...styles.stageItem,
                opacity: isCompleted ? 1 : 0.5
              }}
            >
              <button
                onClick={() => isEditable && handleStageClick(stage.key)}
                style={{
                  ...styles.stageCircle,
                  backgroundColor: isCompleted ? stage.color : '#e5e7eb',
                  borderColor: isCurrent ? stage.color : '#d1d5db',
                  cursor: isEditable ? 'pointer' : 'default',
                  boxShadow: isCurrent ? `0 0 0 3px ${stage.color}40` : 'none'
                }}
                disabled={!isEditable}
              >
                <span style={styles.stageNumber}>{index + 1}</span>
              </button>

              <div
                style={{
                  ...styles.stageLabel,
                  color: isCurrent ? stage.color : isCompleted ? '#1e293b' : '#94a3b8'
                }}
              >
                {stage.label.split(' ')[1]}
              </div>

              {index < stages.length - 1 && (
                <div
                  style={{
                    ...styles.stageLine,
                    backgroundColor: isCompleted ? stage.color : '#e5e7eb'
                  }}
                ></div>
              )}
            </div>
          );
        })}
      </div>

      {isEditable && (
        <div style={styles.editSection}>
          <button
            onClick={() => setShowStageMenu(!showStageMenu)}
            style={styles.editButton}
          >
            {showStageMenu ? '✕ Close' : '✏️ Change Stage'}
          </button>

          {showStageMenu && (
            <div style={styles.stageMenu}>
              {stages.map((stage) => (
                <button
                  key={stage.key}
                  onClick={() => handleStageClick(stage.key)}
                  style={{
                    ...styles.stageMenuOption,
                    backgroundColor:
                      stage.key === deal?.stage ? `${stage.color}20` : 'white',
                    borderLeftColor: stage.color
                  }}
                >
                  <span style={{ fontSize: '18px', marginRight: '8px' }}>
                    {stage.label.split(' ')[0]}
                  </span>
                  <span>{stage.label.split(' ')[1]}</span>
                  {stage.key === deal?.stage && <span style={{ marginLeft: 'auto' }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {deal && (
        <div style={styles.infoBox}>
          <div style={styles.infoPair}>
            <span style={styles.infoLabel}>Created:</span>
            <span>{new Date(deal.createdAt).toLocaleDateString()}</span>
          </div>
          <div style={styles.infoPair}>
            <span style={styles.infoLabel}>Last Updated:</span>
            <span>{new Date(deal.updatedAt).toLocaleDateString()}</span>
          </div>
          {deal.lastUpdatedBy && (
            <div style={styles.infoPair}>
              <span style={styles.infoLabel}>Updated By:</span>
              <span>{deal.lastUpdatedBy}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    marginBottom: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b'
  },
  currentStage: {
    fontSize: '14px',
    fontWeight: '600',
    padding: '4px 12px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '6px'
  },
  progressBarContainer: {
    marginBottom: '24px'
  },
  progressBarBackground: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    transition: 'width 0.3s ease',
    borderRadius: '4px'
  },
  stagesContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    position: 'relative'
  },
  stageItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    position: 'relative'
  },
  stageCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid',
    backgroundColor: '#e5e7eb',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    fontWeight: '700',
    color: 'white',
    marginBottom: '8px'
  },
  stageNumber: {
    fontSize: '16px'
  },
  stageLabel: {
    fontSize: '12px',
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: '60px',
    color: '#94a3b8'
  },
  stageLine: {
    position: 'absolute',
    top: '20px',
    left: '50%',
    width: '100%',
    height: '2px',
    backgroundColor: '#e5e7eb',
    zIndex: -1
  },
  editSection: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e2e8f0'
  },
  editButton: {
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    marginBottom: '8px'
  },
  stageMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '12px',
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  stageMenuOption: {
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderLeftWidth: '4px',
    borderRadius: '6px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s'
  },
  infoBox: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '13px'
  },
  infoPair: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    color: '#475569'
  },
  infoLabel: {
    fontWeight: '600',
    color: '#1e293b'
  }
};

export default DealProgressBar;