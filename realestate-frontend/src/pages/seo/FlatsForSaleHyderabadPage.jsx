// src/pages/seo/FlatsForSaleHyderabadPage.jsx
// MONEY PAGE #2 - /flats-for-sale-in-hyderabad/
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEO/SEOHead';
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateCollectionPageSchema
} from '../../components/SEO/StructuredData';
import {
  SEOBreadcrumb,
  SEOFaqSection,
  SEOBenefits,
  SEOCtaGroup,
  SEOStickyCta,
  SEOInternalLinks,
  SEOLocalityGrid,
  SEOPriceRangeCards
} from '../../components/SEO/SEOComponents';
import PropertyList from '../../components/PropertyList';
import { propertyService } from '../../services/api';

const FlatsForSaleHyderabadPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ REQUIRED NORMALIZER (PropertyList depends on id)
  const normalizeProperty = (p) => ({
    ...p,
    id: p.propertyId ?? p.id,
    isActive: true
  });

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await propertyService.getAll({
          city: 'Hyderabad',
          propertyType: 'Apartment',
          listingType: 'Sale'
          // ❌ limit removed intentionally
        });

        const list = Array.isArray(response) ? response : [];
        setProperties(list.map(normalizeProperty));
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // SEO Data
  const pageTitle =
    "Flats for Sale in Hyderabad | 1, 2 & 3 BHK Apartments";
  const pageDescription =
    "Explore flats for sale in Hyderabad. Budget & premium 1BHK, 2BHK, 3BHK apartments under ₹50L, ₹1Cr, ₹2Cr. Ready-to-move & under construction options. Zero brokerage.";
  const pageKeywords =
    "flats for sale hyderabad, apartments for sale hyderabad, 1bhk flat hyderabad, 2bhk flat hyderabad, 3bhk flat hyderabad, ready to move flats hyderabad";
  const canonicalUrl =
    "https://www.propertydealz.in/flats-for-sale-in-hyderabad/";

  // Breadcrumb
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Hyderabad', url: '/hyderabad/' },
    { name: 'Flats for Sale in Hyderabad', url: '/flats-for-sale-in-hyderabad/' }
  ];

  // Budget-wise localities
  const budgetLocalities = {
    affordable: ['Bachupally', 'Nizampet', 'Patancheru', 'Kompally', 'Pragathi Nagar'],
    midRange: ['Kukatpally', 'Miyapur', 'Manikonda', 'Nallagandla', 'Chandanagar'],
    premium: ['Gachibowli', 'HITEC City', 'Kondapur', 'Madhapur', 'Financial District'],
    luxury: ['Jubilee Hills', 'Banjara Hills', 'Film Nagar', 'Madhapur (Premium)']
  };

  // FAQs
  const faqs = [
    {
      question: "Where can I find flats under ₹50 lakhs in Hyderabad?",
      answer:
        "Affordable flats under ₹50 lakhs are available in areas like Bachupally, Nizampet, Patancheru, Kompally, and Medchal."
    },
    {
      question: "Are ready-to-move flats better than under-construction?",
      answer:
        "Ready-to-move flats offer immediate possession and no GST, while under-construction flats are cheaper but carry delivery risk."
    },
    {
      question: "What is the per square foot rate for flats in Hyderabad?",
      answer:
        "Rates range from ₹3,500/sq.ft in outskirts to ₹25,000+/sq.ft in luxury localities like Jubilee Hills."
    },
    {
      question: "Which builders are reliable?",
      answer:
        "My Home, Aparna, Prestige, Rajapushpa, Ramky, Vasavi, Sumadhura and others."
    },
    {
      question: "What amenities should I look for?",
      answer:
        "Security, power backup, parking, lift, water supply. Premium projects add clubhouse, pool, gym."
    }
  ];

  // Structured Data
  const structuredData = [
    generateBreadcrumbSchema(breadcrumbItems),
    generateFAQSchema(faqs),
    generateCollectionPageSchema(
      'Hyderabad',
      properties.length,
      pageDescription
    )
  ];

  // Internal links
  const internalLinks = [
    { text: 'Buy Flat in Hyderabad', url: '/buy-flat-in-hyderabad/' },
    { text: 'Plots for Sale Hyderabad', url: '/plots-for-sale-in-hyderabad/' },
    { text: 'Independent Houses Hyderabad', url: '/independent-houses-for-sale-hyderabad/' },
    { text: 'Property in Hyderabad', url: '/hyderabad/' },
    { text: 'Kukatpally Flats', url: '/area/kukatpally' },
    { text: 'Miyapur Apartments', url: '/area/miyapur' }
  ];

  return (
    <div className="seo-page">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
        canonicalUrl={canonicalUrl}
        ogUrl={canonicalUrl}
        structuredData={structuredData}
      />

      {/* Hero Section */}
      <section className="seo-hero">
        <div className="seo-hero-container">
          <SEOBreadcrumb items={breadcrumbItems} />

          <h1>Flats for Sale in Hyderabad – Budget & Premium Apartments</h1>

          <p className="seo-hero-subtitle">
            Explore flats for sale in Hyderabad across all budgets with zero brokerage.
          </p>

          <SEOCtaGroup
            primaryText="View All Flats"
            primaryLink="/search?propertyType=Apartment&listingType=Sale&city=Hyderabad"
            whatsAppMessage="Hi! I'm looking for flats for sale in Hyderabad"
          />
        </div>
      </section>

      <div className="seo-content seo-content-narrow">

        <section className="seo-section">
          <h2>Browse Flats by Budget</h2>
          <SEOPriceRangeCards propertyType="Apartment" listingType="Sale" />
        </section>

        <section className="seo-listings-preview">
          <div className="seo-listings-header">
            <h2>Featured Flats for Sale</h2>
            <Link
              to="/search?propertyType=Apartment&listingType=Sale&city=Hyderabad"
              className="seo-view-all"
            >
              View All →
            </Link>
          </div>

          <PropertyList
            properties={properties.slice(0, 6)}
            loading={loading}
          />
        </section>

        <SEOBenefits />

        <SEOInternalLinks
          links={internalLinks}
          title="Related Property Searches"
        />

        <SEOFaqSection faqs={faqs} />

      </div>

      <SEOStickyCta />
    </div>
  );
};

export default FlatsForSaleHyderabadPage;
