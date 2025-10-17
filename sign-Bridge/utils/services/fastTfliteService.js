// utils/services/fastTfliteService.js
// Stub sin dependencias nativas para no bloquear el arranque del proyecto.

class FastTFLiteService {
  constructor() {
    this.model = null;
    this.isLoaded = false;
    this.modelPath = null;
  }

  // Siempre no disponible mientras la lib nativa no esté presente
  isAvailable() {
    return false;
  }

  async loadModel() {
    // Indicar que no puede cargar el modelo (forzar fallback en detectionService)
    this.isLoaded = false;
    return false;
  }

  async predictFromImageUri() {
    // No hace inferencia en el stub
    return null;
  }
}

export const fastTfliteService = new FastTFLiteService();
