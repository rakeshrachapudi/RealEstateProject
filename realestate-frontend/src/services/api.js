// ============================================
// FILE: src/services/api.js
// API Service for Real Estate App
// ============================================

const API_BASE_URL = 'http://localhost:8080/api';

// ============================================
// CORE API CALLS
// ============================================

export const searchProperties = async (searchParams) => {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
};

export const getPropertyDetails = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching property details:', error);
    throw error;
  }
};

// ============================================
// UTILITY/LOOKUP API CALLS
// ============================================

export const getFeaturedProperties = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/featured`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    throw error;
  }
};

export const getPropertyTypes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/property-types`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching property types:', error);
    throw error;
  }
};

export const getAreas = async (city = 'Hyderabad') => {
  try {
    const response = await fetch(`${API_BASE_URL}/areas?city=${encodeURIComponent(city)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching areas:', error);
    throw error;
  }
};