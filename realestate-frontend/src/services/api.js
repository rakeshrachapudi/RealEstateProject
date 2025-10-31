import { BACKEND_BASE_URL } from "../config/config";

const API_BASE_URL = `${BACKEND_BASE_URL}/api`;

// Helper function to handle different response formats
const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  const data = await response.json();

  // Handle ApiResponse format {success: true, data: [...]}
  if (data && typeof data === 'object' && data.success !== undefined) {
    return data.data || [];
  }

  // Handle direct array or object
  return data;
};

// Property Type APIs
export const getPropertyTypes = async () => {
  const response = await fetch(`${API_BASE_URL}/properties/types`);
  return handleResponse(response);
};

export const getPropertiesByType = async (type) => {
  const response = await fetch(`${API_BASE_URL}/properties/byType?type=${encodeURIComponent(type)}`);
  return handleResponse(response);
};

// Get all active properties
export const getAllProperties = async () => {
  const response = await fetch(`${API_BASE_URL}/properties/all`);
  return handleResponse(response);
};

// Authentication APIs
export const login = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return response.json();
};

export const register = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return response.json();
};

export const verifyToken = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/verify`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

// Featured properties (using PropertySearchController)
export const getFeaturedProperties = async () => {
  const response = await fetch(`${API_BASE_URL}/properties/featured`);
  return handleResponse(response);
};

// Property details
export const getPropertyDetails = async (id) => {
  const response = await fetch(`${API_BASE_URL}/properties/${id}`);
  return response.json();
};

// Search properties (using PropertySearchController)
export const searchProperties = async (searchParams) => {
  const response = await fetch(`${API_BASE_URL}/properties/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(searchParams),
  });
  return handleResponse(response);
};

// Get areas
export const getAreas = async (city = "Hyderabad") => {
  const response = await fetch(`${API_BASE_URL}/areas?city=${encodeURIComponent(city)}`);
  return handleResponse(response);
};