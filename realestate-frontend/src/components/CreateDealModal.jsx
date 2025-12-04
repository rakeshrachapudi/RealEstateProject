// src/components/CreateDealModal.jsx - UPDATED WITH EXPECTED PRICE
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { BACKEND_BASE_URL } from "../config/config";

const CreateDealModal = ({ propertyId, propertyTitle, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerId, setBuyerId] = useState(null);
  const [notes, setNotes] = useState('');
  const [expectedPrice, setExpectedPrice] = useState(''); // ✅ ADDED - Expected Price
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

    // ✅ ADDED - Validate expected price if provided
    if (expectedPrice && (isNaN(expectedPrice) || parseFloat(expectedPrice) <= 0)) {
      setError('Please enter a valid expected price');
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        propertyId: propertyId,
        buyerId: buyerId,
        agentId: user.id
      };

      // ✅ ADDED - Include expected price if provided
      if (expectedPrice && parseFloat(expectedPrice) > 0) {
        requestBody.agreedPrice = parseFloat(expectedPrice);
      }

      const response = await fetch(`${BACKEND_BASE_URL}/api/deals/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success || response.ok) {
        alert(`✅ Deal created successfully!\nDeal Stage: ${data.data?.stage || 'INQUIRY'}`);
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

  // ✅ ADDED - Format price for display
  const formatPrice = (price) => {
    if (!price) return '';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '';
    return numPrice.toLocaleString('en-IN');
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

        {/* ✅ ADDED - Expected Price Field */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
            💰 Expected Price (Optional)
          </label>
          <input
            type="number"
            placeholder="Enter expected deal price"
            value={expectedPrice}
            onChange={(e) => setExpectedPrice(e.target.value)}
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
          {expectedPrice && (
            <div style={{ fontSize: '12px', color: '#10b981', marginBottom: '4px' }}>
              Formatted: ₹{formatPrice(expectedPrice)}
            </div>
          )}
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Leave empty if price will be negotiated later
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

const styles = {
  backdrop: {
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
    overflowY: 'auto',
    backdropFilter: 'blur(3px)'
  },
  container: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
    marginTop: '20px',
    marginBottom: '20px'
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    fontSize: '32px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: 0,
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '24px',
    marginTop: 0
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontWeight: '500',
    border: '1px solid #fecaca'
  },
  section: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px',
    margin: '0 0 8px 0'
  },
  sectionSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '16px',
    margin: '0 0 16px 0'
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginBottom: '20px'
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginBottom: '16px'
  },
  infoCardTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e293b'
  },
  infoCardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#64748b'
  },
  bold: {
    fontWeight: '700',
    color: '#1e293b'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    fontSize: '14px',
    color: '#1e293b'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  hint: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '8px'
  },
  pricePreview: {
    fontSize: '13px',
    color: '#10b981',
    marginTop: '8px',
    fontWeight: '600'
  },
  formGroup: {
    marginBottom: '16px'
  },
  button: {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  changeBtn: {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '12px',
    cursor: 'pointer'
  },
  secondaryButton: {
    padding: '12px 20px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px'
  },
  noteBox: {
    backgroundColor: '#fef3c7',
    border: '1px solid #fcd34d',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#92400e',
    marginTop: '20px'
  }
};

export default CreateDealModal;