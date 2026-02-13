// Centralized brand colors for consistency audit

export const BRAND_COLORS = {
  primary: '#10b981', // Green (primary action, growth)
  accent: '#f59e0b', // Amber (highlights, CTAs)
  secondary: '#3b82f6', // Blue (secondary actions)
  danger: '#ef4444', // Red (destructive actions)
  success: '#10b981', // Green (success states)
  warning: '#f59e0b', // Amber (warnings)
  muted: '#94a3b8', // Slate (muted text)
};

export const TAILWIND_COLORS = {
  primary: 'hsl(142, 71%, 45%)', // green-500
  accent: 'hsl(37, 92%, 50%)', // amber-400
};

export const BUTTON_VARIANTS = {
  default: 'bg-primary hover:bg-primary/90',
  outline: 'border-primary text-primary hover:bg-primary/10',
  secondary: 'bg-secondary hover:bg-secondary/90',
  accent: 'bg-accent hover:bg-accent/90',
};
