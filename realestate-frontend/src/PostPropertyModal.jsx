// realestate-frontend/src/PostPropertyModal.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext.jsx";
import { BACKEND_BASE_URL } from "./config/config";
import UserCreationModal from "./components/UserCreationModal";
import "./PostPropertyModal.css";
import BrokerSubscriptionModal from "./components/BrokerSubscriptionModal";
// ⭐ NEW: Property type icons helper function
const getPropertyTypeIcon = (typeName) => {
  const icons = {
    Apartment: "🏢",
    Villa: "🏡",
    Plot: "📐",
    Land: "🌾",
    Office: "🏢",
    Shop: "🏪",
    Warehouse: "🏭",
    "Farm House": "🏡",
    Penthouse: "🌆",
    Studio: "🏠",
    "Independent House": "🏠",
    "Builder Floor": "🏢",
  };
  return icons[typeName] || "🏘️";
};
function PostPropertyModal({ onClose, onPropertyPosted }) {
  const { user, isAuthenticated } = useAuth();
  const authToken = localStorage.getItem("authToken");
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [areasLoading, setAreasLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [priceInWords, setPriceInWords] = useState("");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [currentBrokerId, setCurrentBrokerId] = useState(null);

  // ✅ NEW: Property Types State
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [propertyTypesLoading, setPropertyTypesLoading] = useState(true);

  const handleSubscriptionSuccess = (subscription) => {
    setShowSubscriptionModal(false);
    alert("✅ Subscription activated! You can now post properties.");
  };

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
    amenitiesSqft: "",
    price: "",
    pricePerSqft: "",
    amenities: "",
    description: "",
    ownerType: "owner",
    constructionStatus: "ready_to_move",
    possessionYear: "",
    possessionMonth: "",
    reraId: "",
    hmdaId: "",
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
  const isBroker = user?.role === "BROKER";

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    loadAreas();
    loadPropertyTypes(); // ✅ NEW: Load property types
  }, []);

  useEffect(() => {
    if (isAgentOrAdmin) {
      loadUsers();
    }
  }, [isAgentOrAdmin]);

  useEffect(() => {
    if (user?.role === "BROKER") {
      setFormData((prev) => ({ ...prev, ownerType: "broker" }));
    }
  }, [user]);

  // ✅ NEW: Load Property Types from Database

  const loadPropertyTypes = async () => {
    setPropertyTypesLoading(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/property-types`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      let typesRaw = [];
      if (data?.success && Array.isArray(data.data)) {
        typesRaw = data.data;
      } else if (Array.isArray(data)) {
        typesRaw = data;
      }
      const normalized = (typesRaw || [])
        .filter(Boolean)
        .map((t) => {
          const id = t.propertyTypeId ?? t.property_type_id ?? t.id ?? null;
          const name =
            t.typeName ??
            t.type_name ??
            t.name ??
            t.type ??
            (typeof t === "string" ? t : "");
          return { id, name };
        })
        .filter((t) => t.name && t.name.length > 0);
      setPropertyTypes(normalized);
      if (normalized.length > 0 && (!formData.type || formData.type === "")) {
        setFormData((prev) => ({ ...prev, type: normalized[0].name }));
      }
      setError(null);
    } catch (err) {
      console.error("Failed to load property types:", err);
      setError(`Failed to load property types: ${err.message}`);
      setPropertyTypes([]);
    } finally {
      setPropertyTypesLoading(false);
    }
  };

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
        const regularUsers = data.data.filter((u) => u.role === "USER");
        setUsers(regularUsers);
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

  const calculatePricePerSqft = (price, areaSqft) => {
    const p = Number(price);
    const a = Number(areaSqft);
    if (p > 0 && a > 0) {
      return Math.round(p / a);
    }
    return "";
  };

  const calculateTotalPrice = (
    pricePerSqft,
    areaSqft,
    amenitiesPrice = 0,
    propertyType = ""
  ) => {
    const ps = Number(pricePerSqft);
    const a = Number(areaSqft);
    const ap = Number(amenitiesPrice); // ⭐ Fixed amenities price

    if (ps > 0 && a > 0) {
      let totalPrice = ps * a; // Base calculation: Area × Price/Sqft

      // ⭐ Add FIXED amenities price only for apartments
      if (propertyType?.toLowerCase() === "apartment" && ap > 0) {
        totalPrice += ap; // Just add the fixed amount
      }

      return Math.round(totalPrice);
    }
    return "";
  };

  const handlePriceChange = (e) => {
    const priceValue = e.target.value;
    const areaSqft = formData.areaSqft;

    setFormData((prev) => ({
      ...prev,
      price: priceValue,
      pricePerSqft: calculatePricePerSqft(priceValue, areaSqft),
    }));
    setPriceInWords(priceValue ? convertToIndianWords(priceValue) : "");
  };

  const handlePricePerSqftChange = (e) => {
    const pricePerSqftValue = e.target.value;
    const areaSqft = formData.areaSqft;
    const amenitiesPrice = formData.amenitiesPrice; // ⭐ Fixed price
    const propertyType = formData.type;

    setFormData((prev) => ({
      ...prev,
      pricePerSqft: pricePerSqftValue,
      price: calculateTotalPrice(
        pricePerSqftValue,
        areaSqft,
        amenitiesPrice,
        propertyType
      ),
    }));

    const calculatedPrice = calculateTotalPrice(
      pricePerSqftValue,
      areaSqft,
      amenitiesPrice,
      propertyType
    );
    setPriceInWords(
      calculatedPrice ? convertToIndianWords(calculatedPrice) : ""
    );
  };

  const handleAreaSqftChange = (e) => {
    const areaSqftValue = e.target.value;
    const price = formData.price;
    const pricePerSqft = formData.pricePerSqft;
    const amenitiesPrice = formData.amenitiesPrice; // ⭐ Fixed price
    const propertyType = formData.type;

    let newPrice = price;
    let newPricePerSqft = pricePerSqft;

    if (pricePerSqft > 0) {
      newPrice = calculateTotalPrice(
        pricePerSqft,
        areaSqftValue,
        amenitiesPrice,
        propertyType
      );
    } else if (price > 0) {
      newPricePerSqft = calculatePricePerSqft(price, areaSqftValue);
    }

    setFormData((prev) => ({
      ...prev,
      areaSqft: areaSqftValue,
      price: newPrice,
      pricePerSqft: newPricePerSqft,
    }));

    setPriceInWords(newPrice ? convertToIndianWords(newPrice) : "");
  };

  // ⭐ NEW: Handle amenities price change (fixed amount for apartments)
  const handleAmenitiesPriceChange = (e) => {
    const amenitiesPriceValue = e.target.value;
    const pricePerSqft = formData.pricePerSqft;
    const areaSqft = formData.areaSqft;
    const propertyType = formData.type;

    let newPrice = formData.price;

    // Only recalculate if we have pricePerSqft and it's an apartment
    if (
      pricePerSqft > 0 &&
      areaSqft > 0 &&
      propertyType?.toLowerCase() === "apartment"
    ) {
      newPrice = calculateTotalPrice(
        pricePerSqft,
        areaSqft,
        amenitiesPriceValue,
        propertyType
      );
    }

    setFormData((prev) => ({
      ...prev,
      amenitiesPrice: amenitiesPriceValue,
      price: newPrice,
    }));

    setPriceInWords(newPrice ? convertToIndianWords(newPrice) : "");
  };

  const handleDecimalChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (newValue.includes(".")) {
      const parts = newValue.split(".");
      if (parts.length > 1 && parts[1].length > 1) {
        newValue = parts[0] + "." + parts[1].substring(0, 1);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    setError(null);
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

    setFormData((prev) => {
      let newState = { ...prev, [name]: processedValue };

      if (name === "constructionStatus" && value !== "under_construction") {
        newState.possessionYear = "";
        newState.possessionMonth = "";
      }

      return newState;
    });
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
            headers: { Authorization: `Bearer ${authToken}` },
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
    setLoading(true);
    setError(null);

    try {
      if (!isAuthenticated || !user) {
        setError("Please login to post.");
        setLoading(false);
        return;
      }

      if (!authToken) {
        setError("Authentication missing. Please login again.");
        setLoading(false);
        return;
      }

      if (user?.role === "BROKER") {
        const subscriptionCheckResponse = await fetch(
          `${BACKEND_BASE_URL}/api/broker-subscription/can-post/${user.id}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        let subscriptionCheck;
        try {
          subscriptionCheck = await subscriptionCheckResponse.clone().json();
        } catch {
          subscriptionCheck = null;
        }

        if (!subscriptionCheck?.success || !subscriptionCheck?.data?.canPost) {
          setCurrentBrokerId(user.id);
          setShowSubscriptionModal(true);
          setLoading(false);
          return;
        }
      }

      if (
        !formData.title ||
        !formData.price ||
        !formData.areaId ||
        !formData.description
      ) {
        setError("Please fill in Title, Price, Area, and Description");
        setLoading(false);
        return;
      }

      if (
        formData.constructionStatus === "under_construction" &&
        (!formData.possessionYear || !formData.possessionMonth)
      ) {
        setError(
          "Please specify the Possession Year and Month for 'Under Construction' properties."
        );
        setLoading(false);
        return;
      }

      if (selectedImages.length === 0) {
        setError("Please upload at least one property image.");
        setLoading(false);
        return;
      }

      const propertyPayload = {
        ...formData,
        imageUrl: null,
        user: {
          id:
            user?.role === "AGENT" || user?.role === "ADMIN"
              ? selectedUserId
              : user.id,
        },
        area: { id: formData.areaId },
        price: Number(formData.price),
        pricePerSqft: formData.pricePerSqft
          ? Number(formData.pricePerSqft)
          : null,
        areaSqft: formData.areaSqft ? Number(formData.areaSqft) : null,
        amenitiesPrice: formData.amenitiesPrice
          ? Number(formData.amenitiesPrice)
          : null, // ⭐ ADD THIS LINE
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
        balconies: formData.balconies ? Number(formData.balconies) : null,
        isReadyToMove: formData.constructionStatus === "ready_to_move",
      };

      const createResponse = await fetch(`${BACKEND_BASE_URL}/api/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(propertyPayload),
      });

      let createJson = null;

      try {
        createJson = await createResponse.clone().json();
      } catch {
        createJson = null;
      }

      if (
        user?.role === "BROKER" &&
        createResponse.status === 500 &&
        ((createJson?.message &&
          createJson.message.includes("Subscription required")) ||
          true)
      ) {
        setCurrentBrokerId(user.id);
        setShowSubscriptionModal(true);
        setLoading(false);
        return;
      }

      if (createJson?.message?.includes("Subscription required")) {
        setCurrentBrokerId(user.id);
        setShowSubscriptionModal(true);
        setLoading(false);
        return;
      }

      if (!createResponse.ok) {
        setError(createJson?.message || "Failed to create property");
        setLoading(false);
        return;
      }

      let propertyId = null;

      if (createJson?.data?.id) {
        propertyId = createJson.data.id;
      } else if (createJson?.id) {
        propertyId = createJson.id;
      }

      if (!propertyId) {
        setError("Invalid response from server. Please try again.");
        setLoading(false);
        return;
      }

      setImageUploading(true);
      const uploadedImageUrls = await uploadImagesToS3(propertyId);
      setImageUploading(false);

      if (uploadedImageUrls.length > 0) {
        await saveImageUrlsToDatabase(propertyId, uploadedImageUrls);
      }

      alert("Property posted successfully!");
      onPropertyPosted && onPropertyPosted();
      onClose && onClose();
    } catch (err) {
      console.error("Error posting property:", err);
      setError(err?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
      setImageUploading(false);
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
            {isAgentOrAdmin && (
              <div className="ppm-user-section">
                <div className="ppm-user-header">
                  <label className="ppm-label">
                    Select Property Owner{" "}
                    <span className="ppm-required-star">*</span>
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

            {showSubscriptionModal && (
              <BrokerSubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                brokerId={currentBrokerId}
                onSubscriptionSuccess={handleSubscriptionSuccess}
              />
            )}

            <div className="ppm-field">
              <label className="ppm-label required">Property Title</label>
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

            <div className="ppm-row">
              <div className="ppm-field">
                <label className="ppm-label required">Property Type</label>
                {/* ✅ UPDATED DROPDOWN - Fetches from Database */}

                {propertyTypesLoading ? (
                  <div>Loading types...</div>
                ) : (
                  <select
                    name="type"
                    className="ppm-select"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="">Select Property Type</option>
                    {propertyTypes.map((pt) => (
                      <option key={pt.id ?? pt.name} value={pt.name}>
                        {getPropertyTypeIcon(pt.name)} {pt.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="ppm-field">
                <label className="ppm-label required">Listing Type</label>
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

            <div className="ppm-field">
              <label className="ppm-label required">👤 Posted By</label>
              <select
                name="ownerType"
                value={formData.ownerType}
                onChange={handleChange}
                className="ppm-select"
                required
                disabled={isBroker || user?.role === "USER"}
              >
                {!isBroker && <option value="owner">Owner</option>}
                {isBroker && <option value="broker">Broker</option>}
              </select>
            </div>

            <div className="ppm-row">
              <div className="ppm-field">
                <label className="ppm-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  readOnly
                  className="ppm-input readonly"
                />
              </div>
              <div className="ppm-field">
                <label className="ppm-label required">
                  📍 Area ({areas.length} available)
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

            <div className="ppm-row">
              <div className="ppm-field">
                <label className="ppm-label required">
                  Construction Status
                </label>
                <select
                  name="constructionStatus"
                  value={formData.constructionStatus}
                  onChange={handleChange}
                  className="ppm-select"
                  required
                >
                  <option value="ready_to_move">✅ Ready to Move</option>
                  <option value="under_construction">
                    🚧 Under Construction
                  </option>
                </select>
              </div>

              <div className="ppm-field">
                <label className="ppm-label">
                  RERA ID (Optional)
                  {formData.reraId && (
                    <span className="ppm-badge-success">✔</span>
                  )}
                </label>
                <input
                  type="text"
                  name="reraId"
                  value={formData.reraId}
                  onChange={handleChange}
                  placeholder="e.g., P01230004567"
                  className="ppm-input"
                />
              </div>

              <div className="ppm-field">
                <label className="ppm-label">
                  HMDA/DTCP ID (Optional)
                  {formData.hmdaId && (
                    <span className="ppm-badge-success">✔</span>
                  )}
                </label>
                <input
                  type="text"
                  name="hmdaId"
                  value={formData.hmdaId}
                  onChange={handleChange}
                  placeholder="e.g., 12/L.O./HMDA/2023"
                  className="ppm-input"
                />
              </div>
            </div>

            {formData.constructionStatus === "under_construction" && (
              <div className="ppm-row">
                <div className="ppm-field">
                  <label className="ppm-label required">
                    Expected Possession Year
                  </label>
                  <select
                    name="possessionYear"
                    value={formData.possessionYear}
                    onChange={handleChange}
                    className="ppm-select"
                    required
                  >
                    <option value="">-- Select Year --</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="ppm-field">
                  <label className="ppm-label required">
                    Expected Possession Month
                  </label>
                  <select
                    name="possessionMonth"
                    value={formData.possessionMonth}
                    onChange={handleChange}
                    className="ppm-select"
                    required
                  >
                    <option value="">-- Select Month --</option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="ppm-field"></div>
              </div>
            )}

            <div className="ppm-images">
              <label className="ppm-label required">
                📷 Upload Property Images (Max 10)
              </label>

              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/gif, image/webp, image/heic, image/heif"
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

            <div className="ppm-field">
              <label className="ppm-label required">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your property..."
                className="ppm-textarea"
                required
              />
            </div>

            {!isPlotOrLandOrVilla && (
              <div className="ppm-row3">
                <div className="ppm-field">
                  <label className="ppm-label required">🛏️ Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleDecimalChange}
                    min="0"
                    step="0.1"
                    className="ppm-input"
                    placeholder="2"
                    required
                    inputMode="decimal"
                  />
                </div>
                <div className="ppm-field">
                  <label className="ppm-label required">🚿 Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleDecimalChange}
                    min="0"
                    step="0.1"
                    className="ppm-input"
                    placeholder="2"
                    required
                    inputMode="decimal"
                  />
                </div>
                <div className="ppm-field">
                  <label className="ppm-label">🏠 Balconies</label>
                  <input
                    type="number"
                    name="balconies"
                    value={formData.balconies}
                    onChange={handleDecimalChange}
                    min="0"
                    step="0.1"
                    className="ppm-input"
                    placeholder="1"
                    inputMode="decimal"
                  />
                </div>
              </div>
            )}

            <div className="ppm-row">
              <div className="ppm-field">
                <label className="ppm-label">📐 Area (sqft)</label>
                <input
                  type="number"
                  name="areaSqft"
                  value={formData.areaSqft}
                  onChange={handleAreaSqftChange}
                  placeholder="1200"
                  className="ppm-input"
                  max="99999"
                  inputMode="numeric"
                />
              </div>
              {/* ⭐ NEW: FIXED Amenities Price Field (Only for Apartments) */}
              {formData.type?.toLowerCase() === "apartment" && (
                <div className="ppm-field">
                  <label className="ppm-label">💰 Amenities Price (₹)</label>
                  <input
                    type="number"
                    name="amenitiesPrice"
                    value={formData.amenitiesPrice}
                    onChange={handleAmenitiesPriceChange}
                    placeholder="e.g., 500000"
                    className="ppm-input"
                    max="10000000"
                    inputMode="numeric"
                  />
                  <small
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    Fixed price for amenities (balcony, club house, etc.)
                  </small>
                </div>
              )}
              {/* ⭐ END OF NEW BLOCK */}

              <div className="ppm-field">
                <label className="ppm-label">💵 Price Per Sqft (₹)</label>
                <input
                  type="number"
                  name="pricePerSqft"
                  value={formData.pricePerSqft}
                  onChange={handlePricePerSqftChange}
                  placeholder="e.g., 5000"
                  className="ppm-input"
                  max="99999"
                  inputMode="numeric"
                />
              </div>

              <div className="ppm-field">
                <label className="ppm-label required">
                  💰 Expected Price (₹)
                </label>
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

      {showSubscriptionModal && (
        <BrokerSubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          brokerId={currentBrokerId}
          onSubscriptionSuccess={() => {
            alert("✅ Subscription activated! You can now post properties.");
            setShowSubscriptionModal(false);
          }}
        />
      )}
    </>
  );
}

export default PostPropertyModal;
