// src/utils/dealDataEnricher.js
/**
 * Deal Data Enrichment Utility
 * Transforms backend deal response into frontend-friendly format
 * Handles nested objects and provides fallbacks for missing data
 */

/**
 * Enriches a single deal object with flattened buyer, seller, and agent information
 * @param {Object} deal - Raw deal object from backend
 * @returns {Object} - Enriched deal object with flat fields
 */
export const enrichDealData = (deal) => {
  if (!deal) return null;

  // ✅ Extract Buyer Information
  const buyerName =
    deal.buyerName ||
    (deal.buyer?.firstName && deal.buyer?.lastName
      ? `${deal.buyer.firstName} ${deal.buyer.lastName}`.trim()
      : deal.buyer?.firstName || deal.buyer?.lastName || null);

  const buyerEmail =
    deal.buyerEmail ||
    deal.buyer?.email ||
    null;

  const buyerMobile =
    deal.buyerMobile ||
    deal.buyer?.mobileNumber ||
    deal.buyer?.mobile ||
    deal.buyer?.phone ||
    null;

  const buyerId =
    deal.buyerId ||
    deal.buyer?.id ||
    deal.buyer?.userId ||
    null;

  // ✅ Extract Seller Information
  const sellerName =
    deal.sellerName ||
    (deal.seller?.firstName && deal.seller?.lastName
      ? `${deal.seller.firstName} ${deal.seller.lastName}`.trim()
      : deal.seller?.firstName || deal.seller?.lastName ||
        (deal.property?.user?.firstName && deal.property?.user?.lastName
          ? `${deal.property.user.firstName} ${deal.property.user.lastName}`.trim()
          : deal.property?.user?.firstName || deal.property?.user?.lastName || null));

  const sellerEmail =
    deal.sellerEmail ||
    deal.seller?.email ||
    deal.property?.user?.email ||
    null;

  const sellerMobile =
    deal.sellerMobile ||
    deal.seller?.mobileNumber ||
    deal.seller?.mobile ||
    deal.seller?.phone ||
    deal.property?.user?.mobileNumber ||
    deal.property?.user?.mobile ||
    null;

  const sellerId =
    deal.sellerId ||
    deal.seller?.id ||
    deal.seller?.userId ||
    deal.property?.userId ||
    deal.property?.user?.id ||
    null;

  // ✅ Extract Agent Information
  const agentName =
    deal.agentName ||
    (deal.agent?.firstName && deal.agent?.lastName
      ? `${deal.agent.firstName} ${deal.agent.lastName}`.trim()
      : deal.agent?.firstName || deal.agent?.lastName || null);

  const agentEmail =
    deal.agentEmail ||
    deal.agent?.email ||
    null;

  const agentMobile =
    deal.agentMobile ||
    deal.agent?.mobileNumber ||
    deal.agent?.mobile ||
    deal.agent?.phone ||
    null;

  const agentId =
    deal.agentId ||
    deal.agent?.id ||
    deal.agent?.userId ||
    null;

  // ✅ Extract Property Information
  const propertyTitle =
    deal.propertyTitle ||
    deal.property?.title ||
    deal.property?.propertyTitle ||
    `${deal.property?.propertyType?.typeName || deal.property?.type || "Property"} in ${
      deal.property?.areaName || deal.property?.cityName || deal.property?.city || "Location"
    }`;

  const propertyCity =
    deal.propertyCity ||
    deal.property?.cityName ||
    deal.property?.city ||
    "Hyderabad";

  const propertyLocation =
    deal.propertyLocation ||
    deal.property?.areaName ||
    deal.property?.area?.areaName ||
    deal.property?.area?.name ||
    deal.property?.location ||
    propertyCity;

  const propertyPrice =
    deal.propertyPrice ||
    deal.listingPrice ||
    deal.property?.price ||
    null;

  const propertyId =
    deal.propertyId ||
    deal.property?.id ||
    deal.property?.propertyId ||
    null;

  // ✅ Extract Deal Stage Information
  const currentStage =
    deal.currentStage ||
    deal.stage ||
    "INQUIRY";

  // ✅ Extract Price Information
  const agreedPrice =
    deal.agreedPrice ||
    null;

  // ✅ Extract Deal ID
  const dealId =
    deal.dealId ||
    deal.id ||
    null;

  // ✅ Return Enriched Deal Object
  return {
    ...deal, // Keep all original fields

    // Flattened IDs
    dealId,
    buyerId,
    sellerId,
    agentId,
    propertyId,

    // Buyer Information
    buyerName: buyerName || "Buyer information updating",
    buyerEmail: buyerEmail || null,
    buyerMobile: buyerMobile || null,
    buyer: deal.buyer || null, // Keep original nested object

    // Seller Information
    sellerName: sellerName || "Seller information updating",
    sellerEmail: sellerEmail || null,
    sellerMobile: sellerMobile || null,
    seller: deal.seller || null, // Keep original nested object

    // Agent Information
    agentName: agentName || "Agent assignment in progress",
    agentEmail: agentEmail || null,
    agentMobile: agentMobile || null,
    agent: deal.agent || null, // Keep original nested object

    // Property Information
    propertyTitle,
    propertyCity,
    propertyLocation,
    propertyPrice,
    property: deal.property || null, // Keep original nested object

    // Deal Information
    currentStage,
    stage: currentStage, // Ensure both fields exist
    agreedPrice,

    // Timestamps
    createdAt: deal.createdAt || null,
    updatedAt: deal.updatedAt || null,

    // Additional dates
    inquiryDate: deal.inquiryDate || deal.createdAt || null,
    shortlistDate: deal.shortlistDate || null,
    negotiationDate: deal.negotiationDate || null,
    agreementDate: deal.agreementDate || null,
    registrationDate: deal.registrationDate || null,
    paymentDate: deal.paymentDate || null,
    completedDate: deal.completedDate || null,

    // Status flags
    buyerDocUploaded: deal.buyerDocUploaded || false,
    sellerConfirmed: deal.sellerConfirmed || false,
    adminVerified: deal.adminVerified || false,
    paymentInitiated: deal.paymentInitiated || false,
    paymentCompleted: deal.paymentCompleted || false,

    // Notes
    notes: deal.notes || null,
  };
};

