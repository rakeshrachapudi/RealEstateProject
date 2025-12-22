// src/components/SEO/StructuredData.jsx
// Enhanced with all schema types for SEO pages

const SITE_URL = 'https://www.propertydealz.in';
const SITE_NAME = 'PropertyDealz.in';

/**
 * Generate RealEstateListing Schema for property pages
 */
export const generatePropertySchema = (property) => {
  if (!property) return null;

  const price = property.price || 0;
  const currency = 'INR';

  const address = {
    '@type': 'PostalAddress',
    streetAddress: property.address || property.title || '',
    addressLocality: property.areaName || property.city || 'Hyderabad',
    addressRegion: 'Telangana',
    postalCode: property.pincode || '',
    addressCountry: 'IN'
  };

  const geo = property.latitude && property.longitude ? {
    '@type': 'GeoCoordinates',
    latitude: property.latitude,
    longitude: property.longitude
  } : null;

  const numberOfRooms = property.bedrooms || 0;
  const numberOfBathroomsTotal = property.bathrooms || 0;

  const floorSize = property.areaSqft ? {
    '@type': 'QuantitativeValue',
    value: property.areaSqft,
    unitCode: 'FTK'
  } : null;

  const images = property.imageUrl ? [property.imageUrl] : [];

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title || `${property.bedrooms}BHK ${property.propertyType || 'Property'} in ${property.areaName || 'Hyderabad'}`,
    description: property.description || `${property.bedrooms}BHK ${property.propertyType || 'property'} for ${property.listingType || 'sale'} in ${property.areaName || 'Hyderabad'}`,
    url: `${SITE_URL}/property/${property.id || property.propertyId}`,
    image: images,
    ...(floorSize && { floorSize }),
    numberOfRooms,
    numberOfBathroomsTotal,
    address,
    ...(geo && { geo }),
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/property/${property.id || property.propertyId}`,
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    datePosted: property.createdAt || new Date().toISOString(),
    ...(property.amenities && {
      amenityFeature: property.amenities.split(',').map(amenity => ({
        '@type': 'LocationFeatureSpecification',
        name: amenity.trim()
      }))
    })
  };
};

/**
 * Generate Organization Schema for website (LocalBusiness + RealEstateAgent)
 */
export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': ['RealEstateAgent', 'LocalBusiness'],
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: 'Property Dealz',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
      width: 200,
      height: 60
    },
    image: `${SITE_URL}/og-default.jpg`,
    description: 'Leading zero-brokerage real estate platform in Hyderabad. Buy, sell and rent verified flats, plots, villas with direct owner contact.',
    slogan: 'Zero Brokerage, Verified Listings',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Hyderabad',
      addressLocality: 'Hyderabad',
      addressRegion: 'Telangana',
      postalCode: '500081',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 17.3850,
      longitude: 78.4867
    },
    telephone: '+91-7730051329',
    email: 'contact@propertydealz.in',
    areaServed: {
      '@type': 'City',
      name: 'Hyderabad',
      containedInPlace: {
        '@type': 'State',
        name: 'Telangana'
      }
    },
    priceRange: '₹₹',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '20:00'
    },
    sameAs: [
      'https://www.facebook.com/propertydealz',
      'https://www.instagram.com/propertydealz',
      'https://twitter.com/propertydealz',
      'https://www.linkedin.com/company/propertydealz'
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Real Estate Listings',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Zero Brokerage Property Listings'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Verified Property Listings'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Direct Owner Contact'
          }
        }
      ]
    }
  };
};

/**
 * Generate Breadcrumb Schema
 */
export const generateBreadcrumbSchema = (items) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`
    }))
  };
};

/**
 * Generate CollectionPage Schema for location/category pages
 */
export const generateCollectionPageSchema = (location, propertyCount, description) => {
  const slug = location.toLowerCase().replace(/\s+/g, '-');

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Properties for Sale in ${location}`,
    description: description || `Find verified properties for sale in ${location}, Hyderabad. Direct owner contact, zero brokerage, best deals.`,
    url: `${SITE_URL}/properties/${slug}`,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: propertyCount,
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      name: `Property Listings in ${location}`
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: SITE_URL
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: location,
          item: `${SITE_URL}/properties/${slug}`
        }
      ]
    }
  };
};

/**
 * Generate SearchAction Schema for homepage (Sitelinks Search Box)
 */
export const generateSearchActionSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: 'Zero brokerage real estate platform in Hyderabad',
    publisher: {
      '@id': `${SITE_URL}/#organization`
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
};

/**
 * Generate FAQ Schema
 */
export const generateFAQSchema = (faqs) => {
  if (!faqs || faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
};

/**
 * Generate WebPage Schema for SEO pages
 */
export const generateWebPageSchema = (page) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${page.url}#webpage`,
    url: page.url,
    name: page.title,
    description: page.description,
    isPartOf: {
      '@id': `${SITE_URL}/#website`
    },
    about: {
      '@type': 'Thing',
      name: page.about || 'Real Estate in Hyderabad'
    },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: page.image || `${SITE_URL}/og-default.jpg`
    },
    datePublished: page.datePublished || new Date().toISOString(),
    dateModified: page.dateModified || new Date().toISOString(),
    inLanguage: 'en-IN',
    potentialAction: {
      '@type': 'ReadAction',
      target: page.url
    }
  };
};

/**
 * Generate Service Schema
 */
export const generateServiceSchema = (service) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@id': `${SITE_URL}/#organization`
    },
    areaServed: {
      '@type': 'City',
      name: 'Hyderabad'
    },
    serviceType: service.type || 'Real Estate Service',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
      description: 'Zero brokerage'
    }
  };
};

/**
 * Generate Aggregate Rating Schema
 */
export const generateAggregateRatingSchema = (rating = 4.5, reviewCount = 150) => {
  return {
    '@type': 'AggregateRating',
    ratingValue: rating,
    bestRating: 5,
    worstRating: 1,
    ratingCount: reviewCount,
    reviewCount: reviewCount
  };
};

/**
 * Combine multiple schemas into a single graph
 */
export const combineSchemas = (schemas) => {
  const validSchemas = schemas.filter(s => s !== null && s !== undefined);

  if (validSchemas.length === 0) return null;
  if (validSchemas.length === 1) return validSchemas[0];

  return {
    '@context': 'https://schema.org',
    '@graph': validSchemas.map(schema => {
      // Remove @context from individual schemas when combining
      const { '@context': _, ...rest } = schema;
      return rest;
    })
  };
};

export default {
  generatePropertySchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
  generateSearchActionSchema,
  generateFAQSchema,
  generateWebPageSchema,
  generateServiceSchema,
  generateAggregateRatingSchema,
  combineSchemas
};