// src/pages/seo/IndependentHousesHyderabadPage.jsx
// MONEY PAGE #4 - /independent-houses-for-sale-hyderabad/
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
  SEOComparisonTable,
  SEOLegalChecklist
} from '../../components/SEO/SEOComponents';
import PropertyList from '../../components/PropertyList';
import { propertyService } from '../../services/api';

const IndependentHousesHyderabadPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Normalizer required by PropertyList
  const normalizeProperty = (p) => {
    const rawType =
      typeof p.propertyType === 'string'
        ? p.propertyType
        : p.propertyType?.typeName || p.propertyType?.name || '';

    return {
      ...p,
      id: p.propertyId ?? p.id,
      propertyType: rawType,
      isActive: true
    };
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await propertyService.getAll({
          city: 'Hyderabad',
          listingType: 'Sale'
          // ❌ limit intentionally removed
        });

        const allProperties = Array.isArray(response)
          ? response.map(normalizeProperty)
          : [];

        const housesAndVillas = allProperties.filter(p =>
          ['House', 'Villa', 'Independent House'].includes(p.propertyType)
        );

        setProperties(
          housesAndVillas.length > 0
            ? housesAndVillas
            : allProperties.slice(0, 8)
        );
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
  const pageTitle = "Independent House for Sale in Hyderabad | Villas & Houses";
  const pageDescription = "Buy independent house in Hyderabad. Villas, duplex houses, G+1, G+2 houses for sale. Ready & under construction options in Gachibowli, Kondapur, Manikonda. Zero brokerage.";
  const pageKeywords = "independent house hyderabad, villa for sale hyderabad, house for sale hyderabad, duplex house hyderabad, G+1 house hyderabad, residential house hyderabad";
  const canonicalUrl = "https://www.propertydealz.in/independent-houses-for-sale-hyderabad/";

  // Breadcrumb
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Hyderabad', url: '/hyderabad/' },
    { name: 'Independent Houses for Sale', url: '/independent-houses-for-sale-hyderabad/' }
  ];

  // Localities by house type
  const houseLocalities = {
    villas: ['Kokapet', 'Narsingi', 'Gandipet', 'Mokila', 'Shankarpally'],
    independentHouses: ['Manikonda', 'Puppalaguda', 'Nallagandla', 'Tellapur', 'Gopanpally'],
    resale: ['Kukatpally', 'Miyapur', 'Pragathi Nagar', 'Nizampet', 'Bachupally'],
    gatedCommunity: ['HITEC City', 'Gachibowli', 'Kondapur', 'Madhapur', 'Financial District']
  };

  // Home loan guide
  const loanChecklist = [
    'Property should have clear title & approvals',
    'Age of property affects loan eligibility (max 20-25 years old)',
    'Loan-to-value ratio: 75-90% based on property age',
    'Both construction & land value covered for new builds',
    'EMI should not exceed 50% of monthly income',
    'Co-applicant (spouse) improves loan eligibility',
    'Lower interest rates for women primary borrowers'
  ];

  // Villa vs Independent House comparison
  const comparisonHeaders = ['Feature', 'Independent House', 'Villa', 'Duplex'];
  const comparisonRows = [
    ['Structure', 'Standalone G+1/G+2', 'Premium gated community', '2-floor single unit'],
    ['Land Ownership', 'Full ownership', 'Full ownership', 'Shared/Full'],
    ['Privacy', 'High', 'Very High', 'Moderate'],
    ['Amenities', 'Self-managed', 'Community amenities', 'Limited common'],
    ['Maintenance', 'Owner responsibility', 'Society maintenance', 'Shared'],
    ['Price Range', '₹80L - ₹2Cr', '₹1.5Cr - ₹5Cr+', '₹60L - ₹1.5Cr'],
    ['Appreciation', 'Land + Building', 'Premium growth', 'Moderate']
  ];

  // FAQs
  const faqs = [
    {
      question: "What is the price range for independent houses in Hyderabad?",
      answer: "Independent houses in Hyderabad range from ₹80 lakhs to ₹5+ crores depending on location and specifications."
    },
    {
      question: "Which areas are best for buying an independent house?",
      answer: "Kokapet, Narsingi, Gandipet for villas; Manikonda and Puppalaguda for independent houses."
    },
    {
      question: "Should I buy ready or construct?",
      answer: "Ready houses offer immediate possession, construction offers customization but takes time."
    },
    {
      question: "What approvals are required?",
      answer: "Building permission, layout approval, OC, title deed, and mutation."
    },
    {
      question: "Can I get a home loan?",
      answer: "Yes, banks finance independent houses subject to age and approvals."
    },
    {
      question: "Difference between villa and independent house?",
      answer: "Villas are in gated communities with amenities; independent houses are standalone."
    }
  ];

  // Combined Schema
  const structuredData = [
    generateBreadcrumbSchema(breadcrumbItems),
    generateFAQSchema(faqs),
    generateCollectionPageSchema('Hyderabad', properties.length, pageDescription)
  ];

  // Internal links
  const internalLinks = [
    { text: 'Buy Flat in Hyderabad', url: '/buy-flat-in-hyderabad/' },
    { text: 'Flats for Sale Hyderabad', url: '/flats-for-sale-in-hyderabad/' },
    { text: 'Plots for Sale Hyderabad', url: '/plots-for-sale-in-hyderabad/' },
    { text: 'Property in Hyderabad', url: '/hyderabad/' },
    { text: 'Manikonda Houses', url: '/area/manikonda' },
    { text: 'Kokapet Villas', url: '/area/kokapet' }
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

          <h1>Independent Houses for Sale in Hyderabad – Ready & Under Construction</h1>

          <p className="seo-hero-subtitle">
            Find your dream independent house in Hyderabad. Browse villas, duplex houses,
            G+1, G+2 properties across Manikonda, Kokapet, Kondapur and more.
          </p>

          <SEOCtaGroup
            primaryText="Browse All Houses"
            primaryLink="/search?propertyType=House,Villa&listingType=Sale&city=Hyderabad"
            whatsAppMessage="Hi! I'm looking for an independent house in Hyderabad"
          />
        </div>
      </section>

      <div className="seo-content seo-content-narrow">

        {/* Featured Listings */}
        <section className="seo-listings-preview">
          <div className="seo-listings-header">
            <h2>Featured Independent Houses</h2>
            <Link to="/search?propertyType=House&city=Hyderabad" className="seo-view-all">
              View All Houses →
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
          title="Explore More Properties"
        />

        <SEOFaqSection faqs={faqs} />

      </div>

      <SEOStickyCta />
    </div>
  );
};

export default IndependentHousesHyderabadPage;