import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_BASE_URL } from "../config/config";

const DebugComponent = () => {
  const [featuredProps, setFeaturedProps] = useState([]);
  const [allProps, setAllProps] = useState([]);
  const [areas, setAreas] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    runAllTests();
  }, []);

  const addTestResult = (test, status, message, data = null) => {
    setTestResults(prev => [...prev, { test, status, message, data, time: new Date().toLocaleTimeString() }]);
  };

  const runAllTests = async () => {
    setTestResults([]);

    // Test 1: Check backend is running
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/properties`);
      if (response.ok) {
        const data = await response.json();
        addTestResult('Backend Connection', 'success', `Backend is running! Found ${data.length} properties`, data);
        setAllProps(data);
      } else {
        addTestResult('Backend Connection', 'error', `Backend responded with status: ${response.status}`);
      }
    } catch (error) {
      addTestResult('Backend Connection', 'error', 'Backend is NOT running! Start it with: mvn spring-boot:run', error.message);
    }

    // Test 2: Check featured properties
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/properties/featured`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          addTestResult('Featured Properties', 'success', `Found ${data.data.length} featured properties`, data.data);
          setFeaturedProps(data.data);
        } else {
          addTestResult('Featured Properties', 'warning', 'API returned but no featured properties found', data);
        }
      } else {
        addTestResult('Featured Properties', 'error', 'Featured endpoint not working');
      }
    } catch (error) {
      addTestResult('Featured Properties', 'error', error.message);
    }

    // Test 3: Check areas
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/areas?city=Hyderabad`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          addTestResult('Areas', 'success', `Found ${data.data.length} areas`, data.data);
          setAreas(data.data);
        }
      }
    } catch (error) {
      addTestResult('Areas', 'error', error.message);
    }

    // Test 4: Check property types
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/property-types`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          addTestResult('Property Types', 'success', `Found ${data.data.length} property types`, data.data);
          setPropertyTypes(data.data);
        }
      }
    } catch (error) {
      addTestResult('Property Types', 'error', error.message);
    }

    // Test 5: Test single property fetch
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/properties/1`);
      if (response.ok) {
        const data = await response.json();
        addTestResult('Single Property (ID 1)', 'success', 'Property ID 1 found', data);
      } else {
        addTestResult('Single Property (ID 1)', 'error', 'Property ID 1 NOT FOUND - Check database!');
      }
    } catch (error) {
      addTestResult('Single Property (ID 1)', 'error', error.message);
    }

    // Test 6: Test filter endpoint
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/properties/filter?type=Apartment&listingType=sale`);
      if (response.ok) {
        const data = await response.json();
        addTestResult('Filter (Apartments for Sale)', 'success', `Found ${data.length} apartments for sale`, data);
      } else {
        addTestResult('Filter (Apartments for Sale)', 'error', 'Filter endpoint not working');
      }
    } catch (error) {
      addTestResult('Filter (Apartments for Sale)', 'error', error.message);
    }

    // Test 7: Test area endpoint
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/properties/area/Gachibowli`);
      if (response.ok) {
        const data = await response.json();
        addTestResult('Area Filter (Gachibowli)', 'success', `Found ${data.length} properties in Gachibowli`, data);
      } else {
        addTestResult('Area Filter (Gachibowli)', 'error', 'Area endpoint not working');
      }
    } catch (error) {
      addTestResult('Area Filter (Gachibowli)', 'error', error.message);
    }
  };

  const testPropertyClick = (propertyId) => {
    console.log('Testing navigation to property:', propertyId);
    navigate(`/property/${propertyId}`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔍 System Diagnostic Dashboard</h1>

      <button onClick={runAllTests} style={styles.refreshButton}>
        🔄 Refresh All Tests
      </button>

      {/* Test Results */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📊 Test Results</h2>
        {testResults.map((result, idx) => (
          <div key={idx} style={{
            ...styles.testResult,
            borderLeft: `4px solid ${result.status === 'success' ? '#22c55e' : result.status === 'error' ? '#ef4444' : '#f59e0b'}`
          }}>
            <div style={styles.testHeader}>
              <span style={styles.testName}>
                {result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⚠️'}
                {result.test}
              </span>
              <span style={styles.testTime}>{result.time}</span>
            </div>
            <div style={styles.testMessage}>{result.message}</div>
            {result.data && (
              <details style={styles.testDetails}>
                <summary style={styles.testSummary}>View Data</summary>
                <pre style={styles.testData}>{JSON.stringify(result.data, null, 2)}</pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {/* Featured Properties */}
      {featuredProps.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>⭐ Featured Properties ({featuredProps.length})</h2>
          <div style={styles.grid}>
            {featuredProps.map(prop => (
              <div key={prop.propertyId || prop.id} style={styles.card}>
                <div style={styles.cardId}>ID: {prop.propertyId || prop.id}</div>
                <div style={styles.cardTitle}>{prop.title}</div>
                <div style={styles.cardInfo}>
                  Type: {prop.propertyType || prop.type} |
                  Listing: {prop.listingType}
                </div>
                <div style={styles.cardPrice}>{prop.priceDisplay || prop.price_display}</div>
                <button
                  onClick={() => testPropertyClick(prop.propertyId || prop.id)}
                  style={styles.testButton}
                >
                  Test Click → Navigate to Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Properties */}
      {allProps.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🏠 All Properties ({allProps.length})</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Listing</th>
                <th style={styles.th}>Featured</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {allProps.map(prop => (
                <tr key={prop.id} style={styles.tr}>
                  <td style={styles.td}>{prop.id}</td>
                  <td style={styles.td}>{prop.title}</td>
                  <td style={styles.td}>{prop.type}</td>
                  <td style={styles.td}>{prop.listingType || prop.listing_type}</td>
                  <td style={styles.td}>{prop.isFeatured || prop.is_featured ? '⭐' : '-'}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => testPropertyClick(prop.id)}
                      style={styles.smallButton}
                    >
                      Test
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Areas */}
      {areas.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📍 Areas ({areas.length})</h2>
          <div style={styles.areaGrid}>
            {areas.map(area => (
              <div key={area.areaId} style={styles.areaCard}>
                {area.areaName} ({area.pincode})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Property Types */}
      {propertyTypes.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🏗️ Property Types ({propertyTypes.length})</h2>
          <div style={styles.typeGrid}>
            {propertyTypes.map(type => (
              <div key={type.propertyTypeId} style={styles.typeCard}>
                {type.typeName}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '24px',
    color: '#111827',
  },
  refreshButton: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '24px',
  },
  section: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#374151',
  },
  testResult: {
    padding: '16px',
    marginBottom: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  testHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  testName: {
    fontWeight: '600',
    fontSize: '16px',
  },
  testTime: {
    fontSize: '12px',
    color: '#6b7280',
  },
  testMessage: {
    fontSize: '14px',
    color: '#4b5563',
  },
  testDetails: {
    marginTop: '12px',
  },
  testSummary: {
    cursor: 'pointer',
    fontSize: '14px',
    color: '#3b82f6',
    fontWeight: '500',
  },
  testData: {
    backgroundColor: '#1f2937',
    color: '#10b981',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '12px',
    overflow: 'auto',
    maxHeight: '300px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  card: {
    padding: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#fef3c7',
  },
  cardId: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#b45309',
    marginBottom: '8px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#111827',
  },
  cardInfo: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '8px',
  },
  cardPrice: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: '12px',
  },
  testButton: {
    width: '100%',
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    backgroundColor: '#f3f4f6',
    fontWeight: '600',
    fontSize: '14px',
    borderBottom: '2px solid #e5e7eb',
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '12px',
    fontSize: '14px',
  },
  smallButton: {
    padding: '4px 12px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  areaGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  areaCard: {
    padding: '8px 16px',
    backgroundColor: '#dbeafe',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#1e40af',
  },
  typeGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  typeCard: {
    padding: '8px 16px',
    backgroundColor: '#fef3c7',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#b45309',
    fontWeight: '500',
  },
};

export default DebugComponent;