// realestate-frontend/src/components/PropertyList.jsx
import React from 'react';
import PropertyCard from './PropertyCard';

const PropertyList = ({ properties, loading, onPropertyUpdated, onPropertyDeleted }) => {
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}>🔍</div>
        <h3 style={styles.loadingText}>Finding Amazing Properties...</h3>
        <p style={styles.loadingSubtext}>Please wait while we search the best matches</p>
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>🏚️</div>
        <h3 style={styles.emptyTitle}>No properties found</h3>
        <p style={styles.emptySubtitle}>Try adjusting your search criteria or browse different areas</p>
      </div>
    );
  }

  return (
    <div style={styles.grid}>
      {properties.map(property => (
        <PropertyCard
          key={property.propertyId || property.id}
          property={property}
          onPropertyUpdated={onPropertyUpdated}
          onPropertyDeleted={onPropertyDeleted}
        />
      ))}
    </div>
  );
};

const styles = {
  loading: {
    textAlign: 'center',
    padding: '5rem 2rem',
    color: '#64748b',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    borderRadius: '20px',
    margin: '2rem 0',
  },
  spinner: {
    fontSize: '4rem',
    marginBottom: '1.5rem',
    animation: 'pulse 2s infinite',
  },
  loadingText: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: '#1e293b',
  },
  loadingSubtext: {
    fontSize: '1rem',
    color: '#64748b',
    fontWeight: '500',
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#64748b',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    borderRadius: '20px',
    margin: '2rem 0',
  },
  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '1.5rem',
    opacity: '0.7',
  },
  emptyTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: '#1e293b',
  },
  emptySubtitle: {
    fontSize: '1.1rem',
    color: '#64748b',
    fontWeight: '500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '2rem',
    marginTop: '1rem',
  },
};

// Add pulse animation
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }
  `;
  document.head.appendChild(style);
}

export default PropertyList;