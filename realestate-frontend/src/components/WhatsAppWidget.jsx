// src/components/WhatsAppWidget.jsx
import React from 'react';
import './WhatsAppWidget.css';

const WhatsAppWidget = ({ phoneNumber = '917730051329', message }) => {
  const defaultMessage = message || 'Hi! I found a property on PropertyDealz.in and want to know more.';

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    // Track WhatsApp click
    if (window.gtag) {
      window.gtag('event', 'whatsapp_widget_click', {
        phone_number: phoneNumber
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="whatsapp-float"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
    >
      <svg viewBox="0 0 32 32" className="whatsapp-icon">
        <path fill="currentColor" d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 7.933-2.127c2.42 1.37 5.173 2.127 8.067 2.127 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.467c-2.482 0-4.908-0.646-7.07-1.87l-0.507-0.292-4.713 1.262 1.262-4.669-0.292-0.508c-1.207-2.100-1.847-4.507-1.847-6.928 0-7.435 6.050-13.485 13.485-13.485s13.485 6.050 13.485 13.485c0 7.435-6.050 13.485-13.485 13.485z"/>
        <path fill="currentColor" d="M22.455 18.77c-0.309-0.155-1.832-0.904-2.117-1.008-0.284-0.103-0.491-0.155-0.698 0.155s-0.801 1.008-0.982 1.215c-0.181 0.207-0.362 0.233-0.671 0.078s-1.309-0.482-2.493-1.538c-0.921-0.822-1.543-1.837-1.724-2.146s-0.019-0.476 0.136-0.631c0.139-0.139 0.309-0.362 0.464-0.543s0.207-0.309 0.309-0.517c0.103-0.207 0.052-0.388-0.026-0.543s-0.698-1.683-0.957-2.305c-0.252-0.605-0.508-0.523-0.698-0.533-0.181-0.009-0.388-0.011-0.595-0.011s-0.543 0.078-0.827 0.388c-0.284 0.309-1.086 1.060-1.086 2.584s1.112 2.997 1.267 3.204c0.155 0.207 2.189 3.344 5.307 4.689 0.741 0.319 1.320 0.510 1.771 0.653 0.746 0.237 1.425 0.204 1.962 0.124 0.598-0.090 1.832-0.749 2.090-1.472s0.258-1.343 0.181-1.472c-0.078-0.129-0.284-0.207-0.595-0.362z"/>
      </svg>
    </button>
  );
};

export default WhatsAppWidget;