// src/pages/seo/HyderabadPage.jsx
// CITY HUB PAGE - /hyderabad/
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEO/SEOHead';
import {
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateSearchActionSchema
} from '../../components/SEO/StructuredData';
import {
  SEOBreadcrumb,
  SEOFaqSection,
  SEOBenefits,
  SEOCtaGroup,
  SEOStickyCta,
  SEOInternalLinks,
  SEOLocalityGrid
} from '../../components/SEO/SEOComponents';
import PropertyList from '../../components/PropertyList';
import { propertyService } from '../../services/api';

const HyderabadPage = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ REQUIRED normalizer (PropertyList depends on id)
  const normalizeProperty = (p) => ({
    ...p,
    id: p.propertyId ?? p.id,
    isActive: true
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await propertyService.getAll({
          city: 'Hyderabad'
          // ❌ limit removed intentionally
        });

        const list = Array.isArray(response) ? response : [];
        setFeaturedProperties(list.map(normalizeProperty));
      } catch (error) {
        console.error('Error fetching properties:', error);
        setFeaturedProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // SEO Data
  const pageTitle = "Buy Property in Hyderabad | Flats, Plots & Houses";
  const pageDescription = "Find verified properties for sale in Hyderabad. Buy flats, plots, villas & independent houses with zero brokerage. Direct owner contact in Gachibowli, Kondapur, HITEC City & more.";
  const pageKeywords = "buy property hyderabad, flats for sale hyderabad, plots for sale hyderabad, independent house hyderabad, apartments hyderabad, villas hyderabad";
  const canonicalUrl = "https://www.propertydealz.in/hyderabad/";

  // Breadcrumb
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Hyderabad', url: '/hyderabad/' }
  ];

  // Child Pages (Money Pages)
  const childPages = [
    {
      icon: '🏢',
      title: 'Buy Flat in Hyderabad',
      description: 'Verified apartments with transparent pricing',
      url: '/buy-flat-in-hyderabad/'
    },
    {
      icon: '🏠',
      title: 'Flats for Sale in Hyderabad',
      description: 'Budget & premium apartments',
      url: '/flats-for-sale-in-hyderabad/'
    },
    {
      icon: '📏',
      title: 'Plots for Sale in Hyderabad',
      description: 'HMDA & DTCP approved layouts',
      url: '/plots-for-sale-in-hyderabad/'
    },
    {
      icon: '🏡',
      title: 'Independent Houses in Hyderabad',
      description: 'Villas & houses for sale',
      url: '/independent-houses-for-sale-hyderabad/'
    }
  ];

  // Popular Localities
  const popularLocalities = [
    'Gachibowli', 'HITEC City', 'Madhapur', 'Kondapur',
    'Kukatpally', 'Miyapur', 'Jubilee Hills', 'Banjara Hills',
    'Manikonda', 'Narsingi', 'Kokapet', 'Financial District',
    'Tellapur', 'Nallagandla', 'Bachupally', 'Nizampet'
  ];

  // FAQs
  const faqs = [
    {
      question: "What is the average property price in Hyderabad?",
      answer: "Property prices in Hyderabad vary by location. Premium areas like Jubilee Hills and Banjara Hills range from ₹15,000-25,000/sq.ft. IT corridors like Gachibowli and HITEC City range from ₹6,000-12,000/sq.ft. Emerging areas like Tellapur and Kokapet offer properties from ₹4,500-7,000/sq.ft."
    },
    {
      question: "Which areas are best for buying property in Hyderabad?",
      answer: "For IT professionals: Gachibowli, HITEC City, Kondapur, Madhapur. For families: Kukatpally, Miyapur, Manikonda. For investment: Kokapet, Tellapur. For luxury: Jubilee Hills, Banjara Hills."
    },
    {
      question: "How does PropertyDealz help in buying property?",
      answer: "PropertyDealz offers zero brokerage property listings with verified ownership, direct owner contact, transparent pricing, and legal verification support."
    },
    {
      question: "Is it a good time to buy property in Hyderabad?",
      answer: "Hyderabad’s IT growth, infrastructure projects, and steady appreciation make it one of the best cities for property investment."
    },
    {
      question: "What documents should I verify?",
      answer: "Sale deed, EC, approvals, OC, tax receipts, and title chain. PropertyDealz assists in verification."
    }
  ];

  // Combined Schema
  const structuredData = [
    generateOrganizationSchema(),
    generateBreadcrumbSchema(breadcrumbItems),
    generateFAQSchema(faqs),
    generateSearchActionSchema()
  ];

  // Internal links
  const internalLinks = [
    { text: 'Buy Flat in Hyderabad', url: '/buy-flat-in-hyderabad/' },
    { text: 'Flats for Sale Hyderabad', url: '/flats-for-sale-in-hyderabad/' },
    { text: 'Plots for Sale Hyderabad', url: '/plots-for-sale-in-hyderabad/' },
    { text: 'Independent Houses Hyderabad', url: '/independent-houses-for-sale-hyderabad/' },
    { text: 'Gachibowli Properties', url: '/area/gachibowli' },
    { text: 'Kondapur Flats', url: '/area/kondapur' }
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

          <h1>Buy Property in Hyderabad – Verified Flats, Plots & Independent Houses</h1>

          <p className="seo-hero-subtitle">
            Discover your dream property in Hyderabad with zero brokerage.
            Direct owner contact, verified listings, and transparent pricing across
            Gachibowli, HITEC City, Kondapur, and 50+ prime locations.
          </p>

          <SEOCtaGroup
            primaryText="View All Properties"
            primaryLink="/search?city=Hyderabad"
            whatsAppMessage="Hi! I'm looking to buy property in Hyderabad"
          />
        </div>
      </section>

      <div className="seo-content">

        {/* Browse by Property Type */}
        <section className="seo-section">
          <h2>Browse Properties by Type</h2>

          <div className="seo-links-grid">
            {childPages.map((page, index) => (
              <Link key={index} to={page.url} className="seo-link-card">
                <div className="seo-link-card-icon">{page.icon}</div>
                <div className="seo-link-card-content">
                  <h3>{page.title}</h3>
                  <p>{page.description}</p>
                </div>
                <span className="seo-link-card-arrow">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Localities */}
        <section className="seo-section">
          <h2>Popular Localities in Hyderabad</h2>
          <SEOLocalityGrid localities={popularLocalities} />
        </section>

        {/* Featured Properties */}
        <section className="seo-listings-preview">
          <div className="seo-listings-header">
            <h2>Featured Properties in Hyderabad</h2>
            <Link to="/search?city=Hyderabad" className="seo-view-all">
              View All Properties →
            </Link>
          </div>

          <PropertyList
            properties={featuredProperties.slice(0, 6)}
            loading={loading}
          />
        </section>

        <SEOBenefits />

        <SEOInternalLinks
          links={internalLinks}
          title="Explore More Property Options"
        />

        <SEOFaqSection faqs={faqs} />
      </div>

      <SEOStickyCta />
    </div>
  );
};

export default HyderabadPage;
