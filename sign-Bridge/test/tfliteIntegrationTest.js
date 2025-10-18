// test/tfliteIntegrationTest.js
// Prueba simple para verificar la integración de TensorFlow Lite

import { fastTfliteService } from '../utils/services/fastTfliteService';
import { detectionService } from '../utils/services/detectionService';

export async function testTFLiteIntegration() {
  console.log('🧪 Iniciando prueba de integración TensorFlow Lite...');
  
  try {
    // 1. Verificar disponibilidad
    const isAvailable = fastTfliteService.isAvailable();
    console.log('📱 Servicio disponible en esta plataforma:', isAvailable);
    
    // 2. Obtener información del modelo antes de cargar
    let modelInfo = fastTfliteService.getModelInfo();
    console.log('📋 Info del modelo (antes de cargar):', modelInfo);
    
    // 3. Cargar modelo
    const loaded = await fastTfliteService.loadModel();
    console.log('📦 Modelo cargado:', loaded);
    
    // 4. Obtener información del modelo después de cargar
    modelInfo = fastTfliteService.getModelInfo();
    console.log('📋 Info del modelo (después de cargar):', modelInfo);
    
    // 5. Cargar el servicio de detección
    await detectionService.loadModel();
    console.log('🔄 Servicio de detección inicializado');
    
    // 6. Simular una predicción
    const testImageUri = 'test://fake-image.jpg';
    const prediction = await fastTfliteService.predictFromImageUri(testImageUri, { threshold: 0.3 });
    console.log('🎯 Resultado de predicción:', prediction);
    
    // 7. Verificar que el resultado tiene la estructura esperada
    if (prediction) {
      const hasRequiredFields = 
        prediction.label && 
        typeof prediction.confidence === 'number' && 
        prediction.bbox;
      
      console.log('✅ Estructura de resultado válida:', hasRequiredFields);
      
      if (hasRequiredFields) {
        console.log(`🏆 Predicción exitosa: ${prediction.label} (${prediction.confidence}%)`);
      }
    } else {
      console.log('ℹ️ No se generó predicción (threshold no alcanzado)');
    }
    
    return {
      success: true,
      available: isAvailable,
      loaded: loaded,
      prediction: prediction
    };
    
  } catch (error) {
    console.error('❌ Error en prueba de integración:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Función para prueba rápida desde consola
export async function quickTest() {
  console.log('⚡ Prueba rápida de TensorFlow Lite...');
  const result = await testTFLiteIntegration();
  
  if (result.success) {
    console.log('✅ Integración TensorFlow Lite funcionando correctamente');
  } else {
    console.log('❌ Problemas en la integración:', result.error);
  }
  
  return result;
}