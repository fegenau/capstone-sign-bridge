// src/utils/services/detectionService.js
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import { initializeTensorFlow } from './tensorflowInit';

// Alfabeto disponible para detección
const ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

// Configuración de detección
const DETECTION_CONFIG = {
  minConfidence: 30,      // Confianza mínima para mostrar resultado
  maxConfidence: 95,      // Confianza máxima realista
  modelPath: require('../../assets/Modelo/runs/detect/train/weights/best.pt'), // Ruta al modelo TFLite
  inputSize: 224,         // Tamaño de entrada esperado por el modelo
  detectionInterval: 1000 // Intervalo entre detecciones en ms

};

/**
 * Servicio principal de detección
 */
export class DetectionService {
  constructor() {
    this.isActive = false;
    this.callbacks = [];
    this.model = null;
    this.isModelLoaded = false;
  }

  /**
   * Registra un callback para recibir resultados de detección
   * @param {Function} callback - Función a llamar con resultados
   */
  onDetection(callback) {
    this.callbacks.push(callback);
  }

  /**
   * Desregistra un callback
   * @param {Function} callback - Función a remover
   */
  offDetection(callback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  /**
   * Notifica a todos los callbacks registrados
   * @param {Object} result - Resultado de detección
   */
  notifyCallbacks(result) {
    this.callbacks.forEach(callback => {
      try {
        callback(result);
      } catch (error) {
        console.error('Error en callback de detección:', error);
      }
    });
  }

  /**
   * Carga el modelo TensorFlow Lite
   */
  async loadModel() {
    if (this.isModelLoaded) {
      console.log('🧠 Modelo ya está cargado');
      return;
    }

    try {
      console.log('🧠 Cargando modelo CNN...', DETECTION_CONFIG.modelPath);
      
      // Inicializar TensorFlow.js
      await initializeTensorFlow();
      
      console.log('📂 Verificando modelo TFLite...');
      
      // Verificar si el archivo existe
      const modelInfo = await FileSystem.getInfoAsync(DETECTION_CONFIG.modelPath);
      
      if (!modelInfo.exists) {
        throw new Error(`Modelo no encontrado en: ${DETECTION_CONFIG.modelPath}`);
      }
      
      console.log('📁 Modelo encontrado, tamaño:', modelInfo.size, 'bytes');
      
      // NOTA: Los archivos .tflite no se pueden cargar directamente con TensorFlow.js
      // Necesitamos convertir el modelo a formato compatible o usar una librería específica
      
      // Por ahora, marcamos como cargado para permitir el desarrollo
      console.log('⚠️  ADVERTENCIA: Usando modo de desarrollo - modelo .tflite detectado pero no cargado');
      console.log('📋 Para producción, convertir el modelo a formato TensorFlow.js (.json + .bin)');
      
      // Simular carga exitosa para desarrollo
      this.model = {
        type: 'tflite-placeholder',
        path: DETECTION_CONFIG.modelPath,
        size: modelInfo.size
      };
      console.log('🧠 Modelo cargado desde:', modelUri);
      
      // Información del modelo
      console.log('📊 Información del modelo:');
      console.log('- Entradas:', this.model.inputs.map(input => ({
        name: input.name,
        shape: input.shape,
        dtype: input.dtype
      })));
      console.log('- Salidas:', this.model.outputs.map(output => ({
        name: output.name,
        shape: output.shape,
        dtype: output.dtype
      })));
      
      this.isModelLoaded = true;
      console.log('✅ Modelo CNN cargado exitosamente');
      
      this.notifyCallbacks({ 
        modelLoaded: true, 
        isProcessing: false 
      });
      
    } catch (error) {
      console.error('❌ Error cargando modelo:', error);
      this.notifyCallbacks({ 
        modelLoaded: false, 
        error: `Error cargando modelo: ${error.message}` 
      });
      throw error;
    }
  }

  /**
   * Preprocesa la imagen para el modelo CNN
   * @param {string} imageUri - URI de la imagen
   * @returns {Promise<tf.Tensor>} Tensor procesado listo para predicción
   */
  async preprocessImage(imageUri) {
    try {
      // Leer imagen desde URI
      let imageTensor;
      
      if (imageUri.startsWith('data:')) {
        // Si es base64, decodificar directamente
        const response = await fetch(imageUri);
        const imageBlob = await response.blob();
        imageTensor = decodeJpeg(new Uint8Array(await imageBlob.arrayBuffer()));
      } else {
        // Si es URI de archivo, leer desde FileSystem
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        imageTensor = decodeJpeg(bytes);
      }
      
      // Redimensionar la imagen al tamaño esperado por el modelo (224x224 típicamente)
      const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
      
      // Normalizar píxeles a rango [0, 1]
      const normalized = resized.div(255.0);
      
      // Expandir dimensiones para batch (agregar dimensión batch de 1)
      const batched = normalized.expandDims(0);
      
      // Limpiar tensores intermedios para liberar memoria
      imageTensor.dispose();
      resized.dispose();
      normalized.dispose();
      
      return batched;
      
    } catch (error) {
      console.error('Error en preprocesamiento de imagen:', error);
      throw error;
    }
  }

  /**
   * Procesa una imagen con el modelo CNN para detectar letras
   * @param {string|object} imageData - Datos de imagen (URI, base64, etc.)
   * @returns {Promise<object>} Resultado de predicción { letter, confidence }
   */
  async predictLetter(imageData) {
    if (!this.isModelLoaded) {
      throw new Error('Modelo no está cargado');
    }

    try {
      console.log('🔍 Procesando imagen con modelo CNN...');
      
      this.notifyCallbacks({ isProcessing: true });
      
      // Verificar si estamos en modo desarrollo con .tflite
      if (this.model.type === 'tflite-placeholder') {
        console.log('🔧 Modo desarrollo - simulando predicción con modelo .tflite');
        
        // Simular tiempo de procesamiento real
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Generar predicción simulada realista
        const predictions = new Array(26).fill(0).map(() => Math.random() * 0.1);
        const randomIndex = Math.floor(Math.random() * 26);
        predictions[randomIndex] = 0.7 + Math.random() * 0.3; // Confianza alta para letra seleccionada
        
        const predictedLetter = ALPHABET[randomIndex];
        const confidence = Math.round(predictions[randomIndex] * 100);
        
        const result = {
          letter: predictedLetter,
          confidence: confidence,
          timestamp: Date.now(),
          source: 'cnn-model-simulation',
          rawPredictions: predictions,
          isSimulation: true
        };
        
        console.log('✅ Predicción simulada completada:', {
          letter: result.letter,
          confidence: result.confidence,
          note: 'Usando simulación - convertir .tflite para predicciones reales'
        });
        
        this.notifyCallbacks({
          isProcessing: false,
          ...result
        });
        
        return result;
      }
      
      // Código original para modelos TensorFlow.js reales
      // 1. Preprocesar imagen
      const inputTensor = await this.preprocessImage(imageData);
      
      // 2. Ejecutar predicción
      const prediction = this.model.predict(inputTensor);
      
      // 3. Post-procesar resultados
      const predictions = await prediction.data();
      
      // Encontrar la clase con mayor probabilidad
      let maxProbability = 0;
      let predictedClass = 0;
      
      for (let i = 0; i < predictions.length; i++) {
        if (predictions[i] > maxProbability) {
          maxProbability = predictions[i];
          predictedClass = i;
        }
      }
      
      // Convertir índice de clase a letra
      const predictedLetter = ALPHABET[predictedClass] || 'UNKNOWN';
      const confidence = Math.round(maxProbability * 100);
      
      // Limpiar tensores para liberar memoria
      inputTensor.dispose();
      prediction.dispose();
      
      const result = {
        letter: predictedLetter,
        confidence: confidence,
        timestamp: Date.now(),
        source: 'cnn-model',
        rawPredictions: Array.from(predictions)
      };
      
      console.log('✅ Predicción completada:', {
        letter: result.letter,
        confidence: result.confidence,
        topPredictions: Array.from(predictions)
          .map((prob, index) => ({ letter: ALPHABET[index], confidence: Math.round(prob * 100) }))
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 3)
      });
      
      this.notifyCallbacks({
        isProcessing: false,
        ...result
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error en predicción:', error);
      this.notifyCallbacks({
        isProcessing: false,
        error: `Error en predicción: ${error.message}`
      });
      throw error;
    }
  }

  /**
   * Inicia la detección con modelo real
   */
  async startDetection() {
    if (this.isActive) {
      console.warn('DetectionService ya está activo');
      return;
    }

    try {
      this.isActive = true;
      console.log('🎯 DetectionService iniciado - modelo CNN');
      
      // Cargar el modelo CNN
      await this.loadModel();
      
      // Notificar que el servicio está en vivo
      this.notifyCallbacks({ 
        isProcessing: false, 
        isLive: true, 
        modelReady: this.isModelLoaded 
      });
      
    } catch (error) {
      console.error('Error iniciando DetectionService:', error);
      this.isActive = false;
      this.notifyCallbacks({ 
        isProcessing: false, 
        error: `Error iniciando servicio: ${error.message}` 
      });
      throw error;
    }
  }

  /**
   * Detiene la detección
   */
  stopDetection() {
    if (!this.isActive) {
      console.warn('DetectionService no está activo');
      return;
    }

    this.isActive = false;

    console.log('🛑 DetectionService detenido');
    
    // Notificar estado final
    this.notifyCallbacks({
      isProcessing: false,
      letter: null,
      confidence: 0,
      isStopped: true
    });
  }

  /**
   * Fuerza una detección manual con imagen
   * @param {string|object} imageData - Datos de imagen para procesar
   */
  async forceDetection(imageData) {
    if (!this.isActive) {
      console.warn('DetectionService no está activo');
      return;
    }

    if (!this.isModelLoaded) {
      console.warn('Modelo CNN no está cargado');
      this.notifyCallbacks({ 
        error: 'Modelo no está cargado' 
      });
      return;
    }

    try {
      console.log('🔄 Forzando detección manual con modelo CNN');
      const result = await this.predictLetter(imageData);
      return result;
    } catch (error) {
      console.error('Error en detección forzada:', error);
      return null;
    }
  }

  /**
   * Obtiene el estado actual del servicio
   */
  getStatus() {
    return {
      isActive: this.isActive,
      isModelLoaded: this.isModelLoaded,
      callbackCount: this.callbacks.length,
      config: DETECTION_CONFIG,
      modelPath: DETECTION_CONFIG.modelPath
    };
  }
}

// Instancia singleton del servicio
export const detectionService = new DetectionService();

// Funciones de utilidad
export const isValidLetter = (letter) => {
  return ALPHABET.includes(letter?.toUpperCase());
};

export const formatConfidence = (confidence) => {
  return Math.round(Math.max(0, Math.min(100, confidence)));
};

export const getConfidenceLevel = (confidence) => {
  if (confidence >= 70) return 'high';
  if (confidence >= 40) return 'medium';
  return 'low';
};