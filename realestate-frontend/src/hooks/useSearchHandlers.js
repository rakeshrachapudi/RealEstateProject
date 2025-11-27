// src/hooks/useSearchHandlers.js
import { useState, useRef, useCallback } from "react";
import { BACKEND_BASE_URL } from "../config/config";

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

  return {
    ...p,
    id,
    propertyId: id,
    type: typeName,
    propertyType: typeName ? { typeName } : null,
  };
};

export const useSearchHandlers = () => {
  // Advanced search state
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Quick search state
  const [quickSearchInput, setQuickSearchInput] = useState("");
  const [quickSearchResults, setQuickSearchResults] = useState([]);
  const [showQuickSearchResults, setShowQuickSearchResults] = useState(false);
  const [quickSearchLoading, setQuickSearchLoading] = useState(false);

  // Refs for debounce and abort
  const searchDebounceRef = useRef(null);
  const searchAbortRef = useRef(null);

  // Quick search change handler with debounce
  const handleQuickSearchChange = useCallback((e) => {
    const val = e.target.value;
    setQuickSearchInput(val);

    // Clear previous timeout
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    // Abort previous request
    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }

    if (!val.trim()) {
      setQuickSearchResults([]);
      setShowQuickSearchResults(false);
      setQuickSearchLoading(false);
      return;
    }

    setQuickSearchLoading(true);

    // Debounce search
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const controller = new AbortController();
        searchAbortRef.current = controller;

        const resp = await fetch(
          `${BACKEND_BASE_URL}/api/properties/quick-search?q=${encodeURIComponent(
            val
          )}`,
          { signal: controller.signal }
        );

        if (resp.ok) {
          const data = await safeJsonParse(resp);
          if (data && Array.isArray(data)) {
            const normalized = data.map(normalizeProperty).filter(Boolean);
            setQuickSearchResults(normalized);
            setShowQuickSearchResults(true);
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Quick search error:", err);
        }
      } finally {
        setQuickSearchLoading(false);
      }
    }, 300);
  }, []);

  // Quick search submit handler
  const handleQuickSearchSubmit = useCallback((e) => {
    e.preventDefault();
    // Already handled by onChange with debounce
  }, []);

  // Clear quick search
  const handleClearQuickSearch = useCallback(() => {
    setQuickSearchInput("");
    setQuickSearchResults([]);
    setShowQuickSearchResults(false);
    setQuickSearchLoading(false);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }
  }, []);

  // Advanced search handler
  const handleAdvancedSearch = useCallback(async (filters) => {
    setSearchLoading(true);
    setShowSearchResults(false);

    try {
      const queryParams = new URLSearchParams();

      if (filters.listingType) queryParams.append("listingType", filters.listingType);
      if (filters.propertyType) queryParams.append("propertyType", filters.propertyType);
      if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
      if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
      if (filters.bedrooms) queryParams.append("bedrooms", filters.bedrooms);
      if (filters.area) queryParams.append("area", filters.area);

      const resp = await fetch(
        `${BACKEND_BASE_URL}/api/properties/search?${queryParams.toString()}`
      );

      if (resp.ok) {
        const data = await safeJsonParse(resp);
        if (data && Array.isArray(data)) {
          const normalized = data.map(normalizeProperty).filter(Boolean);
          setSearchResults(normalized);
          setShowSearchResults(true);
        }
      }
    } catch (err) {
      console.error("Advanced search error:", err);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Reset all searches
  const handleResetSearch = useCallback(() => {
    setSearchResults([]);
    setShowSearchResults(false);
    setQuickSearchInput("");
    setQuickSearchResults([]);
    setShowQuickSearchResults(false);
    setSearchLoading(false);
    setQuickSearchLoading(false);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }
  }, []);

  return {
    // Advanced search
    searchResults,
    showSearchResults,
    searchLoading,
    handleAdvancedSearch,

    // Quick search
    quickSearchInput,
    quickSearchResults,
    showQuickSearchResults,
    quickSearchLoading,
    handleQuickSearchChange,
    handleQuickSearchSubmit,
    handleClearQuickSearch,

    // Reset
    handleResetSearch,
  };
};