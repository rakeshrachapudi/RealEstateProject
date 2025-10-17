import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

const CreateDealModal = ({ property, onClose, onDealCreated }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Enter buyer email, 2: Confirm
  const [buyerEmail, setBuyerEmail] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearchBuyer = async () => {
    if (!buyerEmail.trim()) {
      setError('Please enter buyer email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Search for user by email
      const response = await fetch(
        `http://localhost:8080/api/users/search?email=${buyerEmail}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      const data = await response.json();

      if (data && data.data) {
        setSelectedBuyer(data.data);
        setStep(2);
      } else {
        setError('Buyer not found. Please check the email.');
      }
    } catch (err) {
      setError('Error searching for buyer: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeal = async () => {
    if (!selectedBuyer) {
      setError('Buyer not selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/api/deals/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          propertyId: property.id || property.propertyId,
          buyerId: selectedBuyer.id,
          agentId: user.id,
        }),
      });

      const result = await response.json();

      if (result.success || response.ok) {
        console.log('✅ Deal created:', result);
        if (onDealCreated) onDealCreated();
        onClose();
      } else {
        setError(result.message || 'Failed to create deal');
      }
    } catch (err) {
      console.error('Error creating deal:', err);
      setError(err.message || 'Error creating deal');
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
  };

  const contentStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '450px',
    padding: '24px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    position: 'relative',
  };

  const closeBtn = {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '20px',
    margin: '0 0 20px 0',
  };

  const propertyInfoStyle = {
    padding: '12px',
    backgroundColor: '#f0f9ff',
    borderLeft: '4px solid #3b82f6',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '14px',
  };

  const formGroupStyle = {
    marginBottom: '16px',
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
    display: 'block',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
  };

  const buyerCardStyle = {
    padding: '12px',
    border: '2px solid #10b981',
    borderRadius: '6px',
    backgroundColor: '#f0fdf4',
    marginBottom: '16px',
    fontSize: '14px',
  };

  const errorStyle = {
    padding: '12px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
    border: '1px solid #fecaca',
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
  };

  const buttonStyle = {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: 'white',
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#e2e8f0',
    color: '#6b7280',
  };

  const summaryBoxStyle = {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginBottom: '16px',
    fontSize: '14px',
    lineHeight: '1.6',
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={e => e.stopPropagation()}>
        <button style={closeBtn} onClick={onClose}>×</button>

        <h2 style={titleStyle}>📋 Create New Deal</h2>

        {/* Property Info */}
        <div style={propertyInfoStyle}>
          <strong>{property.title}</strong>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            {property.bedrooms}BHK • ₹{(property.price || 0).toLocaleString('en-IN')}
          </div>
        </div>

        {error && <div style={errorStyle}>❌ {error}</div>}

        {step === 1 ? (
          <>
            <div style={formGroupStyle}>
              <label style={labelStyle}>🔍 Enter Buyer Email</label>
              <input
                type="email"
                placeholder="buyer@example.com"
                value={buyerEmail}
                onChange={(e) => {
                  setBuyerEmail(e.target.value);
                  setError(null);
                }}
                style={inputStyle}
              />
              <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>
                Search for registered buyer by their email
              </small>
            </div>

            <div style={buttonGroupStyle}>
              <button style={secondaryButtonStyle} onClick={onClose}>
                Cancel
              </button>
              <button
                style={primaryButtonStyle}
                onClick={handleSearchBuyer}
                disabled={loading || !buyerEmail.trim()}
              >
                {loading ? '⏳ Searching...' : 'Search Buyer'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={summaryBoxStyle}>
              <h3 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>Deal Summary</h3>

              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#475569' }}>Property:</strong>
                <div style={{ color: '#64748b' }}>{property.title}</div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#475569' }}>Buyer:</strong>
                <div style={{ color: '#64748b' }}>
                  {selectedBuyer.firstName} {selectedBuyer.lastName}
                </div>
              </div>

              <div>
                <strong style={{ color: '#475569' }}>Initial Stage:</strong>
                <div style={{ color: '#64748b' }}>🔍 Inquiry</div>
              </div>
            </div>

            <div style={buyerCardStyle}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                {selectedBuyer.firstName} {selectedBuyer.lastName}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                📧 {selectedBuyer.email}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                📱 {selectedBuyer.mobileNumber}
              </div>
            </div>

            <div style={buttonGroupStyle}>
              <button style={secondaryButtonStyle} onClick={() => setStep(1)}>
                ← Back
              </button>
              <button
                style={primaryButtonStyle}
                onClick={handleCreateDeal}
                disabled={loading}
              >
                {loading ? '⏳ Creating...' : '✅ Create Deal'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateDealModal;