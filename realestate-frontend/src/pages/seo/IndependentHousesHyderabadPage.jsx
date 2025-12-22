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

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await propertyService.getAll({
          city: 'Hyderabad',
          listingType: 'Sale',
          limit: 8
        });
        const allProperties = response.data?.content || response.data || [];
        const housesAndVillas = allProperties.filter(p =>
          ['House', 'Villa', 'Independent House'].includes(p.propertyType)
        );
        setProperties(housesAndVillas.length > 0 ? housesAndVillas : allProperties.slice(0, 8));
      } catch (error) {
        console.error('Error fetching properties:', error);
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
      answer: "Independent houses in Hyderabad range from ₹80 lakhs for basic G+1 in suburban areas to ₹2-5+ crores for premium villas in gated communities. Mid-range options in areas like Manikonda, Puppalaguda cost ₹1-1.5 crores for well-built houses."
    },
    {
      question: "Which areas are best for buying an independent house in Hyderabad?",
      answer: "For villas: Kokapet, Narsingi, Gandipet offer serene settings. For independent houses: Manikonda, Puppalaguda, Nallagandla. For gated communities: HITEC City periphery, Kondapur outskirts. For budget options: Kukatpally, Miyapur, Bachupally."
    },
    {
      question: "Should I buy a ready house or construct one on a plot?",
      answer: "Ready houses offer immediate possession and known quality. Constructing on a plot gives customization but takes 12-18 months. Construction typically costs ₹1,800-3,000/sq.ft depending on quality. Factor in approval time, supervision, and potential overruns."
    },
    {
      question: "What approvals should an independent house have?",
      answer: "Essential approvals: Building Permission from GHMC/Gram Panchayat, Layout approval (if part of a layout), Occupancy Certificate, Clear title deed with chain, Mutation in property records, and Tax assessment. For older houses, verify the approval validity."
    },
    {
      question: "Can I get a home loan for an independent house purchase?",
      answer: "Yes, banks offer home loans for independent houses. Requirements: Clear title, building approval, age of property under 20-25 years, and structural stability certificate for older homes. Loan amounts typically 75-80% of property value for resale houses."
    },
    {
      question: "What is the difference between a villa and an independent house?",
      answer: "Villas are premium independent units within gated communities with shared amenities like clubhouse, swimming pool, and security. Independent houses are standalone properties with full autonomy but self-managed maintenance. Villas cost 20-40% more than comparable independent houses."
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
            Ready-to-move and under-construction options with zero brokerage.
          </p>

          <div className="seo-hero-stats">
            <div className="seo-hero-stat">
              <span className="seo-hero-stat-value">150+</span>
              <span className="seo-hero-stat-label">Houses & Villas</span>
            </div>
            <div className="seo-hero-stat">
              <span className="seo-hero-stat-value">₹80L+</span>
              <span className="seo-hero-stat-label">Starting Price</span>
            </div>
            <div className="seo-hero-stat">
              <span className="seo-hero-stat-value">35+</span>
              <span className="seo-hero-stat-label">Prime Locations</span>
            </div>
          </div>

          <SEOCtaGroup
            primaryText="Browse All Houses"
            primaryLink="/search?propertyType=House,Villa&listingType=Sale&city=Hyderabad"
            whatsAppMessage="Hi! I'm looking for an independent house in Hyderabad"
          />
        </div>
      </section>

      {/* Main Content */}
      <div className="seo-content seo-content-narrow">

        {/* Introduction */}
        <section className="seo-section">
          <h2>Buy Independent Houses in Hyderabad</h2>
          <p>
            Owning an independent house in Hyderabad offers the ultimate freedom –
            your own land, complete privacy, and the flexibility to customize your
            living space. From budget-friendly G+1 houses to luxurious villas in
            gated communities, Hyderabad's real estate market caters to all preferences.
          </p>
          <p>
            PropertyDealz brings you verified independent houses and villas with
            clear titles, proper approvals, and direct owner contact. Save lakhs
            on brokerage while finding your perfect home.
          </p>
        </section>

        {/* Villas Section */}
        <section className="seo-section">
          <h2>Villas for Sale in Hyderabad</h2>
          <p>
            Hyderabad's villa market offers premium living experiences in serene,
            gated settings. Areas around Gandipet, Narsingi, and Kokapet have
            emerged as villa hotspots, offering lake views, greenery, and
            world-class amenities while maintaining proximity to the IT corridor.
          </p>
          <SEOLocalityGrid localities={houseLocalities.villas} />
        </section>

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

        {/* Independent Houses Section */}
        <section className="seo-section">
          <h2>Independent Houses in Prime Locations</h2>
          <p>
            For those seeking autonomy without the premium of gated villa communities,
            independent houses in areas like Manikonda, Puppalaguda, and Nallagandla
            offer excellent value. These G+1 and G+2 structures come with dedicated
            parking, gardens, and the potential for rental income from additional floors.
          </p>
          <SEOLocalityGrid localities={houseLocalities.independentHouses} />
        </section>

        {/* Resale Houses */}
        <section className="seo-section">
          <h2>Resale Houses at Great Value</h2>
          <p>
            Resale independent houses offer immediate possession, established
            neighborhoods, and often better value per square foot. Areas like
            Kukatpally, Miyapur, and Pragathi Nagar have well-built older
            houses with spacious plots and mature landscaping.
          </p>
          <SEOLocalityGrid localities={houseLocalities.resale} />
        </section>

        {/* Comparison Table */}
        <section className="seo-section">
          <h2>Villas vs Independent Houses vs Duplex</h2>
          <p>
            Understanding the differences helps you choose the right property type
            based on your lifestyle, budget, and preferences:
          </p>
          <SEOComparisonTable headers={comparisonHeaders} rows={comparisonRows} />
        </section>

        {/* Gated Community Houses */}
        <section className="seo-section">
          <h2>Gated Community Villas</h2>
          <p>
            For those who want the best of both worlds – independence with security
            and community amenities – gated villa projects near the IT corridor
            offer premium living experiences with clubhouses, swimming pools,
            sports facilities, and 24/7 security.
          </p>
          <SEOLocalityGrid localities={houseLocalities.gatedCommunity} />
        </section>

        {/* Home Loan Guide */}
        <section className="seo-section">
          <h2>Home Loan & Registration Guide</h2>
          <p>
            Financing an independent house requires understanding specific bank
            requirements. Here's what you need to know:
          </p>
          <SEOLegalChecklist
            items={loanChecklist}
            title="Home Loan Eligibility Factors"
          />
          <p style={{ marginTop: '16px' }}>
            <strong>Registration costs:</strong> Stamp duty and registration in
            Telangana total approximately 7.5% of property value. Additional costs
            include legal fees (₹10,000-25,000) and bank processing fees (0.5-1%
            of loan amount).
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

export default IndependentHousesHyderabadPage;