import React from 'react';

const PropertyCard = ({ property }) => {
  const formatPrice = (price) => {
    if (!price) return property.priceDisplay || 'Price on request';

    const numPrice = typeof price === 'number' ? price : parseFloat(price);
    if (numPrice >= 10000000) {
      return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    } else if (numPrice >= 100000) {
      return `₹${(numPrice / 100000).toFixed(2)} Lac`;
    } else if (numPrice >= 1000) {
      return `₹${(numPrice / 1000).toFixed(0)} K`;
    }
    return `₹${numPrice.toLocaleString('en-IN')}`;
  };

  const getDefaultImage = () => {
    return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop';
  };

  return (
    <div style={styles.card}>
      {property.isFeatured && (
        <span style={styles.badge}>⭐ Featured</span>
      )}

      <img
        src={property.imageUrl || getDefaultImage()}
        alt={property.title}
        style={styles.image}
        onError={(e) => {
          e.target.src = getDefaultImage();
        }}
      />

      <div style={styles.content}>
        <div style={styles.typeTag}>
          {property.listingType === 'sale' || property.listingType === 'SALE' ? 'FOR SALE' : 'FOR RENT'}
        </div>

        <h3 style={styles.title}>{property.title}</h3>

        <div style={styles.location}>
          📍 {property.areaName || property.city || 'Location'},
          {property.cityName || 'Hyderabad'}
          {property.pincode && ` - ${property.pincode}`}
        </div>

        <div style={styles.price}>
          {formatPrice(property.price)}
          {(property.listingType === 'rent' || property.listingType === 'RENT') && (
            <span style={styles.perMonth}>/month</span>
          )}
        </div>

        <div style={styles.propertyType}>
          <strong>{property.propertyType || property.type}</strong>
        </div>

        <div style={styles.details}>
          {property.areaSqft && (
            <div style={styles.detail}>
              <span>📐</span>
              <span>{property.areaSqft} sqft</span>
            </div>
          )}

          {property.bedrooms > 0 && (
            <div style={styles.detail}>
              <span>🛏️</span>
              <span>{property.bedrooms} Beds</span>
            </div>
          )}

          {property.bathrooms > 0 && (
            <div style={styles.detail}>
              <span>🚿</span>
              <span>{property.bathrooms} Baths</span>
            </div>
          )}
        </div>

        {property.amenities && (
          <div style={styles.amenities}>
            <strong>✨ Amenities:</strong> {property.amenities.split(',').slice(0, 3).join(', ')}
            {property.amenities.split(',').length > 3 && '...'}
          </div>
        )}

        {property.user && (
          <div style={styles.postedBy}>
            Posted by: {property.user.firstName} {property.user.lastName}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    backgroundColor: '#f59e0b',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '2rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    zIndex: 1,
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  content: {
    padding: '18px',
  },
  typeTag: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
  },
  title: {
    fontSize: '18px',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#111827',
  },
  location: {
    color: '#6b7280',
    fontSize: '14px',
    marginBottom: '1rem',
  },
  price: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: '1rem',
  },
  perMonth: {
    fontSize: '14px',
    fontWeight: '500',
  },
  propertyType: {
    backgroundColor: '#f3f4f6',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    fontSize: '14px',
    color: '#374151',
  },
  details: {
    display: 'flex',
    gap: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
    color: '#6b7280',
    fontSize: '14px',
    marginBottom: '1rem',
  },
  detail: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  amenities: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
    fontSize: '12px',
    color: '#6b7280',
  },
  postedBy: {
    fontSize: '14px',
    color: '#333',
    marginTop: '8px',
    fontWeight: 'bold',
  },
};

export default PropertyCard;