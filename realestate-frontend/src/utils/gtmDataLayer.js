// src/utils/gtmDataLayer.js

/**
 * Google Tag Manager DataLayer Utilities
 *
 * These functions push events to GTM's dataLayer which can then be used
 * to trigger tags, track conversions, and send data to GA4, Facebook, Google Ads, etc.
 */

/**
 * Push custom event to dataLayer
 */
export const pushToDataLayer = (eventData) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(eventData);
    console.log('GTM Event Pushed:', eventData);
  } else {
    console.warn('DataLayer not available');
  }
};

/**
 * Track page view
 */
export const trackPageView = (pagePath, pageTitle) => {
  pushToDataLayer({
    event: 'pageview',
    page: {
      path: pagePath,
      title: pageTitle,
      url: window.location.href
    }
  });
};

/**
 * Track property view
 */
export const trackPropertyView = (property) => {
  pushToDataLayer({
    event: 'view_item',
    ecommerce: {
      items: [{
        item_id: property.id || property.propertyId,
        item_name: property.title,
        item_category: property.propertyType,
        item_category2: property.listingType,
        item_category3: property.areaName,
        price: property.price || 0,
        currency: 'INR',
        item_brand: 'PropertyDealz',
        item_variant: `${property.bedrooms}BHK`
      }]
    },
    property_id: property.id || property.propertyId,
    property_type: property.propertyType,
    listing_type: property.listingType,
    location: property.areaName,
    price: property.price || 0
  });
};

/**
 * Track property search
 */
export const trackPropertySearch = (searchParams) => {
  pushToDataLayer({
    event: 'search',
    search_term: searchParams.area || searchParams.city,
    search_parameters: {
      property_type: searchParams.propertyType || 'all',
      listing_type: searchParams.listingType || 'all',
      min_price: searchParams.minPrice || null,
      max_price: searchParams.maxPrice || null,
      location: searchParams.area || searchParams.city,
      bedrooms: searchParams.bedrooms || null
    }
  });
};

/**
 * Track contact interaction (phone, whatsapp, email)
 */
export const trackContact = (propertyId, contactMethod, propertyDetails = {}) => {
  pushToDataLayer({
    event: 'contact',
    contact_method: contactMethod, // 'phone', 'whatsapp', 'email'
    property_id: propertyId,
    property_type: propertyDetails.propertyType,
    property_price: propertyDetails.price || 0,
    property_location: propertyDetails.areaName
  });
};

/**
 * Track lead generation (form submission)
 */
export const trackLead = (leadData) => {
  pushToDataLayer({
    event: 'generate_lead',
    lead_type: leadData.type, // 'property_inquiry', 'callback_request', etc.
    property_id: leadData.propertyId || null,
    value: leadData.propertyValue || 0,
    currency: 'INR',
    user_data: {
      phone: leadData.phone || null,
      email: leadData.email || null,
      name: leadData.name || null
    }
  });
};

/**
 * Track property listing (when user posts a property)
 */
export const trackPropertyPost = (property) => {
  pushToDataLayer({
    event: 'post_property',
    property_id: property.id || property.propertyId,
    property_type: property.propertyType,
    listing_type: property.listingType,
    price: property.price || 0,
    location: property.areaName
  });
};

/**
 * Track user registration
 */
export const trackSignup = (signupMethod, userId = null) => {
  pushToDataLayer({
    event: 'sign_up',
    method: signupMethod, // 'email', 'phone', 'google', 'facebook'
    user_id: userId
  });
};

/**
 * Track user login
 */
export const trackLogin = (loginMethod, userId = null) => {
  pushToDataLayer({
    event: 'login',
    method: loginMethod,
    user_id: userId
  });
};

/**
 * Track phone click
 */
export const trackPhoneClick = (propertyId, phoneNumber) => {
  pushToDataLayer({
    event: 'phone_click',
    property_id: propertyId,
    phone_number: phoneNumber
  });

  // Also track as contact
  trackContact(propertyId, 'phone');
};

/**
 * Track WhatsApp click
 */
export const trackWhatsAppClick = (propertyId, phoneNumber) => {
  pushToDataLayer({
    event: 'whatsapp_click',
    property_id: propertyId,
    phone_number: phoneNumber
  });

  // Also track as contact
  trackContact(propertyId, 'whatsapp');
};

