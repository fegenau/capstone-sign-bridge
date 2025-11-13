/**
 * WordDetectionScreen.mediapipe.js
 *
 * VERSIÓN MEJORADA CON MEDIAPIPE INTEGRADO
 *
 * Este es un ejemplo de cómo integrar MediaPipe en WordDetectionScreen.
 * Muestra cómo capturar gestos en tiempo real y enviarlos al modelo TensorFlow.js
 *
 * CAMBIOS PRINCIPALES:
 * 1. Agregado useMediaPipeDetection hook
 * 2. Agregada captura de video real
 * 3. Integración con wordDetectionService.detectFromKeypoints()
 * 4. UI mejorada para mostrar estado de MediaPipe
 *
 * INSTRUCCIONES DE INTEGRACIÓN:
 * 1. Copiar useMediaPipeDetection hook (ya creado en /hooks)
 * 2. Reemplazar imports en WordDetectionScreen.js
 * 3. Agregar videoRef y lógica de useMediaPipeDetection
 * 4. Instalar MediaPipe: npm install @mediapipe/tasks-vision
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Text,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { wordDetectionService } from '../utils/services/wordDetectionService';
import DetectionOverlay from '../components/camera/DetectionOverlay';
import { DetectionResultCard } from '../components/detection/DetectionResultCard';
import { AudioButton } from '../components/detection/AudioButton';
import { DetectionHistory } from '../components/detection/DetectionHistory';
import useMediaPipeDetection from '../hooks/useMediaPipeDetection';

const WordDetectionScreen = ({ navigation }) => {
  // ========================================================================
  // ESTADO - DETECCIÓN TensorFlow
  // ========================================================================
  const [detectedWord, setDetectedWord] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingMessage, setLoadingMessage] = useState('Inicializando...');

  // ========================================================================
  // ESTADO - MEDIAPIPE
  // ========================================================================
  const [mediaPipeReady, setMediaPipeReady] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [useRealDetection, setUseRealDetection] = useState(false);  // Toggle entre real/simulado

  // ========================================================================
  // REFERENCIAS
  // ========================================================================
  const cameraRef = useRef(null);
  const videoRef = useRef(null);

  // ========================================================================
  // HOOKS - MEDIAPIPE
  // ========================================================================
  const {
    isReady: mediaPipeIsReady,
    isDetecting: mediaPipeIsDetecting,
    startDetection: startMediaPipeDetection,
    stopDetection: stopMediaPipeDetection,
    getFrameBuffer,
    getStatus: getMediaPipeStatus,
  } = useMediaPipeDetection({
    videoRef,
    onKeypointsReady: (frameBuffer) => {
      // Cuando tenemos 24 frames, enviar al modelo TensorFlow.js
      handleKeypointsReady(frameBuffer);
    },
    onError: (error) => {
      console.error('Error MediaPipe:', error);
      Alert.alert('Error', 'Error en MediaPipe: ' + error.message);
    },
    enableDebug: true,
  });

  // ========================================================================
  // EFECTOS - INICIALIZACIÓN
  // ========================================================================

  /**
   * Inicializar modelo TensorFlow.js
   */
  useEffect(() => {
    const initializeDetection = async () => {
      try {
        setLoadingMessage('Cargando modelo TensorFlow.js...');
        wordDetectionService.setDebugMode(true);

        await wordDetectionService.loadModel();
        setIsModelReady(true);
        setLoadingMessage('Modelo cargado exitosamente');

        console.log('✅ Modelo TensorFlow cargado');
      } catch (error) {
        console.error('❌ Error inicializando TensorFlow:', error);
        setLoadingMessage('Error al cargar el modelo');
        Alert.alert(
          'Error',
          'No se pudo cargar el modelo de detección: ' + error.message,
          [{ text: 'OK' }]
        );
      }
    };

    initializeDetection();

    return () => {
      wordDetectionService.stopDetection();
    };
  }, []);

  /**
   * Inicializar MediaPipe cuando esté listo
   */
  useEffect(() => {
    if (mediaPipeIsReady) {
      setMediaPipeReady(true);
      console.log('✅ MediaPipe listo');
    }
  }, [mediaPipeIsReady]);

  /**
   * Pedir permisos de cámara
   */
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
    })();
  }, []);

  // ========================================================================
  // EFECTOS - LISTENERS
  // ========================================================================

  /**
   * Listener de eventos de detección TensorFlow.js
   */
  useEffect(() => {
    const handleDetectionResult = (result) => {
      if (result.isProcessing !== undefined) {
        setIsProcessing(result.isProcessing);
      }

      if (result.word && result.isValid) {
        setDetectedWord(result.word);
        setConfidence(result.confidence);
        console.log('🎯 Detección TensorFlow:', result.word, `(${Math.round(result.confidence * 100)}%)`);
      }

      if (result.detectionStarted) {
        setIsDetecting(true);
      }

      if (result.detectionStopped) {
        setIsDetecting(false);
      }

      if (result.modelError || result.detectionError) {
        Alert.alert('Error', result.modelError || result.detectionError);
      }
    };

    wordDetectionService.onDetection(handleDetectionResult);

    return () => {
      wordDetectionService.offDetection(handleDetectionResult);
    };
  }, []);

  // ========================================================================
  // MANEJADORES DE EVENTOS
  // ========================================================================

  /**
   * Cuando MediaPipe captura 24 frames, enviar al modelo
   */
  const handleKeypointsReady = async (frameBuffer) => {
    if (!useRealDetection || !frameBuffer || frameBuffer.length < 24) {
      return;
    }

    try {
      console.log('📊 Enviando', frameBuffer.length, 'frames a TensorFlow.js');

      // Enviar secuencia al modelo
      await wordDetectionService.detectFromKeypoints(frameBuffer);

      // TensorFlow.js notificará resultados vía callback
    } catch (error) {
      console.error('Error detectando keypoints:', error);
    }
  };

  /**
   * Toggle entre detección real (MediaPipe) y simulada
   */
  const toggleDetectionMode = () => {
    setUseRealDetection(!useRealDetection);

    if (!useRealDetection) {
      // Cambiar a detección real
      if (!mediaPipeReady) {
        Alert.alert('Error', 'MediaPipe aún no está listo');
        return;
      }
      startMediaPipeDetection();
    } else {
      // Cambiar a simulada
      stopMediaPipeDetection();
    }
  };

  /**
   * Iniciar detección
   */
  const startDetection = () => {
    if (!isModelReady) {
      Alert.alert(
        'Espera',
        'El modelo aún se está cargando. Por favor espera un momento.',
        [{ text: 'OK' }]
      );
      return;
    }

    wordDetectionService.startDetection();

    // Si usando detección real, iniciar MediaPipe
    if (useRealDetection) {
      startMediaPipeDetection();
    }
  };

  /**
   * Detener detección
   */
  const stopDetection = () => {
    wordDetectionService.stopDetection();
    if (useRealDetection) {
      stopMediaPipeDetection();
    }
  };

  /**
   * Confirmar detección
   */
  const confirmDetection = () => {
    if (detectedWord) {
      const newItem = {
        word: detectedWord,
        confidence: Math.round(confidence * 100),
        timestamp: Date.now(),
      };

      setHistory([newItem, ...history.slice(0, 9)]);
      setDetectedWord(null);
      setConfidence(0);

      setTimeout(() => {
        if (isModelReady) {
          wordDetectionService.startDetection();
          if (useRealDetection) {
            startMediaPipeDetection();
          }
        }
      }, 500);
    }
  };

  /**
   * Reintentar detección
   */
  const retryDetection = () => {
    setDetectedWord(null);
    setConfidence(0);
    wordDetectionService.smoothingBuffer = [];

    setTimeout(() => {
      if (isModelReady) {
        wordDetectionService.startDetection();
        if (useRealDetection) {
          startMediaPipeDetection();
        }
      }
    }, 500);
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (cameraPermission === null) {
    return <View />;
  }

  if (cameraPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Se necesita permiso de cámara para usar esta función
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Detección en Tiempo Real</Text>
          <Text style={styles.subtitle}>
            {useRealDetection ? '🟢 MediaPipe' : '⚪ Simulada'}
          </Text>
        </View>
        <TouchableOpacity onPress={toggleDetectionMode}>
          <Ionicons
            name={useRealDetection ? 'camera' : 'layers'}
            size={24}
            color={useRealDetection ? '#00FF88' : '#FFB800'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Video/Cámara */}
        {useRealDetection && Platform.OS === 'web' && (
          <View style={styles.cameraContainer}>
            <video
              ref={videoRef}
              style={styles.video}
              autoPlay
              playsInline
              width="100%"
              height="400"
            />
            {mediaPipeIsDetecting && (
              <View style={styles.detectionBadge}>
                <Text style={styles.detectionBadgeText}>
                  🖐️ Detectando manos...
                </Text>
              </View>
            )}
            <DetectionOverlay
              detectedLetter={detectedWord}
              confidence={confidence}
              isProcessing={isProcessing}
              type="word"
              isVisible={true}
            />
          </View>
        )}

        {useRealDetection && Platform.OS !== 'web' && (
          <View style={styles.cameraContainer}>
            <Camera
              ref={cameraRef}
              style={styles.camera}
              type={Camera.Constants.Type.front}
            />
            {mediaPipeIsDetecting && (
              <View style={styles.detectionBadge}>
                <Text style={styles.detectionBadgeText}>
                  🖐️ Detectando manos...
                </Text>
              </View>
            )}
            <DetectionOverlay
              detectedLetter={detectedWord}
              confidence={confidence}
              isProcessing={isProcessing}
              type="word"
              isVisible={true}
            />
          </View>
        )}

        {/* Card de resultado */}
        {(detectedWord || isProcessing) && (
          <>
            <DetectionResultCard
              word={detectedWord}
              confidence={confidence}
              isProcessing={isProcessing}
            />

            {detectedWord && !isProcessing && (
              <>
                <View style={styles.audioContainer}>
                  <AudioButton word={detectedWord} />
                </View>

                <View style={styles.feedbackContainer}>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={confirmDetection}
                  >
                    <Ionicons name="checkmark" size={28} color="#000" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={retryDetection}
                  >
                    <Ionicons name="refresh" size={28} color="#FFB800" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </>
        )}

        {/* Botón principal */}
        <View style={styles.mainControls}>
          <TouchableOpacity
            style={[
              styles.mainButton,
              isDetecting && styles.mainButtonActive,
              !isModelReady && styles.mainButtonDisabled,
            ]}
            onPress={isDetecting ? stopDetection : startDetection}
            disabled={!isModelReady}
          >
            <Ionicons
              name={isDetecting ? 'stop' : 'play'}
              size={40}
              color={isDetecting ? '#FFB800' : '#00FF88'}
            />
          </TouchableOpacity>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Ionicons
              name={isModelReady ? 'checkmark-circle' : 'hourglass'}
              size={20}
              color={isModelReady ? '#00FF88' : '#FFB800'}
            />
            <Text style={styles.statusText}>
              TensorFlow.js: {isModelReady ? 'Listo' : 'Cargando...'}
            </Text>
          </View>

          <View style={styles.statusItem}>
            <Ionicons
              name={mediaPipeReady ? 'checkmark-circle' : 'hourglass'}
              size={20}
              color={mediaPipeReady ? '#00FF88' : '#FFB800'}
            />
            <Text style={styles.statusText}>
              MediaPipe: {mediaPipeReady ? 'Listo' : 'Cargando...'}
            </Text>
          </View>
        </View>

        {/* Historial */}
        {history.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Detecciones Recientes</Text>
            <DetectionHistory history={history} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================================
// ESTILOS
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#CCCCCC',
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  cameraContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  video: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  detectionBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 255, 136, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  detectionBadgeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
  audioContainer: {
    marginBottom: 16,
  },
  feedbackContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  confirmButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00FF88',
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFB800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainControls: {
    alignItems: 'center',
    marginVertical: 20,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333333',
  },
  mainButtonActive: {
    backgroundColor: '#FFB800',
    borderColor: '#FFB800',
  },
  mainButtonDisabled: {
    opacity: 0.5,
  },
  statusContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  historyContainer: {
    marginBottom: 20,
  },
  historyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
});

export default WordDetectionScreen;
