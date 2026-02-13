import type { OGTagData } from '@/types/seo';

/**
 * Client-side OG tag updater for dynamic pages.
 * For SPA pages where react-helmet-async SEOHead is not used,
 * this provides a fallback DOM-based approach.
 */
export function updateOGTags(data: OGTagData) {
  document.title = data.title;

  setMetaTag('property', 'og:title', data.title);
  setMetaTag('property', 'og:description', data.description);
  setMetaTag('property', 'og:image', data.image);
  setMetaTag('property', 'og:url', data.url);
  setMetaTag('property', 'og:type', data.type);
  setMetaTag('name', 'description', data.description);
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', data.title);
  setMetaTag('name', 'twitter:description', data.description);
  setMetaTag('name', 'twitter:image', data.image);
}

function setMetaTag(attrName: string, attrValue: string, content: string) {
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}
