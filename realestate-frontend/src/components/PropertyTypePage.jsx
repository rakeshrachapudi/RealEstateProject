import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropertyList from './PropertyList';
import { searchProperties } from '../services/api';

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

    const searchParams = {};

    if (areaName) {
      searchParams.area = decodeURIComponent(areaName);
    }
    if (listingType) {
      searchParams.listingType = listingType;
    }
    if (propertyType) {
      // API expects space, but URL has hyphens
      searchParams.propertyType = propertyType.replace(/-/g, ' ');
    }

    try {
      // Use the centralized search API call
      const response = await searchProperties(searchParams);
      if (response && response.success) {
        setProperties(response.data);
      } else {
        throw new Error(response.message || 'No properties found');
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}>⏳</div>
        <p>Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={fetchProperties} style={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  const title = areaName
    ? `Properties in ${decodeURIComponent(areaName)}`
    : `${propertyType.replace(/-/g, ' ')} for ${listingType === 'sale' ? 'Sale' : 'Rent'}`;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        ← Back
      </button>
      <h1 style={styles.title}>{title}</h1>
      <p style={styles.count}>{properties.length} properties found</p>
      <PropertyList properties={properties} />

      {properties.length === 0 && (
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIcon}>🏠</div>
          <h3 style={styles.emptyTitle}>No properties found in this category</h3>
          <p style={styles.emptyText}>
            Try browsing all properties or adjusting your filters.
          </p>
          <button onClick={() => navigate('/')} style={styles.browseButton}>
            Browse All Properties
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '24px',
  },
  loading: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  spinner: {
    fontSize: '64px',
    marginBottom: '24px',
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
    marginTop: '20px',
  },
  backButton: {
    padding: '10px 20px',
    borderRadius: '8px',
    background: '#6b7280',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: 500,
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '8px',
  },
  count: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '24px',
  },
  emptyContainer: {
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
};

export default PropertyTypePage;