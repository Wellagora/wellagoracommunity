import { Helmet } from 'react-helmet-async';
import { generateExpertSchema } from '@/lib/seo/jsonLdSchemas';

interface ExpertJsonLdProps {
  expert: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    expert_title?: string | null;
    slug?: string | null;
    social_links?: Record<string, string> | null;
  };
}

const ExpertJsonLd = ({ expert }: ExpertJsonLdProps) => {
  const schema = generateExpertSchema(expert);

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default ExpertJsonLd;
