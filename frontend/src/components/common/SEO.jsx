import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, url, type = 'website', image }) => {
  const defaultTitle = 'MalkinCraft | Handcrafted Jewelry';
  const defaultDescription = 'Discover premium handcrafted jewelry designed with intention and crafted by master artisans. Explore our unique collections of necklaces, rings, earrings, and bracelets.';
  const defaultImage = 'https://malkincraft-frontend.onrender.com/og-image.jpg'; // Placeholder for default social image
  
  const seoTitle = title ? `${title} | MalkinCraft` : defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoImage = image || defaultImage;

  return (
    <Helmet>
      {/* Basic HTML Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={seoTitle} />
      <meta property="twitter:description" content={seoDescription} />
      <meta property="twitter:image" content={seoImage} />
    </Helmet>
  );
};

export default SEO;
