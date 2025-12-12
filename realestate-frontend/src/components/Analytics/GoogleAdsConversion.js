// src/components/Analytics/GoogleAdsConversion.js
// Google Ads Conversion Tracking for PropertyDealz
// Conversion ID: AW-17763220413
// Conversion Label: krxACISP38cbEL33lJZC

/**
 * Triggers Google Ads conversion event
 * This fires when a user takes a lead action (view contact, call, whatsapp)
 */
export const triggerGoogleAdsConversion = () => {
  if (typeof window.gtag !== "function") {
    console.warn("⚠️ gtag not loaded - Google Ads conversion not fired");
    return;
  }

  window.gtag("event", "conversion", {
    send_to: "AW-17763220413/krxACISP38cbEL33lJZC"
  });
  
  console.log("✅ Google Ads conversion fired successfully");
};

export default triggerGoogleAdsConversion;