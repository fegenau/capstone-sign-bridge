// src/utils/constants.js
export const SCREEN_NAMES = {
  SPLASH: 'Splash',
  ALPHABET_DETECTION: 'AlphabetDetection',
  HOME: 'Home',
  CAMERA: 'Camera',
  PRACTICE: 'Practice',
  DICTIONARY: 'Dictionary',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  TUTORIAL: 'Tutorial',
  RESULTS: 'Results',
};

// Configuración de la aplicación
export const APP_CONFIG = {
  APP_NAME: 'SignBridge',
  VERSION: '1.0.0',
  DEBUG_MODE: __DEV__,
};

// Configuración de detección
export const DETECTION_CONFIG = {
  CONFIDENCE_THRESHOLD: 0.7,
  DETECTION_INTERVAL: 500,
  HOLD_TIME: 2000,
  MAX_RETRIES: 3,
};

// Mensajes de la aplicación
export const MESSAGES = {
  WELCOME: 'Bienvenido a SignBridge',
  LOADING: 'Cargando...',
  CAMERA_PERMISSION: 'Se necesita permiso para usar la cámara',
  DETECTION_START: 'Coloca tu mano frente a la cámara',
  DETECTION_SUCCESS: '¡Letra detectada correctamente!',
  DETECTION_FAILED: 'No se pudo detectar la seña. Intenta de nuevo.',
};