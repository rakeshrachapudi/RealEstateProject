import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropertyList from './PropertyList';

const PropertyTypePage = () => {
  const { listingType, propertyType, areaName } = useParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, [listingType, propertyType, areaName]);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = 'http://localhost:8080/api/properties';

      if (areaName) {
        // Fetch by area
        url = `${url}/area/${encodeURIComponent(areaName)}`;
      } else if (propertyType && listingType) {
        // Fetch by property type and listing type
        const typeFormatted = propertyType.replace(/-/g, ' ');
        url = `${url}/filter?type=${encodeURIComponent(typeFormatted)}&listingType=${listingType}`;
      }

      console.log('Fetching from:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received data:', data);

      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(error.message);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const getPageTitle = () => {
    if (areaName) {
      return `Properties in ${areaName}`;
    }

    if (propertyType && listingType) {
      const typeDisplay = propertyType
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const listingDisplay = listingType === 'sale' ? 'for Sale' : 'for Rent';

      return `${typeDisplay} ${listingDisplay} in Hyderabad`;
    }

    return 'Properties';
  };

  const getPropertyTypeIcon = () => {
    if (areaName) return '📍';

    const type = propertyType?.toLowerCase() || '';
    if (type.includes('apartment')) return '🏢';
    if (type.includes('villa')) return '🏡';
    if (type.includes('house')) return '🏠';
    if (type.includes('plot')) return '📐';
    if (type.includes('pg')) return '🏨';
    return '🏘️';
  };

  const getBreadcrumb = () => {
    const parts = ['Home'];

    if (listingType) {
      parts.push(listingType === 'sale' ? 'Buy' : 'Rent');
    }

    if (propertyType) {
      const typeDisplay = propertyType
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      parts.push(typeDisplay);
    }

    if (areaName) {
      parts.push(areaName);
    }

    return parts;
  };

  if (error) {
    return (
      <div style={styles.container}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          ← Back to Home
        </button>
        <div style={styles.error}>
          <h2>Error Loading Properties</h2>
          <p>{error}</p>
          <button onClick={fetchProperties} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Breadcrumb Navigation */}
      <div style={styles.breadcrumb}>
        {getBreadcrumb().map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span style={styles.breadcrumbSeparator}> › </span>}
            <span
              style={index === 0 ? styles.breadcrumbLink : styles.breadcrumbCurrent}
              onClick={() => index === 0 && navigate('/')}
            >
              {item}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Back Button */}
      <button onClick={() => navigate('/')} style={styles.backButton}>
        ← Back to Home
      </button>

      {/* Page Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <span style={styles.icon}>{getPropertyTypeIcon()}</span>
          <div>
            <h1 style={styles.title}>{getPageTitle()}</h1>
            <p style={styles.subtitle}>
              {loading ? 'Loading...' : `${properties.length} properties found`}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div style={styles.filtersSection}>
        <div style={styles.filterTags}>
          {listingType && (
            <span style={styles.filterTag}>
              {listingType === 'sale' ? '🏷️ For Sale' : '🏠 For Rent'}
            </span>
          )}
          {propertyType && (
            <span style={styles.filterTag}>
              {propertyType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
          )}
          {areaName && (
            <span style={styles.filterTag}>
              📍 {areaName}
            </span>
          )}
        </div>

        <div style={styles.sortSection}>
          <select style={styles.sortDropdown}>
            <option>Sort by: Relevance</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest First</option>
            <option>Area: Low to High</option>
          </select>
        </div>
      </div>

      {/* Properties List */}
      <div style={styles.propertiesSection}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}>⏳</div>
            <p style={styles.loadingText}>Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🏚️</div>
            <h2 style={styles.emptyTitle}>No Properties Found</h2>
            <p style={styles.emptyText}>
              We couldn't find any properties matching your criteria.
            </p>
            <button onClick={() => navigate('/')} style={styles.browseButton}>
              Browse All Properties
            </button>
          </div>
        ) : (
          <PropertyList properties={properties} loading={false} />
        )}
      </div>

      {/* Info Section */}
      {!loading && properties.length > 0 && (
        <div style={styles.infoSection}>
          <h3 style={styles.infoTitle}>About {getPageTitle()}</h3>
          <p style={styles.infoText}>
            Explore our curated collection of {properties.length} properties.
            Each listing is verified and provides detailed information to help you
            make an informed decision. Contact property owners directly through our platform.
          </p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: '100vh',
  },
  breadcrumb: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  breadcrumbLink: {
    color: '#3b82f6',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  breadcrumbCurrent: {
    color: '#111827',
    fontWeight: 500,
  },
  breadcrumbSeparator: {
    margin: '0 8px',
    color: '#9ca3af',
  },
  backButton: {
    padding: '10px 20px',
    borderRadius: '8px',
    background: '#6b7280',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '24px',
    fontSize: '14px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background 0.3s',
  },
  header: {
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '2px solid #e5e7eb',
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  icon: {
    fontSize: '48px',
  },
  title: {
    fontSize: '36px',
    fontWeight: 700,
    color: '#111827',
    margin: 0,
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0,
  },
  filtersSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  filterTags: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  filterTag: {
    padding: '8px 16px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  sortSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  sortDropdown: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  propertiesSection: {
    minHeight: '400px',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  spinner: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  loadingText: {
    fontSize: '18px',
    color: '#6b7280',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: '#f9fafb',
    borderRadius: '16px',
    border: '2px dashed #e5e7eb',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '24px',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '12px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '24px',
    maxWidth: '500px',
    margin: '0 auto 24px',
  },
  browseButton: {
    padding: '12px 32px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  error: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: '#fef2f2',
    borderRadius: '16px',
    border: '2px solid #fecaca',
  },
  retryButton: {
    padding: '12px 32px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '16px',
  },
  infoSection: {
    marginTop: '48px',
    padding: '32px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  infoTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '12px',
  },
  infoText: {
    fontSize: '15px',
    lineHeight: 1.7,
    color: '#4b5563',
  },
};

export default PropertyTypePage;