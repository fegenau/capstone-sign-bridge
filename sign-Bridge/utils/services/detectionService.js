// src/utils/services/detectionService.js
import { Platform, NativeModules } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Alfabeto y números disponibles para detección
const ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

// Configuración de detección
const DETECTION_CONFIG = {
  minConfidence: 0.7,      // Confianza mínima (70%)
  maxConfidence: 95,       // Confianza máxima realista para simulación
  processingTime: 800,     // Tiempo de procesamiento en ms
  detectionInterval: 1500, // Intervalo entre detecciones (1.5s debounce)
  modelRetryInterval: 10000, // Reintentar cargar modelo cada 10 segundos
  modelPath: 'Modelo/runs/detect/train/weights/best_float16.tflite',
};

/**
 * Genera una detección aleatoria para testing (fallback cuando el modelo no está disponible)
 * @returns {Object} { letter: string, confidence: number }
 */
export const generateRandomDetection = () => {
  // Combinar alfabeto y números
  const allSymbols = [...ALPHABET, ...NUMBERS];
  const randomSymbol = allSymbols[Math.floor(Math.random() * allSymbols.length)];
  const randomConfidence = Math.floor(
    Math.random() * (DETECTION_CONFIG.maxConfidence - 30) + 30
  );
  
  return {
    letter: randomSymbol,
    confidence: randomConfidence
  };
};

/**
 * Simula el procesamiento de detección con delay (fallback)
 * @returns {Promise<Object>} Resultado de detección
 */
export const simulateDetection = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 70% probabilidad de detectar algo, 30% sin detección
      const hasDetection = Math.random() > 0.3;
      
      if (hasDetection) {
        resolve(generateRandomDetection());
      } else {
        resolve(null); // Sin detección
      }
    }, DETECTION_CONFIG.processingTime);
  });
};

/**
 * Servicio principal de detección con soporte para TFLite
 */
export class DetectionService {
  constructor() {
    this.isActive = false;
    this.detectionTimer = null;
    this.modelRetryTimer = null;
    this.callbacks = [];
    this.model = null;
    this.isModelLoaded = false;
    this.isTfReady = false;
    this.modelLoadAttempts = 0;
    this.lastDetectedSymbol = null;
    this.lastDetectionTime = 0;
    
    // Intentar inicializar TensorFlow y cargar modelo
    this.initializeTensorFlow();
  }

  /**
   * Inicializa el sistema de detección y carga el modelo
   */
  async initializeTensorFlow() {
    try {
      console.log('🔧 Inicializando sistema de detección...');
      
      // Marcar como listo (para que no bloquee el inicio)
      this.isTfReady = true;
      
      // Intentar cargar el modelo
      await this.loadModel();
    } catch (error) {
      console.error('❌ Error al inicializar sistema:', error);
      this.scheduleModelRetry();
    }
  }

  /**
   * Carga el modelo TFLite
   * Nota: Requiere implementación nativa o TensorFlow.js compatible
   */
  async loadModel() {
    if (this.isModelLoaded) {
      console.log('⚠️ Modelo ya cargado');
      return;
    }

    try {
      this.modelLoadAttempts++;
      console.log(`🔄 Intentando cargar modelo (intento ${this.modelLoadAttempts})...`);
      
      // Verificar si el archivo del modelo existe
      const modelUri = `${FileSystem.documentDirectory}${DETECTION_CONFIG.modelPath}`;
      const modelExists = await this.checkModelExists(modelUri);
      
      if (!modelExists) {
        throw new Error('Archivo del modelo no encontrado');
      }
      
      // TODO: Implementar carga del modelo TFLite
      // Opciones:
      // 1. Usar TensorFlow Lite React Native (requiere módulo nativo)
      // 2. Usar ML Kit de Google (Android/iOS)
      // 3. Usar ONNX Runtime para React Native
      
      // Por ahora, simular que el modelo no se puede cargar
      throw new Error('Módulo TFLite no implementado - usando simulación');
      
      // Cuando se implemente:
      // this.model = await loadTFLiteModel(modelUri);
      // this.isModelLoaded = true;
      // console.log('✅ Modelo TFLite cargado exitosamente');
      
    } catch (error) {
      console.error('❌ Error al cargar modelo:', error.message);
      this.isModelLoaded = false;
      console.log('⚠️ Usando modo simulación como fallback');
      
      // Programar reintento
      this.scheduleModelRetry();
    }
  }

