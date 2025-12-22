// src/pages/seo/PlotsForSaleHyderabadPage.jsx
// MONEY PAGE #3 - /plots-for-sale-in-hyderabad/
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
  SEOLegalChecklist,
  SEOComparisonTable
} from '../../components/SEO/SEOComponents';
import PropertyList from '../../components/PropertyList';
import { propertyService } from '../../services/api';

const PlotsForSaleHyderabadPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Normalizer (required by PropertyList)
  const normalizeProperty = (p) => ({
    ...p,
    id: p.propertyId ?? p.id,
    isActive: true
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await propertyService.getAll({
          city: 'Hyderabad',
          propertyType: 'Plot',
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
  const pageTitle = "Plots for Sale in Hyderabad | HMDA & DTCP Approved";
  const pageDescription = "Find HMDA & DTCP approved plots for sale in Hyderabad. Residential plots, gated community plots, investment lands near ORR, airport. Verified layouts, clear titles, zero brokerage.";
  const pageKeywords = "plots for sale hyderabad, HMDA approved plots hyderabad, DTCP plots hyderabad, residential plots hyderabad, land for sale hyderabad, gated community plots";
  const canonicalUrl = "https://www.propertydealz.in/plots-for-sale-in-hyderabad/";

  // Breadcrumb
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Hyderabad', url: '/hyderabad/' },
    { name: 'Plots for Sale in Hyderabad', url: '/plots-for-sale-in-hyderabad/' }
  ];

  // Plot localities by type
  const plotLocalities = {
    residential: ['Tellapur', 'Kollur', 'Mokila', 'Patancheru', 'Shankarpally'],
    gatedCommunity: ['Shadnagar', 'Shamshabad', 'Adibatla', 'Tukkuguda', 'Maheshwaram'],
    investment: ['Pharma City', 'Sangareddy', 'Yadagirigutta', 'Bibinagar', 'Srisailam Highway']
  };

  // Legal checklist items
  const legalChecklist = [
    'HMDA or DTCP Layout Approval',
    'Clear Title Deed & Sale Deed Chain',
    'Encumbrance Certificate (Last 30 years)',
    'Land Use Certificate (Residential/Commercial)',
    'No Litigation Certificate',
    'Panchayat/Municipality NOC',
    'Tax Paid Receipts',
    'Survey Number & Boundaries Match',
    'Link Documents Verification'
  ];

  // Plot type comparison
  const comparisonHeaders = ['Feature', 'Residential Plot', 'Gated Community', 'Investment Plot'];
  const comparisonRows = [
    ['Purpose', 'Build home', 'Build in community', 'Appreciation/Resale'],
    ['Approval', 'HMDA/DTCP required', 'Layout approved', 'Varies by location'],
    ['Amenities', 'Self-arranged', 'Roads, drainage, power', 'Minimal'],
    ['Price', 'Moderate', 'Premium (20-30% more)', 'Lower entry'],
    ['Appreciation', 'Based on area growth', 'Steady growth', 'High potential, risky'],
    ['Timeline', 'Immediate construction', 'After layout completion', 'Long-term hold']
  ];

  // FAQs
  const faqs = [
    {
      question: "What is the difference between HMDA and DTCP approved plots?",
      answer: "HMDA approval applies within Greater Hyderabad, DTCP outside. Both ensure legal layouts."
    },
    {
      question: "What is the price range for plots in Hyderabad?",
      answer: "Peripheral areas ₹15,000-30,000/sq.yard, IT corridor adjacent ₹50,000-1,00,000/sq.yard."
    },
    {
      question: "Which areas are best for plot investment?",
      answer: "Pharma City corridor, ORR-adjacent areas, Airport belt, and RRR corridor."
    },
    {
      question: "What documents should I check?",
      answer: "Layout approval, sale deed chain, EC, tax receipts, and survey verification."
    },
    {
      question: "Can I get a loan for plots?",
      answer: "Yes, banks finance HMDA/DTCP approved plots up to 70-80% of value."
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
    { text: 'Independent Houses Hyderabad', url: '/independent-houses-for-sale-hyderabad/' },
    { text: 'Property in Hyderabad', url: '/hyderabad/' },
    { text: 'Tellapur Plots', url: '/area/tellapur' },
    { text: 'Shamshabad Land', url: '/area/shamshabad' }
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

          <h1>Plots for Sale in Hyderabad – HMDA & DTCP Approved Layouts</h1>

          <p className="seo-hero-subtitle">
            Find verified HMDA & DTCP approved plots in Hyderabad with zero brokerage.
          </p>

          <SEOCtaGroup
            primaryText="Browse All Plots"
            primaryLink="/search?propertyType=Plot&listingType=Sale&city=Hyderabad"
            whatsAppMessage="Hi! I'm looking for plots for sale in Hyderabad"
          />
        </div>
      </section>

      <div className="seo-content seo-content-narrow">

        <section className="seo-listings-preview">
          <div className="seo-listings-header">
            <h2>Featured Plots for Sale</h2>
            <Link to="/search?propertyType=Plot&city=Hyderabad" className="seo-view-all">
              View All Plots →
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

export default PlotsForSaleHyderabadPage;
