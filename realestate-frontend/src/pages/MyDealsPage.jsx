// src/pages/MyDealsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import DealDetailModal from '../DealDetailModal';

const MyDealsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [activeFilter, setActiveFilter] = useState('active');

  useEffect(() => {
    if (!user?.id) {
      navigate('/');
      return;
    }
    fetchRoleBasedDeals();
  }, [user, navigate]);

  const fetchRoleBasedDeals = async () => {
    setLoading(true);
    try {
      let dealsData = [];
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      };

      console.log('👤 User Role:', user.role);
      console.log('👤 User ID:', user.id);

      switch (user.role) {
        // BUYER: Sees deals they're interested in (deals where they are the buyer)
        case 'BUYER':
          console.log('🔥 Fetching buyer deals...');
          const buyerRes = await fetch(
            `http://localhost:8080/api/deals/buyer/${user.id}`,
            { headers }
          );
          if (buyerRes.ok) {
            const data = await buyerRes.json();
            dealsData = Array.isArray(data) ? data : (data.data || []);
            console.log(`✅ Buyer deals found: ${dealsData.length}`);
          }
          break;

        // SELLER: Sees deals on their own properties
        case 'SELLER':
          console.log('🔥 Fetching seller deals...');
          const sellerRes = await fetch(
            'http://localhost:8080/api/deals/my-deals?userRole=SELLER',
            { headers }
          );
          if (sellerRes.ok) {
            const data = await sellerRes.json();
            dealsData = data.success ? data.data : [];
            console.log(`✅ Seller deals found: ${dealsData.length}`);
          }
          break;

        // AGENT: Sees only deals they created
        case 'AGENT':
          console.log('🔥 Fetching agent deals...');
          const agentRes = await fetch(
            `http://localhost:8080/api/deals/agent/${user.id}`,
            { headers }
          );
          if (agentRes.ok) {
            const data = await agentRes.json();
            dealsData = Array.isArray(data) ? data : (data.data || []);
            console.log(`✅ Agent deals found: ${dealsData.length}`);
          }
          break;

        // ADMIN: Sees all deals across all agents
        case 'ADMIN':
          console.log('🔥 Fetching all deals for admin...');
          const stages = ['INQUIRY', 'SHORTLIST', 'NEGOTIATION', 'AGREEMENT', 'REGISTRATION', 'PAYMENT', 'COMPLETED'];
          const allDeals = [];

          for (const stage of stages) {
            const res = await fetch(
              `http://localhost:8080/api/deals/stage/${stage}`,
              { headers }
            );
            if (res.ok) {
              const stageData = await res.json();
              if (stageData.success && stageData.data) {
                allDeals.push(...stageData.data);
              }
            }
          }
          dealsData = allDeals;
          console.log(`✅ Admin deals found: ${dealsData.length}`);
          break;

        default:
          console.log('❌ Unknown role:', user.role);
      }

      setDeals(dealsData);
    } catch (error) {
      console.error('Error fetching deals:', error);
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

  const getPageTitle = () => {
    const titles = {
      'BUYER': '💰 My Purchase Deals',
      'SELLER': '🏠 Deals on My Properties',
      'AGENT': '📊 Deals I Created',
      'ADMIN': '👥 All Platform Deals'
    };
    return titles[user?.role] || 'My Deals';
  };

  const getPageDescription = () => {
    const descriptions = {
      'BUYER': 'Track properties you\'re interested in purchasing',
      'SELLER': 'Monitor deals on your listed properties',
      'AGENT': 'Manage deals you\'ve created for buyers',
      'ADMIN': 'View and manage all deals across agents'
    };
    return descriptions[user?.role] || 'Your deals';
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

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (typeof price === 'number') {
      return price.toLocaleString('en-IN');
    }
    return String(price);
  };

  const filteredDeals = getFilteredDeals();
  const activeDealCount = deals.filter(d => (d.stage || d.currentStage) !== 'COMPLETED').length;
  const completedDealCount = deals.filter(d => (d.stage || d.currentStage) === 'COMPLETED').length;

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p>Loading your deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>{getPageTitle()}</h1>
        <p style={styles.subtitle}>{getPageDescription()}</p>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterTabs}>
        <button
          onClick={() => setActiveFilter('active')}
          style={{
            ...styles.tab,
            ...(activeFilter === 'active' ? styles.activeTab : {})
          }}
        >
          📈 Active ({activeDealCount})
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          style={{
            ...styles.tab,
            ...(activeFilter === 'completed' ? styles.activeTab : {})
          }}
        >
          ✅ Completed ({completedDealCount})
        </button>
        <button
          onClick={() => setActiveFilter('all')}
          style={{
            ...styles.tab,
            ...(activeFilter === 'all' ? styles.activeTab : {})
          }}
        >
          📊 All ({deals.length})
        </button>
      </div>

      {/* Deals Grid or Empty State */}
      {filteredDeals.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔭</div>
          <h3 style={styles.emptyTitle}>No Deals Found</h3>
          <p style={styles.emptyText}>
            {activeFilter === 'active' && 'No active deals at the moment'}
            {activeFilter === 'completed' && 'No completed deals yet'}
            {activeFilter === 'all' && 'No deals have been created yet'}
          </p>
        </div>
      ) : (
        <div style={styles.dealsGrid}>
          {filteredDeals.map(deal => (
            <div
              key={deal.id || deal.dealId}
              style={styles.dealCard}
              onClick={() => setSelectedDeal(deal)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
              }}
            >
              {/* Stage Badge */}
              <div
                style={{
                  ...styles.stageBadge,
                  backgroundColor: getStageColor(deal.stage || deal.currentStage)
                }}
              >
                {deal.stage || deal.currentStage}
              </div>

              {/* Property Title */}
              <h3 style={styles.dealTitle}>
                {deal.propertyTitle || deal.property?.title || 'Property'}
              </h3>

              {/* Agreed Price - Prominent Display */}
              {deal.agreedPrice && (
                <div style={styles.priceDisplay}>
                  💰 ₹{formatPrice(deal.agreedPrice)}
                </div>
              )}

              {/* Buyer Details */}
              {deal.buyer && (
                <div style={styles.personDetail}>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>👤 Buyer</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                    {deal.buyerName || `${deal.buyer?.firstName} ${deal.buyer?.lastName}`}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    📞 {deal.buyerMobile || deal.buyer?.mobileNumber || 'N/A'}
                  </div>
                </div>
              )}

              {/* Seller Details - Show for Buyers and Admins */}
              {(user?.role === 'BUYER' || user?.role === 'ADMIN') && deal.property?.user && (
                <div style={styles.personDetail}>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>🏠 Seller</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                    {deal.sellerName || `${deal.property.user?.firstName} ${deal.property.user?.lastName}`}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    📞 {deal.sellerMobile || deal.property.user?.mobileNumber || 'N/A'}
                  </div>
                </div>
              )}

              {/* Seller as Current User - Show for Sellers */}
              {user?.role === 'SELLER' && deal.property?.user && (
                <div style={styles.personDetail}>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>🏠 Seller (You)</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                    {deal.sellerName || `${deal.property.user?.firstName} ${deal.property.user?.lastName}`}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    📞 {deal.sellerMobile || deal.property.user?.mobileNumber || 'N/A'}
                  </div>
                </div>
              )}

              {/* Agent Details */}
              {deal.agent && (
                <div style={styles.personDetail}>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>📊 Agent</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                    {deal.agentName || `${deal.agent?.firstName} ${deal.agent?.lastName}`}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    📧 {deal.agentEmail || deal.agent?.email || 'N/A'}
                  </div>
                </div>
              )}

              {/* Date */}
              <div style={styles.date}>
                Created: {new Date(deal.createdAt).toLocaleDateString()}
              </div>

              {/* View Button */}
              <button
                style={styles.viewBtn}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
              >
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
            fetchRoleBasedDeals();
          }}
          userRole={user?.role}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '24px 32px',
    minHeight: '80vh',
  },
  header: {
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '2px solid #e2e8f0',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px',
    margin: 0,
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0,
  },
  loadingState: {
    textAlign: 'center',
    padding: '80px 20px',
    fontSize: '18px',
    color: '#64748b',
  },
  filterTabs: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '12px',
    flexWrap: 'wrap',
  },
  tab: {
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
  activeTab: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    border: '2px dashed #e2e8f0',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#64748b',
  },
  dealsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  dealCard: {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  stageBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '6px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  dealTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 12px 0',
  },
  priceDisplay: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#10b981',
    backgroundColor: '#ecfdf5',
    padding: '10px 12px',
    borderRadius: '6px',
    marginBottom: '12px',
    border: '1px solid #86efac',
  },
  personDetail: {
    padding: '10px 12px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    marginBottom: '10px',
    fontSize: '13px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    borderLeft: '3px solid #3b82f6',
  },
  date: {
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '16px',
  },
  viewBtn: {
    width: '100%',
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};

export default MyDealsPage;