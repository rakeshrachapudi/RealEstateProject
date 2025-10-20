import React, { useState } from 'react';
import './AdvancedSearchBar.css';
import { BACKEND_BASE_URL } from "./config/config";

const AdvancedSearchBar = () => {
  const [location, setLocation] = useState('Hyderabad');
  const [additionalLocations, setAdditionalLocations] = useState([]);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [propertyType, setPropertyType] = useState('Flat +1');
  const [budget, setBudget] = useState('Budget');

  const propertyTypes = [
    'Flat +1',
    'Flat +2',
    'Flat +3',
    'Villa',
    'Plot',
    'Commercial',
    'PG'
  ];

  const budgetRanges = [
    { label: 'Budget', value: '' },
    { label: 'Under 20L', value: '0-2000000' },
    { label: '20L - 40L', value: '2000000-4000000' },
    { label: '40L - 60L', value: '4000000-6000000' },
    { label: '60L - 80L', value: '6000000-8000000' },
    { label: '80L - 1Cr', value: '8000000-10000000' },
    { label: 'Above 1Cr', value: '10000000-999999999' }
  ];

  const handleAddLocation = () => {
    if (newLocation.trim()) {
      setAdditionalLocations([...additionalLocations, newLocation.trim()]);
      setNewLocation('');
      setShowAddLocation(false);
    }
  };

  const handleSearch = async () => {
    const allLocations = [location, ...additionalLocations].filter(loc => loc);

    const searchParams = {
      locations: allLocations,
      propertyType: propertyType,
      budgetRange: budget
    };

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/properties/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Search results:', data);
        // Handle search results - pass to parent component or navigate
        // Example: onSearchResults(data);
      } else {
        console.error('Search failed:', response.status);
      }
    } catch (error) {
      console.error('Error during search:', error);
    }
  };

  return (
    <div className="advanced-search-container">
      <div className="advanced-search-bar">
        {/* Location Section */}
        <div className="search-section location-section">
          <span className="search-icon location-icon">📍</span>
          <div className="location-input-wrapper">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="location-input"
              placeholder="Enter location"
            />
            {additionalLocations.length > 0 && (
              <div className="additional-locations">
                {additionalLocations.map((loc, idx) => (
                  <span key={idx} className="location-tag">
                    {loc}
                    <button onClick={() => setAdditionalLocations(additionalLocations.filter((_, i) => i !== idx))}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {showAddLocation ? (
              <div className="add-location-input">
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
                  placeholder="Add location"
                  autoFocus
                />
                <button onClick={handleAddLocation}>Add</button>
              </div>
            ) : (
              <button
                className="add-more-btn"
                onClick={() => setShowAddLocation(true)}
              >
                Add more...
              </button>
            )}
          </div>
        </div>

        <div className="search-divider"></div>

        {/* Property Type Section */}
        <div className="search-section property-section">
          <span className="search-icon home-icon">🏠</span>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="property-select"
          >
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="search-divider"></div>

        {/* Budget Section */}
        <div className="search-section budget-section">
          <span className="search-icon rupee-icon">₹</span>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="budget-select"
          >
            {budgetRanges.map((range) => (
              <option key={range.label} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button className="search-btn" onClick={handleSearch}>
          🔍 Search
        </button>
      </div>
    </div>
  );
};

export default AdvancedSearchBar;