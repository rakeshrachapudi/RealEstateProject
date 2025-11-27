// src/hooks/usePropertyData.js
import { useState, useEffect, useCallback } from "react";
import { BACKEND_BASE_URL } from "../config/config";
import {
  getPropertyTypes,
  getFeaturedProperties,
  getAllProperties,
} from "../services/api";

// Utility function for safe JSON parsing
const safeJsonParse = async (response) => {
  try {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return await response.json();
    }
    await response.text();
    return null;
  } catch (err) {
    console.error("Failed to parse response as JSON:", err);
    return null;
  }
};

// Normalize property object
const normalizeProperty = (p) => {
  if (!p) return null;

  const id = p.propertyId ?? p.id ?? null;
  const propertyTypeRaw = p.propertyType ?? p.type ?? null;

  let typeName = null;
  if (typeof propertyTypeRaw === "string") {
    typeName = propertyTypeRaw;
  } else if (propertyTypeRaw && typeof propertyTypeRaw === "object") {
    typeName = propertyTypeRaw.typeName || propertyTypeRaw.name || null;
  }

  const imageUrl =
    p.imageUrl && p.imageUrl !== "null" && String(p.imageUrl).trim() !== ""
      ? p.imageUrl
      : null;

  const amenities =
    typeof p.amenities === "string"
      ? p.amenities
      : Array.isArray(p.amenities)
      ? p.amenities.join(", ")
      : "";

  const areaName =
    p.areaName ||
    p.cityName ||
    (p.area && (p.area.areaName || p.area.name)) ||
    p.location ||
    p.city ||
    "";

  const userObj =
    p.user && typeof p.user === "object"
      ? {
          id: p.user.id ?? null,
          firstName: p.user.firstName ?? p.user.first_name ?? "",
          lastName: p.user.lastName ?? p.user.last_name ?? "",
          mobile: p.user.mobile ?? p.user.phone ?? "",
          primaryRole: p.user.role ?? p.user.userRole ?? null,
        }
      : {
          id: null,
          firstName: "",
          lastName: "",
          mobile: "",
          primaryRole: null,
        };

  const bedrooms = Number.isFinite(p.bedrooms)
    ? p.bedrooms
    : Number(p.bedrooms) || 0;
  const bathrooms = Number.isFinite(p.bathrooms)
    ? p.bathrooms
    : Number(p.bathrooms) || 0;
  const postedByRole = p.postedByRole ?? p.role ?? userObj.primaryRole ?? null;

  return {
    ...p,
    id,
    propertyId: id,
    imageUrl,
    propertyType: typeName ? { typeName } : null,
    type: typeName,
    areaName,
    amenities,
    user: userObj,
    postedByRole,
    bedrooms,
    bathrooms,
    priceDisplay: p.priceDisplay ?? null,
    isFeatured:
      p.isFeatured === true || p.isFeatured === 1 || p.isFeatured === "true",
    isActive: p.isActive === undefined ? true : !!p.isActive,
  };
};

export const usePropertyData = (isAuthenticated, user) => {
  // State
  const [featuredPropsList, setFeaturedPropsList] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [myDeals, setMyDeals] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState(["All"]);

  // Loading states
  const [loadingMyProperties, setLoadingMyProperties] = useState(false);
  const [loadingMyDeals, setLoadingMyDeals] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingAllProps, setLoadingAllProps] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Fetch property types
  const fetchPropertyTypes = useCallback(async () => {
    setLoadingTypes(true);
    try {
      const data = await getPropertyTypes();
      if (data && Array.isArray(data)) {
        const typeNames = data
          .map((t) => t.typeName || t.name || null)
          .filter(Boolean);
        setPropertyTypes(["All", ...typeNames]);
      }
    } catch (err) {
      console.error("Error fetching property types:", err);
    } finally {
      setLoadingTypes(false);
    }
  }, []);

  // Fetch featured properties
  const fetchFeaturedProperties = useCallback(async () => {
    try {
      const data = await getFeaturedProperties();
      if (data && Array.isArray(data)) {
        const normalized = data.map(normalizeProperty).filter(Boolean);
        setFeaturedPropsList(normalized);
      }
    } catch (err) {
      console.error("Error fetching featured properties:", err);
    }
  }, []);

  // Fetch all properties
  const fetchAllProperties = useCallback(async () => {
    setLoadingAllProps(true);
    try {
      const data = await getAllProperties();
      if (data && Array.isArray(data)) {
        const normalized = data.map(normalizeProperty).filter(Boolean);
        setAllProperties(normalized);
      }
    } catch (err) {
      console.error("Error fetching all properties:", err);
    } finally {
      setLoadingAllProps(false);
    }
  }, []);

  // Fetch user's properties
  const fetchMyProperties = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoadingMyProperties(true);
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${BACKEND_BASE_URL}/api/properties/my-properties`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.ok) {
        const data = await safeJsonParse(resp);
        if (data && Array.isArray(data)) {
          const normalized = data.map(normalizeProperty).filter(Boolean);
          setMyProperties(normalized);
        }
      }
    } catch (err) {
      console.error("Error fetching my properties:", err);
    } finally {
      setLoadingMyProperties(false);
    }
  }, [isAuthenticated]);

  // Fetch user's deals
  const fetchMyDeals = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setLoadingMyDeals(true);
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${BACKEND_BASE_URL}/api/deals/my-deals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.ok) {
        const data = await safeJsonParse(resp);
        if (data && Array.isArray(data)) {
          setMyDeals(data);
        }
      }
    } catch (err) {
      console.error("Error fetching my deals:", err);
    } finally {
      setLoadingMyDeals(false);
    }
  }, [isAuthenticated, user]);

  // Property update/delete handlers
  const handlePropertyUpdated = useCallback((updatedProp) => {
    const normalized = normalizeProperty(updatedProp);
    if (!normalized) return;

    setMyProperties((prev) =>
      prev.map((p) => (p.id === normalized.id ? normalized : p))
    );
    setFeaturedPropsList((prev) =>
      prev.map((p) => (p.id === normalized.id ? normalized : p))
    );
    setAllProperties((prev) =>
      prev.map((p) => (p.id === normalized.id ? normalized : p))
    );
  }, []);

  const handlePropertyDeleted = useCallback((deletedId) => {
    setMyProperties((prev) => prev.filter((p) => p.id !== deletedId));
    setFeaturedPropsList((prev) => prev.filter((p) => p.id !== deletedId));
    setAllProperties((prev) => prev.filter((p) => p.id !== deletedId));
  }, []);

  // Initial data load
  useEffect(() => {
    fetchPropertyTypes();
    fetchFeaturedProperties();
    fetchAllProperties();
  }, [fetchPropertyTypes, fetchFeaturedProperties, fetchAllProperties]);

  // Load user data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchMyProperties();
      fetchMyDeals();
    }
  }, [isAuthenticated, fetchMyProperties, fetchMyDeals]);

  return {
    featuredPropsList,
    allProperties,
    myProperties,
    myDeals,
    propertyTypes,
    loadingMyProperties,
    loadingMyDeals,
    loadingTypes,
    loadingAllProps,
    fetchError,
    fetchMyDeals,
    handlePropertyUpdated,
    handlePropertyDeleted,
  };
};