// src/pages/BrowsePropertiesForDeal.jsx - REQUIREMENT: Agent only creates deals
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import DealDetailsPopup from '../components/DealDetailsPopup';
import { BACKEND_BASE_URL } from "../config/config";

const BrowsePropertiesForDeal = ({ onDealCreated, onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerInfo, setBuyerInfo] = useState(null);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [dealPrice, setDealPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searching, setSearching] = useState(false);
  const [existingDeals, setExistingDeals] = useState({});
  const [selectedDealToView, setSelectedDealToView] = useState(null);

  // REQUIREMENT: Only agents can access this modal
  useEffect(() => {
    if (user?.role !== 'AGENT' && user?.role !== 'ADMIN') {
      setError('❌ Only agents can create deals');
      setTimeout(onClose, 2000);
      return;
    }

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(40px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .deal-modal-backdrop { animation: fadeIn 0.3s ease-out; }
      .deal-modal-content { animation: slideUp 0.4s ease-out; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, [user, onClose]);

  const searchBuyer = async (phone) => {
    if (!phone || phone.length !== 10) return;

    setSearching(true);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/users/search?phone=${phone}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });

      if (response.ok) {
        const data = await response.json();
        const buyer = data.success ? data.data : data;
        if (buyer && buyer.id) {
          setBuyerInfo(buyer);
          const propsResponse = await fetch(`${BACKEND_BASE_URL}/api/properties`);
          const propsData = await propsResponse.json();
          const propertiesArray = Array.isArray(propsData) ? propsData : (propsData.data || []);
          setProperties(propertiesArray);
          await fetchExistingDeals(buyer.id);
          setStep(2);
        } else {
          setError('Buyer not found with this phone number.');
        }
      } else {
        setError('Error searching for buyer. Please try again.');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setSearching(false);
    }
  };

  const fetchExistingDeals = async (buyerId) => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/deals/buyer/${buyerId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });

      if (response.ok) {
        const responseData = await response.json();
        let dealsList = [];
        if (Array.isArray(responseData)) {
          dealsList = responseData;
        } else if (responseData.success && Array.isArray(responseData.data)) {
          dealsList = responseData.data;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          dealsList = responseData.data;
        }

        const dealsMap = {};
        dealsList.forEach(deal => {
          const propertyId = deal.property?.id || deal.propertyId;
          if (propertyId) {
            dealsMap[propertyId] = deal;
          }
        });

        setExistingDeals(dealsMap);
      }
    } catch (err) {
      console.error('Error fetching existing deals:', err);
      setExistingDeals({});
    }
  };

  const handlePhoneChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '');
    setBuyerPhone(cleaned);
    setError(null);
    if (cleaned.length === 10) {
      searchBuyer(cleaned);
    }
  };

  // REQUIREMENT: Create deal with agreed price - Agent ID, Buyer mobile, Seller mobile, Deal price
  const handleCreateDeal = async (propertyId) => {
    if (!buyerInfo || !propertyId || !dealPrice) {
      setError('Please enter deal price');
      return;
    }
    setLoading(true);
    setError(null);
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
          agentId: user.id,  // REQUIREMENT: Agent ID
          agreedPrice: parseFloat(dealPrice)  // REQUIREMENT: Deal price
        })
      });
      const data = await response.json();
      if (data.success || response.ok) {
        alert('✅ Deal created successfully!');
        if (onDealCreated) onDealCreated();
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

  const getPropertyDeal = (propertyId) => {
    return existingDeals[propertyId] || existingDeals[propertyId?.toString()];
  };

  const handlePopupCloseAndRefresh = () => {
    setSelectedDealToView(null);
    if (buyerInfo?.id) {
      fetchExistingDeals(buyerInfo.id);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return Number(price).toLocaleString('en-IN');
  };

  // REQUIREMENT: Check if only agent
  if (user?.role !== 'AGENT' && user?.role !== 'ADMIN') {
    return (
      <div style={styles.backdrop} onClick={onClose}>
        <div style={styles.container} onClick={e => e.stopPropagation()}>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
          <div style={{ textAlign: 'center', padding: '40px', color: '#dc2626' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <h2>Access Denied</h2>
            <p>Only agents can create deals</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {selectedDealToView && (
        <DealDetailsPopup deal={selectedDealToView} onClose={handlePopupCloseAndRefresh} />
      )}

      <div style={styles.backdrop} className="deal-modal-backdrop" onClick={onClose}>
        <div style={styles.container} className="deal-modal-content" onClick={e => e.stopPropagation()}>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
          <h1 style={styles.title}>📋 Create New Deal</h1>

          {/* REQUIREMENT: Show Agent ID */}
          <div style={styles.agentInfo}>
            <span style={{ fontWeight: '600' }}>📊 Agent ID: {user?.id}</span>
          </div>

          {error && <div style={styles.error}>❌ {error}</div>}

          {step === 2 && selectedProperty && getPropertyDeal(selectedProperty.id || selectedProperty.propertyId) && (
            <div style={styles.dealExistsError}>
              ❌ Deal already exists for this property and buyer
            </div>
          )}

          {step === 1 ? (
            <div style={styles.step1}>
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Step 1: Find Buyer</h2>
                <p style={styles.sectionSubtitle}>Enter the buyer's mobile number to search for them</p>
                <div style={styles.formGroup}>
                  <label style={styles.label}>📱 Buyer Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={buyerPhone}
                    onChange={handlePhoneChange}
                    maxLength="10"
                    pattern="[0-9]{10}"
                    style={styles.input}
                  />
                </div>
                <div style={styles.hint}>
                  ℹ️ The buyer must be registered in the system with this phone number.
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.step2}>
              {/* REQUIREMENT: Show Buyer Mobile */}
              <div style={styles.buyerInfo}>
                <h3 style={styles.buyerName}>✅ {buyerInfo?.firstName} {buyerInfo?.lastName}</h3>
                <p style={styles.buyerPhone}>📱 {buyerInfo?.mobileNumber}</p>
                <p style={styles.buyerEmail}>📧 {buyerInfo?.email || 'N/A'}</p>
                <button
                  onClick={() => {
                    setStep(1);
                    setBuyerInfo(null);
                    setProperties([]);
                    setSelectedProperty(null);
                    setBuyerPhone('');
                    setDealPrice('');
                  }}
                  style={styles.changeBuyerBtn}
                >
                  🔄 Change Buyer
                </button>
              </div>

              <h2 style={styles.sectionTitle}>Step 2: Select Property & Price</h2>
              <p style={styles.sectionSubtitle}>
                Choose a property and enter deal price ({properties.length} available)
              </p>

              {properties.length > 0 ? (
                <div style={styles.propertiesGrid}>
                  {properties.map(property => {
                    const propertyId = property.id || property.propertyId;
                    const isSelected = selectedProperty?.id === propertyId || selectedProperty?.propertyId === propertyId;
                    const existingDeal = getPropertyDeal(propertyId);

                    return (
                      <div
                        key={propertyId}
                        style={{
                          ...styles.propertyItem,
                          borderColor: isSelected ? '#3b82f6' : '#e2e8f0',
                          backgroundColor: isSelected ? '#eff6ff' : 'white',
                          boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
                          opacity: existingDeal ? 0.7 : 1
                        }}
                        onClick={() => !existingDeal && setSelectedProperty(property)}
                      >
                        <img
                          src={property.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'}
                          alt={property.title}
                          style={styles.propertyImage}
                        />
                        <div style={styles.propertyDetails}>
                          <h4 style={styles.propertyTitle}>{property.title}</h4>
                          <p style={styles.propertyPrice}>💰 ₹{formatPrice(property.price)}</p>
                          <p style={styles.propertySpecs}>
                            🛏️ {property.bedrooms} | 🚿 {property.bathrooms} | 📐 {property.areaSqft || 'N/A'} sqft
                          </p>
                          <p style={styles.propertyLocation}>📍 {property.areaName || property.city}</p>

                          {/* REQUIREMENT: Show Seller Mobile */}
                          {property.user && (
                            <div style={styles.sellerInfo}>
                              <p style={styles.sellerLabel}>🏠 Seller: {property.user.firstName} {property.user.lastName}</p>
                              <p style={styles.sellerPhone}>📱 {property.user.mobileNumber || 'N/A'}</p>
                            </div>
                          )}

                          {/* REQUIREMENT: Show Agent ID */}
                          <div style={styles.agentInfoSmall}>
                            <p style={styles.agentLabel}>📊 Agent ID: {user.id}</p>
                          </div>

                          {existingDeal ? (
                            <>
                              <div style={styles.dealExistsBadge}>
                                ✅ Deal exists - Stage: {existingDeal.stage}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDealToView(existingDeal);
                                }}
                                style={styles.viewDealBtn}
                              >
                                👁️ View Deal
                              </button>
                            </>
                          ) : isSelected ? (
                            <>
                              {/* REQUIREMENT: Deal Price Input */}
                              <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#1e293b' }}>
                                  💰 Deal Price (₹) *
                                </label>
                                <input
                                  type="number"
                                  placeholder="Enter agreed price"
                                  value={dealPrice}
                                  onChange={(e) => setDealPrice(e.target.value.replace(/\D/g, ''))}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                  }}
                                />
                                {dealPrice && (
                                  <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                                    ₹{formatPrice(dealPrice)}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreateDeal(propertyId);
                                }}
                                disabled={loading || !dealPrice}
                                style={{ ...styles.selectBtn, opacity: (loading || !dealPrice) ? 0.6 : 1 }}
                              >
                                {loading ? '⏳ Creating...' : '✅ Create Deal'}
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={styles.noProperties}>
                  <p>🔭 No properties available to create a deal</p>
                </div>
              )}
            </div>
          )}

          {/* Button Group */}
          {step === 1 && (
            <div style={styles.buttonGroup}>
              <button
                onClick={onClose}
                style={{...styles.secondaryButton, flex: '0 1 auto'}}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (buyerPhone.length === 10) {
                    searchBuyer(buyerPhone);
                  } else {
                    setError('Please enter a valid 10-digit phone number');
                  }
                }}
                disabled={loading || searching || buyerPhone.length !== 10}
                style={{
                  ...styles.primaryButton,
                  opacity: (loading || searching || buyerPhone.length !== 10) ? 0.6 : 1,
                }}
              >
                {searching ? '🔍 Searching...' : '🔍 Search Buyer'}
              </button>
            </div>
          )}

          {/* Info Box */}
          <div style={styles.noteBox}>
            <strong>ℹ️ REQUIREMENT:</strong> Only agents can create deals. This deal will show:
            <ul style={{margin: '8px 0', paddingLeft: '20px'}}>
              <li>✅ Agent ID: {user?.id}</li>
              <li>✅ Buyer Mobile: From Step 1</li>
              <li>✅ Seller Mobile: From property details</li>
              <li>✅ Deal Price: From Step 2</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    overflowY: 'auto',
    backdropFilter: 'blur(2px)'
  },
  container: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    width: '90%',
    maxWidth: '1000px',
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
    transition: 'color 0.2s',
    padding: 0,
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '12px',
    marginTop: 0
  },
  agentInfo: {
    padding: '12px 16px',
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    border: '1px solid #fcd34d',
    marginBottom: '16px',
    fontSize: '13px',
    color: '#92400e'
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #fecaca',
    fontWeight: '500'
  },
  dealExistsError: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '2px solid #fecaca',
    fontWeight: '600',
    fontSize: '15px',
    textAlign: 'center'
  },
  section: { marginBottom: '24px' },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px',
    marginTop: 0
  },
  sectionSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '16px',
    marginTop: 0
  },
  formGroup: { marginBottom: '16px' },
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
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  },
  hint: {
    padding: '12px',
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#92400e',
    marginBottom: '16px',
    border: '1px solid #fcd34d'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px'
  },
  primaryButton: {
    flex: 1,
    padding: '14px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.2s, transform 0.2s',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  },
  secondaryButton: {
    padding: '14px 20px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'background 0.2s'
  },
  buyerInfo: {
    padding: '20px',
    backgroundColor: '#d1fae5',
    border: '2px solid #10b981',
    borderRadius: '12px',
    marginBottom: '24px'
  },
  buyerName: {
    margin: 0,
    marginBottom: '8px',
    fontSize: '18px',
    fontWeight: '700',
    color: '#065f46'
  },
  buyerPhone: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    color: '#047857',
    fontWeight: '600'
  },
  buyerEmail: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    color: '#047857'
  },
  changeBuyerBtn: {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '12px',
    transition: 'background 0.2s'
  },
  propertiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    marginTop: '16px'
  },
  propertyItem: {
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  propertyImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover'
  },
  propertyDetails: {
    padding: '16px'
  },
  propertyTitle: {
    margin: 0,
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e293b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  propertyPrice: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#10b981'
  },
  propertySpecs: {
    margin: '0 0 4px 0',
    fontSize: '12px',
    color: '#64748b'
  },
  propertyLocation: {
    margin: '0 0 12px 0',
    fontSize: '12px',
    color: '#64748b'
  },
  sellerInfo: {
    padding: '12px',
    backgroundColor: '#f0f9ff',
    borderRadius: '6px',
    border: '1px solid #bae6fd',
    marginBottom: '8px'
  },
  sellerLabel: {
    margin: '0 0 4px 0',
    fontSize: '12px',
    fontWeight: '600',
    color: '#0369a1'
  },
  sellerPhone: {
    margin: 0,
    fontSize: '12px',
    color: '#0369a1'
  },
  agentInfoSmall: {
    padding: '8px 12px',
    backgroundColor: '#fef3c7',
    borderRadius: '6px',
    border: '1px solid #fcd34d',
    marginBottom: '12px'
  },
  agentLabel: {
    margin: 0,
    fontSize: '11px',
    fontWeight: '600',
    color: '#92400e'
  },
  dealExistsBadge: {
    padding: '8px 12px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '12px',
    border: '1px solid #6ee7b7',
    textAlign: 'center'
  },
  selectBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    transition: 'background 0.2s'
  },
  viewDealBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    transition: 'background 0.2s'
  },
  noProperties: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px dashed #e2e8f0'
  },
  step1: { marginTop: '16px' },
  step2: { marginTop: '16px' },
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

export default BrowsePropertiesForDeal;