// src/components/Analytics/MetaEvents.js

export const trackMetaLead = (eventName = "Lead", params = {}) => {
  if (typeof window === "undefined") return;

  if (window.fbq) {
    window.fbq("track", eventName, {
      ...params
    });
    console.log("✅ Meta Lead event fired", eventName, params);
  } else {
    console.warn("⚠️ fbq not loaded");
  }
};
