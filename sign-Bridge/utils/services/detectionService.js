// src/utils/services/detectionService.js
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Asset as ExpoAsset } from 'expo-asset';
import { TensorflowModel } from 'react-native-fast-tflite';

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
   * Carga el modelo TFLite nativo
   */
  async loadModel() {
    if (this.isModelLoaded) {
      console.log('⚠️ Modelo ya cargado');
      return;
    }

    try {
      this.modelLoadAttempts++;
      console.log(`🔄 Intentando cargar modelo TFLite (intento ${this.modelLoadAttempts})...`);
      
      // Cargar el asset del modelo
      const assetUri = ExpoAsset.fromModule(
        require('../../assets/Modelo/best_float16.tflite')
      );
      
      // Descargar/copiar el asset si es necesario
      await assetUri.downloadAsync();
      const modelUri = assetUri.localUri || assetUri.uri;
      
      console.log(`📦 Asset del modelo localizado en: ${modelUri}`);
      
      // Verificar que existe
      const info = await FileSystem.getInfoAsync(modelUri);
      if (!info.exists) {
        throw new Error('Archivo del modelo no encontrado');
      }
      
      const modelSize = info.size;
      console.log(`✅ Archivo del modelo existe (${(modelSize / 1024 / 1024).toFixed(2)} MB)`);
      
      // Cargar el modelo con react-native-fast-tflite
      console.log('🚀 Cargando modelo TFLite nativo...');
      this.model = await TensorflowModel.loadFromFile(modelUri);
      
      this.modelUri = modelUri;
      this.isModelLoaded = true;
      this.modelFileExists = true;
      
      // Obtener información del modelo
      const inputTensors = this.model.inputs;
      const outputTensors = this.model.outputs;
      
      console.log('✅ Modelo TFLite cargado exitosamente');
      console.log(`📊 Inputs: ${inputTensors.length} tensor(s)`);
      console.log(`📊 Outputs: ${outputTensors.length} tensor(s)`);
      
      if (inputTensors.length > 0) {
        const inputShape = inputTensors[0].shape;
        console.log(`📐 Input shape: [${inputShape.join(', ')}]`);
      }
      
    } catch (error) {
      console.error('❌ Error al cargar modelo:', error.message);
      this.isModelLoaded = false;
      this.modelFileExists = false;
      console.log('⚠️ Usando modo simulación como fallback');
      
      // Reintentar cargar modelo cada 10 segundos
      this.scheduleModelRetry();
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
      // Preparar la imagen para el modelo
      // YOLO espera input: [1, 640, 640, 3] normalizado 0-1
      const preparedImage = await this.prepareImageForModel(imageData);
      
      if (!preparedImage) {
        console.error('❌ No se pudo preparar la imagen');
        return null;
      }
      
      // Ejecutar inferencia
      const startTime = Date.now();
      const outputs = this.model.run([preparedImage]);
      const inferenceTime = Date.now() - startTime;
      
      console.log(`⚡ Inferencia completada en ${inferenceTime}ms`);
      
      // Procesar las salidas del modelo
      // Output típico de YOLO: [1, 8400, 38] donde 38 = [x, y, w, h, conf, ...clases]
      if (outputs && outputs.length > 0) {
        const detections = this.parseYOLOOutput(outputs[0]);
        return this.processPredictions(detections);
      }
      
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
   * Procesa las predicciones del modelo YOLO
   * @param {Array} detections - Array de detecciones del modelo
   * @returns {Object|null} Resultado procesado
   */
  async processPredictions(detections) {
    if (!detections || detections.length === 0) {
      return null;
    }

    // La primera detección ya es la de mayor confianza (ordenada en parseYOLOOutput)
    const detection = detections[0];
    
    if (detection.confidence >= DETECTION_CONFIG.minConfidence) {
      const bestDetection = {
        letter: detection.className,
        confidence: Math.round(detection.confidence * 100),
        bbox: detection.bbox,
        timestamp: Date.now()
      };
      
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