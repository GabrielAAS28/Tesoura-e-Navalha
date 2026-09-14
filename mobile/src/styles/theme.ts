export const theme = {
  colors: {
    bg: '#121214',
    surface: '#1E1E24',
    surfaceAlt: '#26262E',
    border: '#3F3F46',
    textPrimary: '#F4F4F5',
    textSecondary: '#A1A1AA',
    accent: '#D97706',
    accentHover: '#B45309',
    success: '#22C55E',
    error: '#EF4444',
  },
  radius: {sm: 8, md: 12, lg: 16, full: 999},
  spacing: {xs: 4, sm: 8, md: 16, lg: 24, xl: 32},
  font: {
    regular: 'PlusJakartaSans-Regular',
    medium: 'PlusJakartaSans-Medium',
    semibold: 'PlusJakartaSans-SemiBold',
    bold: 'PlusJakartaSans-Bold',
  },
} as const;

export type AppTheme = typeof theme;
export default theme;
