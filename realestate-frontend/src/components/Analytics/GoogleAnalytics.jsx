// src/components/Analytics/GoogleAnalytics.jsx
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { triggerGoogleAdsConversion } from "./GoogleAdsConversion";

const GoogleAnalytics = ({ measurementId = 'G-5X8D8087C4' }) => {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', measurementId, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location, measurementId]);

  return (
    <Helmet>
      {/* Google Tag Manager */}
      <script>
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-WDMS8V96');
        `}
      </script>

      {/* Google Analytics 4 + Google Ads */}
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
          gtag('config', 'AW-17763220413');
        `}
      </script>
    </Helmet>
  );
};

// ============================================
// 🔵 Generic GA4 Event Tracker
// ============================================
export const trackEvent = (eventName, eventParams = {}) => {
  console.log(`📊 trackEvent called: ${eventName}`, eventParams);

  if (typeof window === 'undefined') {
    console.warn("⚠️ Window not available");
    return;
  }

  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
    console.log(`✅ GA4 Event sent: ${eventName}`);
  } else {
    console.warn(`⚠️ gtag not available for event: ${eventName}`);
    // Fallback to dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': eventName,
      ...eventParams
    });
    console.log(`📤 Pushed to dataLayer: ${eventName}`);
  }
};

// ============================================
// ⭐ LEAD EVENTS - Fire Google Ads Conversion
// ============================================

/**
 * 🔥 VIEW CONTACT → Primary Lead Event
 */
export const trackViewContact = (propertyId, propertyDetails = {}) => {
  console.log("🔥 trackViewContact called", { propertyId, propertyDetails });

  trackEvent('view_contact', {
    property_id: propertyId,
    property_title: propertyDetails?.title || '',
    property_price: propertyDetails?.price || 0,
    property_type: propertyDetails?.type || propertyDetails?.propertyType || '',
    listing_type: propertyDetails?.listingType || '',
    area: propertyDetails?.areaName || propertyDetails?.address || '',
    event_label: 'Contact Info Viewed',
    event_category: 'lead'
  });

  // 🔥 Fire Google Ads Conversion
  triggerGoogleAdsConversion();
};

/**
 * 📞 PHONE CLICK → Strong Lead Signal
 */
export const trackPhoneClick = (propertyId, propertyDetails = {}) => {
  console.log("📞 trackPhoneClick called", { propertyId });

  trackEvent('phone_click', {
    property_id: propertyId,
    property_title: propertyDetails?.title || '',
    event_label: 'Phone Number Clicked',
    event_category: 'lead'
  });

  // 🔥 Fire Google Ads Conversion
  triggerGoogleAdsConversion();
};

/**
 * 💬 WHATSAPP CLICK → Strong Lead Signal
 */
export const trackWhatsAppClick = (propertyId, propertyDetails = {}) => {
  console.log("💬 trackWhatsAppClick called", { propertyId });

  trackEvent('whatsapp_click', {
    property_id: propertyId,
    property_title: propertyDetails?.title || '',
    event_label: 'WhatsApp Clicked',
    event_category: 'lead'
  });

  // 🔥 Fire Google Ads Conversion
  triggerGoogleAdsConversion();
};

/**
 * 📧 CONTACT PROPERTY → Generic Contact Action
 */
export const trackPropertyContact = (propertyId, contactMethod, propertyDetails = {}) => {
  console.log("📧 trackPropertyContact called", { propertyId, contactMethod });

  trackEvent('contact_property', {
    property_id: propertyId,
    contact_method: contactMethod,
    property_title: propertyDetails?.title || '',
    event_category: 'lead'
  });

  // 🔥 Fire Google Ads Conversion
  triggerGoogleAdsConversion();
};

// ============================================
// ❌ NON-LEAD EVENTS - GA4 Only
// ============================================

export const trackPropertyView = (propertyId, propertyDetails = {}) => {
  trackEvent('view_item', {
    items: [{
      item_id: propertyId,
      item_name: propertyDetails?.title || 'Property',
      item_category: propertyDetails?.propertyType || propertyDetails?.type || 'property',
      item_category2: propertyDetails?.listingType || 'unknown',
      price: propertyDetails?.price || 0,
      location: propertyDetails?.areaName || propertyDetails?.address || ''
    }]
  });
};

export const trackPropertySearch = (searchParams = {}) => {
  trackEvent('search', {
    search_term: searchParams?.area || searchParams?.city || 'unknown',
    property_type: searchParams?.propertyType || 'any',
    price_range: searchParams?.minPrice && searchParams?.maxPrice
      ? `${searchParams.minPrice}-${searchParams.maxPrice}`
      : 'any'
  });
};

export const trackPropertyShare = (propertyId, shareMethod) => {
  trackEvent('share', {
    content_type: 'property',
    item_id: propertyId,
    method: shareMethod
  });
};

export const trackPropertyPost = (propertyId, propertyType, listingType) => {
  trackEvent('post_property', {
    property_id: propertyId,
    property_type: propertyType,
    listing_type: listingType
  });
};

export const trackUserSignup = (method) => {
  trackEvent('sign_up', { method });
};

export const trackUserLogin = (method) => {
  trackEvent('login', { method });
};

export default GoogleAnalytics;