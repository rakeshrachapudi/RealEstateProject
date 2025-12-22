// src/components/SEO/SEOComponents.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Breadcrumb Component with Schema Support
 */
export const SEOBreadcrumb = ({ items }) => {
  return (
    <nav className="seo-breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={item.url}>
          {index > 0 && <span className="seo-breadcrumb-separator">›</span>}
          {index === items.length - 1 ? (
            <span aria-current="page">{item.name}</span>
          ) : (
            <Link to={item.url}>{item.name}</Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

/**
 * FAQ Section with Accordion
 */
export const SEOFaqSection = ({ faqs, title = "Frequently Asked Questions" }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="seo-faq">
      <h2>{title}</h2>
      {faqs.map((faq, index) => (
        <div
          key={index}
          className={`seo-faq-item ${openIndex === index ? 'open' : ''}`}
        >
          <button
            className="seo-faq-question"
            onClick={() => toggleFaq(index)}
            aria-expanded={openIndex === index}
          >
            {faq.question}
            <span className="seo-faq-icon">+</span>
          </button>
          <div className="seo-faq-answer">
            <p>{faq.answer}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

/**
 * Why PropertyDealz Benefits Section
 */
export const SEOBenefits = () => {
  const benefits = [
    {
      icon: '₹0',
      title: 'Zero Brokerage',
      description: 'Save lakhs on brokerage fees with direct owner connections'
    },
    {
      icon: '✓',
      title: 'Verified Listings',
      description: 'Every property is verified for authenticity and ownership'
    },
    {
      icon: '📞',
      title: 'Direct Contact',
      description: 'Connect directly with property owners, no middlemen'
    },
    {
      icon: '🔒',
      title: 'Secure Deals',
      description: 'End-to-end deal support with legal documentation'
    }
  ];

  return (
    <section className="seo-benefits">
      <h2>Why Choose PropertyDealz?</h2>
      <div className="seo-benefits-grid">
        {benefits.map((benefit, index) => (
          <div key={index} className="seo-benefit-item">
            <div className="seo-benefit-icon">{benefit.icon}</div>
            <div className="seo-benefit-content">
              <h4>{benefit.title}</h4>
              <p>{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/**
 * CTA Button Group
 */
export const SEOCtaGroup = ({
  primaryText = "Get Verified Listings",
  primaryLink = "/search",
  showWhatsApp = true,
  whatsAppMessage = "Hi! I'm interested in properties in Hyderabad"
}) => {
  const whatsAppLink = `https://wa.me/917730051329?text=${encodeURIComponent(whatsAppMessage)}`;

  return (
    <div className="seo-cta-group">
      <Link to={primaryLink} className="seo-btn seo-btn-primary">
        {primaryText} →
      </Link>
      {showWhatsApp && (
        <a
          href={whatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className="seo-btn seo-btn-whatsapp"
        >
          💬 WhatsApp Us
        </a>
      )}
      <a href="tel:+917730051329" className="seo-btn seo-btn-secondary">
        📞 Call Now
      </a>
    </div>
  );
};

/**
 * Sticky Mobile CTA
 */
export const SEOStickyCta = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`seo-sticky-cta ${isVisible ? 'visible' : ''}`}>
      <a href="tel:+917730051329" className="seo-btn seo-btn-primary">
        📞 Call
      </a>
      <a
        href="https://wa.me/917730051329?text=Hi!%20I'm%20looking%20for%20property%20in%20Hyderabad"
        target="_blank"
        rel="noopener noreferrer"
        className="seo-btn seo-btn-whatsapp"
      >
        💬 WhatsApp
      </a>
    </div>
  );
};

/**
 * Internal Links Section
 */
export const SEOInternalLinks = ({ links, title = "Related Searches" }) => {
  return (
    <div className="seo-internal-links">
      <h3>{title}</h3>
      <div className="seo-internal-links-list">
        {links.map((link, index) => (
          <Link key={index} to={link.url} className="seo-internal-link">
            {link.text}
          </Link>
        ))}
      </div>
    </div>
  );
};

/**
 * Popular Localities Section
 */
export const SEOLocalityGrid = ({ localities, baseUrl = "/area" }) => {
  return (
    <div className="seo-locality-grid">
      {localities.map((locality, index) => (
        <Link
          key={index}
          to={`${baseUrl}/${locality.toLowerCase().replace(/\s+/g, '-')}`}
          className="seo-locality-tag"
        >
          {locality}
        </Link>
      ))}
    </div>
  );
};

/**
 * Price Range Filter Cards
 */
export const SEOPriceRangeCards = ({ propertyType = "flats", listingType = "sale" }) => {
  const priceRanges = [
    { label: 'Under', value: '₹50 Lakhs', max: 5000000 },
    { label: 'Under', value: '₹1 Crore', max: 10000000 },
    { label: '₹1 - 2', value: 'Crore', min: 10000000, max: 20000000 },
    { label: 'Above', value: '₹2 Crore', min: 20000000 }
  ];

  return (
    <div className="seo-price-grid">
      {priceRanges.map((range, index) => (
        <Link
          key={index}
          to={`/search?type=${propertyType}&listing=${listingType}${range.min ? `&minPrice=${range.min}` : ''}${range.max ? `&maxPrice=${range.max}` : ''}`}
          className="seo-price-card"
        >
          <div className="seo-price-card-label">{range.label}</div>
          <div className="seo-price-card-value">{range.value}</div>
        </Link>
      ))}
    </div>
  );
};

/**
 * Legal Checklist Component
 */
export const SEOLegalChecklist = ({ items, title = "Legal Verification Checklist" }) => {
  return (
    <div className="seo-checklist">
      <h3>✅ {title}</h3>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Comparison Table
 */
export const SEOComparisonTable = ({ headers, rows }) => {
  return (
    <table className="seo-comparison-table">
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default {
  SEOBreadcrumb,
  SEOFaqSection,
  SEOBenefits,
  SEOCtaGroup,
  SEOStickyCta,
  SEOInternalLinks,
  SEOLocalityGrid,
  SEOPriceRangeCards,
  SEOLegalChecklist,
  SEOComparisonTable
};