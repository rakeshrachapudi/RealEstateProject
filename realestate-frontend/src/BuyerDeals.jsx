// src/BuyerDeals.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import DealDetailModal from './DealDetailModal';

const BuyerDeals = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchBuyerDeals();
    }
  }, [user]);

  const fetchBuyerDeals = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/deals/buyer/${user.id}`,
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
      console.error('Error fetching buyer deals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>⏳ Loading your deals...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>
        💰 My Purchase Deals
      </h1>

      {deals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <p>You haven't started any deals yet</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {deals.map(deal => (
            <div
              key={deal.id}
              onClick={() => setSelectedDeal(deal)}
              style={{
                padding: '16px',
                backgroundColor: '#fef3c7',
                borderRadius: '12px',
                border: '1px solid #fcd34d',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <h3 style={{ margin: '0 0 8px 0' }}>
                {deal.property?.title}
              </h3>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b' }}>
                Stage: <strong>{deal.stage}</strong>
              </p>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b' }}>
                Agent: {deal.agent?.firstName || 'Not assigned'}
              </p>
              <button
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '12px'
                }}
              >
                View Deal
              </button>
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
            fetchBuyerDeals();
          }}
          userRole="BUYER"
        />
      )}
    </div>
  );
};

export default BuyerDeals;