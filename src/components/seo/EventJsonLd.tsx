import { Helmet } from 'react-helmet-async';
import { generateEventSchema } from '@/lib/seo/jsonLdSchemas';

interface EventJsonLdProps {
  event: {
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
  };
}

const EventJsonLd = ({ event }: EventJsonLdProps) => {
  const schema = generateEventSchema(event);

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default EventJsonLd;
