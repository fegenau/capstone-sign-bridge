/**
 * WordDetectionService.js - Optimizado para TensorFlow.js
 * 
 * Servicio de detección de palabras/señas usando TensorFlow.js
 * Implementa suavizado para LSCh (Lengua de Señas Chilena)
 */

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { Asset } from 'expo-asset';

export class WordDetectionService {
  constructor() {
    this.model = null;
    this.isLoaded = false;
    this.callbacks = [];
    this.isDetecting = false;
    this.labels = [];
    
    // Sistema de suavizado y validación
    this.smoothingBuffer = [];
    this.smoothingWindow = 5;
    this.confidenceThreshold = 0.50; // 50%
    this.votingThreshold = 0.60; // 60% de acuerdo en buffer
    
    // Configuración del modelo
    this.modelConfig = {
      sequenceLength: 24,
      keypointDimensions: 126, // 21 joints * 3 (x,y,z) * 2 manos
      inputShape: [1, 24, 126]
    };
    
    // Métricas de performance
    this.metrics = {
      totalInferences: 0,
      averageInferenceTime: 0,
      peakMemory: 0,
      detectionsMade: 0,
      lastInferenceTime: 0
    };
    
    this.debugMode = false;
  }

  /**
   * Registrar callback para eventos de detección
   */
  onDetection(callback) {
    if (typeof callback === 'function') {
      this.callbacks.push(callback);
    }
  }

