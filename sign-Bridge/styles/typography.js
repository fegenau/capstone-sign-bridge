import { Platform } from 'react-native';

const FONT_FAMILY = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
  }),
};

export const TYPOGRAPHY = {
  // Títulos
  h1: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.2,
  },
  h4: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 20,
    lineHeight: 28,
  },
  
  // Texto de cuerpo
  body1: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  body2: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Texto pequeño
  caption: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  overline: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  
  // Elementos especiales
  button: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
  },
  
  // Para la letra detectada (muy grande)
  detectedLetter: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 80,
    lineHeight: 88,
    letterSpacing: -1,
  },
  
  // Para elementos de navegación
  tabLabel: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 12,
    lineHeight: 16,
  },
};