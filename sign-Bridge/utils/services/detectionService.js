export class DetectionService {
  constructor() {
    this.isActive = true;
    this.callbacks = [];
    this.isModelLoaded = false;
    this._timer = null;
  }

  onDetection(callback) {
    this.callbacks.push(callback);
  }

  offDetection(callback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  notifyCallbacks(data) {
    this.callbacks.forEach(cb => {
      try {
        cb(data);
      } catch (error) {
        console.error('Error en callback:', error);
      }
    });
  }

  async loadModel() {
    console.log('🧠 Modelo simulado cargado');
    this.isModelLoaded = true;
    this.notifyCallbacks({ modelLoaded: true, isProcessing: false });
  }

  // Simulación de predicción
  async _simulatePrediction() {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    const randomConfidence = Math.floor(Math.random() * 70) + 30; // 30-100%
    
    return {
      letter: randomLetter,
      confidence: randomConfidence,
      timestamp: Date.now(),
      source: 'simulation',
      isSimulation: true
    };
  }

  async startDetection() {
    this.isActive = true;
    await this.loadModel();
    this._startAutoLoop();
    this.notifyCallbacks({ isLive: true, modelReady: this.isModelLoaded });
  }

  stopDetection() {
    this.isActive = false;
    this._stopAutoLoop();
    this.notifyCallbacks({
      isProcessing: false,
      letter: null,
      confidence: 0,
      isStopped: true
    });
  }

  // Auto-loop para simulación continua
  _startAutoLoop() {
    this._stopAutoLoop();
    this._timer = setInterval(async () => {
      if (!this.isActive) return;
      try {
        const result = await this._simulatePrediction();
        this.notifyCallbacks({ isProcessing: false, ...result });
      } catch (e) {
        console.error('Error en loop de detección:', e);
      }
    }, 2000); // Cada 2 segundos
  }

  _stopAutoLoop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  // Método para detección forzada (usado por la pantalla)
  async forceDetection(imageData) {
    if (!this.isActive || !this.isModelLoaded) return null;
    
    try {
      this.notifyCallbacks({ isProcessing: true });
      await new Promise(r => setTimeout(r, 300)); // Simular procesamiento
      const result = await this._simulatePrediction();
      this.notifyCallbacks({ isProcessing: false, ...result });
      return result;
    } catch (e) {
      console.error('Error en detección forzada:', e);
      return null;
    }
  }

  getStatus() {
    return { 
      isActive: this.isActive, 
      isModelLoaded: this.isModelLoaded,
      callbackCount: this.callbacks.length
    };
  }
}

export const detectionService = new DetectionService();