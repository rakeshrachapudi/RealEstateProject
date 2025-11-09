// src/services/api.js
import { BACKEND_BASE_URL } from "../config/config";

const API_BASE_URL = `${BACKEND_BASE_URL}/api`;

/**
 * Normalized response handler:
 * - Accepts ApiResponse format: { success, data, message }
 * - Accepts direct array/object responses too
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const txt = await response.text().catch(() => "");
    throw new Error(`API request failed: ${response.status} ${txt || ""}`.trim());
  }

  // Try JSON, fall back to text/null
  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    // Some endpoints may return text; return as-is
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = text || null;
    }
  }

  // If backend wraps with ApiResponse shape, return data.data
  if (data && typeof data === "object" && Object.prototype.hasOwnProperty.call(data, "success")) {
    return data.data ?? null;
  }

  return data;
};

// -------------------------
// Property Type APIs
// -------------------------
export const getPropertyTypes = async () => {
  const response = await fetch(`${API_BASE_URL}/properties/types`);
  return handleResponse(response);
};

export const getPropertiesByType = async (type) => {
  const response = await fetch(
    `${API_BASE_URL}/properties/byType?type=${encodeURIComponent(type)}`
  );
  return handleResponse(response);
};

// Get all active properties
export const getAllProperties = async () => {
  const response = await fetch(`${API_BASE_URL}/properties/all`);
  return handleResponse(response);
};

// -------------------------
// Auth APIs
// -------------------------
export const login = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  // Auth endpoints typically return a known shape; don't normalize
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

// -------------------------
// Featured Properties
// Uses FeaturedPropertyController `/featured-properties/active`
// -------------------------
export const getFeaturedProperties = async () => {
  const response = await fetch(`${API_BASE_URL}/featured-properties/active`);
  return handleResponse(response);
};

// -------------------------
// Property Details
// -------------------------
export const getPropertyDetails = async (id) => {
  const response = await fetch(`${API_BASE_URL}/properties/${id}`);
  // Keep raw JSON (details pages often expect exact shape)
  return response.json();
};

// -------------------------
// Search (PropertySearchController)
// -------------------------
export const searchProperties = async (searchParams) => {
  const response = await fetch(`${API_BASE_URL}/properties/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(searchParams),
  });
  return handleResponse(response);
};

// -------------------------
// Areas
// -------------------------
export const getAreas = async (city = "Hyderabad") => {
  const response = await fetch(
    `${API_BASE_URL}/areas?city=${encodeURIComponent(city)}`
  );
  return handleResponse(response);
};
