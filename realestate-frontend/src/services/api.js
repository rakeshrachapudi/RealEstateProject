import { BACKEND_BASE_URL } from "../config/config";

const API_BASE_URL = `${BACKEND_BASE_URL}/api`;

// ==================== AUTHENTICATION ====================
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

// ==================== PROPERTIES ====================
export const getFeaturedProperties = async () => {
  const response = await fetch(`${API_BASE_URL}/properties/featured`);
  return response.json();
};

export const getPropertyDetails = async (id) => {
  const response = await fetch(`${API_BASE_URL}/properties/${id}`);
  return response.json();
};

export const searchProperties = async (searchParams) => {
  const response = await fetch(`${API_BASE_URL}/properties/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(searchParams),
  });
  return response.json();
};

// ⭐ NEW: Delete property
export const deleteProperty = async (propertyId, token) => {
  const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Failed to delete property (${response.status})`);
  }

  return response;
};

// ⭐ NEW: Update property
export const updateProperty = async (propertyId, propertyData, token) => {
  const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(propertyData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update property (${response.status})`);
  }

  return response.json();
};

// ⭐ NEW: Get all properties
export const getAllProperties = async (token) => {
  const response = await fetch(`${API_BASE_URL}/properties`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch properties (${response.status})`);
  }

  return response.json();
};

// ==================== DEALS ====================

// ⭐ NEW: Delete deal
export const deleteDeal = async (dealId, token) => {
  const response = await fetch(`${API_BASE_URL}/deals/${dealId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Failed to delete deal (${response.status})`);
  }

  return data;
};

// ⭐ NEW: Update buyer
export const updateDealBuyer = async (dealId, buyerId, token) => {
  const response = await fetch(`${API_BASE_URL}/deals/${dealId}/buyer`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ buyerId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Failed to update buyer (${response.status})`);
  }

  return data;
};

// ⭐ NEW: Update seller
export const updateDealSeller = async (dealId, sellerId, token) => {
  const response = await fetch(`${API_BASE_URL}/deals/${dealId}/seller`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sellerId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Failed to update seller (${response.status})`);
  }

  return data;
};

// ⭐ NEW: Update agent
export const updateDealAgent = async (dealId, agentId, token) => {
  const response = await fetch(`${API_BASE_URL}/deals/${dealId}/agent`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ agentId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Failed to update agent (${response.status})`);
  }

  return data;
};

// ⭐ NEW: Get all deals
export const getAllDeals = async (token) => {
  const response = await fetch(`${API_BASE_URL}/deals`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch deals (${response.status})`);
  }

  return data;
};

// ==================== USERS ====================

// ⭐ NEW: Get all users
export const getAllUsers = async (token) => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch users (${response.status})`);
  }

  return data;
};

// ⭐ NEW: Get all agents
export const getAllAgents = async (token) => {
  const response = await fetch(`${API_BASE_URL}/users/agents`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch agents (${response.status})`);
  }

  return data;
};

// ⭐ NEW: Delete user (cascade)
export const deleteUser = async (userId, token) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Failed to delete user (${response.status})`);
  }

  return data;
};

// ⭐ NEW: Update user
export const updateUser = async (userId, userData, token) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Failed to update user (${response.status})`);
  }

  return data;
};

// ⭐ NEW: Activate user
export const activateUser = async (userId, token) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/activate`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Failed to activate user (${response.status})`);
  }

  return data;
};

// ⭐ NEW: Deactivate user
export const deactivateUser = async (userId, token) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/deactivate`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Failed to deactivate user (${response.status})`);
  }

  return data;
};

// ==================== ERROR HANDLER ====================
export const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error.message.includes('401') || error.message.includes('Authentication')) {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
    return 'Session expired. Please login again.';
  }

  if (error.message.includes('403') || error.message.includes('Forbidden')) {
    return 'You do not have permission to perform this action.';
  }

  if (error.message.includes('404')) {
    return 'Resource not found.';
  }

  return error.message || 'An unexpected error occurred.';
};