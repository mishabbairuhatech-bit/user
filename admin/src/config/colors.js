// Shared color configuration - used by both Tailwind and components
// This ensures consistent colors across the application

export const colors = {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#166534',
    800: '#14532d',
    900: '#052e16',
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  info: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  // Additional Tailwind colors for avatars
  emerald: { 500: '#10b981' },
  amber: { 500: '#f59e0b' },
  rose: { 500: '#f43f5e' },
  cyan: { 500: '#06b6d4' },
  purple: { 500: '#a855f7' },
  pink: { 500: '#ec4899' },
  teal: { 500: '#14b8a6' },
  indigo: { 500: '#6366f1' },
  orange: { 500: '#f97316' },
  blue: { 500: '#3b82f6' },
};

// Helper to get color by name and shade
export const getColor = (name, shade = 500) => {
  return colors[name]?.[shade] || colors.gray[500];
};

// Map Tailwind class names to hex colors from config
export const colorClassToHex = {
  'bg-primary-500': colors.primary[500],
  'bg-primary-600': colors.primary[600],
  'bg-success-500': colors.success[500],
  'bg-danger-500': colors.danger[500],
  'bg-warning-500': colors.warning[500],
  'bg-info-500': colors.info[500],
  'bg-gray-500': colors.gray[500],
  'bg-gray-100': colors.gray[100],
  'bg-emerald-500': colors.emerald[500],
  'bg-amber-500': colors.amber[500],
  'bg-rose-500': colors.rose[500],
  'bg-cyan-500': colors.cyan[500],
  'bg-purple-500': colors.purple[500],
  'bg-pink-500': colors.pink[500],
  'bg-teal-500': colors.teal[500],
  'bg-indigo-500': colors.indigo[500],
  'bg-orange-500': colors.orange[500],
  'bg-blue-500': colors.blue[500],
};

export default colors;
