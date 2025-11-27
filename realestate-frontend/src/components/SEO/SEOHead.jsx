// src/components/SEO/SEOHead.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({
  title,
  description,
  keywords,
  ogImage,
  ogUrl,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  canonicalUrl,
  noindex = false,
  nofollow = false,
  structuredData,
}) => {
  const siteUrl = 'https://www.propertydealz.in';
  const siteName = 'PropertyDealz.in';
  const defaultImage = `${siteUrl}/images/og-default.jpg`;

  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - Best Real Estate Deals in Hyderabad`;
  const fullDescription = description || 'Find verified properties for sale and rent in Hyderabad. Direct owner contact, no brokerage. Flats, plots, villas in Gachibowli, Kondapur, Miyapur & more.';
  const fullImage = ogImage || defaultImage;
  const fullUrl = ogUrl || canonicalUrl || siteUrl;

  const robotsContent = `${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />

      {/* Additional SEO Meta Tags */}
      <meta name="author" content="PropertyDealz.in" />
      <meta name="geo.region" content="IN-TG" />
      <meta name="geo.placename" content="Hyderabad" />
      <meta name="geo.position" content="17.3850;78.4867" />
      <meta name="ICBM" content="17.3850, 78.4867" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;