  /**
   * Desregistrar callback
   */
  offDetection(callback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  /**
   * Notificar a todos los listeners
   */
  notifyCallbacks(data) {
    this.callbacks.forEach(cb => {
      try {
        cb(data);
      } catch (error) {
        console.error('[WordDetectionService] Error en callback:', error);
      }
    });
  }

  /**
   * Cargar etiquetas desde archivo JSON
   */
  async loadLabels() {
    try {
      this._log('📝 Cargando etiquetas...');
      
      // Cargar desde JSON
      const labelsAsset = Asset.fromModule(
        require('../../assets/model/labels.json')
      );
      await labelsAsset.downloadAsync();
      const response = await fetch(labelsAsset.uri);
      const data = await response.json();
      this.labels = data.classes || data;
      
      this._log(`✅ ${this.labels.length} etiquetas cargadas`);
      this._log(`   Primeras: ${this.labels.slice(0, 5).join(', ')}`);
      
      return true;
    } catch (error) {
      console.error('[WordDetectionService] Error cargando etiquetas:', error);
      this.notifyCallbacks({ 
        error: 'No se pudieron cargar las etiquetas',
        errorType: 'LABELS_LOAD_FAILED'
      });
      throw error;
    }
  }

  /**
   * Cargar modelo TensorFlow.js
   */
  async loadModel() {
    try {
      this._log('🧠 Inicializando TensorFlow.js...');
      
      // Esperar a que TF esté listo
      await tf.ready();
      const backend = tf.getBackend();
      this._log(`   Backend: ${backend}`);
      
      // Cargar etiquetas
      await this.loadLabels();
      
      // Cargar modelo JSON de TensorFlow.js
      this._log('📦 Cargando modelo desde assets...');
      
      const modelAsset = Asset.fromModule(
        require('../../assets/model/tfjs_model/model.json')
      );
      await modelAsset.downloadAsync();
      
      this.model = await tf.loadLayersModel(modelAsset.uri);
      this._log('✅ Modelo cargado exitosamente');
      
      // Validar arquitectura
      const inputShape = this.model.inputs[0].shape;
      this._log(`📐 Input shape: [${inputShape.join(', ')}]`);
      
      // Warm-up: una predicción dummy
      this._log('🔥 Warmup del modelo...');
      const dummyInput = tf.randomNormal(this.modelConfig.inputShape);
      const warmupPred = this.model.predict(dummyInput);
      dummyInput.dispose();
      warmupPred.dispose();
      
      this.isLoaded = true;
      this._log('✅ Modelo listo para inferencia');
      
      this.notifyCallbacks({ 
        modelReady: true,
        labelsCount: this.labels.length,
        backend: backend
      });
      
      return true;
    } catch (error) {
      console.error('[WordDetectionService] Error cargando modelo:', error);
      this.notifyCallbacks({ 
        modelError: error.message,
        errorType: 'MODEL_LOAD_FAILED'
      });
      throw error;
    }
  }

  /**
   * Detectar palabra desde secuencia de keypoints
   */
  async detectFromKeypoints(keypointsSequence) {
    if (!this.model || !this.isLoaded) {
      this._log('⚠️  Modelo no cargado');
      return null;
    }

    if (!this.isDetecting) {
      return null;
    }

    try {
      const startTime = performance.now();
      this.notifyCallbacks({ isProcessing: true });

      // VALIDAR ENTRADA
      if (!keypointsSequence || keypointsSequence.length === 0) {
        console.warn('[WordDetectionService] Secuencia vacía');
        return null;
      }

      // NORMALIZAR SECUENCIA
      let validSequence = Array.isArray(keypointsSequence) 
        ? keypointsSequence 
        : Array.from(keypointsSequence);

      // Padding si es necesario
      if (validSequence.length < this.modelConfig.sequenceLength) {
        const paddingSize = this.modelConfig.sequenceLength - validSequence.length;
        for (let i = 0; i < paddingSize; i++) {
          validSequence.push(new Float32Array(this.modelConfig.keypointDimensions));
        }
      } else if (validSequence.length > this.modelConfig.sequenceLength) {
        validSequence = validSequence.slice(0, this.modelConfig.sequenceLength);
      }

      // CREAR TENSOR Y PREDECIR
      const input = tf.tensor3d(
        [validSequence],
        this.modelConfig.inputShape
      );

      const predictions = this.model.predict(input);
      const confidences = await predictions.data();

      // ANALIZAR PREDICCIÓN
      const maxIdx = Array.from(confidences).indexOf(Math.max(...confidences));
      const rawConfidence = confidences[maxIdx];
      const confidence = Math.round(rawConfidence * 100);
      const word = this.labels[maxIdx] || 'DESCONOCIDO';

      // SUAVIZADO: Agregar al buffer
      this.smoothingBuffer.push({
        word,
        confidence,
        rawConfidence,
        timestamp: Date.now()
      });

      if (this.smoothingBuffer.length > this.smoothingWindow) {
        this.smoothingBuffer.shift();
      }

      // VOTACIÓN: Verificar consenso en el buffer
      const wordVotes = {};
      this.smoothingBuffer.forEach(item => {
        wordVotes[item.word] = (wordVotes[item.word] || 0) + 1;
      });

      const mostCommonWord = Object.keys(wordVotes).reduce((a, b) =>
        wordVotes[a] > wordVotes[b] ? a : b
      );

      const votePercentage = wordVotes[mostCommonWord] / this.smoothingBuffer.length;
      const isStable = votePercentage >= this.votingThreshold;
      const isConfident = confidence >= this.confidenceThreshold * 100;

      const inferenceTime = performance.now() - startTime;
      this._updateMetrics(inferenceTime, isStable && isConfident);

      // REPORTAR SI ES VÁLIDO
      if (isStable && isConfident) {
        const result = {
          word: mostCommonWord,
          confidence,
          isValid: true,
          isSmoothed: true,
          votePercentage: Math.round(votePercentage * 100),
          timestamp: Date.now(),
          source: 'tensorflow',
          inferenceTime: Math.round(inferenceTime)
        };

        this.notifyCallbacks({
          isProcessing: false,
          ...result
        });

        // Limpiar buffer después de detección exitosa
        this.smoothingBuffer = [];
      } else {
        this.notifyCallbacks({ 
          isProcessing: false,
          partial: {
            word,
            confidence,
            votePercentage: Math.round(votePercentage * 100),
            isStable,
            isConfident
          }
        });
      }

      // LIMPIAR MEMORIA
      tf.dispose([input, predictions]);

      return {
        word,
        confidence,
        isValid: isStable && isConfident,
        isSmoothed: true,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('[WordDetectionService] Error en detección:', error);
      this.notifyCallbacks({
        isProcessing: false,
        detectionError: error.message,
        errorType: 'INFERENCE_ERROR'
      });
      return null;
    }
  }

  /**
   * Iniciar detección en tiempo real
   */
  startDetection() {
    if (!this.isLoaded) {
      console.warn('[WordDetectionService] Modelo no está cargado');
      return false;
    }

    this.isDetecting = true;
    this.smoothingBuffer = [];
    
    this._log('🎬 Detección iniciada');
    this.notifyCallbacks({ detectionStarted: true });
    
    return true;
  }

  /**
   * Detener detección
   */
  stopDetection() {
    this.isDetecting = false;
    this.smoothingBuffer = [];
    
    this._log('⏹️  Detección detenida');
    this.notifyCallbacks({
      detectionStopped: true,
      word: null,
      confidence: 0,
      metrics: this.getMetrics()
    });
  }

  /**
   * Reset completo
   */
  async reset() {
    this.stopDetection();
    this.callbacks = [];
    this.smoothingBuffer = [];
    
    if (this.model) {
      try {
        tf.dispose(this.model);
      } catch (e) {
        // Ignore
      }
    }
    
    this.model = null;
    this.isLoaded = false;
    this._log('🔄 Servicio reseteado');
  }

  /**
   * Obtener estado del servicio
   */
  getStatus() {
    return {
      isLoaded: this.isLoaded,
      isDetecting: this.isDetecting,
      labelsCount: this.labels.length,
      bufferSize: this.smoothingBuffer.length,
      backend: tf.getBackend(),
      memory: tf.memory(),
      metrics: this.getMetrics()
    };
  }

  /**
   * Obtener métricas de performance
   */
  getMetrics() {
    return {
      totalInferences: this.metrics.totalInferences,
      detectionsMade: this.metrics.detectionsMade,
      averageInferenceTime: Math.round(this.metrics.averageInferenceTime),
      lastInferenceTime: this.metrics.lastInferenceTime,
      peakMemory: Math.round(this.metrics.peakMemory / 1024 / 1024), // MB
      successRate: this.metrics.totalInferences > 0 
        ? Math.round((this.metrics.detectionsMade / this.metrics.totalInferences) * 100)
        : 0
    };
  }

  /**
   * Obtener lista de etiquetas
   */
  getLabels() {
    return [...this.labels];
  }

  /**
   * Configurar umbral de confianza
   */
  setConfidenceThreshold(threshold) {
    if (threshold >= 0 && threshold <= 1) {
      this.confidenceThreshold = threshold;
      this._log(`📊 Umbral de confianza: ${Math.round(threshold * 100)}%`);
    }
  }

  /**
   * Activar/desactivar modo debug
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
  }

  /**
   * Log privado para debug
   */
  _log(message) {
    if (this.debugMode) {
      console.log(`[WordDetectionService] ${message}`);
    }
  }

  /**
   * Actualizar métricas internas
   */
  _updateMetrics(inferenceTime, isDetection) {
    this.metrics.totalInferences++;
    if (isDetection) {
      this.metrics.detectionsMade++;
    }
    
    // Promedio móvil
    this.metrics.averageInferenceTime = 
      (this.metrics.averageInferenceTime * (this.metrics.totalInferences - 1) + inferenceTime) /
      this.metrics.totalInferences;
    
    this.metrics.lastInferenceTime = inferenceTime;

    // Pico de memoria
    const currentMemory = tf.memory().numBytes;
    if (currentMemory > this.metrics.peakMemory) {
      this.metrics.peakMemory = currentMemory;
    }
  }

  /**
   * Liberar recursos
   */
  dispose() {
    this.reset();
  }
}

// Singleton exportado
export const wordDetectionService = new WordDetectionService();
