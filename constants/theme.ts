// Smart Accounting Platform — Design System
export const Colors = {
  // Brand
  primary: '#1B4FD8',       // Royal Blue
  primaryDark: '#1239A8',
  primaryLight: '#EEF2FF',
  accent: '#10B981',        // Emerald Green
  accentLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',

  // Surfaces
  background: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Sidebar
  sidebar: '#0F1E3C',
  sidebarActive: '#1B4FD8',
  sidebarHover: '#1A2E56',
  sidebarBorder: '#1E3358',
  sidebarText: '#94A3B8',
  sidebarTextActive: '#FFFFFF',

  // Text
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Status
  success: '#10B981',
  successLight: '#ECFDF5',
  error: '#EF4444',
  errorLight: '#FEF2F2',
  info: '#3B82F6',
  infoLight: '#EFF6FF',

  // Charts
  chart1: '#1B4FD8',
  chart2: '#10B981',
  chart3: '#F59E0B',
  chart4: '#EF4444',
  chart5: '#8B5CF6',

  // Financial
  positive: '#10B981',
  negative: '#EF4444',
  neutral: '#94A3B8',
};

export const Typography = {
  fontSizeXS: 11,
  fontSizeSM: 13,
  fontSizeBase: 15,
  fontSizeMD: 16,
  fontSizeLG: 18,
  fontSizeXL: 20,
  fontSize2XL: 22,
  fontSize3XL: 26,
  fontSize4XL: 32,

  fontWeightRegular: '400' as const,
  fontWeightMedium: '500' as const,
  fontWeightSemibold: '600' as const,
  fontWeightBold: '700' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const Radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
