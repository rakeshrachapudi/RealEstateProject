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
  const [dealLoading, setDealLoading] = useState(true);
  const [existingDeal, setExistingDeal] = useState(null);
  const [offerAmount, setOfferAmount] = useState("");
  const [dealError, setDealError] = useState("");
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
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [agent, setAgent] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);

  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyId]);

  useEffect(() => {
    if (property && user) {
      fetchAgentForProperty();
      checkExistingDeal();
      checkFeaturedStatus();
      if (property.user?.id === user.id) {
        setShowFeaturedSection(true);
      } else {
        setShowFeaturedSection(false);
      }
    }
  }, [property, user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showImageModal || !property?.imageUrls) return;
      if (e.key === "Escape") {
        setShowImageModal(false);
      } else if (e.key === "ArrowRight") {
        const imageUrls = property.imageUrls || [];
        setModalImageIndex((prev) => prev === imageUrls.length - 1 ? 0 : prev + 1);
      } else if (e.key === "ArrowLeft") {
        const imageUrls = property.imageUrls || [];
        setModalImageIndex((prev) => prev === 0 ? imageUrls.length - 1 : prev - 1);
      }
    };
    if (showImageModal) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [showImageModal, modalImageIndex, property?.imageUrls]);

  useEffect(() => {
    document.body.style.overflow = showImageModal ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showImageModal]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/properties/${propertyId}`);
      if (!response.ok) throw new Error("Property not found");
      const data = await response.json();
      const imageResponse = await fetch(`${BACKEND_BASE_URL}/api/property-images/property/${propertyId}`);
      let images = [];
      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        images = imageData.map((img) => img.imageUrl);
      }
      data.imageUrls = images;
      setProperty(data);
    } catch (err) {
      setError(err.message || "Failed to load property");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentForProperty = async () => {
    try {
      setAgentLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${BACKEND_BASE_URL}/api/agents/property/${propertyId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        setAgent(null);
        return;
      }
      const data = await res.json();
      const normalized = {
        agentId: data.agentId ?? data.id ?? null,
        agentName: data.agentName ?? [data.firstName, data.lastName].filter(Boolean).join(" ") ?? data.name ?? "Agent",
        agentPhone: (data.agentPhone ?? data.mobileNumber ?? data.phone ?? "").toString(),
      };
      setAgent(normalized);
    } catch {
      setAgent(null);
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
      const response = await fetch(`${BACKEND_BASE_URL}/api/deals/property/${propertyId}/buyer/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      if (response.ok) {
        const deal = await response.json();
        setExistingDeal(deal);
      } else {
        setExistingDeal(null);
      }
    } catch {
      setExistingDeal(null);
    } finally {
      setDealLoading(false);
    }
  };

  const checkFeaturedStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/featured-properties/check/${propertyId}`);
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
      setCouponValidation({ valid: false, message: "Please enter a coupon code" });
      return;
    }
    setCouponApplying(true);
    setCouponValidation(null);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode: couponCode, orderValue: 499.0 }),
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
      setCouponValidation({ valid: false, message: "Error validating coupon. You can still proceed with payment." });
    } finally {
      setCouponApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponValidation(null);
    setFeaturedPrice({ original: 499, discount: 0, final: 499 });
  };

  const handleApplyFeatured = async () => {
    setApplyingFeatured(true);
    setDealError("");
    try {
      const createRes = await fetch(`${BACKEND_BASE_URL}/api/featured-properties/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          propertyId: Number(propertyId),
          userId: user.id,
          couponCode: (couponCode || "").trim() || null,
          durationMonths: 3,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        const msg = createData?.message || "Unable to start featured order";
        if (String(msg).toLowerCase().includes("already featured")) {
          alert("✅ This property is already featured.");
          await checkFeaturedStatus();
          setShowFeaturedSection(false);
          return;
        }
        setDealError(msg);
        return;
      }
      if (createData.free || Number(createData.finalAmount) === 0) {
        alert("🎉 Your property is now featured for 3 months!");
        await checkFeaturedStatus();
        setShowFeaturedSection(false);
        window.location.reload();
        return;
      }
      const options = {
        key: createData.razorpayKeyId,
        amount: Math.round(Number(createData.finalAmount) * 100),
        currency: createData.currency || "INR",
        name: "Property Dealz",
        description: "Featured Property - 3 Months",
        order_id: createData.razorpayOrderId,
        prefill: {
          name: `${user.firstName || ""} ${user.lastName || ""}`,
          email: user.email || "",
          contact: user.mobileNumber || "",
        },
        handler: async function (paymentResponse) {
          try {
            const verifyRes = await fetch(`${BACKEND_BASE_URL}/api/featured-properties/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
              body: JSON.stringify({
                featuredId: createData.featuredId,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              alert("🎉 Payment successful! Your property is now featured.");
              await checkFeaturedStatus();
              setShowFeaturedSection(false);
              window.location.reload();
            } else {
              alert(verifyData.message || "❌ Payment verification failed.");
            }
          } catch (e) {
            console.error("Verify error:", e);
            alert("❌ Payment verification failed.");
          }
        },
        modal: {
          ondismiss: function () {
            alert("Payment cancelled.");
            setApplyingFeatured(false);
          },
        },
        theme: { color: "#3399cc" },
      };
      if (!window.Razorpay) {
        alert("Payment gateway not loaded. Please refresh and try again.");
        return;
      }
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Error applying featured:", err);
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
        setDealError("");
      } else {
        const errorData = await response.json();
        const errorMessage = errorData?.message || errorData?.error || "Failed to create deal";
        setDealError(errorMessage);
      }
    } catch (err) {
      console.error("Error creating deal:", err);
      setDealError("Error creating deal. Please check your inputs and try again.");
    }
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => prev === (property?.imageUrls?.length || 0) - 1 ? 0 : prev + 1);
  };

  const handlePrev = () => {
    setCurrentImageIndex((prev) => prev === 0 ? (property?.imageUrls?.length || 1) - 1 : prev - 1);
  };

  const handleImageClick = () => {
    setModalImageIndex(currentImageIndex);
    setShowImageModal(true);
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
  };

  const handleModalNext = () => {
    const imageUrls = property?.imageUrls || [];
    setModalImageIndex((prev) => prev === imageUrls.length - 1 ? 0 : prev + 1);
  };

  const handleModalPrev = () => {
    const imageUrls = property?.imageUrls || [];
    setModalImageIndex((prev) => prev === 0 ? imageUrls.length - 1 : prev - 1);
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
            <button onClick={() => navigate(-1)} className="pd-btn pd-btn-primary">Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  const isBrokerPosted = (property.ownerType && String(property.ownerType).toLowerCase() === "broker") ||
                         (property.user?.role && String(property.user.role).toUpperCase() === "BROKER");
  const contactLabel = isBrokerPosted ? "Contact Broker" : "Contact Agent";
  const contactRoleLabel = isBrokerPosted ? "Property Posted by Broker" : "Property Owner";
  const ownerDisplayName = [property.user?.firstName, property.user?.lastName].filter(Boolean).join(" ").trim() ||
                          property.user?.username || "Property Owner";

  let contactPhone = "";
  let validContactPhone = false;
  if (isBrokerPosted) {
    contactPhone = (property.user?.mobileNumber || "").toString().trim();
    const digitsOnly = contactPhone.replace(/\D/g, "");
    validContactPhone = digitsOnly.length >= 8;
  } else {
    contactPhone = (agent?.agentPhone || "").toString().trim();
    const digitsOnly = contactPhone.replace(/\D/g, "");
    validContactPhone = digitsOnly.length >= 8;
  }

  const digitsOnlyForLinks = contactPhone.replace(/\D/g, "");
  const waHref = validContactPhone ? `https://wa.me/${digitsOnlyForLinks}` : "";
  const telHref = validContactPhone ? `tel:${contactPhone}` : "";
  const ownerInitial = (ownerDisplayName || "P").charAt(0).toUpperCase();
  const images = property.imageUrls || [];
  const amenitiesList = Array.isArray(property?.amenities) ? property.amenities :
                       typeof property?.amenities === "string" ? property.amenities.split(",").map((a) => a.trim()) : [];

  return (
    <>
      <div className="pd-page">
        <div className="pd-container">
          <button onClick={() => navigate(-1)} className="pd-back">← Back</button>

          {images.length > 0 ? (
            <div className="pd-images">
              <div className="pd-image-main" onClick={handleImageClick} style={{ cursor: "pointer" }}>
                <img src={images[currentImageIndex]} alt={property.title} />
                {images.length > 1 && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="pd-img-nav pd-img-left">‹</button>
                    <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="pd-img-nav pd-img-right">›</button>
                    <div className="pd-img-count">{currentImageIndex + 1} / {images.length}</div>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="pd-thumbs">
                  {images.slice(0, 5).map((img, idx) => (
                    <img key={idx} src={img} alt={`Thumbnail ${idx + 1}`}
                         className={`pd-thumb ${idx === currentImageIndex ? "active" : ""}`}
                         onClick={() => setCurrentImageIndex(idx)} />
                  ))}
                  {images.length > 5 && <div className="pd-more">+{images.length - 5}</div>}
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

          <div className="pd-main">
            <div className="card pd-left">
              <div className="pd-head">
                <div className="pd-head-top">
                  <span className="pd-badge">{property.isVerified ? "✓ Verified" : "Pending Verification"}</span>
                  <span className="pd-type">{property.listingType === "sale" ? "For Sale" : "For Rent"}</span>
                </div>
                <h1 className="pd-title">{property.title}</h1>
                <div className="pd-loc">
                  <span className="pd-loc-ic">📍</span>
                  <span className="pd-loc-txt">{property.address}</span>
                </div>
                <div className="pd-price">
                  <span className="pd-price-amt">₹{property.price?.toLocaleString()}</span>
                  {property.listingType === "rent" && <span className="pd-price-period">/month</span>}
                </div>
              </div>

              {(property.reraId || property.hmdaId) && (
                <div className="pd-statutory-ids">
                  {property.reraId && (
                    <div className="pd-id-badge pd-highlight">
                      <span className="pd-id-label">RERA ID:</span>
                      <span className="pd-id-value">{property.reraId}</span>
                    </div>
                  )}
                  {property.hmdaId && (
                    <div className="pd-id-badge pd-highlight">
                      <span className="pd-id-label">HMDA ID:</span>
                      <span className="pd-id-value">{property.hmdaId}</span>
                    </div>
                  )}
                </div>
              )}

              {property.pricePerSqft && (
                <div style={{
                  fontSize: '16px', fontWeight: '600', color: '#7c3aed', background: '#f3e8ff',
                  padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', width: 'fit-content'
                }}>
                  💵 ₹{Number(property.pricePerSqft).toLocaleString("en-IN")}/sqft
                </div>
              )}

              {property.constructionStatus && (
                <div style={{
                  fontSize: '14px', fontWeight: '600', padding: '10px 14px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  color: '#92400e', border: '1px solid #fbbf24', marginBottom: '16px'
                }}>
                  {property.constructionStatus.toLowerCase() === "ready_to_move" ? "🏠 Ready to Move" :
                   property.constructionStatus.toLowerCase() === "under_construction" ?
                   (property.possessionYear && property.possessionMonth ?
                    `🚧 Under Construction (Possession: ${property.possessionMonth} ${property.possessionYear})` :
                    "🚧 Under Construction") : property.constructionStatus}
                </div>
              )}

              {property.ownerType && (
                <div style={{
                  fontSize: '14px', color: '#4b5563', fontWeight: '600', padding: '8px 12px',
                  background: '#f3f4f6', borderRadius: '8px', marginBottom: '16px', width: 'fit-content'
                }}>
                  👤 Posted by: {property.ownerType === "broker" ? "Broker" : "Owner"}
                </div>
              )}

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
                    <div className="pd-key-val">{property.areaSqft} sq ft ({property.area?.areaName})</div>
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
                {property.balconies > 0 && (
                  <div className="pd-key">
                    <span className="pd-key-ic">🏡</span>
                    <div>
                      <div className="pd-key-label">Balconies</div>
                      <div className="pd-key-val">{property.balconies}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pd-section">
                <h2 className="pd-subtitle">Description</h2>
                <p className="pd-desc">{property.description}</p>
              </div>

              {amenitiesList.length > 0 && (
                <div className="pd-section">
                  <h2 className="pd-subtitle">Amenities</h2>
                  <div className="pd-amenities">
                    {amenitiesList.map((amenity, idx) => (
                      <span key={idx} className="pd-chip">✓ {amenity}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pd-right">
              <div className="card pd-contact">
                <h3 className="pd-contact-title">{contactLabel}</h3>
                <div className="pd-owner">
                  <div className="pd-avatar">{ownerInitial}</div>
                  <div>
                    <div className="pd-owner-label">{contactRoleLabel}</div>
                    <div className="pd-owner-name">{ownerDisplayName}</div>
                    {agentLoading ? (
                      <div className="pd-owner-phone">Assigning agent…</div>
                    ) : validContactPhone ? (
                      <div className="pd-owner-phone">{contactPhone}</div>
                    ) : (
                      <div className="pd-owner-phone pd-muted">Agent contact will be assigned shortly.</div>
                    )}
                  </div>
                </div>
                <div className="pd-contact-actions">
                  <button className="pd-btn pd-btn-wa" disabled={!validContactPhone}
                          onClick={() => validContactPhone && window.open(waHref, "_blank")}
                          title={validContactPhone ? "Chat on WhatsApp" : "Agent not assigned yet"}>
                    <span>💬</span><span>WhatsApp</span>
                  </button>
                  <button className="pd-btn pd-btn-phone" disabled={!validContactPhone}
                          onClick={() => validContactPhone && (window.location.href = telHref)}
                          title={validContactPhone ? "Call Agent" : "Agent not assigned yet"}>
                    <span>📞</span><span>Call</span>
                  </button>
                </div>
              </div>

              {showFeaturedSection && !featuredStatus?.featured && (
                <div className="card pd-featured">
                  <h3 className="pd-featured-title">⭐ Make Your Property Featured</h3>
                  <p className="pd-featured-desc">Get more visibility! Featured properties appear at the top of search results.</p>
                  <div className="pd-featured-pricing">
                    <div className="pd-featured-price-row">
                      <span>Original Price:</span>
                      <span className="pd-price-original">₹{featuredPrice.original}</span>
                    </div>
                    {featuredPrice.discount > 0 && (
                      <div className="pd-featured-price-row pd-discount">
                        <span>Discount:</span>
                        <span className="pd-price-discount">-₹{featuredPrice.discount}</span>
                      </div>
                    )}
                    <div className="pd-featured-price-row pd-final">
                      <span>Final Price:</span>
                      <span className="pd-price-final">₹{featuredPrice.final}</span>
                    </div>
                    <div className="pd-featured-duration">
                      <small>✓ Valid for 3 months</small>
                    </div>
                  </div>
                  <div className="pd-featured-coupon">
                    <label className="pd-coupon-label">Have a coupon code?</label>
                    <div className="pd-coupon-input-group">
                      <input type="text" className="pd-input" placeholder="Enter coupon code"
                             value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                             disabled={couponValidation?.valid} />
                      {!couponValidation?.valid ? (
                        <button onClick={handleApplyCoupon} disabled={couponApplying || !couponCode.trim()}
                                className="pd-btn pd-btn-coupon">
                          {couponApplying ? "Checking..." : "Apply"}
                        </button>
                      ) : (
                        <button onClick={handleRemoveCoupon} className="pd-btn pd-btn-remove">Remove</button>
                      )}
                    </div>
                    {couponValidation && (
                      <div className={`pd-coupon-msg ${couponValidation.valid ? "success" : "error"}`}>
                        {couponValidation.message}
                        {!couponValidation.valid && (
                          <span style={{ display: "block", marginTop: 4 }}>You can still proceed with payment below.</span>
                        )}
                      </div>
                    )}
                    <div className="pd-coupon-hint">💡 Try code: <strong>FEATURED3M</strong> for free featured listing!</div>
                  </div>
                  {dealError && <div className="pd-alert">{dealError}</div>}
                  <button onClick={handleApplyFeatured} disabled={applyingFeatured}
                          className="pd-btn pd-btn-primary" style={{ width: "100%" }}>
                    {applyingFeatured ? "Processing..." : featuredPrice.final === 0 ?
                     "Activate Featured (Free)" : `Pay ₹${featuredPrice.final} & Activate`}
                  </button>
                </div>
              )}

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
                      <span>{new Date(featuredStatus.featuredProperty.featuredUntil).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}

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
                      <p className="pd-deal-info">Stage: <strong>{existingDeal.stage}</strong></p>
                      <button onClick={() => navigate(`/deals/${existingDeal.dealId}`)} className="pd-btn pd-btn-view">
                        View Deal
                      </button>
                    </div>
                  ) : (
                    <div className="pd-deal-none">
                      <div className="pd-deal-none-badge">No Active Deal</div>
                      <div className="pd-deal-create">
                        <input type="number" className="pd-input" placeholder="Your offer amount (₹)"
                               value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} />
                        {dealError && <div className="pd-alert">{dealError}</div>}
                        <button onClick={handleCreateDeal} className="pd-btn pd-btn-primary">Create Deal</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="card pd-details">
                <h3 className="pd-details-title">Property Details</h3>
                <div className="pd-details-list">
                  <div className="pd-detail-row">
                    <span>Property ID</span>
                    <span>#{property.propertyId}</span>
                  </div>
                  <div className="pd-detail-row">
                    <span>Posted On</span>
                    <span>{new Date(property.createdAt).toLocaleDateString()}</span>
                  </div>
                  {property.user && (
                    <>
                      {(property.user.firstName || property.user.lastName) && (
                        <div className="pd-detail-row">
                          <span>Posted By</span>
                          <span>{property.user.firstName || ""} {property.user.lastName || ""}</span>
                        </div>
                      )}
                      {property.user.mobileNumber && (
                        <div className="pd-detail-row">
                          <span>Contact</span>
                          <span>{property.user.mobileNumber}</span>
                        </div>
                      )}
                    </>
                  )}
                  {property.yearBuilt && (
                    <div className="pd-detail-row">
                      <span>Year Built</span>
                      <span>{property.yearBuilt}</span>
                    </div>
                  )}
                  {property.availableFrom && (
                    <div className="pd-detail-row">
                      <span>Available From</span>
                      <span>{new Date(property.availableFrom).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button className="pd-fab" onClick={() => validContactPhone && window.open(waHref, "_blank")}
                  disabled={!validContactPhone}
                  title={validContactPhone ? "Chat on WhatsApp" : "Agent not assigned yet"}>
            💬
          </button>
        </div>

        {showImageModal && (
          <div className="pd-modal-overlay" onClick={handleCloseModal}>
            <div className="pd-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="pd-modal-close" onClick={handleCloseModal}>✕</button>
              <div className="pd-modal-image-container">
                <img src={images[modalImageIndex]} alt={`${property.title} - Image ${modalImageIndex + 1}`}
                     className="pd-modal-image" />
                {images.length > 1 && (
                  <>
                    <button onClick={handleModalPrev} className="pd-modal-nav pd-modal-left">‹</button>
                    <button onClick={handleModalNext} className="pd-modal-nav pd-modal-right">›</button>
                    <div className="pd-modal-counter">{modalImageIndex + 1} / {images.length}</div>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="pd-modal-thumbs">
                  {images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Thumbnail ${idx + 1}`}
                         className={`pd-modal-thumb ${idx === modalImageIndex ? "active" : ""}`}
                         onClick={() => setModalImageIndex(idx)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default PropertyDetails;