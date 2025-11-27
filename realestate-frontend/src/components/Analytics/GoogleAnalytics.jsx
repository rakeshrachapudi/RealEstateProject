// src/components/Analytics/GoogleAnalytics.jsx
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const GoogleAnalytics = ({ measurementId = 'G-5X8D8087C4' }) => {
  const location = useLocation();

  useEffect(() => {
    // Track page views on route change
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
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            send_page_view: false
          });
        `}
      </script>
    </Helmet>
  );
};

// Event tracking utilities
export const trackEvent = (eventName, eventParams = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

export const trackPhoneClick = (propertyId) => {
  trackEvent('phone_click', {
    property_id: propertyId,
    event_label: 'Phone Number Clicked'
  });
};


// Specific event trackers for PropertyDealz
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

export const trackPropertyContact = (propertyId, contactMethod) => {
  trackEvent('contact_property', {
    property_id: propertyId,
    contact_method: contactMethod, // 'phone', 'whatsapp', 'email'
  });
};

export const trackPropertyShare = (propertyId, shareMethod) => {
  trackEvent('share', {
    content_type: 'property',
    item_id: propertyId,
    method: shareMethod // 'facebook', 'twitter', 'whatsapp', 'copy_link'
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
  trackEvent('sign_up', {
    method: method // 'email', 'otp', 'social'
  });
};

export const trackUserLogin = (method) => {
  trackEvent('login', {
    method: method
  });
};

export default GoogleAnalytics;