  /**
   * Verifica si el archivo del modelo existe
   */
  async checkModelExists(uri) {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      return info.exists;
    } catch (error) {
      console.log('⚠️ No se pudo verificar modelo, probablemente no existe aún');
      return false;
    }
  }

  /**
   * Programa un reintento de carga del modelo
   */
  scheduleModelRetry() {
    if (this.modelRetryTimer) {
      return; // Ya hay un reintento programado
    }

    console.log(`⏰ Se reintentará cargar el modelo en ${DETECTION_CONFIG.modelRetryInterval / 1000} segundos...`);
    
    this.modelRetryTimer = setTimeout(() => {
      this.modelRetryTimer = null;
      if (!this.isModelLoaded && this.isTfReady) {
        this.loadModel();
      }
    }, DETECTION_CONFIG.modelRetryInterval);
  }

  /**
   * Procesa una imagen con el modelo TFLite
   * @param {Object} imageData - Datos de la imagen de la cámara
   * @returns {Promise<Object|null>} Resultado de detección
   */
  async processImageWithModel(imageData) {
    if (!this.isModelLoaded || !this.model) {
      return null;
    }

    try {
      // TODO: Implementar procesamiento real con TFLite
      // Cuando se agregue el módulo nativo:
      // 
      // const result = await TFLiteModule.detectSignLanguage(imageData, {
      //   confidenceThreshold: DETECTION_CONFIG.minConfidence,
      //   maxDetections: 1
      // });
      //
      // return this.processPredictions(result);
      
      // Por ahora retornar null para usar fallback
      return null;
    } catch (error) {
      console.error('❌ Error al procesar imagen con modelo:', error);
      return null;
    }
  }

  /**
   * Procesa las predicciones del modelo YOLO
   * @param {Object} predictions - Predicciones del modelo
   * @returns {Object|null} Resultado procesado
   */
  async processPredictions(predictions) {
    if (!predictions || !predictions.detections || predictions.detections.length === 0) {
      return null;
    }

    let bestDetection = null;
    let maxConfidence = 0;

    // Buscar la detección con mayor confianza
    for (const detection of predictions.detections) {
      const confidence = detection.confidence;
      
      if (confidence > maxConfidence && confidence >= DETECTION_CONFIG.minConfidence) {
        maxConfidence = confidence;
        
        // Obtener el símbolo detectado
        const classIndex = detection.classId;
        const allSymbols = [...ALPHABET, ...NUMBERS];
        const detectedSymbol = allSymbols[classIndex] || detection.className || '?';
        
        bestDetection = {
          letter: detectedSymbol,
          confidence: Math.round(confidence * 100),
          timestamp: Date.now()
        };
      }
    }

    // Aplicar debounce: evitar repetir el mismo símbolo muy rápido
    if (bestDetection) {
      const now = Date.now();
      if (
        bestDetection.letter === this.lastDetectedSymbol &&
        (now - this.lastDetectionTime) < DETECTION_CONFIG.detectionInterval
      ) {
        return null; // Ignorar detección repetida
      }
      
      this.lastDetectedSymbol = bestDetection.letter;
      this.lastDetectionTime = now;
    }

    return bestDetection;
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
   * Inicia la detección automática
   * @param {Object} cameraRef - Referencia a la cámara (opcional)
   */
  async startDetection(cameraRef = null) {
    if (this.isActive) {
      console.warn('DetectionService ya está activo');
      return;
    }

    this.isActive = true;
    this.cameraRef = cameraRef;
    console.log('🎯 DetectionService iniciado');
    console.log(`📊 Modo: ${this.isModelLoaded ? 'Modelo TFLite' : 'Simulación (fallback)'}`);

    // Bucle de detección
    const detectLoop = async () => {
      if (!this.isActive) return;

      try {
        // Notificar que está procesando
        this.notifyCallbacks({ isProcessing: true });

        let result = null;

        // Intentar usar el modelo si está cargado
        if (this.isModelLoaded && this.cameraRef) {
          try {
            // Capturar frame de la cámara
            const imageData = await this.captureFrame();
            if (imageData) {
              result = await this.processImageWithModel(imageData);
            }
          } catch (modelError) {
            console.error('❌ Error usando modelo, fallback a simulación:', modelError);
            this.isModelLoaded = false;
            this.scheduleModelRetry();
          }
        }

        // Si el modelo no está disponible o no detectó nada, usar simulación
        if (!result && !this.isModelLoaded) {
          result = await simulateDetection();
        }

        // Notificar resultado
        if (result) {
          this.notifyCallbacks({
            isProcessing: false,
            letter: result.letter,
            confidence: result.confidence,
            timestamp: Date.now(),
            isSimulated: !this.isModelLoaded
          });
        } else {
          this.notifyCallbacks({
            isProcessing: false,
            letter: null,
            confidence: 0,
            timestamp: Date.now()
          });
        }

      } catch (error) {
        console.error('Error en detección:', error);
        this.notifyCallbacks({
          isProcessing: false,
          error: 'Error en detección',
          timestamp: Date.now()
        });
      }

      // Programar siguiente detección
      if (this.isActive) {
        this.detectionTimer = setTimeout(detectLoop, DETECTION_CONFIG.detectionInterval);
      }
    };

    // Iniciar primer ciclo
    detectLoop();
  }

  /**
   * Captura un frame de la cámara
   * @returns {Promise<Object|null>} Datos de la imagen
   */
  async captureFrame() {
    if (!this.cameraRef || !this.cameraRef.current) {
      return null;
    }

    try {
      // Capturar foto de la cámara
      const photo = await this.cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: false,
        skipProcessing: true,
      });
      
      return photo.uri;
    } catch (error) {
      console.error('Error al capturar frame:', error);
      return null;
    }
  }

  /**
   * Detiene la detección automática
   */
  stopDetection() {
    if (!this.isActive) {
      console.warn('DetectionService no está activo');
      return;
    }

    this.isActive = false;
    this.cameraRef = null;
    
    if (this.detectionTimer) {
      clearTimeout(this.detectionTimer);
      this.detectionTimer = null;
    }

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
   * Limpia recursos (modelo y timers)
   */
  cleanup() {
    this.stopDetection();
    
    if (this.modelRetryTimer) {
      clearTimeout(this.modelRetryTimer);
      this.modelRetryTimer = null;
    }
    
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isModelLoaded = false;
    }
    
    console.log('🧹 DetectionService limpiado');
  }

  /**
   * Fuerza una detección manual
   */
  async forceDetection() {
    if (!this.isActive) {
      console.warn('DetectionService no está activo');
      return;
    }

    console.log('🔄 Forzando detección manual');
    
    // Notificar procesamiento
    this.notifyCallbacks({ isProcessing: true });

    try {
      let result = null;

      // Intentar usar el modelo si está cargado
      if (this.isModelLoaded && this.cameraRef) {
        try {
          const imageData = await this.captureFrame();
          if (imageData) {
            result = await this.processImageWithModel(imageData);
          }
        } catch (modelError) {
          console.error('❌ Error usando modelo en detección manual:', modelError);
        }
      }

      // Fallback a simulación si el modelo no está disponible
      if (!result && !this.isModelLoaded) {
        result = await simulateDetection();
      }
      
      if (result) {
        this.notifyCallbacks({
          isProcessing: false,
          letter: result.letter,
          confidence: result.confidence,
          timestamp: Date.now(),
          isManual: true,
          isSimulated: !this.isModelLoaded
        });
      } else {
        this.notifyCallbacks({
          isProcessing: false,
          letter: null,
          confidence: 0,
          timestamp: Date.now(),
          isManual: true
        });
      }
    } catch (error) {
      console.error('Error en detección manual:', error);
      this.notifyCallbacks({
        isProcessing: false,
        error: 'Error en detección manual',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Obtiene el estado actual del servicio
   */
  getStatus() {
    return {
      isActive: this.isActive,
      isModelLoaded: this.isModelLoaded,
      isTfReady: this.isTfReady,
      modelLoadAttempts: this.modelLoadAttempts,
      callbackCount: this.callbacks.length,
      config: DETECTION_CONFIG
    };
  }

  /**
   * Fuerza reintentar cargar el modelo
   */
  async retryLoadModel() {
    console.log('🔄 Reintentando cargar modelo manualmente...');
    await this.loadModel();
  }
}

// Instancia singleton del servicio
export const detectionService = new DetectionService();

// Funciones de utilidad
export const isValidLetter = (letter) => {
  return ALPHABET.includes(letter?.toUpperCase());
};

export const isValidNumber = (number) => {
  return NUMBERS.includes(String(number));
};

export const isValidSymbol = (symbol) => {
  return isValidLetter(symbol) || isValidNumber(symbol);
};

export const formatConfidence = (confidence) => {
  return Math.round(Math.max(0, Math.min(100, confidence)));
};

export const getConfidenceLevel = (confidence) => {
  if (confidence >= 70) return 'high';
  if (confidence >= 40) return 'medium';
  return 'low';
};

export { ALPHABET, NUMBERS };