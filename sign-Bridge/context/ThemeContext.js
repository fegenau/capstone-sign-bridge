/**
 * context/ThemeContext.js
 *
 * Global Theme Provider for glassmorphic iOS design
 * Proporciona colores, estilos y temas a toda la aplicación
 *
 * Uso:
 * import { useTheme } from '../context/ThemeContext';
 * const { colors, styles, typography } = useTheme();
 */

import React, { createContext, useContext } from 'react';
import { StyleSheet, Platform } from 'react-native';

// Color Palette - iOS Glassmorphism
const COLORS = {
  // Primary
  neonGreen: '#00FF88',
  neonPurple: '#BB86FC',
  neonBlue: '#1FBAFF',

  // Dark mode - Background
  darkBackground: '#0A0A0A',
  darkSurface: '#1A1A1A',

  // Glass & Cards
  glassLight: 'rgba(255, 255, 255, 0.1)',
  glassDark: 'rgba(0, 0, 0, 0.3)',
  glassMedium: 'rgba(255, 255, 255, 0.05)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.5)',

  // Borders & Dividers
  border: 'rgba(255, 255, 255, 0.15)',
  divider: 'rgba(255, 255, 255, 0.1)',

  // Status
  success: '#00FF88',
  warning: '#FFB800',
  error: '#FF6B6B',
  info: '#1FBAFF',
};

// Shadow Styles
const SHADOWS = {
  none: {
    shadowOpacity: 0,
    elevation: 0,
  },
  light: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 2,
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    android: {
      elevation: 4,
    },
  }),
  heavy: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
  }),
};

// Typography Scales
const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
  },
  h5: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400',
  },
};

// Reusable Component Styles
const COMPONENT_STYLES = {
  // Container styles
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.darkBackground,
  },

  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.darkBackground,
  },

  // Glass card
  glassCard: {
    backgroundColor: COLORS.glassLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.light,
  },

  glassCardLarge: {
    backgroundColor: COLORS.glassLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 24,
    ...SHADOWS.medium,
  },

  glassCardCompact: {
    backgroundColor: COLORS.glassLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    ...SHADOWS.light,
  },

  // Button styles
  buttonPrimary: {
    backgroundColor: COLORS.neonGreen,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },

  buttonSecondary: {
    backgroundColor: COLORS.glassDark,
    borderWidth: 1.5,
    borderColor: COLORS.neonGreen,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },

  buttonTextPrimary: {
    color: COLORS.darkBackground,
    fontWeight: '600',
    fontSize: 16,
  },

  // Text styles
  textPrimary: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.body,
  },

  textSecondary: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
  },

  textTertiary: {
    color: COLORS.textTertiary,
    ...TYPOGRAPHY.caption,
  },

  // Input field
  inputField: {
    backgroundColor: COLORS.glassDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 16,
  },

  // Status badge
  badge: {
    backgroundColor: COLORS.neonGreen,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  badgeText: {
    color: COLORS.darkBackground,
    fontWeight: '600',
    fontSize: 12,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 16,
  },

  // Progress bar
  progressBar: {
    backgroundColor: COLORS.glassDark,
    borderRadius: 4,
    height: 4,
    overflow: 'hidden',
  },

  progressBarFill: {
    backgroundColor: COLORS.neonGreen,
    height: '100%',
    borderRadius: 4,
  },

  // Header
  header: {
    backgroundColor: COLORS.darkBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },

  // Modal overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: COLORS.darkSurface,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    ...SHADOWS.heavy,
  },

  // Loading spinner
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.darkBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty state
  emptyState: {
    flex: 1,
    backgroundColor: COLORS.darkBackground,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  emptyStateText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    ...TYPOGRAPHY.body,
  },
};

// Create Theme Context
const ThemeContext = createContext({
  colors: COLORS,
  shadows: SHADOWS,
  typography: TYPOGRAPHY,
  styles: COMPONENT_STYLES,
});

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const value = {
    colors: COLORS,
    shadows: SHADOWS,
    typography: TYPOGRAPHY,
    styles: COMPONENT_STYLES,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom Hook to Use Theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Export theme for direct use
export { COLORS, SHADOWS, TYPOGRAPHY, COMPONENT_STYLES };
