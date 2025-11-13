/**
 * styles/iosGlassMorphism.js
 *
 * iOS Glassmorphism Design System
 * Blur + Translucency + Neon Accents
 *
 * 🎨 Design Language:
 * - Background: Blur + semi-transparent white/gray
 * - Cards: Glass effect with subtle blur
 * - Colors: Neutral grays + Neon Green (#00FF88)
 * - Shadows: Subtle, iOS native style
 * - Typography: San Francisco system font
 */

import { StyleSheet, Platform } from 'react-native';

const colors = {
  // Primary palette
  neonGreen: '#00FF88',
  neonPurple: '#BB86FC',
  neonBlue: '#1FBAFF',

  // Neutral palette - iOS style
  darkBackground: '#0A0A0A', // Almost black
  cardBackground: 'rgba(255, 255, 255, 0.1)', // Ultra-light glass
  cardBackgroundDark: 'rgba(0, 0, 0, 0.3)', // Dark glass
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.5)',
  borderColor: 'rgba(255, 255, 255, 0.15)',

  // Status colors
  success: '#00FF88',
  warning: '#FFB800',
  error: '#FF6B6B',
  info: '#1FBAFF',
};

const shadows = {
  light: Platform.select({
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
  medium: Platform.select({
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
  heavy: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
    },
    android: {
      elevation: 16,
    },
  }),
};

const typography = {
  largeTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  title2: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  title3: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  headline: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  callout: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0,
    color: colors.textSecondary,
  },
  subheadline: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0,
    color: colors.textTertiary,
  },
};

const glassmorphicCard = {
  backgroundColor: colors.cardBackground,
  borderWidth: 1,
  borderColor: colors.borderColor,
  borderRadius: 16,
  backdropFilter: 'blur(20px)',
  ...shadows.light,
};

const styles = StyleSheet.create({
  // Backgrounds
  background: {
    backgroundColor: colors.darkBackground,
    flex: 1,
  },

  blurBackground: {
    backgroundColor: colors.darkBackground,
    flex: 1,
  },

  // Cards & Containers
  glassmorphicCard: {
    ...glassmorphicCard,
    padding: 16,
  },

  largeCard: {
    ...glassmorphicCard,
    padding: 20,
    marginVertical: 12,
  },

  compactCard: {
    ...glassmorphicCard,
    padding: 12,
    marginVertical: 8,
  },

  // Button Styles
  glassButton: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...shadows.light,
    alignItems: 'center',
    justifyContent: 'center',
  },

  glassButtonPrimary: {
    backgroundColor: colors.neonGreen,
    borderWidth: 0,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
    ...shadows.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },

  glassButtonPrimaryText: {
    ...typography.headline,
    color: colors.darkBackground,
    fontWeight: '600',
  },

  glassButtonSecondary: {
    backgroundColor: colors.cardBackgroundDark,
    borderWidth: 1,
    borderColor: colors.neonGreen,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    ...shadows.light,
    alignItems: 'center',
    justifyContent: 'center',
  },

  glassButtonSecondaryText: {
    ...typography.body,
    color: colors.neonGreen,
    fontWeight: '600',
  },

  // Badge styles (iOS style indicators)
  badge: {
    backgroundColor: colors.neonGreen,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  badgeText: {
    ...typography.caption,
    color: colors.darkBackground,
    fontWeight: '600',
  },

  // Status indicators
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },

  statusIndicatorActive: {
    backgroundColor: colors.neonGreen,
  },

  statusIndicatorInactive: {
    backgroundColor: colors.textTertiary,
  },

  // Progress bar (glassmorphic)
  progressBarBackground: {
    backgroundColor: colors.cardBackgroundDark,
    borderRadius: 4,
    height: 4,
    overflow: 'hidden',
  },

  progressBarFill: {
    backgroundColor: colors.neonGreen,
    height: '100%',
    borderRadius: 4,
  },

  // Typography utilities
  textPrimary: {
    ...typography.body,
    color: colors.textPrimary,
  },

  textSecondary: {
    ...typography.body,
    color: colors.textSecondary,
  },

  textTertiary: {
    ...typography.callout,
    color: colors.textTertiary,
  },

  // Special purpose styles
  divider: {
    height: 1,
    backgroundColor: colors.borderColor,
    marginVertical: 12,
  },

  // Accent line for headers
  accentLine: {
    height: 2,
    backgroundColor: colors.neonGreen,
    borderRadius: 1,
  },

  // Input field glassmorphic
  inputField: {
    ...glassmorphicCard,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 8,
    fontSize: 16,
    color: colors.textPrimary,
  },

  // Overlay glassmorphic (fullscreen modal backdrop)
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(10px)',
  },

  overlayContent: {
    ...glassmorphicCard,
    margin: 16,
  },
});

export { styles, colors, shadows, typography, glassmorphicCard };
