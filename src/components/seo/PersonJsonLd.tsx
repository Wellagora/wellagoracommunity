import { Helmet } from 'react-helmet-async';

interface PersonJsonLdProps {
  name: string;
  description?: string;
  image?: string;
  url: string;
  jobTitle?: string;
  knowsAbout?: string[];
  locationCity?: string;
  socialLinks?: string[];
}

const PersonJsonLd = ({
  name,
  description,
  image,
  url,
  jobTitle,
  knowsAbout,
  locationCity,
  socialLinks,
}: PersonJsonLdProps) => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://wellagora.hu';

  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    ...(description && { "description": description }),
    ...(image && { "image": image }),
    "url": `${siteUrl}${url}`,
    ...(jobTitle && { "jobTitle": jobTitle }),
    ...(knowsAbout && knowsAbout.length > 0 && { "knowsAbout": knowsAbout }),
    ...(locationCity && {
      "address": {
        "@type": "PostalAddress",
        "addressLocality": locationCity,
        "addressCountry": "HU"
      }
    }),
    ...(socialLinks && socialLinks.length > 0 && { "sameAs": socialLinks }),
    "memberOf": {
      "@type": "Organization",
      "name": "WellAgora",
      "url": siteUrl
    }
  });

  return (
    <Helmet>
      <script type="application/ld+json">{schema}</script>
    </Helmet>
  );
};

export default PersonJsonLd;
