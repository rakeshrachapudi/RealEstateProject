import React, { useState, useEffect } from 'react';

// ==================== CREATE DEAL MODAL (Updated) ====================
const CreateDealModal = ({ propertyId, propertyTitle, sellerPhone, onClose, onSuccess }) => {
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerInfo, setBuyerInfo] = useState(null);
  const [dealPrice, setDealPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searching, setSearching] = useState(false);

  const searchBuyer = async (phone) => {
    if (!phone || phone.length !== 10) return;
    setSearching(true);
    try {
      const response = await fetch(`http://localhost:8080/api/users/search?phone=${phone}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      const data = await response.json();
      const buyer = data.success ? data.data : data;
      if (buyer?.id) {
        setBuyerInfo(buyer);
        setError(null);
      }
    } catch (err) {
      setError('Error searching for buyer');
    } finally {
      setSearching(false);
    }
  };

  const handlePhoneChange = (e) => {
    const phone = e.target.value.replace(/\D/g, '').slice(0, 10);
    setBuyerPhone(phone);
    if (phone.length === 10) searchBuyer(phone);
  };

  const handleCreateDeal = async () => {
    setError(null);
    if (!propertyId || !buyerInfo?.id || !dealPrice) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/deals/create-with-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          propertyId,
          buyerId: buyerInfo.id,
          agreedPrice: parseFloat(dealPrice),
          notes
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Deal created successfully!');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(data.message || 'Failed to create deal');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    overflowY: 'auto'
  };

  const contentStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    marginTop: '20px',
    marginBottom: '20px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    marginBottom: '8px'
  };

  const infoBoxStyle = {
    padding: '12px',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    border: '1px solid #bfdbfe',
    marginBottom: '16px',
    fontSize: '13px'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>➕ Create New Deal</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Property Info */}
        <div style={infoBoxStyle}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Property</div>
          <div style={{ fontWeight: '600', color: '#1e40af' }}>{propertyTitle || 'Selected Property'}</div>
        </div>

        {/* Agent ID (Read-only) */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
            Agent ID (Your ID)
          </label>
          <input
            type="text"
            value={JSON.parse(localStorage.getItem('user') || '{}').id || 'N/A'}
            disabled
            style={{ ...inputStyle, backgroundColor: '#f8fafc', color: '#64748b' }}
          />
        </div>

        {/* Seller Phone (Read-only) */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
            Seller Phone Number (Property Owner)
          </label>
          <input
            type="text"
            value={sellerPhone || 'N/A'}
            disabled
            style={{ ...inputStyle, backgroundColor: '#f8fafc', color: '#64748b' }}
          />
        </div>

        {/* Buyer Phone */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
            Buyer Phone Number (10 Digits) *
          </label>
          <input
            type="tel"
            placeholder="Enter 10-digit number"
            value={buyerPhone}
            onChange={handlePhoneChange}
            maxLength="10"
            style={inputStyle}
          />
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {searching ? '🔍 Searching...' : buyerInfo ? `✅ Found: ${buyerInfo.firstName} ${buyerInfo.lastName}` : 'Enter buyer phone'}
          </div>
        </div>

        {/* Deal Price */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
            Agreed Deal Price (₹) *
          </label>
          <input
            type="number"
            placeholder="Enter agreed price"
            value={dealPrice}
            onChange={(e) => setDealPrice(e.target.value.replace(/\D/g, ''))}
            style={inputStyle}
          />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes..."
            style={{
              ...inputStyle,
              minHeight: '60px',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateDeal}
            disabled={loading || !buyerInfo || !dealPrice}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: (loading || !buyerInfo || !dealPrice) ? '#ccc' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (loading || !buyerInfo || !dealPrice) ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            {loading ? '⏳ Creating...' : '✅ Create Deal'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== ROLE-BASED DEALS VIEW ====================
const RoleBasedDealsView = ({ user }) => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    fetchDeals();
  }, [user, selectedAgent]);

  const fetchDeals = async () => {
    setLoading(true);
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` };

    try {
      let dealsData = [];

      if (user.role === 'BUYER') {
        // Buyer sees deals they're the buyer in
        const response = await fetch(`http://localhost:8080/api/deals/buyer/${user.id}`, { headers });
        if (response.ok) {
          const data = await response.json();
          dealsData = Array.isArray(data) ? data : (data.data || []);
        }
      } else if (user.role === 'SELLER') {
        // Seller sees deals on their own properties
        const response = await fetch(`http://localhost:8080/api/deals/my-deals?userRole=SELLER`, { headers });
        if (response.ok) {
          const data = await response.json();
          dealsData = data.success ? data.data : [];
        }
      } else if (user.role === 'AGENT') {
        // Agent sees only their own deals
        const response = await fetch(`http://localhost:8080/api/deals/agent/${user.id}`, { headers });
        if (response.ok) {
          const data = await response.json();
          dealsData = Array.isArray(data) ? data : (data.data || []);
        }
      } else if (user.role === 'ADMIN') {
        // Admin sees all deals
        if (selectedAgent) {
          const response = await fetch(`http://localhost:8080/api/deals/admin/agent/${selectedAgent}`, { headers });
          if (response.ok) {
            const data = await response.json();
            dealsData = data.success ? data.data : [];
          }
        } else {
          // Fetch all agents first
          const agentsRes = await fetch('http://localhost:8080/api/users/role/AGENT', { headers });
          if (agentsRes.ok) {
            const agentsData = await agentsRes.json();
            setAgents(agentsData.success ? agentsData.data : []);
          }
        }
      }

      setDeals(dealsData);
    } catch (err) {
      console.error('Error fetching deals:', err);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const getRoleTitle = () => {
    if (user.role === 'BUYER') return 'My Purchase Deals';
    if (user.role === 'SELLER') return 'Deals on My Properties';
    if (user.role === 'AGENT') return 'My Created Deals';
    if (user.role === 'ADMIN') return selectedAgent ? `Deals for Agent ${selectedAgent}` : 'All Deals by Agent';
    return 'Deals';
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

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>⏳ Loading deals...</div>;
  }

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '24px'
  };

  const dealCardStyle = {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    marginBottom: '16px'
  };

  const stageBadgeStyle = (stage) => ({
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '6px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: getStageColor(stage),
    marginBottom: '12px'
  });

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>{getRoleTitle()}</h1>

      {user.role === 'ADMIN' && !selectedAgent && agents.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Select Agent:</label>
          <select
            value={selectedAgent || ''}
            onChange={(e) => setSelectedAgent(e.target.value ? parseInt(e.target.value) : null)}
            style={{
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <option value="">All Agents</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>
                {agent.firstName} {agent.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      {deals.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          color: '#64748b'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
          <p>No deals found</p>
        </div>
      ) : (
        <div>
          {deals.map(deal => (
            <div key={deal.id || deal.dealId} style={dealCardStyle}>
              <div style={stageBadgeStyle(deal.stage || deal.currentStage)}>
                {deal.stage || deal.currentStage}
              </div>

              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                {deal.property?.title || 'Property'}
              </h3>

              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                <p style={{ margin: '4px 0' }}>📍 {deal.property?.city || 'Location'}</p>
                <p style={{ margin: '4px 0' }}>
                  💰 ₹{deal.agreedPrice ? deal.agreedPrice.toLocaleString('en-IN') : deal.property?.price?.toLocaleString('en-IN') || 'N/A'}
                </p>
                {deal.buyer && (
                  <p style={{ margin: '4px 0' }}>👤 Buyer: {deal.buyer.firstName} {deal.buyer.lastName}</p>
                )}
                {deal.agent && user.role === 'ADMIN' && (
                  <p style={{ margin: '4px 0' }}>🏢 Agent: {deal.agent.firstName} {deal.agent.lastName}</p>
                )}
                <p style={{ margin: '4px 0', fontSize: '12px', color: '#94a3b8' }}>
                  📅 {new Date(deal.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== DEMO COMPONENT ====================
export default function DealsManagementDemo() {
  const [user] = useState({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    role: 'AGENT', // Change to BUYER, SELLER, AGENT, or ADMIN to see different views
    email: 'john@example.com'
  });

  const [showCreateDeal, setShowCreateDeal] = useState(false);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{
        backgroundColor: 'white',
        padding: '16px',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>📊 Deals Management</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>
              Logged in as: <strong>{user.role}</strong> ({user.firstName} {user.lastName})
            </span>
            {(user.role === 'AGENT' || user.role === 'ADMIN') && (
              <button
                onClick={() => setShowCreateDeal(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ➕ New Deal
              </button>
            )}
          </div>
        </div>
      </div>

      <RoleBasedDealsView user={user} />

      {showCreateDeal && (
        <CreateDealModal
          propertyId={1}
          propertyTitle="2 BHK Apartment in Gachibowli"
          sellerPhone="9876543210"
          onClose={() => setShowCreateDeal(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}