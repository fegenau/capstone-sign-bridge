// src/utils/services/detectionService.js
import { Platform, NativeModules } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

// Import TFLite module (will be used when model is available)
let TFLite = null;
try {
  TFLite = require('react-native-tflite').default;
} catch (error) {
  console.warn('⚠️ TFLite module not available, using simulation mode');
}

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
  // Ruta relativa del modelo en assets
  modelRelativePath: 'Modelo/best_float16.tflite',
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
    this.modelUri = null;
    this.isModelLoaded = false;
    this.modelFileExists = false;
    this.isTfReady = false;
    this.modelLoadAttempts = 0;
    this.lastDetectedSymbol = null;
    this.lastDetectionTime = 0;
    
    // Intentar inicializar sistema y cargar modelo
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
   * Implementa carga real del modelo YOLO TFLite para detección de lenguaje de señas
   */
  async loadModel() {
    if (this.isModelLoaded) {
      console.log('⚠️ Modelo ya cargado');
      return;
    }

    try {
      this.modelLoadAttempts++;
      console.log(`🔄 Intentando cargar modelo (intento ${this.modelLoadAttempts})...`);

      // Verificar si TFLite está disponible
      if (!TFLite) {
        throw new Error('Módulo TFLite no disponible - requiere rebuild nativo');
      }

      // Intentar cargar el modelo desde assets
      try {
        // Cargar asset del modelo
        const modelAsset = Asset.fromModule(
          require('../../assets/Modelo/runs/detect/train/weights/best_float16.tflite')
        );

        await modelAsset.downloadAsync();
        const modelUri = modelAsset.localUri || modelAsset.uri;

        console.log(`📦 Modelo localizado en: ${modelUri}`);

        // Verificar que sea un archivo TFLite válido (al menos 1KB)
        const fileInfo = await FileSystem.getInfoAsync(modelUri);
        if (!fileInfo.exists || fileInfo.size < 1024) {
          throw new Error('Archivo del modelo es inválido o es un placeholder');
        }

        // Inicializar TFLite con el modelo
        await TFLite.loadModel({
          model: modelUri,
          numThreads: 4, // Usar 4 threads para mejor performance
        });

        this.model = TFLite;
        this.isModelLoaded = true;
        console.log('✅ Modelo TFLite cargado exitosamente');

        // Detener reintentos
        if (this.modelRetryTimer) {
          clearTimeout(this.modelRetryTimer);
          this.modelRetryTimer = null;
        }

        return;
      } catch (assetError) {
        console.log('⚠️ No se pudo cargar modelo desde assets:', assetError.message);
        throw new Error('Archivo del modelo no encontrado en assets');
      }

    } catch (error) {
      console.error('❌ Error al cargar modelo:', error.message);
      this.isModelLoaded = false;
      console.log('⚠️ Usando modo simulación como fallback');

      // Programar reintento solo si es un error temporal
      if (!error.message.includes('no disponible')) {
        this.scheduleModelRetry();
      }
    }
  }

  /**
   * Verifica si el archivo del modelo existe (método legacy)
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
   * @param {Object} imageData - Datos de la imagen de la cámara (URI o base64)
   * @returns {Promise<Object|null>} Resultado de detección
   */
  async processImageWithModel(imageData) {
    if (!this.isModelLoaded || !this.model) {
      return null;
    }

    try {
      // Ejecutar inferencia con TFLite
      const results = await this.model.runModelOnImage({
        path: imageData.uri || imageData,
        imageMean: 0.0, // Normalización YOLO
        imageStd: 255.0,
        numResults: 5, // Top 5 detecciones
        threshold: DETECTION_CONFIG.minConfidence, // Confianza mínima 70%
      });

      console.log(`🔍 Detecciones recibidas: ${results?.length || 0}`);

      // Procesar resultados del modelo
      return this.processPredictions(results);
      
      return null;
    } catch (error) {
      console.error('❌ Error al procesar imagen con modelo:', error);
      return null;
    }
  }

  /**
   * Prepara la imagen para el modelo YOLO
   * @param {string} imageUri - URI de la imagen
   * @returns {Promise<Float32Array>} Tensor de imagen preparado
   */
  async prepareImageForModel(imageUri) {
    try {
      // NOTA: El preprocessing completo se implementará con frame processors nativos
      // después de compilar con expo prebuild + expo run:android
      // 
      // Por ahora, retornamos null para usar el modo simulación.
      // Esto cambiará cuando agreguemos react-native-vision-camera v4
      // con worklets para procesamiento en tiempo real.
      //
      // Preprocessing requerido:
      // 1. Leer imagen desde URI
      // 2. Redimensionar a 640x640
      // 3. Normalizar píxeles (0-255 -> 0-1)
      // 4. Convertir a Float32Array [1, 640, 640, 3]
      
      console.log('⚠️ Preprocessing será implementado con frame processors nativos');
      console.log('   Compila la app con: npx expo run:android');
      return null;
    } catch (error) {
      console.error('❌ Error al preparar imagen:', error);
      return null;
    }
  }

  /**
   * Parsea la salida raw del modelo YOLO
   * @param {Float32Array} output - Salida del modelo
   * @returns {Array} Array de detecciones
   */
  parseYOLOOutput(output) {
    const detections = [];
    
    try {
      // Output shape típico: [1, 8400, 38]
      // Donde 38 = [x, y, w, h, conf, ...clases(33)]
      
      const numDetections = 8400; // Anchors de YOLO
      const numClasses = 33; // A-Z (26) + 0-9 (10) = 36, pero puede tener más
      const boxSize = 4; // x, y, w, h
      
      for (let i = 0; i < numDetections; i++) {
        const offset = i * (boxSize + 1 + numClasses);
        
        // Extraer confianza
        const confidence = output[offset + 4];
        
        if (confidence >= DETECTION_CONFIG.minConfidence) {
          // Extraer coordenadas de la caja
          const x = output[offset];
          const y = output[offset + 1];
          const w = output[offset + 2];
          const h = output[offset + 3];
          
          // Encontrar la clase con mayor probabilidad
          let maxClassProb = 0;
          let classId = 0;
          
          for (let c = 0; c < numClasses; c++) {
            const classProb = output[offset + 5 + c];
            if (classProb > maxClassProb) {
              maxClassProb = classProb;
              classId = c;
            }
          }
          
          detections.push({
            bbox: { x, y, w, h },
            confidence: confidence * maxClassProb,
            classId,
            className: this.getClassNameFromId(classId)
          });
        }
      }
      
      // Ordenar por confianza descendente
      detections.sort((a, b) => b.confidence - a.confidence);
      
    } catch (error) {
      console.error('❌ Error al parsear salida YOLO:', error);
    }
    
    return detections;
  }

  /**
   * Obtiene el nombre de la clase desde el ID
   * @param {number} classId - ID de la clase
   * @returns {string} Nombre de la clase
   */
  getClassNameFromId(classId) {
    const allSymbols = [...ALPHABET, ...NUMBERS];
    return allSymbols[classId] || '?';
  }

  /**
   * Procesa las predicciones del modelo YOLO/TFLite
   * @param {Array} predictions - Array de predicciones del modelo
   * @returns {Object|null} Resultado procesado
   */
  async processPredictions(predictions) {
    if (!predictions || !Array.isArray(predictions) || predictions.length === 0) {
      return null;
    }

    // Buscar la detección con mayor confianza
    let bestDetection = null;
    let maxConfidence = 0;

    // Buscar la detección con mayor confianza
    for (const detection of predictions) {
      // TFLite puede retornar diferentes formatos
      // Formato 1: { confidence, label, index }
      // Formato 2: { confidence, className, classId }
      const confidence = detection.confidence || 0;
      const classLabel = detection.label || detection.className || '';
      const classIndex = detection.index !== undefined ? detection.index : detection.classId;

      if (confidence > maxConfidence && confidence >= DETECTION_CONFIG.minConfidence) {
        maxConfidence = confidence;

        // Obtener el símbolo detectado
        // Primero intentar usar el label/className directamente
        let detectedSymbol = classLabel;

        // Si no hay label, usar el índice para mapear al array de símbolos
        if (!detectedSymbol && classIndex !== undefined) {
          const allSymbols = [...ALPHABET, ...NUMBERS];
          detectedSymbol = allSymbols[classIndex] || '?';
        }

        bestDetection = {
          letter: detectedSymbol.toUpperCase(),
          confidence: Math.round(confidence * 100),
          timestamp: Date.now()
        };
      }
    }

    if (bestDetection) {
      // Aplicar debounce: evitar repetir el mismo símbolo muy rápido
      const now = Date.now();
      if (
        bestDetection.letter === this.lastDetectedSymbol &&
        (now - this.lastDetectionTime) < DETECTION_CONFIG.detectionInterval
      ) {
        return null; // Ignorar detección repetida
      }
      
      this.lastDetectedSymbol = bestDetection.letter;
      this.lastDetectionTime = now;
      
      return bestDetection;
    }

    return null;
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
      modelFileExists: this.modelFileExists,
      modelUri: this.modelUri,
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