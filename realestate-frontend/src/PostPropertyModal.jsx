// realestate-frontend/src/PostPropertyModal.jsx
// ⭐ ENHANCED VERSION - Includes user selection for Agents/Admins

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext.jsx";
import { BACKEND_BASE_URL } from "./config/config";
import UserCreationModal from "./components/UserCreationModal";

function PostPropertyModal({ onClose, onPropertyPosted }) {
  const { user, isAuthenticated } = useAuth();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [areasLoading, setAreasLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [priceInWords, setPriceInWords] = useState("");

  // ⭐ NEW: User selection state for agents/admins
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserCreation, setShowUserCreation] = useState(false);

  // ⭐ State for multiple images
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
    "Parking", "Gym", "Swimming Pool", "Security", "Lift", "Power Backup",
    "Club House", "Park", "Intercom", "Visitor Parking", "Rainwater Harvesting",
    "24/7 Water Supply", "Community Hall",
  ];

  // ⭐ Check if user is Agent or Admin
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

  // ⭐ NEW: Load users for agent/admin to select from
  useEffect(() => {
    if (isAgentOrAdmin) {
      loadUsers();
    }
  }, [isAgentOrAdmin]);

  const loadAreas = async () => {
    setAreasLoading(true);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/areas?city=Hyderabad`);
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

  // ⭐ NEW: Load users for selection
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
          const regularUsers = data.data.filter(u => u.role === "USER");
          setUsers(regularUsers);
        }
      }
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  // ⭐ NEW: Handle user creation callback
  const handleUserCreated = (newUser) => {
    setUsers((prev) => [...prev, newUser]);
    setSelectedUserId(newUser.id);
    setShowUserCreation(false);
    alert(`✅ User created: ${newUser.firstName} ${newUser.lastName}\nEmail: ${newUser.email}\nPassword: ${newUser.temporaryPassword}`);
  };

  const convertToIndianWords = (numStr) => {
    const num = Number(numStr);
    if (!numStr || isNaN(num) || num <= 0) return "";
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
      "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
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

  // ⭐ Handle multiple image selection
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

    setSelectedImages(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    console.log(`📸 ${validFiles.length} image(s) selected. Total: ${selectedImages.length + validFiles.length}`);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
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
        ? prev.amenities.split(",").map((a) => a.trim()).filter((a) => a.length > 0)
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
    let processedValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (name === "price") {
      setPriceInWords(convertToIndianWords(processedValue));
    }
    setError(null);
  };

  // ⭐ FIXED: Upload images to S3 with propertyId
  const uploadImagesToS3 = async (propertyId) => {
    console.log(`🚀 Starting upload of ${selectedImages.length} images for property ${propertyId}`);
    const uploadedUrls = [];

    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i];
      const formDataImage = new FormData();
      formDataImage.append("file", file);
      formDataImage.append("propertyId", propertyId);

      console.log(`📤 Uploading image ${i + 1}/${selectedImages.length}: ${file.name}`);
      setUploadProgress(Math.round(((i + 1) / selectedImages.length) * 100));

      try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/upload/property-image`, {
          method: "POST",
          body: formDataImage,
        });

        const data = await response.json();

        if (data.success && data.url) {
          uploadedUrls.push(data.url);
          console.log(`✅ Image ${i + 1} uploaded: ${data.url}`);
        } else {
          throw new Error(data.message || "Upload failed");
        }
      } catch (err) {
        console.error(`❌ Error uploading image ${i + 1}:`, err);
        throw new Error(`Failed to upload image ${i + 1}: ${err.message}`);
      }
    }

    console.log(`✅ All ${uploadedUrls.length} images uploaded successfully`);
    return uploadedUrls;
  };

  // ⭐ Save image URLs to database
  const saveImageUrlsToDatabase = async (propertyId, imageUrls) => {
    console.log(`💾 Saving ${imageUrls.length} image URLs to database for property ${propertyId}`);

    const imageRequests = imageUrls.map((url, index) => ({
      imageUrl: url,
      isPrimary: index === 0,
      displayOrder: index,
    }));

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/property-images/property/${propertyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imageRequests),
      });

      if (!response.ok) {
        throw new Error("Failed to save images to database");
      }

      const savedImages = await response.json();
      console.log(`✅ ${savedImages.length} images saved to database`);
      return savedImages;
    } catch (err) {
      console.error("❌ Error saving images to database:", err);
      throw err;
    }
  };

  // ⭐ FIXED: Submit handler with correct flow
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // ⭐ Validate user selection for agents/admins
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
      // Step 1: Create property WITHOUT images
      console.log("📝 Step 1: Creating property...");

      // ⭐ Use selected user ID for agents/admins, own ID for regular users
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
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        balconies: parseInt(formData.balconies) || 0,
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

      const propertyResponse = await fetch(`${BACKEND_BASE_URL}/api/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(propertyPayload),
      });

      if (!propertyResponse.ok) {
        const errorText = await propertyResponse.text();
        throw new Error(errorText || "Failed to create property");
      }

      const result = await propertyResponse.json();
      const propertyId = result.data ? result.data.id : result.id;
      console.log(`✅ Property created with ID: ${propertyId}`);

      // Step 2: Upload images to S3
      console.log("📤 Step 2: Uploading images to S3...");
      const uploadedImageUrls = await uploadImagesToS3(propertyId);

      // Step 3: Save image URLs to database
      console.log("💾 Step 3: Saving image URLs to database...");
      await saveImageUrlsToDatabase(propertyId, uploadedImageUrls);

      // Step 4: Update property with primary image URL
      console.log("🔄 Step 4: Updating property with primary image...");
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

      console.log("🎉 Property posted successfully with all images!");
      alert(`Property posted successfully with ${uploadedImageUrls.length} images!`);

      if (onPropertyPosted) onPropertyPosted();
      onClose();

    } catch (err) {
      console.error("❌ Error posting property:", err);
      setError(err.message || "Failed to post property");
      alert(`Failed to post property: ${err.message}`);
    } finally {
      setLoading(false);
      setImageUploading(false);
      setUploadProgress(0);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div style={styles.backdrop} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
          <h2 style={{ color: "#dc3545", textAlign: "center" }}>Please Login First</h2>
          <p style={{ textAlign: "center" }}>You need to be logged in to post a property.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={styles.backdrop} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
          <h2 style={styles.title}>🏡 Post New Property</h2>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* ⭐ NEW: User selection for Agents/Admins */}
            {isAgentOrAdmin && (
              <div style={styles.userSelectionSection}>
                <div style={styles.userSelectionHeader}>
                  <label style={styles.requiredLabel}>
                    <span style={{ color: "#dc3545" }}>*</span> Select Property Owner
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUserCreation(true)}
                    style={styles.createUserButton}
                  >
                    + Create New User
                  </button>
                </div>
                <p style={styles.infoText}>
                  As an {user?.role?.toLowerCase()}, you need to select which user this property belongs to.
                </p>
                <select
                  value={selectedUserId || ""}
                  onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : null)}
                  style={styles.select}
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
            <div style={styles.field}>
              <label style={styles.label}>Property Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Spacious 2BHK Apartment"
                style={styles.input}
                required
              />
            </div>

            {/* Property Type & Listing Type */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Property Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  style={styles.select}
                  required
                >
                  <option value="Apartment">🏢 Apartment</option>
                  <option value="Villa">🏡 Villa</option>
                  <option value="Independent House">🏠 Independent House</option>
                  <option value="Plot">📍 Plot</option>
                  <option value="Commercial">🏪 Commercial</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Listing Type *</label>
                <select
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleChange}
                  style={styles.select}
                  required
                >
                  <option value="sale">🏘️ For Sale</option>
                  <option value="rent">🔑 For Rent</option>
                </select>
              </div>
            </div>

            {/* Posted By */}
            <div style={styles.field}>
              <label style={styles.label}>👤 Posted By *</label>
              <select
                name="ownerType"
                value={formData.ownerType}
                onChange={handleChange}
                style={styles.select}
                required
              >
                <option value="owner">Owner</option>
                <option value="broker">Broker</option>
              </select>
            </div>

            {/* City & Area */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  readOnly
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>
                  📍 Area * ({areas.length} available)
                </label>
                <select
                  name="areaId"
                  value={formData.areaId}
                  onChange={handleChange}
                  style={styles.select}
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
            <div style={styles.field}>
              <label style={styles.label}>Complete Address (Optional)</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House/Plot number, Street name"
                style={styles.input}
              />
            </div>

            {/* Ready to Move Checkbox */}
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isReadyToMove"
                checked={formData.isReadyToMove}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <span style={styles.checkboxText}>✅ Ready to Move</span>
            </label>

            {/* ⭐ Multiple Image Upload Section */}
            <div style={styles.imageSection}>
              <label style={styles.label}>📷 Upload Property Images * (Max 10)</label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={styles.fileInput}
              />

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div style={styles.imagePreviewContainer}>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} style={styles.imagePreviewWrapper}>
                      <img src={preview} alt={`Preview ${index + 1}`} style={styles.imagePreview} />

                      {index === 0 && (
                        <div style={styles.primaryBadge}>Primary</div>
                      )}

                      <div style={styles.imageControls}>
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(index)}
                            style={styles.setPrimaryBtn}
                            title="Set as primary image"
                          >
                            ⭐ Set Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          style={styles.removeImageBtn}
                          title="Remove image"
                        >
                          ❌ Remove
                        </button>
                      </div>

                      <div style={styles.imageNumber}>{index + 1}</div>
                    </div>
                  ))}
                </div>
              )}

              {selectedImages.length > 0 && (
                <p style={styles.imageCount}>
                  {selectedImages.length} image(s) selected (First image will be the primary image)
                </p>
              )}

              {imageUploading && (
                <div style={styles.progressContainer}>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${uploadProgress}%` }} />
                  </div>
                  <p style={styles.progressText}>Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div style={styles.field}>
              <label style={styles.label}>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your property..."
                style={{ ...styles.input, minHeight: "100px", resize: "vertical" }}
                required
              />
            </div>

            {/* Bedrooms, Bathrooms, Balconies */}
            <div style={styles.row3}>
              <div style={styles.field}>
                <label style={styles.label}>🛏️ Bedrooms *</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  style={styles.input}
                  placeholder="2"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>🚿 Bathrooms *</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  style={styles.input}
                  placeholder="2"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>🏠 Balconies</label>
                <input
                  type="number"
                  name="balconies"
                  value={formData.balconies}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  style={styles.input}
                  placeholder="1"
                />
              </div>
            </div>

            {/* Area & Price */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>📐 Area (sqft)</label>
                <input
                  type="number"
                  name="areaSqft"
                  value={formData.areaSqft}
                  onChange={handleChange}
                  placeholder="1200"
                  style={styles.input}
                  max="9999"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>💰 Expected Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handlePriceChange}
                  placeholder="e.g..,5000000"
                  style={styles.input}
                  required
                  max="1.0e+09"
                />
                {priceInWords && <p style={styles.priceInWords}>{priceInWords}</p>}
              </div>
            </div>

            {/* Amenities */}
            <div style={styles.field}>
              <label style={styles.label}>✨ Amenities</label>
              <div style={styles.amenitiesGrid}>
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
                      style={{
                        ...styles.amenityBtn,
                        backgroundColor: isSelected ? "#10b981" : "#f1f5f9",
                        color: isSelected ? "white" : "#475569",
                        borderColor: isSelected ? "#059669" : "#e2e8f0",
                      }}
                    >
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || imageUploading || (isAgentOrAdmin && !selectedUserId)}
              style={{
                ...styles.submitBtn,
                opacity: loading || imageUploading ? 0.6 : 1,
                cursor: loading || imageUploading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "⏳ Posting..." : imageUploading ? "⏳ Uploading..." : "📤 Post Property"}
            </button>

            <p style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af", margin: "8px 0 0 0" }}>
              * Required fields
            </p>
          </form>
        </div>
      </div>

      {/* ⭐ NEW: User Creation Modal */}
      {showUserCreation && (
        <UserCreationModal
          onClose={() => setShowUserCreation(false)}
          onUserCreated={handleUserCreated}
        />
      )}
    </>
  );
}

