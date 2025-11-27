// src/components/SEO/StructuredData.jsx

/**
 * Generate RealEstateListing Schema for property pages
 */
export const generatePropertySchema = (property) => {
  if (!property) return null;

  const siteUrl = 'https://www.propertydealz.in';

  // Format price for schema
  const price = property.price || 0;
  const currency = 'INR';

  // Build address
  const address = {
    '@type': 'PostalAddress',
    streetAddress: property.address || property.title || '',
    addressLocality: property.areaName || property.city || 'Hyderabad',
    addressRegion: 'Telangana',
    postalCode: property.pincode || '',
    addressCountry: 'IN'
  };

  // Build geo coordinates if available
  const geo = property.latitude && property.longitude ? {
    '@type': 'GeoCoordinates',
    latitude: property.latitude,
    longitude: property.longitude
  } : null;

  // Property features
  const numberOfRooms = property.bedrooms || 0;
  const numberOfBathroomsTotal = property.bathrooms || 0;
  const floorSize = property.areaSqft ? {
    '@type': 'QuantitativeValue',
    value: property.areaSqft,
    unitCode: 'FTK' // Square foot
  } : null;

  // Images
  const images = property.imageUrl ? [property.imageUrl] : [];

  // Listing type
  const listingType = property.listingType?.toLowerCase() === 'sale'
    ? 'https://schema.org/RealEstateSale'
    : 'https://schema.org/RealEstateRental';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title || `${property.bedrooms}BHK ${property.propertyType || 'Property'} in ${property.areaName || 'Hyderabad'}`,
    description: property.description || `${property.bedrooms}BHK ${property.propertyType || 'property'} for ${property.listingType || 'sale'} in ${property.areaName || 'Hyderabad'}`,
    url: `${siteUrl}/property/${property.id || property.propertyId}`,
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
      url: `${siteUrl}/property/${property.id || property.propertyId}`,
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

  return schema;
};

/**
 * Generate Organization Schema for website
 */
export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'PropertyDealz.in',
    alternateName: 'Property Dealz',
    url: 'https://www.propertydealz.in',
    logo: 'https://www.propertydealz.in/logo.png',
    description: 'Leading real estate platform in Hyderabad for buying, selling and renting properties. Zero brokerage, direct owner contact.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Hyderabad',
      addressRegion: 'Telangana',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 17.3850,
      longitude: 78.4867
    },
    areaServed: {
      '@type': 'City',
      name: 'Hyderabad'
    },
    sameAs: [
      'https://www.facebook.com/propertydealz',
      'https://www.instagram.com/propertydealz',
      'https://twitter.com/propertydealz'
    ]
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
      item: item.url
    }))
  };
};

/**
 * Generate CollectionPage Schema for location pages
 */
export const generateCollectionPageSchema = (location, propertyCount, description) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Properties for Sale in ${location}`,
    description: description || `Find verified properties for sale in ${location}, Hyderabad. Direct owner contact, best deals.`,
    url: `https://www.propertydealz.in/properties/${location.toLowerCase().replace(/\s+/g, '-')}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: propertyCount,
      itemListElement: []
    }
  };
};

/**
 * Generate SearchAction Schema for homepage
 */
export const generateSearchActionSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://www.propertydealz.in',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.propertydealz.in/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };
};

/**
 * Generate FAQ Schema
 */
export const generateFAQSchema = (faqs) => {
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

export default {
  generatePropertySchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
  generateSearchActionSchema,
  generateFAQSchema
};