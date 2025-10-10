import React, { useState, useEffect } from 'react';
import { searchProperties, getPropertyTypes, getAreas } from '../services/api';

const PropertySearch = ({ onSearchResults, onSearchStart, onReset }) => {
  const [searchParams, setSearchParams] = useState({
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    city: 'Hyderabad',
    area: '',
    listingType: '',
    minBedrooms: '',
    maxBedrooms: '',
  });

  const [propertyTypes, setPropertyTypes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPropertyTypes();
    loadAreas();
  }, []);

  const loadPropertyTypes = async () => {
    try {
      const response = await getPropertyTypes();
      if (response.success) {
        setPropertyTypes(response.data);
      }
    } catch (error) {
      console.error('Error loading property types:', error);
    }
  };

  const loadAreas = async () => {
    try {
      const response = await getAreas('Hyderabad');
      if (response.success) {
        setAreas(response.data);
      }
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    onSearchStart();

    try {
      const params = {
        ...searchParams,
        minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : null,
        maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : null,
        minBedrooms: searchParams.minBedrooms ? parseInt(searchParams.minBedrooms) : null,
        maxBedrooms: searchParams.maxBedrooms ? parseInt(searchParams.maxBedrooms) : null,
        propertyType: searchParams.propertyType || null,
        area: searchParams.area || null,
        listingType: searchParams.listingType || null
      };

      const response = await searchProperties(params);
      if (response.success) {
        onSearchResults(response.data);
      }
    } catch (error) {
      console.error('Error searching properties:', error);
      onSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchParams({
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      city: 'Hyderabad',
      area: '',
      listingType: '',
      minBedrooms: '',
      maxBedrooms: '',
    });
    onReset();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🔍 Find Your Perfect Property</h2>
        <p style={styles.subtitle}>Search through thousands of properties in Hyderabad</p>
      </div>

      <form onSubmit={handleSearch} style={styles.form}>
        <div style={styles.grid}>
          {/* Property Type */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🏠</span>
              Property Type
            </label>
            <select
              name="propertyType"
              value={searchParams.propertyType}
              onChange={handleInputChange}
              style={styles.select}
            >
              <option value="">All Types</option>
              {propertyTypes.map(type => (
                <option key={type.propertyTypeId} value={type.typeName}>
                  {type.typeName}
                </option>
              ))}
            </select>
          </div>

          {/* Listing Type */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>📋</span>
              Listing Type
            </label>
            <select
              name="listingType"
              value={searchParams.listingType}
              onChange={handleInputChange}
              style={styles.select}
            >
              <option value="">All Listings</option>
              <option value="sale">🏠 For Sale</option>
              <option value="rent">🔑 For Rent</option>
            </select>
          </div>

          {/* Area */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>📍</span>
              Area
            </label>
            <select
              name="area"
              value={searchParams.area}
              onChange={handleInputChange}
              style={styles.select}
            >
              <option value="">All Areas</option>
              {areas.map(area => (
                <option key={area.areaId} value={area.areaName}>
                  {area.areaName} ({area.pincode})
                </option>
              ))}
            </select>
          </div>

          {/* Min Price */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>💰</span>
              Min Price (₹)
            </label>
            <input
              type="number"
              name="minPrice"
              placeholder="Minimum Price"
              value={searchParams.minPrice}
              onChange={handleInputChange}
              style={styles.input}
              min="0"
            />
          </div>

          {/* Max Price */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>💰</span>
              Max Price (₹)
            </label>
            <input
              type="number"
              name="maxPrice"
              placeholder="Maximum Price"
              value={searchParams.maxPrice}
              onChange={handleInputChange}
              style={styles.input}
              min="0"
            />
          </div>

          {/* Min Bedrooms */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🛏️</span>
              Min Bedrooms
            </label>
            <input
              type="number"
              name="minBedrooms"
              placeholder="Min"
              value={searchParams.minBedrooms}
              onChange={handleInputChange}
              style={styles.input}
              min="0"
              max="10"
            />
          </div>

          {/* Max Bedrooms */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🛏️</span>
              Max Bedrooms
            </label>
            <input
              type="number"
              name="maxBedrooms"
              placeholder="Max"
              value={searchParams.maxBedrooms}
              onChange={handleInputChange}
              style={styles.input}
              min="0"
              max="10"
            />
          </div>
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            onClick={handleReset}
            style={styles.resetButton}
          >
            <span style={styles.buttonIcon}>🔄</span>
            Reset Filters
          </button>
          <button
            type="submit"
            style={styles.searchButton}
            disabled={loading}
          >
            <span style={styles.buttonIcon}>
              {loading ? '⏳' : '🔍'}
            </span>
            {loading ? 'Searching...' : 'Search Properties'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Enhanced Styles
const styles = {
  container: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    padding: '2.5rem',
    borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    marginBottom: '3rem',
    border: '1px solid rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
    color: '#1e293b',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#64748b',
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#374151',
  },
  labelIcon: {
    fontSize: '16px',
  },
  input: {
    padding: '14px 16px',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    background: 'white',
    fontWeight: '500',
    ':focus': {
      outline: 'none',
      borderColor: '#4f46e5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    },
  },
  select: {
    padding: '14px 16px',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    fontSize: '15px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: '500',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
    backgroundSize: '16px',
    ':focus': {
      outline: 'none',
      borderColor: '#4f46e5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    },
  },
  actions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  resetButton: {
    padding: '14px 28px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    color: 'white',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(107, 114, 128, 0.4)',
    },
  },
  searchButton: {
    padding: '14px 32px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: 'white',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)',
    },
    ':disabled': {
      opacity: 0.7,
      transform: 'none',
      cursor: 'not-allowed',
    },
  },
  buttonIcon: {
    fontSize: '16px',
  },
};

export default PropertySearch;