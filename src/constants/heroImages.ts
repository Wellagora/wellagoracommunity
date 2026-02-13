// Configuration for hero images that can be easily swapped
// Owner will provide regional photos later

export const HERO_IMAGES = {
  marketplace: {
    placeholder: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
    alt: 'Marketplace',
    credit: 'Unsplash - Campaign Creators',
  },
  community: {
    placeholder: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=600&fit=crop',
    alt: 'Community',
    credit: 'Unsplash - Elements',
  },
  events: {
    placeholder: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=600&fit=crop',
    alt: 'Events',
    credit: 'Unsplash - Mentatdgt',
  },
  about: {
    placeholder: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&h=600&fit=crop',
    alt: 'About WellAgora',
    credit: 'Unsplash - Kampus Production',
  },
  homepage: {
    placeholder: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1400&h=700&fit=crop',
    alt: 'Welcome to WellAgora',
    credit: 'Unsplash - Campaign Creators',
  },
};

export function getHeroImage(key: keyof typeof HERO_IMAGES): string {
  return HERO_IMAGES[key]?.placeholder || HERO_IMAGES.homepage.placeholder;
}

export function getHeroImageCredit(key: keyof typeof HERO_IMAGES): string {
  return HERO_IMAGES[key]?.credit || 'Unsplash';
}
