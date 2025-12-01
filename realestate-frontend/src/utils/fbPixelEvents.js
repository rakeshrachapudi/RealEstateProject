// src/utils/fbPixelEvents.js

/**
 * Facebook Pixel Event Tracking Utilities
 */

export const trackFBPropertyView = (property) => {
  if (window.fbq) {
    const pixelIds = ['25079012878428180', '868151089247460'];

    pixelIds.forEach(id => {
      window.fbq('trackSingle', id, 'ViewContent', {
        content_ids: [property.id || property.propertyId],
        content_type: 'product',
        content_name: property.title,
        content_category: property.propertyType,
        value: property.price || 0,
        currency: 'INR'
      });
    });
  }
};

export const trackFBPropertySearch = (searchParams) => {
  if (window.fbq) {
    const pixelIds = ['25079012878428180', '868151089247460'];

    pixelIds.forEach(id => {
      window.fbq('trackSingle', id, 'Search', {
        search_string: searchParams.area || searchParams.city,
        content_category: searchParams.propertyType || 'all',
        content_ids: []
      });
    });
  }
};

export const trackFBPropertyContact = (property) => {
  if (window.fbq) {
    const pixelIds = ['25079012878428180', '868151089247460'];

    pixelIds.forEach(id => {
      window.fbq('trackSingle', id, 'Contact', {
        content_ids: [property.id || property.propertyId],
        content_name: property.title,
        value: property.price || 0,
        currency: 'INR'
      });
    });
  }
};

export const trackFBLead = (property) => {
  if (window.fbq) {
    const pixelIds = ['25079012878428180', '868151089247460'];

    pixelIds.forEach(id => {
      window.fbq('trackSingle', id, 'Lead', {
        content_ids: [property.id || property.propertyId],
        content_name: property.title,
        content_category: property.propertyType,
        value: property.price || 0,
        currency: 'INR'
      });
    });
  }
};

export const trackFBAddToWishlist = (property) => {
  if (window.fbq) {
    const pixelIds = ['25079012878428180', '868151089247460'];

    pixelIds.forEach(id => {
      window.fbq('trackSingle', id, 'AddToWishlist', {
        content_ids: [property.id || property.propertyId],
        content_name: property.title,
        value: property.price || 0,
        currency: 'INR'
      });
    });
  }
};

export default {
  trackFBPropertyView,
  trackFBPropertySearch,
  trackFBPropertyContact,
  trackFBLead,
  trackFBAddToWishlist
};
// Add to END of your existing fbPixelEvents.js:

export const trackFBInitiateCheckout = (deal) => {
  if (window.fbq) {
    const pixelIds = ['25079012878428180', '868151089247460'];

    pixelIds.forEach(id => {
      window.fbq('trackSingle', id, 'InitiateCheckout', {
        content_ids: [deal.propertyId],
        content_name: deal.property?.title || 'Property Deal',
        value: deal.offerAmount || deal.property?.price || 0,
        currency: 'INR',
        num_items: 1
      });
    });
  }
};

export const trackFBPurchase = (deal) => {
  if (window.fbq) {
    const pixelIds = ['25079012878428180', '868151089247460'];

    pixelIds.forEach(id => {
      window.fbq('trackSingle', id, 'Purchase', {
        content_ids: [deal.propertyId],
        content_name: deal.property?.title || 'Property',
        value: deal.finalAmount || deal.property?.price || 0,
        currency: 'INR',
        num_items: 1
      });
    });
  }
};

export const trackFBCompleteRegistration = (userData = {}) => {
  if (window.fbq) {
    const pixelIds = ['25079012878428180', '868151089247460'];

    pixelIds.forEach(id => {
      window.fbq('trackSingle', id, 'CompleteRegistration', {
        content_name: 'User Registration',
        status: 'completed'
      });
    });
  }
};

// UPDATE default export to include new functions:
export default {
  trackFBPropertyView,
  trackFBPropertySearch,
  trackFBPropertyContact,
  trackFBLead,
  trackFBAddToWishlist,
  trackFBInitiateCheckout,       // ADD THIS
  trackFBPurchase,                // ADD THIS
  trackFBCompleteRegistration     // ADD THIS
};