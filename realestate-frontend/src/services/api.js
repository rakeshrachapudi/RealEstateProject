// ============================================
// FILE: src/services/api.js
// API Service for Real Estate App
// ============================================

// Use proxy in development (Vite will proxy /api to backend)
const API_BASE_URL = '/api';

// Helper function to handle fetch responses
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// ============================================
// PROPERTY API CALLS
// ============================================

/**
 * Searches for properties based on a set of criteria.
 * @param {object} searchParams - The search criteria (e.g., city, type, minPrice).
 * @returns {Promise<object>} The search results from the API.
 */
export const searchProperties = async (searchParams) => {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchParams),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error searching properties:', error);
    return { success: false, message: error.message, data: [] };
  }
};

/**
 * Fetches the details for a single property by its ID.
 * @param {string} id - The unique ID of the property.
 * @returns {Promise<object>} The property details.
 */
export const getPropertyDetails = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching property details:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Fetches properties marked as "featured".
 * @returns {Promise<object>} A list of featured properties.
 */
export const getFeaturedProperties = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/featured`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return { success: false, message: error.message, data: [] };
  }
};

/**
 * Fetches all properties posted by a specific owner.
 * @param {string} ownerId - The unique ID of the property owner.
 * @returns {Promise<object>} A list of properties owned by the user.
 */
export const getPropertiesByOwner = async (ownerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/owner/${ownerId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching properties by owner:', error);
    return { success: false, message: error.message, data: [] };
  }
};

// ============================================
// UTILITY/LOOKUP API CALLS
// ============================================

/**
 * Fetches a list of available property types.
 * @returns {Promise<object>} A list of property types.
 */
export const getPropertyTypes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/lookups/property-types`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching property types:', error);
    return { success: false, message: error.message, data: [] };
  }
};

/**
 * Fetches a list of areas for a given city.
 * @param {string} [city='Hyderabad'] - The city to fetch areas for.
 * @returns {Promise<object>} A list of areas.
 */
export const getAreas = async (city = 'Hyderabad') => {
  try {
    const response = await fetch(`${API_BASE_URL}/lookups/areas?city=${encodeURIComponent(city)}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching areas:', error);
    return { success: false, message: error.message, data: [] };
  }
};

