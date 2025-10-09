import React from 'react';
import PropertyCard from './PropertyCard';

const PropertyList = ({ properties, loading }) => {
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}>⏳</div>
        <p>Loading properties...</p>
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>🏚️</div>
        <h3>No properties found</h3>
        <p>Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div style={styles.grid}>
      {properties.map(property => (
        <PropertyCard
          key={property.propertyId || property.id}
          property={property}
        />
      ))}
    </div>
  );
};

const styles = {
  loading: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#6b7280',
  },
  spinner: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem 2rem',
    color: '#6b7280',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
    marginTop: '2rem',
  },
};

export default PropertyList;