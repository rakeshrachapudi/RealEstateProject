// src/pages/SellerDealsPage.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import DealDetailModal from '../DealDetailModal';
import { styles } from '../styles';

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
      // Fetch all deals where property.user.id === current user
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
        console.log('✅ Seller deals loaded:', data.data);
        setDeals(data.data || []);
      } else {
        console.log('❌ Failed to load seller deals');
        setDeals([]);
      }
    } catch (error) {
      console.error('Error fetching seller deals:', error);
      setDeals([]);
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
  const activeDealCount = deals.filter(d => (d.stage || d.currentStage) !== 'COMPLETED').length;
  const completedDealCount = deals.filter(d => (d.stage || d.currentStage) === 'COMPLETED').length;

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}>⏳</div>
          <h3>Loading deals on your properties...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>🏠 Deals on My Properties</h1>
        <p style={styles.pageSubtitle}>Monitor all buyer inquiries and deals for your listed properties</p>
      </div>

      {/* Filter Tabs */}
      <div style={containerStyles.filterTabsStyle}>
        <button
          onClick={() => setActiveFilter('active')}
          style={{
            ...containerStyles.tabStyle,
            ...(activeFilter === 'active' ? containerStyles.activeTabStyle : {})
          }}
        >
          📈 Active ({activeDealCount})
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          style={{
            ...containerStyles.tabStyle,
            ...(activeFilter === 'completed' ? containerStyles.activeTabStyle : {})
          }}
        >
          ✅ Completed ({completedDealCount})
        </button>
        <button
          onClick={() => setActiveFilter('all')}
          style={{
            ...containerStyles.tabStyle,
            ...(activeFilter === 'all' ? containerStyles.activeTabStyle : {})
          }}
        >
          📊 All ({deals.length})
        </button>
      </div>

      {/* Deals Grid */}
      {filteredDeals.length === 0 ? (
        <div style={containerStyles.emptyStateStyle}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>
            No Deals Yet
          </h3>
          <p style={{ color: '#64748b', margin: 0 }}>
            {activeFilter === 'active' && 'No active deals on your properties'}
            {activeFilter === 'completed' && 'No completed deals yet'}
            {activeFilter === 'all' && 'No deals have been created for your properties'}
          </p>
        </div>
      ) : (
        <div style={containerStyles.gridStyle}>
          {filteredDeals.map(deal => (
            <div
              key={deal.id || deal.dealId}
              style={containerStyles.cardStyle}
              onClick={() => setSelectedDeal(deal)}
            >
              {/* Stage Badge */}
              <div
                style={{
                  ...containerStyles.stageBadgeStyle,
                  backgroundColor: getStageColor(deal.stage || deal.currentStage)
                }}
              >
                {deal.stage || deal.currentStage}
              </div>

              {/* Property Title */}
              <h3 style={containerStyles.cardTitleStyle}>{deal.property?.title}</h3>

              {/* Deal Information */}
              <div style={containerStyles.dealInfoStyle}>
                <div style={containerStyles.infoRowStyle}>
                  <span>👤 Buyer:</span>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>
                    {deal.buyer?.firstName} {deal.buyer?.lastName}
                  </span>
                </div>

                <div style={containerStyles.infoRowStyle}>
                  <span>📞 Buyer Phone:</span>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>
                    {deal.buyer?.mobileNumber || 'N/A'}
                  </span>
                </div>

                {deal.agent && (
                  <div style={containerStyles.infoRowStyle}>
                    <span>📊 Agent:</span>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>
                      {deal.agent.firstName} {deal.agent.lastName}
                    </span>
                  </div>
                )}

                {deal.agreedPrice && (
                  <div style={{...containerStyles.infoRowStyle, marginTop: '8px'}}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>
                      💰 ₹{deal.agreedPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>

              {/* Date */}
              <div style={containerStyles.dateStyle}>
                Created: {new Date(deal.createdAt).toLocaleDateString()}
              </div>

              {/* View Button */}
              <button style={containerStyles.viewBtnStyle}>
                📋 View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Deal Detail Modal */}
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

const containerStyles = {
  filterTabsStyle: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '12px',
    flexWrap: 'wrap',
  },
  tabStyle: {
    padding: '10px 20px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    color: '#64748b',
    transition: 'all 0.2s',
  },
  activeTabStyle: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6',
  },
  gridStyle: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  cardStyle: {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    ':hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transform: 'translateY(-2px)',
    }
  },
  stageBadgeStyle: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '6px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  cardTitleStyle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 12px 0',
  },
  dealInfoStyle: {
    marginBottom: '12px',
    fontSize: '13px',
    color: '#64748b',
  },
  infoRowStyle: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
    fontSize: '13px',
  },
  dateStyle: {
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '16px',
  },
  viewBtnStyle: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'background 0.2s',
  },
  emptyStateStyle: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '2px dashed #e2e8f0',
  },
};

export default SellerDealsPage;