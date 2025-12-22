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
  const pageTitle = "Flats for Sale in Hyderabad | 1, 2 & 3 BHK Apartments";
  const pageDescription = "Explore flats for sale in Hyderabad. Budget & premium 1BHK, 2BHK, 3BHK apartments under ₹50L, ₹1Cr, ₹2Cr. Ready-to-move & under construction options. Zero brokerage.";
  const pageKeywords = "flats for sale hyderabad, apartments for sale hyderabad, 1bhk flat hyderabad, 2bhk flat hyderabad, 3bhk flat hyderabad, ready to move flats hyderabad";
  const canonicalUrl = "https://www.propertydealz.in/flats-for-sale-in-hyderabad/";

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
      answer: "Affordable flats under ₹50 lakhs are available in areas like Bachupally, Nizampet, Patancheru, Kompally, and Medchal. These areas offer good connectivity via ORR and are emerging IT corridors with potential appreciation."
    },
    {
      question: "Are ready-to-move flats better than under-construction?",
      answer: "Ready-to-move flats offer immediate possession, what-you-see-is-what-you-get, established societies, and no GST. Under-construction flats are cheaper (10-15%), offer payment flexibility, and modern designs but come with delivery risk and 5% GST."
    },
    {
      question: "What is the per square foot rate for flats in Hyderabad?",
      answer: "Per sq.ft rates vary: Affordable areas (₹3,500-5,000), Mid-range areas like Kukatpally (₹5,000-7,000), IT corridor (₹6,500-10,000), Premium localities (₹10,000-15,000), Luxury areas like Jubilee Hills (₹15,000-25,000+)."
    },
    {
      question: "Which builders are reliable for buying flats in Hyderabad?",
      answer: "Reputed builders in Hyderabad include My Home Constructions, Aparna Constructions, Prestige, Rajapushpa, Ramky, Vasavi, Sumadhura, and Salarpuria Sattva. PropertyDealz lists both builder projects and verified resale properties."
    },
    {
      question: "What amenities should I look for in a flat?",
      answer: "Essential amenities: Power backup, water supply, security, parking, elevator. Value-adds: Gym, swimming pool, clubhouse, children's play area, landscaped gardens. Premium: Concierge, EV charging, smart home features, co-working spaces."
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
            Explore flats for sale in Hyderabad across all budgets. From affordable
            2BHK under ₹50 lakhs to premium 3BHK apartments. Ready-to-move and
            under-construction options with zero brokerage.
          </p>

          <div className="seo-hero-stats">
            <div className="seo-hero-stat">
              <span className="seo-hero-stat-value">350+</span>
              <span className="seo-hero-stat-label">Flats Listed</span>
            </div>
            <div className="seo-hero-stat">
              <span className="seo-hero-stat-value">4</span>
              <span className="seo-hero-stat-label">Budget Ranges</span>
            </div>
            <div className="seo-hero-stat">
              <span className="seo-hero-stat-value">50+</span>
              <span className="seo-hero-stat-label">Localities</span>
            </div>
          </div>

          <SEOCtaGroup
            primaryText="View All Flats"
            primaryLink="/search?propertyType=Apartment&listingType=Sale&city=Hyderabad"
            whatsAppMessage="Hi! I'm looking for flats for sale in Hyderabad"
          />
        </div>
      </section>

      {/* Main Content */}
      <div className="seo-content seo-content-narrow">

        {/* Budget-wise Flats */}
        <section className="seo-section">
          <h2>Browse Flats by Budget</h2>
          <p>
            Finding the right flat starts with knowing your budget. Hyderabad offers
            excellent options across all price ranges, from starter homes for first-time
            buyers to luxury penthouses for discerning investors.
          </p>
          <SEOPriceRangeCards propertyType="Apartment" listingType="Sale" />
        </section>

        {/* Flats Under 50 Lakhs */}
        <section className="seo-section">
          <h2>Flats Under ₹50 Lakhs</h2>
          <p>
            Affordable apartments under ₹50 lakhs are available in Hyderabad's emerging
            corridors. These areas offer excellent connectivity and are witnessing rapid
            infrastructure development, making them ideal for first-time buyers and investors.
          </p>
          <SEOLocalityGrid localities={budgetLocalities.affordable} />
        </section>

        {/* Featured Listings */}
        <section className="seo-listings-preview">
          <div className="seo-listings-header">
            <h2>Featured Flats for Sale</h2>
            <Link to="/search?propertyType=Apartment&city=Hyderabad" className="seo-view-all">
              View All →
            </Link>
          </div>
          <PropertyList
            properties={properties.slice(0, 6)}
            loading={loading}
          />
        </section>

        {/* Mid-Range Flats */}
        <section className="seo-section">
          <h2>Flats ₹50 Lakhs - ₹1 Crore</h2>
          <p>
            The sweet spot for most home buyers. This budget range gets you well-located
            2BHK and compact 3BHK flats in established localities with good schools,
            hospitals, and shopping centers nearby.
          </p>
          <SEOLocalityGrid localities={budgetLocalities.midRange} />
        </section>

        {/* Premium Flats */}
        <section className="seo-section">
          <h2>Premium Flats ₹1 - 2 Crore</h2>
          <p>
            Premium apartments in Hyderabad's IT corridor offer world-class amenities,
            modern designs, and excellent appreciation potential. These gated communities
            feature swimming pools, gyms, clubhouses, and 24/7 security.
          </p>
          <SEOLocalityGrid localities={budgetLocalities.premium} />
        </section>

        {/* Luxury Flats */}
        <section className="seo-section">
          <h2>Luxury Flats Above ₹2 Crore</h2>
          <p>
            Hyderabad's luxury segment offers exclusive penthouses, sky villas, and
            high-end apartments in the most prestigious neighborhoods. These properties
            feature premium finishes, private terraces, and concierge services.
          </p>
          <SEOLocalityGrid localities={budgetLocalities.luxury} />
        </section>

        {/* Ready vs Under Construction */}
        <section className="seo-section">
          <h2>Ready-to-Move vs Under Construction Flats</h2>
          <p>
            <strong>Ready-to-Move Flats:</strong> Ideal if you need immediate possession
            or want to see exactly what you're buying. No GST applicable, established
            societies with functioning amenities, and negotiable prices on resale properties.
          </p>
          <p>
            <strong>Under Construction Flats:</strong> Better if you can wait 1-3 years.
            Typically 10-15% cheaper, flexible payment plans linked to construction stages,
            modern designs and latest amenities. 5% GST applicable on purchase price.
          </p>
        </section>

        {/* Why PropertyDealz */}
        <SEOBenefits />

        {/* Internal Links */}
        <SEOInternalLinks
          links={internalLinks}
          title="Related Property Searches"
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

export default FlatsForSaleHyderabadPage;