export const APP_CONFIG = {
  name: 'SignBridge',
  version: '1.0.0',
  description: 'Aplicación para aprender el alfabeto de señas',
  supportEmail: 'support@signbridge.com',
};

export const CAMERA_CONFIG = {
  defaultType: 'back', // 'back' | 'front'
  autoFocus: 'on',
  flashMode: 'off',
  whiteBalance: 'auto',
  ratio: '16:9',
};

export const DETECTION_CONFIG = {
  confidenceThreshold: 70, // Mínima confianza para mostrar como válida
  processingInterval: 100, // Milisegundos entre procesamiento
  maxDetectionTime: 5000, // Tiempo máximo para mantener una detección
};