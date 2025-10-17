import React from 'react';

const DealDetailsPopup = ({ deal, onClose }) => {

  const stages = ['INQUIRY', 'SHORTLIST', 'NEGOTIATION', 'AGREEMENT', 'REGISTRATION', 'PAYMENT', 'COMPLETED'];

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

  const getProgressPercentage = () => {
    const currentStage = deal?.stage || deal?.currentStage || 'INQUIRY';
    const index = stages.indexOf(currentStage);
    return ((index + 1) / stages.length) * 100;
  };

  if (!deal) return null;

  const currentStage = deal.stage || deal.currentStage || 'INQUIRY';
  const buyerName = deal.buyer ? `${deal.buyer.firstName} ${deal.buyer.lastName}` : 'N/A';
  const sellerName = deal.seller ? `${deal.seller.firstName} ${deal.seller.lastName}` : 'N/A';
  const agentName = deal.agent ? `${deal.agent.firstName} ${deal.agent.lastName}` : 'Not Assigned';
  const propertyTitle = deal.property?.title || 'Property';
  const propertyPrice = deal.agreedPrice || deal.property?.price || 'TBD';

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>×</button>

        <div style={styles.header}>
          <h2 style={styles.title}>📋 Deal Details</h2>
          <div style={{ ...styles.stageBadge, backgroundColor: getStageColor(currentStage) }}>
            {currentStage}
          </div>
        </div>

        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${getProgressPercentage()}%`,
                backgroundColor: getStageColor(currentStage)
              }}
            />
          </div>
          <p style={styles.progressText}>Progress: {getProgressPercentage().toFixed(0)}%</p>
        </div>

        <div style={styles.contentGrid}>
          {/* ADDED: A new dedicated section to show the current stage prominently */}
          <div style={{ ...styles.section, gridColumn: '1 / -1', textAlign: 'center' }}>
            <h3 style={styles.sectionTitle}>📊 Current Deal Stage</h3>
            <p style={{
              ...styles.stageBadge,
              backgroundColor: getStageColor(currentStage),
              display: 'inline-block', // To fit content
              fontSize: '16px' // Make it slightly larger
            }}>
              {currentStage}
            </p>
          </div>

          {/* Property Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🏠 Property</h3>
            <div style={styles.infoBox}>
              <p style={styles.label}>Title</p>
              <p style={styles.value}>{propertyTitle}</p>
              <p style={styles.label}>Price</p>
              <p style={styles.value}>₹{typeof propertyPrice === 'number' ? propertyPrice.toLocaleString('en-IN') : propertyPrice}</p>
              {deal.property?.bedrooms && (
                <>
                  <p style={styles.label}>Bedrooms</p>
                  <p style={styles.value}>{deal.property.bedrooms}</p>
                </>
              )}
              {deal.property?.areaSqft && (
                <>
                  <p style={styles.label}>Area</p>
                  <p style={styles.value}>{deal.property.areaSqft} sqft</p>
                </>
              )}
            </div>
          </div>

          {/* Buyer Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>👤 Buyer</h3>
            <div style={styles.infoBox}>
              <p style={styles.label}>Name</p>
              <p style={styles.value}>{buyerName}</p>
              {deal.buyer?.email && (
                <>
                  <p style={styles.label}>Email</p>
                  <p style={styles.value}>{deal.buyer.email}</p>
                </>
              )}
              {deal.buyer?.mobileNumber && (
                <>
                  <p style={styles.label}>Phone</p>
                  <p style={styles.value}>{deal.buyer.mobileNumber}</p>
                </>
              )}
            </div>
          </div>

          {/* Seller Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🏢 Seller</h3>
            <div style={styles.infoBox}>
              <p style={styles.label}>Name</p>
              <p style={styles.value}>{sellerName}</p>
              {deal.seller?.email && (
                <>
                  <p style={styles.label}>Email</p>
                  <p style={styles.value}>{deal.seller.email}</p>
                </>
              )}
              {deal.seller?.mobileNumber && (
                <>
                  <p style={styles.label}>Phone</p>
                  <p style={styles.value}>{deal.seller.mobileNumber}</p>
                </>
              )}
            </div>
          </div>

          {/* Agent Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📊 Agent</h3>
            <div style={styles.infoBox}>
              <p style={styles.label}>Agent Name</p>
              <p style={styles.value}>{agentName}</p>
              {deal.agent?.email && (
                <>
                  <p style={styles.label}>Email</p>
                  <p style={styles.value}>{deal.agent.email}</p>
                </>
              )}
            </div>
          </div>

          {/* Timeline Section */}
          <div style={{ ...styles.section, gridColumn: '1 / -1' }}>
            <h3 style={styles.sectionTitle}>📅 Timeline</h3>
            <div style={styles.timelineGrid}>
              <div style={styles.timelineItem}>
                <p style={styles.label}>Created</p>
                <p style={styles.value}>{deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              {deal.shortlistDate && (
                <div style={styles.timelineItem}>
                  <p style={styles.label}>Shortlisted</p>
                  <p style={styles.value}>{new Date(deal.shortlistDate).toLocaleDateString()}</p>
                </div>
              )}
              {deal.agreementDate && (
                <div style={styles.timelineItem}>
                  <p style={styles.label}>Agreement</p>
                  <p style={styles.value}>{new Date(deal.agreementDate).toLocaleDateString()}</p>
                </div>
              )}
              {deal.registrationDate && (
                <div style={styles.timelineItem}>
                  <p style={styles.label}>Registration</p>
                  <p style={styles.value}>{new Date(deal.registrationDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Checklist */}
          <div style={{ ...styles.section, gridColumn: '1 / -1' }}>
            <h3 style={styles.sectionTitle}>✅ Status Checklist</h3>
            <div style={styles.checklistGrid}>
              <div style={styles.checklistItem}>
                <span style={deal.buyerDocUploaded ? styles.checkYes : styles.checkNo}>
                  {deal.buyerDocUploaded ? '✅' : '❌'}
                </span>
                <span>Buyer Document Uploaded</span>
              </div>
              <div style={styles.checklistItem}>
                <span style={deal.sellerConfirmed ? styles.checkYes : styles.checkNo}>
                  {deal.sellerConfirmed ? '✅' : '❌'}
                </span>
                <span>Seller Confirmed</span>
              </div>
              <div style={styles.checklistItem}>
                <span style={deal.adminVerified ? styles.checkYes : styles.checkNo}>
                  {deal.adminVerified ? '✅' : '❌'}
                </span>
                <span>Admin Verified</span>
              </div>
              <div style={styles.checklistItem}>
                <span style={deal.paymentInitiated ? styles.checkYes : styles.checkNo}>
                  {deal.paymentInitiated ? '✅' : '❌'}
                </span>
                <span>Payment Initiated</span>
              </div>
              <div style={styles.checklistItem}>
                <span style={deal.paymentCompleted ? styles.checkYes : styles.checkNo}>
                  {deal.paymentCompleted ? '✅' : '❌'}
                </span>
                <span>Payment Completed</span>
              </div>
            </div>
          </div>
        </div>

        <button onClick={onClose} style={styles.closeBottomBtn}>Close</button>
      </div>
    </div>
  );
};


const styles = {
  backdrop: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center',
    alignItems: 'center', zIndex: 10001, overflowY: 'auto',
    backdropFilter: 'blur(3px)', padding: '20px'
  },
  modal: {
    backgroundColor: 'white', borderRadius: '16px', padding: '32px',
    width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto',
    position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
    animation: 'slideUp 0.3s ease-out'
  },
  closeBtn: {
    position: 'absolute', top: '16px', right: '16px', background: 'none',
    border: 'none', fontSize: '32px', cursor: 'pointer', color: '#6b7280',
    padding: 0, width: '40px', height: '40px', display: 'flex',
    alignItems: 'center', justifyContent: 'center'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #e5e7eb'
  },
  title: {
    fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0
  },
  stageBadge: {
    padding: '8px 16px', borderRadius: '20px', color: 'white',
    fontWeight: '600', fontSize: '14px'
  },
  progressContainer: { marginBottom: '24px' },
  progressBar: {
    width: '100%', height: '12px', backgroundColor: '#e5e7eb',
    borderRadius: '6px', overflow: 'hidden', marginBottom: '8px'
  },
  progressFill: { height: '100%', transition: 'width 0.3s ease' },
  progressText: { fontSize: '12px', color: '#64748b', margin: 0 },
  contentGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px', marginBottom: '24px'
  },
  section: {
    padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  sectionTitle: {
    fontSize: '16px', fontWeight: '700', color: '#1e293b',
    marginBottom: '12px', marginTop: 0
  },
  infoBox: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: {
    fontSize: '12px', fontWeight: '600', color: '#64748b',
    margin: 0, marginTop: '8px'
  },
  value: {
    fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: 0
  },
  timelineGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px'
  },
  timelineItem: {
    padding: '12px', backgroundColor: 'white', borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  checklistGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px'
  },
  checklistItem: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px',
    backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0',
    fontSize: '14px'
  },
  checkYes: { color: '#10b981' },
  checkNo: { color: '#ef4444' },
  closeBottomBtn: {
    width: '100%', padding: '12px', backgroundColor: '#6b7280',
    color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600',
    cursor: 'pointer', fontSize: '14px', marginTop: '16px'
  }
};

export default DealDetailsPopup;