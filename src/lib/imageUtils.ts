/**
 * Image utility functions for handling fallbacks and broken images
 */

// Category-based fallback images from Unsplash
const CATEGORY_FALLBACKS: Record<string, string> = {
  gardening: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop",
  gastronomy: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
  crafts: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&h=600&fit=crop",
  health: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
  art: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop",
  wellness: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&h=600&fit=crop",
  default: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&h=600&fit=crop",
};

/**
 * Get fallback image URL based on category
 */
export const getFallbackImage = (category?: string | null): string => {
  if (!category) return CATEGORY_FALLBACKS.default;
  const normalizedCategory = category.toLowerCase();
  return CATEGORY_FALLBACKS[normalizedCategory] || CATEGORY_FALLBACKS.default;
};

/**
 * Handle image error by replacing with fallback
 */
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement>,
  category?: string | null
): void => {
  const img = event.currentTarget;
  const fallback = getFallbackImage(category);
  
  // Only replace if not already the fallback to prevent infinite loop
  if (img.src !== fallback) {
    img.src = fallback;
  }
};

/**
 * Get image URL with fallback support
 */
export const getImageWithFallback = (
  imageUrl: string | null | undefined,
  category?: string | null
): string => {
  if (imageUrl && imageUrl.trim() !== '') {
    return imageUrl;
  }
  return getFallbackImage(category);
};
