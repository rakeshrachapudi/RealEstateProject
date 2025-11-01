// realestate-frontend/src/PostPropertyModal.jsx
// ⭐ ENHANCED VERSION - Includes user selection for Agents/Admins
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext.jsx";
import { BACKEND_BASE_URL } from "./config/config"; // Keep original working path
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
          // Filter to show only regular users (not agents/admins)
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
      const words = convertToIndianWords(priceValue);
      setPriceInWords(words);
    } else {
      setPriceInWords("");
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

  // Handle multiple image selection
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert("Please log in to post a property");
      return;
    }

    // ⭐ NEW: Validate user selection for agents/admins
    if (isAgentOrAdmin && !selectedUserId) {
      alert("Please select a user to post this property under");
      return;
    }

    if (!formData.areaId) {
      alert("Please select an area");
      return;
    }

    if (selectedImages.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    try {
      setLoading(true);
      setImageUploading(true);
      setUploadProgress(0);

      // Upload images to S3
      const uploadedImageUrls = [];
      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i];
        const formDataImage = new FormData();
        formDataImage.append("file", file);

        console.log(`📤 Uploading image ${i + 1}/${selectedImages.length}: ${file.name}`);

        const uploadResponse = await fetch(`${BACKEND_BASE_URL}/api/s3/upload-image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: formDataImage,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload image ${file.name}`);
        }

        const uploadResult = await uploadResponse.json();
        if (uploadResult.success && uploadResult.data) {
          uploadedImageUrls.push(uploadResult.data);
          console.log(`✅ Uploaded: ${uploadResult.data}`);
        } else {
          throw new Error(`Invalid response for image ${file.name}`);
        }

        setUploadProgress(((i + 1) / selectedImages.length) * 100);
      }

      setImageUploading(false);
      console.log(`✅ All ${uploadedImageUrls.length} images uploaded successfully`);

      // ⭐ NEW: Determine which user ID to use
      const ownerUserId = isAgentOrAdmin ? selectedUserId : user.id;

      // Prepare property data
      const propertyData = {
        ...formData,
        user: { id: ownerUserId }, // ⭐ Use selected user ID for agents, own ID for regular users
        area: { id: parseInt(formData.areaId) },
        price: parseFloat(formData.price) || 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        balconies: parseInt(formData.balconies) || 0,
        areaSqft: parseFloat(formData.areaSqft) || null,
        imageUrl: uploadedImageUrls[0], // Primary image
        isFeatured: false,
        isActive: true,
        isVerified: false,
        status: "available",
        priceDisplay: priceInWords,
      };

      console.log("📤 Posting property:", propertyData);

      const response = await fetch(`${BACKEND_BASE_URL}/api/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to post property");
      }

      const result = await response.json();
      console.log("✅ Property posted successfully:", result);

      alert("✅ Property posted successfully!");

      if (onPropertyPosted) onPropertyPosted();
      onClose();

    } catch (err) {
      console.error("❌ Error posting property:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
      setImageUploading(false);
    }
  };

  return (
    <>
      <div style={styles.backdrop} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} style={styles.closeBtn}>×</button>

          <h2 style={styles.title}>🏠 Post Property</h2>

          {/* ⭐ NEW: User Selection Section for Agents/Admins */}
          {isAgentOrAdmin && (
            <div style={styles.userSelectionBox}>
              <h3 style={styles.sectionTitle}>👤 Select Property Owner</h3>
              <p style={styles.helperText}>
                As an {user?.role?.toLowerCase()}, you need to select which user this property belongs to.
              </p>

              <div style={styles.userSelectRow}>
                <select
                  value={selectedUserId || ""}
                  onChange={(e) => setSelectedUserId(Number(e.target.value))}
                  style={styles.userSelect}
                  required
                >
                  <option value="">-- Select Property Owner --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} - {u.email} ({u.mobileNumber})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowUserCreation(true)}
                  style={styles.createUserBtn}
                >
                  ➕ Create New User
                </button>
              </div>

              {selectedUserId && (
                <div style={styles.selectedUserInfo}>
                  ✅ Property will be posted under:{" "}
                  <strong>
                    {users.find((u) => u.id === selectedUserId)?.firstName}{" "}
                    {users.find((u) => u.id === selectedUserId)?.lastName}
                  </strong>
                </div>
              )}
            </div>
          )}

          {error && (
            <div style={styles.errorBanner}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Basic Details */}
            <div style={styles.section}>
              <h3 style={styles.sectionHeader}>📝 Basic Details</h3>

              <div style={styles.formGroup}>
                <label style={styles.label}>Property Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  style={styles.input}
                  required
                  placeholder="e.g., 3 BHK Luxury Apartment in Banjara Hills"
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Property Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    style={styles.input}
                    required
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Independent House">Independent House</option>
                    <option value="Plot">Plot</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Listing Type *</label>
                  <select
                    value={formData.listingType}
                    onChange={(e) => setFormData({...formData, listingType: e.target.value})}
                    style={styles.input}
                    required
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Area *</label>
                  <select
                    value={formData.areaId}
                    onChange={(e) => setFormData({...formData, areaId: e.target.value})}
                    style={styles.input}
                    required
                    disabled={areasLoading}
                  >
                    <option value="">-- Select Area --</option>
                    {areas.map((area) => (
                      <option key={area.areaId} value={area.areaId}>
                        {area.areaName} - {area.pincode}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Owner Type *</label>
                  <select
                    value={formData.ownerType}
                    onChange={(e) => setFormData({...formData, ownerType: e.target.value})}
                    style={styles.input}
                  >
                    <option value="owner">Owner</option>
                    <option value="dealer">Dealer</option>
                    <option value="builder">Builder</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Complete Address *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  style={{...styles.input, minHeight: "80px", resize: "vertical"}}
                  required
                  placeholder="Enter complete property address"
                />
              </div>
            </div>

            {/* Property Specifications */}
            <div style={styles.section}>
              <h3 style={styles.sectionHeader}>📐 Property Specifications</h3>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Bedrooms *</label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                    style={styles.input}
                    min="0"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Bathrooms *</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                    style={styles.input}
                    min="0"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Balconies</label>
                  <input
                    type="number"
                    value={formData.balconies}
                    onChange={(e) => setFormData({...formData, balconies: e.target.value})}
                    style={styles.input}
                    min="0"
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Area (sqft) *</label>
                  <input
                    type="number"
                    value={formData.areaSqft}
                    onChange={(e) => setFormData({...formData, areaSqft: e.target.value})}
                    style={styles.input}
                    min="0"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={handlePriceChange}
                    style={styles.input}
                    min="0"
                    required
                  />
                </div>
              </div>

              {priceInWords && (
                <div style={styles.priceInWords}>
                  💰 {priceInWords}
                </div>
              )}

              <div style={styles.checkboxGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isReadyToMove}
                    onChange={(e) => setFormData({...formData, isReadyToMove: e.target.checked})}
                    style={styles.checkbox}
                  />
                  <span>Ready to Move</span>
                </label>
              </div>
            </div>

            {/* Images */}
            <div style={styles.section}>
              <h3 style={styles.sectionHeader}>📸 Property Images</h3>

              <div style={styles.imageUploadSection}>
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                <label htmlFor="imageUpload" style={styles.uploadButton}>
                  📁 Select Images (Max 10)
                </label>
                <p style={styles.uploadHint}>First image will be the primary image</p>
              </div>

              {imagePreviews.length > 0 && (
                <div style={styles.imagePreviewGrid}>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} style={styles.imagePreviewContainer}>
                      <img src={preview} alt={`Preview ${index + 1}`} style={styles.imagePreview} />
                      {index === 0 && (
                        <span style={styles.primaryBadge}>Primary</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={styles.removeImageBtn}
                      >
                        ×
                      </button>
                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(index)}
                          style={styles.setPrimaryBtn}
                        >
                          Set as Primary
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {imageUploading && (
                <div style={styles.uploadProgress}>
                  <div style={styles.progressBar}>
                    <div style={{...styles.progressFill, width: `${uploadProgress}%`}} />
                  </div>
                  <p style={styles.progressText}>Uploading... {Math.round(uploadProgress)}%</p>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div style={styles.section}>
              <h3 style={styles.sectionHeader}>✨ Amenities</h3>

              <div style={styles.amenitiesGrid}>
                {commonAmenities.map((amenity) => (
                  <label key={amenity} style={styles.amenityLabel}>
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                      style={styles.checkbox}
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={styles.section}>
              <h3 style={styles.sectionHeader}>📄 Description</h3>

              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                style={{...styles.input, minHeight: "120px", resize: "vertical"}}
                placeholder="Describe your property..."
              />
            </div>

            {/* Submit Button */}
            <div style={styles.buttonRow}>
              <button
                type="button"
                onClick={onClose}
                style={styles.cancelBtn}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={styles.submitBtn}
                disabled={loading || imageUploading || (isAgentOrAdmin && !selectedUserId)}
              >
                {loading ? "Posting..." : "📝 Post Property"}
              </button>
            </div>
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

// ==================== STYLES ====================
const styles = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "900px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "none",
    border: "none",
    fontSize: "32px",
    cursor: "pointer",
    color: "#64748b",
    lineHeight: 1,
    padding: "8px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "24px",
  },
  // ⭐ NEW: User Selection Styles
  userSelectionBox: {
    backgroundColor: "#f0f9ff",
    border: "2px solid #3b82f6",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "8px",
    marginTop: 0,
  },
  helperText: {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "16px",
  },
  userSelectRow: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  userSelect: {
    flex: 1,
    padding: "12px 16px",
    border: "2px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    outline: "none",
  },
  createUserBtn: {
    padding: "12px 20px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  selectedUserInfo: {
    marginTop: "12px",
    padding: "12px 16px",
    backgroundColor: "#d1fae5",
    border: "1px solid #6ee7b7",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#065f46",
  },
  errorBanner: {
    padding: "12px 16px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    color: "#dc2626",
    fontSize: "14px",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  section: {
    padding: "20px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  sectionHeader: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 0,
    marginBottom: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#475569",
  },
  input: {
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "border-color 0.2s",
    outline: "none",
  },
  priceInWords: {
    padding: "12px 16px",
    backgroundColor: "#fef3c7",
    border: "1px solid #fde047",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#92400e",
    fontWeight: "600",
  },
  checkboxGroup: {
    marginTop: "12px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  imageUploadSection: {
    textAlign: "center",
    padding: "20px",
    border: "2px dashed #cbd5e1",
    borderRadius: "8px",
    backgroundColor: "white",
  },
  uploadButton: {
    display: "inline-block",
    padding: "12px 24px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
  },
  uploadHint: {
    marginTop: "8px",
    fontSize: "12px",
    color: "#64748b",
  },
  imagePreviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "16px",
    marginTop: "16px",
  },
  imagePreviewContainer: {
    position: "relative",
    borderRadius: "8px",
    overflow: "hidden",
    border: "2px solid #e2e8f0",
  },
  imagePreview: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
  },
  primaryBadge: {
    position: "absolute",
    top: "8px",
    left: "8px",
    padding: "4px 8px",
    backgroundColor: "#10b981",
    color: "white",
    fontSize: "11px",
    fontWeight: "700",
    borderRadius: "4px",
  },
  removeImageBtn: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "24px",
    height: "24px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "18px",
    lineHeight: 1,
  },
  setPrimaryBtn: {
    position: "absolute",
    bottom: "8px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "4px 8px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
  },
  uploadProgress: {
    marginTop: "16px",
  },
  progressBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "#e2e8f0",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    transition: "width 0.3s",
  },
  progressText: {
    marginTop: "8px",
    fontSize: "14px",
    color: "#64748b",
    textAlign: "center",
  },
  amenitiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "12px",
  },
  amenityLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    padding: "8px 12px",
    backgroundColor: "white",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "24px",
  },
  cancelBtn: {
    padding: "12px 24px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "white",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  submitBtn: {
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
    transition: "transform 0.2s",
  },
};

export default PostPropertyModal;