import { useEffect, useState } from 'react';
import { generateSitemapXML } from '@/lib/siteMapGenerator';

/**
 * SitemapPage — Client-side sitemap generator.
 * Renders raw XML for crawlers that execute JavaScript.
 * For static sitemap, use the build-time generation script.
 */
const SitemapPage = () => {
  const [xml, setXml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generate = async () => {
      try {
        const baseUrl = window.location.origin;
        const sitemapXml = await generateSitemapXML(baseUrl);
        setXml(sitemapXml);

        // Set content type for crawlers
        document.title = 'Sitemap - WellAgora';
      } catch (err) {
        console.error('Sitemap generation error:', err);
        setError('Failed to generate sitemap');
      }
    };

    generate();
  }, []);

  if (error) {
    return <pre style={{ fontFamily: 'monospace', padding: '1rem' }}>{error}</pre>;
  }

  if (!xml) {
    return <pre style={{ fontFamily: 'monospace', padding: '1rem' }}>Generating sitemap...</pre>;
  }

  return (
    <pre
      style={{
        fontFamily: 'monospace',
        fontSize: '12px',
        padding: '1rem',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
      }}
    >
      {xml}
    </pre>
  );
};

export default SitemapPage;
