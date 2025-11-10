// src/components/PropertyDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { BACKEND_BASE_URL } from "../config/config";
import "./PropertyDetails.css";

function PropertyDetails() {
  const { id: propertyId } = useParams();

  const { user } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [agentLoading, setAgentLoading] = useState(true);
  const [agentAvailable, setAgentAvailable] = useState(false);
  const [dealLoading, setDealLoading] = useState(true);
  const [existingDeal, setExistingDeal] = useState(null);
  const [offerAmount, setOfferAmount] = useState("");
  const [dealError, setDealError] = useState("");

  // Featured property states
  const [showFeaturedSection, setShowFeaturedSection] = useState(false);
  const [featuredStatus, setFeaturedStatus] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponValidation, setCouponValidation] = useState(null);
  const [featuredPrice, setFeaturedPrice] = useState({
    original: 499,
    discount: 0,
    final: 499,
  });
  const [applyingFeatured, setApplyingFeatured] = useState(false);

  // Image modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  useEffect(() => {
    fetchPropertyDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  useEffect(() => {
    if (property && user) {
      checkAgentAvailability();
      checkExistingDeal();
      checkFeaturedStatus();
      // Check if user is property owner to show featured section
      if (property.user?.id === user.id) {
        setShowFeaturedSection(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property, user]);

  // ✅ FIXED: Keyboard navigation - moved inside useEffect
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showImageModal || !property?.imageUrls) return;

      if (e.key === "Escape") {
        setShowImageModal(false);
      } else if (e.key === "ArrowRight") {
        const imageUrls = property.imageUrls || [];
        setModalImageIndex((prev) =>
          prev === imageUrls.length - 1 ? 0 : prev + 1
        );
      } else if (e.key === "ArrowLeft") {
        const imageUrls = property.imageUrls || [];
        setModalImageIndex((prev) =>
          prev === 0 ? imageUrls.length - 1 : prev - 1
        );
      }
    };

    if (showImageModal) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showImageModal, modalImageIndex, property?.imageUrls]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showImageModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showImageModal]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/${propertyId}`
      );
      if (!response.ok) throw new Error("Property not found");
      const data = await response.json();

      // ✅ Fetch images from PropertyImage API (production method)
      const imageResponse = await fetch(
        `${BACKEND_BASE_URL}/api/property-images/property/${propertyId}`
      );

      let images = [];
      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        images = imageData.map((img) => img.imageUrl);
      }

      // ✅ Attach images to property object
      data.imageUrls = images;

      setProperty(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkAgentAvailability = async () => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/agents/check/${property.user?.id}`
      );
      setAgentAvailable(response.ok);
    } catch {
      setAgentAvailable(false);
    } finally {
      setAgentLoading(false);
    }
  };

  const checkExistingDeal = async () => {
    if (!user?.id) {
      setDealLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/deals/property/${propertyId}/buyer/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (response.ok) {
        const deal = await response.json();
        setExistingDeal(deal);
      }
    } catch {
      setExistingDeal(null);
    } finally {
      setDealLoading(false);
    }
  };

  const checkFeaturedStatus = async () => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/featured-properties/check/${propertyId}`
      );
      if (response.ok) {
        const data = await response.json();
        setFeaturedStatus(data);
      }
    } catch (err) {
      console.error("Error checking featured status:", err);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponValidation({
        valid: false,
        message: "Please enter a coupon code",
      });
      return;
    }

    setCouponApplying(true);
    setCouponValidation(null);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/coupons/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode: couponCode,
          orderValue: 499.0,
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setCouponValidation(data);
        setFeaturedPrice({
          original: data.couponDetails.originalPrice,
          discount: data.couponDetails.discountAmount,
          final: data.couponDetails.finalPrice,
        });
      } else {
        setCouponValidation(data);
      }
    } catch (err) {
      setCouponValidation({
        valid: false,
        message: "Error validating coupon. Please try again.",
      });
    } finally {
      setCouponApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponValidation(null);
    setFeaturedPrice({
      original: 499,
      discount: 0,
      final: 499,
    });
  };

  const handleApplyFeatured = async () => {
    setApplyingFeatured(true);
    setDealError("");

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/featured-properties/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            propertyId: propertyId,
            couponCode: couponValidation?.valid ? couponCode : null,
            durationMonths: 3,
            userId: user.id,
          }),
        }
      );

      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }
      if (!response.ok) {
        const raw = await response.text();
        const msg = (raw || "").trim().replace(/\s+/g, " ").toLowerCase();

        console.log("RAW ERROR FROM BACKEND =", raw); // ✅ debugging line

        if (msg.includes("already featured")) {
          alert(
            "✅ This property is already featured and visible on the home page section."
          );
          checkFeaturedStatus();
          setShowFeaturedSection(false);
          return;
        }

        setDealError(raw);
        return;
      }

      if (response.ok) {
        if (data.paymentStatus === "FREE") {
          alert(
            "🎉 Congratulations! Your property is now featured for 3 months!"
          );
          checkFeaturedStatus();
          setShowFeaturedSection(false);
        } else {
          alert("Featured application submitted. Please complete payment.");
          // Here you would integrate Razorpay payment
          // For now, just refresh the status
          checkFeaturedStatus();
        }
      } else {
        const msg = data.message || data || "Failed to apply featured status";

        // ✅ If backend says property is already featured
        if (
          typeof msg === "string" &&
          msg.toLowerCase().includes("already featured")
        ) {
          alert(
            "✅ This property is already featured and is visible on the home page section."
          );
          checkFeaturedStatus();
          return;
        }

        setDealError(
          typeof msg === "string" ? msg : "Failed to apply featured status"
        );
      }
    } catch (err) {
      setDealError("Error applying featured status. Please try again.");
    } finally {
      setApplyingFeatured(false);
    }
  };

  const handleCreateDeal = async () => {
    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      setDealError("Please enter a valid offer amount");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/deals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          propertyId: parseInt(propertyId),
          buyerId: user.id,
          sellerId: property.user?.id,
          offerAmount: parseFloat(offerAmount),
        }),
      });

      if (response.ok) {
        const newDeal = await response.json();
        setExistingDeal(newDeal);
        setOfferAmount("");
        alert("Deal created successfully!");
      } else {
        const errorData = await response.text();
        setDealError(errorData || "Failed to create deal");
      }
    } catch (err) {
      setDealError("Error creating deal. Please try again.");
    }
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === property.imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.imageUrls.length - 1 : prev - 1
    );
  };

  // ✅ FIXED: Image modal handlers using property.imageUrls
  const handleImageClick = () => {
    setModalImageIndex(currentImageIndex);
    setShowImageModal(true);
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
  };

  const handleModalNext = () => {
    const imageUrls = property?.imageUrls || [];
    setModalImageIndex((prev) =>
      prev === imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  const handleModalPrev = () => {
    const imageUrls = property?.imageUrls || [];
    setModalImageIndex((prev) =>
      prev === 0 ? imageUrls.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="pd-page">
        <div className="pd-container">
          <div className="pd-state pd-loading">
            <div className="pd-spinner" />
            <span className="pd-loading-text">Loading property details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="pd-page">
        <div className="pd-container">
          <div className="pd-state pd-error">
            <div className="pd-error-ic">⚠️</div>
            <h2 className="pd-error-title">Property Not Found</h2>
            <p className="pd-error-msg">{error || "Unable to load property"}</p>
            <button
              onClick={() => navigate(-1)}
              className="pd-btn pd-btn-primary"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ownerName = property.ownerName || property.userName || "Property Owner";
  const ownerPhone = property.ownerPhone || property.phoneNumber || "";
  const ownerInitial = ownerName.charAt(0).toUpperCase();
  const images = property.imageUrls || [];
  const amenitiesList = Array.isArray(property?.amenities)
    ? property.amenities
    : typeof property?.amenities === "string"
    ? property.amenities.split(",").map((a) => a.trim())
    : [];

  return (
    <>
      <div className="pd-page">
        <div className="pd-container">
          <button onClick={() => navigate(-1)} className="pd-back">
            ← Back
          </button>

          {/* Images */}
          {images.length > 0 ? (
            <div className="pd-images">
              <div
                className="pd-image-main"
                onClick={handleImageClick}
                style={{ cursor: "pointer" }}
              >
                <img src={images[currentImageIndex]} alt={property.title} />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      className="pd-img-nav pd-img-left"
                    >
                      ‹
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      className="pd-img-nav pd-img-right"
                    >
                      ›
                    </button>
                    <div className="pd-img-count">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="pd-thumbs">
                  {images.slice(0, 5).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className={`pd-thumb ${
                        idx === currentImageIndex ? "active" : ""
                      }`}
                      onClick={() => setCurrentImageIndex(idx)}
                    />
                  ))}
                  {images.length > 5 && (
                    <div className="pd-more">+{images.length - 5}</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="pd-images">
              <div className="pd-image-loading">
                <span>📷</span>
                <span>No images available</span>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="pd-main">
            {/* Left column */}
            <div className="card pd-left">
              <div className="pd-head">
                <div className="pd-head-top">
                  <span className="pd-badge">
                    {property.isVerified
                      ? "✓ Verified"
                      : "Pending Verification"}
                  </span>
                  <span className="pd-type">
                    {property.listingType === "sale" ? "For Sale" : "For Rent"}
                  </span>
                </div>
                <h1 className="pd-title">{property.title}</h1>
                <div className="pd-loc">
                  <span className="pd-loc-ic">📍</span>
                  <span className="pd-loc-txt">{property.address}</span>
                </div>
                <div className="pd-price">
                  <span className="pd-price-amt">
                    ₹{property.price?.toLocaleString()}
                  </span>
                  {property.listingType === "rent" && (
                    <span className="pd-price-period">/month</span>
                  )}
                </div>
              </div>

              {/* Key details */}
              <div className="pd-keys">
                <div className="pd-key">
                  <span className="pd-key-ic">🏠</span>
                  <div>
                    <div className="pd-key-label">Type</div>
                    <div className="pd-key-val">{property.type}</div>
                  </div>
                </div>
                <div className="pd-key">
                  <span className="pd-key-ic">📏</span>
                  <div>
                    <div className="pd-key-label">Area</div>
                    <div className="pd-key-val">
                      {property.areaSqft} sq ft ({property.area?.areaName})
                    </div>
                  </div>
                </div>

                <div className="pd-key">
                  <span className="pd-key-ic">🛏️</span>
                  <div>
                    <div className="pd-key-label">Bedrooms</div>
                    <div className="pd-key-val">{property.bedrooms}</div>
                  </div>
                </div>
                <div className="pd-key">
                  <span className="pd-key-ic">🚿</span>
                  <div>
                    <div className="pd-key-label">Bathrooms</div>
                    <div className="pd-key-val">{property.bathrooms}</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="pd-section">
                <h2 className="pd-subtitle">Description</h2>
                <p className="pd-desc">{property.description}</p>
              </div>

              {amenitiesList.length > 0 && (
                <div className="pd-section">
                  <h2 className="pd-subtitle">Amenities</h2>
                  <div className="pd-amenities">
                    {amenitiesList.map((amenity, idx) => (
                      <span key={idx} className="pd-chip">
                        ✓ {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="pd-right">
              {/* Contact card */}
              <div className="card pd-contact">
                <h3 className="pd-contact-title">Contact Owner</h3>
                <div className="pd-owner">
                  <div className="pd-avatar">{ownerInitial}</div>
                  <div>
                    <div className="pd-owner-label">Property Owner</div>
                    <div className="pd-owner-name">{ownerName}</div>
                  </div>
                </div>
                <div className="pd-contact-actions">
                  <button
                    className="pd-btn pd-btn-wa"
                    onClick={() =>
                      window.open(
                        `https://wa.me/${ownerPhone.replace(/\D/g, "")}`,
                        "_blank"
                      )
                    }
                  >
                    <span>💬</span>
                    <span>WhatsApp</span>
                  </button>
                  <button
                    className="pd-btn pd-btn-phone"
                    onClick={() => (window.location.href = `tel:${ownerPhone}`)}
                  >
                    <span>📞</span>
                    <span>Call</span>
                  </button>
                </div>
                <div className="pd-agent-status">
                  {agentLoading ? (
                    <span className="pd-status-loading">
                      ⏳ Checking availability...
                    </span>
                  ) : agentAvailable ? (
                    <span className="pd-status-available">
                      ✓ Agent available for assistance
                    </span>
                  ) : (
                    <span className="pd-status-unavailable">
                      ⚠ Direct owner contact
                    </span>
                  )}
                </div>
              </div>

              {/* Featured Property Section - Only for property owners */}
              {showFeaturedSection && !featuredStatus?.featured && (
                <div className="card pd-featured">
                  <h3 className="pd-featured-title">
                    ⭐ Make Your Property Featured
                  </h3>
                  <p className="pd-featured-desc">
                    Get more visibility! Featured properties appear at the top
                    of search results.
                  </p>

                  <div className="pd-featured-pricing">
                    <div className="pd-featured-price-row">
                      <span>Original Price:</span>
                      <span className="pd-price-original">
                        ₹{featuredPrice.original}
                      </span>
                    </div>
                    {featuredPrice.discount > 0 && (
                      <div className="pd-featured-price-row pd-discount">
                        <span>Discount:</span>
                        <span className="pd-price-discount">
                          -₹{featuredPrice.discount}
                        </span>
                      </div>
                    )}
                    <div className="pd-featured-price-row pd-final">
                      <span>Final Price:</span>
                      <span className="pd-price-final">
                        ₹{featuredPrice.final}
                      </span>
                    </div>
                    <div className="pd-featured-duration">
                      <small>✓ Valid for 3 months</small>
                    </div>
                  </div>

                  <div className="pd-featured-coupon">
                    <label className="pd-coupon-label">
                      Have a coupon code?
                    </label>
                    <div className="pd-coupon-input-group">
                      <input
                        type="text"
                        className="pd-input"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        disabled={couponValidation?.valid}
                      />
                      {!couponValidation?.valid ? (
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponApplying || !couponCode.trim()}
                          className="pd-btn pd-btn-coupon"
                        >
                          {couponApplying ? "Checking..." : "Apply"}
                        </button>
                      ) : (
                        <button
                          onClick={handleRemoveCoupon}
                          className="pd-btn pd-btn-remove"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {couponValidation && (
                      <div
                        className={`pd-coupon-msg ${
                          couponValidation.valid ? "success" : "error"
                        }`}
                      >
                        {couponValidation.message}
                      </div>
                    )}

                    <div className="pd-coupon-hint">
                      💡 Try code: <strong>FEATURED3M</strong> for free featured
                      listing!
                    </div>
                  </div>

                  {dealError && <div className="pd-alert">{dealError}</div>}

                  <button
                    onClick={handleApplyFeatured}
                    disabled={applyingFeatured}
                    className="pd-btn pd-btn-primary"
                    style={{ width: "100%" }}
                  >
                    {applyingFeatured
                      ? "Processing..."
                      : featuredPrice.final === 0
                      ? "Activate Featured (Free)"
                      : `Pay ₹${featuredPrice.final} & Activate`}
                  </button>
                </div>
              )}

              {/* Featured Status - Show if already featured */}
              {featuredStatus?.featured && (
                <div className="card pd-featured-active">
                  <h3 className="pd-featured-title">⭐ Featured Property</h3>
                  <div className="pd-featured-badge">
                    <span className="pd-badge-icon">✓</span>
                    <span>This property is currently featured</span>
                  </div>
                  <div className="pd-featured-info">
                    <div className="pd-info-row">
                      <span>Featured Until:</span>
                      <span>
                        {new Date(
                          featuredStatus.featuredProperty.featuredUntil
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Deal section - Only for buyers/non-owners */}
              {user && user.id !== property.user?.id && (
                <div className="card pd-deal">
                  <h3 className="pd-deal-title">Make an Offer</h3>
                  {dealLoading ? (
                    <div className="pd-deal-loading">
                      <div className="pd-spinner small" />
                      <span>Checking...</span>
                    </div>
                  ) : existingDeal ? (
                    <div className="pd-deal-exists">
                      <div className="pd-deal-badge">Deal Active</div>
                      <p className="pd-deal-info">
                        Stage: <strong>{existingDeal.stage}</strong>
                      </p>
                      <button
                        onClick={() =>
                          navigate(`/deals/${existingDeal.dealId}`)
                        }
                        className="pd-btn pd-btn-view"
                      >
                        View Deal
                      </button>
                    </div>
                  ) : (
                    <div className="pd-deal-none">
                      <div className="pd-deal-none-badge">No Active Deal</div>
                      <div className="pd-deal-create">
                        <input
                          type="number"
                          className="pd-input"
                          placeholder="Your offer amount (₹)"
                          value={offerAmount}
                          onChange={(e) => setOfferAmount(e.target.value)}
                        />
                        {dealError && (
                          <div className="pd-alert">{dealError}</div>
                        )}
                        <button
                          onClick={handleCreateDeal}
                          className="pd-btn pd-btn-primary"
                        >
                          Create Deal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Additional details */}
              <div className="card pd-details">
                <h3 className="pd-details-title">Property Details</h3>
                <div className="pd-details-list">
                  <div className="pd-detail-row">
                    <span>Property ID</span>
                    <span>#{property.propertyId}</span>
                  </div>
                  <div className="pd-detail-row">
                    <span>Posted On</span>
                    <span>
                      {new Date(property.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {property.yearBuilt && (
                    <div className="pd-detail-row">
                      <span>Year Built</span>
                      <span>{property.yearBuilt}</span>
                    </div>
                  )}
                  {property.availableFrom && (
                    <div className="pd-detail-row">
                      <span>Available From</span>
                      <span>
                        {new Date(property.availableFrom).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating WhatsApp button */}
        <button
          className="pd-fab"
          onClick={() =>
            window.open(
              `https://wa.me/${ownerPhone.replace(/\D/g, "")}`,
              "_blank"
            )
          }
        >
          💬
        </button>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="pd-modal-overlay" onClick={handleCloseModal}>
          <div
            className="pd-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="pd-modal-close" onClick={handleCloseModal}>
              ✕
            </button>

            <div className="pd-modal-image-container">
              <img
                src={images[modalImageIndex]}
                alt={`${property.title} - Image ${modalImageIndex + 1}`}
                className="pd-modal-image"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={handleModalPrev}
                    className="pd-modal-nav pd-modal-left"
                  >
                    ‹
                  </button>
                  <button
                    onClick={handleModalNext}
                    className="pd-modal-nav pd-modal-right"
                  >
                    ›
                  </button>
                  <div className="pd-modal-counter">
                    {modalImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="pd-modal-thumbs">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className={`pd-modal-thumb ${
                      idx === modalImageIndex ? "active" : ""
                    }`}
                    onClick={() => setModalImageIndex(idx)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default PropertyDetails;
