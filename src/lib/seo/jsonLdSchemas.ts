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

export function generateEventSchema(event: {
  id: string;
  title: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  location?: string | null;
  image_url?: string | null;
  max_participants?: number | null;
  current_participants?: number | null;
  is_free?: boolean | null;
}): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description || undefined,
    image: event.image_url || undefined,
    url: `${window.location.origin}/esemenyek/${event.id}`,
    organizer: {
      '@type': 'Organization',
      name: 'WellAgora',
      url: window.location.origin,
    },
  };

  if (event.start_date) schema.startDate = event.start_date;
  if (event.end_date) schema.endDate = event.end_date;
  if (event.location) {
    schema.location = { '@type': 'Place', name: event.location };
  }
  if (event.is_free) {
    schema.isAccessibleForFree = true;
  }
  if (event.max_participants) {
    schema.maximumAttendeeCapacity = event.max_participants;
  }

  return schema;
}
