/**
 * Role-based color accent system for WellAgora
 * Each user role gets a distinct accent color for visual identity
 */

export type UserRole = 'member' | 'expert' | 'creator' | 'sponsor' | 'business' | 'admin' | 'super_admin';

export interface RoleColorSet {
  /** Tailwind bg class: bg-{color}-500 */
  bg: string;
  /** Tailwind bg-light class: bg-{color}-50 */
  bgLight: string;
  /** Tailwind text class: text-{color}-600 */
  text: string;
  /** Tailwind border class: border-{color}-200 */
  border: string;
  /** Tailwind ring class: ring-{color}-500 */
  ring: string;
  /** CSS hex for inline styles */
  hex: string;
  /** Role label key */
  labelKey: string;
}

const ROLE_COLORS: Record<string, RoleColorSet> = {
  member: {
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    ring: 'ring-emerald-500',
    hex: '#059669',
    labelKey: 'roles.member',
  },
  expert: {
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
    ring: 'ring-amber-500',
    hex: '#d97706',
    labelKey: 'roles.expert',
  },
  creator: {
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
    ring: 'ring-amber-500',
    hex: '#d97706',
    labelKey: 'roles.creator',
  },
  sponsor: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    ring: 'ring-blue-500',
    hex: '#2563eb',
    labelKey: 'roles.sponsor',
  },
  business: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    ring: 'ring-blue-500',
    hex: '#2563eb',
    labelKey: 'roles.business',
  },
  admin: {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    ring: 'ring-purple-500',
    hex: '#7c3aed',
    labelKey: 'roles.admin',
  },
  super_admin: {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    ring: 'ring-purple-500',
    hex: '#7c3aed',
    labelKey: 'roles.admin',
  },
};

const DEFAULT_COLORS = ROLE_COLORS.member;

/**
 * Get the color set for a given user role
 */
export function getRoleColors(role?: string | null): RoleColorSet {
  if (!role) return DEFAULT_COLORS;
  return ROLE_COLORS[role] || DEFAULT_COLORS;
}

/**
 * Get the accent hex color for a role (for inline styles, charts, etc.)
 */
export function getRoleHex(role?: string | null): string {
  return getRoleColors(role).hex;
}
