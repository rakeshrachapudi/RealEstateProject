// src/pages/SellerDealsPage.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import DealDetailModal from '../DealDetailModal';

const SellerDealsPage = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [activeFilter, setActiveFilter] = useState('active');

  useEffect(() => {
    if (user?.id) {
      fetchSellerDeals();
    }
  }, [user]);

  const fetchSellerDeals = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'http://localhost:8080/api/deals/my-deals?userRole=SELLER',
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      const data = await response.json();
      if (data.success) {
        setDeals(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching seller deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDeals = () => {
    if (activeFilter === 'active') {
      return deals.filter(d => (d.stage || d.currentStage) !== 'COMPLETED');
    } else if (activeFilter === 'completed') {
      return deals.filter(d => (d.stage || d.currentStage) === 'COMPLETED');
    }
    return deals;
  };

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

  const filteredDeals = getFilteredDeals();

  if (loading) {
    return <div style={{ ...containerStyle, textAlign: 'center' }}>Loading your property deals...</div>;
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>🏠 My Properties - Active Deals</h1>
      <p style={subtitleStyle}>Monitor all deals on properties you've listed</p>

      {/* Filter Tabs */}
      <div style={filterTabsStyle}>
        <button
          onClick={() => setActiveFilter('active')}
          style={{
            ...tabStyle,
            ...(activeFilter === 'active' ? activeTabStyle : {})
          }}
        >
          📈 Active ({deals.filter(d => (d.stage || d.currentStage) !== 'COMPLETED').length})
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          style={{
            ...tabStyle,
            ...(activeFilter === 'completed' ? activeTabStyle : {})
          }}
        >
          ✅ Completed ({deals.filter(d => (d.stage || d.currentStage) === 'COMPLETED').length})
        </button>
        <button
          onClick={() => setActiveFilter('all')}
          style={{
            ...tabStyle,
            ...(activeFilter === 'all' ? activeTabStyle : {})
          }}
        >
          📊 All ({deals.length})
        </button>
      </div>

      {/* Deals Grid */}
      {filteredDeals.length === 0 ? (
        <div style={emptyStateStyle}>
          <p>📭 No deals on your properties yet</p>
        </div>
      ) : (
        <div style={gridStyle}>
          {filteredDeals.map(deal => (
            <div key={deal.id} style={cardStyle} onClick={() => setSelectedDeal(deal)}>
              <div style={{ ...stageBadgeStyle, backgroundColor: getStageColor(deal.stage || deal.currentStage) }}>
                {deal.stage || deal.currentStage}
              </div>
              <h3 style={cardTitleStyle}>{deal.property?.title}</h3>
              <p style={metaStyle}>👤 Buyer: {deal.buyer?.firstName} {deal.buyer?.lastName}</p>
              <p style={metaStyle}>📞 {deal.buyer?.mobileNumber}</p>
              {deal.agreedPrice && (
                <p style={priceStyle}>💰 ₹{deal.agreedPrice.toLocaleString('en-IN')}</p>
              )}
              <p style={dateStyle}>{new Date(deal.createdAt).toLocaleDateString()}</p>
              <button style={viewBtnStyle}>View Details</button>
            </div>
          ))}
        </div>
      )}

      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdate={() => {
            setSelectedDeal(null);
            fetchSellerDeals();
          }}
          userRole="SELLER"
        />
      )}
    </div>
  );
};

// Styles
const containerStyle = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: '24px 32px',
  minHeight: '80vh',
};

const titleStyle = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#1e293b',
  marginBottom: '8px',
};

const subtitleStyle = {
  fontSize: '16px',
  color: '#64748b',
  marginBottom: '24px',
};

const filterTabsStyle = {
  display: 'flex',
  gap: '12px',
  marginBottom: '24px',
  borderBottom: '2px solid #e2e8f0',
  paddingBottom: '12px',
};

const tabStyle = {
  padding: '10px 20px',
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px',
  color: '#64748b',
  transition: 'all 0.2s',
};

const activeTabStyle = {
  backgroundColor: '#3b82f6',
  color: 'white',
  borderColor: '#3b82f6',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '16px',
};

const cardStyle = {
  padding: '16px',
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const stageBadgeStyle = {
  display: 'inline-block',
  padding: '6px 12px',
  borderRadius: '6px',
  color: 'white',
  fontSize: '12px',
  fontWeight: '600',
  marginBottom: '12px',
};

const cardTitleStyle = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#1e293b',
  margin: '0 0 12px 0',
};

const metaStyle = {
  fontSize: '13px',
  color: '#64748b',
  margin: '4px 0',
};

const priceStyle = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#10b981',
  margin: '8px 0 4px 0',
};

const dateStyle = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '8px 0 12px 0',
};

const viewBtnStyle = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#10b981',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px',
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '60px 20px',
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  border: '2px dashed #e2e8f0',
  color: '#64748b',
  fontSize: '16px',
};

export default SellerDealsPage;