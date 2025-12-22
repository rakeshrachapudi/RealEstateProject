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

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await propertyService.getAll({
          city: 'Hyderabad',
          propertyType: 'Plot',
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
      answer: "HMDA (Hyderabad Metropolitan Development Authority) approval covers areas within Greater Hyderabad. DTCP (Directorate of Town & Country Planning) covers areas outside HMDA jurisdiction. Both ensure legal layouts with proper roads, drainage, and building permissions. Always verify approval before purchase."
    },
    {
      question: "What is the price range for plots in Hyderabad?",
      answer: "Plot prices vary significantly: Peripheral areas (₹15,000-30,000/sq.yard), Semi-urban areas (₹30,000-60,000/sq.yard), IT corridor adjacent (₹50,000-1,00,000/sq.yard), Premium locations (₹1-2 lakhs/sq.yard). Prices depend on location, approval status, and infrastructure."
    },
    {
      question: "Which areas are best for buying plots in Hyderabad for investment?",
      answer: "High-potential investment areas: Near upcoming Pharma City (Mucherla, Kadthal), ORR-adjacent areas (Tellapur, Kollur, Mokila), Airport zone (Shamshabad, Adibatla), Regional Ring Road (RRR) corridor, and Srisailam Highway stretch."
    },
    {
      question: "What documents should I check before buying a plot in Hyderabad?",
      answer: "Essential documents: Layout approval (HMDA/DTCP), Sale deed with complete chain, EC for 30 years, Pattadar passbook, Mutation documents, Tax paid receipts, NOCs from relevant authorities, and Physical verification with survey stones."
    },
    {
      question: "Can I get a home loan for buying a plot?",
      answer: "Yes, most banks offer plot loans up to 70-80% of plot value. However, the plot must have HMDA/DTCP approval, clear title, and be within municipal limits. Interest rates are slightly higher than home loans. Construction must typically begin within 2-3 years."
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
            Find verified HMDA & DTCP approved plots in Hyderabad. Residential plots,
            gated community layouts, and investment lands near ORR, airport, and IT corridor.
            Clear titles, legal verification, zero brokerage.
          </p>

          <div className="seo-hero-stats">
            <div className="seo-hero-stat">
              <span className="seo-hero-stat-value">200+</span>
              <span className="seo-hero-stat-label">Verified Plots</span>
            </div>
            <div className="seo-hero-stat">
              <span className="seo-hero-stat-value">100%</span>
              <span className="seo-hero-stat-label">Legal Verification</span>
            </div>
            <div className="seo-hero-stat">
              <span className="seo-hero-stat-value">30+</span>
              <span className="seo-hero-stat-label">Prime Locations</span>
            </div>
          </div>

          <SEOCtaGroup
            primaryText="Browse All Plots"
            primaryLink="/search?propertyType=Plot&listingType=Sale&city=Hyderabad"
            whatsAppMessage="Hi! I'm looking for plots for sale in Hyderabad"
          />
        </div>
      </section>

      {/* Main Content */}
      <div className="seo-content seo-content-narrow">

        {/* Introduction */}
        <section className="seo-section">
          <h2>Buy Approved Plots in Hyderabad</h2>
          <p>
            Owning a plot in Hyderabad offers the freedom to build your dream home
            exactly the way you want. With the city expanding rapidly along the Outer
            Ring Road (ORR) and upcoming Regional Ring Road (RRR), plot investments
            have shown strong appreciation over the years.
          </p>
          <p>
            PropertyDealz brings you only verified plots with complete legal documentation.
            Every listing includes approval status, title verification, and direct owner
            contact – ensuring you make a safe investment with zero brokerage.
          </p>
        </section>

        {/* Legal Checklist - BIG SEO BOOST */}
        <section className="seo-section">
          <h2>Plot Buying Legal Checklist</h2>
          <p>
            Before purchasing any plot in Hyderabad, ensure these documents are verified.
            This checklist helps protect your investment from legal disputes.
          </p>
          <SEOLegalChecklist
            items={legalChecklist}
            title="Essential Documents to Verify"
          />
        </section>

        {/* Residential Plots */}
        <section className="seo-section">
          <h2>Residential Plots in Hyderabad</h2>
          <p>
            Residential plots are ideal for those who want to build a customized home.
            These plots come with HMDA/DTCP approval, ensuring you can obtain building
            permissions without hassles. Popular sizes range from 150-500 sq.yards.
          </p>
          <SEOLocalityGrid localities={plotLocalities.residential} />
        </section>

        {/* Featured Listings */}
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

        {/* Gated Community Plots */}
        <section className="seo-section">
          <h2>Gated Community Plots</h2>
          <p>
            Gated community plots offer the best of both worlds – the freedom of
            independent construction within a secure, planned layout. These come
            with developed roads, drainage, electricity connections, and common
            amenities like parks and clubhouses.
          </p>
          <SEOLocalityGrid localities={plotLocalities.gatedCommunity} />
        </section>

        {/* Investment Plots */}
        <section className="seo-section">
          <h2>Investment Plots Near Growth Corridors</h2>
          <p>
            For long-term investors, plots near upcoming infrastructure projects
            offer excellent appreciation potential. The Pharma City corridor,
            Regional Ring Road zones, and airport belt are emerging as high-growth
            investment destinations.
          </p>
          <SEOLocalityGrid localities={plotLocalities.investment} />
        </section>

        {/* Plot Type Comparison */}
        <section className="seo-section">
          <h2>Choosing the Right Plot Type</h2>
          <p>
            Different plot types serve different purposes. Here's a comparison to
            help you decide based on your goals:
          </p>
          <SEOComparisonTable headers={comparisonHeaders} rows={comparisonRows} />
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

export default PlotsForSaleHyderabadPage;