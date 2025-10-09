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
      <h2 style={styles.title}>🔍 Search Properties in Hyderabad</h2>

      <form onSubmit={handleSearch}>
        <div style={styles.grid}>
          {/* Property Type */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Property Type</label>
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
            <label style={styles.label}>Listing Type</label>
            <select
              name="listingType"
              value={searchParams.listingType}
              onChange={handleInputChange}
              style={styles.select}
            >
              <option value="">All</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>

          {/* Area */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Area</label>
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
            <label style={styles.label}>Min Price (₹)</label>
            <input
              type="number"
              name="minPrice"
              placeholder="Min Price"
              value={searchParams.minPrice}
              onChange={handleInputChange}
              style={styles.input}
              min="0"
            />
          </div>

          {/* Max Price */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Max Price (₹)</label>
            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              value={searchParams.maxPrice}
              onChange={handleInputChange}
              style={styles.input}
              min="0"
            />
          </div>

          {/* Min Bedrooms */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Min Bedrooms</label>
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
            <label style={styles.label}>Max Bedrooms</label>
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
            Reset
          </button>
          <button
            type="submit"
            style={styles.searchButton}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Properties'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Styles
const styles = {
  container: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '24px',
    marginBottom: '1.5rem',
    color: '#3b82f6',
    fontWeight: '700',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    transition: 'border-color 0.3s',
  },
  select: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  resetButton: {
    padding: '10px 24px',
    borderRadius: '6px',
    border: 'none',
    background: '#6b7280',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  searchButton: {
    padding: '10px 24px',
    borderRadius: '6px',
    border: 'none',
    background: '#3b82f6',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
};

export default PropertySearch;