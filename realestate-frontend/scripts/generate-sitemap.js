// scripts/generate-sitemap.js
import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://www.propertydealz.in';
const OUTPUT_PATH = path.join(process.cwd(), 'public', 'sitemap.xml');

// Static pages
const staticPages = [
  { url: '', changefreq: 'daily', priority: '1.0' },
  { url: '/login', changefreq: 'monthly', priority: '0.5' },
  { url: '/my-properties', changefreq: 'weekly', priority: '0.7' },
];

// Add your major locations
const locations = [
  'gachibowli', 'kondapur', 'miyapur', 'manikonda', 'hitec-city',
  'madhapur', 'kukatpally', 'ameerpet', 'begumpet', 'secunderabad'
];

// Fetch properties from your API
const fetchProperties = async () => {
  try {
    const response = await fetch(`${process.env.BACKEND_BASE_URL || 'http://localhost:3001'}/api/properties/all`);
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
};

const generateSitemap = async () => {
  const properties = await fetchProperties();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static pages
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}${page.url}</loc>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  // Add location pages
  locations.forEach(location => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}/properties/${location}</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += '  </url>\n';
  });

  // Add property detail pages
  properties.forEach(property => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}/property/${property.id || property.propertyId}</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    if (property.updatedAt) {
      xml += `    <lastmod>${new Date(property.updatedAt).toISOString().split('T')[0]}</lastmod>\n`;
    }
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');
  console.log(`✅ Sitemap generated successfully at ${OUTPUT_PATH}`);
  console.log(`📊 Total URLs: ${staticPages.length + locations.length + properties.length}`);
};

generateSitemap().catch(console.error);