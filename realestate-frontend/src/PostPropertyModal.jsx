// realestate-frontend/src/PostPropertyModal.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext.jsx";
import { BACKEND_BASE_URL } from "./config/config";
import UserCreationModal from "./components/UserCreationModal";
import "./PostPropertyModal.css";

function PostPropertyModal({ onClose, onPropertyPosted }) {
  const { user, isAuthenticated } = useAuth();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [areasLoading, setAreasLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [priceInWords, setPriceInWords] = useState("");

  // User selection for agents/admins
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserCreation, setShowUserCreation] = useState(false);

  // Multiple images
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    type: "Apartment",
    listingType: "sale",
    city: "Hyderabad",
    areaId: "",
    address: "",
    imageUrl: "",
    bedrooms: "",
    bathrooms: "",
    balconies: "",
    areaSqft: "",
    price: "",
    amenities: "",
    description: "",
    ownerType: "owner",
    isReadyToMove: false,
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

  const isPlotOrLandOrVilla =
    formData.type?.toLowerCase() === "plot" ||
    formData.type?.toLowerCase() === "land" ||
    formData.type?.toLowerCase() === "villa";

  const isAgentOrAdmin = user?.role === "AGENT" || user?.role === "ADMIN";

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    loadAreas();
  }, []);

  useEffect(() => {
    if (isAgentOrAdmin) {
      loadUsers();
    }
  }, [isAgentOrAdmin]);

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

  const loadUsers = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const regularUsers = data.data.filter((u) => u.role === "USER");
          setUsers(regularUsers);
        }
      }
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const handleUserCreated = (newUser) => {
    setUsers((prev) => [...prev, newUser]);
    setSelectedUserId(newUser.id);
    setShowUserCreation(false);
    alert(
      `✅ User created: ${newUser.firstName} ${newUser.lastName}\nEmail: ${newUser.email}\nPassword: ${newUser.temporaryPassword}`
    );
  };

  const convertToIndianWords = (numStr) => {
    const num = Number(numStr);
    if (!numStr || isNaN(num) || num <= 0) return "";
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
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

  const handlePriceChange = (e) => {
    const priceValue = e.target.value;
    setFormData((prev) => ({ ...prev, price: priceValue }));
    setPriceInWords(priceValue ? convertToIndianWords(priceValue) : "");
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (selectedImages.length + files.length > 10) {
      alert("You can upload maximum 10 images");
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

    setSelectedImages((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const setPrimaryImage = (index) => {
    if (index === 0) return;
    const newImages = [...selectedImages];
    const newPreviews = [...imagePreviews];
    [newImages[0], newImages[index]] = [newImages[index], newImages[0]];
    [newPreviews[0], newPreviews[index]] = [newPreviews[index], newPreviews[0]];
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleAmenityChange = (amenity) => {
    setFormData((prev) => {
      const amenitiesArray = prev.amenities
        ? prev.amenities
            .split(",")
            .map((a) => a.trim())
            .filter((a) => a.length > 0)
        : [];
      const index = amenitiesArray.indexOf(amenity);
      if (index > -1) {
        amenitiesArray.splice(index, 1);
      } else {
        amenitiesArray.push(amenity);
      }
      return { ...prev, amenities: amenitiesArray.join(", ") };
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const processedValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (name === "price") {
      setPriceInWords(convertToIndianWords(processedValue));
    }
    setError(null);
  };

  const uploadImagesToS3 = async (propertyId) => {
    const uploadedUrls = [];

    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i];
      const formDataImage = new FormData();
      formDataImage.append("file", file);
      formDataImage.append("propertyId", propertyId);

      setUploadProgress(Math.round(((i + 1) / selectedImages.length) * 100));

      try {
        const response = await fetch(
          `${BACKEND_BASE_URL}/api/upload/property-image`,
          {
            method: "POST",
            body: formDataImage,
          }
        );

        const data = await response.json();

        if (data.success && data.url) {
          uploadedUrls.push(data.url);
        } else {
          throw new Error(data.message || "Upload failed");
        }
      } catch (err) {
        throw new Error(`Failed to upload image ${i + 1}: ${err.message}`);
      }
    }

    return uploadedUrls;
  };

  const saveImageUrlsToDatabase = async (propertyId, imageUrls) => {
    const imageRequests = imageUrls.map((url, index) => ({
      imageUrl: url,
      isPrimary: index === 0,
      displayOrder: index,
    }));

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/property-images/property/${propertyId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(imageRequests),
        }
      );

      if (!response.ok) throw new Error("Failed to save images to database");
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (isAgentOrAdmin && !selectedUserId) {
      alert("Please select a user to post this property under");
      return;
    }

    if (selectedImages.length === 0) {
      alert("Please select at least one image");
      return;
    }

    setLoading(true);
    setImageUploading(true);

    try {
      const ownerUserId = isAgentOrAdmin ? selectedUserId : user.id;

      const propertyPayload = {
        title: formData.title,
        type: formData.type,
        listingType: formData.listingType,
        city: formData.city,
        area: { id: parseInt(formData.areaId) },
        user: { id: ownerUserId },
        address: formData.address,
        imageUrl: "",
        priceDisplay: priceInWords,
        bedrooms: isPlotOrLandOrVilla ? 0 : parseInt(formData.bedrooms) || 0,
        bathrooms: isPlotOrLandOrVilla ? 0 : parseInt(formData.bathrooms) || 0,
        balconies: isPlotOrLandOrVilla ? 0 : parseInt(formData.balconies) || 0,
        areaSqft: parseFloat(formData.areaSqft) || 0,
        price: parseFloat(formData.price),
        amenities: formData.amenities,
        description: formData.description,
        ownerType: formData.ownerType,
        isReadyToMove: formData.isReadyToMove,
        status: "available",
        isFeatured: false,
        isActive: true,
        isVerified: false,
      };

      const propertyResponse = await fetch(
        `${BACKEND_BASE_URL}/api/properties`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(propertyPayload),
        }
      );

      if (!propertyResponse.ok) {
        const errorText = await propertyResponse.text();
        throw new Error(errorText || "Failed to create property");
      }

      const result = await propertyResponse.json();
      const propertyId = result.data ? result.data.id : result.id;

      const uploadedImageUrls = await uploadImagesToS3(propertyId);
      await saveImageUrlsToDatabase(propertyId, uploadedImageUrls);

      const updatedProperty = result.data || result;
      await fetch(`${BACKEND_BASE_URL}/api/properties/${propertyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          ...updatedProperty,
          imageUrl: uploadedImageUrls[0],
        }),
      });

      alert(
        `Property posted successfully with ${uploadedImageUrls.length} images!`
      );
      onPropertyPosted && onPropertyPosted();
      onClose && onClose();
    } catch (err) {
      setError(err.message || "Failed to post property");
      alert(`Failed to post property: ${err.message}`);
    } finally {
      setLoading(false);
      setImageUploading(false);
      setUploadProgress(0);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("ppm-backdrop")) {
      onClose && onClose();
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="ppm-backdrop" onClick={handleBackdropClick}>
        <div className="ppm-modal auth-required">
          <button className="ppm-close" onClick={onClose}>
            ×
          </button>
          <h2 className="ppm-auth-title">Please Login First</h2>
          <p className="ppm-auth-text">
            You need to be logged in to post a property.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="ppm-backdrop"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ppm-title"
      >
        <div className="ppm-modal" onClick={(e) => e.stopPropagation()}>
          <button className="ppm-close" onClick={onClose} aria-label="Close">
            ×
          </button>
          <h2 id="ppm-title" className="ppm-title">
            🏡 Post New Property
          </h2>

          {error && <div className="ppm-alert">{error}</div>}

          <form onSubmit={handleSubmit} className="ppm-form">
            {/* User selection for agents/admins */}
            {isAgentOrAdmin && (
              <div className="ppm-user-section">
                <div className="ppm-user-header">
                  <label className="ppm-label required">
                    Select Property Owner
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUserCreation(true)}
                    className="ppm-btn ppm-btn-small"
                  >
                    + Create New User
                  </button>
                </div>
                <p className="ppm-info">
                  As an {user?.role?.toLowerCase()}, you need to select which
                  user this property belongs to.
                </p>
                <select
                  value={selectedUserId || ""}
                  onChange={(e) =>
                    setSelectedUserId(
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="ppm-select"
                  required
                >
                  <option value="">-- Select User --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Title */}
            <div className="ppm-field">
              <label className="ppm-label">Property Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Spacious 2BHK Apartment"
                className="ppm-input"
                required
              />
            </div>

            {/* Property Type & Listing Type */}
            <div className="ppm-row">
              <div className="ppm-field">
                <label className="ppm-label">Property Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="ppm-select"
                  required
                >
                  <option value="Apartment">🏢 Apartment</option>
                  <option value="Villa">🏡 Villa</option>
                  <option value="Independent House">
                    🏠 Independent House
                  </option>
                  <option value="Plot">📍 Plot</option>
                  <option value="Commercial">🏪 Commercial</option>
                </select>
              </div>
              <div className="ppm-field">
                <label className="ppm-label">Listing Type *</label>
                <select
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleChange}
                  className="ppm-select"
                  required
                >
                  <option value="sale">🏘️ For Sale</option>
                  <option value="rent">🔑 For Rent</option>
                </select>
              </div>
            </div>

            {/* Posted By */}
            <div className="ppm-field">
              <label className="ppm-label">👤 Posted By *</label>
              <select
                name="ownerType"
                value={formData.ownerType}
                onChange={handleChange}
                className="ppm-select"
                required
              >
                <option value="owner">Owner</option>
                <option value="broker">Broker</option>
              </select>
            </div>

            {/* City & Area */}
            <div className="ppm-row">
              <div className="ppm-field">
                <label className="ppm-label">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  readOnly
                  className="ppm-input readonly"
                />
              </div>
              <div className="ppm-field">
                <label className="ppm-label">
                  📍 Area * ({areas.length} available)
                </label>
                <select
                  name="areaId"
                  value={formData.areaId}
                  onChange={handleChange}
                  className="ppm-select"
                  required
                  disabled={areasLoading}
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

            {/* Address */}
            <div className="ppm-field">
              <label className="ppm-label">Complete Address (Optional)</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House/Plot number, Street name"
                className="ppm-input"
              />
            </div>

            {/* Ready to Move */}
            <label className="ppm-checkbox">
              <input
                type="checkbox"
                name="isReadyToMove"
                checked={formData.isReadyToMove}
                onChange={handleChange}
              />
              <span className="ppm-checkbox-text">✅ Ready to Move</span>
            </label>

            {/* Multiple Image Upload */}
            <div className="ppm-images">
              <label className="ppm-label">
                📷 Upload Property Images * (Max 10)
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="ppm-file"
              />

              {imagePreviews.length > 0 && (
                <div className="ppm-previews">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="ppm-preview-wrap">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="ppm-preview"
                      />

                      {index === 0 && (
                        <div className="ppm-primary">Primary</div>
                      )}

                      <div className="ppm-controls">
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(index)}
                            className="ppm-control ppm-control-primary"
                            title="Set as primary image"
                          >
                            ⭐
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="ppm-control ppm-control-remove"
                          title="Remove image"
                        >
                          ❌
                        </button>
                      </div>

                      <div className="ppm-num">{index + 1}</div>
                    </div>
                  ))}
                </div>
              )}

              {selectedImages.length > 0 && (
                <p className="ppm-img-count">
                  {selectedImages.length} image(s) selected (First image will be
                  the primary image)
                </p>
              )}

              {imageUploading && (
                <div className="ppm-progress">
                  <div className="ppm-progress-bar">
                    <div
                      className="ppm-progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="ppm-progress-text">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="ppm-field">
              <label className="ppm-label">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your property..."
                className="ppm-textarea"
                required
              />
            </div>

            {/* Bedrooms, Bathrooms, Balconies (not for plots/land/villa) */}
            {!isPlotOrLandOrVilla && (
              <div className="ppm-row3">
                <div className="ppm-field">
                  <label className="ppm-label">🛏️ Bedrooms *</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    min="0"
                    max="10"
                    className="ppm-input"
                    placeholder="2"
                    required
                    inputMode="numeric"
                  />
                </div>
                <div className="ppm-field">
                  <label className="ppm-label">🚿 Bathrooms *</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    min="0"
                    max="10"
                    className="ppm-input"
                    placeholder="2"
                    required
                    inputMode="numeric"
                  />
                </div>
                <div className="ppm-field">
                  <label className="ppm-label">🏠 Balconies</label>
                  <input
                    type="number"
                    name="balconies"
                    value={formData.balconies}
                    onChange={handleChange}
                    min="0"
                    max="10"
                    className="ppm-input"
                    placeholder="1"
                    inputMode="numeric"
                  />
                </div>
              </div>
            )}

            {/* Area & Price */}
            <div className="ppm-row">
              <div className="ppm-field">
                <label className="ppm-label">📐 Area (sqft)</label>
                <input
                  type="number"
                  name="areaSqft"
                  value={formData.areaSqft}
                  onChange={handleChange}
                  placeholder="1200"
                  className="ppm-input"
                  max="9999"
                  inputMode="numeric"
                />
              </div>
              <div className="ppm-field">
                <label className="ppm-label">💰 Expected Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handlePriceChange}
                  placeholder="e.g., 5000000"
                  className="ppm-input"
                  required
                  max="1000000000"
                  inputMode="numeric"
                />
                {priceInWords && (
                  <p className="ppm-price-words">{priceInWords}</p>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div className="ppm-field">
              <label className="ppm-label">✨ Amenities</label>
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

            {/* Submit */}
            <button
              type="submit"
              disabled={
                loading || imageUploading || (isAgentOrAdmin && !selectedUserId)
              }
              className="ppm-submit"
            >
              {loading
                ? "⏳ Posting..."
                : imageUploading
                ? "⏳ Uploading..."
                : "📤 Post Property"}
            </button>

            <p className="ppm-required">* Required fields</p>
          </form>
        </div>
      </div>

      {showUserCreation && (
        <UserCreationModal
          onClose={() => setShowUserCreation(false)}
          onUserCreated={handleUserCreated}
        />
      )}
    </>
  );
}

export default PostPropertyModal;
