// ============================================
// FILE: src/services/api.js
// API Service for Real Estate App
// ============================================

const API_BASE_URL = 'http://localhost:8080/api';

// ============================================
// NEW: SEARCH API
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

// ============================================
// NEW: GET FEATURED PROPERTIES
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

// ============================================
// NEW: GET PROPERTY TYPES
// ============================================

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

// ============================================
// NEW: GET AREAS BY CITY
// ============================================

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

// ============================================
// EXISTING: BACKWARD COMPATIBILITY
// ============================================

export const getAllProperties = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/properties`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

export const getPropertiesByCity = async (city) => {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/city/${encodeURIComponent(city)}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching properties by city:', error);
    throw error;
  }
};

export default {
  searchProperties,
  getFeaturedProperties,
  getPropertyTypes,
  getAreas,
  getAllProperties,
  getPropertiesByCity
};