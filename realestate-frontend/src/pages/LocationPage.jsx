// src/pages/LocationPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEO/SEOHead';
import { generateCollectionPageSchema, generateBreadcrumbSchema, generateFAQSchema } from '../components/SEO/StructuredData';
import PropertyCard from '../components/PropertyCard';
import { BACKEND_BASE_URL } from '../config/config';
import './LocationPage.css';

// Location Data Configuration
const locationData = {
  gachibowli: {
    name: "Gachibowli",
    displayName: "Gachibowli, Hyderabad",
    description: "Gachibowli is the IT hub of Hyderabad, home to major tech companies and startups. Known for excellent connectivity, modern infrastructure, and premium residential projects.",
    longDescription: "Gachibowli has emerged as the premier IT and residential destination in Hyderabad. Located in the heart of HITEC City, it offers world-class infrastructure, proximity to major IT parks including DLF Cyber City and Mindspace, and excellent connectivity via Outer Ring Road. The area features premium gated communities, international schools, shopping malls, and healthcare facilities.",
    highlights: [
      "🏢 IT Hub with DLF Cyber City, Mindspace, Raheja Mindspace",
      "🎓 Top Educational Institutions: IIIT Hyderabad, ISB",
      "🏥 World-Class Healthcare: Apollo, Continental Hospitals",
      "🛍️ Shopping: IKEA, Inorbit Mall, Amazon Campus nearby",
      "🚇 Excellent Metro Connectivity (Under Construction)",
      "🛣️ Direct access to ORR and Biodiversity Junction"
    ],
    nearbyLocations: ["HITEC City", "Madhapur", "Kondapur", "Nanakramguda", "Manikonda"],
    averagePrice: "₹6,500 - ₹12,000 per sqft",
    propertyTypes: ["Luxury Apartments", "Gated Communities", "Premium Villas", "Commercial Spaces"],
    connectivity: "Excellent connectivity to all parts of Hyderabad via ORR, upcoming Metro connectivity",
    faqs: [
      {
        question: "What is the average property price in Gachibowli?",
        answer: "Property prices in Gachibowli range from ₹6,500 to ₹12,000 per sqft depending on the project, amenities, and exact location. Premium gated communities command higher prices."
      },
      {
        question: "Is Gachibowli good for investment?",
        answer: "Yes, Gachibowli offers excellent investment potential due to its status as Hyderabad's IT hub, continuous infrastructure development, presence of major companies, and high rental demand."
      },
      {
        question: "What are the best localities in Gachibowli?",
        answer: "Popular areas include Financial District, Nanakramguda, Gachibowli Stadium area, and areas near Mindspace. These offer good connectivity, amenities, and appreciation potential."
      }
    ]
  },
  kondapur: {
    name: "Kondapur",
    displayName: "Kondapur, Hyderabad",
    description: "Kondapur is a rapidly developing IT and residential hub with excellent connectivity, modern infrastructure, and a perfect blend of commercial and residential properties.",
    longDescription: "Kondapur has transformed into one of Hyderabad's most sought-after residential and commercial destinations. Located on the Outer Ring Road, it offers excellent connectivity to Gachibowli, HITEC City, and other major areas. The locality features numerous IT parks, shopping complexes, educational institutions, and healthcare facilities, making it ideal for working professionals and families.",
    highlights: [
      "🏢 Major IT Parks: Cyber Gateway, Aparna Cyber Life",
      "🛍️ Shopping Hubs: Lulu Mall, Forum Sujana Mall",
      "🏫 Quality Schools: Oakridge, Delhi Public School",
      "🏥 Healthcare: Medicover, Sunshine Hospitals nearby",
      "🛣️ ORR Connectivity for easy commute",
      "🏘️ Mix of affordable and premium housing options"
    ],
    nearbyLocations: ["Gachibowli", "HITEC City", "Madhapur", "Miyapur", "Hafeezpet"],
    averagePrice: "₹5,500 - ₹9,000 per sqft",
    propertyTypes: ["Apartments", "Gated Communities", "Villas", "Builder Floors"],
    connectivity: "Excellent access via ORR, direct connectivity to IT hubs",
    faqs: [
      {
        question: "How is the connectivity in Kondapur?",
        answer: "Kondapur offers excellent connectivity via Outer Ring Road, with easy access to Gachibowli (5 mins), HITEC City (10 mins), and other major areas. Metro connectivity is also planned."
      },
      {
        question: "What is the rental yield in Kondapur?",
        answer: "Kondapur offers good rental yields of 3-4% due to high demand from IT professionals working in nearby Gachibowli and HITEC City."
      }
    ]
  },
  miyapur: {
    name: "Miyapur",
    displayName: "Miyapur, Hyderabad",
    description: "Miyapur is a well-established residential area with Metro connectivity, affordable housing options, and excellent social infrastructure.",
    longDescription: "Miyapur has become one of the most preferred residential destinations in North-West Hyderabad, thanks to its Metro connectivity and well-developed infrastructure. The area offers a good mix of affordable and mid-range housing options, making it popular among middle-income families and IT professionals. With numerous schools, hospitals, and shopping centers, Miyapur provides all essential amenities.",
    highlights: [
      "🚇 Metro Station - End of Metro Line connectivity",
      "🏢 Proximity to HITEC City and Gachibowli",
      "🛍️ Shopping: Bhavya Center, Local Markets",
      "🏫 Numerous Schools and Colleges",
      "🏥 Good Healthcare Facilities",
      "💰 Affordable Housing Options"
    ],
    nearbyLocations: ["Bachupally", "Nizampet", "Kompally", "Kukatpally", "KPHB"],
    averagePrice: "₹4,000 - ₹7,000 per sqft",
    propertyTypes: ["Apartments", "Independent Houses", "Gated Communities"],
    connectivity: "Metro connectivity, easy access to IT corridors via ORR",
    faqs: [
      {
        question: "Is Miyapur well connected?",
        answer: "Yes, Miyapur has excellent connectivity with its own Metro station on the Red Line, making commutes to major areas easy. ORR access provides quick connectivity to IT hubs."
      },
      {
        question: "Why is Miyapur popular for residential investment?",
        answer: "Miyapur offers affordable property prices, Metro connectivity, good social infrastructure, and proximity to IT hubs, making it ideal for both end-users and investors."
      }
    ]
  },
  madhapur: {
    name: "Madhapur",
    displayName: "Madhapur, Hyderabad",
    description: "Madhapur is a prime IT hub in Hyderabad with excellent infrastructure, connectivity, and a mix of residential and commercial properties.",
    longDescription: "Madhapur is strategically located in the heart of Hyderabad's IT corridor, offering unparalleled access to major tech companies, shopping centers, and entertainment zones. Known for its vibrant lifestyle and excellent connectivity via Outer Ring Road and upcoming Metro lines, Madhapur is a top choice for IT professionals and investors.",
    highlights: [
      "🏢 Major IT Parks: Cyber Towers, Raheja IT Park",
      "🛍️ Shopping: Inorbit Mall, GVK One",
      "🎬 Entertainment: Prasads IMAX, PVR",
      "🏫 Premium Schools: Oakridge, Glendale",
      "🏥 Healthcare: Yashoda Hospital nearby",
      "🚇 Upcoming Metro Connectivity"
    ],
    nearbyLocations: ["Gachibowli", "HITEC City", "Kondapur", "Jubilee Hills", "Banjara Hills"],
    averagePrice: "₹7,000 - ₹13,000 per sqft",
    propertyTypes: ["Luxury Apartments", "Penthouses", "Commercial Spaces", "Serviced Apartments"],
    connectivity: "Excellent connectivity via ORR, Jubilee Hills Road, and upcoming Metro",
    faqs: [
      {
        question: "Why is Madhapur popular for real estate?",
        answer: "Madhapur's proximity to major IT hubs, excellent infrastructure, entertainment options, and connectivity make it highly desirable for both residential and commercial real estate."
      },
      {
        question: "What is the rental yield in Madhapur?",
        answer: "Madhapur offers attractive rental yields of 3-4.5% due to high demand from IT professionals and expatriates working in nearby tech parks."
      }
    ]
  },

  kukatpally: {
    name: "Kukatpally",
    displayName: "Kukatpally, Hyderabad",
    description: "Kukatpally is a well-established residential area with Metro connectivity, shopping hubs, and excellent social infrastructure.",
    longDescription: "Kukatpally (also known as KPHB) is one of the most developed residential areas in North-West Hyderabad. With its own Metro station, major shopping malls, hospitals, schools, and proximity to HITEC City, it offers an ideal balance of urban convenience and residential comfort. The area has seen consistent appreciation and strong rental demand.",
    highlights: [
      "🚇 Metro Station on Blue Line",
      "🛍️ Major Shopping: Manjeera Mall, Kukatpally Market",
      "🏥 Super Specialty Hospitals",
      "🏫 Top Educational Institutions",
      "💰 Good Appreciation History",
      "🏢 Easy Access to IT Hubs"
    ],
    nearbyLocations: ["Miyapur", "Nizampet", "Bachupally", "JNTU", "KPHB Colony"],
    averagePrice: "₹4,500 - ₹7,500 per sqft",
    propertyTypes: ["Apartments", "Independent Houses", "Gated Communities", "Villas"],
    connectivity: "Metro Blue Line, Bus connectivity to all major areas, ORR access",
    faqs: [
      {
        question: "Is Kukatpally a good place to buy property?",
        answer: "Yes, Kukatpally offers excellent value with Metro connectivity, established infrastructure, good schools, hospitals, and consistent property appreciation over the years."
      },
      {
        question: "How far is Kukatpally from major IT hubs?",
        answer: "Kukatpally is approximately 8-10 km from HITEC City and Gachibowli, easily accessible via ORR or Metro."
      }
    ]
  },

  nizampet: {
    name: "Nizampet",
    displayName: "Nizampet, Hyderabad",
    description: "Nizampet is an emerging residential hub with affordable housing, good infrastructure, and proximity to IT corridors.",
    longDescription: "Nizampet has rapidly developed into a preferred residential destination for middle-income families and IT professionals. Located near Kukatpally and Miyapur, it offers more affordable property options while maintaining good connectivity to major employment centers. The area has seen significant infrastructure development with new gated communities, schools, and commercial establishments.",
    highlights: [
      "💰 Affordable Property Options",
      "🏘️ Growing Number of Gated Communities",
      "🏫 Multiple Schools and Colleges",
      "🛍️ Local Markets and Shopping Centers",
      "🚇 Nearby Metro Connectivity (Miyapur, JNTU)",
      "🛣️ Good Road Connectivity"
    ],
    nearbyLocations: ["Miyapur", "Kukatpally", "Bachupally", "Pragathi Nagar"],
    averagePrice: "₹4,000 - ₹6,500 per sqft",
    propertyTypes: ["Affordable Apartments", "Gated Communities", "Independent Houses", "2-3 BHK Flats"],
    connectivity: "Connected to ORR, near Miyapur Metro, bus services available",
    faqs: [
      {
        question: "Is Nizampet a good investment option?",
        answer: "Yes, Nizampet offers good investment potential with affordable prices, growing infrastructure, and proximity to IT hubs. It's suitable for both end-users and investors."
      },
      {
        question: "What are property prices in Nizampet?",
        answer: "Property prices in Nizampet range from ₹4,000 to ₹6,500 per sqft, significantly more affordable than nearby Gachibowli or Kondapur."
      }
    ]
  },

  bachupally: {
    name: "Bachupally",
    displayName: "Bachupally, Hyderabad",
    description: "Bachupally is a rapidly growing residential area with new projects, good connectivity, and affordable housing options.",
    longDescription: "Bachupally has emerged as a hotspot for residential development in North-West Hyderabad. Known for its wide roads, greenery, and numerous new housing projects, it attracts families and IT professionals looking for spacious homes at reasonable prices. The area's proximity to ORR and IT corridors makes it an excellent choice for commuters.",
    highlights: [
      "🏗️ Multiple New Projects Under Construction",
      "🌳 Green & Spacious Layout",
      "💰 Affordable to Mid-Range Options",
      "🏢 Easy Access to IT Parks via ORR",
      "🏫 Growing Number of Schools",
      "🛍️ Developing Commercial Infrastructure"
    ],
    nearbyLocations: ["Nizampet", "Miyapur", "Kompally", "Chandanagar"],
    averagePrice: "₹3,800 - ₹6,000 per sqft",
    propertyTypes: ["Gated Communities", "Apartments", "Villas", "Independent Houses"],
    connectivity: "Well connected via ORR, proximity to Miyapur Metro",
    faqs: [
      {
        question: "Why choose Bachupally for property purchase?",
        answer: "Bachupally offers spacious properties at affordable prices, good connectivity via ORR, developing infrastructure, and strong growth potential."
      },
      {
        question: "How is the infrastructure in Bachupally?",
        answer: "Infrastructure is rapidly developing with new schools, hospitals, shopping centers, and wide roads. Multiple gated communities ensure good amenities."
      }
    ]
  },

  nanakramguda: {
    name: "Nanakramguda",
    displayName: "Nanakramguda, Hyderabad",
    description: "Nanakramguda is part of Hyderabad's Financial District with premium properties and excellent infrastructure.",
    longDescription: "Nanakramguda, located in the heart of the Financial District, is one of Hyderabad's most prestigious addresses. Home to major IT companies, multinational corporations, and luxury residential projects, it represents the pinnacle of modern urban living. The area boasts world-class infrastructure, shopping, dining, and entertainment options.",
    highlights: [
      "🏢 Financial District - IT/Corporate Hub",
      "🏰 Luxury & Premium Projects",
      "🛍️ High-end Shopping & Dining",
      "🏥 International Hospitals Nearby",
      "🚇 Planned Metro Connectivity",
      "🛣️ Excellent ORR Access"
    ],
    nearbyLocations: ["Gachibowli", "Kokapet", "Manikonda", "Raidurg"],
    averagePrice: "₹8,000 - ₹15,000 per sqft",
    propertyTypes: ["Luxury Apartments", "Penthouses", "Premium Villas", "Serviced Apartments"],
    connectivity: "Prime location on ORR, easy access to all major areas",
    faqs: [
      {
        question: "What makes Nanakramguda special?",
        answer: "Nanakramguda's status as the Financial District, presence of major corporations, luxury infrastructure, and premium lifestyle options make it one of Hyderabad's most coveted addresses."
      },
      {
        question: "Is Nanakramguda suitable for investment?",
        answer: "Yes, premium properties in Nanakramguda offer excellent appreciation potential due to continuous corporate activity and infrastructure development."
      }
    ]
  },

  shadnagar: {
    name: "Shadnagar",
    displayName: "Shadnagar, Hyderabad",
    description: "Shadnagar is an emerging investment destination with HMDA approved layouts, affordable plots, and good connectivity.",
    longDescription: "Shadnagar has become a preferred location for land investments and villa projects. Situated on the ORR with proximity to the Pharma City and Airport, it offers HMDA-approved layouts and open plots at attractive prices. The area is seeing rapid development with improving infrastructure and connectivity.",
    highlights: [
      "📏 HMDA Approved Open Plots",
      "💰 Highly Affordable Land Rates",
      "🏗️ Upcoming Pharma City Nearby",
      "✈️ Airport Connectivity",
      "🛣️ ORR Access",
      "🏡 Villa Projects Growing"
    ],
    nearbyLocations: ["Kothur", "Maheshwaram", "Tukkuguda", "Shamshabad"],
    averagePrice: "₹2,500 - ₹4,500 per sqft",
    propertyTypes: ["Open Plots", "HMDA Layouts", "Farm Lands", "Villa Plots"],
    connectivity: "Connected via ORR and Srisailam Highway, Airport nearby",
    faqs: [
      {
        question: "Is Shadnagar good for land investment?",
        answer: "Yes, Shadnagar offers excellent investment opportunity with HMDA-approved layouts, proximity to Pharma City, Airport, and ORR connectivity at affordable prices."
      },
      {
        question: "What are the development prospects in Shadnagar?",
        answer: "With the upcoming Pharma City, Airport expansion, and ORR connectivity, Shadnagar has strong growth prospects for long-term investment."
      }
    ]
  },

  tellapur: {
    name: "Tellapur",
    displayName: "Tellapur, Hyderabad",
    description: "Tellapur is a developing area with affordable housing, good connectivity, and emerging infrastructure.",
    longDescription: "Tellapur is strategically located between Gachibowli and Kollur on the ORR, making it an emerging residential hotspot. The area offers more affordable alternatives to Gachibowli while maintaining good connectivity to IT hubs. Several new projects are coming up, attracted by the relatively lower land prices and infrastructure development.",
    highlights: [
      "💰 More Affordable than Gachibowli",
      "🛣️ ORR Connectivity",
      "🏗️ New Projects Coming Up",
      "🏢 Proximity to IT Hubs",
      "🌳 Less Congested",
      "📈 Good Appreciation Potential"
    ],
    nearbyLocations: ["Gachibowli", "Kollur", "Gopanpally", "Kokapet"],
    averagePrice: "₹4,500 - ₹7,500 per sqft",
    propertyTypes: ["Apartments", "Gated Communities", "Villas", "Open Plots"],
    connectivity: "ORR connectivity, 10-15 mins from Gachibowli",
    faqs: [
      {
        question: "Why consider Tellapur over Gachibowli?",
        answer: "Tellapur offers similar connectivity to IT hubs at 30-40% lower prices than Gachibowli, making it ideal for value-conscious buyers."
      },
      {
        question: "What is the future of Tellapur?",
        answer: "With increasing infrastructure development and proximity to the IT corridor, Tellapur has strong growth potential for both residential and investment purposes."
      }
    ]
  }

  // Add more locations as needed
};

