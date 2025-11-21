import { useState, useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

const useTfjsClassifier = ({ 
  sequenceLength = 30,
  confidenceThreshold = 0.85,
  smoothingWindow = 5,
  debug = false 
}) => {
  const [model, setModel] = useState(null);
  const [labels, setLabels] = useState([]);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState(null);
  const [lastPrediction, setLastPrediction] = useState(null);

  const sequenceRef = useRef([]);
  const predictionHistoryRef = useRef([]);
  const isProcessingRef = useRef(false);
  const framesSinceLastPredictionRef = useRef(0);

  // Inicializar TensorFlow.js y cargar modelo
  useEffect(() => {
    const initializeTfjs = async () => {
      try {
        console.log('[TfjsClassifier] Iniciando carga de modelo y labels...');
        setIsModelLoading(true);
        setModelError(null);

        // Configurar backend WebGL para mejor rendimiento
        await tf.setBackend('webgl');
        await tf.ready();

        // Configurar opciones de WebGL
        tf.env().set('WEBGL_VERSION', 2);
        tf.env().set('WEBGL_CPU_FORWARD', false);
        tf.env().set('WEBGL_PACK', true);
        tf.env().set('WEBGL_FORCE_F16_TEXTURES', false);

        console.log('[TfjsClassifier] Backend WebGL configurado');

        // Cargar labels
        const labelsResponse = await fetch('/labels.json');
        if (!labelsResponse.ok) {
          throw new Error(`Error cargando labels: ${labelsResponse.status}`);
        }
        
        const labelsData = await labelsResponse.json();
        setLabels(labelsData);
        console.log(`[TfjsClassifier] Labels cargados: ${labelsData.length} clases`);

        // Cargar modelo con manejo de errores mejorado
        const modelPath = '/model/model.json';
        console.log(`[TfjsClassifier] Cargando modelo desde: ${modelPath}`);
        
        const loadedModel = await tf.loadLayersModel(modelPath, {
          onProgress: (fraction) => {
            if (debug) {
              console.log(`[TfjsClassifier] Progreso de carga: ${(fraction * 100).toFixed(2)}%`);
            }
          }
        });

        // Verificar arquitectura del modelo
        if (debug) {
          console.log('[TfjsClassifier] Arquitectura del modelo:');
          loadedModel.summary();
        }

        // Calentar el modelo con una predicción dummy
        const dummyInput = tf.zeros([1, sequenceLength, 63]);
        const warmupPrediction = await loadedModel.predict(dummyInput);
        warmupPrediction.dispose();
        dummyInput.dispose();

        setModel(loadedModel);
        setIsModelLoading(false);
        
        console.log('[TfjsClassifier] ✅ Modelo cargado y listo');
      } catch (error) {
        console.error('[TfjsClassifier] Error:', error);
        setModelError(error.message);
        setIsModelLoading(false);
      }
    };

    initializeTfjs();

    // Cleanup
    return () => {
      if (model) {
        model.dispose();
      }
      tf.dispose();
      sequenceRef.current = [];
      predictionHistoryRef.current = [];
    };
  }, [sequenceLength, debug]);

  // Función para suavizar predicciones
  const smoothPredictions = useCallback((predictions) => {
    predictionHistoryRef.current.push(predictions);
    
    // Mantener solo las últimas N predicciones
    if (predictionHistoryRef.current.length > smoothingWindow) {
      predictionHistoryRef.current.shift();
    }

    // Si no tenemos suficientes predicciones, retornar la actual
    if (predictionHistoryRef.current.length < 3) {
      return predictions;
    }

    // Calcular promedio ponderado de las predicciones
    const weights = predictionHistoryRef.current.map((_, i) => 
      (i + 1) / predictionHistoryRef.current.length
    );
    
    const weightSum = weights.reduce((a, b) => a + b, 0);
    const smoothed = new Array(predictions.length).fill(0);

    for (let i = 0; i < predictions.length; i++) {
      let sum = 0;
      for (let j = 0; j < predictionHistoryRef.current.length; j++) {
        sum += predictionHistoryRef.current[j][i] * weights[j];
      }
      smoothed[i] = sum / weightSum;
    }

    return smoothed;
  }, [smoothingWindow]);

  // Función principal de clasificación
  const classifySequence = useCallback(async (keypoints) => {
    if (!model || !keypoints || isProcessingRef.current) {
      return null;
    }

    // Validar keypoints
    if (keypoints.length !== 63) {
      console.error('[TfjsClassifier] Keypoints inválidos:', keypoints.length);
      return null;
    }

    // Verificar que no todos los valores sean 0
    const hasValidData = keypoints.some(val => val !== 0 && !isNaN(val));
    if (!hasValidData) {
      if (debug) {
        console.log('[TfjsClassifier] Keypoints vacíos, saltando clasificación');
      }
      return null;
    }

    try {
      isProcessingRef.current = true;

      // Añadir keypoints a la secuencia
      sequenceRef.current.push(keypoints);
      
      // Mantener solo los últimos N frames
      if (sequenceRef.current.length > sequenceLength) {
        sequenceRef.current.shift();
      }

      // Solo predecir cuando tengamos una secuencia completa
      if (sequenceRef.current.length < sequenceLength) {
        if (debug && sequenceRef.current.length % 10 === 0) {
          console.log(`[TfjsClassifier] Construyendo secuencia: ${sequenceRef.current.length}/${sequenceLength}`);
        }
        return null;
      }

      // Limitar la frecuencia de predicciones para mejorar rendimiento
      framesSinceLastPredictionRef.current++;
      if (framesSinceLastPredictionRef.current < 5) {
        return lastPrediction;
      }
      framesSinceLastPredictionRef.current = 0;

      // Preparar tensor de entrada
      const inputTensor = tf.tidy(() => {
        const sequence = tf.tensor3d(sequenceRef.current, [sequenceLength, 63]);
        return sequence.expandDims(0); // [1, sequenceLength, 63]
      });

      // Realizar predicción
      const predictions = await model.predict(inputTensor).data();
      inputTensor.dispose();

      // Aplicar suavizado
      const smoothedPredictions = smoothPredictions(Array.from(predictions));

      // Encontrar la clase con mayor confianza
      let maxConfidence = 0;
      let predictedClassIdx = -1;

      for (let i = 0; i < smoothedPredictions.length; i++) {
        if (smoothedPredictions[i] > maxConfidence) {
          maxConfidence = smoothedPredictions[i];
          predictedClassIdx = i;
        }
      }

      // Validar predicción con umbral de confianza
      if (maxConfidence < confidenceThreshold || predictedClassIdx === -1) {
        if (debug) {
          console.log(`[TfjsClassifier] Confianza baja: ${(maxConfidence * 100).toFixed(2)}%`);
        }
        setLastPrediction(null);
        return null;
      }

      // Crear objeto de resultado
      const result = {
        class: labels[predictedClassIdx],
        confidence: maxConfidence,
        classIndex: predictedClassIdx,
        topPredictions: smoothedPredictions
          .map((conf, idx) => ({
            class: labels[idx],
            confidence: conf
          }))
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 5),
        timestamp: Date.now()
      };

      if (debug) {
        console.log('[TfjsClassifier] Predicción:', {
          seña: result.class,
          confianza: `${(result.confidence * 100).toFixed(2)}%`,
          top3: result.topPredictions.slice(0, 3).map(p => 
            `${p.class}: ${(p.confidence * 100).toFixed(1)}%`
          )
        });
      }

      setLastPrediction(result);
      return result;

    } catch (error) {
      console.error('[TfjsClassifier] Error en clasificación:', error);
      return null;
    } finally {
      isProcessingRef.current = false;
    }
  }, [model, labels, sequenceLength, confidenceThreshold, smoothingWindow, lastPrediction, smoothPredictions, debug]);

  // Función para reiniciar la secuencia
  const resetSequence = useCallback(() => {
    sequenceRef.current = [];
    predictionHistoryRef.current = [];
    framesSinceLastPredictionRef.current = 0;
    setLastPrediction(null);
    console.log('[TfjsClassifier] Secuencia reiniciada');
  }, []);

  // Función para obtener estadísticas
  const getStats = useCallback(() => {
    return {
      sequenceLength: sequenceRef.current.length,
      modelLoaded: !!model,
      labelsCount: labels.length,
      lastPrediction,
      isProcessing: isProcessingRef.current
    };
  }, [model, labels, lastPrediction]);

  return {
    classifySequence,
    resetSequence,
    getStats,
    isModelLoading,
    modelError,
    labels,
    modelReady: !!model && !isModelLoading && !modelError
  };
};

export default useTfjsClassifier;
