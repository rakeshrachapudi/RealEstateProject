// realestate-frontend/src/pages/BrowsePropertiesForDeal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import PropertyCard from '../components/PropertyCard';

const BrowsePropertiesForDeal = ({ onDealCreated, onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Enter buyer phone, 2: Select property
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerInfo, setBuyerInfo] = useState(null);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState('');

  const handleSearchBuyer = async () => {
    if (!buyerPhone || buyerPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Search for buyer by phone - if endpoint doesn't exist, we'll fetch all and filter
      const response = await fetch(
        `http://localhost:8080/api/users/search?phone=${buyerPhone}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const buyer = data.success ? data.data : data;

        if (buyer && buyer.id) {
          setBuyerInfo(buyer);

          // Fetch all properties - agent will assign to buyer
          const propsResponse = await fetch('http://localhost:8080/api/properties');
          const propsData = await propsResponse.json();
          setProperties(Array.isArray(propsData) ? propsData : (propsData.data || []));

          setStep(2);
        } else {
          setError('Buyer not found with this phone number');
        }
      } else {
        setError('Error searching for buyer');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeal = async (propertyId) => {
    if (!buyerInfo || !propertyId) {
      setError('Please select a property');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/api/deals/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          propertyId: propertyId,
          buyerId: buyerInfo.id,
          agentId: user.id
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

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.container} onClick={e => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>×</button>

        <h1 style={styles.title}>📋 Create New Deal</h1>

        {error && <div style={styles.error}>❌ {error}</div>}

        {step === 1 ? (
          <div style={styles.step1}>
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Step 1: Find Buyer</h2>
              <p style={styles.sectionSubtitle}>Enter the buyer's mobile number</p>

              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={buyerPhone}
                onChange={(e) => {
                  setBuyerPhone(e.target.value.replace(/\D/g, ''));
                  setError(null);
                }}
                maxLength="10"
                style={styles.input}
              />

              <div style={styles.hint}>
                ℹ️ The buyer must be registered in the system with this phone number
              </div>

              <button
                onClick={handleSearchBuyer}
                disabled={loading || buyerPhone.length !== 10}
                style={{
                  ...styles.button,
                  opacity: (loading || buyerPhone.length !== 10) ? 0.6 : 1
                }}
              >
                {loading ? '⏳ Searching...' : '🔍 Search Buyer'}
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.step2}>
            <div style={styles.buyerInfo}>
              <h3 style={styles.buyerName}>
                ✅ {buyerInfo?.firstName} {buyerInfo?.lastName}
              </h3>
              <p style={styles.buyerPhone}>📱 {buyerInfo?.mobileNumber}</p>
              <button
                onClick={() => {
                  setStep(1);
                  setBuyerInfo(null);
                  setProperties([]);
                }}
                style={styles.changeBuyerBtn}
              >
                Change Buyer
              </button>
            </div>

            <h2 style={styles.sectionTitle}>Step 2: Select Property</h2>
            <p style={styles.sectionSubtitle}>
              Choose a property to create the deal (Total: {properties.length} properties)
            </p>

            <div style={styles.propertiesGrid}>
              {properties.length > 0 ? (
                properties.map(property => (
                  <div
                    key={property.id}
                    style={{
                      ...styles.propertyItem,
                      borderColor: selectedProperty?.id === property.id ? '#3b82f6' : '#e2e8f0',
                      backgroundColor: selectedProperty?.id === property.id ? '#eff6ff' : 'white'
                    }}
                    onClick={() => setSelectedProperty(property)}
                  >
                    <img
                      src={property.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'}
                      alt={property.title}
                      style={styles.propertyImage}
                    />
                    <div style={styles.propertyDetails}>
                      <h4 style={styles.propertyTitle}>{property.title}</h4>
                      <p style={styles.propertyPrice}>
                        💰 ₹{(property.price || 0).toLocaleString('en-IN')}
                      </p>
                      <p style={styles.propertySpecs}>
                        🛏️ {property.bedrooms} | 🚿 {property.bathrooms} | 📐 {property.areaSqft || 'N/A'} sqft
                      </p>
                      {selectedProperty?.id === property.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateDeal(property.id);
                          }}
                          disabled={loading}
                          style={styles.selectBtn}
                        >
                          {loading ? '⏳ Creating...' : '✅ Create Deal'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.noProperties}>No properties available</div>
              )}
            </div>
          </div>
        )}
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
    overflowY: 'auto'
  },
  container: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    width: '90%',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
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
    color: '#6b7280'
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '24px'
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #fecaca'
  },
  section: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px'
  },
  sectionSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '16px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
    marginBottom: '12px'
  },
  hint: {
    padding: '12px',
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#92400e',
    marginBottom: '16px'
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  buyerInfo: {
    padding: '16px',
    backgroundColor: '#d1fae5',
    border: '2px solid #10b981',
    borderRadius: '12px',
    marginBottom: '24px'
  },
  buyerName: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#065f46'
  },
  buyerPhone: {
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
    fontSize: '12px'
  },
  propertiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px'
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
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b'
  },
  propertyPrice: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: '700',
    color: '#10b981'
  },
  propertySpecs: {
    margin: '0 0 12px 0',
    fontSize: '12px',
    color: '#64748b'
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
    fontSize: '12px'
  },
  noProperties: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '40px',
    color: '#64748b'
  }
};

export default BrowsePropertiesForDeal;