// utils/services/detectionService.js
// Versión inicial: servicio de detección simulado listo para integrar un modelo real

// Alfabeto disponible para detección
const ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

// Configuración de detección
const DETECTION_CONFIG = {
  minConfidence: 30,      // Confianza mínima para mostrar resultado
  maxConfidence: 95,      // Confianza máxima realista
  // Ruta del modelo (.tflite) en assets (referencia futura; no se carga en esta versión)
  modelPath: 'assets/Modelo/runs/detect/train/weights/best_saved_model/best_float32.tflite',
  inputSize: 224,         // Tamaño de entrada esperado por el modelo (para futura integración)
  detectionInterval: 1500 // Intervalo entre detecciones en ms (simulación)
};

/**
 * Servicio principal de detección (primera versión con simulación)
 * API pública usada por AlphabetDetectionScreen:
 * - onDetection(cb), offDetection(cb)
 * - startDetection(), stopDetection(), forceDetection(imageData?)
 * - getStatus()
 */
import { Platform } from 'react-native';
import { fastTfliteService } from './fastTfliteService';
import { tfliteNativeService } from './tfliteNativeService';

export class DetectionService {
  constructor() {
    this.isActive = true;
    this.callbacks = [];
    this.model = null;
    this.isModelLoaded = false;
    this._timer = null;
    this._lastLetter = null;
  }

  // Registro de callbacks
  onDetection(callback) {
    if (typeof callback === 'function') {
      this.callbacks.push(callback);
    }
  }

  offDetection(callback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  notifyCallbacks(result) {
    this.callbacks.forEach(cb => {
      try { cb(result); } catch (e) { console.error('Error en callback de detección:', e); }
    });
  }

  // Carga del modelo (placeholder .tflite)
  async loadModel() {
    if (this.isModelLoaded) return;

    // Intentar cargar fast-tflite en iOS/Android; luego react-native-tflite; luego simulación
    let loadedNative = false;
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      try {
        const modelPath = 'models/best_float32.tflite';
        // 1) fast-tflite
        try {
          const loadedFast = await fastTfliteService.loadModel({ modelPath });
          if (loadedFast) {
            this.model = { type: 'fast-tflite', path: modelPath };
            this.isModelLoaded = true;
            console.log('⚡ fast-tflite cargado');
            loadedNative = true;
          }
        } catch {}
        // 2) react-native-tflite
        if (!loadedNative) {
          const loadedOld = await tfliteNativeService.loadModel({ modelPath });
          if (loadedOld) {
            this.model = { type: 'tflite-native', path: modelPath };
            this.isModelLoaded = true;
            console.log('🤖 TFLite nativo (legacy) cargado');
            loadedNative = true;
          }
        }
      } catch (e) {
        console.warn('No se pudo cargar TFLite nativo, se usará simulación. Detalle:', e?.message || e);
      }
    }

    // Fallback simulación
    if (!loadedNative) {
      this.model = {
        type: 'tflite-placeholder',
        path: DETECTION_CONFIG.modelPath
      };
      this.isModelLoaded = true;
      console.log('🧠 Modo simulación: modelo placeholder listo en', DETECTION_CONFIG.modelPath);
    }

    this.notifyCallbacks({ modelLoaded: true, isProcessing: false });
  }

  // Simulación de predicción
  async _simulatePrediction() {
    // Evitar repetir la misma letra 2 veces seguidas si es posible
    let idx = Math.floor(Math.random() * ALPHABET.length);
    if (this._lastLetter && ALPHABET[idx] === this._lastLetter) {
      idx = (idx + 1) % ALPHABET.length;
    }

    const confidence = Math.round(70 + Math.random() * 30); // 70–100
    const result = {
      letter: ALPHABET[idx],
      confidence,
      timestamp: Date.now(),
      source: 'cnn-model-simulation',
      isSimulation: true
    };
    this._lastLetter = result.letter;
    return result;
  }

