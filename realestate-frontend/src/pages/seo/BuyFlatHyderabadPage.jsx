// src/pages/seo/BuyFlatHyderabadPage.jsx
// MONEY PAGE #1 - /buy-flat-in-hyderabad/
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SEOHead from "../../components/SEO/SEOHead";
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateCollectionPageSchema
} from "../../components/SEO/StructuredData";
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
} from "../../components/SEO/SEOComponents";
import PropertyList from "../../components/PropertyList";
import { propertyService } from "../../services/api";

const BuyFlatHyderabadPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 NORMALIZER (REQUIRED FOR PropertyList)
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
          city: "Hyderabad",
          propertyType: "Apartment",   // ✅ FLATS
          listingType: "Sale",         // ✅ BUY
          limit: 8
        });

        // ✅ response is ALREADY an array (from api.js)
        const list = Array.isArray(response) ? response : [];

        setProperties(list.map(normalizeProperty));
      } catch (error) {
        console.error("Error fetching properties:", error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // SEO Data
  const pageTitle =
    "Buy Flat in Hyderabad | Verified Flats for Sale";
  const pageDescription =
    "Buy flat in Hyderabad with zero brokerage. Verified 1BHK, 2BHK, 3BHK apartments in Gachibowli, Kondapur, HITEC City. Direct owner contact, transparent pricing.";
  const pageKeywords =
    "buy flat hyderabad, flat for sale hyderabad, 2bhk flat hyderabad, 3bhk apartment hyderabad, apartments for sale hyderabad";
  const canonicalUrl =
    "https://www.propertydealz.in/buy-flat-in-hyderabad/";

  // Breadcrumb
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Hyderabad", url: "/hyderabad/" },
    { name: "Buy Flat in Hyderabad", url: "/buy-flat-in-hyderabad/" }
  ];

  // Best Areas
  const bestAreas = [
    "Gachibowli", "HITEC City", "Madhapur", "Kondapur",
    "Manikonda", "Kukatpally", "Miyapur", "Nallagandla",
    "Tellapur", "Kokapet", "Financial District", "Narsingi"
  ];

  // FAQs
  const faqs = [
    {
      question: "What is the price range for flats in Hyderabad?",
      answer:
        "Flat prices in Hyderabad range from ₹35-50 lakhs for 2BHK in suburban areas to ₹1-3 crores for 3BHK in premium localities like Gachibowli and Jubilee Hills."
    },
    {
      question: "Which area is best to buy a flat in Hyderabad?",
      answer:
        "For IT professionals: Gachibowli, HITEC City, Madhapur. For families: Kukatpally, Miyapur. For investment: Kokapet, Tellapur."
    },
    {
      question: "Is it better to buy a new flat or resale flat?",
      answer:
        "New flats offer modern amenities while resale flats are 10-20% cheaper with immediate possession."
    },
    {
      question: "What are the additional costs?",
      answer:
        "Registration, stamp duty, GST on under-construction flats, maintenance deposit, legal and bank charges."
    },
    {
      question: "How does PropertyDealz help?",
      answer:
        "Zero brokerage, verified listings, direct owner contact, and end-to-end support."
    }
  ];

  // Comparison
  const comparisonHeaders = ["Feature", "New Flat", "Resale Flat"];
  const comparisonRows = [
    ["Price", "Premium (10-20% higher)", "Negotiable"],
    ["Possession", "1-3 years", "Immediate"],
    ["Amenities", "Modern", "May need upgrade"],
    ["GST", "5%", "No GST"]
  ];

  const structuredData = [
    generateBreadcrumbSchema(breadcrumbItems),
    generateFAQSchema(faqs),
    generateCollectionPageSchema(
      "Hyderabad",
      properties.length,
      pageDescription
    )
  ];

  const internalLinks = [
    { text: "Flats for Sale Hyderabad", url: "/flats-for-sale-in-hyderabad/" },
    { text: "Plots for Sale Hyderabad", url: "/plots-for-sale-in-hyderabad/" },
    { text: "Independent Houses Hyderabad", url: "/independent-houses-for-sale-hyderabad/" },
    { text: "Property in Hyderabad", url: "/hyderabad/" }
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

      {/* HERO */}
      <section className="seo-hero">
        <div className="seo-hero-container">
          <SEOBreadcrumb items={breadcrumbItems} />
          <h1>Buy Flat in Hyderabad – Verified Apartments</h1>
          <p className="seo-hero-subtitle">
            Zero brokerage • Direct owner contact • Verified listings
          </p>
          <SEOCtaGroup
            primaryText="Browse All Flats"
            primaryLink="/search?propertyType=Apartment&listingType=Sale&city=Hyderabad"
            whatsAppMessage="Hi! I want to buy a flat in Hyderabad"
          />
        </div>
      </section>

      {/* LISTINGS */}
      <section className="seo-listings-preview">
        <div className="seo-listings-header">
          <h2>2BHK & 3BHK Flats in Hyderabad</h2>
          <Link
            to="/search?propertyType=Apartment&listingType=Sale&city=Hyderabad"
            className="seo-view-all"
          >
            View All Flats →
          </Link>
        </div>

        <PropertyList
          properties={properties.slice(0, 6)}
          loading={loading}
        />
      </section>

      <SEOBenefits />
      <SEOInternalLinks links={internalLinks} />
      <SEOFaqSection faqs={faqs} />
      <SEOStickyCta />
    </div>
  );
};

export default BuyFlatHyderabadPage;