/**
 * Track email click
 */
export const trackEmailClick = (propertyId, email) => {
  pushToDataLayer({
    event: 'email_click',
    property_id: propertyId,
    email: email
  });

  // Also track as contact
  trackContact(propertyId, 'email');
};

/**
 * Track property share
 */
export const trackShare = (propertyId, shareMethod) => {
  pushToDataLayer({
    event: 'share',
    content_type: 'property',
    item_id: propertyId,
    method: shareMethod // 'facebook', 'twitter', 'whatsapp', 'copy_link'
  });
};

/**
 * Track property shortlist/favorite
 */
export const trackAddToWishlist = (property) => {
  pushToDataLayer({
    event: 'add_to_wishlist',
    ecommerce: {
      items: [{
        item_id: property.id || property.propertyId,
        item_name: property.title,
        item_category: property.propertyType,
        price: property.price || 0,
        currency: 'INR'
      }]
    }
  });
};

/**
 * Track filter usage
 */
export const trackFilterUsage = (filters) => {
  pushToDataLayer({
    event: 'filter_applied',
    filters: filters
  });
};

/**
 * Track scroll depth (25%, 50%, 75%, 100%)
 */
export const trackScrollDepth = (percentage) => {
  pushToDataLayer({
    event: 'scroll_depth',
    scroll_percentage: percentage,
    page_path: window.location.pathname
  });
};

/**
 * Track outbound link clicks
 */
export const trackOutboundLink = (url, linkText) => {
  pushToDataLayer({
    event: 'outbound_link_click',
    link_url: url,
    link_text: linkText
  });
};

/**
 * Track video play
 */
export const trackVideoPlay = (videoTitle, videoUrl) => {
  pushToDataLayer({
    event: 'video_play',
    video_title: videoTitle,
    video_url: videoUrl
  });
};

/**
 * Track file download
 */
export const trackFileDownload = (fileName, fileType) => {
  pushToDataLayer({
    event: 'file_download',
    file_name: fileName,
    file_type: fileType
  });
};

/**
 * Track error/exception
 */
export const trackError = (errorMessage, errorType, errorLocation) => {
  pushToDataLayer({
    event: 'exception',
    error_message: errorMessage,
    error_type: errorType,
    error_location: errorLocation,
    fatal: false
  });
};

/**
 * Track custom conversion (for Google Ads)
 */
export const trackConversion = (conversionLabel, value = 0, transactionId = null) => {
  pushToDataLayer({
    event: 'conversion',
    conversion_label: conversionLabel,
    value: value,
    currency: 'INR',
    transaction_id: transactionId
  });
};

/**
 * Enhanced ecommerce - Begin checkout (property inquiry process)
 */
export const trackBeginCheckout = (property) => {
  pushToDataLayer({
    event: 'begin_checkout',
    ecommerce: {
      items: [{
        item_id: property.id || property.propertyId,
        item_name: property.title,
        item_category: property.propertyType,
        price: property.price || 0,
        currency: 'INR'
      }]
    }
  });
};

/**
 * Track user engagement time
 */
export const trackEngagement = (engagementTimeSeconds) => {
  pushToDataLayer({
    event: 'user_engagement',
    engagement_time_msec: engagementTimeSeconds * 1000
  });
};

/**
 * Initialize dataLayer if it doesn't exist
 */
export const initDataLayer = () => {
  if (typeof window !== 'undefined' && !window.dataLayer) {
    window.dataLayer = [];
    console.log('DataLayer initialized');
  }
};

export default {
  pushToDataLayer,
  trackPageView,
  trackPropertyView,
  trackPropertySearch,
  trackContact,
  trackLead,
  trackPropertyPost,
  trackSignup,
  trackLogin,
  trackPhoneClick,
  trackWhatsAppClick,
  trackEmailClick,
  trackShare,
  trackAddToWishlist,
  trackFilterUsage,
  trackScrollDepth,
  trackOutboundLink,
  trackVideoPlay,
  trackFileDownload,
  trackError,
  trackConversion,
  trackBeginCheckout,
  trackEngagement,
  initDataLayer
};