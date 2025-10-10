// utils/services/fastTfliteService.js
// Wrapper para react-native-fast-tflite

import { Platform } from 'react-native';
let fastTflite;
try {
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    fastTflite = require('react-native-fast-tflite');
  }
} catch (e) {
  fastTflite = null;
}

class FastTFLiteService {
  constructor() {
    this.model = null;
    this.isLoaded = false;
    this.modelPath = null;
  }

  isAvailable() {
    return !!fastTflite && (Platform.OS === 'android' || Platform.OS === 'ios');
  }

  async loadModel({ modelPath = 'models/best_float32.tflite' } = {}) {
    if (!this.isAvailable()) {
      this.isLoaded = false;
      return false;
    }
    if (this.isLoaded && this.modelPath === modelPath) return true;

    const { TFLiteModel } = fastTflite;
    if (!TFLiteModel) {
      throw new Error('fast-tflite no expone TFLiteModel');
    }
    // Carga desde bundle: el path debe existir en recursos nativos
    this.model = await TFLiteModel.createFromFile(modelPath);
    this.modelPath = modelPath;
    this.isLoaded = true;
    console.log('[FastTFLiteService] Modelo cargado:', modelPath);
    return true;
  }

  // predictFromImageUri debe:
  // 1) convertir la imagen a tensor del tamaño que espera el modelo (p.ej., 320x320x3, float32)
  // 2) invocar this.model.run(input)
  // 3) post-procesar (YOLO NMS, etc.) y devolver el mejor label/confianza
  // Por ahora dejamos un placeholder que retorna null (estructura lista para completar)
  async predictFromImageUri(uri, opts = {}) {
    if (!this.isLoaded || !this.model) throw new Error('[FastTFLiteService] Modelo no cargado');
    if (!uri) throw new Error('[FastTFLiteService] URI requerido');
    // TODO: implementar preprocesamiento + post-procesamiento
    return null;
  }
}

export const fastTfliteService = new FastTFLiteService();
