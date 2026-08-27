// FoodBridge Shared Design Tokens & Theme System

export const COLORS = {
  // Brand Palettes
  primary: '#2e7d32', // Main FoodBridge Green
  primaryLight: '#66bb6a',
  primaryDark: '#1b5e20',
  primaryGradient: 'linear-gradient(to right, #2e7d32, #66bb6a)',

  // Role Color Themes
  donor: {
    primary: '#2e7d32',
    gradient: 'linear-gradient(to right, #2e7d32, #66bb6a)',
    bgLight: '#e8f5e9',
    text: '#1b5e20',
  },
  ngo: {
    primary: '#1b5e20',
    gradient: 'linear-gradient(to right, #1b5e20, #2e7d32)',
    bgLight: '#e8f5e9',
    text: '#0d3b10',
  },
  volunteer: {
    primary: '#1565c0',
    gradient: 'linear-gradient(to right, #1565c0, #1e88e5)',
    bgLight: '#e3f2fd',
    text: '#0d47a1',
  },
  receiver: {
    primary: '#e65100',
    gradient: 'linear-gradient(to right, #e65100, #f57c00)',
    bgLight: '#fff3e0',
    text: '#b71c1c',
  },
  admin: {
    primary: '#263238',
    gradient: 'linear-gradient(to right, #263238, #37474f)',
    bgLight: '#eceff1',
    text: '#102a43',
  },

  // Status Colors
  status: {
    pending: { bg: '#fff3e0', color: '#e65100' },
    accepted: { bg: '#e3f2fd', color: '#1565c0' },
    assigned: { bg: '#e8eaf6', color: '#283593' },
    inTransit: { bg: '#f3e5f5', color: '#6a1b9a' },
    delivered: { bg: '#e8f5e9', color: '#2e7d32' },
    completed: { bg: '#e8f5e9', color: '#2e7d32' },
    cancelled: { bg: '#ffebee', color: '#c62828' },
  },

  // Neutral Colors
  background: '#f5f5f5',
  cardBg: '#ffffff',
  textPrimary: '#212121',
  textSecondary: '#666666',
  textLight: '#999999',
  border: '#e0e0e0',
  white: '#ffffff',
  error: '#c62828',
  errorBg: '#ffebee',
  success: '#2e7d32',
  warning: '#f57c00',
};

export const TYPOGRAPHY = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '22px',
    xxl: '28px',
    hero: '36px',
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
};

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const RADIUS = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
};

export const SHADOWS = {
  card: '0 4px 12px rgba(0, 0, 0, 0.08)',
  elevated: '0 8px 24px rgba(0, 0, 0, 0.12)',
  button: '0 4px 10px rgba(46, 125, 50, 0.3)',
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
};
