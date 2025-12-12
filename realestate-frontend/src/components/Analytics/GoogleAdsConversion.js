export const triggerGoogleAdsConversion = () => {
  if (typeof window.gtag !== "function") return;

  window.gtag("event", "conversion", {
    send_to: "AW-17763220413/krxACISP38cbEL33lJZC"
  });
};
