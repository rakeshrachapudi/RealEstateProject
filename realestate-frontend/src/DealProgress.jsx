import React from 'react';

const DealProgress = ({ currentStage, dealData }) => {
  const stages = [
    { stage: 'INQUIRY', label: '🔍 Inquiry', order: 1 },
    { stage: 'SHORTLIST', label: '⭐ Shortlist', order: 2 },
    { stage: 'NEGOTIATION', label: '💬 Negotiation', order: 3 },
    { stage: 'AGREEMENT', label: '✅ Agreement', order: 4 },
    { stage: 'REGISTRATION', label: '📋 Registration', order: 5 },
    { stage: 'PAYMENT', label: '💰 Payment', order: 6 },
    { stage: 'COMPLETED', label: '🎉 Completed', order: 7 },
  ];

  const getCurrentStageIndex = () => {
    return stages.findIndex(s => s.stage === currentStage);
  };

  const getProgressPercentage = () => {
    const index = getCurrentStageIndex();
    return ((index + 1) / stages.length) * 100;
  };

  const currentIndex = getCurrentStageIndex();

  const containerStyle = {
    padding: '24px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid #e2e8f0',
  };

  const progressBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '24px',
    position: 'relative',
  };

  const progressLineStyle = {
    position: 'absolute',
    top: '20px',
    left: '0',
    right: '0',
    height: '3px',
    backgroundColor: '#e2e8f0',
    zIndex: 0,
  };

  const progressLineFilledStyle = {
    position: 'absolute',
    top: '20px',
    left: '0',
    height: '3px',
    backgroundColor: '#10b981',
    transition: 'width 0.3s ease',
    width: `${getProgressPercentage()}%`,
    zIndex: 0,
  };

  const stageItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    zIndex: 1,
    position: 'relative',
  };

  const stageBadgeStyle = (index) => ({
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
    fontWeight: '700',
    fontSize: '16px',
    backgroundColor: index <= currentIndex ? '#10b981' : '#e2e8f0',
    color: index <= currentIndex ? 'white' : '#64748b',
    transition: 'all 0.3s ease',
    border: index === currentIndex ? '3px solid #059669' : 'none',
    boxShadow: index === currentIndex ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
  });

  const stageLabelStyle = {
    fontSize: '11px',
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    maxWidth: '70px',
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#1e293b', fontSize: '16px' }}>
        📊 Deal Progress: {stages[currentIndex]?.label}
      </h3>

      <div style={progressBarStyle}>
        <div style={progressLineStyle}></div>
        <div style={progressLineFilledStyle}></div>

        {stages.map((stageObj, index) => (
          <div
            key={stageObj.stage}
            style={stageItemStyle}
          >
            <div style={stageBadgeStyle(index)}>
              {index + 1}
            </div>
            <div style={stageLabelStyle}>
              {stageObj.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealProgress;