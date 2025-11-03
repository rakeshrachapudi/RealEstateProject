// AdminPropertyEditModal.jsx
// Enhanced modal for admin to edit properties with full image management

import React, { useState, useEffect } from "react";
import { BACKEND_BASE_URL } from "../config/config";

function AdminPropertyEditModal({ property, onClose, onPropertyUpdated }) {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [areasLoading, setAreasLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [priceInWords, setPriceInWords] = useState("");

  // ⭐ Image management state
  const [existingImages, setExistingImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

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
    amenities: property?.amenities || "",
    description: property?.description || "",
    ownerType: property?.ownerType || "owner",
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

  // ⭐ Check if property type is plot, land, or villa (hide bathroom/balcony fields)
  const isPlotOrLandOrVilla =
    formData.type?.toLowerCase() === "plot" ||
    formData.type?.toLowerCase() === "land" ||
    formData.type?.toLowerCase() === "villa";

  useEffect(() => {
    loadAreas();
    loadExistingImages();
  }, []);

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
      const propertyId = property.id || property.propertyId;
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/property-images/property/${propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (response.ok) {
        const images = await response.json();
        setExistingImages(images || []);
      }
    } catch (err) {
      console.error("Error loading existing images:", err);
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

  const handlePriceChange = (e) => {
    const priceValue = e.target.value;
    setFormData((prev) => ({ ...prev, price: priceValue }));
    if (priceValue) {
      setPriceInWords(convertToIndianWords(priceValue));
    } else {
      setPriceInWords("");
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

  // ⭐ Handle new image selection
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const totalImages = existingImages.length + selectedImages.length + files.length;
    if (totalImages > 10) {
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

    setSelectedImages(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const markExistingImageForDeletion = (imageId) => {
    setImagesToDelete(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(img => img.imageId !== imageId));
  };

  const setPrimaryExistingImage = async (imageId) => {
    try {
      const propertyId = property.id || property.propertyId;
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/property-images/${imageId}/set-primary`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ propertyId }),
        }
      );
      if (response.ok) {
        loadExistingImages();
      }
    } catch (err) {
      console.error("Error setting primary image:", err);
    }
  };

  const uploadNewImages = async (propertyId) => {
    if (selectedImages.length === 0) return [];

    const uploadedUrls = [];
    setImageUploading(true);

    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        setUploadProgress(Math.round(((i + 1) / selectedImages.length) * 100));
        const response = await fetch(
          `${BACKEND_BASE_URL}/api/upload/property-image?propertyId=${propertyId}`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            uploadedUrls.push(data.url);
          }
        }
      } catch (err) {
        console.error("Error uploading image:", err);
      }
    }

    setImageUploading(false);
    setUploadProgress(0);
    return uploadedUrls;
  };

  const saveImagesToDatabase = async (propertyId, imageUrls) => {
    if (imageUrls.length === 0) return;

    const imageRequests = imageUrls.map((url, index) => ({
      imageUrl: url,
      isPrimary: existingImages.length === 0 && index === 0,
      displayOrder: existingImages.length + index,
    }));

    try {
      await fetch(
        `${BACKEND_BASE_URL}/api/property-images/property/${propertyId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(imageRequests),
        }
      );
    } catch (err) {
      console.error("Error saving images to database:", err);
    }
  };

  const deleteMarkedImages = async () => {
    for (const imageId of imagesToDelete) {
      try {
        await fetch(
          `${BACKEND_BASE_URL}/api/property-images/${imageId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
      } catch (err) {
        console.error("Error deleting image:", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation - skip bedroom/bathroom validation for plot/land/villa
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

    let priceDisplay;
    if (numericPrice >= 10000000) {
      priceDisplay = `₹${(numericPrice / 10000000).toFixed(2)} Cr`;
    } else if (numericPrice >= 100000) {
      priceDisplay = `₹${(numericPrice / 100000).toFixed(2)} Lac`;
    } else {
      priceDisplay = `₹${numericPrice.toLocaleString("en-IN")}`;
    }

    const selectedAreaObject = areas.find(
      (area) => area.areaId.toString() === formData.areaId.toString()
    );

    if (!selectedAreaObject) {
      setError("Invalid area selected. Please try again.");
      setLoading(false);
      return;
    }

    const propertyId = property.id || property.propertyId;

    // Build property data - conditionally include bedroom/bathroom fields
    const propertyData = {
      title: formData.title,
      type: formData.type,
      city: formData.city,
      address: formData.address || `${selectedAreaObject.areaName}, ${formData.city}`,
      imageUrl: existingImages[0]?.imageUrl || property.imageUrl || "",
      description: formData.description,
      price: numericPrice,
      priceDisplay: priceDisplay,
      areaSqft: formData.areaSqft ? parseFloat(formData.areaSqft) : null,
      amenities: formData.amenities || null,
      listingType: formData.listingType,
      status: formData.status,
      isFeatured: formData.isFeatured,
      isActive: true,
      ownerType: formData.ownerType,
      isReadyToMove: formData.isReadyToMove,
      isVerified: formData.isVerified,
      area: selectedAreaObject,
      user: property.user,
    };

    // ⭐ Only include bedroom/bathroom/balconies if not plot/land/villa
    if (!isPlotOrLandOrVilla) {
      propertyData.bedrooms = parseInt(formData.bedrooms);
      propertyData.bathrooms = parseInt(formData.bathrooms);
      propertyData.balconies = parseInt(formData.balconies || "0");
    } else {
      // Set to 0 for plot/land/villa
      propertyData.bedrooms = 0;
      propertyData.bathrooms = 0;
      propertyData.balconies = 0;
    }

    try {
      // 1. Delete marked images
      await deleteMarkedImages();

      // 2. Upload new images
      const uploadedUrls = await uploadNewImages(propertyId);

      // 3. Save new images to database
      if (uploadedUrls.length > 0) {
        await saveImagesToDatabase(propertyId, uploadedUrls);
      }

      // 4. Update property details
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>✏️ Edit Property</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          {/* Property ID (Read-only) */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Property ID</label>
            <input
              type="text"
              value={property.id || property.propertyId}
              disabled
              style={{ ...styles.input, backgroundColor: "#f5f5f5" }}
            />
          </div>

          {/* Title */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* Type & Listing Type */}
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Property Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                style={styles.select}
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

            <div style={styles.formGroup}>
              <label style={styles.label}>Listing Type *</label>
              <select
                name="listingType"
                value={formData.listingType}
                onChange={handleChange}
                style={styles.select}
                required
              >
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
          </div>

          {/* City & Area */}
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>City *</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                style={styles.select}
                required
              >
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Area *</label>
              <select
                name="areaId"
                value={formData.areaId}
                onChange={handleChange}
                style={styles.select}
                required
                disabled={areasLoading}
              >
                <option value="">Select Area</option>
                {areas.map((area) => (
                  <option key={area.areaId} value={area.areaId}>
                    {area.areaName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              style={styles.input}
              placeholder="Optional - auto-generated if empty"
            />
          </div>

          {/* ⭐ Conditionally show Bedrooms, Bathrooms, Balconies */}
          {!isPlotOrLandOrVilla && (
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Bedrooms *</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  style={styles.input}
                  min="0"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Bathrooms *</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  style={styles.input}
                  min="0"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Balconies</label>
                <input
                  type="number"
                  name="balconies"
                  value={formData.balconies}
                  onChange={handleChange}
                  style={styles.input}
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Area (Sqft) & Price */}
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Area (Sqft)</label>
              <input
                type="number"
                name="areaSqft"
                value={formData.areaSqft}
                onChange={handleChange}
                style={styles.input}
                min="0"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handlePriceChange}
                style={styles.input}
                required
                min="0"
              />
            </div>
          </div>

          {/* Price in Words */}
          {priceInWords && (
            <div style={styles.priceInWords}>
              <strong>In Words:</strong> {priceInWords}
            </div>
          )}

          {/* Owner Type & Status */}
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Owner Type</label>
              <select
                name="ownerType"
                value={formData.ownerType}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="owner">Owner</option>
                <option value="builder">Builder</option>
                <option value="agent">Agent</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isReadyToMove"
                checked={formData.isReadyToMove}
                onChange={handleChange}
              />
              Ready to Move
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isVerified"
                checked={formData.isVerified}
                onChange={handleChange}
              />
              Verified
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
              />
              Featured
            </label>
          </div>

          {/* Amenities */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Amenities</label>
            <div style={styles.amenitiesGrid}>
              {commonAmenities.map((amenity) => (
                <label key={amenity} style={styles.amenityLabel}>
                  <input
                    type="checkbox"
                    checked={formData.amenities?.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={styles.textarea}
              rows="4"
              required
            />
          </div>

          {/* Image Management */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Property Images (Max 10)</label>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div style={styles.imageSection}>
                <h4 style={styles.sectionTitle}>Existing Images</h4>
                <div style={styles.imagesGrid}>
                  {existingImages.map((img) => (
                    <div key={img.imageId} style={styles.imageCard}>
                      <img
                        src={img.imageUrl}
                        alt="Property"
                        style={styles.imagePreview}
                      />
                      <div style={styles.imageActions}>
                        {img.isPrimary && (
                          <span style={styles.primaryBadge}>Primary</span>
                        )}
                        {!img.isPrimary && (
                          <button
                            type="button"
                            onClick={() => setPrimaryExistingImage(img.imageId)}
                            style={styles.setPrimaryBtn}
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => markExistingImageForDeletion(img.imageId)}
                          style={styles.deleteImgBtn}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Preview */}
            {selectedImages.length > 0 && (
              <div style={styles.imageSection}>
                <h4 style={styles.sectionTitle}>New Images to Upload</h4>
                <div style={styles.imagesGrid}>
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} style={styles.imageCard}>
                      <img
                        src={preview}
                        alt={`Preview ${idx + 1}`}
                        style={styles.imagePreview}
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        style={styles.deleteImgBtn}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            {existingImages.length + selectedImages.length < 10 && (
              <div style={styles.uploadSection}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                  id="property-images"
                />
                <label htmlFor="property-images" style={styles.uploadButton}>
                  📷 Add More Images
                </label>
              </div>
            )}

            {/* Upload Progress */}
            {imageUploading && (
              <div style={styles.uploadProgress}>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${uploadProgress}%`,
                    }}
                  />
                </div>
                <span>Uploading: {uploadProgress}%</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading || imageUploading}
            >
              {loading ? "Updating..." : "Update Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    maxWidth: "900px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "2px solid #e5e7eb",
    position: "sticky",
    top: 0,
    backgroundColor: "white",
    zIndex: 1,
  },
  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "28px",
    cursor: "pointer",
    color: "#64748b",
    padding: "0",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    padding: "24px",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #fecaca",
  },
  formGroup: {
    marginBottom: "20px",
    flex: 1,
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#1e293b",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "white",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    resize: "vertical",
    fontFamily: "inherit",
  },
  row: {
    display: "flex",
    gap: "16px",
  },
  priceInWords: {
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "13px",
    color: "#166534",
  },
  checkboxGroup: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#1e293b",
    cursor: "pointer",
  },
  amenitiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "12px",
    marginTop: "8px",
  },
  amenityLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#1e293b",
    cursor: "pointer",
  },
  imageSection: {
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "12px",
  },
  imagesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "12px",
  },
  imageCard: {
    position: "relative",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
  },
  imagePreview: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
  },
  imageActions: {
    padding: "8px",
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    backgroundColor: "white",
  },
  primaryBadge: {
    backgroundColor: "#10b981",
    color: "white",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "600",
  },
  setPrimaryBtn: {
    flex: 1,
    padding: "4px 8px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
  },
  deleteImgBtn: {
    flex: 1,
    padding: "4px 8px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
  },
  uploadSection: {
    marginTop: "12px",
  },
  uploadButton: {
    display: "inline-block",
    padding: "12px 24px",
    backgroundColor: "#3b82f6",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "center",
  },
  uploadProgress: {
    marginTop: "12px",
  },
  progressBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "#e2e8f0",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    transition: "width 0.3s",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "2px solid #e5e7eb",
  },
  cancelButton: {
    flex: 1,
    padding: "12px 24px",
    backgroundColor: "#e2e8f0",
    color: "#1e293b",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  submitButton: {
    flex: 1,
    padding: "12px 24px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default AdminPropertyEditModal;
