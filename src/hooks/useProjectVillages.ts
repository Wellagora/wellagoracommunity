import { useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';

// Color palette for village badges — cycles through colors for any village
const VILLAGE_COLOR_PALETTE = [
  'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
  'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30',
  'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
  'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/30',
  'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
  'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30',
  'bg-teal-500/20 text-teal-700 dark:text-teal-400 border-teal-500/30',
];

const DEFAULT_VILLAGE_COLOR = 'bg-slate-500/20 text-slate-700 dark:text-slate-400 border-slate-500/30';

/**
 * Returns the list of villages from the current project context.
 * Also provides a color mapping function for village badges.
 */
export function useProjectVillages() {
  const { currentProject } = useProject();

  const villages = currentProject?.villages ?? [];

  const villageColors = useMemo(() => {
    const colors: Record<string, string> = {};
    villages.forEach((village, index) => {
      colors[village] = VILLAGE_COLOR_PALETTE[index % VILLAGE_COLOR_PALETTE.length];
    });
    return colors;
  }, [villages]);

  const getVillageColor = (village: string | null | undefined): string => {
    if (!village) return DEFAULT_VILLAGE_COLOR;
    return villageColors[village] || DEFAULT_VILLAGE_COLOR;
  };

  return { villages, villageColors, getVillageColor };
}
