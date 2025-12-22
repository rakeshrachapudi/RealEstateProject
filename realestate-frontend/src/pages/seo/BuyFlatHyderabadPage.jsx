// src/pages/seo/BuyFlatHyderabadPage.jsx
// MONEY PAGE #1 - /buy-flat-in-hyderabad/
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
  SEOPriceRangeCards,
  SEOComparisonTable
} from '../../components/SEO/SEOComponents';
import PropertyList from '../../components/PropertyList';
import { propertyService } from '../../services/api';

const BuyFlatHyderabadPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await propertyService.getAll({
          city: 'Hyderabad',
          propertyType: 'Apartment',
          listingType: 'Sale',
          limit: 8
        });
        setProperties(response.data?.content || response.data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // SEO Data
  const pageTitle = "Buy Flat in Hyderabad | Verified Flats for Sale";
  const pageDescription = "Buy flat in Hyderabad with zero brokerage. Verified 1BHK, 2BHK, 3BHK apartments in Gachibowli, Kondapur, HITEC City. Direct owner contact, transparent pricing.";
  const pageKeywords = "buy flat hyderabad, flat for sale hyderabad, 2bhk flat hyderabad, 3bhk apartment hyderabad, apartments for sale hyderabad";
  const canonicalUrl = "https://www.propertydealz.in/buy-flat-in-hyderabad/";

  // Breadcrumb
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Hyderabad', url: '/hyderabad/' },
    { name: 'Buy Flat in Hyderabad', url: '/buy-flat-in-hyderabad/' }
  ];

  // Best Areas for Flats
  const bestAreas = [
    'Gachibowli', 'HITEC City', 'Madhapur', 'Kondapur',
    'Manikonda', 'Kukatpally', 'Miyapur', 'Nallagandla',
    'Tellapur', 'Kokapet', 'Financial District', 'Narsingi'
  ];

  // FAQs
  const faqs = [
    {
      question: "What is the price range for flats in Hyderabad?",
      answer: "Flat prices in Hyderabad range from ₹35-50 lakhs for 2BHK in suburban areas to ₹1-3 crores for 3BHK in premium localities like Gachibowli and Jubilee Hills. Mid-range options in Kondapur, Manikonda are available from ₹60-90 lakhs."
    },
    {
      question: "Which area is best to buy a flat in Hyderabad?",
      answer: "For IT professionals: Gachibowli, HITEC City, Madhapur, Kondapur. For families with good schools: Kukatpally, Miyapur. For investment with high appreciation: Kokapet, Tellapur, Kollur. For luxury living: Jubilee Hills, Banjara Hills."
    },
    {
      question: "Is it better to buy a new flat or resale flat in Hyderabad?",
      answer: "New flats offer modern amenities, warranty, and customization options but come at premium prices. Resale flats are 10-20% cheaper, offer established neighborhoods, and immediate possession. Both have pros depending on your priorities and budget."
    },
    {
      question: "What are the additional costs when buying a flat in Hyderabad?",
      answer: "Additional costs include: Registration (7.5% of property value), Stamp duty (included in registration), GST on under-construction flats (5%), Maintenance deposit (12-24 months advance), Legal charges, and Bank processing fees for home loan."
    },
    {
      question: "How does PropertyDealz help in buying a flat?",
      answer: "PropertyDealz offers zero brokerage, verified listings with ownership proof, direct owner contact, transparent pricing, legal document verification support, and assistance throughout the purchase process from property search to registration."
    }
  ];

  // New vs Resale Comparison
  const comparisonHeaders = ['Feature', 'New Flat', 'Resale Flat'];
  const comparisonRows = [
    ['Price', 'Premium (10-20% higher)', 'Negotiable, better deals'],
    ['Possession', '1-3 years for under construction', 'Immediate'],
    ['Amenities', 'Modern, latest designs', 'May need renovation'],
    ['Location', 'Often on periphery', 'Established localities'],
    ['GST', '5% on under construction', 'No GST'],
    ['Legal Clarity', 'Builder responsibility', 'Requires due diligence']
  ];

  // Combined Schema
  const structuredData = [
    generateBreadcrumbSchema(breadcrumbItems),
    generateFAQSchema(faqs),
    generateCollectionPageSchema('Hyderabad', properties.length, pageDescription)
  ];

  // Internal links
  const internalLinks = [
    { text: 'Flats for Sale Hyderabad', url: '/flats-for-sale-in-hyderabad/' },
    { text: 'Plots for Sale Hyderabad', url: '/plots-for-sale-in-hyderabad/' },
    { text: 'Independent Houses Hyderabad', url: '/independent-houses-for-sale-hyderabad/' },
    { text: 'Property in Hyderabad', url: '/hyderabad/' },
    { text: 'Gachibowli Flats', url: '/area/gachibowli' },
    { text: 'Kondapur Apartments', url: '/area/kondapur' }
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

          <h1>Buy Flat in Hyderabad – Verified Apartments with Transparent Pricing</h1>

          <p className="seo-hero-subtitle">
            Find your perfect flat in Hyderabad with zero brokerage. Browse verified
            1BHK, 2BHK, 3BHK apartments in Gachibowli, HITEC City, Kondapur and more.
            Direct owner contact, no middlemen.
          </p>

          <div className="seo-hero-stats">
            <div className="seo-hero-stat">
              <span className="seo-hero-stat-value">300+</span>
              <span className="seo-hero-stat-label">Verified Flats</span>
            </div>
            <div className="seo-hero-stat">
              <span className="seo-hero-stat-value">₹35L+</span>
              <span className="seo-hero-stat-label">Starting Price</span>
            </div>
            <div className="seo-hero-stat">
              <span className="seo-hero-stat-value">40+</span>
              <span className="seo-hero-stat-label">Localities</span>
            </div>
          </div>

          <SEOCtaGroup
            primaryText="Browse All Flats"
            primaryLink="/search?propertyType=Apartment&listingType=Sale&city=Hyderabad"
            whatsAppMessage="Hi! I want to buy a flat in Hyderabad"
          />
        </div>
      </section>

      {/* Main Content */}
      <div className="seo-content seo-content-narrow">

        {/* Flats for Sale Section */}
        <section className="seo-section">
          <h2>Flats for Sale in Hyderabad</h2>
          <p>
            Hyderabad's apartment market offers diverse options from affordable housing
            to luxury penthouses. The IT corridor stretching from HITEC City to Gachibowli
            remains the most sought-after location for working professionals, while areas
            like Kukatpally and Miyapur offer family-friendly environments with excellent
            social infrastructure.
          </p>
          <p>
            PropertyDealz brings you verified flat listings with transparent pricing,
            complete with ownership documents, building approvals, and direct owner contact.
            Save lakhs on brokerage while finding your dream apartment.
          </p>
        </section>

        {/* Browse by Price */}
        <section className="seo-section">
          <h2>Browse Flats by Budget</h2>
          <p>
            Find flats that match your budget. From affordable 2BHK apartments under
            ₹50 lakhs to premium 3BHK flats in gated communities.
          </p>
          <SEOPriceRangeCards propertyType="Apartment" listingType="Sale" />
        </section>

        {/* Best Areas */}
        <section className="seo-section">
          <h2>Best Areas to Buy Flats in Hyderabad</h2>
          <p>
            The western IT corridor remains the preferred choice for apartment buyers,
            offering excellent connectivity, modern amenities, and proximity to major
            tech parks. Gachibowli, with its proximity to major IT companies and the
            Financial District, commands premium prices but offers excellent appreciation.
          </p>
          <p>
            For budget-conscious buyers, areas like Kukatpally, Miyapur, and Bachupally
            offer well-connected options with good social infrastructure. Emerging areas
            like Tellapur and Kollur provide entry-level pricing with high growth potential.
          </p>
          <SEOLocalityGrid localities={bestAreas} />
        </section>

        {/* Featured Listings */}
        <section className="seo-listings-preview">
          <div className="seo-listings-header">
            <h2>2BHK & 3BHK Flats in Hyderabad</h2>
            <Link to="/search?propertyType=Apartment&city=Hyderabad" className="seo-view-all">
              View All Flats →
            </Link>
          </div>
          <PropertyList
            properties={properties.slice(0, 6)}
            loading={loading}
          />
        </section>

        {/* New vs Resale */}
        <section className="seo-section">
          <h2>New vs Resale Flats in Hyderabad</h2>
          <p>
            Choosing between a new flat and a resale property depends on your priorities.
            Here's a quick comparison to help you decide:
          </p>
          <SEOComparisonTable headers={comparisonHeaders} rows={comparisonRows} />
          <p>
            PropertyDealz lists both new and resale flats with complete transparency.
            Each listing includes construction status, age of property, and all
            relevant documentation details.
          </p>
        </section>

        {/* Why PropertyDealz */}
        <SEOBenefits />

        {/* Internal Links */}
        <SEOInternalLinks
          links={internalLinks}
          title="Explore More Properties"
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

export default BuyFlatHyderabadPage;