// src/components/Analytics/GoogleAdsConversion.js
// Google Ads Conversion Tracking for PropertyDealz
// Conversion ID: AW-17763220413
// Conversion Label: krxACISP38cbEL33lJZC

/**
 * Triggers Google Ads conversion event
 * This fires when a user takes a lead action (view contact, call, whatsapp)
 */
export const triggerGoogleAdsConversion = () => {
  console.log("🔥 triggerGoogleAdsConversion called");

  if (typeof window === 'undefined') {
    console.warn("⚠️ Window not available (SSR)");
    return;
  }

  if (typeof window.gtag !== "function") {
    console.warn("⚠️ gtag not loaded - trying via dataLayer");

    // Fallback: Push to dataLayer directly
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'conversion',
      'send_to': 'AW-17763220413/krxACISP38cbEL33lJZC'
    });
    return;
  }

  try {
    window.gtag("event", "conversion", {
      send_to: "AW-17763220413/krxACISP38cbEL33lJZC"
    });
    console.log("✅ Google Ads conversion fired successfully!");
  } catch (error) {
    console.error("❌ Error firing Google Ads conversion:", error);
  }
};

export default triggerGoogleAdsConversion;