const styles = {
  backdrop: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(0, 0, 0, 0.75)", display: "flex", justifyContent: "center",
    alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)",
  },
  modal: {
    background: "white", padding: "2rem", borderRadius: "16px", width: "750px",
    maxHeight: "90vh", overflowY: "auto", position: "relative",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  closeBtn: {
    position: "absolute", top: "15px", right: "15px", background: "#ef4444",
    color: "white", border: "none", fontSize: "24px", cursor: "pointer",
    width: "40px", height: "40px", borderRadius: "8px", display: "flex",
    alignItems: "center", justifyContent: "center", fontWeight: "bold",
  },
  title: {
    textAlign: "center", marginBottom: "1rem", fontSize: "28px",
    color: "#1e293b", fontWeight: "800",
  },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  field: { display: "flex", flexDirection: "column" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" },
  label: {
    marginBottom: "6px", fontWeight: "700", fontSize: "14px", color: "#1e293b",
  },
  checkboxLabel: {
    display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
    background: "#f0f9ff", borderRadius: "8px", cursor: "pointer",
    border: "2px solid #bfdbfe",
  },
  checkbox: { width: "20px", height: "20px", cursor: "pointer" },
  checkboxText: { fontSize: "14px", fontWeight: "600", color: "#1e40af" },
  input: {
    padding: "12px 16px", border: "2px solid #e2e8f0", borderRadius: "8px",
    fontSize: "14px", fontFamily: "inherit", transition: "border-color 0.3s",
  },
  select: {
    padding: "12px 16px", border: "2px solid #e2e8f0", borderRadius: "8px",
    fontSize: "14px", cursor: "pointer", fontFamily: "inherit", backgroundColor: "white",
  },
  imageSection: {
    padding: "16px", borderRadius: "12px", background: "#f8fafc",
    border: "2px dashed #cbd5e1",
  },
  fileInput: {
    padding: "12px", border: "2px solid #e2e8f0", borderRadius: "8px",
    backgroundColor: "white", cursor: "pointer", width: "100%",
    fontSize: "14px",
  },
  imagePreviewContainer: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "12px", marginTop: "16px",
  },
  imagePreviewWrapper: {
    position: "relative", borderRadius: "8px", overflow: "hidden",
    border: "2px solid #e2e8f0", backgroundColor: "white",
  },
  imagePreview: {
    width: "100%", height: "150px", objectFit: "cover", display: "block",
  },
  imageControls: {
    position: "absolute", bottom: "0", left: "0", right: "0",
    background: "rgba(0, 0, 0, 0.7)", padding: "8px",
    display: "flex", gap: "4px", justifyContent: "center",
  },
  setPrimaryBtn: {
    padding: "4px 8px", fontSize: "11px", background: "#10b981",
    color: "white", border: "none", borderRadius: "4px", cursor: "pointer",
    fontWeight: "600",
  },
  removeImageBtn: {
    padding: "4px 8px", fontSize: "11px", background: "#ef4444",
    color: "white", border: "none", borderRadius: "4px", cursor: "pointer",
    fontWeight: "600",
  },
  primaryBadge: {
    position: "absolute", top: "8px", left: "8px", background: "#10b981",
    color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "11px",
    fontWeight: "700", boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
  imageNumber: {
    position: "absolute", top: "8px", right: "8px", background: "rgba(0, 0, 0, 0.7)",
    color: "white", width: "24px", height: "24px", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "12px", fontWeight: "700",
  },
  imageCount: {
    marginTop: "12px", fontSize: "13px", color: "#64748b",
    textAlign: "center", fontWeight: "600",
  },
  progressContainer: { marginTop: "12px" },
  progressBar: {
    width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%", background: "linear-gradient(90deg, #10b981, #059669)",
    transition: "width 0.3s ease",
  },
  progressText: {
    textAlign: "center", fontSize: "12px", color: "#64748b",
    marginTop: "4px", fontWeight: "600",
  },
  error: {
    background: "#fee2e2", border: "2px solid #fecaca", borderRadius: "8px",
    padding: "12px", marginBottom: "1rem", textAlign: "center",
    color: "#dc3545", fontWeight: "600", fontSize: "14px",
  },
  submitBtn: {
    padding: "16px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white", border: "none", borderRadius: "10px", fontSize: "16px",
    fontWeight: "700", cursor: "pointer", marginTop: "1rem",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
  },
  priceInWords: {
    margin: "6px 0 0 4px", fontSize: "12px", color: "#64748b", fontStyle: "italic",
  },
  amenitiesGrid: {
    display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px",
  },
  amenityBtn: {
    padding: "8px 16px", borderRadius: "20px", border: "1px solid",
    cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.2s",
  },
  userSelectionSection: {
    backgroundColor: "#f0f9ff", padding: "16px", borderRadius: "12px",
    marginBottom: "16px", border: "2px solid #bfdbfe",
  },
  userSelectionHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "10px",
  },
  requiredLabel: {
    fontSize: "14px", fontWeight: "700", color: "#1e293b",
  },
  createUserButton: {
    padding: "8px 16px", backgroundColor: "#10b981", color: "white",
    border: "none", borderRadius: "6px", cursor: "pointer",
    fontSize: "13px", fontWeight: "600",
  },
  infoText: {
    fontSize: "13px", color: "#64748b", marginBottom: "12px",
  },
};

export default PostPropertyModal;
