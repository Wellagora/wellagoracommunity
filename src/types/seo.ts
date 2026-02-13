export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export interface OGTagData {
  title: string;
  description: string;
  image: string;
  url: string;
  type: 'website' | 'profile' | 'article' | 'product';
}
