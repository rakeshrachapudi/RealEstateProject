// src/components/Analytics/GoogleAnalytics.jsx
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { triggerGoogleAdsConversion } from "./GoogleAdsConversion"; // ⭐ IMPORTANT

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

      {/* Google Analytics 4 */}
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </script>
    </Helmet>
  );
};

// 🔵 Generic GA4 Event
export const trackEvent = (eventName, eventParams = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

// ======================================================
// ⭐ ONLY REAL LEAD EVENTS WILL FIRE GOOGLE ADS CONVERSION
// ======================================================

// 1️⃣ PHONE CLICK → conversion
export const trackPhoneClick = (propertyId) => {
  trackEvent('phone_click', {
    property_id: propertyId,
    event_label: 'Phone Number Clicked'
  });

  // Google Ads Conversion
  triggerGoogleAdsConversion();
};

// 2️⃣ WHATSAPP → conversion
export const trackWhatsAppClick = (propertyId) => {
  trackEvent('whatsapp_click', {
    property_id: propertyId,
    event_label: 'WhatsApp Clicked'
  });

  // Google Ads Conversion
  triggerGoogleAdsConversion();
};

// 3️⃣ CONTACT BUTTON (email/contact agent) → conversion
export const trackPropertyContact = (propertyId, contactMethod) => {
  trackEvent('contact_property', {
    property_id: propertyId,
    contact_method: contactMethod,
  });

  // Google Ads Conversion
  triggerGoogleAdsConversion();
};

// ======================================================
// ❌ These DO NOT fire Google Ads conversions
// ======================================================

export const trackPropertyView = (propertyId, propertyDetails) => {
  trackEvent('view_item', {
    items: [{
      item_id: propertyId,
      item_name: propertyDetails.title,
      item_category: propertyDetails.propertyType,
      item_category2: propertyDetails.listingType,
      price: propertyDetails.price,
      location: propertyDetails.areaName
    }]
  });
};

export const trackPropertySearch = (searchParams) => {
  trackEvent('search', {
    search_term: searchParams.area || searchParams.city,
    property_type: searchParams.propertyType,
    price_range: searchParams.minPrice && searchParams.maxPrice
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
