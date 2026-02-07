import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LivePulseToastProps {
  enabled?: boolean;
  interval?: number;
}

// Disabled: no fake live activity. Will be re-enabled with real-time DB data.
export const LivePulseToast = ({ enabled = true, interval = 12000 }: LivePulseToastProps) => {
  return null;
};

export default LivePulseToast;
