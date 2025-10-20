// src/components/CreateDealModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { BACKEND_BASE_URL } from "../config/config";

const CreateDealModal = ({ propertyId, propertyTitle, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerInfo, setBuyerInfo] = useState(null);
  const [dealPrice, setDealPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [property, setProperty] = useState(null);

  // Requirement: Only agents can create deals
  useEffect(() => {
    if (user?.role !== 'AGENT' && user?.role !== 'ADMIN') {
      setError('Only agents can create deals');
      onClose();
      return;
    }
    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId, user, onClose]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/properties/${propertyId}`);
      if (response.ok) {
        const data = await response.json();
        setProperty(data);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    }
  };

  const searchBuyer = async (phone) => {
    if (!phone || phone.length !== 10) {
      return;
    }

    setSearching(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/users/search?phone=${phone}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const buyer = data.success ? data.data : data;

        if (buyer && buyer.id) {
          setBuyerInfo(buyer);
        } else {
          setError('Buyer not found with this phone number.');
          setBuyerInfo(null);
        }
      } else {
        setError('Error searching for buyer.');
        setBuyerInfo(null);
      }
    } catch (error) {
      setError('Error: ' + error.message);
      setBuyerInfo(null);
    } finally {
      setSearching(false);
    }
  };

  const handlePhoneChange = (e) => {
    const phone = e.target.value.replace(/\D/g, '').slice(0, 10);
    setBuyerPhone(phone);
    setBuyerInfo(null);
    setError(null);

    if (phone.length === 10) {
      searchBuyer(phone);
    }
  };

  const handleCreateDeal = async () => {
    setError(null);

    if (!propertyId || !buyerInfo?.id || !dealPrice) {
      setError('Please fill all required fields');
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
          buyerId: buyerInfo.id,
          agentId: user.id,
          agreedPrice: parseFloat(dealPrice),
          notes: notes
        })
      });

      const data = await response.json();

      if (data.success || response.ok) {
        alert('✅ Deal created successfully!');
        if (onSuccess) onSuccess(data.data);
        onClose();
      } else {
        setError(data.message || 'Failed to create deal');
      }
    } catch (error) {
      setError('Error: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setBuyerPhone('');
    setBuyerInfo(null);
    setDealPrice('');
    setNotes('');
    setError(null);
  };

  const sellerInfo = property?.user || {};
  const getAgentName = () => user?.firstName ? `${user.firstName} ${user.lastName}` : 'Agent';
  const formatPrice = (price) => {
    if (!price) return '0';
    return Number(price).toLocaleString('en-IN');
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.container} onClick={e => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>×</button>
        <h1 style={styles.title}>➕ Create New Deal</h1>

        {error && (
          <div style={styles.error}>
            ❌ {error}
          </div>
        )}

        {/* Step 1: Buyer Selection */}
        {step === 1 && (
          <div>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Step 1: Search Buyer</h3>
              <p style={styles.sectionSubtitle}>
                Enter the buyer's mobile number to search for them in the system
              </p>

              <div style={styles.infoBox}>
                <div style={styles.label}>📱 Buyer Mobile Number (10 digits) *</div>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={buyerPhone}
                  onChange={handlePhoneChange}
                  maxLength="10"
                  pattern="[0-9]{10}"
                  style={styles.input}
                  disabled={searching}
                />
                <div style={styles.hint}>
                  {searching ? '🔍 Searching...' : buyerInfo ? `✅ Found: ${buyerInfo.firstName} ${buyerInfo.lastName}` : 'Enter the buyer\'s 10-digit mobile number'}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!buyerInfo || loading}
                style={{
                  ...styles.button,
                  opacity: (!buyerInfo || loading) ? 0.6 : 1,
                  cursor: (!buyerInfo || loading) ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '⏳ Processing...' : '➡️ Next: Deal Details'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Deal Details */}
        {step === 2 && (
          <div>
            {/* REQUIREMENT: Show Agent ID */}
            <div style={styles.infoCard}>
              <h4 style={styles.infoCardTitle}>📊 Agent Creating Deal</h4>
              <div style={styles.infoCardContent}>
                <div style={styles.infoItem}>
                  <span>Agent ID:</span>
                  <span style={styles.bold}>{user?.id}</span>
                </div>
                <div style={styles.infoItem}>
                  <span>Name:</span>
                  <span style={styles.bold}>{getAgentName()}</span>
                </div>
                <div style={styles.infoItem}>
                  <span>📧 Email:</span>
                  <span style={styles.bold}>{user?.email}</span>
                </div>
              </div>
            </div>

            {/* REQUIREMENT: Show Buyer Mobile */}
            <div style={styles.infoCard}>
              <h4 style={styles.infoCardTitle}>✅ Buyer Selected</h4>
              <div style={styles.infoCardContent}>
                <div style={styles.infoItem}>
                  <span>👤 Name:</span>
                  <span style={styles.bold}>{buyerInfo?.firstName} {buyerInfo?.lastName}</span>
                </div>
                <div style={styles.infoItem}>
                  <span>📱 Mobile (REQUIREMENT):</span>
                  <span style={{...styles.bold, color: '#3b82f6'}}>{buyerInfo?.mobileNumber}</span>
                </div>
                <div style={styles.infoItem}>
                  <span>📧 Email:</span>
                  <span style={styles.bold}>{buyerInfo?.email || 'N/A'}</span>
                </div>
              </div>
              <button
                onClick={handleBack}
                style={{
                  ...styles.changeBtn,
                  marginTop: '12px'
                }}
              >
                🔄 Change Buyer
              </button>
            </div>

            {/* REQUIREMENT: Show Seller Mobile */}
            <div style={styles.infoCard}>
              <h4 style={styles.infoCardTitle}>🏠 Seller / Property Owner</h4>
              <div style={styles.infoCardContent}>
                <div style={styles.infoItem}>
                  <span>Name:</span>
                  <span style={styles.bold}>{sellerInfo.firstName} {sellerInfo.lastName}</span>
                </div>
                <div style={styles.infoItem}>
                  <span>📱 Mobile (REQUIREMENT):</span>
                  <span style={{...styles.bold, color: '#3b82f6'}}>{sellerInfo.mobileNumber || 'N/A'}</span>
                </div>
                <div style={styles.infoItem}>
                  <span>📧 Email:</span>
                  <span style={styles.bold}>{sellerInfo.email || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Property Info Box */}
            <div style={styles.infoCard}>
              <h4 style={styles.infoCardTitle}>🏘 Property</h4>
              <div style={styles.infoCardContent}>
                <div style={styles.infoItem}>
                  <span>Title:</span>
                  <span style={styles.bold}>{propertyTitle || property?.title}</span>
                </div>
                <div style={styles.infoItem}>
                  <span>Price:</span>
                  <span style={styles.bold}>₹{formatPrice(property?.price)}</span>
                </div>
              </div>
            </div>

            {/* REQUIREMENT: Deal Price Input */}
            <div style={styles.formGroup}>
              <label style={styles.label}>💰 Agreed Deal Price (₹) *</label>
              <input
                type="number"
                placeholder="Enter the agreed deal price"
                value={dealPrice}
                onChange={(e) => {
                  setDealPrice(e.target.value.replace(/\D/g, ''));
                  setError(null);
                }}
                style={styles.input}
              />
              {dealPrice && (
                <div style={styles.pricePreview}>
                  Price: ₹{formatPrice(dealPrice)}
                </div>
              )}
            </div>

            {/* Notes */}
            <div style={styles.formGroup}>
              <label style={styles.label}>📝 Notes (Optional)</label>
              <textarea
                placeholder="Add any additional notes about this deal..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  ...styles.input,
                  minHeight: '80px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={styles.buttonGroup}>
              <button
                onClick={handleBack}
                style={styles.secondaryButton}
              >
                ← Back
              </button>
              <button
                onClick={handleCreateDeal}
                disabled={!dealPrice || loading}
                style={{
                  ...styles.button,
                  opacity: (!dealPrice || loading) ? 0.6 : 1,
                  cursor: (!dealPrice || loading) ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '⏳ Creating...' : '✅ Create Deal'}
              </button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div style={styles.noteBox}>
          <strong>ℹ️ REQUIREMENT:</strong> Only agents can create deals. This deal shows:
          <ul style={{margin: '8px 0', paddingLeft: '20px'}}>
            <li>✅ Agent ID: {user?.id}</li>
            <li>✅ Buyer Mobile: {buyerInfo?.mobileNumber || 'To be filled'}</li>
            <li>✅ Seller Mobile: {sellerInfo.mobileNumber || 'N/A'}</li>
            <li>✅ Deal Price: ₹{dealPrice ? formatPrice(dealPrice) : 'To be filled'}</li>
          </ul>
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