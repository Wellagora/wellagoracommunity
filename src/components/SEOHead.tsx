import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  sponsorName?: string;
}

const SEOHead = ({
  title = 'WellAgora — Impact Marketplace',
  description = 'Regionális tudásmegosztó közösség. Csatlakozz helyi szakértőkhöz!',
  image = '/og-image.png',
  url,
  type = 'website',
  sponsorName,
}: SEOHeadProps) => {
  const { language } = useLanguage();
  const ogLocaleMap: Record<string, string> = { hu: 'hu_HU', en: 'en_US', de: 'de_DE' };
  const siteUrl = 'https://wellagora.org';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image?.startsWith('http') ? image : `${siteUrl}${image}`;
  
  // Generate SEO title with sponsor if available
  const seoTitle = sponsorName 
    ? `${title} • Támogató: ${sponsorName} | WellAgora`
    : title.includes('WellAgora') ? title : `${title} | WellAgora`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={description?.substring(0, 155) || ''} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={description?.substring(0, 155) || ''} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="WellAgora" />
      <meta property="og:locale" content={ogLocaleMap[language] || 'hu_HU'} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={description?.substring(0, 155) || ''} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* hreflang for multilingual SEO */}
      <link rel="alternate" hrefLang="hu" href={fullUrl} />
      <link rel="alternate" hrefLang="en" href={fullUrl} />
      <link rel="alternate" hrefLang="de" href={fullUrl} />
      <link rel="alternate" hrefLang="x-default" href={fullUrl} />
    </Helmet>
  );
};

export default SEOHead;
