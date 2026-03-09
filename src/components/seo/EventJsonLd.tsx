import { Helmet } from 'react-helmet-async';

interface EventJsonLdProps {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  locationName?: string;
  locationAddress?: string;
  image?: string;
  url: string;
  organizerName?: string;
  isFree?: boolean;
  maxAttendees?: number;
  currentAttendees?: number;
}

const EventJsonLd = ({
  name,
  description,
  startDate,
  endDate,
  locationName,
  locationAddress,
  image,
  url,
  organizerName,
  isFree,
  maxAttendees,
  currentAttendees,
}: EventJsonLdProps) => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://wellagora.hu';

  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Event",
    "name": name,
    ...(description && { "description": description }),
    "startDate": startDate,
    ...(endDate && { "endDate": endDate }),
    ...(image && { "image": image }),
    "url": `${siteUrl}${url}`,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    ...(locationName && {
      "location": {
        "@type": "Place",
        "name": locationName,
        ...(locationAddress && {
          "address": {
            "@type": "PostalAddress",
            "streetAddress": locationAddress,
            "addressCountry": "HU"
          }
        })
      }
    }),
    ...(organizerName && {
      "organizer": {
        "@type": "Person",
        "name": organizerName
      }
    }),
    "offers": {
      "@type": "Offer",
      "price": isFree ? "0" : undefined,
      "priceCurrency": "HUF",
      "availability": maxAttendees && currentAttendees && currentAttendees >= maxAttendees
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      "url": `${siteUrl}${url}`
    },
    ...(maxAttendees && { "maximumAttendeeCapacity": maxAttendees }),
    ...(currentAttendees && { "remainingAttendeeCapacity": maxAttendees ? maxAttendees - currentAttendees : undefined })
  });

  return (
    <Helmet>
      <script type="application/ld+json">{schema}</script>
    </Helmet>
  );
};

export default EventJsonLd;
