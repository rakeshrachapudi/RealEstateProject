import React from 'react';

const PropertyStatusTag = ({ property, deal }) => {
  if (!deal || !deal.stage) {
    return null;
  }

  const stageInfo = {
    INQUIRY: { icon: '🔍', label: 'Inquiry', color: '#3b82f6', bg: '#dbeafe' },
    SHORTLIST: { icon: '⭐', label: 'Shortlisted', color: '#8b5cf6', bg: '#ede9fe' },
    NEGOTIATION: { icon: '💬', label: 'Negotiating', color: '#f59e0b', bg: '#fef3c7' },
    AGREEMENT: { icon: '✅', label: 'Agreed', color: '#10b981', bg: '#d1fae5' },
    REGISTRATION: { icon: '📋', label: 'Registering', color: '#06b6d4', bg: '#cffafe' },
    PAYMENT: { icon: '💰', label: 'Payment', color: '#ec4899', bg: '#fce7f3' },
    COMPLETED: { icon: '🎉', label: 'Completed', color: '#22c55e', bg: '#dcfce7' }
  };

  const info = stageInfo[deal.stage] || stageInfo.INQUIRY;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        backgroundColor: info.bg,
        color: info.color,
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        border: `1px solid ${info.color}40`
      }}
      title={`Deal Status: ${info.label}`}
    >
      <span>{info.icon}</span>
      <span>{info.label}</span>
    </div>
  );
};

export default PropertyStatusTag;