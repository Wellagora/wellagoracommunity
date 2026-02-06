// Unified category list shared across Programs (expert_contents) and Events
export const CATEGORIES = [
  'lifestyle',
  'craft',
  'gastronomy',
  'wellness',
  'hiking',
  'gardening',
  'heritage',
  'volunteering',
  'market',
  'community',
  'sport',
  'culture',
  'family',
] as const;

export type Category = typeof CATEGORIES[number];
