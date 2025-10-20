import { BACKEND_BASE_URL } from "../config/config";

const API_BASE_URL = `${BACKEND_BASE_URL}/api`;

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
