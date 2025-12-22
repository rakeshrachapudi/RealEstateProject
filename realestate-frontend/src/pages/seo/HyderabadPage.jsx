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

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await propertyService.getAll({ city: 'Hyderabad', limit: 6 });
        setFeaturedProperties(response.data?.content || response.data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
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
      answer: "For IT professionals: Gachibowli, HITEC City, Kondapur, Madhapur. For families: Kukatpally, Miyapur, Manikonda. For investment: Kokapet, Tellapur, Shadnagar, Shamshabad (near airport). For luxury: Jubilee Hills, Banjara Hills, Film Nagar."
    },
    {
      question: "How does PropertyDealz help in buying property?",
      answer: "PropertyDealz offers zero brokerage property listings with verified ownership. You get direct contact with property owners, transparent pricing, legal verification support, and end-to-end deal assistance from search to registration."
    },
    {
      question: "Is it a good time to buy property in Hyderabad?",
      answer: "Hyderabad's real estate market remains strong due to IT sector growth, infrastructure development (Metro, ORR, Regional Ring Road), and steady appreciation. Areas near upcoming developments like Pharma City and IT corridors show good potential."
    },
    {
      question: "What documents should I verify before buying property in Hyderabad?",
      answer: "Essential documents: Sale deed, Encumbrance Certificate (EC), HMDA/DTCP approval, Building permission, Occupancy Certificate, Title deed chain, Property tax receipts, and NOCs from relevant authorities. PropertyDealz helps verify all these documents."
    }
  ];

  // Combined Schema
  const structuredData = [
    generateOrganizationSchema(),
    generateBreadcrumbSchema(breadcrumbItems),
    generateFAQSchema(faqs),
    generateSearchActionSchema()
  ];

  // Internal links for cross-linking
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

          <div className="seo-hero-stats">
            <div className="seo-hero-stat">
              <span className="seo-hero-stat-value">500+</span>
              <span className="seo-hero-stat-label">Verified Properties</span>
            </div>
            <div className="seo-hero-stat">
              <span className="seo-hero-stat-value">₹0</span>
              <span className="seo-hero-stat-label">Brokerage</span>
            </div>
            <div className="seo-hero-stat">
              <span className="seo-hero-stat-value">50+</span>
              <span className="seo-hero-stat-label">Localities</span>
            </div>
          </div>

          <SEOCtaGroup
            primaryText="View All Properties"
            primaryLink="/search?city=Hyderabad"
            whatsAppMessage="Hi! I'm looking to buy property in Hyderabad"
          />
        </div>
      </section>

      {/* Main Content */}
      <div className="seo-content">

        {/* Browse by Property Type */}
        <section className="seo-section">
          <h2>Browse Properties by Type</h2>
          <p>
            Whether you're looking for a cozy apartment, a spacious independent house,
            or a plot to build your dream home, PropertyDealz has verified options across Hyderabad.
          </p>

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

        {/* About Hyderabad Real Estate */}
        <section className="seo-section">
          <h2>Hyderabad Real Estate Overview</h2>
          <p>
            Hyderabad has emerged as one of India's most sought-after real estate destinations,
            driven by a thriving IT industry, excellent infrastructure, and relatively affordable
            property prices compared to other metro cities. The city offers a perfect blend of
            modern amenities and cultural heritage.
          </p>
          <p>
            The western corridor comprising Gachibowli, HITEC City, Madhapur, and Kondapur
            continues to be the most preferred choice for IT professionals and investors.
            Meanwhile, areas like Tellapur, Kokapet, and Narsingi are emerging as new growth
            centers with excellent connectivity and upcoming infrastructure projects.
          </p>
          <p>
            With the Outer Ring Road (ORR), upcoming Regional Ring Road (RRR), and expanding
            Metro network, Hyderabad's real estate market offers strong appreciation potential.
            PropertyDealz brings you verified properties across all these prime locations with
            zero brokerage.
          </p>
        </section>

        {/* Popular Localities */}
        <section className="seo-section">
          <h2>Popular Localities in Hyderabad</h2>
          <p>
            Explore properties in Hyderabad's most sought-after neighborhoods.
            Each locality offers unique advantages – from IT hub proximity to
            excellent schools and healthcare facilities.
          </p>
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

        {/* Why PropertyDealz */}
        <SEOBenefits />

        {/* Internal Links for SEO */}
        <SEOInternalLinks
          links={internalLinks}
          title="Explore More Property Options"
        />

        {/* FAQs */}
        <section className="seo-section">
          <SEOFaqSection faqs={faqs} />
        </section>

      </div>

      {/* Sticky Mobile CTA */}
      <SEOStickyCta />
    </div>
  );
};

export default HyderabadPage;