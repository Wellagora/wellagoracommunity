import { Helmet } from 'react-helmet-async';

interface SchemaOrgPerson {
  '@context': string;
  '@type': string;
  name: string;
  image?: string;
  description?: string;
  url?: string;
  sameAs?: string[];
  jobTitle?: string;
}

interface SchemaOrgCourse {
  '@context': string;
  '@type': string;
  name: string;
  description?: string;
  image?: string;
  provider?: Record<string, unknown>;
  instructor?: Record<string, unknown>;
}

export function generateExpertSchema(expert: {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  expert_title?: string | null;
  slug?: string | null;
  social_links?: Record<string, string> | null;
}): SchemaOrgPerson {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: `${expert.first_name || ''} ${expert.last_name || ''}`.trim(),
    image: expert.avatar_url || undefined,
    description: expert.bio || undefined,
    url: `${window.location.origin}/expert/${expert.slug || expert.id}`,
    jobTitle: expert.expert_title || undefined,
    sameAs: expert.social_links
      ? (Object.values(expert.social_links).filter((v): v is string => !!v))
      : [],
  };
}

export function generateProgramSchema(
  program: {
    id: string;
    title: string;
    description?: string | null;
    image_url?: string | null;
    slug?: string | null;
  },
  expert?: {
    first_name?: string | null;
    last_name?: string | null;
  } | null
): SchemaOrgCourse {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: program.title,
    description: program.description || undefined,
    image: program.image_url || undefined,
    provider: {
      '@type': 'Organization',
      name: 'WellAgora',
      url: window.location.origin,
    },
    instructor: expert
      ? {
          '@type': 'Person',
          name: `${expert.first_name || ''} ${expert.last_name || ''}`.trim(),
        }
      : undefined,
  };
}
