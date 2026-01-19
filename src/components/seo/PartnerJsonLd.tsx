import { Helmet } from 'react-helmet-async';

interface PartnerJsonLdProps {
  partner: {
    id?: string;
    name: string;
    description?: string | null;
    logo_url?: string | null;
    website_url?: string | null;
    category?: string | null;
    locations?: string[];
  };
  slug: string;
  programsSupported?: number;
  membersReached?: number;
}

/**
 * PartnerJsonLd - Schema.org/Organization structured data for AI/GEO optimization
 * 
 * Implements structured data for sponsor/partner organizations:
 * - Organization details
 * - Location information
 * - Brand representation
 */
const PartnerJsonLd = ({
  partner,
  slug,
  programsSupported = 0,
  membersReached = 0
}: PartnerJsonLdProps) => {
  const baseUrl = window.location.origin;
  const partnerUrl = `${baseUrl}/partners/${slug}`;

  // Build the JSON-LD schema
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'Sponsor'],
    '@id': partnerUrl,
    name: partner.name,
    description: partner.description || `${partner.name} - WellAgora partner`,
    url: partner.website_url || partnerUrl,
    logo: partner.logo_url || `${baseUrl}/placeholder.svg`,

    // Parent organization reference
    memberOf: {
      '@type': 'Organization',
      name: 'WellAgora Partner Network',
      url: baseUrl
    },

    // Category/Industry
    ...(partner.category && {
      knowsAbout: partner.category
    }),

    // Locations (if available)
    ...(partner.locations && partner.locations.length > 0 && {
      areaServed: partner.locations.map(location => ({
        '@type': 'Place',
        name: location,
        address: {
          '@type': 'PostalAddress',
          addressLocality: location,
          addressCountry: 'HU'
        }
      }))
    }),

    // Impact metrics as structured data
    ...(programsSupported > 0 && {
      sponsor: {
        '@type': 'MonetaryGrant',
        name: `${partner.name} támogatási program`,
        description: `${programsSupported} közösségi programot támogat, ${membersReached} tagot ért el`
      }
    }),

    // Same as website
    ...(partner.website_url && {
      sameAs: [partner.website_url]
    })
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};

export default PartnerJsonLd;
