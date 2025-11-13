/**
 * MonolithicDetectionScreen.js
 *
 * ⚡ INTEGRACIÓN TODO-EN-UNO - MÁXIMA DEBUGGING
 *
 * Este archivo contiene el flujo COMPLETO de detección de señas:
 * 1. Carga del modelo TensorFlow.js
 * 2. Inicialización de MediaPipe
 * 3. Captura de frames de cámara
 * 4. Extracción de keypoints
 * 5. Buffer circular de 24 frames
 * 6. Inferencia con el modelo
 * 7. Visualización de resultados
 *
 * VENTAJAS:
 * ✅ Todo en un solo archivo → fácil de debuggear
 * ✅ Sin hooks abstraídos → ver el flujo real
 * ✅ Logs detallados en cada paso
 * ✅ Perfecto para entender la arquitectura
 *
 * DESVENTAJAS:
 * ❌ Difícil de mantener en producción
 * ❌ Código repetido
 * ❌ Acoplamiento fuerte
 *
 * ⚠️ USAR ESTE ARCHIVO SOLO PARA:
 * - Debugging del pipeline completo
 * - Entender el flujo end-to-end
 * - Testing de nuevas características
 *
 * 🚀 MIGRACIÓN A PRODUCCIÓN:
 * Ver MONOLITHIC_MIGRATION.md para pasos de refactorización
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { Asset } from 'expo-asset';

// ============================================================================
// 🎨 INTERFAZ MONOLÍTICA
// ============================================================================

const MonolithicDetectionScreen = ({ navigation }) => {
  // ==========================================================================
  // 1️⃣ STATE - Todos los estados en un componente
  // ==========================================================================

  // Modelo y MediaPipe
  const [model, setModel] = useState(null);
  const [modelReady, setModelReady] = useState(false);
  const [labels, setLabels] = useState([]);
  const [mediaPipeReady, setMediaPipeReady] = useState(false);
  const [handDetector, setHandDetector] = useState(null);

  // Cámara
  const [cameraPermission, setCameraPermission] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  // Buffer y detección
  const [frameBuffer, setFrameBuffer] = useState([]);
  const [detectedWord, setDetectedWord] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // UI y logging
  const [loadingMessage, setLoadingMessage] = useState('Inicializando...');
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  // Referencias
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const animationFrameId = useRef(null);
  const lastFrameTime = useRef(0);

  // ==========================================================================
  // 2️⃣ UTILIDADES - Logging y helpers
  // ==========================================================================

  /**
   * Sistema de logging integrado (sin dependencias externas)
   */
  const log = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}`;

    console.log(logEntry);

    // Guardar últimos 50 logs para debugging
    setLogs((prevLogs) => [logEntry, ...prevLogs.slice(0, 49)]);
  };

  /**
   * Normalizar keypoints a rango [0, 1]
   */
  const normalizeKeypoints = (keypoints) => {
    if (!keypoints) return null;
    return keypoints.map((val) => Math.max(0, Math.min(1, val)));
  };

  /**
   * Combinar keypoints de dos manos en array de 126 elementos
   */
  const combineHandKeypoints = (leftHand, rightHand) => {
    const combined = new Array(126).fill(0);

    // Mano izquierda en posiciones 0-62 (21 landmarks × 3 axes)
    if (leftHand && leftHand.landmarks) {
      let idx = 0;
      leftHand.landmarks.forEach((landmark) => {
        combined[idx++] = landmark.x || 0;
        combined[idx++] = landmark.y || 0;
        combined[idx++] = landmark.z || 0;
      });
    }

    // Mano derecha en posiciones 63-125
    if (rightHand && rightHand.landmarks) {
      let idx = 63;
      rightHand.landmarks.forEach((landmark) => {
        combined[idx++] = landmark.x || 0;
        combined[idx++] = landmark.y || 0;
        combined[idx++] = landmark.z || 0;
      });
    }

    return normalizeKeypoints(combined);
  };

  /**
   * Agregar frame al buffer circular (máximo 24 frames)
   */
  const addFrameToBuffer = (keypoints) => {
    setFrameBuffer((prevBuffer) => {
      const newBuffer = [...prevBuffer];

      // Si ya tenemos 24 frames, remover el más viejo
      if (newBuffer.length >= 24) {
        newBuffer.shift();
      }

      newBuffer.push(keypoints);
      return newBuffer;
    });
  };

  // ==========================================================================
  // 3️⃣ INICIALIZACIÓN - Cargar modelo + MediaPipe
  // ==========================================================================

  /**
   * Cargar etiquetas desde JSON
   */
  const loadLabelsFromAsset = async () => {
    try {
      log('📝 Cargando etiquetas...');

      const labelsAsset = Asset.fromModule(
        require('../assets/model/labels.json')
      );
      await labelsAsset.downloadAsync();

      const response = await fetch(labelsAsset.uri);
      const data = await response.json();
      const loadedLabels = data.classes || data;

      setLabels(loadedLabels);
      log(`✅ ${loadedLabels.length} etiquetas cargadas`);

      return loadedLabels;
    } catch (error) {
      log(`❌ Error cargando etiquetas: ${error.message}`);
      throw error;
    }
  };

  /**
   * Cargar modelo TensorFlow.js
   */
  const loadTensorFlowModel = async () => {
    try {
      log('🧠 Inicializando TensorFlow.js...');
      await tf.ready();

      const backend = tf.getBackend();
      log(`   Backend: ${backend}`);

      // Cargar etiquetas primero
      const loadedLabels = await loadLabelsFromAsset();

      // Cargar modelo
      log('📦 Cargando modelo TensorFlow.js...');

      const modelAsset = Asset.fromModule(
        require('../assets/model/tfjs_model/model.json')
      );
      await modelAsset.downloadAsync();

      const loadedModel = await tf.loadLayersModel(modelAsset.uri);
      log('✅ Modelo cargado exitosamente');

      // Validar arquitectura
      const inputShape = loadedModel.inputs[0].shape;
      log(`📐 Input shape: [${inputShape.join(', ')}]`);

      // Warmup: una predicción dummy
      log('🔥 Warmup del modelo...');
      const dummyInput = tf.randomNormal([1, 24, 126]);
      const warmupPred = loadedModel.predict(dummyInput);
      dummyInput.dispose();
      warmupPred.dispose();

      setModel(loadedModel);
      setModelReady(true);
      log('✅ Modelo TensorFlow.js listo para inferencia');

      return loadedModel;
    } catch (error) {
      log(`❌ Error cargando modelo: ${error.message}`);
      setLoadingMessage('Error al cargar el modelo');
      Alert.alert('Error', 'No se pudo cargar el modelo: ' + error.message);
      throw error;
    }
  };

  /**
   * Inicializar MediaPipe Hand Landmarker
   */
  const initializeMediaPipe = async () => {
    try {
      log('📦 Cargando MediaPipe...');

      // Importar dinámicamente para evitar bundle grande
      const vision = await import('@mediapipe/tasks-vision');

      if (!vision || !vision.HandLandmarker) {
        throw new Error(
          'MediaPipe Vision no disponible. Instala: npm install @mediapipe/tasks-vision'
        );
      }

      // Crear Hand Landmarker con configuración
      const detector = await vision.HandLandmarker.createFromOptions(
        window, // En web usamos window
        {
          baseOptions: {
            modelAssetPath:
              'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        }
      );

      setHandDetector(detector);
      setMediaPipeReady(true);
      log('✅ MediaPipe inicializado correctamente');

      return detector;
    } catch (error) {
      log(`⚠️ Warning MediaPipe: ${error.message}`);
      log('   (Esto es normal en algunos contextos, funciona en navegador)');
      // No bloqueamos aquí - MediaPipe es opcional para debugging
      setMediaPipeReady(false);
    }
  };

  /**
   * Efecto: Cargar modelo y MediaPipe al montar componente
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoadingMessage('Cargando modelo TensorFlow.js...');
        await loadTensorFlowModel();

        setLoadingMessage('Inicializando MediaPipe...');
        await initializeMediaPipe();

        setLoadingMessage('¡Listo para comenzar!');

        log('🎉 Inicialización completada');
      } catch (error) {
        log(`❌ Error en inicialización: ${error.message}`);
        setLoadingMessage('Error en inicialización');
      }
    };

    initialize();

    // Cleanup
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // ==========================================================================
  // 4️⃣ DETECCIÓN - Capturar frames y hacer predicciones
  // ==========================================================================

  /**
   * Detección de manos con MediaPipe
   */
  const detectHandsInFrame = async (video) => {
    if (!handDetector || !video) return null;

    try {
      const now = Date.now();

      // Control de FPS: máximo 30 FPS (33ms entre frames)
      if (now - lastFrameTime.current < 33) {
        return null;
      }
      lastFrameTime.current = now;

      // Detectar manos
      const detectionResult = await handDetector.detectForVideo(video, now);

      if (!detectionResult || !detectionResult.landmarks) {
        return null;
      }

      // Organizar por handedness (izquierda/derecha)
      let leftHand = null;
      let rightHand = null;

      if (detectionResult.handedness && Array.isArray(detectionResult.handedness)) {
        detectionResult.handedness.forEach((handedness, idx) => {
          if (handedness[0].categoryName === 'Left') {
            leftHand = { landmarks: detectionResult.landmarks[idx] };
          } else if (handedness[0].categoryName === 'Right') {
            rightHand = { landmarks: detectionResult.landmarks[idx] };
          }
        });
      }

      return { leftHand, rightHand };
    } catch (error) {
      log(`⚠️ Error detectando manos: ${error.message}`);
      return null;
    }
  };

  /**
   * Hacer predicción con el modelo
   */
  const predictWithModel = async (buffer) => {
    if (!model || buffer.length < 24) {
      return null;
    }

    try {
      setIsProcessing(true);

      // Convertir buffer a tensor [1, 24, 126]
      const inputTensor = tf.tensor3d([buffer], [1, 24, 126]);

      // Predicción
      const outputTensor = model.predict(inputTensor);
      const predictions = await outputTensor.data();
      const predictionsArray = Array.from(predictions);

      // Encontrar clase con máxima confianza
      const maxConfidenceIdx = predictionsArray.indexOf(
        Math.max(...predictionsArray)
      );
      const maxConfidence = predictionsArray[maxConfidenceIdx];

      // Mapear a etiqueta
      const predictedLabel = labels[maxConfidenceIdx] || `Clase ${maxConfidenceIdx}`;

      // Cleanup tensores
      inputTensor.dispose();
      outputTensor.dispose();

      // Log
      log(`🎯 Detección: ${predictedLabel} (${(maxConfidence * 100).toFixed(1)}%)`);

      return {
        word: predictedLabel,
        confidence: maxConfidence,
        index: maxConfidenceIdx,
        allPredictions: predictionsArray,
      };
    } catch (error) {
      log(`❌ Error en predicción: ${error.message}`);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Loop de detección principal
   */
  const startDetectionLoop = async () => {
    if (!mediaPipeReady || !videoRef.current || !isDetecting) {
      return;
    }

    try {
      // Detectar manos
      const hands = await detectHandsInFrame(videoRef.current);

      if (hands && (hands.leftHand || hands.rightHand)) {
        // Combinar keypoints
        const keypoints = combineHandKeypoints(hands.leftHand, hands.rightHand);

        if (keypoints) {
          // Agregar al buffer
          addFrameToBuffer(keypoints);

          // Si tenemos 24 frames, hacer predicción
          setFrameBuffer((currentBuffer) => {
            if (currentBuffer.length === 24) {
              // Hacer predicción
              (async () => {
                const prediction = await predictWithModel(currentBuffer);
                if (prediction) {
                  setDetectedWord(prediction.word);
                  setConfidence(prediction.confidence);
                }
              })();
            }
            return currentBuffer;
          });
        }
      }
    } catch (error) {
      log(`❌ Error en loop de detección: ${error.message}`);
    }

    // Siguiente frame
    if (isDetecting) {
      animationFrameId.current = requestAnimationFrame(startDetectionLoop);
    }
  };

  /**
   * Iniciar detección
   */
  const handleStartDetection = async () => {
    if (!modelReady) {
      Alert.alert('Espera', 'El modelo aún se está cargando');
      return;
    }

    // Pedir permisos de cámara
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara');
      return;
    }

    setIsDetecting(true);
    setFrameBuffer([]);
    setDetectedWord(null);
    setConfidence(0);

    log('▶️  Detección iniciada');

    // Iniciar loop si MediaPipe está listo
    if (mediaPipeReady && videoRef.current) {
      startDetectionLoop();
    } else {
      log('⚠️ MediaPipe no listo, usando modo simulado');
      // Aquí podrías agregar simulación fallback
    }
  };

  /**
   * Detener detección
   */
  const handleStopDetection = () => {
    setIsDetecting(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    log('⏹️  Detección detenida');
  };

  // ==========================================================================
  // 5️⃣ RENDER - UI
  // ==========================================================================

  // Estado de carga
  if (!modelReady) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00FF88" />
          <Text style={styles.loadingText}>{loadingMessage}</Text>

          {/* Mini-logs durante carga */}
          <ScrollView style={styles.miniLogs}>
            {logs.slice(0, 5).map((log, idx) => (
              <Text key={idx} style={styles.logText}>
                {log}
              </Text>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // Pantalla principal
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Monolítica Detección</Text>
          <Text style={styles.subtitle}>Todo en un archivo</Text>
        </View>
        <TouchableOpacity onPress={() => setShowLogs(!showLogs)}>
          <Ionicons name="bug" size={24} color="#FFB800" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Video Web */}
        <View style={styles.videoContainer}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: 300,
              backgroundColor: '#1a1a1a',
              borderRadius: 12,
            }}
          />

          {/* Overlay de detección */}
          {detectedWord && (
            <View style={styles.detectionOverlay}>
              <View style={styles.detectionBox}>
                <Text style={styles.detectedText}>{detectedWord}</Text>
                <Text style={styles.confidenceText}>
                  {(confidence * 100).toFixed(1)}% confianza
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Estado del buffer */}
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>📊 Buffer Circular</Text>
          <View style={styles.bufferBar}>
            <View
              style={{
                width: `${(frameBuffer.length / 24) * 100}%`,
                height: 8,
                backgroundColor: frameBuffer.length === 24 ? '#00FF88' : '#FFB800',
                borderRadius: 4,
              }}
            />
          </View>
          <Text style={styles.bufferText}>
            {frameBuffer.length} / 24 frames
          </Text>
        </View>

        {/* Estado de componentes */}
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>⚙️ Estado del Pipeline</Text>
          <View style={styles.statusItem}>
            <Ionicons
              name={modelReady ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={modelReady ? '#00FF88' : '#FF6B6B'}
            />
            <Text style={styles.statusText}>
              TensorFlow.js {modelReady ? '✅' : '❌'}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Ionicons
              name={mediaPipeReady ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={mediaPipeReady ? '#00FF88' : '#FF6B6B'}
            />
            <Text style={styles.statusText}>
              MediaPipe {mediaPipeReady ? '✅' : '❌'}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Ionicons
              name={isDetecting ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={isDetecting ? '#00FF88' : '#FF6B6B'}
            />
            <Text style={styles.statusText}>
              Detección {isDetecting ? '✅ ACTIVA' : '❌ Inactiva'}
            </Text>
          </View>
        </View>

        {/* Controles */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.button, isDetecting && styles.buttonActive]}
            onPress={isDetecting ? handleStopDetection : handleStartDetection}
          >
            <Ionicons
              name={isDetecting ? 'stop' : 'play'}
              size={28}
              color={isDetecting ? '#FFB800' : '#00FF88'}
            />
            <Text style={styles.buttonText}>
              {isDetecting ? 'Detener' : 'Comenzar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logs (solo si showLogs) */}
        {showLogs && (
          <View style={styles.logsContainer}>
            <View style={styles.logsHeader}>
              <Text style={styles.logsTitle}>🐛 Debug Logs</Text>
              <TouchableOpacity onPress={() => setLogs([])}>
                <Ionicons name="trash" size={18} color="#FF6B6B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.logsList}>
              {logs.map((logEntry, idx) => (
                <Text key={idx} style={styles.logLine}>
                  {logEntry}
                </Text>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================================
// 🎨 ESTILOS
// ============================================================================

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLORS = {
  BACKGROUND: '#0a0a0a',
  SURFACE: '#1a1a1a',
  TEXT: '#ffffff',
  TEXT_DIM: '#888888',
  ACCENT: '#00FF88',
  WARNING: '#FFB800',
  ERROR: '#FF6B6B',
  PRIMARY: '#00FF88',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },

  headerTitle: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT,
  },

  subtitle: {
    fontSize: 12,
    color: COLORS.TEXT_DIM,
    marginTop: 2,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  loadingText: {
    fontSize: 16,
    color: COLORS.TEXT,
    marginTop: 16,
    textAlign: 'center',
  },

  miniLogs: {
    marginTop: 24,
    maxHeight: 200,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 8,
    padding: 12,
    width: '100%',
  },

  logText: {
    fontSize: 10,
    color: COLORS.TEXT_DIM,
    marginBottom: 4,
    fontFamily: 'monospace',
  },

  // Content
  content: {
    flex: 1,
    padding: 16,
  },

  // Video
  videoContainer: {
    marginBottom: 16,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    height: 300,
  },

  detectionOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: COLORS.ACCENT,
  },

  detectionBox: {
    alignItems: 'center',
  },

  detectedText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.ACCENT,
  },

  confidenceText: {
    fontSize: 12,
    color: COLORS.TEXT_DIM,
    marginTop: 4,
  },

  // Status cards
  statusCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 8,
  },

  bufferBar: {
    height: 8,
    backgroundColor: '#222',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },

  bufferText: {
    fontSize: 12,
    color: COLORS.TEXT_DIM,
  },

  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  statusText: {
    marginLeft: 8,
    fontSize: 12,
    color: COLORS.TEXT,
  },

  // Controls
  controlsContainer: {
    marginVertical: 16,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: COLORS.ACCENT,
  },

  buttonActive: {
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
    borderColor: COLORS.WARNING,
  },

  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT,
  },

  // Logs
  logsContainer: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    maxHeight: 300,
  },

  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  logsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.WARNING,
  },

  logsList: {
    maxHeight: 250,
  },

  logLine: {
    fontSize: 10,
    color: COLORS.TEXT_DIM,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});

export default MonolithicDetectionScreen;
