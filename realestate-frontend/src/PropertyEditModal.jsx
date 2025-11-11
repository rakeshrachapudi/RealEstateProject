// realestate-frontend/src/PropertyEditModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { BACKEND_BASE_URL } from "./config/config";
import "./PropertyEditModal.css";

/**
 * PropertyEditModal (FINAL)
 * - Fully supports multiple images
 * - Loads existing images from: GET /api/property-images/property/{propertyId}
 * - Uploads new images to: POST /api/upload/property-image  (FormData: file, propertyId)
 *   (Also supports the older ?propertyId=… style, handled internally if needed)
 * - Saves full ordered image set to:
 *   POST /api/property-images/property/{propertyId}
 *     body: [{ imageUrl, isPrimary, displayOrder }]
 * - ❗ FIX: Deletes all previous images BEFORE save to avoid duplication:
 *     DELETE /api/property-images/property/{propertyId}
 * - Deletes individually removed images via: DELETE /api/property-images/{imageId} (best-effort)
 * - Updates property main imageUrl to the selected primary image before PUT /api/properties/{id}
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

  // ---------- Images State ----------
  // Existing images from backend (persisted)
  // Shape: { imageId, imageUrl, isPrimary, displayOrder, createdAt }
  const [existingImages, setExistingImages] = useState([]);

  // Local new images (files selected in this session)
  const [newFiles, setNewFiles] = useState([]); // File[]
  const [newPreviews, setNewPreviews] = useState([]); // string[]

  // Track existing images removed by user (for optional DELETE calls)
  const [removedExistingIds, setRemovedExistingIds] = useState([]);

  // ---------- Form Data ----------
  const [formData, setFormData] = useState({
    title: property?.title || "",
    type: property?.type || property?.propertyType || "Apartment",
    listingType: property?.listingType || "sale",
    city: property?.city || property?.cityName || "Hyderabad",
    areaId: property?.area?.areaId || property?.area?.id || "",
    address: property?.address || "",
    // imageUrl will be set to primary image before PUT
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

  const propertyId = property?.id || property?.propertyId;

  // Derived: a single ordered list we render (existing first by displayOrder, then new)
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
      // Expecting an array like:
      // [{ imageId, imageUrl, isPrimary, displayOrder, createdAt }, ...]
      const list = Array.isArray(data) ? data : data?.data || [];
      // Normalize displayOrder
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
      // Ensure exactly one primary (fallback to first)
      if (!normalized.some((i) => i.isPrimary) && normalized.length > 0) {
        normalized[0].isPrimary = true;
      }
      setExistingImages(normalized);
    } catch (err) {
      // Don't block the modal — just start with empty
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
    // Any new images will become non-primary
  };

  const setPrimaryNew = (index) => {
    // If user chooses a new image as primary, all existing become false primary.
    setExistingImages((prev) => prev.map((i) => ({ ...i, isPrimary: false })));
    // Move that new image preview/file to the front of new arrays to represent primary
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

  // Simple reorder controls for existing images
  const moveExisting = (imageId, dir) => {
    setExistingImages((prev) => {
      const arr = [...prev];
      const idx = arr.findIndex((x) => x.imageId === imageId);
      if (idx < 0) return arr;
      const swapWith = dir === "left" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= arr.length) return arr;
      [arr[idx], arr[swapWith]] = [arr[swapWith], arr[idx]];
      return arr;
    });
  };

  // Reorder new images
  const moveNew = (index, dir) => {
    setNewFiles((prev) => {
      const arr = [...prev];
      const swapWith = dir === "left" ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= arr.length) return arr;
      [arr[index], arr[swapWith]] = [arr[swapWith], arr[index]];
      return arr;
    });
    setNewPreviews((prev) => {
      const arr = [...prev];
      const swapWith = dir === "left" ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= arr.length) return arr;
      [arr[index], arr[swapWith]] = [arr[swapWith], arr[index]];
      return arr;
    });
  };

  // ---------- Helpers ----------
  function formatPriceDisplay(numericPrice) {
    if (numericPrice >= 10000000) {
      return `₹${(numericPrice / 10000000).toFixed(2)} Cr`;
    } else if (numericPrice >= 100000) {
      return `₹${(numericPrice / 100000).toFixed(2)} Lac`;
    }
    return `₹${Number(numericPrice).toLocaleString("en-IN")}`;
  }

  function ensureOnePrimary(images) {
    if (!images || images.length === 0) return images;
    if (!images.some((i) => i.isPrimary)) {
      images[0].isPrimary = true;
    } else {
      // If multiple marked primary, keep only the first
      let found = false;
      for (const im of images) {
        if (im.isPrimary && !found) {
          found = true;
        } else if (im.isPrimary && found) {
          im.isPrimary = false;
        }
      }
    }
    return images;
  }

  // Upload new files to S3 and return array of URLs (in selected order)
  async function uploadNewFilesToS3(pid) {
    if (!newFiles.length) return [];
    setImageUploading(true);

    const urls = [];
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];

      const fd = new FormData();
      fd.append("file", file);
      fd.append("propertyId", pid); // primary method (UploadController supports this)

      setUploadProgress(Math.round(((i + 1) / newFiles.length) * 100));

      try {
        // Preferred: body contains propertyId in form-data
        let res = await fetch(`${BACKEND_BASE_URL}/api/upload/property-image`, {
          method: "POST",
          headers: authToken
            ? { Authorization: `Bearer ${authToken}` }
            : undefined,
          body: fd,
        });

        if (!res.ok) {
          // Fallback: try query param
          res = await fetch(
            `${BACKEND_BASE_URL}/api/upload/property-image?propertyId=${pid}`,
            {
              method: "POST",
              headers: authToken
                ? { Authorization: `Bearer ${authToken}` }
                : undefined,
              body: fd,
            }
          );
        }

        if (!res.ok) {
          let errMsg = "";
          try {
            errMsg = (await res.json())?.message || "";
          } catch {}
          throw new Error(errMsg || `Upload failed (HTTP ${res.status})`);
        }

        const data = await res.json();
        if (!data?.success || !data?.url) {
          throw new Error(data?.message || "Upload response invalid");
        }
        urls.push(data.url);
      } catch (err) {
        setImageUploading(false);
        throw err;
      }
    }

    setImageUploading(false);
    setUploadProgress(0);
    return urls;
  }

  async function saveImagesToDatabase(pid, allImageUrlsOrdered, primaryIndex) {
    // Build payload expected by your controller
    const payload = allImageUrlsOrdered.map((url, idx) => ({
      imageUrl: url,
      isPrimary: idx === primaryIndex,
      displayOrder: idx,
    }));

    const res = await fetch(
      `${BACKEND_BASE_URL}/api/property-images/property/${pid}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      let t = "";
      try {
        t = await res.text();
      } catch {}
      throw new Error(`Failed to save images: ${t || res.statusText}`);
    }
    // success; response body not strictly required
    return res.json().catch(() => ({}));
  }

  async function bestEffortDeleteRemoved() {
    if (!removedExistingIds.length) return;
    await Promise.allSettled(
      removedExistingIds.map((id) =>
        fetch(`${BACKEND_BASE_URL}/api/property-images/${id}`, {
          method: "DELETE",
          headers: authToken
            ? { Authorization: `Bearer ${authToken}` }
            : undefined,
        })
      )
    );
  }

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // --- Basic validations ---
    if (!formData.title || !formData.areaId || !formData.price || !formData.description) {
      setError("Please fill all required fields marked with *");
      return;
    }
    const numericPrice = Number(formData.price);
    if (!isFinite(numericPrice) || numericPrice <= 0) {
      setError("Please enter a valid price");
      return;
    }

    // Make sure we have at least one image either existing or new
    if (totalImagesCount === 0) {
      setError("Please add at least one property image.");
      return;
    }

    setLoading(true);

    try {
      // 1) Upload NEW files to S3, keep order
      const uploadedNewUrls = await uploadNewFilesToS3(propertyId);

      // 2) Compose final ordered images (existing in current UI order + new in current order)
      // Determine which is primary:
      // - If any existing has isPrimary=true -> that one's index becomes the primary
      // - Else the first new becomes primary (we also support setPrimaryNew by swapping to index 0)
      const orderedExistingUrls = orderedExisting.map((i) => i.imageUrl);
      let primaryIndexInFinal = -1;

      const existingPrimaryIdx = orderedExisting.findIndex((i) => i.isPrimary);
      if (existingPrimaryIdx >= 0) {
        primaryIndexInFinal = existingPrimaryIdx;
      } else if (uploadedNewUrls.length > 0) {
        // If user set a new image primary, we swapped it to index 0 in new arrays
        primaryIndexInFinal = orderedExistingUrls.length + 0; // first new
      } else if (orderedExistingUrls.length > 0) {
        primaryIndexInFinal = 0;
      }

      const finalUrls = [...orderedExistingUrls, ...uploadedNewUrls];

      if (finalUrls.length === 0) {
        throw new Error("No images available to save.");
      }
      if (primaryIndexInFinal < 0) primaryIndexInFinal = 0;

      // ❗❗ CRITICAL FIX — delete all previous images so backend doesn't duplicate
      await fetch(
        `${BACKEND_BASE_URL}/api/property-images/property/${propertyId}`,
        {
          method: "DELETE",
          headers: authToken
            ? { Authorization: `Bearer ${authToken}` }
            : undefined,
        }
      );

      // 3) Save (overwrite) full image list in DB with order + primary
      await saveImagesToDatabase(propertyId, finalUrls, primaryIndexInFinal);

      // 4) Best-effort delete individually removed existing images (optional; safe even after bulk delete)
      await bestEffortDeleteRemoved();

      // 5) Prepare Property payload (update main imageUrl to the primary url)
      const priceDisplay = formatPriceDisplay(numericPrice);
      const selectedAreaObj =
        areas.find((a) => String(a.areaId) === String(formData.areaId)) ||
        null;

      const primaryUrl = finalUrls[primaryIndexInFinal];

      const propertyData = {
        title: formData.title,
        type: formData.type,
        city: formData.city,
        address:
          formData.address ||
          (selectedAreaObj
            ? `${selectedAreaObj.areaName}, ${formData.city}`
            : formData.city),
        imageUrl: primaryUrl, // as required
        description: formData.description,
        price: numericPrice,
        priceDisplay,
        areaSqft: formData.areaSqft ? Number(formData.areaSqft) : null,
        bedrooms: Number(formData.bedrooms || 0),
        bathrooms: Number(formData.bathrooms || 0),
        balconies: formData.balconies ? Number(formData.balconies) : 0,
        amenities: formData.amenities || null,
        listingType: formData.listingType,
        status: "available",
        isFeatured: property?.isFeatured || false,
        isActive: true,
        ownerType: formData.ownerType,
        isReadyToMove: formData.isReadyToMove,
        isVerified: formData.isVerified || false,
        area: selectedAreaObj || (property?.area ? property.area : null),
        user: { id: user?.id },
      };

      // 6) Update the property core fields
      const res = await fetch(
        `${BACKEND_BASE_URL}/api/properties/${propertyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify(propertyData),
        }
      );

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(
          "Failed to update property: " + (errText || res.statusText)
        );
      }

      await res.json().catch(() => null);

      alert("✅ Property updated successfully!");
      onPropertyUpdated && onPropertyUpdated();
      onClose && onClose();
    } catch (err) {
      console.error(err);
      setError(
        err?.message || "Failed to update property. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- Render ----------
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

  return (
    <div className="pem-backdrop" onClick={handleBackdropClick}>
      <div
        className="pem-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pem-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="pem-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <h2 id="pem-title" className="pem-title">
          ✏️ Edit Your Property
        </h2>

        {error && <div className="pem-alert">❌ {error}</div>}

        <form onSubmit={handleSubmit} className="pem-form">
          {/* Title */}
          <div className="pem-field">
            <label className="pem-label">Property Title *</label>
            <input
              className="pem-input"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Spacious 2BHK Apartment"
              required
            />
          </div>

          {/* Type + ListingType */}
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
                <option>Apartment</option>
                <option>Villa</option>
                <option>Independent House</option>
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
                className="pem-select"
                name="listingType"
                value={formData.listingType}
                onChange={handleChange}
                required
              >
                <option value="sale">🏠 For Sale</option>
                <option value="rent">🔑 For Rent</option>
              </select>
            </div>
          </div>

          {/* Owner + Ready */}
          <div className="pem-row">
            <div className="pem-field">
              <label className="pem-label">👤 Posted By *</label>
              <select
                className="pem-select"
                name="ownerType"
                value={formData.ownerType}
                onChange={handleChange}
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

          {/* Admin only: Verified */}
          {user?.role === "ADMIN" && (
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

          {/* City + Area */}
          <div className="pem-row">
            <div className="pem-field">
              <label className="pem-label">City *</label>
              <input
                className="pem-input"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="pem-field">
              <label className="pem-label">
                📍 Area *{" "}
                {areasLoading && <span className="pem-hint">(Loading...)</span>}
              </label>
              <select
                className="pem-select"
                name="areaId"
                value={formData.areaId}
                onChange={handleChange}
                required
                disabled={areasLoading || areas.length === 0}
              >
                <option value="">-- Select Area --</option>
                {areas.map((a) => (
                  <option key={a.areaId} value={a.areaId}>
                    {a.areaName} ({a.pincode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="pem-field">
            <label className="pem-label">Complete Address (Optional)</label>
            <input
              className="pem-input"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="House/Plot number, Street name"
            />
          </div>

          {/* IMAGES (Multiple) */}
          <div className="pem-images">
            <h3 className="pem-images-title">📁 Property Images *</h3>

            {/* Existing images (from DB) */}
            {orderedExisting.length > 0 && (
              <div className="ppm-previews" style={{ marginTop: 8 }}>
                {orderedExisting.map((img, idx) => (
                  <div key={img.imageId} className="ppm-preview-wrap">
                    <img
                      src={img.imageUrl}
                      alt={`Property ${idx + 1}`}
                      className="ppm-preview"
                    />
                    {img.isPrimary && (
                      <span className="ppm-primary">Primary</span>
                    )}
                    <span className="ppm-num">{idx + 1}</span>
                    <div className="ppm-controls">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          className="ppm-control ppm-control-primary"
                          onClick={() => setPrimaryExisting(img.imageId)}
                        >
                          Set Primary
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
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* New images (local, not yet uploaded) */}
            {newPreviews.length > 0 && (
              <>
                <div className="ppm-previews" style={{ marginTop: 12 }}>
                  {newPreviews.map((src, idx) => (
                    <div key={src} className="ppm-preview-wrap">
                      <img
                        src={src}
                        alt={`New ${idx + 1}`}
                        className="ppm-preview"
                      />
                      {/* If no existing image is primary, the first new image may be primary (via setPrimaryNew moves) */}
                      {orderedExisting.every((i) => !i.isPrimary) &&
                        idx === 0 && <span className="ppm-primary">Primary</span>}
                      <span className="ppm-num">
                        {orderedExisting.length + idx + 1}
                      </span>
                      <div className="ppm-controls">
                        {!(
                          orderedExisting.some((i) => i.isPrimary) &&
                          idx === 0
                        ) && (
                          <button
                            type="button"
                            className="ppm-control ppm-control-primary"
                            onClick={() => setPrimaryNew(idx)}
                          >
                            Set Primary
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
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
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

            {/* Upload progress (for new files during submit) */}
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

            <p className="ppm-img-count">{totalImagesCount}/10 images selected</p>
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

          {/* Numbers */}
          <div className="pem-row3">
            <div className="pem-field">
              <label className="pem-label">🛏️ Bedrooms *</label>
              <input
                className="pem-input"
                type="number"
                min="0"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                required
              />
            </div>
            <div className="pem-field">
              <label className="pem-label">🛁 Bathrooms *</label>
              <input
                className="pem-input"
                type="number"
                min="0"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                required
              />
            </div>
            <div className="pem-field">
              <label className="pem-label">🧱 Balconies</label>
              <input
                className="pem-input"
                type="number"
                min="0"
                name="balconies"
                value={formData.balconies}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="pem-row3">
            <div className="pem-field">
              <label className="pem-label">📐 Area (sqft)</label>
              <input
                className="pem-input"
                type="number"
                min="0"
                name="areaSqft"
                value={formData.areaSqft}
                onChange={handleChange}
              />
            </div>
            <div className="pem-field">
              <label className="pem-label">💰 Price *</label>
              <input
                className="pem-input"
                type="number"
                min="1"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="pem-field">
              <label className="pem-label">🏷️ Listing</label>
              <input
                className="pem-input"
                type="text"
                name="listingType"
                value={formData.listingType}
                onChange={handleChange}
                readOnly
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="pem-field">
            <label className="pem-label">Amenities (comma separated)</label>
            <input
              className="pem-input"
              type="text"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              placeholder="Parking, Lift, Gym"
            />
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
