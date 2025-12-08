// realestate-frontend/src/PostPropertyModal.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext.jsx";
import { BACKEND_BASE_URL } from "./config/config";
import UserCreationModal from "./components/UserCreationModal";
import "./PostPropertyModal.css";
import BrokerSubscriptionModal from './components/BrokerSubscriptionModal';
import { trackPropertyPost } from './components/Analytics/GoogleAnalytics';

// ⭐ NEW: Property type icons helper function
const getPropertyTypeIcon = (typeName) => {
  const icons = {
    'Apartment': '🏢',
    'Villa': '🏡',
    'Plot': '📐',
    'Land': '🌾',
    'Office': '🏢',
    'Shop': '🏪',
    'Warehouse': '🏭',
    'Farm House': '🏡',
    'Penthouse': '🌆',
    'Studio': '🏠',
    'Independent House': '🏠',
    'Builder Floor': '🏢'
  };
  return icons[typeName] || '🏘️';
};

// ⭐ NEW: Document type icons and validation
const DOCUMENT_CONFIG = {
  maxDocuments: 5,
  maxSizeMB: 10,
  allowedTypes: {
    'application/pdf': { ext: '.pdf', icon: '📄', name: 'PDF' },
    'application/msword': { ext: '.doc', icon: '📝', name: 'Word Doc' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: '.docx', icon: '📝', name: 'Word Doc' },
    'application/vnd.ms-excel': { ext: '.xls', icon: '📊', name: 'Excel' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: '.xlsx', icon: '📊', name: 'Excel' },
    'text/plain': { ext: '.txt', icon: '📋', name: 'Text' },
    'image/jpeg': { ext: '.jpg', icon: '🖼️', name: 'Image' },
    'image/png': { ext: '.png', icon: '🖼️', name: 'Image' },
  }
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

  // ⭐ NEW: Document upload states
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [documentPreviews, setDocumentPreviews] = useState([]);
  const [documentUploading, setDocumentUploading] = useState(false);
  const [documentUploadProgress, setDocumentUploadProgress] = useState(0);

  const handleSubscriptionSuccess = (subscription) => {
    setShowSubscriptionModal(false);
    alert('✅ Subscription activated! You can now post properties.');
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
    amenitiesPrice: "",
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
    documentUrls: "", // ⭐ NEW: For storing document URLs
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
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
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
    loadPropertyTypes();
  }, []);

  useEffect(() => {
    if (isAgentOrAdmin) {
      loadUsers();
    }
  }, [isAgentOrAdmin]);

  useEffect(() => {
    if (user?.role === "BROKER") {
      setFormData(prev => ({ ...prev, ownerType: "broker" }));
    }
  }, [user]);

  // ✅ Load Property Types from Database
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
          const name = t.typeName ?? t.type_name ?? t.name ?? t.type ?? (typeof t === "string" ? t : "");
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
    ];
    const teens = [
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

    const convert = (n) => {
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100)
        return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
      if (n < 1000)
        return (
          ones[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 ? " " + convert(n % 100) : "")
        );
      return "";
    };

    if (num < 1000) return convert(num) + " Rupees";
    if (num < 100000) {
      const thousands = Math.floor(num / 1000);
      const remainder = num % 1000;
      return (
        convert(thousands) +
        " Thousand" +
        (remainder ? " " + convert(remainder) : "") +
        " Rupees"
      );
    }
    if (num < 10000000) {
      const lakhs = Math.floor(num / 100000);
      const remainder = num % 100000;
      let result = convert(lakhs) + " Lakh";
      if (remainder >= 1000) {
        const thousands = Math.floor(remainder / 1000);
        const final = remainder % 1000;
        result +=
          " " +
          convert(thousands) +
          " Thousand" +
          (final ? " " + convert(final) : "");
      } else if (remainder > 0) {
        result += " " + convert(remainder);
      }
      return result + " Rupees";
    }
    const crores = Math.floor(num / 10000000);
    const remainder = num % 10000000;
    let result = convert(crores) + " Crore";
    if (remainder >= 100000) {
      const lakhs = Math.floor(remainder / 100000);
      const final = remainder % 100000;
      result += " " + convert(lakhs) + " Lakh";
      if (final >= 1000) {
        const thousands = Math.floor(final / 1000);
        const last = final % 1000;
        result +=
          " " +
          convert(thousands) +
          " Thousand" +
          (last ? " " + convert(last) : "");
      } else if (final > 0) {
        result += " " + convert(final);
      }
    } else if (remainder > 0) {
      if (remainder >= 1000) {
        const thousands = Math.floor(remainder / 1000);
        const last = remainder % 1000;
        result +=
          " " +
          convert(thousands) +
          " Thousand" +
          (last ? " " + convert(last) : "");
      } else {
        result += " " + convert(remainder);
      }
    }
    return result + " Rupees";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDecimalChange = (e) => {
    const { name, value } = e.target;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      const numValue = Number(value);
      if (numValue <= 1000000000) {
        setFormData((prev) => ({ ...prev, price: value }));
        setPriceInWords(value ? convertToIndianWords(value) : "");
      }
    }
  };

  const handleAreaSqftChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      const numValue = Number(value);
      if (numValue <= 99999) {
        setFormData((prev) => ({ ...prev, areaSqft: value }));
        if (formData.pricePerSqft && value) {
          const calculatedPrice = Number(formData.pricePerSqft) * numValue;
          const amenitiesPrice = Number(formData.amenitiesPrice) || 0;
          const totalPrice = calculatedPrice + amenitiesPrice;
          setFormData((prev) => ({ ...prev, price: String(totalPrice) }));
          setPriceInWords(convertToIndianWords(String(totalPrice)));
        }
      }
    }
  };

  const handleAmenitiesPriceChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      const numValue = Number(value);
      if (numValue <= 10000000) {
        setFormData((prev) => ({ ...prev, amenitiesPrice: value }));
        if (formData.pricePerSqft && formData.areaSqft) {
          const basePrice =
            Number(formData.pricePerSqft) * Number(formData.areaSqft);
          const totalPrice = basePrice + numValue;
          setFormData((prev) => ({ ...prev, price: String(totalPrice) }));
          setPriceInWords(convertToIndianWords(String(totalPrice)));
        }
      }
    }
  };

  const handlePricePerSqftChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      const numValue = Number(value);
      if (numValue <= 99999) {
        setFormData((prev) => ({ ...prev, pricePerSqft: value }));
        if (formData.areaSqft && value) {
          const calculatedPrice = numValue * Number(formData.areaSqft);
          const amenitiesPrice = Number(formData.amenitiesPrice) || 0;
          const totalPrice = calculatedPrice + amenitiesPrice;
          setFormData((prev) => ({ ...prev, price: String(totalPrice) }));
          setPriceInWords(convertToIndianWords(String(totalPrice)));
        }
      }
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

  // ⭐ NEW: Document Upload Handler
  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate number of documents
    if (selectedDocuments.length + files.length > DOCUMENT_CONFIG.maxDocuments) {
      alert(`Maximum ${DOCUMENT_CONFIG.maxDocuments} documents allowed`);
      return;
    }

    // Validate each file
    const validFiles = [];
    const errors = [];

    files.forEach(file => {
      // Check file type
      if (!DOCUMENT_CONFIG.allowedTypes[file.type]) {
        errors.push(`${file.name}: Unsupported file type`);
        return;
      }

      // Check file size (in MB)
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > DOCUMENT_CONFIG.maxSizeMB) {
        errors.push(`${file.name}: File size exceeds ${DOCUMENT_CONFIG.maxSizeMB}MB`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert('Some files were rejected:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setSelectedDocuments(prev => [...prev, ...validFiles]);

      // Create previews
      validFiles.forEach(file => {
        const preview = {
          name: file.name,
          type: file.type,
          size: (file.size / 1024).toFixed(2) + ' KB',
          icon: DOCUMENT_CONFIG.allowedTypes[file.type]?.icon || '📄'
        };
        setDocumentPreviews(prev => [...prev, preview]);
      });
    }

    e.target.value = ''; // Reset input
  };

  // ⭐ NEW: Remove Document
  const removeDocument = (index) => {
    setSelectedDocuments(prev => prev.filter((_, i) => i !== index));
    setDocumentPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ⭐ NEW: Upload Documents to S3
  const uploadDocumentsToS3 = async () => {
    if (selectedDocuments.length === 0) return [];

    setDocumentUploading(true);
    setDocumentUploadProgress(0);

    const uploadedUrls = [];
    const totalDocs = selectedDocuments.length;

    try {
      for (let i = 0; i < selectedDocuments.length; i++) {
        const file = selectedDocuments[i];
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${BACKEND_BASE_URL}/api/properties/upload-document`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        console.log("📄 Document upload response:", data);
        if (data.success && data.data) {
          uploadedUrls.push(data.data);
          console.log("✅ Document URL received:", data.data);
        }

        // Update progress
        const progress = Math.round(((i + 1) / totalDocs) * 100);
        setDocumentUploadProgress(progress);
      }

      return uploadedUrls;
    } catch (err) {
      console.error("Document upload error:", err);
      throw new Error(`Document upload failed: ${err.message}`);
    } finally {
      setDocumentUploading(false);
      setDocumentUploadProgress(0);
    }
  };

  // Image handling (existing code)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedImages.length + files.length > 10) {
      alert("Maximum 10 images allowed");
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length !== files.length) {
      alert("Only image files are allowed");
      return;
    }

    setSelectedImages((prev) => [...prev, ...imageFiles]);

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index) => {
    if (index === 0) return;
    const newImages = [...selectedImages];
    const newPreviews = [...imagePreviews];
    [newImages[0], newImages[index]] = [newImages[index], newImages[0]];
    [newPreviews[0], newPreviews[index]] = [
      newPreviews[index],
      newPreviews[0],
    ];
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const uploadImagesToS3 = async () => {
    if (selectedImages.length === 0) return [];

    setImageUploading(true);
    setUploadProgress(0);

    const uploadedUrls = [];
    const totalImages = selectedImages.length;

    try {
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        const formData = new FormData();
        formData.append("file", image);

        const response = await fetch(
          `${BACKEND_BASE_URL}/api/upload/image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to upload image ${i + 1}`);
        }

        const data = await response.json();
      if (data.success && data.url) {
          uploadedUrls.push(data.url);
      }

        const progress = Math.round(((i + 1) / totalImages) * 100);
        setUploadProgress(progress);
      }

      return uploadedUrls;
    } catch (err) {
      console.error("Image upload error:", err);
      throw new Error(`Image upload failed: ${err.message}`);
    } finally {
      setImageUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert("Please log in to post a property");
      return;
    }

    if (!formData.areaId) {
      alert("Please select an area");
      return;
    }

    if (isAgentOrAdmin && !selectedUserId) {
      alert("Please select a user for this property");
      return;
    }

    if (selectedImages.length === 0) {
      alert("Please add at least one property image");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload images
      console.log("📤 Starting image upload...");
      const imageUrls = await uploadImagesToS3();
      if (imageUrls.length === 0) {
        throw new Error("No images were uploaded successfully");
      }
      console.log("✅ Images uploaded:", imageUrls.length);

      // Upload documents
      console.log("📤 Starting document upload...");
      const documentUrls = await uploadDocumentsToS3();
      console.log("✅ Documents uploaded:", documentUrls.length);

      const actualUserId = isAgentOrAdmin ? selectedUserId : user.id;

      const propertyData = {
        ...formData,
        userId: actualUserId,
        imageUrl: imageUrls[0],
        imageUrls: imageUrls.join(","),
        documentUrls: documentUrls.join(","),
        bedrooms: formData.bedrooms || null,
        bathrooms: formData.bathrooms || null,
        balconies: formData.balconies || null,
        areaSqft: formData.areaSqft || null,
        amenitiesPrice: formData.amenitiesPrice || null,
        pricePerSqft: formData.pricePerSqft || null,
      };

      console.log("📤 Posting property to backend...", propertyData);

      const response = await fetch(`${BACKEND_BASE_URL}/api/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(propertyData),
      });

      console.log("📡 Response status:", response.status, response.statusText);

      // Handle non-OK responses
      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get("content-type");

        console.log("❌ Error response content-type:", contentType);

        // Try to parse as JSON first
        if (contentType && contentType.includes("application/json")) {
          try {
            errorData = await response.json();
            console.log("📋 Parsed error data:", errorData);
          } catch (parseError) {
            console.error("Failed to parse error response as JSON:", parseError);
            // If JSON parsing fails, try to get text
            const errorText = await response.text();
            console.error("Error as text:", errorText);
            throw new Error(`Server error (${response.status}): ${errorText}`);
          }
        } else {
          // If not JSON, get as text
          const errorText = await response.text();
          console.error("Non-JSON error response:", errorText);
          throw new Error(`Server error (${response.status}): ${errorText}`);
        }

        // Check for specific error codes
        if (errorData.error === 'BROKER_NO_ACTIVE_SUBSCRIPTION') {
          console.log("❌ Broker needs subscription");
          setCurrentBrokerId(user.id);
          setShowSubscriptionModal(true);
          setLoading(false);
          return;
        }

        if (errorData.error === 'BROKER_PROPERTY_LIMIT_REACHED') {
          throw new Error("You have reached your property posting limit. Please upgrade your subscription.");
        }

        throw new Error(errorData.message || "Failed to create property");
      }

      // Success - parse response
      const result = await response.json();
      console.log("✅ Property created successfully:", result);

      // Track analytics
      if (typeof trackPropertyPost === 'function') {
        trackPropertyPost(result.data.id, {
          type: formData.type,
          listingType: formData.listingType,
          price: formData.price,
          city: formData.city,
          userRole: user.role,
          hasDocuments: documentUrls.length > 0,
          documentCount: documentUrls.length
        });
      }

      alert("✅ Property posted successfully!");
      if (onPropertyPosted) onPropertyPosted(result.data);
      onClose();
    } catch (err) {
      console.error("❌ Error posting property:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack
      });

      setError(err.message);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="ppm-backdrop" onClick={onClose}>
        <div
          className="ppm-modal auth-required"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="ppm-close">
            ×
          </button>
          <h2 className="ppm-auth-title">⚠️ Authentication Required</h2>
          <p className="ppm-auth-text">
            Please log in to post a property listing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="ppm-backdrop" onClick={onClose}>
        <div className="ppm-modal" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="ppm-close">
            ×
          </button>

          <h2 className="ppm-title">📝 Post New Property</h2>

          {error && <div className="ppm-alert">{error}</div>}

          <form onSubmit={handleSubmit} className="ppm-form">
            {/* User Selection Section (for Agents/Admins) */}
            {isAgentOrAdmin && (
              <div className="ppm-user-section">
                <div className="ppm-user-header">
                  <label className="ppm-label">👤 Select User</label>
                  <button
                    type="button"
                    onClick={() => setShowUserCreation(true)}
                    className="ppm-btn ppm-btn-small"
                  >
                    + Create User
                  </button>
                </div>
                <p className="ppm-info">
                  Select the property owner from existing users
                </p>
                <select
                  value={selectedUserId || ""}
                  onChange={(e) =>
                    setSelectedUserId(Number(e.target.value) || null)
                  }
                  className="ppm-select"
                  required
                >
                  <option value="">-- Select User --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.email}) - {u.phone}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Basic Information */}
            <div className="ppm-field">
              <label className="ppm-label required">📋 Property Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., 3BHK Luxury Apartment in Gachibowli"
                className="ppm-input"
                required
                maxLength="200"
              />
            </div>

            <div className="ppm-row">
              <div className="ppm-field">
                <label className="ppm-label required">🏘️ Property Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="ppm-select"
                  required
                  disabled={propertyTypesLoading}
                >
                  {propertyTypesLoading ? (
                    <option value="">Loading types...</option>
                  ) : propertyTypes.length > 0 ? (
                    propertyTypes.map((pt) => (
                      <option key={pt.id} value={pt.name}>
                        {getPropertyTypeIcon(pt.name)} {pt.name}
                      </option>
                    ))
                  ) : (
                    <option value="">No property types available</option>
                  )}
                </select>
              </div>

              <div className="ppm-field">
                <label className="ppm-label required">🏷️ Listing Type</label>
                <select
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleChange}
                  className="ppm-select"
                  required
                >
                  <option value="sale">🏠 For Sale</option>
                  <option value="rent">🏘️ For Rent</option>
                </select>
              </div>
            </div>

            {/* Location Details */}
            <div className="ppm-row">
              <div className="ppm-field">
                <label className="ppm-label required">🌆 City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  className="ppm-input readonly"
                  readOnly
                />
              </div>

              <div className="ppm-field">
                <label className="ppm-label required">📍 Area</label>
                <select
                  name="areaId"
                  value={formData.areaId}
                  onChange={handleChange}
                  className="ppm-select"
                  required
                  disabled={areasLoading}
                >
                  <option value="">
                    {areasLoading ? "Loading areas..." : "-- Select Area --"}
                  </option>
                  {areas.map((area) => (
                    <option key={area.areaId} value={area.areaId}>
                      {area.areaName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="ppm-field">
              <label className="ppm-label required">📬 Full Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete address"
                className="ppm-input"
                required
                maxLength="500"
              />
            </div>

            {/* Property Details */}
            <div className="ppm-row">
              <div className="ppm-field">
                <label className="ppm-label required">👨‍💼 Owner Type</label>
                <select
                  name="ownerType"
                  value={formData.ownerType}
                  onChange={handleChange}
                  className="ppm-select"
                  required
                  disabled={isBroker}
                >
                  <option value="owner">🏠 Owner</option>
                  <option value="broker">🤝 Broker</option>
                  <option value="builder">🏗️ Builder</option>
                </select>
              </div>

              <div className="ppm-field">
                <label className="ppm-label required">🏗️ Construction Status</label>
                <select
                  name="constructionStatus"
                  value={formData.constructionStatus}
                  onChange={handleChange}
                  className="ppm-select"
                  required
                >
                  <option value="ready_to_move">✅ Ready to Move</option>
                  <option value="under_construction">🚧 Under Construction</option>
                </select>
              </div>
            </div>

            {formData.constructionStatus === "under_construction" && (
              <div className="ppm-row">
                <div className="ppm-field">
                  <label className="ppm-label required">📅 Possession Month</label>
                  <select
                    name="possessionMonth"
                    value={formData.possessionMonth}
                    onChange={handleChange}
                    className="ppm-select"
                    required
                  >
                    <option value="">-- Select Month --</option>
                    {months.map((month, idx) => (
                      <option key={idx} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ppm-field">
                  <label className="ppm-label required">📆 Possession Year</label>
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
              </div>
            )}

            {/* RERA/HMDA IDs */}
            <div className="ppm-row">
              <div className="ppm-field">
                <label className="ppm-label">
                  📄 RERA ID
                  {formData.reraId && (
                    <span className="ppm-badge-success">VERIFIED</span>
                  )}
                </label>
                <input
                  type="text"
                  name="reraId"
                  value={formData.reraId}
                  onChange={handleChange}
                  placeholder="e.g., P02400004321"
                  className="ppm-input"
                  maxLength="50"
                />
              </div>

              <div className="ppm-field">
                <label className="ppm-label">
                  📄 HMDA ID
                  {formData.hmdaId && (
                    <span className="ppm-badge-success">VERIFIED</span>
                  )}
                </label>
                <input
                  type="text"
                  name="hmdaId"
                  value={formData.hmdaId}
                  onChange={handleChange}
                  placeholder="e.g., HMDA/LO/2024/12345"
                  className="ppm-input"
                  maxLength="50"
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="ppm-images">
              <label className="ppm-label required">📷 Property Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
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
                        <div className="ppm-primary">PRIMARY</div>
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
                  {selectedImages.length} image(s) selected (First image will be the primary image)
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
                    Uploading images... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>

            {/* ⭐ NEW: Document Upload Section */}
            <div className="ppm-documents">
              <label className="ppm-label">📁 Property Documents (Optional)</label>
              <p className="ppm-info">
                Upload brochures, floor plans, or other documents (Max {DOCUMENT_CONFIG.maxDocuments} files, {DOCUMENT_CONFIG.maxSizeMB}MB each)
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                multiple
                onChange={handleDocumentChange}
                className="ppm-file"
                disabled={selectedDocuments.length >= DOCUMENT_CONFIG.maxDocuments}
              />

              {documentPreviews.length > 0 && (
                <div className="ppm-document-list">
                  {documentPreviews.map((doc, index) => (
                    <div key={index} className="ppm-document-item">
                      <div className="ppm-document-info">
                        <span className="ppm-document-icon">{doc.icon}</span>
                        <div className="ppm-document-details">
                          <div className="ppm-document-name">{doc.name}</div>
                          <div className="ppm-document-meta">
                            {DOCUMENT_CONFIG.allowedTypes[doc.type]?.name} • {doc.size}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="ppm-document-remove"
                        title="Remove document"
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selectedDocuments.length > 0 && (
                <p className="ppm-img-count">
                  {selectedDocuments.length} document(s) selected
                </p>
              )}

              {documentUploading && (
                <div className="ppm-progress">
                  <div className="ppm-progress-bar">
                    <div
                      className="ppm-progress-fill"
                      style={{ width: `${documentUploadProgress}%` }}
                    />
                  </div>
                  <p className="ppm-progress-text">
                    Uploading documents... {documentUploadProgress}%
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="ppm-field">
              <label className="ppm-label required">📝 Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your property..."
                className="ppm-textarea"
                required
              />
            </div>

            {/* Bedrooms, Bathrooms, Balconies */}
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

            {/* Area and Pricing */}
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

              {formData.type?.toLowerCase() === 'apartment' && (
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
                  <small style={{fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block'}}>
                    Fixed price for amenities (balcony, club house, etc.)
                  </small>
                </div>
              )}

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
                <label className="ppm-label required">💰 Expected Price (₹)</label>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                loading || imageUploading || documentUploading || (isAgentOrAdmin && !selectedUserId)
              }
              className="ppm-submit"
            >
              {loading
                ? "⏳ Posting..."
                : imageUploading
                ? "⏳ Uploading Images..."
                : documentUploading
                ? "⏳ Uploading Documents..."
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