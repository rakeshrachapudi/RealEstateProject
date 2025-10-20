// rakeshrachapudi/realestateproject/RealEstateProject-43fb79bfe93ea0f3ae6d185115e6fa16af369e3c/realestate-frontend/src/pages/CreateDealModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { BACKEND_BASE_URL } from "../config/config";

const CreateDealModal = ({ propertyId, propertyTitle, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerId, setBuyerId] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searching, setSearching] = useState(false);
  const [buyerFound, setBuyerFound] = useState(false);

  // ✅ FIX: Implemented the buyer search functionality
  const searchBuyer = async (phone) => {
    if (!phone || phone.length !== 10) {
      return;
    }

    setSearching(true);
    setError(null);
    setBuyerFound(false);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/users/search?phone=${phone}`);
      const data = await response.json();
      if (data.success && data.data) {
        setBuyerId(data.data.id);
        setBuyerName(`${data.data.firstName} ${data.data.lastName}`);
        setBuyerFound(true);
        setError(null);
      } else {
        setBuyerId(null);
        setBuyerName('');
        setBuyerFound(false);
        setError('Buyer not found. They must be registered.');
      }
    } catch (err) {
      setError('Error searching for buyer.');
      console.error('Error searching buyer:', err);
    } finally {
      setSearching(false);
    }
  };


  const handlePhoneChange = (e) => {
    const phone = e.target.value.replace(/\D/g, ''); // Allow only digits
    setBuyerPhone(phone);
    setBuyerId(null);
    setBuyerFound(false);
    setError(null);
    if (phone.length === 10) {
      searchBuyer(phone);
    }
  };

  const handleCreateDeal = async () => {
    setError(null);

    if (!propertyId) {
      setError('Property is required');
      return;
    }

    if (!buyerId) {
      setError('A registered buyer must be found using their phone number.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/deals/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          propertyId: propertyId,
          buyerId: buyerId,
          agentId: user.id
        })
      });

      const data = await response.json();

      if (data.success || response.ok) {
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
            {searching ? 'Searching...' : buyerFound ? `✅ Found: ${buyerName}` : 'Enter the buyer\'s 10-digit mobile number'}
          </div>
        </div>

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

        <div style={{
          padding: '12px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #fcd34d',
          marginBottom: '16px',
          fontSize: '12px',
          color: '#92400e'
        }}>
          <strong>ℹ️ Note:</strong> The buyer must be a registered user. The deal will be created in the 'INQUIRY' stage.
        </div>

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
            disabled={loading || !buyerFound}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: (loading || !buyerFound) ? '#ccc' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (loading || !buyerFound) ? 'not-allowed' : 'pointer',
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