  // Predicción (si hay modelo real, aquí se integrará)
  async predictLetter(imageData) {
    if (!this.isModelLoaded) throw new Error('Modelo no está cargado');

    // fast-tflite
    if (this.model?.type === 'fast-tflite') {
      if (!imageData?.uri) return null;
      // Aún no implementado el pipeline de preprocesamiento/postprocesado
      // Mantener retorno null para no romper UI hasta que se implemente
      const res = await fastTfliteService.predictFromImageUri(imageData.uri, { threshold: 0.5 });
      if (!res) return null;
      const letter = String(res.label || '').toUpperCase();
      const result = {
        letter,
        confidence: res.confidence,
        timestamp: Date.now(),
        source: 'fast-tflite',
        isSimulation: false,
      };
      this.notifyCallbacks({ isProcessing: false, ...result });
      return result;
    }

    // TFLite nativo (react-native-tflite)
    if (this.model?.type === 'tflite-native') {
      // Requiere una imagen (uri) desde la cámara o un snapshot
      if (!imageData?.uri) {
        // Sin imagen: no emitir nada
        return null;
      }
      const res = await tfliteNativeService.predictFromImageUri(imageData.uri, { threshold: 0.5 });
      if (!res) return null;
      const letter = String(res.label || '').toUpperCase();
      const result = {
        letter,
        confidence: res.confidence,
        timestamp: Date.now(),
        source: 'tflite-native',
        isSimulation: false,
      };
      this.notifyCallbacks({ isProcessing: false, ...result });
      return result;
    }

    // Placeholder .tflite: usar simulación
    if (this.model?.type === 'tflite-placeholder') {
      // simulamos un pequeño tiempo de procesamiento
      await new Promise(r => setTimeout(r, 300));
      const result = await this._simulatePrediction();
      this.notifyCallbacks({ isProcessing: false, ...result });
      return result;
    }

    // Implementación real se agregará en siguientes iteraciones
    throw new Error('Predicción real no implementada en esta versión');
  }

  // Loop de detección automática (simulación)
  _startAutoLoop() {
    this._stopAutoLoop();
    this._timer = setInterval(async () => {
      if (!this.isActive) return;
      try {
        await this.predictLetter(null);
      } catch (e) {
        console.error('Error en loop de detección:', e);
      }
    }, DETECTION_CONFIG.detectionInterval);
  }

  _stopAutoLoop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  // Inicio/fin del servicio
  async startDetection() {
    if (this.isActive) {
      console.warn('DetectionService ya está activo');
      return;
    }
    this.isActive = true;
    this.notifyCallbacks({ isProcessing: false, isLive: true, modelReady: this.isModelLoaded });

    await this.loadModel();
    this.notifyCallbacks({ isProcessing: false, isLive: true, modelReady: this.isModelLoaded });

    // Iniciar loop de simulación
    this._startAutoLoop();
  }

  stopDetection() {
    if (!this.isActive) {
      console.warn('DetectionService no está activo');
      return;
    }
    this.isActive = false;
    this._stopAutoLoop();
    this.notifyCallbacks({
      isProcessing: false,
      letter: null,
      confidence: 0,
      isStopped: true
    });
  }

  // Forzar una detección manual (por ejemplo, desde una imagen)
  async forceDetection(imageData) {
    if (!this.isActive) {
      console.warn('DetectionService no está activo');
      return null;
    }
    if (!this.isModelLoaded) {
      this.notifyCallbacks({ error: 'Modelo no está cargado' });
      return null;
    }
    try {
      const result = await this.predictLetter(imageData);
      return result;
    } catch (e) {
      console.error('Error en detección forzada:', e);
      return null;
    }
  }

  // Estado
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

// Utilidades
export const isValidLetter = (letter) => ALPHABET.includes(letter?.toUpperCase());
export const formatConfidence = (confidence) => Math.round(Math.max(0, Math.min(100, confidence)));
export const getConfidenceLevel = (confidence) => {
  if (confidence >= 70) return 'high';
  if (confidence >= 40) return 'medium';
  return 'low';
};
