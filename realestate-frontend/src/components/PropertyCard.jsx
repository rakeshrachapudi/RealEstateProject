import React from 'react';
import { useNavigate } from 'react-router-dom';

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();

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

  const handleClick = () => {
    navigate(`/property/${property.propertyId || property.id}`);
  };

  return (
    <div style={styles.card} onClick={handleClick} className="property-card">
      {property.isFeatured && (
        <span style={styles.badge}>⭐ Featured</span>
      )}

      <div style={styles.imageContainer}>
        <img
          src={property.imageUrl || getDefaultImage()}
          alt={property.title}
          style={styles.image}
          onError={(e) => {
            e.target.src = getDefaultImage();
          }}
        />
        <div style={styles.imageOverlay}></div>
      </div>

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
              <span style={styles.detailIcon}>📐</span>
              <span>{property.areaSqft} sqft</span>
            </div>
          )}

          {property.bedrooms > 0 && (
            <div style={styles.detail}>
              <span style={styles.detailIcon}>🛏️</span>
              <span>{property.bedrooms} Beds</span>
            </div>
          )}

          {property.bathrooms > 0 && (
            <div style={styles.detail}>
              <span style={styles.detailIcon}>🚿</span>
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
            👤 Posted by: {property.user.firstName} {property.user.lastName}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  badge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '2rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
    zIndex: 2,
  },
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '220px',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%)',
  },
  content: {
    padding: '24px',
  },
  typeTag: {
    display: 'inline-block',
    padding: '0.4rem 1rem',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: 'white',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    marginBottom: '1rem',
    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
  },
  title: {
    fontSize: '20px',
    marginBottom: '12px',
    fontWeight: '700',
    color: '#1e293b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: '1.4',
  },
  location: {
    color: '#64748b',
    fontSize: '14px',
    marginBottom: '1rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  price: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#059669',
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  perMonth: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
  },
  propertyType: {
    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    marginBottom: '1rem',
    fontSize: '14px',
    color: '#475569',
    fontWeight: '600',
    border: '1px solid #e2e8f0',
  },
  details: {
    display: 'flex',
    gap: '1.5rem',
    paddingTop: '1rem',
    borderTop: '2px solid #f1f5f9',
    color: '#64748b',
    fontSize: '14px',
    marginBottom: '1rem',
  },
  detail: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '500',
  },
  detailIcon: {
    fontSize: '16px',
  },
  amenities: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '2px solid #f1f5f9',
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.5',
  },
  postedBy: {
    fontSize: '13px',
    color: '#475569',
    marginTop: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
};

// Add hover effect
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .property-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15) !important;
    }
    .property-card:hover img {
      transform: scale(1.1);
    }
  `;
  document.head.appendChild(style);
}

export default PropertyCard;