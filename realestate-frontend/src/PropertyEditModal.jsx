// realestate-frontend/src/PropertyEditModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { BACKEND_BASE_URL } from "./config/config";
import "./PropertyEditModal.css";

/**
 * PropertyEditModal - Enhanced with all features from PostPropertyModal
 * - Multiple images support
 * - Price per sqft calculation
 * - Price in Indian words
 * - Interactive amenities
 * - Construction status, possession date, RERA/HMDA IDs
 * - Conditional fields based on property type
 */

function PropertyEditModal({ property, onClose, onPropertyUpdated }) {
  const { user, isAuthenticated } = useAuth();
  const authToken =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  // ---------- UI State ----------
  const [areas, setAreas] = useState([]);
  const [areasLoading, setAreasLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [priceInWords, setPriceInWords] = useState("");

  // ---------- Images State ----------
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [removedExistingIds, setRemovedExistingIds] = useState([]);

  // ---------- Form Data ----------
  const [formData, setFormData] = useState({
    title: property?.title || "",
    type: property?.type || property?.propertyType || "Apartment",
    listingType: property?.listingType || "sale",
    city: property?.city || property?.cityName || "Hyderabad",
    areaId: property?.area?.areaId || property?.area?.id || "",
    address: property?.address || "",
    imageUrl: property?.imageUrl || "",
    bedrooms: property?.bedrooms ?? "",
    bathrooms: property?.bathrooms ?? "",
    balconies: property?.balconies ?? "",
    areaSqft: property?.areaSqft ?? "",
    price: property?.price ?? "",
    pricePerSqft: property?.pricePerSqft ?? "",
    amenities: property?.amenities || "",
    description: property?.description || "",
    ownerType: property?.ownerType || "owner",
    constructionStatus: property?.constructionStatus || "ready_to_move",
    possessionYear: property?.possessionYear || "",
    possessionMonth: property?.possessionMonth || "",
    reraId: property?.reraId || "",
    hmdaId: property?.hmdaId || "",
    isReadyToMove: !!property?.isReadyToMove,
    isVerified: !!property?.isVerified,
  });

  const propertyId = property?.id || property?.propertyId;

  // Common amenities list
  const commonAmenities = [
    "Parking",
    "Gym",
    "Swimming Pool",
    "Security",
    "Lift",
    "Power Backup",
    "Club House",
    "Park",
    "Intercom",
    "Visitor Parking",
    "Rainwater Harvesting",
    "24/7 Water Supply",
    "Community Hall",
  ];

  // Check if property type is Plot/Land/Villa
  const isPlotOrLandOrVilla =
    formData.type?.toLowerCase() === "plot" ||
    formData.type?.toLowerCase() === "land" ||
    formData.type?.toLowerCase() === "villa";

  // Possession months and years
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  // Derived: ordered images list
  const orderedExisting = useMemo(() => {
    const arr = Array.isArray(existingImages) ? [...existingImages] : [];
    arr.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    return arr;
  }, [existingImages]);

  const totalImagesCount =
    (orderedExisting?.length || 0) + (newPreviews?.length || 0);

  // ---------- Effects ----------
  useEffect(() => {
    loadAreas();
  }, []);

  useEffect(() => {
    if (propertyId) {
      fetchExistingImages(propertyId);
    }
  }, [propertyId]);

  useEffect(() => {
    if (formData.price) {
      setPriceInWords(convertToIndianWords(formData.price));
    } else {
      setPriceInWords("");
    }
  }, [formData.price]);

  // ---------- Price Conversion ----------
  const convertToIndianWords = (numStr) => {
    const num = Number(numStr);
    if (!numStr || isNaN(num) || num <= 0) return "";

    const ones = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
      "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
      "Seventeen", "Eighteen", "Nineteen",
    ];
    const tens = [
      "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
    ];

    const numToWords = (n) => {
      let str = "";
      if (n > 99) {
        str += ones[Math.floor(n / 100)] + " Hundred ";
        n %= 100;
      }
      if (n > 19) {
        str += tens[Math.floor(n / 10)] + " ";
        n %= 10;
      }
      if (n > 0) {
        str += ones[n] + " ";
      }
      return str;
    };

    let words = "";
    let tempNum = num;
    if (tempNum >= 10000000) {
      words += numToWords(Math.floor(tempNum / 10000000)) + "Crore ";
      tempNum %= 10000000;
    }
    if (tempNum >= 100000) {
      words += numToWords(Math.floor(tempNum / 100000)) + "Lakh ";
      tempNum %= 100000;
    }
    if (tempNum >= 1000) {
      words += numToWords(Math.floor(tempNum / 1000)) + "Thousand ";
      tempNum %= 1000;
    }
    if (tempNum > 0) {
      words += numToWords(tempNum);
    }
    return words.trim() + " Rupees Only";
  };

  // ---------- Price/Area Calculations ----------
  const calculatePricePerSqft = (price, areaSqft) => {
    const p = Number(price);
    const a = Number(areaSqft);
    if (p > 0 && a > 0) {
      return Math.round(p / a);
    }
    return "";
  };

  const calculateTotalPrice = (pricePerSqft, areaSqft) => {
    const pps = Number(pricePerSqft);
    const a = Number(areaSqft);
    if (pps > 0 && a > 0) {
      return Math.round(pps * a);
    }
    return "";
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      const newData = { ...prev, price: value };
      if (prev.areaSqft && value) {
        newData.pricePerSqft = calculatePricePerSqft(value, prev.areaSqft);
      }
      return newData;
    });
  };

  const handlePricePerSqftChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      const newData = { ...prev, pricePerSqft: value };
      if (prev.areaSqft && value) {
        newData.price = calculateTotalPrice(value, prev.areaSqft);
      }
      return newData;
    });
  };

  const handleAreaSqftChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      const newData = { ...prev, areaSqft: value };
      if (prev.pricePerSqft && value) {
        newData.price = calculateTotalPrice(prev.pricePerSqft, value);
      } else if (prev.price && value) {
        newData.pricePerSqft = calculatePricePerSqft(prev.price, value);
      }
      return newData;
    });
  };

  // ---------- Loaders ----------
  async function loadAreas() {
    setAreasLoading(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/areas?city=Hyderabad`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.data)) {
        setAreas(data.data);
        setError(null);
      } else {
        setAreas([]);
        setError("Invalid response format for areas.");
      }
    } catch (err) {
      setError(`Failed to load areas: ${err.message}`);
      setAreas([]);
    } finally {
      setAreasLoading(false);
    }
  }

  async function fetchExistingImages(pid) {
    try {
      const res = await fetch(
        `${BACKEND_BASE_URL}/api/property-images/property/${pid}`
      );
      if (!res.ok) throw new Error(`Failed to load images: HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.data || [];
      const normalized = list
        .filter(Boolean)
        .map((img, idx) => ({
          imageId: img.imageId ?? img.id ?? null,
          imageUrl: img.imageUrl,
          isPrimary: !!img.isPrimary,
          displayOrder: Number.isFinite(img.displayOrder)
            ? img.displayOrder
            : idx,
          createdAt: img.createdAt || null,
        }));
      if (!normalized.some((i) => i.isPrimary) && normalized.length > 0) {
        normalized[0].isPrimary = true;
      }
      setExistingImages(normalized);
    } catch (err) {
      console.error(err);
      setExistingImages([]);
    }
  }

  // ---------- Handlers ----------
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("pem-backdrop")) {
      onClose && onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(null);
  };

  const handleDecimalChange = (e) => {
    const { name, value } = e.target;
    const regex = /^\d*\.?\d{0,1}$/;
    if (value === "" || regex.test(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAmenityChange = (amenity) => {
    const selectedAmenities = formData.amenities
      ? formData.amenities.split(",").map((a) => a.trim())
      : [];

    const isSelected = selectedAmenities.includes(amenity);
    let newAmenities;

    if (isSelected) {
      newAmenities = selectedAmenities.filter((a) => a !== amenity);
    } else {
      newAmenities = [...selectedAmenities, amenity];
    }

    setFormData((prev) => ({
      ...prev,
      amenities: newAmenities.join(", "),
    }));
  };

  const handleNewFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentTotal = totalImagesCount;
    if (currentTotal + files.length > 10) {
      alert("You can upload a maximum of 10 images.");
      return;
    }

    const valid = [];
    const previews = [];
    for (const f of files) {
      if (!f.type?.startsWith("image/")) {
        alert(`"${f.name}" is not an image file.`);
        continue;
      }
      if (f.size > 10 * 1024 * 1024) {
        alert(`"${f.name}" is too large (max 10MB).`);
        continue;
      }
      valid.push(f);
      previews.push(URL.createObjectURL(f));
    }
    setNewFiles((prev) => [...prev, ...valid]);
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  const removeExistingImage = (imageId) => {
    setExistingImages((prev) =>
      prev.filter((img) => img.imageId !== imageId)
    );
    setRemovedExistingIds((prev) => [...prev, imageId]);
  };

  const removeNewImage = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => {
      try {
        URL.revokeObjectURL(prev[index]);
      } catch {}
      return prev.filter((_, i) => i !== index);
    });
  };

  const setPrimaryExisting = (imageId) => {
    setExistingImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.imageId === imageId,
      }))
    );
  };

  const setPrimaryNew = (index) => {
    setExistingImages((prev) => prev.map((i) => ({ ...i, isPrimary: false })));
    if (index > 0) {
      setNewFiles((prev) => {
        const arr = [...prev];
        [arr[0], arr[index]] = [arr[index], arr[0]];
        return arr;
      });
      setNewPreviews((prev) => {
        const arr = [...prev];
        [arr[0], arr[index]] = [arr[index], arr[0]];
        return arr;
      });
    }
  };

  const moveExisting = (imageId, direction) => {
    setExistingImages((prev) => {
      const arr = [...prev];
      const idx = arr.findIndex((i) => i.imageId === imageId);
      if (idx < 0) return arr;
      const target = direction === "left" ? idx - 1 : idx + 1;
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr.map((img, i) => ({ ...img, displayOrder: i }));
    });
  };

  const moveNew = (index, direction) => {
    const target = direction === "left" ? index - 1 : index + 1;
    if (target < 0 || target >= newFiles.length) return;
    setNewFiles((prev) => {
      const arr = [...prev];
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
    setNewPreviews((prev) => {
      const arr = [...prev];
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  // ---------- Submit ----------
  async function handleSubmit(e) {
    e.preventDefault();
    if (!authToken) {
      alert("Please log in to update this property.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1) Upload new images
      const uploadedNewUrls = [];
      if (newFiles.length > 0) {
        setImageUploading(true);
        for (let i = 0; i < newFiles.length; i++) {
          const file = newFiles[i];
          const fd = new FormData();
          fd.append("file", file);
          fd.append("propertyId", String(propertyId));

          const res = await fetch(`${BACKEND_BASE_URL}/api/upload/property-image`, {
            method: "POST",
            headers: { Authorization: `Bearer ${authToken}` },
            body: fd,
          });

          if (!res.ok) {
            throw new Error(`Image upload failed: HTTP ${res.status}`);
          }

          const data = await res.json();
          const url = data.data?.imageUrl || data.imageUrl;
          if (!url) {
            throw new Error("Upload returned no imageUrl");
          }
          uploadedNewUrls.push(url);

          setUploadProgress(Math.round(((i + 1) / newFiles.length) * 100));
        }
        setImageUploading(false);
      }

      // 2) Build final images list
      const finalImages = [
        ...orderedExisting.map((img, idx) => ({
          imageUrl: img.imageUrl,
          isPrimary: img.isPrimary,
          displayOrder: idx,
        })),
        ...uploadedNewUrls.map((url, idx) => ({
          imageUrl: url,
          isPrimary:
            orderedExisting.every((i) => !i.isPrimary) && idx === 0,
          displayOrder: orderedExisting.length + idx,
        })),
      ];

      // Ensure exactly one primary
      if (!finalImages.some((i) => i.isPrimary) && finalImages.length > 0) {
        finalImages[0].isPrimary = true;
      }

      const primaryUrl = finalImages.find((i) => i.isPrimary)?.imageUrl || "";

      // 3) Delete old property images
      await fetch(
        `${BACKEND_BASE_URL}/api/property-images/property/${propertyId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      // 4) Save new images list
      if (finalImages.length > 0) {
        const saveRes = await fetch(
          `${BACKEND_BASE_URL}/api/property-images/property/${propertyId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(finalImages),
          }
        );
        if (!saveRes.ok) {
          throw new Error(`Failed to save images: HTTP ${saveRes.status}`);
        }
      }

      // 5) Update property
      const payload = {
        title: formData.title.trim(),
        type: formData.type,
        listingType: formData.listingType,
        city: formData.city,
        areaId: Number(formData.areaId),
        address: formData.address.trim(),
        imageUrl: primaryUrl,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
        balconies: formData.balconies ? Number(formData.balconies) : null,
        areaSqft: formData.areaSqft ? Number(formData.areaSqft) : null,
        price: formData.price ? Number(formData.price) : 0,
        pricePerSqft: formData.pricePerSqft ? Number(formData.pricePerSqft) : null,
        amenities: formData.amenities.trim(),
        description: formData.description.trim(),
        ownerType: formData.ownerType,
        constructionStatus: formData.constructionStatus,
        possessionYear: formData.possessionYear ? Number(formData.possessionYear) : null,
        possessionMonth: formData.possessionMonth || null,
        reraId: formData.reraId.trim() || null,
        hmdaId: formData.hmdaId.trim() || null,
        isReadyToMove: formData.isReadyToMove,
        isVerified: formData.isVerified,
      };

      const propRes = await fetch(
        `${BACKEND_BASE_URL}/api/properties/${propertyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!propRes.ok) {
        const errText = await propRes.text();
        throw new Error(`Failed to update property: ${errText}`);
      }

      const updated = await propRes.json();
      alert("✅ Property updated successfully!");
      if (onPropertyUpdated) onPropertyUpdated(updated);
      onClose();
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message || "Failed to update property");
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
      setImageUploading(false);
    }
  }

  // ---------- Render ----------
  if (!isAuthenticated) {
    return (
      <div className="pem-backdrop" onClick={handleBackdropClick}>
        <div className="pem-modal">
          <button className="pem-close" onClick={onClose}>
            ×
          </button>
          <h2 className="pem-auth-title">Please log in to edit properties</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="pem-backdrop" onClick={handleBackdropClick}>
      <div className="pem-modal">
        <button className="pem-close" onClick={onClose}>
          ×
        </button>
        <h2 className="pem-title">Edit Property</h2>

        {error && <div className="pem-alert">{error}</div>}

        <form className="pem-form" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="pem-field">
            <label className="pem-label">Title *</label>
            <input
              className="pem-input"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Spacious 3BHK Apartment in Gachibowli"
              required
            />
          </div>

          {/* Type & Listing Type */}
          <div className="pem-row">
            <div className="pem-field">
              <label className="pem-label">Property Type *</label>
              <select
                className="pem-select"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Plot">Plot</option>
                <option value="Land">Land</option>
                <option value="House">House</option>
                <option value="Farm House">Farm House</option>
              </select>
            </div>

            <div className="pem-field">
              <label className="pem-label">Listing Type *</label>
              <select
                className="pem-select"
                name="listingType"
                value={formData.listingType}
                onChange={handleChange}
                required
              >
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
              </select>
            </div>
          </div>

          {/* City & Area */}
          <div className="pem-row">
            <div className="pem-field">
              <label className="pem-label">City *</label>
              <input
                className="pem-input readonly"
                type="text"
                name="city"
                value={formData.city}
                readOnly
              />
            </div>

            <div className="pem-field">
              <label className="pem-label">Area *</label>
              <select
                className="pem-select"
                name="areaId"
                value={formData.areaId}
                onChange={handleChange}
                disabled={areasLoading}
                required
              >
                <option value="">
                  {areasLoading ? "Loading areas..." : "Select Area"}
                </option>
                {areas.map((a) => (
                  <option key={a.areaId || a.id} value={a.areaId || a.id}>
                    {a.areaName || a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="pem-field">
            <label className="pem-label">Address *</label>
            <input
              className="pem-input"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Full address"
              required
            />
          </div>

          {/* Owner Type & Construction Status */}
          <div className="pem-row">
            <div className="pem-field">
              <label className="pem-label">Owner Type</label>
              <select
                className="pem-select"
                name="ownerType"
                value={formData.ownerType}
                onChange={handleChange}
              >
                <option value="owner">Owner</option>
                <option value="broker">Broker</option>
                <option value="agent">Agent</option>
                <option value="builder">Builder</option>
              </select>
            </div>

            <div className="pem-field">
              <label className="pem-label">Construction Status</label>
              <select
                className="pem-select"
                name="constructionStatus"
                value={formData.constructionStatus}
                onChange={handleChange}
              >
                <option value="ready_to_move">Ready to Move</option>
                <option value="under_construction">Under Construction</option>
              </select>
            </div>
          </div>

          {/* Possession Date */}
          {formData.constructionStatus === "under_construction" && (
            <div className="pem-row">
              <div className="pem-field">
                <label className="pem-label">Possession Month</label>
                <select
                  className="pem-select"
                  name="possessionMonth"
                  value={formData.possessionMonth}
                  onChange={handleChange}
                >
                  <option value="">Select Month</option>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pem-field">
                <label className="pem-label">Possession Year</label>
                <select
                  className="pem-select"
                  name="possessionYear"
                  value={formData.possessionYear}
                  onChange={handleChange}
                >
                  <option value="">Select Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* RERA & HMDA IDs */}
          <div className="pem-row">
            <div className="pem-field">
              <label className="pem-label">RERA ID</label>
              <input
                className="pem-input"
                type="text"
                name="reraId"
                value={formData.reraId}
                onChange={handleChange}
                placeholder="e.g., P02400004321"
              />
            </div>

            <div className="pem-field">
              <label className="pem-label">HMDA ID</label>
              <input
                className="pem-input"
                type="text"
                name="hmdaId"
                value={formData.hmdaId}
                onChange={handleChange}
                placeholder="e.g., HMDA/LO/2024/12345"
              />
            </div>
          </div>

          {/* Images Section */}
          <div className="pem-images">
            <h3 className="pem-images-title">Property Images (Max 10)</h3>

            {/* Existing images */}
            {orderedExisting.length > 0 && (
              <div className="ppm-previews">
                {orderedExisting.map((img, idx) => (
                  <div key={img.imageId} className="ppm-preview-wrap">
                    <img
                      src={img.imageUrl}
                      alt={`Existing ${idx + 1}`}
                      className="ppm-preview"
                    />
                    {img.isPrimary && <span className="ppm-primary">Primary</span>}
                    <span className="ppm-num">{idx + 1}</span>
                    <div className="ppm-controls">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          className="ppm-control ppm-control-primary"
                          onClick={() => setPrimaryExisting(img.imageId)}
                        >
                          ⭐
                        </button>
                      )}
                      <button
                        type="button"
                        className="ppm-control"
                        onClick={() => moveExisting(img.imageId, "left")}
                        disabled={idx === 0}
                      >
                        ◀
                      </button>
                      <button
                        type="button"
                        className="ppm-control"
                        onClick={() => moveExisting(img.imageId, "right")}
                        disabled={idx === orderedExisting.length - 1}
                      >
                        ▶
                      </button>
                      <button
                        type="button"
                        className="ppm-control ppm-control-remove"
                        onClick={() => removeExistingImage(img.imageId)}
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* New images */}
            {newPreviews.length > 0 && (
              <div className="ppm-previews" style={{ marginTop: 12 }}>
                {newPreviews.map((src, idx) => (
                  <div key={src} className="ppm-preview-wrap">
                    <img
                      src={src}
                      alt={`New ${idx + 1}`}
                      className="ppm-preview"
                    />
                    {orderedExisting.every((i) => !i.isPrimary) &&
                      idx === 0 && <span className="ppm-primary">Primary</span>}
                    <span className="ppm-num">
                      {orderedExisting.length + idx + 1}
                    </span>
                    <div className="ppm-controls">
                      {!(orderedExisting.some((i) => i.isPrimary) && idx === 0) && (
                        <button
                          type="button"
                          className="ppm-control ppm-control-primary"
                          onClick={() => setPrimaryNew(idx)}
                        >
                          ⭐
                        </button>
                      )}
                      <button
                        type="button"
                        className="ppm-control"
                        onClick={() => moveNew(idx, "left")}
                        disabled={idx === 0}
                      >
                        ◀
                      </button>
                      <button
                        type="button"
                        className="ppm-control"
                        onClick={() => moveNew(idx, "right")}
                        disabled={idx === newPreviews.length - 1}
                      >
                        ▶
                      </button>
                      <button
                        type="button"
                        className="ppm-control ppm-control-remove"
                        onClick={() => removeNewImage(idx)}
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* File input */}
            <input
              className="pem-file"
              type="file"
              accept="image/*"
              multiple
              onChange={handleNewFilesSelected}
              disabled={imageUploading}
              style={{ marginTop: 12 }}
            />

            {/* Upload progress */}
            {imageUploading && (
              <div className="pem-progress">
                <div className="pem-progress-bar">
                  <div
                    className="pem-progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="pem-progress-text">Uploading {uploadProgress}%</p>
              </div>
            )}

            <p className="ppm-img-count">{totalImagesCount}/10 images</p>
          </div>

          {/* Description */}
          <div className="pem-field">
            <label className="pem-label">Description *</label>
            <textarea
              className="pem-textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your property..."
              required
            />
          </div>

          {/* Bedrooms, Bathrooms, Balconies (conditional) */}
          {!isPlotOrLandOrVilla && (
            <div className="pem-row3">
              <div className="pem-field">
                <label className="pem-label">🛏️ Bedrooms *</label>
                <input
                  className="pem-input"
                  type="number"
                  min="0"
                  step="0.1"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleDecimalChange}
                  placeholder="2"
                  required
                  inputMode="decimal"
                />
              </div>
              <div className="pem-field">
                <label className="pem-label">🚿 Bathrooms *</label>
                <input
                  className="pem-input"
                  type="number"
                  min="0"
                  step="0.1"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleDecimalChange}
                  placeholder="2"
                  required
                  inputMode="decimal"
                />
              </div>
              <div className="pem-field">
                <label className="pem-label">🏠 Balconies</label>
                <input
                  className="pem-input"
                  type="number"
                  min="0"
                  step="0.1"
                  name="balconies"
                  value={formData.balconies}
                  onChange={handleDecimalChange}
                  placeholder="1"
                  inputMode="decimal"
                />
              </div>
            </div>
          )}

          {/* Area & Price Row */}
          <div className="pem-row">
            <div className="pem-field">
              <label className="pem-label">📐 Area (sqft)</label>
              <input
                className="pem-input"
                type="number"
                min="0"
                name="areaSqft"
                value={formData.areaSqft}
                onChange={handleAreaSqftChange}
                placeholder="1200"
                max="99999"
                inputMode="numeric"
              />
            </div>

            <div className="pem-field">
              <label className="pem-label">💵 Price Per Sqft (₹)</label>
              <input
                className="pem-input"
                type="number"
                min="0"
                name="pricePerSqft"
                value={formData.pricePerSqft}
                onChange={handlePricePerSqftChange}
                placeholder="5000"
                max="99999"
                inputMode="numeric"
              />
            </div>

            <div className="pem-field">
              <label className="pem-label">💰 Expected Price (₹) *</label>
              <input
                className="pem-input"
                type="number"
                min="1"
                name="price"
                value={formData.price}
                onChange={handlePriceChange}
                placeholder="5000000"
                required
                max="1000000000"
                inputMode="numeric"
              />
              {priceInWords && (
                <p className="ppm-price-words">{priceInWords}</p>
              )}
            </div>
          </div>

          {/* Amenities (Interactive) */}
          <div className="pem-field">
            <label className="pem-label">✨ Amenities</label>
            <div className="ppm-amenities">
              {commonAmenities.map((amenity) => {
                const selectedAmenities = formData.amenities
                  ? formData.amenities.split(",").map((a) => a.trim())
                  : [];
                const isSelected = selectedAmenities.includes(amenity);

                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityChange(amenity)}
                    className={`ppm-amenity ${isSelected ? "selected" : ""}`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="pem-checkbox">
            <input
              type="checkbox"
              id="isReadyToMove"
              name="isReadyToMove"
              checked={formData.isReadyToMove}
              onChange={handleChange}
            />
            <label htmlFor="isReadyToMove" className="pem-checkbox-text">
              Ready to Move
            </label>
          </div>

          <div className="pem-checkbox">
            <input
              type="checkbox"
              id="isVerified"
              name="isVerified"
              checked={formData.isVerified}
              onChange={handleChange}
            />
            <label htmlFor="isVerified" className="pem-checkbox-text">
              Verified Property
            </label>
          </div>

          {/* Actions */}
          <div className="pem-actions">
            <button
              type="submit"
              className="pem-btn pem-btn-primary"
              disabled={loading || imageUploading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="pem-btn pem-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PropertyEditModal;