const LocationPage = () => {
  const { location } = useParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, sale, rent

  const locationInfo = locationData[location?.toLowerCase()] || null;

  useEffect(() => {
    if (locationInfo) {
      fetchLocationProperties();
    }
  }, [location, filterType]);

  const fetchLocationProperties = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/properties/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: 'Hyderabad',
          area: locationInfo.name,
          listingType: filterType === 'all' ? '' : filterType,
          minPrice: null,
          maxPrice: null,
          propertyType: null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      const propertiesArray = data?.success ? (data.data || []) : (Array.isArray(data) ? data : []);
      setProperties(propertiesArray);
    } catch (err) {
      console.error('Error fetching location properties:', err);
      setError(err.message);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  if (!locationInfo) {
    return (
      <div className="location-page">
        <SEOHead
          title="Location Not Found"
          description="The requested location could not be found"
          noindex={true}
        />
        <div className="location-error">
          <h1>Location Not Found</h1>
          <p>The location you're looking for doesn't exist or hasn't been added yet.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // SEO Data
  const pageTitle = `Properties for Sale & Rent in ${locationInfo.displayName} | PropertyDealz.in`;
  const pageDescription = `${locationInfo.description} Find verified properties, flats, villas, and plots in ${locationInfo.name}. Average price: ${locationInfo.averagePrice}. Direct owner contact.`;
  const pageKeywords = `${locationInfo.name} properties, flats in ${locationInfo.name}, ${locationInfo.name} real estate, properties for sale in ${locationInfo.name}, apartments in ${locationInfo.name}, ${locationInfo.name} Hyderabad, ${locationInfo.propertyTypes.join(', ')}`;

  // Structured Data
  const collectionSchema = generateCollectionPageSchema(
    locationInfo.name,
    properties.length,
    locationInfo.description
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://www.propertydealz.in' },
    { name: 'Properties', url: 'https://www.propertydealz.in/properties' },
    { name: locationInfo.name, url: `https://www.propertydealz.in/properties/${location}` }
  ]);

  const faqSchema = locationInfo.faqs ? generateFAQSchema(locationInfo.faqs) : null;

  const combinedSchema = [collectionSchema, breadcrumbSchema];
  if (faqSchema) combinedSchema.push(faqSchema);

  const filteredProperties = properties.filter(p => {
    if (filterType === 'all') return true;
    return p.listingType?.toLowerCase() === filterType;
  });

  return (
    <>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
        ogUrl={`https://www.propertydealz.in/properties/${location}`}
        canonicalUrl={`https://www.propertydealz.in/properties/${location}`}
        structuredData={combinedSchema}
      />

      <div className="location-page">
        {/* Hero Section */}
        <section className="location-hero">
          <div className="location-hero-content">
            <div className="location-breadcrumb">
              <span onClick={() => navigate('/')} className="breadcrumb-link">Home</span>
              <span className="breadcrumb-sep">/</span>
              <span onClick={() => navigate('/properties')} className="breadcrumb-link">Properties</span>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">{locationInfo.name}</span>
            </div>

            <h1 className="location-title">
              Properties for Sale & Rent in {locationInfo.displayName}
            </h1>

            <p className="location-description">{locationInfo.description}</p>

            <div className="location-stats">
              <div className="stat-item">
                <span className="stat-icon">🏠</span>
                <span className="stat-value">{properties.length}+</span>
                <span className="stat-label">Properties</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">💰</span>
                <span className="stat-value">{locationInfo.averagePrice}</span>
                <span className="stat-label">Average Price/sqft</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🚇</span>
                <span className="stat-value">Excellent</span>
                <span className="stat-label">Connectivity</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="location-filters">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All Properties ({properties.length})
            </button>
            <button
              className={`filter-tab ${filterType === 'sale' ? 'active' : ''}`}
              onClick={() => setFilterType('sale')}
            >
              For Sale ({properties.filter(p => p.listingType === 'sale').length})
            </button>
            <button
              className={`filter-tab ${filterType === 'rent' ? 'active' : ''}`}
              onClick={() => setFilterType('rent')}
            >
              For Rent ({properties.filter(p => p.listingType === 'rent').length})
            </button>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="location-properties">
          <div className="properties-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Loading properties...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>Failed to load properties. Please try again.</p>
                <button onClick={fetchLocationProperties} className="btn-retry">Retry</button>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No Properties Found</h3>
                <p>No {filterType === 'all' ? '' : filterType} properties available in {locationInfo.name} right now.</p>
                <button onClick={() => navigate('/')} className="btn-primary">Browse All Properties</button>
              </div>
            ) : (
              <div className="properties-grid">
                {filteredProperties.map(property => (
                  <PropertyCard key={property.id || property.propertyId} property={property} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Location Details */}
        <section className="location-details">
          <div className="details-container">
            <div className="details-main">
              <h2>About {locationInfo.name}</h2>
              <p className="location-long-desc">{locationInfo.longDescription}</p>

              <h3>Key Highlights of {locationInfo.name}</h3>
              <div className="highlights-grid">
                {locationInfo.highlights.map((highlight, idx) => (
                  <div key={idx} className="highlight-item">
                    {highlight}
                  </div>
                ))}
              </div>

              <h3>Connectivity</h3>
              <p>{locationInfo.connectivity}</p>

              <h3>Property Types Available</h3>
              <div className="property-types">
                {locationInfo.propertyTypes.map((type, idx) => (
                  <span key={idx} className="type-badge">{type}</span>
                ))}
              </div>
            </div>

            <div className="details-sidebar">
              <div className="sidebar-card">
                <h3>Nearby Localities</h3>
                <div className="nearby-list">
                  {locationInfo.nearbyLocations.map((nearby, idx) => (
                    <div
                      key={idx}
                      className="nearby-item"
                      onClick={() => navigate(`/properties/${nearby.toLowerCase().replace(/\s+/g, '-')}`)}
                    >
                      📍 {nearby}
                    </div>
                  ))}
                </div>
              </div>

              <div className="sidebar-card">
                <h3>Quick Facts</h3>
                <div className="quick-facts">
                  <div className="fact-row">
                    <span className="fact-label">Average Price:</span>
                    <span className="fact-value">{locationInfo.averagePrice}</span>
                  </div>
                  <div className="fact-row">
                    <span className="fact-label">Available Properties:</span>
                    <span className="fact-value">{properties.length}+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        {locationInfo.faqs && locationInfo.faqs.length > 0 && (
          <section className="location-faqs">
            <div className="faqs-container">
              <h2>Frequently Asked Questions about {locationInfo.name}</h2>
              <div className="faqs-list">
                {locationInfo.faqs.map((faq, idx) => (
                  <div key={idx} className="faq-item">
                    <h3 className="faq-question">{faq.question}</h3>
                    <p className="faq-answer">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="location-cta">
          <div className="cta-container">
            <h2>Looking to Buy or Sell Property in {locationInfo.name}?</h2>
            <p>Post your property for free or browse through our verified listings</p>
            <div className="cta-buttons">
              <button onClick={() => navigate('/post-property')} className="btn-primary">
                Post Property for Free
              </button>
              <button onClick={() => navigate('/')} className="btn-secondary">
                Browse All Properties
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default LocationPage;