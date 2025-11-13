/**
 * RealTimeDetectionScreen.js
 *
 * 🎯 INTEGRACIÓN COMPLETA - Cámara + MediaPipe + TensorFlow.js + iOS Design
 *
 * Arquitectura:
 * 1. MediaPipe Hand Detection → Captura keypoints de manos en tiempo real
 * 2. Buffer Circular (24 frames) → Suavizado de detecciones
 * 3. TensorFlow.js LSTM → Inferencia con keypoints normalizados
 * 4. Componentes iOS → Glass Morphism + Animaciones
 *
 * ✅ Cámara web funcional con getUserMedia
 * ✅ Detección de manos en tiempo real
 * ✅ Integración TensorFlow.js con modelos entrenados
 * ✅ Diseño iOS moderno con animaciones
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
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { Asset } from 'expo-asset';
import { useTheme } from '../context/ThemeContext';

// Importar componentes de detección (CSB-78, 79, 80, 81)
import DetectionOverlay from '../components/camera/DetectionOverlay';
import ConfidenceIndicator from '../components/detection/ConfidenceIndicator';
import { AudioButton } from '../components/detection/AudioButton';
import ResultInteraction from '../components/detection/ResultInteraction';
import DetectionHistory from '../components/detection/DetectionHistory';

const RealTimeDetectionScreen = ({ navigation }) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Modelo y MediaPipe
  const [model, setModel] = useState(null);
  const [modelReady, setModelReady] = useState(false);
  const [labels, setLabels] = useState([]);
  const [handDetector, setHandDetector] = useState(null);
  const [mediaPipeReady, setMediaPipeReady] = useState(false);

  // Cámara
  const [webStream, setWebStream] = useState(null);
  const [webError, setWebError] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [facing, setFacing] = useState('front');

  // Buffer y detección
  const [frameBuffer, setFrameBuffer] = useState([]);
  const [detectedWord, setDetectedWord] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionHistory, setDetectionHistory] = useState([]);

  // UI
  const [loadingMessage, setLoadingMessage] = useState('Inicializando...');
  const [showDebug, setShowDebug] = useState(false);

  // Referencias
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const lastFrameTime = useRef(0);
  const screenMountedRef = useRef(true);
  const animationValue = useRef(new Animated.Value(0)).current;

  const { colors } = useTheme();

  // ============================================================================
  // UTILITIES
  // ============================================================================

  const loadLabelsFromAsset = async () => {
    try {
      const asset = Asset.fromModule(require('../assets/model/labels.json'));
      await asset.downloadAsync();
      const response = await fetch(asset.uri);
      const data = await response.json();
      return data.labels || data;
    } catch (error) {
      console.error('Error loading labels:', error);
      return [];
    }
  };

  const normalizeKeypoints = (keypoints) => {
    if (!keypoints) return null;
    return keypoints.map((val) => Math.max(0, Math.min(1, val)));
  };

  const combineHandKeypoints = (leftHand, rightHand) => {
    const combined = new Array(126).fill(0);
    if (leftHand && Array.isArray(leftHand)) {
      leftHand.slice(0, 63).forEach((val, idx) => {
        combined[idx] = val;
      });
    }
    if (rightHand && Array.isArray(rightHand)) {
      rightHand.slice(0, 63).forEach((val, idx) => {
        combined[63 + idx] = val;
      });
    }
    return normalizeKeypoints(combined);
  };

  const updateFrameBuffer = (newKeypoints) => {
    setFrameBuffer((currentBuffer) => {
      const newBuffer = [...currentBuffer, newKeypoints];
      return newBuffer.length > 24 ? newBuffer.slice(-24) : newBuffer;
    });
  };

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  const loadTensorFlowModel = async () => {
    try {
      setLoadingMessage('Cargando modelo TensorFlow.js...');

      // Cargar etiquetas
      const loadedLabels = await loadLabelsFromAsset();
      setLabels(loadedLabels);

      // Cargar modelo
      const modelAsset = Asset.fromModule(
        require('../assets/model/tfjs_model/model.json')
      );
      await modelAsset.downloadAsync();

      const loadedModel = await tf.loadLayersModel(modelAsset.uri);
      setModel(loadedModel);
      setModelReady(true);

      console.log('✅ TensorFlow.js model loaded');
      return loadedModel;
    } catch (error) {
      console.error('❌ Error loading model:', error);
      setLoadingMessage('Error al cargar el modelo');
      Alert.alert('Error', 'No se pudo cargar el modelo: ' + error.message);
      throw error;
    }
  };

  const initializeMediaPipe = async () => {
    try {
      setLoadingMessage('Inicializando MediaPipe...');

      const vision = await import('@mediapipe/tasks-vision');

      if (!vision || !vision.HandLandmarker) {
        throw new Error('MediaPipe Vision no disponible');
      }

      const detector = await vision.HandLandmarker.createFromOptions(window, {
        baseOptions: {
          modelAssetPath:
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      setHandDetector(detector);
      setMediaPipeReady(true);
      console.log('✅ MediaPipe initialized');

      return detector;
    } catch (error) {
      console.warn('⚠️ MediaPipe warning:', error.message);
      setMediaPipeReady(false);
    }
  };

  const initializeCamera = async () => {
    try {
      setLoadingMessage('Accediendo a la cámara...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: facing === 'front' ? 'user' : 'environment',
        },
        audio: false,
      });

      if (!screenMountedRef.current) return;

      setWebStream(stream);
      setWebError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.warn('Video play failed:', err);
        });
      }

      setIsCameraReady(true);
      console.log('✅ Camera ready');
    } catch (err) {
      if (screenMountedRef.current) {
        let errorMsg = 'No se pudo acceder a la cámara.';
        if (err.name === 'NotAllowedError') {
          errorMsg = 'Permiso de cámara denegado.';
        }
        setWebError(errorMsg);
        console.error('Camera error:', err);
      }
    }
  };

  useEffect(() => {
    screenMountedRef.current = true;

    const initialize = async () => {
      try {
        await loadTensorFlowModel();
        await initializeMediaPipe();
        await initializeCamera();
        setLoadingMessage('¡Listo para comenzar!');
      } catch (error) {
        console.error('Initialization error:', error);
        setLoadingMessage('Error en inicialización');
      }
    };

    initialize();

    return () => {
      screenMountedRef.current = false;
      if (webStream) {
        webStream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [facing]);

  // ============================================================================
  // DETECTION LOGIC
  // ============================================================================

  const detectHandsInFrame = async (video) => {
    if (!handDetector || !video) return null;

    try {
      const now = Date.now();

      // Control FPS: máximo 30 FPS
      if (now - lastFrameTime.current < 33) {
        return null;
      }
      lastFrameTime.current = now;

      const detectionResult = await handDetector.detectForVideo(video, now);

      if (!detectionResult || !detectionResult.landmarks) {
        return null;
      }

      let leftHand = null;
      let rightHand = null;

      if (detectionResult.handedness && Array.isArray(detectionResult.handedness)) {
        detectionResult.handedness.forEach((handedness, idx) => {
          const landmarks = detectionResult.landmarks[idx];
          const flatLandmarks = landmarks.flatMap((lm) => [lm.x, lm.y, lm.z]);

          if (handedness.displayName === 'Right') {
            rightHand = flatLandmarks;
          } else {
            leftHand = flatLandmarks;
          }
        });
      }

      return { leftHand, rightHand };
    } catch (error) {
      console.error('Hand detection error:', error);
      return null;
    }
  };

  const runInference = async (sequence) => {
    if (!model || sequence.length < 24) return null;

    try {
      setIsProcessing(true);

      const tensor = tf.tensor3d([sequence]);
      const predictions = model.predict(tensor);
      const logits = await predictions.data();

      tensor.dispose();
      predictions.dispose();

      const maxConfidence = Math.max(...logits);
      const maxIndex = Array.from(logits).indexOf(maxConfidence);

      const word = labels[maxIndex] || `Clase ${maxIndex}`;

      setDetectedWord(word);
      setConfidence(maxConfidence);

      if (maxConfidence > 0.5) {
        setDetectionHistory((prev) => [
          { word, confidence: maxConfidence, timestamp: Date.now() },
          ...prev.slice(0, 9),
        ]);
      }

      return { word, confidence: maxConfidence };
    } catch (error) {
      console.error('Inference error:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const startDetection = async () => {
    if (!isCameraReady || !modelReady) {
      Alert.alert('Error', 'La cámara o el modelo no están listos');
      return;
    }

    setIsDetecting(true);

    const detectionLoop = async () => {
      if (!isDetecting) return;

      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        // Detección de manos
        const hands = await detectHandsInFrame(videoRef.current);

        if (hands) {
          const keypoints = combineHandKeypoints(hands.leftHand, hands.rightHand);
          if (keypoints) {
            updateFrameBuffer(keypoints);

            // Hacer inferencia si tenemos 24 frames
            if (frameBuffer.length === 24) {
              await runInference(frameBuffer);
            }
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(detectionLoop);
    };

    animationFrameId.current = requestAnimationFrame(detectionLoop);
  };

  const stopDetection = () => {
    setIsDetecting(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setDetectedWord(null);
    setConfidence(0);
    setFrameBuffer([]);
  };

  const toggleCameraFacing = () => {
    if (isDetecting) {
      stopDetection();
    }
    if (webStream) {
      webStream.getTracks().forEach((track) => track.stop());
      setWebStream(null);
    }
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!modelReady) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.darkBackground }]}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.neonGreen} />
          <Text style={[styles.loadingText, { color: colors.textPrimary }]}>
            {loadingMessage}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (webError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.darkBackground }]}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Ionicons name="close-circle-outline" size={80} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.textPrimary }]}>Sin acceso a la cámara</Text>
          <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>{webError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.darkBackground }]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.darkSurface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (isDetecting) stopDetection();
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>SignBridge</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Detección en Tiempo Real</Text>
        </View>
        <TouchableOpacity onPress={() => setShowDebug(!showDebug)}>
          <Ionicons name="bug" size={24} color={colors.neonGreen} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Camera Container */}
        <View style={[styles.cameraContainer, { backgroundColor: colors.darkSurface }]}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: 360,
              backgroundColor: '#1a1a1a',
              borderRadius: 16,
              transform: facing === 'front' ? 'scaleX(-1)' : 'scaleX(1)',
            }}
            onLoadedMetadata={() => {
              console.log('✓ Video stream loaded');
            }}
          />

          {/* Detection Overlay */}
          <View style={styles.overlayAbsolute}>
            <DetectionOverlay
              detectedLetter={detectedWord}
              confidence={confidence}
              isProcessing={isProcessing}
              isVisible={true}
            />
          </View>

          {/* Detection Status Indicator */}
          <View style={styles.statusIndicatorContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: isDetecting ? '#00FF8833' : '#FFB80033' }]}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isDetecting ? colors.neonGreen : colors.warning },
                ]}
              />
              <Text style={styles.statusLabel}>
                {isDetecting ? 'Detectando' : 'Pausado'}
              </Text>
            </View>
          </View>
        </View>

        {/* CSB-78: Confidence Indicator */}
        {detectedWord && (
          <View style={styles.confidenceSection}>
            <ConfidenceIndicator confidence={confidence} isProcessing={isProcessing} />
          </View>
        )}

        {/* CSB-80: Result Interaction (Confirm/Reject/Clear) */}
        {detectedWord && (
          <ResultInteraction
            detectedWord={detectedWord}
            confidence={confidence}
            onConfirm={(word, conf) => {
              console.log(`✅ Palabra confirmada: ${word} (${(conf * 100).toFixed(0)}%)`);
              setDetectionHistory((prev) => [
                { word, confidence: conf, timestamp: Date.now() },
                ...prev.slice(0, 19),
              ]);
            }}
            onReject={() => {
              console.log('❌ Detección rechazada');
              setDetectedWord(null);
              setConfidence(0);
            }}
            onClear={() => {
              console.log('🔄 Limpiando');
              setDetectedWord(null);
              setConfidence(0);
              setFrameBuffer([]);
              setDetectionHistory([]);
            }}
            isEnabled={true}
          />
        )}

        {/* CSB-79: Audio Button (with speed control) */}
        {detectedWord && (
          <View style={styles.audioSection}>
            <AudioButton
              word={detectedWord}
              language="es-CL"
              speed={1.0}
              onPlayStart={() => console.log('🔊 Playing...')}
              onPlayEnd={() => console.log('🔊 Stopped')}
            />
          </View>
        )}

        {/* Buffer Status */}
        <View style={[styles.statusCard, { backgroundColor: colors.darkSurface }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>📊 Buffer de Frames</Text>
          <View style={[styles.bufferBar, { backgroundColor: colors.border }]}>
            <View
              style={{
                width: `${(frameBuffer.length / 24) * 100}%`,
                height: 8,
                backgroundColor: frameBuffer.length === 24 ? colors.neonGreen : colors.warning,
                borderRadius: 4,
              }}
            />
          </View>
          <Text style={[styles.bufferText, { color: colors.textSecondary }]}>
            {frameBuffer.length} / 24 frames
          </Text>
        </View>

        {/* Detection History */}
        {detectionHistory.length > 0 && (
          <View style={[styles.historyCard, { backgroundColor: colors.darkSurface }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>📝 Historial</Text>
            <DetectionHistory detections={detectionHistory} />
          </View>
        )}

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              isDetecting && styles.controlButtonActive,
              { backgroundColor: isDetecting ? colors.warning : colors.neonGreen },
            ]}
            onPress={isDetecting ? stopDetection : startDetection}
          >
            <Ionicons
              name={isDetecting ? 'stop' : 'play'}
              size={24}
              color={colors.darkBackground}
            />
            <Text style={[styles.controlButtonText, { color: colors.darkBackground }]}>
              {isDetecting ? 'Detener' : 'Iniciar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.border }]}
            onPress={toggleCameraFacing}
          >
            <Ionicons name="camera-reverse" size={24} color={colors.textPrimary} />
            <Text style={[styles.controlButtonText, { color: colors.textPrimary }]}>
              Girar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Debug Panel */}
        {showDebug && (
          <View style={[styles.debugPanel, { backgroundColor: colors.darkSurface }]}>
            <Text style={[styles.debugTitle, { color: colors.neonGreen }]}>🐛 Debug Info</Text>
            <View style={styles.debugItem}>
              <Text style={[styles.debugLabel, { color: colors.textSecondary }]}>MediaPipe:</Text>
              <Text style={[styles.debugValue, { color: mediaPipeReady ? colors.neonGreen : colors.error }]}>
                {mediaPipeReady ? '✅ Ready' : '❌ Not Ready'}
              </Text>
            </View>
            <View style={styles.debugItem}>
              <Text style={[styles.debugLabel, { color: colors.textSecondary }]}>TensorFlow:</Text>
              <Text style={[styles.debugValue, { color: modelReady ? colors.neonGreen : colors.error }]}>
                {modelReady ? '✅ Ready' : '❌ Not Ready'}
              </Text>
            </View>
            <View style={styles.debugItem}>
              <Text style={[styles.debugLabel, { color: colors.textSecondary }]}>Detection:</Text>
              <Text style={[styles.debugValue, { color: isDetecting ? colors.neonGreen : colors.warning }]}>
                {isDetecting ? '▶️ Active' : '⏸️ Paused'}
              </Text>
            </View>
            <View style={styles.debugItem}>
              <Text style={[styles.debugLabel, { color: colors.textSecondary }]}>Facing:</Text>
              <Text style={[styles.debugValue, { color: colors.textPrimary }]}>
                {facing === 'front' ? '👤 Front' : '🔙 Back'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  subtitleText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cameraContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    height: 360,
  },
  overlayAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 12,
    pointerEvents: 'none',
  },
  statusIndicatorContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    pointerEvents: 'none',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  confidenceSection: {
    marginBottom: 16,
  },

  audioSection: {
    marginBottom: 16,
  },
  statusCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  bufferBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  bufferText: {
    fontSize: 12,
    textAlign: 'center',
  },
  historyCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  controlButtonActive: {
    opacity: 0.9,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  debugPanel: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  debugItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  debugLabel: {
    fontSize: 12,
  },
  debugValue: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default RealTimeDetectionScreen;
