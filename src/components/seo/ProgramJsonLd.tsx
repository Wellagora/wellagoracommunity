import { Helmet } from 'react-helmet-async';

interface ProgramJsonLdProps {
  program: {
    id: string;
    title: string;
    description?: string | null;
    image_url?: string | null;
    price_huf?: number | null;
    category?: string | null;
    content_type?: string | null;
    is_sponsored?: boolean | null;
    sponsor_name?: string | null;
    problem_solution?: {
      problem?: string | null;
      solution?: string | null;
    } | null;
  };
  creator?: {
    first_name: string;
    last_name: string;
    is_verified_expert?: boolean;
  } | null;
  sponsorContribution?: number;
  memberPayment?: number;
  rating?: number;
  reviewCount?: number;
}

/**
 * ProgramJsonLd - Schema.org/Course structured data for AI/GEO optimization
 * 
 * Implements structured data for:
 * - Course details (title, description, provider)
 * - Offers (pricing with sponsor discounts)
 * - Funder/Sponsor information (when applicable)
 * - Reviews and ratings
 */
const ProgramJsonLd = ({
  program,
  creator,
  sponsorContribution = 0,
  memberPayment,
  rating,
  reviewCount
}: ProgramJsonLdProps) => {
  const baseUrl = window.location.origin;
  const programUrl = `${baseUrl}/programs/${program.id}`;
  
  // Determine course mode based on content type
  const getCourseMode = () => {
    switch (program.content_type) {
      case 'online_live': return 'Online';
      case 'recorded': return 'Online';
      case 'in_person': return 'Blended'; // Could be Offline but Blended covers both
      default: return 'Blended';
    }
  };

  // Calculate final price (what user pays)
  const finalPrice = memberPayment !== undefined 
    ? memberPayment 
    : Math.max(0, (program.price_huf || 0) - sponsorContribution);

  // Build the JSON-LD schema
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': programUrl,
    name: program.title,
    description: program.description || `${program.title} - WellAgora közösségi program`,
    url: programUrl,
    image: program.image_url || `${baseUrl}/og-image.png`,
    inLanguage: 'hu',
    courseMode: getCourseMode(),
    
    // Provider (Expert)
    provider: creator ? {
      '@type': 'Person',
      name: `${creator.first_name} ${creator.last_name}`,
      ...(creator.is_verified_expert && { 
        hasCredential: {
          '@type': 'EducationalOccupationalCredential',
          credentialCategory: 'Verified Expert'
        }
      })
    } : {
      '@type': 'Organization',
      name: 'WellAgora',
      url: baseUrl
    },

    // Offers - Pricing information
    offers: {
      '@type': 'Offer',
      url: programUrl,
      priceCurrency: 'HUF',
      price: finalPrice,
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString().split('T')[0],
      ...(program.is_sponsored && sponsorContribution > 0 && {
        priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days
      })
    },

    // Category as course subject
    ...(program.category && {
      about: {
        '@type': 'Thing',
        name: program.category
      }
    }),

    // Educational level
    educationalLevel: 'Beginner',
    
    // Problem-Solution as learning outcomes (if available)
    ...(program.problem_solution?.solution && {
      teaches: program.problem_solution.solution
    }),

    // Aggregate rating (if available)
    ...(rating && reviewCount && reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.toFixed(1),
        bestRating: 5,
        worstRating: 1,
        ratingCount: reviewCount
      }
    })
  };

  // Add Funder/Sponsor if sponsored
  if (program.is_sponsored && program.sponsor_name) {
    jsonLd.funder = {
      '@type': 'Organization',
      name: program.sponsor_name,
      ...(sponsorContribution > 0 && {
        description: `Támogatói hozzájárulás: ${sponsorContribution.toLocaleString('hu-HU')} Ft`
      })
    };

    // Also add as sponsor property (more explicit)
    jsonLd.sponsor = {
      '@type': 'Organization',
      name: program.sponsor_name
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};

export default ProgramJsonLd;
