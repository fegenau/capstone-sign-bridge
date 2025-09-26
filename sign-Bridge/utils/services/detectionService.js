// src/utils/services/detectionService.js

// Alfabeto disponible para detección
const ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

// Configuración de detección
const DETECTION_CONFIG = {
  minConfidence: 30,      // Confianza mínima para mostrar resultado
  maxConfidence: 95,      // Confianza máxima realista
  processingTime: 800,    // Tiempo de procesamiento en ms (mock)
  detectionInterval: 2000, // Intervalo entre detecciones automáticas (mock)
};

// NUEVO: Backend de detección (mock o ws)
const DETECTION_BACKEND = {
  mode: 'ws', 
  wsUrl: 'ws://192.168.100.1:8765'
};

/**
 * Genera una detección aleatoria para testing
 * @returns {Object} { letter: string, confidence: number }
 */
export const generateRandomDetection = () => {
  const randomLetter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  const randomConfidence = Math.floor(
    Math.random() * (DETECTION_CONFIG.maxConfidence - DETECTION_CONFIG.minConfidence) + 
    DETECTION_CONFIG.minConfidence
  );
  
  return {
    letter: randomLetter,
    confidence: randomConfidence
  };
};

/**
 * Simula el procesamiento de detección con delay
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
 * Servicio principal de detección
 */
export class DetectionService {
  constructor() {
    this.isActive = false;
    this.detectionTimer = null;
    this.callbacks = [];
    // NUEVO
    this.mode = DETECTION_BACKEND.mode; // 'mock' | 'ws'
    this.ws = null;
  }

  // NUEVO: permite cambiar el modo en runtime
  setMode(mode) {
    if (!['mock', 'ws'].includes(mode)) {
      console.warn('Modo de detección inválido:', mode);
      return;
    }
    this.mode = mode;
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

  // NUEVO: conexión WebSocket con el servidor YOLO
  connectWs() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(DETECTION_BACKEND.wsUrl);

      this.ws.onopen = () => {
        console.log('🔌 Conectado a YOLO WS:', DETECTION_BACKEND.wsUrl);
        this.notifyCallbacks({ isProcessing: false, isLive: true, connected: true });
      };

      this.ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          // data esperado: { isProcessing, letter, confidence, timestamp, source }
          const letter = data?.letter ?? null;
          const confidence = Number.isFinite(data?.confidence) ? data.confidence : 0;

          this.notifyCallbacks({
            isProcessing: false,
            letter,
            confidence,
            timestamp: data?.timestamp || Date.now(),
            source: data?.source || 'yolo'
          });
        } catch (e) {
          console.error('Mensaje WS inválido:', e);
        }
      };

      this.ws.onerror = (err) => {
        console.error('Error en WS:', err);
        this.notifyCallbacks({ isProcessing: false, error: 'WS error' });
      };

      this.ws.onclose = () => {
        console.log('🔌 WS cerrado');
        if (this.isActive && this.mode === 'ws') {
          // Reintento simple
          setTimeout(() => this.connectWs(), 1500);
        }
        this.notifyCallbacks({ isProcessing: false, connected: false });
      };
    } catch (e) {
      console.error('No se pudo abrir WS:', e);
      this.notifyCallbacks({ isProcessing: false, error: 'No se pudo abrir WS' });
    }
  }

  /**
   * Inicia la detección automática
   */
  async startDetection() {
    if (this.isActive) {
      console.warn('DetectionService ya está activo');
      return;
    }

    this.isActive = true;
    console.log('🎯 DetectionService iniciado');

    if (this.mode === 'ws') {
      this.connectWs();
      // El servidor empuja resultados; aquí sólo indicamos estado
      this.notifyCallbacks({ isProcessing: false, isLive: true });
      return;
    }

    // Modo mock (loop local)
    const detectLoop = async () => {
      if (!this.isActive) return;

      try {
        // Notificar que está procesando
        this.notifyCallbacks({ isProcessing: true });

        // Simular detección
        const result = await simulateDetection();

        // Notificar resultado
        if (result) {
          this.notifyCallbacks({
            isProcessing: false,
            letter: result.letter,
            confidence: result.confidence,
            timestamp: Date.now()
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
   * Detiene la detección automática
   */
  stopDetection() {
    if (!this.isActive) {
      console.warn('DetectionService no está activo');
      return;
    }

    this.isActive = false;
    
    if (this.detectionTimer) {
      clearTimeout(this.detectionTimer);
      this.detectionTimer = null;
    }

    // Cerrar WS si aplica
    if (this.ws) {
      try { this.ws.close(); } catch (_) {}
      this.ws = null;
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
   * Fuerza una detección manual
   */
  async forceDetection() {
    if (!this.isActive) {
      console.warn('DetectionService no está activo');
      return;
    }

    if (this.mode === 'ws' && this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Mensaje opcional al servidor (si implementas "force")
      try {
        this.ws.send(JSON.stringify({ action: 'force' }));
      } catch (e) {
        console.warn('No se pudo enviar force:', e);
      }
      return;
    }

    // Modo mock
    console.log('🔄 Forzando detección manual (mock)');
    this.notifyCallbacks({ isProcessing: true });

    try {
      const result = await simulateDetection();
      
      if (result) {
        this.notifyCallbacks({
          isProcessing: false,
          letter: result.letter,
          confidence: result.confidence,
          timestamp: Date.now(),
          isManual: true
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
      callbackCount: this.callbacks.length,
      config: DETECTION_CONFIG,
      backend: { ...DETECTION_BACKEND, mode: this.mode },
      connected: !!this.ws && this.ws.readyState === WebSocket.OPEN
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