import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import DealProgressBar from '../components/DealProgressBar.jsx';

const AgentDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user || (user.role !== 'AGENT' && user.role !== 'ADMIN')) {
      navigate('/');
      return;
    }
    fetchAgentData();
  }, [user, isAuthenticated]);

  const fetchAgentData = async () => {
    setLoading(true);
    try {
      const [dealsRes, propsRes, statsRes] = await Promise.all([
        fetch(`http://localhost:8080/api/deals/agent/${user.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        }),
        fetch(`http://localhost:8080/api/agents/${user.id}/all-properties`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        }),
        fetch(`http://localhost:8080/api/agents/${user.id}/stats`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        })
      ]);

      if (dealsRes.ok) {
        const data = await dealsRes.json();
        setDeals(data.data || data.success ? data.data : []);
      }
      if (propsRes.ok) {
        const data = await propsRes.json();
        setProperties(data.data || data.success ? data.data : []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.data || data.success ? data.data : {});
      }
    } catch (err) {
      console.error('Error fetching agent data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div style={styles.container}><h2>Please log in</h2></div>;
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h3>Loading dashboard...</h3>
        </div>
      </div>
    );
  }

  const activeDealCount = stats.activeDealCount || 0;
  const completedDealCount = stats.completedDealCount || 0;
  const conversionRate = stats.conversionRate || '0%';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Agent Dashboard</h1>
        <p style={styles.subtitle}>Manage your deals and properties</p>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📈</div>
          <div style={styles.statLabel}>Active Deals</div>
          <div style={styles.statValue}>{activeDealCount}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statLabel}>Completed Deals</div>
          <div style={styles.statValue}>{completedDealCount}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🏠</div>
          <div style={styles.statLabel}>Properties Managed</div>
          <div style={styles.statValue}>{properties.length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div style={styles.statLabel}>Conversion Rate</div>
          <div style={styles.statValue}>{conversionRate}</div>
        </div>
      </div>
{/* Create Deal Section */}
<div style={{
  padding: '16px',
  backgroundColor: '#f0f9ff',
  borderRadius: '12px',
  border: '1px solid #bfdbfe',
  marginBottom: '24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}}>
  <div>
    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '4px' }}>
      ➕ Create New Deal
    </div>
    <div style={{ fontSize: '12px', color: '#64748b' }}>
      Create a deal for a buyer interested in a property
    </div>
  </div>
  <button
    onClick={() => setShowCreateDeal(true)}
    style={{
      padding: '10px 20px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      whiteSpace: 'nowrap',
      marginLeft: '12px'
    }}
  >
    + New Deal
  </button>
</div>

{/* Create Deal Modal */}
{showCreateDeal && (
  <CreateDealModal
    propertyId={null}
    propertyTitle="Select during deal creation"
    onClose={() => {
      setShowCreateDeal(false);
      setSelectedPropertyId(null);
    }}
    onSuccess={() => {
      fetchAgentDeals();
      fetchAgentStats();
      console.log('Deal created successfully');
    }}
  />
)}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>💼 Active Deals ({activeDealCount})</h2>
        {deals.length > 0 ? (
          <div style={styles.dealsGrid}>
            {deals.map(deal => (
              <div key={deal.id} style={styles.dealCard}>
                <DealProgressBar
                  deal={deal}
                  isEditable={true}
                  onStageChange={(newStage) => {
                    console.log('Stage changed to:', newStage);
                    fetchAgentData();
                  }}
                />
                <div style={styles.dealInfo}>
                  <h3 style={styles.dealTitle}>{deal.property?.title || 'Property'}</h3>
                  <p style={styles.dealProperty}>📍 {deal.property?.city || 'Unknown Location'}</p>
                  <p style={styles.dealBuyer}>👤 Buyer: {deal.buyer?.firstName || 'N/A'} {deal.buyer?.lastName || ''}</p>
                  {deal.agent && (<p style={styles.dealAgent}>📊 Agent: {deal.agent.firstName} {deal.agent.lastName}</p>)}
                  <p style={styles.dealStage}>Current Stage: <strong>{deal.stage}</strong></p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}><p>No active deals yet</p></div>
        )}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🏘️ Properties Under Management ({properties.length})</h2>
        {properties.length > 0 ? (
          <div style={styles.propertiesTable}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Property</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {properties.map(prop => (
                  <tr key={prop.propertyId || prop.id} style={styles.tableRow}>
                    <td style={styles.td}>{prop.title}</td>
                    <td style={styles.td}>{prop.propertyType || prop.type}</td>
                    <td style={styles.td}>{prop.areaName || prop.city}</td>
                    <td style={styles.td}>{prop.priceDisplay}</td>
                    <td style={styles.td}><span style={{...styles.statusBadge, backgroundColor: prop.isVerified ? '#d1fae5' : '#fef3c7', color: prop.isVerified ? '#065f46' : '#92400e'}}>{prop.isVerified ? '✅ Verified' : '⏳ Pending'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.emptyState}><p>No properties under management</p></div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: 1400, margin: '0 auto', padding: '24px 32px', minHeight: '80vh', backgroundColor: '#f9fafb' },
  header: { marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid #e5e7eb' },
  title: { fontSize: '36px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' },
  subtitle: { fontSize: '16px', color: '#64748b', fontWeight: '500' },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #fca5a5' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' },
  statCard: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center', border: '1px solid #e5e7eb' },
  statIcon: { fontSize: '32px', marginBottom: '12px' },
  statLabel: { fontSize: '14px', color: '#64748b', marginBottom: '8px' },
  statValue: { fontSize: '28px', fontWeight: '700', color: '#1e293b' },
  section: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  sectionTitle: { fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #e5e7eb' },
  dealsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' },
  dealCard: { backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  dealInfo: { marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' },
  dealTitle: { fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px 0' },
  dealProperty: { fontSize: '13px', color: '#64748b', margin: '4px 0' },
  dealBuyer: { fontSize: '13px', color: '#64748b', margin: '4px 0' },
  dealAgent: { fontSize: '13px', color: '#64748b', margin: '4px 0' },
  dealStage: { fontSize: '13px', color: '#64748b', margin: '8px 0 0 0', padding: '8px', backgroundColor: '#e0f2fe', borderRadius: '6px' },
  propertiesTable: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { backgroundColor: '#f1f5f9' },
  th: { padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#1e293b', borderBottom: '2px solid #e2e8f0' },
  tableRow: { borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' },
  td: { padding: '12px', fontSize: '14px', color: '#475569' },
  statusBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
  loading: { textAlign: 'center', padding: '80px 20px' },
  emptyState: { textAlign: 'center', padding: '40px 20px', color: '#64748b', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #e2e8f0' }
};

export default AgentDashboard;