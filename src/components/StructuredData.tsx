import { Helmet } from 'react-helmet-async';

interface OrganizationSchemaProps {
  type: 'Organization';
}

interface WebSiteSchemaProps {
  type: 'WebSite';
}

interface FAQSchemaProps {
  type: 'FAQPage';
  faqs: { question: string; answer: string }[];
}

interface BreadcrumbSchemaProps {
  type: 'BreadcrumbList';
  items: { name: string; url: string }[];
}

type StructuredDataProps =
  | OrganizationSchemaProps
  | WebSiteSchemaProps
  | FAQSchemaProps
  | BreadcrumbSchemaProps;

const BASE_URL = 'https://wellagora.org';

const StructuredData = (props: StructuredDataProps) => {
  let jsonLd: Record<string, unknown>;

  switch (props.type) {
    case 'Organization':
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'WellAgora',
        url: BASE_URL,
        logo: `${BASE_URL}/og-image.png`,
        description:
          'Közösségi platform, ahol helyi szakértők fenntarthatósági workshopokat és programokat kínálnak.',
        sameAs: [
          'https://www.facebook.com/wellagora',
          'https://www.instagram.com/wellagora',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'info@wellagora.org',
          contactType: 'customer service',
          availableLanguage: ['Hungarian', 'English', 'German'],
        },
      };
      break;

    case 'WebSite':
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'WellAgora',
        url: BASE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${BASE_URL}/programs?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      };
      break;

    case 'FAQPage':
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: props.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      };
      break;

    case 'BreadcrumbList':
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: props.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
        })),
      };
      break;
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default StructuredData;
