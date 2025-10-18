import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DealProgressBar from './DealProgressBar';

const DealDetailModal = ({ deal, onClose, onUpdate, userRole, showOnlyOverview = false }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  // For buyers and sellers, always show overview only
  const displayTabs = showOnlyOverview ? ['overview'] : ['overview', 'timeline', 'actions'];

  const getStageColor = (stage) => {
    const colors = {
      'INQUIRY': '#3b82f6',
      'SHORTLIST': '#8b5cf6',
      'NEGOTIATION': '#f59e0b',
      'AGREEMENT': '#10b981',
      'REGISTRATION': '#06b6d4',
      'PAYMENT': '#ec4899',
      'COMPLETED': '#22c55e',
    };
    return colors[stage] || '#6b7280';
  };

  const formatPrice = (price) => {
    if (!price) return 'TBD';
    if (typeof price === 'number') return price.toLocaleString('en-IN');
    return String(price);
  };

  const currentStage = deal?.stage || deal?.currentStage || 'INQUIRY';

  if (!deal) return null;

  const handleViewProperty = () => {
    navigate(`/property/${deal.propertyId || deal.property?.id}`);
    onClose();
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <button style={styles.closeBtn} onClick={onClose}>×</button>

        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>{deal.propertyTitle || 'Deal Details'}</h2>
          <div style={{ ...styles.stageBadge, backgroundColor: getStageColor(currentStage) }}>
            {currentStage}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={styles.tabContainer}>
          {displayTabs.includes('overview') && (
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                ...styles.tab,
                ...(activeTab === 'overview' ? styles.activeTab : {})
              }}
            >
              📋 Overview
            </button>
          )}
          {displayTabs.includes('timeline') && (
            <button
              onClick={() => setActiveTab('timeline')}
              style={{
                ...styles.tab,
                ...(activeTab === 'timeline' ? styles.activeTab : {})
              }}
            >
              📅 Timeline
            </button>
          )}
          {displayTabs.includes('actions') && (userRole === 'AGENT' || userRole === 'ADMIN') && (
            <button
              onClick={() => setActiveTab('actions')}
              style={{
                ...styles.tab,
                ...(activeTab === 'actions' ? styles.activeTab : {})
              }}
            >
              ⚡ Actions
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div style={styles.content}>
          {activeTab === 'overview' && (
            <div>
              {/* Deal Progress Bar */}
              <DealProgressBar
                deal={deal}
                isEditable={userRole === 'AGENT' || userRole === 'ADMIN'}
                onStageChange={onUpdate}
              />

              {/* Main Grid */}
              <div style={styles.gridContainer}>
                {/* Property Section */}
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>🏠 Property</h3>
                  <div style={styles.infoBox}>
                    <div style={styles.infoRow}>
                      <span style={styles.label}>Title</span>
                      <span style={styles.value}>{deal.propertyTitle || 'Property'}</span>
                    </div>
                    {deal.propertyPrice && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Listing Price</span>
                        <span style={styles.value}>₹{formatPrice(deal.propertyPrice)}</span>
                      </div>
                    )}
                    {deal.agreedPrice && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Agreed Price</span>
                        <span style={styles.value}>₹{formatPrice(deal.agreedPrice)}</span>
                      </div>
                    )}
                    {deal.propertyCity && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Location</span>
                        <span style={styles.value}>{deal.propertyCity}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Buyer Section - Phone only visible to AGENT/ADMIN */}
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>👤 Buyer</h3>
                  <div style={styles.infoBox}>
                    <div style={styles.infoRow}>
                      <span style={styles.label}>Name</span>
                      <span style={styles.value}>{deal.buyerName || 'N/A'}</span>
                    </div>
                    {deal.buyerEmail && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Email</span>
                        <span style={styles.value}>{deal.buyerEmail}</span>
                      </div>
                    )}
                    {deal.buyerMobile && (userRole === 'AGENT' || userRole === 'ADMIN') && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Phone</span>
                        <span style={styles.value}>{deal.buyerMobile}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seller Section - Phone only visible to AGENT/ADMIN */}
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>🏢 Seller</h3>
                  <div style={styles.infoBox}>
                    <div style={styles.infoRow}>
                      <span style={styles.label}>Name</span>
                      <span style={styles.value}>{deal.sellerName || 'N/A'}</span>
                    </div>
                    {deal.sellerEmail && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Email</span>
                        <span style={styles.value}>{deal.sellerEmail}</span>
                      </div>
                    )}
                    {deal.sellerMobile && (userRole === 'AGENT' || userRole === 'ADMIN') && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Phone</span>
                        <span style={styles.value}>{deal.sellerMobile}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Agent Section */}
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>📊 Agent</h3>
                  <div style={styles.infoBox}>
                    <div style={styles.infoRow}>
                      <span style={styles.label}>Name</span>
                      <span style={styles.value}>{deal.agentName || 'Not Assigned'}</span>
                    </div>
                    {deal.agentEmail && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Email</span>
                        <span style={styles.value}>{deal.agentEmail}</span>
                      </div>
                    )}
                    {deal.agentMobile && (userRole === 'AGENT' || userRole === 'ADMIN') && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Phone</span>
                        <span style={styles.value}>{deal.agentMobile}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                {deal.notes && (
                  <div style={{ ...styles.section, gridColumn: '1 / -1' }}>
                    <h3 style={styles.sectionTitle}>📝 Notes</h3>
                    <div style={styles.notesBox}>{deal.notes}</div>
                  </div>
                )}

                {/* Dates Section */}
                <div style={{ ...styles.section, gridColumn: '1 / -1' }}>
                  <h3 style={styles.sectionTitle}>📅 Important Dates</h3>
                  <div style={styles.datesGrid}>
                    <div style={styles.dateItem}>
                      <span style={styles.label}>Created</span>
                      <span style={styles.value}>
                        {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div style={styles.dateItem}>
                      <span style={styles.label}>Last Updated</span>
                      <span style={styles.value}>
                        {deal.updatedAt ? new Date(deal.updatedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && displayTabs.includes('timeline') && (
            <div style={styles.tabContent}>
              <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 20px' }}>
                📅 Timeline feature coming soon
              </p>
            </div>
          )}

          {activeTab === 'actions' && displayTabs.includes('actions') && (userRole === 'AGENT' || userRole === 'ADMIN') && (
            <div style={styles.tabContent}>
              <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 20px' }}>
                ⚡ Actions feature coming soon
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            onClick={handleViewProperty}
            style={styles.viewPropertyBtn}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
          >
            🏠 View Property
          </button>
          <button
            onClick={onClose}
            style={styles.closeBottomBtn}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10001,
    overflowY: 'auto',
    padding: '20px'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '1000px',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
    padding: '32px'
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    fontSize: '32px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: 0,
    width: '40px',
    height: '40px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e5e7eb'
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1e293b',
    margin: 0
  },
  stageBadge: {
    padding: '8px 16px',
    borderRadius: '20px',
    color: 'white',
    fontWeight: '600',
    fontSize: '14px'
  },
  tabContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '12px'
  },
  tab: {
    padding: '10px 20px',
    background: '#f8fafc',
    color: '#64748b',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  activeTab: {
    backgroundColor: '#3b82f6',
    color: 'white'
  },
  content: {
    marginBottom: '24px'
  },
  tabContent: {
    minHeight: '200px'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  section: {
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 16px 0'
  },
  infoBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b'
  },
  value: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b'
  },
  notesBox: {
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.6'
  },
  datesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px'
  },
  dateItem: {
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  footer: {
    display: 'flex',
    gap: '12px',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '20px'
  },
  viewPropertyBtn: {
    flex: 1,
    padding: '12px 20px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background 0.2s'
  },
  closeBottomBtn: {
    flex: 1,
    padding: '12px 20px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background 0.2s'
  }
};

export default DealDetailModal;