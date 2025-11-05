// realestate-frontend/src/PropertyEditModal.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext.jsx";
import { BACKEND_BASE_URL } from "./config/config";
import "./PropertyEditModal.css";

function PropertyEditModal({ property, onClose, onPropertyUpdated }) {
  const { user, isAuthenticated } = useAuth();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [areasLoading, setAreasLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    title: property?.title || "",
    type: property?.type || property?.propertyType || "Apartment",
    listingType: property?.listingType || "sale",
    city: property?.city || property?.cityName || "Hyderabad",
    areaId: property?.area?.areaId || "",
    address: property?.address || "",
    imageUrl: property?.imageUrl || "",
    bedrooms: property?.bedrooms ?? "",
    bathrooms: property?.bathrooms ?? "",
    balconies: property?.balconies ?? "",
    areaSqft: property?.areaSqft ?? "",
    price: property?.price ?? "",
    amenities: property?.amenities || "",
    description: property?.description || "",
    ownerType: property?.ownerType || "owner",
    isReadyToMove: !!property?.isReadyToMove,
    isVerified: !!property?.isVerified,
  });

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    setAreasLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/areas?city=Hyderabad`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setAreas(data.data);
        setError(null);
      } else {
        setError("Invalid response format");
      }
    } catch (err) {
      setError(`Failed to load areas: ${err.message}`);
      setAreas([]);
    } finally {
      setAreasLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="pem-backdrop" onClick={onClose}>
        <div className="pem-modal" onClick={(e) => e.stopPropagation()}>
          <button className="pem-close" onClick={onClose}>
            ×
          </button>
          <h2 className="pem-auth-title">Please Login First</h2>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large (max 10MB)");
      return;
    }

    setImageUploading(true);
    setUploadProgress(10);

    try {
      const propertyId = property.id || property.propertyId;
      if (!propertyId)
        throw new Error("Property ID is required for image upload");

      const fd = new FormData();
      fd.append("file", file);
      setUploadProgress(30);

      const res = await fetch(
        `${BACKEND_BASE_URL}/api/upload/property-image?propertyId=${propertyId}`,
        { method: "POST", body: fd }
      );
      setUploadProgress(70);

      if (!res.ok) {
        let msg = "";
        try {
          msg = (await res.json())?.message || "";
        } catch {}
        throw new Error(msg || `Upload failed: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.success && data.url) {
        setUploadProgress(100);
        setFormData((p) => ({ ...p, imageUrl: data.url }));
        setTimeout(() => setUploadProgress(0), 1200);
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (err) {
      alert("Upload failed: " + err.message);
      setUploadProgress(0);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (
      !formData.title ||
      !formData.areaId ||
      !formData.imageUrl ||
      formData.bedrooms === "" ||
      formData.bathrooms === "" ||
      !formData.price ||
      !formData.description
    ) {
      setError("Please fill all required fields marked with *");
      setLoading(false);
      return;
    }

    const numericPrice = Number(formData.price);
    if (!isFinite(numericPrice) || numericPrice <= 0) {
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
      (a) => String(a.areaId) === String(formData.areaId)
    );
    if (!selectedAreaObject) {
      setError("Invalid area selected. Please try again.");
      setLoading(false);
      return;
    }

    const propertyData = {
      title: formData.title,
      type: formData.type,
      city: formData.city,
      address:
        formData.address || `${selectedAreaObject.areaName}, ${formData.city}`,
      imageUrl: formData.imageUrl,
      description: formData.description,
      price: numericPrice,
      priceDisplay,
      areaSqft: formData.areaSqft ? Number(formData.areaSqft) : null,
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      balconies: formData.balconies ? Number(formData.balconies) : 0,
      amenities: formData.amenities || null,
      listingType: formData.listingType,
      status: "available",
      isFeatured: property?.isFeatured || false,
      isActive: true,
      ownerType: formData.ownerType,
      isReadyToMove: formData.isReadyToMove,
      isVerified: formData.isVerified || false,
      area: selectedAreaObject,
      user: { id: user.id },
    };

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/${
          property.id || property.propertyId
        }`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(propertyData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error("Failed to update property: " + errorText);
      }

      await response.json().catch(() => null);

      alert("✅ Property updated successfully!");
      onPropertyUpdated && onPropertyUpdated();
      onClose && onClose();
    } catch (err) {
      setError(err.message || "Failed to update property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("pem-backdrop")) {
      onClose && onClose();
    }
  };

  return (
    <div className="pem-backdrop" onClick={handleBackdropClick}>
      <div
        className="pem-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pem-title"
      >
        <button className="pem-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 id="pem-title" className="pem-title">
          ✏️ Edit Your Property
        </h2>

        {error && <div className="pem-alert">❌ {error}</div>}

        <form onSubmit={handleSubmit} className="pem-form">
          <div className="pem-field">
            <label className="pem-label">Property Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Spacious 2BHK Apartment"
              className="pem-input"
              required
            />
          </div>

          <div className="pem-row">
            <div className="pem-field">
              <label className="pem-label">Property Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="pem-select"
                required
              >
                <option>Apartment</option>
                <option>Villa</option>
                <option>House</option>
                <option>Plot</option>
                <option>Commercial</option>
                <option>Penthouse</option>
                <option>Studio</option>
                <option>Duplex</option>
              </select>
            </div>
            <div className="pem-field">
              <label className="pem-label">Listing Type *</label>
              <select
                name="listingType"
                value={formData.listingType}
                onChange={handleChange}
                className="pem-select"
                required
              >
                <option value="sale">🏠 For Sale</option>
                <option value="rent">🔑 For Rent</option>
              </select>
            </div>
          </div>

          <div className="pem-row">
            <div className="pem-field">
              <label className="pem-label">👤 Posted By *</label>
              <select
                name="ownerType"
                value={formData.ownerType}
                onChange={handleChange}
                className="pem-select"
                required
              >
                <option value="owner">Owner</option>
                <option value="broker">Broker/Agent</option>
              </select>
            </div>
            <div className="pem-field">
              <label className="pem-checkbox">
                <input
                  type="checkbox"
                  name="isReadyToMove"
                  checked={formData.isReadyToMove}
                  onChange={handleChange}
                />
                <span className="pem-checkbox-text">✅ Ready to Move</span>
              </label>
            </div>
          </div>

          {user && user.role === "ADMIN" && (
            <div className="pem-field">
              <label className="pem-checkbox">
                <input
                  type="checkbox"
                  name="isVerified"
                  checked={formData.isVerified}
                  onChange={handleChange}
                />
                <span className="pem-checkbox-text">
                  ✅ Verified Property (Admin Only)
                </span>
              </label>
            </div>
          )}

          <div className="pem-row">
            <div className="pem-field">
              <label className="pem-label">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="pem-input"
                required
              />
            </div>
            <div className="pem-field">
              <label className="pem-label">
                📍 Area *{" "}
                {areasLoading && <span className="pem-hint">(Loading...)</span>}
              </label>
              <select
                name="areaId"
                value={formData.areaId}
                onChange={handleChange}
                className="pem-select"
                required
                disabled={areasLoading || areas.length === 0}
              >
                <option value="">-- Select Area --</option>
                {areas.map((area) => (
                  <option key={area.areaId} value={area.areaId}>
                    {area.areaName} ({area.pincode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pem-field">
            <label className="pem-label">Complete Address (Optional)</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="House/Plot number, Street name"
              className="pem-input"
            />
          </div>

          <div className="pem-images">
            <h3 className="pem-images-title">📁 Property Image *</h3>

            {formData.imageUrl && (
              <div className="pem-image-preview-wrap">
                <img
                  src={formData.imageUrl}
                  alt="Current"
                  className="pem-image-preview"
                />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={imageUploading}
              className="pem-file"
            />

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
          </div>

          <div className="pem-field">
            <label className="pem-label">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your property..."
              className="pem-textarea"
              required
            />
          </div>

          <div className="pem-row3">
            <div className="pem-field">
              <label className="pem-label">🛏️ Bedrooms *</label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                min="0"
                max="20"
                className="pem-input"
                required
                inputMode="numeric"
              />
            </div>
            <div className="pem-field">
              <label className="pem-label">🚿 Bathrooms *</label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                min="0"
                max="20"
                className="pem-input"
                required
                inputMode="numeric"
              />
            </div>
            <div className="pem-field">
              <label className="pem-label">🏠 Balconies</label>
              <input
                type="number"
                name="balconies"
                value={formData.balconies}
                onChange={handleChange}
                min="0"
                max="10"
                className="pem-input"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="pem-row">
            <div className="pem-field">
              <label className="pem-label">📐 Area (sqft)</label>
              <input
                type="number"
                name="areaSqft"
                value={formData.areaSqft}
                onChange={handleChange}
                placeholder="1200"
                className="pem-input"
                inputMode="numeric"
              />
            </div>
            <div className="pem-field">
              <label className="pem-label">💰 Expected Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="5000000"
                className="pem-input"
                required
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="pem-field">
            <label className="pem-label">✨ Amenities (comma-separated)</label>
            <input
              type="text"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              placeholder="Parking, Gym, Swimming Pool"
              className="pem-input"
            />
          </div>

          <div className="pem-actions">
            <button
              type="button"
              onClick={onClose}
              className="pem-btn pem-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pem-btn pem-btn-primary"
              disabled={loading || imageUploading}
            >
              {loading ? "⏳ Updating..." : "✅ Update Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PropertyEditModal;
