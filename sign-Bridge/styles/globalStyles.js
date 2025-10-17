import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from './colors';
import { TYPOGRAPHY } from './typography';

const { width, height } = Dimensions.get('window');

export const DIMENSIONS = {
  screenWidth: width,
  screenHeight: height,
  headerHeight: 60,
  tabBarHeight: 80,
  buttonHeight: 48,
  inputHeight: 48,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 50,
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  large: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const GLOBAL_STYLES = StyleSheet.create({
  // Contenedores
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Contenido
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  
  contentCentered: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Headers
  header: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    textAlign: 'center',
  },
  
  headerSubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  
  // Botones
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: DIMENSIONS.buttonHeight,
  },
  
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  
  buttonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textDark,
  },
  
  buttonTextSecondary: {
    color: COLORS.primary,
  },
  
  // Texto
  text: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
  },
  
  textSecondary: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
  },
  
  textCenter: {
    textAlign: 'center',
  },
  
  // Estados de carga y error
  loadingText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  
  errorText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.error,
    textAlign: 'center',
  },
  
  // Separadores
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  
  // Elementos de UI comunes
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.medium,
  },
  
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Utilidades de responsive design
export const isSmallDevice = width < 375;
export const isMediumDevice = width >= 375 && width < 414;
export const isLargeDevice = width >= 414;

export const getResponsiveSize = (small, medium, large) => {
  if (isSmallDevice) return small;
  if (isMediumDevice) return medium;
  return large;
};