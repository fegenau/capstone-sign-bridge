// utils/services/tfliteNativeService.js
// Wrapper mínimo sobre 'react-native-tflite' para cargar un modelo TFLite y
// ejecutar detección sobre una imagen (URI local)

import { Platform } from 'react-native';
let Tflite;
try {
  // Cargar librería nativa solo en plataformas soportadas
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
  Tflite = require('react-native-tflite');
  }
} catch (e) {
  // Ignorar en web o si la dependencia aún no está instalada
  Tflite = null;
}

class TFLiteNativeService {
  constructor() {
    this._tflite = null;
    this.isLoaded = false;
    this.modelPath = null;
    this.labelsPath = null;
  }

  async loadModel({ modelPath = 'models/best_float32.tflite', labelsPath = null } = {}) {
    if (!Tflite || (Platform.OS !== 'android' && Platform.OS !== 'ios')) {
      console.warn('[TFLiteNativeService] Librería nativa no disponible en esta plataforma');
      this.isLoaded = false;
      return false;
    }

    if (this.isLoaded && this.modelPath === modelPath && this.labelsPath === labelsPath) {
      return true;
    }

    // La librería puede exportar una clase (requiere new) o una instancia ya creada
    const candidate = Tflite?.default ?? Tflite?.Tflite ?? Tflite;
    let instance = null;
    // Caso 1: objeto ya instanciado con loadModel
    if (candidate && typeof candidate === 'object' && typeof candidate.loadModel === 'function') {
      instance = candidate;
    } else if (typeof candidate === 'function') {
      // Caso 2: clase/constructor — intentar instanciar
      try {
        const maybe = new candidate();
        if (maybe && typeof maybe.loadModel === 'function') {
          instance = maybe;
        }
      } catch (e) {
        // No instanciable; continuar a verificar si expone métodos estáticos
      }
    }
    // Caso 3: export puede ser objeto con métodos estáticos
    if (!instance && candidate && typeof candidate === 'object' && typeof candidate.detectObjectOnImage === 'function') {
      instance = candidate;
    }
    if (!instance) {
      throw new Error('react-native-tflite no expone constructor/instancia compatible');
    }

    this._tflite = instance;
    this.modelPath = modelPath;
    this.labelsPath = labelsPath;

    const loadParams = labelsPath
      ? { model: modelPath, labels: labelsPath }
      : { model: modelPath };

    await new Promise((resolve, reject) => {
      try {
        instance.loadModel(loadParams, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        });
      } catch (e) {
        reject(e);
      }
    });

    this.isLoaded = true;
    console.log('[TFLiteNativeService] Modelo cargado:', modelPath, labelsPath ? `(labels: ${labelsPath})` : '');
    return true;
  }

  // Ejecuta detección de objetos en una imagen usando el modelo cargado
  // Retorna el mejor resultado (clase con mayor confianza) o null
  async predictFromImageUri(uri, { threshold = 0.5, numResultsPerClass = 1 } = {}) {
    if (!this._tflite || !this.isLoaded) {
      throw new Error('[TFLiteNativeService] Modelo no cargado');
    }
    if (!uri) {
      throw new Error('[TFLiteNativeService] URI de imagen requerido');
    }

    // Algunas implementaciones exponen detectObjectOnImage (detección) y otras runModelOnImage (clasificación)
    const hasDetect = typeof this._tflite.detectObjectOnImage === 'function';
    const hasRun = typeof this._tflite.runModelOnImage === 'function';

    const results = await new Promise((resolve, reject) => {
      try {
        if (hasDetect) {
          this._tflite.detectObjectOnImage(
            { path: uri, threshold, numResultsPerClass },
            (err, res) => (err ? reject(err) : resolve(res || []))
          );
        } else if (hasRun) {
          this._tflite.runModelOnImage(
            { path: uri, threshold },
            (err, res) => (err ? reject(err) : resolve(res || []))
          );
        } else {
          reject(new Error('API TFLite no soportada (sin detectObjectOnImage ni runModelOnImage)'));
        }
      } catch (e) {
        reject(e);
      }
    });

    if (!results || results.length === 0) return null;

    // Normalizar y elegir mejor
    let best = null;
    for (const r of results) {
      // Dos formatos posibles:
      // Detección: { detectedClass, confidenceInClass }
      // Clasificación: { label, confidence }
      const label = (r?.detectedClass ?? r?.label ?? '').toString();
      const conf = r?.confidenceInClass ?? r?.confidence ?? 0;
      const norm = { label, conf: typeof conf === 'number' ? conf : Number(conf) || 0 };
      if (!best || norm.conf > best.conf) {
        best = norm;
      }
    }

    if (!best) return null;
    const label = String(best.label || '').trim();
    const confidence = Math.round(best.conf * (best.conf <= 1 ? 100 : 1));
    return {
      label,
      confidence,
      raw: results,
    };
  }
}

export const tfliteNativeService = new TFLiteNativeService();
