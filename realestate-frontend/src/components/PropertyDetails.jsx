import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPropertyDetails } from '../services/api';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      const data = await getPropertyDetails(id);
      setProperty(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching property details:', err);
      setError('Failed to load property details.');
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    const numPrice = typeof price === 'number' ? price : parseFloat(price);
    if (numPrice >= 10000000) {
      return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    } else if (numPrice >= 100000) {
      return `₹${(numPrice / 100000).toFixed(2)} Lac`;
    }
    return `₹${numPrice.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}>⏳</div>
        <p>Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div style={styles.error}>
        <h2>{error || 'Property not found'}</h2>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          Go back to home
        </button>
      </div>
    );
  }

  const images = property.imageUrl ? [property.imageUrl] : [];
  const amenitiesList = property.amenities ? property.amenities.split(',').map(a => a.trim()) : [];
  const propertyType = property.propertyType?.typeName || property.type || 'N/A';
  const ownerName = property.user ? `${property.user.firstName} ${property.user.lastName}` : 'N/A';
  const ownerMobile = property.user ? property.user.mobileNumber : 'N/A';

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        ← Back
      </button>

      <div style={styles.detailsContainer}>
        {/* Image Gallery */}
        <div style={styles.imageSection}>
          <div style={styles.mainImage}>
            <img
              src={images[selectedImage] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'}
              alt={property.title}
              style={styles.largeImage}
            />
          </div>

          {images.length > 1 && (
            <div style={styles.thumbnails}>
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`View ${idx + 1}`}
                  style={{
                    ...styles.thumbnail,
                    border: selectedImage === idx ? '3px solid #3b82f6' : '1px solid #e5e7eb'
                  }}
                  onClick={() => setSelectedImage(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Property Info */}
        <div style={styles.infoSection}>
          {/* Price and Title */}
          <div style={styles.priceSection}>
            <div style={styles.price}>
              {formatPrice(property.price || property.expectedPrice)}
              {property.listingType === 'rent' && <span style={styles.perMonth}>/month</span>}
            </div>
            {property.isFeatured && (
              <span style={styles.featuredBadge}>⭐ Featured</span>
            )}
          </div>

          <h1 style={styles.title}>{property.title}</h1>

          <div style={styles.typeTag}>
            {property.listingType?.toLowerCase() === 'sale' ? 'FOR SALE' : 'FOR RENT'}
          </div>

          <div style={styles.location}>
            📍 {property.areaName || property.city || 'Hyderabad'}
            {property.pincode && ` - ${property.pincode}`}
          </div>

          {/* Key Details */}
          <div style={styles.keyDetails}>
            <div style={styles.detailCard}>
              <span style={styles.detailIcon}>🛏️</span>
              <div>
                <div style={styles.detailLabel}>Bedrooms</div>
                <div style={styles.detailValue}>{property.bedrooms || 'N/A'}</div>
              </div>
            </div>

            <div style={styles.detailCard}>
              <span style={styles.detailIcon}>🚿</span>
              <div>
                <div style={styles.detailLabel}>Bathrooms</div>
                <div style={styles.detailValue}>{property.bathrooms || 'N/A'}</div>
              </div>
            </div>

            {property.areaSqft && (
              <div style={styles.detailCard}>
                <span style={styles.detailIcon}>📐</span>
                <div>
                  <div style={styles.detailLabel}>Area</div>
                  <div style={styles.detailValue}>{property.areaSqft} sqft</div>
                </div>
              </div>
            )}

            <div style={styles.detailCard}>
              <span style={styles.detailIcon}>🏠</span>
              <div>
                <div style={styles.detailLabel}>Type</div>
                <div style={styles.detailValue}>{propertyType}</div>
              </div>
            </div>
          </div>

          {/* Contact Owner */}
          <div style={styles.contactSection}>
            <h3 style={styles.contactTitle}>Contact Owner</h3>
            {property.user && (
              <div style={styles.ownerInfo}>
                <div style={styles.ownerName}>{ownerName}</div>
                {ownerMobile !== 'N/A' && (
                  <div style={styles.ownerPhone}>
                    📞 {ownerMobile}
                  </div>
                )}
              </div>
            )}
            <div style={styles.contactButtons}>
              <button style={styles.contactOwnerBtn}>Contact Owner</button>
              <button style={styles.getPhoneBtn}>Get Phone No.</button>
            </div>
          </div>
        </div>
      </div>

      {/* More Details Section */}
      <div style={styles.moreDetails}>
        <h2 style={styles.sectionTitle}>More Details</h2>

        <div style={styles.detailsGrid}>
          <div style={styles.detailRow}>
            <span style={styles.detailRowLabel}>Price Breakup:</span>
            <span style={styles.detailRowValue}>
              {formatPrice(property.price || property.expectedPrice)}
            </span>
          </div>

          {property.address && (
            <div style={styles.detailRow}>
              <span style={styles.detailRowLabel}>Address:</span>
              <span style={styles.detailRowValue}>{property.address}</span>
            </div>
          )}

          <div style={styles.detailRow}>
            <span style={styles.detailRowLabel}>Furnishing:</span>
            <span style={styles.detailRowValue}>{property.furnishing || 'Unfurnished'}</span>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.detailRowLabel}>Type of Ownership:</span>
            <span style={styles.detailRowValue}>Freehold</span>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.detailRowLabel}>Status:</span>
            <span style={styles.detailRowValue}>{property.status || 'Available'}</span>
          </div>
        </div>

        {/* Description */}
        {property.description && (
          <div style={styles.descriptionSection}>
            <h3 style={styles.subSectionTitle}>Description</h3>
            <p style={styles.description}>{property.description}</p>
          </div>
        )}

        {/* Amenities */}
        {amenitiesList.length > 0 && (
          <div style={styles.amenitiesSection}>
            <h3 style={styles.subSectionTitle}>Amenities</h3>
            <div style={styles.amenitiesGrid}>
              {amenitiesList.map((amenity, idx) => (
                <div key={idx} style={styles.amenityItem}>
                  ✓ {amenity}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: 24,
    backgroundColor: '#fff',
  },
  loading: {
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  spinner: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  error: {
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  backButton: {
    padding: '10px 20px',
    borderRadius: 8,
    background: '#6b7280',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginBottom: 20,
    fontSize: 14,
    fontWeight: 500,
  },
  detailsContainer: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: 30,
    marginBottom: 40,
  },
  imageSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  mainImage: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  largeImage: {
    width: '100%',
    height: 450,
    objectFit: 'cover',
  },
  thumbnails: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
  },
  thumbnail: {
    width: 100,
    height: 75,
    objectFit: 'cover',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  priceSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 32,
    fontWeight: 700,
    color: '#3b82f6',
  },
  perMonth: {
    fontSize: 16,
    fontWeight: 500,
    color: '#6b7280',
  },
  featuredBadge: {
    backgroundColor: '#f59e0b',
    color: 'white',
    padding: '8px 16px',
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 600,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  },
  typeTag: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    width: 'fit-content',
  },
  location: {
    fontSize: 16,
    color: '#6b7280',
  },
  keyDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
    marginTop: 10,
  },
  detailCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    border: '1px solid #e5e7eb',
  },
  detailIcon: {
    fontSize: 28,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 600,
    color: '#111827',
  },
  contactSection: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    marginTop: 10,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 12,
  },
  ownerInfo: {
    marginBottom: 16,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 8,
  },
  ownerPhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  contactButtons: {
    display: 'flex',
    gap: 12,
  },
  contactOwnerBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
  },
  getPhoneBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'white',
    color: '#ef4444',
    border: '2px solid #ef4444',
    borderRadius: 8,
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
  },
  moreDetails: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    border: '1px solid #e5e7eb',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 20,
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottom: '1px solid #e5e7eb',
  },
  detailRowLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: 500,
  },
  detailRowValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: 600,
  },
  descriptionSection: {
    marginTop: 30,
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 1.8,
    color: '#374151',
  },
  amenitiesSection: {
    marginTop: 30,
  },
  amenitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
  },
  amenityItem: {
    padding: '10px 12px',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    fontSize: 14,
    color: '#374151',
  },
};

export default PropertyDetails;