/**
 * Enriches an array of deals
 * @param {Array} deals - Array of raw deal objects
 * @returns {Array} - Array of enriched deal objects
 */
export const enrichDealsArray = (deals) => {
  if (!Array.isArray(deals)) return [];
  return deals.map(deal => enrichDealData(deal)).filter(Boolean);
};

/**
 * Formats price for display
 * @param {number} price - Price value
 * @returns {string} - Formatted price string
 */
export const formatDealPrice = (price) => {
  if (!price || isNaN(price) || price === 0) {
    return "Price being finalized";
  }

  const numPrice = Number(price);
  if (numPrice >= 10000000) return `₹${(numPrice / 10000000).toFixed(1)} Cr`;
  if (numPrice >= 100000) return `₹${(numPrice / 100000).toFixed(1)} Lakh`;
  return `₹${numPrice.toLocaleString("en-IN")}`;
};

/**
 * Gets display name for a person (buyer/seller/agent)
 * @param {Object} person - Person object with firstName, lastName, etc.
 * @param {string} fallback - Fallback text if name not found
 * @returns {string} - Display name
 */
export const getPersonDisplayName = (person, fallback = "N/A") => {
  if (!person) return fallback;

  if (person.firstName && person.lastName) {
    return `${person.firstName} ${person.lastName}`.trim();
  }

  if (person.firstName) return person.firstName;
  if (person.lastName) return person.lastName;
  if (person.name) return person.name;

  return fallback;
};

/**
 * Gets stage color for visual display
 * @param {string} stage - Deal stage
 * @returns {string} - Color hex code
 */
export const getDealStageColor = (stage) => {
  const colors = {
    INQUIRY: "#3b82f6",
    SHORTLIST: "#8b5cf6",
    NEGOTIATION: "#f59e0b",
    AGREEMENT: "#10b981",
    REGISTRATION: "#06b6d4",
    PAYMENT: "#ec4899",
    COMPLETED: "#22c55e",
  };
  return colors[stage?.toUpperCase()] || "#6b7280";
};

/**
 * Gets stage display name
 * @param {string} stage - Deal stage
 * @returns {string} - Display name
 */
export const getDealStageDisplay = (stage) => {
  const stageMap = {
    INQUIRY: "Inquiry",
    SHORTLIST: "Shortlisted",
    NEGOTIATION: "Negotiation",
    AGREEMENT: "Agreement",
    REGISTRATION: "Registration",
    PAYMENT: "Payment",
    COMPLETED: "Completed",
  };

  const upperStage = stage?.toString().toUpperCase();
  return stageMap[upperStage] || stage || "Unknown";
};

/**
 * Debug function to log deal data structure
 * @param {Object} deal - Deal object
 * @param {string} context - Context description
 */
export const debugDealData = (deal, context = "Deal Data") => {
  console.group(`🔍 ${context}`);
  console.log("Raw deal object:", deal);
  console.log("Buyer info:", {
    buyerName: deal.buyerName,
    buyerEmail: deal.buyerEmail,
    buyerMobile: deal.buyerMobile,
    nestedBuyer: deal.buyer
  });
  console.log("Seller info:", {
    sellerName: deal.sellerName,
    sellerEmail: deal.sellerEmail,
    sellerMobile: deal.sellerMobile,
    nestedSeller: deal.seller
  });
  console.log("Agent info:", {
    agentName: deal.agentName,
    agentEmail: deal.agentEmail,
    agentMobile: deal.agentMobile,
    nestedAgent: deal.agent
  });
  console.log("Property info:", {
    propertyTitle: deal.propertyTitle,
    propertyCity: deal.propertyCity,
    propertyLocation: deal.propertyLocation,
    nestedProperty: deal.property
  });
  console.groupEnd();
};

export default {
  enrichDealData,
  enrichDealsArray,
  formatDealPrice,
  getPersonDisplayName,
  getDealStageColor,
  getDealStageDisplay,
  debugDealData
};