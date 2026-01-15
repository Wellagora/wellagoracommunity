// Image resolver for database paths to actual asset imports
// Maps /src/assets/... paths stored in DB to actual imported assets

import programSourdough from '@/assets/program-sourdough.jpg';
import programUrbanGarden from '@/assets/program-urban-garden.jpg';
import programHerbs from '@/assets/program-herbs.jpg';
import programPottery from '@/assets/program-pottery.jpg';
import programMindfulness from '@/assets/program-mindfulness.jpg';
import programFermentation from '@/assets/program-fermentation.jpg';
import programNaturalCosmetics from '@/assets/program-natural-cosmetics.jpg';
import programBeekeeping from '@/assets/program-beekeeping.jpg';
import expertHanna from '@/assets/expert-hanna.jpg';
import expertMarton from '@/assets/expert-marton.jpg';
import expertElena from '@/assets/expert-elena.jpg';
import expertZoltan from '@/assets/expert-zoltan.jpg';

const imageMap: Record<string, string> = {
  '/src/assets/program-sourdough.jpg': programSourdough,
  '/src/assets/program-urban-garden.jpg': programUrbanGarden,
  '/src/assets/program-herbs.jpg': programHerbs,
  '/src/assets/program-pottery.jpg': programPottery,
  '/src/assets/program-mindfulness.jpg': programMindfulness,
  '/src/assets/program-fermentation.jpg': programFermentation,
  '/src/assets/program-natural-cosmetics.jpg': programNaturalCosmetics,
  '/src/assets/program-beekeeping.jpg': programBeekeeping,
  '/src/assets/expert-hanna.jpg': expertHanna,
  '/src/assets/expert-marton.jpg': expertMarton,
  '/src/assets/expert-elena.jpg': expertElena,
  '/src/assets/expert-zoltan.jpg': expertZoltan,
};

/**
 * Resolves a database image path to an actual importable asset URL
 * Falls back to the original URL if not found in the map
 */
export const resolveImageUrl = (dbPath: string | null | undefined): string | null => {
  if (!dbPath) return null;
  
  // Check if it's a path we need to resolve
  if (dbPath.startsWith('/src/assets/')) {
    return imageMap[dbPath] || null;
  }
  
  // Return original URL for external URLs or already-resolved paths
  return dbPath;
};

/**
 * Get avatar URL with fallback
 */
export const resolveAvatarUrl = (avatarUrl: string | null | undefined): string | undefined => {
  const resolved = resolveImageUrl(avatarUrl);
  return resolved || undefined;
};
