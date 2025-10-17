import React, { useState, useEffect } from 'react';

const CreateDealModal = ({ propertyId, propertyTitle, onClose, onSuccess }) => {
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerId, setBuyerId] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Search for buyer by phone number
  const searchBuyer = async (phone) => {
    if (!phone || phone.length < 10) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // Note: This assumes you have a buyer search endpoint
      // If not, we'll create deals without pre-validation
      // The backend will validate the buyerId exists
      setSearching(false);
    } catch (err) {
      console.error('Error searching buyer:', err);
      setSearching(false);
    }
  };

  const handlePhoneChange = (e) => {
    const phone = e.target.value;
    setBuyerPhone(phone);
    setBuyerId(null); // Reset buyer ID when phone changes
    // Optionally search as user types
    if (phone.length === 10) {
      searchBuyer(phone);
    }
  };

  const handleCreateDeal = async () => {
    setError(null);

    // Validation
    if (!propertyId) {
      setError('Property is required');
      return;
    }

    if (!buyerId && !buyerPhone) {
      setError('Please select or search for a buyer');
      return;
    }

    // For now, we'll use a simple approach:
    // If no buyer ID selected, show error prompting to enter phone
    if (!buyerId) {
      setError('Please enter a valid buyer phone number (10 digits)');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/deals/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          propertyId: propertyId,
          buyerId: buyerId,
          agentId: JSON.parse(localStorage.getItem('user')).id // Current agent
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Deal created successfully!\nDeal Stage: ${data.data.stage}`);
        if (onSuccess) onSuccess(data.data);
        onClose();
      } else {
        setError(data.message || 'Failed to create deal');
      }
    } catch (err) {
      setError('Error creating deal: ' + err.message);
      console.error(err);
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

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={e => e.stopPropagation()}>
        {/* Header */}
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

        {/* Error Message */}
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

        {/* Property Info (Read-only) */}
        <div style={{
          padding: '12px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #bfdbfe',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Property</div>
          <div style={{ fontWeight: '600', color: '#1e40af' }}>
            {propertyTitle || 'Selected Property'}
          </div>
        </div>

        {/* Buyer Phone Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
            👤 Buyer Phone Number *
          </label>
          <input
            type="tel"
            placeholder="Enter 10-digit phone number"
            value={buyerPhone}
            onChange={handlePhoneChange}
            maxLength="10"
            pattern="[0-9]{10}"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box',
              marginBottom: '8px'
            }}
          />
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Enter the buyer's 10-digit mobile number
          </div>
        </div>

        {/* Buyer Name (Optional) */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
            📝 Buyer Name (Optional)
          </label>
          <input
            type="text"
            placeholder="Buyer's full name"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Initial Notes */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
            📋 Initial Notes
          </label>
          <textarea
            placeholder="Add initial notes (e.g., 'High priority buyer', 'Budget: 50L')"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box',
              minHeight: '80px',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Info Box */}
        <div style={{
          padding: '12px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #fcd34d',
          marginBottom: '16px',
          fontSize: '12px',
          color: '#92400e'
        }}>
          <strong>ℹ️ Note:</strong> Deal will be created in INQUIRY stage. Use the buyer's phone to identify them in the system.
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
            disabled={loading || !propertyId}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: loading ? '#ccc' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
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

export default CreateDealModal;