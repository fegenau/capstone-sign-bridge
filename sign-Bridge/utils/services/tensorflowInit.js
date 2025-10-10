// utils/services/tensorflowInit.js
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

/**
 * Inicializa TensorFlow.js para React Native
 */
export const initializeTensorFlow = async () => {
  try {
    console.log('🧠 Inicializando TensorFlow.js...');
    
    // Esperar a que TensorFlow esté listo
    await tf.ready();
    
    // Configurar backend (automático en React Native)
    console.log('🔧 Backend TensorFlow activo:', tf.getBackend());
    console.log('📱 Plataforma:', tf.env().platform);
    
    console.log('✅ TensorFlow.js inicializado correctamente');
    
    return true;
  } catch (error) {
    console.error('❌ Error inicializando TensorFlow.js:', error);
    throw error;
  }
};

/**
 * Obtiene información del estado de TensorFlow
 */
export const getTensorFlowInfo = () => {
  return {
    version: tf.version.tfjs,
    backend: tf.getBackend(),
    platform: tf.env().platform,
    isReady: tf.ready
  };
};