// AdminPropertyEditModal.jsx
// Enhanced modal for admin to edit properties with full image management
// Styled to match PropertyEditModal

import React, { useState, useEffect, useMemo } from "react";
import { BACKEND_BASE_URL } from "../config/config";
import "./AdminPropertyEditModal.css";

function AdminPropertyEditModal({ property, onClose, onPropertyUpdated }) {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [areasLoading, setAreasLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [priceInWords, setPriceInWords] = useState("");

  // Image management state
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [removedExistingIds, setRemovedExistingIds] = useState([]);

  const [formData, setFormData] = useState({
    title: property?.title || "",
    type: property?.propertyType || property?.type || "Apartment",
    listingType: property?.listingType || "sale",
    city: property?.cityName || property?.city || "Hyderabad",
    areaId: property?.area?.areaId || "",
    address: property?.address || "",
    bedrooms: property?.bedrooms || "",
    bathrooms: property?.bathrooms || "",
    balconies: property?.balconies || "",
    areaSqft: property?.areaSqft || "",
    price: property?.price || "",
    pricePerSqft: property?.pricePerSqft || "",
    amenities: property?.amenities || "",
    description: property?.description || "",
    ownerType: property?.ownerType || "owner",
    constructionStatus: property?.constructionStatus || "ready_to_move",
    possessionYear: property?.possessionYear || "",
    possessionMonth: property?.possessionMonth || "",
    reraId: property?.reraId || "",
    hmdaId: property?.hmdaId || "",
    isReadyToMove: property?.isReadyToMove || false,
    isVerified: property?.isVerified || false,
    isFeatured: property?.isFeatured || false,
    status: property?.status || "available",
  });

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

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  // Check if property type is plot, land, or villa
  const isPlotOrLandOrVilla =
    formData.type?.toLowerCase() === "plot" ||
    formData.type?.toLowerCase() === "land" ||
    formData.type?.toLowerCase() === "villa";

  const propertyId = property.id || property.propertyId;

  // Ordered existing images
  const orderedExisting = useMemo(() => {
    const arr = Array.isArray(existingImages) ? [...existingImages] : [];
    arr.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    return arr;
  }, [existingImages]);

  const totalImagesCount = (orderedExisting?.length || 0) + (newPreviews?.length || 0);

  useEffect(() => {
    loadAreas();
    loadExistingImages();
  }, []);

  useEffect(() => {
    if (formData.price) {
      setPriceInWords(convertToIndianWords(formData.price));
    } else {
      setPriceInWords("");
    }
  }, [formData.price]);

  const loadAreas = async () => {
    setAreasLoading(true);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/areas?city=Hyderabad`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setAreas(data.data);
        setError(null);
      }
    } catch (err) {
      setError(`Failed to load areas: ${err.message}`);
      setAreas([]);
    } finally {
      setAreasLoading(false);
    }
  };

  const loadExistingImages = async () => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/property-images/property/${propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : data?.data || [];
        const normalized = list
          .filter(Boolean)
          .map((img, idx) => ({
            imageId: img.imageId ?? img.id ?? null,
            imageUrl: img.imageUrl,
            isPrimary: !!img.isPrimary,
            displayOrder: Number.isFinite(img.displayOrder) ? img.displayOrder : idx,
            createdAt: img.createdAt || null,
          }));
        if (!normalized.some((i) => i.isPrimary) && normalized.length > 0) {
          normalized[0].isPrimary = true;
        }
        setExistingImages(normalized);
      }
    } catch (err) {
      console.error("Error loading existing images:", err);
      setExistingImages([]);
    }
  };

  const convertToIndianWords = (numStr) => {
    const num = Number(numStr);
    if (!numStr || isNaN(num) || num <= 0) return "";

    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

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
    const currentAmenities = formData.amenities
      ? formData.amenities.split(",").map((a) => a.trim())
      : [];
    let updatedAmenities;
    if (currentAmenities.includes(amenity)) {
      updatedAmenities = currentAmenities.filter((a) => a !== amenity);
    } else {
      updatedAmenities = [...currentAmenities, amenity];
    }
    setFormData((prev) => ({
      ...prev,
      amenities: updatedAmenities.join(", "),
    }));
  };

  const handleNewFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentTotal = totalImagesCount;
    if (currentTotal + files.length > 10) {
      alert("Maximum 10 images allowed per property");
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert(`"${file.name}" is not an image file`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`"${file.name}" is too large (max 10MB)`);
        continue;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setNewFiles(prev => [...prev, ...validFiles]);
    setNewPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => {
      try {
        URL.revokeObjectURL(prev[index]);
      } catch {}
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (imageId) => {
    setExistingImages((prev) =>
      prev.filter((img) => img.imageId !== imageId)
    );
    setRemovedExistingIds((prev) => [...prev, imageId]);
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

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("pem-backdrop")) {
      onClose && onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.title || !formData.areaId || !formData.price || !formData.description) {
      setError("Please fill all required fields marked with *");
      setLoading(false);
      return;
    }

    if (!isPlotOrLandOrVilla) {
      if (!formData.bedrooms || !formData.bathrooms) {
        setError("Bedrooms and bathrooms are required for this property type");
        setLoading(false);
        return;
      }
    }

    const numericPrice = parseFloat(formData.price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError("Please enter a valid price");
      setLoading(false);
      return;
    }

    const selectedAreaObject = areas.find(
      (area) => area.areaId.toString() === formData.areaId.toString()
    );

    if (!selectedAreaObject) {
      setError("Invalid area selected. Please try again.");
      setLoading(false);
      return;
    }

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
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
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
          isPrimary: orderedExisting.every((i) => !i.isPrimary) && idx === 0,
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
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
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
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify(finalImages),
          }
        );
        if (!saveRes.ok) {
          throw new Error(`Failed to save images: HTTP ${saveRes.status}`);
        }
      }

      // 5) Update property details
      const propertyData = {
        title: formData.title,
        type: formData.type,
        city: formData.city,
        address: formData.address || `${selectedAreaObject.areaName}, ${formData.city}`,
        imageUrl: primaryUrl,
        description: formData.description,
        price: numericPrice,
        areaSqft: formData.areaSqft ? parseFloat(formData.areaSqft) : null,
        pricePerSqft: formData.pricePerSqft ? Number(formData.pricePerSqft) : null,
        amenities: formData.amenities || null,
        listingType: formData.listingType,
        status: formData.status,
        isFeatured: formData.isFeatured,
        isActive: true,
        ownerType: formData.ownerType,
        constructionStatus: formData.constructionStatus,
        possessionYear: formData.possessionYear ? Number(formData.possessionYear) : null,
        possessionMonth: formData.possessionMonth || null,
        reraId: formData.reraId.trim() || null,
        hmdaId: formData.hmdaId.trim() || null,
        isReadyToMove: formData.isReadyToMove,
        isVerified: formData.isVerified,
        area: selectedAreaObject,
        user: property.user,
      };

      // Only include bedroom/bathroom/balconies if not plot/land/villa
      if (!isPlotOrLandOrVilla) {
        propertyData.bedrooms = parseInt(formData.bedrooms);
        propertyData.bathrooms = parseInt(formData.bathrooms);
        propertyData.balconies = parseInt(formData.balconies || "0");
      } else {
        propertyData.bedrooms = 0;
        propertyData.bathrooms = 0;
        propertyData.balconies = 0;
      }

      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/${propertyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(propertyData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Failed to update property: " + errorText);
      }

      console.log("✅ Property updated successfully");
      alert("✅ Property updated successfully!");
      if (onPropertyUpdated) onPropertyUpdated();
      onClose();
    } catch (err) {
      console.error("❌ Error updating property:", err);
      setError(err.message || "Failed to update property. Please try again.");
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
      setImageUploading(false);
    }
  };

  return (
    <div className="pem-backdrop" onClick={handleBackdropClick}>
      <div className="pem-modal">
        <button className="pem-close" onClick={onClose}>
          ×
        </button>
        <h2 className="pem-title">✏️ Edit Property (Admin)</h2>

        {error && <div className="pem-alert">{error}</div>}

        <form className="pem-form" onSubmit={handleSubmit}>
          {/* Property ID (Read-only) */}
          <div className="pem-field">
            <label className="pem-label">Property ID</label>
            <input
              type="text"
              className="pem-input readonly"
              value={propertyId}
              disabled
            />
          </div>

          {/* Title */}
          <div className="pem-field">
            <label className="pem-label required">Title</label>
            <input
              type="text"
              className="pem-input"
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
              <label className="pem-label required">Property Type</label>
              <select
                className="pem-select"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Independent House">Independent House</option>
                <option value="Plot">Plot</option>
                <option value="Land">Land</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            <div className="pem-field">
              <label className="pem-label required">Listing Type</label>
              <select
                className="pem-select"
                name="listingType"
                value={formData.listingType}
                onChange={handleChange}
                required
              >
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
          </div>

          {/* City & Area */}
          <div className="pem-row">
            <div className="pem-field">
              <label className="pem-label required">City</label>
              <input
                className="pem-input readonly"
                type="text"
                name="city"
                value={formData.city}
                readOnly
              />
            </div>

            <div className="pem-field">
              <label className="pem-label required">Area</label>
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
                {areas.map((area) => (
                  <option key={area.areaId} value={area.areaId}>
                    {area.areaName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="pem-field">
            <label className="pem-label">Address</label>
            <input
              type="text"
              className="pem-input"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Optional - auto-generated if empty"
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
                <option value="builder">Builder</option>
                <option value="agent">Agent</option>
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

          {/* Status (Admin only field) */}
          <div className="pem-field">
            <label className="pem-label">Status</label>
            <select
              className="pem-select"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </select>
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
                        ✕
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
                        ✕
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
            <label className="pem-label required">Description</label>
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
                <label className="pem-label required">🛏️ Bedrooms</label>
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
                <label className="pem-label required">🚿 Bathrooms</label>
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
              <label className="pem-label required">💰 Expected Price (₹)</label>
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

          <div className="pem-checkbox">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
            />
            <label htmlFor="isFeatured" className="pem-checkbox-text">
              Featured Property (Admin)
            </label>
          </div>

          {/* Actions */}
          <div className="pem-actions">
            <button
              type="submit"
              className="pem-btn pem-btn-primary"
              disabled={loading || imageUploading}
            >
              {loading ? "Updating..." : "Update Property"}
            </button>
            <button
              type="button"
              className="pem-btn pem-btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminPropertyEditModal;