import React, { useEffect, useState } from 'react';
import DealDetailModal from './DealDetailModal';

const AdminDealPanel = () => {
  const [pendingDeals, setPendingDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/deals/stats/by-stage', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      console.log('📊 Deal Stats:', data);

      // Fetch all deals at different stages
      const allDeals = [];
      const stages = ['INQUIRY', 'SHORTLIST', 'NEGOTIATION', 'AGREEMENT', 'REGISTRATION', 'PAYMENT'];

      for (const stage of stages) {
        const res = await fetch(`http://localhost:8080/api/deals/stage/${stage}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        const stageData = await res.json();
        if (stageData.success && stageData.data) {
          allDeals.push(...stageData.data);
        }
      }

      setPendingDeals(allDeals);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '24px'
  };

  const tabsStyle = {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '12px'
  };

  const tabStyle = (isActive) => ({
    padding: '10px 20px',
    backgroundColor: isActive ? '#3b82f6' : '#f8fafc',
    color: isActive ? 'white' : '#64748b',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  });

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
    marginTop: '16px'
  };

  const cardStyle = {
    padding: '16px',
    backgroundColor: '#fef3c7',
    borderRadius: '12px',
    border: '1px solid #fcd34d',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  };

  const renderDealCards = (deals, stage = null) => {
    const filtered = stage ? deals.filter(d => d.stage === stage) : deals;

    if (filtered.length === 0) {
      return <p style={{ color: '#64748b' }}>No deals found</p>;
    }

    return (
      <div style={gridStyle}>
        {filtered.map((deal) => (
          <div
            key={deal.id}
            style={cardStyle}
            onClick={() => setSelectedDeal(deal)}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <span style={{
                display: 'inline-block',
                padding: '4px 8px',
                backgroundColor: '#f59e0b',
                color: 'white',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {deal.stage}
              </span>
            </div>

            <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontWeight: '600' }}>
              {deal.property?.title}
            </h4>

            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b' }}>
              Buyer: {deal.buyer?.firstName} {deal.buyer?.lastName}
            </p>

            {deal.agent && (
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748b' }}>
                Agent: {deal.agent?.firstName}
              </p>
            )}

            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b' }}>
              Created: {new Date(deal.createdAt).toLocaleDateString()}
            </p>

            <button
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '12px'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDeal(deal);
              }}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div style={containerStyle}><h2>⏳ Loading deals...</h2></div>;
  }

  const stages = ['INQUIRY', 'SHORTLIST', 'NEGOTIATION', 'AGREEMENT', 'REGISTRATION', 'PAYMENT'];
  const stageCounts = {};
  stages.forEach(stage => {
    stageCounts[stage] = pendingDeals.filter(d => d.stage === stage).length;
  });

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>⚙️ Admin Dashboard - Deal Management</h1>

      <div style={tabsStyle}>
        <button
          style={tabStyle(activeTab === 'all')}
          onClick={() => setActiveTab('all')}
        >
          All Deals ({pendingDeals.length})
        </button>
        {stages.map(stage => (
          <button
            key={stage}
            style={tabStyle(activeTab === stage)}
            onClick={() => setActiveTab(stage)}
          >
            {stage} ({stageCounts[stage]})
          </button>
        ))}
      </div>

      {activeTab === 'all' ? renderDealCards(pendingDeals) : renderDealCards(pendingDeals, activeTab)}

      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdate={() => {
            setSelectedDeal(null);
            fetchDeals();
          }}
          userRole="ADMIN"
        />
      )}
    </div>
  );
};

export default AdminDealPanel;