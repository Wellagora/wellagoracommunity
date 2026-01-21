import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  sponsorName?: string;
}

const SEOHead = ({
  title = 'WellAgora',
  description = 'Csatlakozz a regionális tudásmegosztó ökoszisztémához. Fedezd fel a programokat és a helyi szakértők tudását.',
  image = '/lovable-uploads/89cff010-b0aa-4aa1-b97e-999c469cae09.png',
  url,
  type = 'website',
  sponsorName,
}: SEOHeadProps) => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
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
      <meta property="og:locale" content="hu_HU" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={description?.substring(0, 155) || ''} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
};

export default SEOHead;
