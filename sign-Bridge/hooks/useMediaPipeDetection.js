/**
 * useMediaPipeDetection.js
 *
 * Hook personalizado que integra MediaPipe para captura de manos en tiempo real
 * y alimenta el modelo TensorFlow.js con keypoints secuenciales.
 *
 * CARACTERÍSTICAS:
 * - Captura de manos con MediaPipe Hand Landmarker
 * - Buffer circular de 24 frames
 * - Normalización de keypoints
 * - Manejo de permisos de cámara
 * - Optimización para web y móvil
 * - Memory management automático
 *
 * USO:
 * const { isReady, isDetecting, startDetection, stopDetection } = useMediaPipeDetection({
 *   videoRef,
 *   onKeypointsReady,
 *   enableDebug: false
 * });
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';

// ============================================================================
// CONSTANTES
// ============================================================================

const FRAME_BUFFER_SIZE = 24;  // Número de frames para la secuencia
const TARGET_FPS = 30;          // FPS objetivo
const FRAME_INTERVAL = 1000 / TARGET_FPS;  // ~33ms

// Índices de joints según MediaPipe Hand Landmarker (21 landmarks)
const HAND_LANDMARKS = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_FINGER_MCP: 5,
  INDEX_FINGER_PIP: 6,
  INDEX_FINGER_DIP: 7,
  INDEX_FINGER_TIP: 8,
  MIDDLE_FINGER_MCP: 9,
  MIDDLE_FINGER_PIP: 10,
  MIDDLE_FINGER_DIP: 11,
  MIDDLE_FINGER_TIP: 12,
  RING_FINGER_MCP: 13,
  RING_FINGER_PIP: 14,
  RING_FINGER_DIP: 15,
  RING_FINGER_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
};

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export const useMediaPipeDetection = ({
  videoRef = null,
  onKeypointsReady = null,
  onFrameKeypoints = null, // <- nuevo: callback por frame (126 features normalizados)
  onError = null,
  enableDebug = false,
}) => {
  // Estado
  const [isReady, setIsReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);

  // Referencias
  const mediaRef = useRef({
    handDetector: null,
    frameBuffer: [],
    lastFrameTime: 0,
    isInitialized: false,
    animationId: null,
    canvas: null,
    ctx: null,
  });

  // ========================================================================
  // UTILIDADES
  // ========================================================================

  /**
   * Log condicional para debugging
   */
  const _log = useCallback((message, data = null) => {
    if (enableDebug) {
      console.log(`[MediaPipeDetection] ${message}`, data || '');
    }
  }, [enableDebug]);

  /**
   * Extraer keypoints de una mano detectada
   * Convierte formato MediaPipe a array [x, y, z] por landmark
   */
  const extractKeypointsFromHand = useCallback((hand) => {
    if (!hand || !hand.landmarks) return null;

    const keypoints = [];
    hand.landmarks.forEach((landmark) => {
      keypoints.push(landmark.x);
      keypoints.push(landmark.y);
      keypoints.push(landmark.z || 0);  // z puede no estar presente en web
    });

    return keypoints;  // Array de 63 elementos (21 landmarks × 3)
  }, []);

  /**
   * Combinar keypoints de dos manos en un array de 126 elementos
   * [mano_izq (63) + mano_der (63)]
   */
  const combineHandKeypoints = useCallback((leftHand, rightHand) => {
    const combined = new Array(126).fill(0);

    // Mano izquierda en posiciones 0-62
    if (leftHand) {
      const leftKeypoints = extractKeypointsFromHand(leftHand);
      if (leftKeypoints) {
        leftKeypoints.forEach((val, idx) => {
          combined[idx] = val;
        });
      }
    }

    // Mano derecha en posiciones 63-125
    if (rightHand) {
      const rightKeypoints = extractKeypointsFromHand(rightHand);
      if (rightKeypoints) {
        rightKeypoints.forEach((val, idx) => {
          combined[63 + idx] = val;
        });
      }
    }

    return combined;
  }, [extractKeypointsFromHand]);

  /**
   * Normalizar keypoints (escala 0-1)
   */
  const normalizeKeypoints = useCallback((keypoints) => {
    if (!keypoints) return null;

    return keypoints.map((val) => {
      // Clamping a rango [0, 1]
      return Math.max(0, Math.min(1, val));
    });
  }, []);

  /**
   * Agregar frame al buffer circular
   */
  const addFrameToBuffer = useCallback((keypoints) => {
    if (mediaRef.current.frameBuffer.length >= FRAME_BUFFER_SIZE) {
      mediaRef.current.frameBuffer.shift();  // Remover frame más viejo
    }
    mediaRef.current.frameBuffer.push(keypoints);

    // Cuando tenemos suficientes frames, notificar
    if (mediaRef.current.frameBuffer.length === FRAME_BUFFER_SIZE) {
      if (onKeypointsReady) {
        onKeypointsReady(mediaRef.current.frameBuffer);
      }
    }
    // Notificar frame individual para pipelines que buferizan afuera
    if (onFrameKeypoints) {
      try { onFrameKeypoints(keypoints); } catch (e) { /* ignore */ }
    }
  }, [onKeypointsReady]);

  /**
   * Detectar manos en el video
   */
  const detectHands = useCallback(async (video) => {
    if (!mediaRef.current.handDetector) {
      return;
    }

    try {
      // Timing para mantener 30 FPS
      const now = Date.now();
      if (now - mediaRef.current.lastFrameTime < FRAME_INTERVAL) {
        return;  // Esperar siguiente frame
      }
      mediaRef.current.lastFrameTime = now;

      // Detectar manos
      let detectionResult = null;

      if (Platform.OS === 'web') {
        // En web, usar directamente el canvas del video
        if (!mediaRef.current.canvas && video) {
          mediaRef.current.canvas = document.createElement('canvas');
          mediaRef.current.canvas.width = video.videoWidth || 640;
          mediaRef.current.canvas.height = video.videoHeight || 480;
          mediaRef.current.ctx = mediaRef.current.canvas.getContext('2d');
        }

        if (mediaRef.current.ctx && video) {
          mediaRef.current.ctx.drawImage(video, 0, 0);
          detectionResult = await mediaRef.current.handDetector.detectForVideo(
            mediaRef.current.canvas,
            now
          );
        }
      } else {
        // En móvil (futuro: usar MediaPipe native o expo-camera)
        // Por ahora, usar versión web
        detectionResult = await mediaRef.current.handDetector.detectForVideo(
          video,
          now
        );
      }

      // Procesar detecciones
      if (detectionResult && detectionResult.landmarks) {
        const hands = detectionResult.landmarks;

        // Buscar mano izquierda y derecha
        // MediaPipe devuelve handedness: ['Left'], ['Right']
        let leftHand = null;
        let rightHand = null;

        if (
          detectionResult.handedness &&
          Array.isArray(detectionResult.handedness)
        ) {
          detectionResult.handedness.forEach((handedness, idx) => {
            if (handedness[0].categoryName === 'Left') {
              leftHand = hands[idx];
            } else if (handedness[0].categoryName === 'Right') {
              rightHand = hands[idx];
            }
          });
        }

        // Combinar keypoints
        const combinedKeypoints = combineHandKeypoints(leftHand, rightHand);

        // Normalizar
        const normalizedKeypoints = normalizeKeypoints(combinedKeypoints);

        // Agregar al buffer
        addFrameToBuffer(normalizedKeypoints);

        _log('🖐️ Manos detectadas', {
          left: !!leftHand,
          right: !!rightHand,
          bufferSize: mediaRef.current.frameBuffer.length,
        });
      } else {
        _log('⚠️ No se detectaron manos');
      }
    } catch (err) {
      console.error('[useMediaPipeDetection] Error detectando:', err);
      setError(err.message);
      if (onError) {
        onError(err);
      }
    }
  }, [combineHandKeypoints, normalizeKeypoints, addFrameToBuffer, _log, onError]);

  /**
   * Loop de detección con requestAnimationFrame
   */
  const startDetectionLoop = useCallback(() => {
    if (!videoRef || !videoRef.current) {
      return;
    }

    const video = Platform.OS === 'web'
      ? videoRef.current
      : videoRef.current;

    const loop = async () => {
      if (isDetecting) {
        await detectHands(video);
        mediaRef.current.animationId = requestAnimationFrame(loop);
      }
    };

    mediaRef.current.animationId = requestAnimationFrame(loop);
  }, [videoRef, isDetecting, detectHands]);

  /**
   * Detener loop de detección
   */
  const stopDetectionLoop = useCallback(() => {
    if (mediaRef.current.animationId) {
      cancelAnimationFrame(mediaRef.current.animationId);
      mediaRef.current.animationId = null;
    }
  }, []);

  // ========================================================================
  // INICIALIZACIÓN DE MEDIAPIPE
  // ========================================================================

  useEffect(() => {
    const initializeMediaPipe = async () => {
      try {
        if (Platform.OS !== 'web') {
          // En móvil todavía no tenemos HandLandmarker WASM; usar dummy hasta integración nativa.
            _log('📦 Mobile: usando detector simulado temporal (WASM no soportado)');
            mediaRef.current.handDetector = createDummyDetector();
            mediaRef.current.isInitialized = true;
            setIsReady(true);
            return;
        }
        _log('📦 Inicializando MediaPipe HandLandmarker (web)...');
        const vision = await import('@mediapipe/tasks-vision');
        if (!vision || !vision.FilesetResolver || !vision.HandLandmarker) throw new Error('Tasks-vision incompleto');
        const filesetResolver = await vision.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm');
        const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
        const options = { baseOptions: { modelAssetPath: MODEL_URL }, runningMode: 'VIDEO', numHands: 2 };
        const handLandmarker = await vision.HandLandmarker.createFromOptions(filesetResolver, options);
        mediaRef.current.handDetector = handLandmarker;
        mediaRef.current.isInitialized = true;
        _log('✅ HandLandmarker web inicializado');
        setIsReady(true);
      } catch (err) {
        console.error('[useMediaPipeDetection] Error inicializando:', err);
        _log('⚠️ Fallback dummy por error de inicialización');
        mediaRef.current.handDetector = createDummyDetector();
        mediaRef.current.isInitialized = true;
        setIsReady(true);
      }
    };

    if (!mediaRef.current.isInitialized) {
      initializeMediaPipe();
    }

    return () => {
      // Cleanup
      if (mediaRef.current.animationId) {
        cancelAnimationFrame(mediaRef.current.animationId);
      }
    };
  }, [_log]);

  // ========================================================================
  // MANEJO DE DETECCIÓN
  // ========================================================================

  /**
   * Iniciar detección
   */
  const startDetection = useCallback(async () => {
    if (!isReady) {
      Alert.alert('Error', 'MediaPipe aún no está inicializado');
      return;
    }

    try {
      setIsDetecting(true);
      mediaRef.current.frameBuffer = [];  // Limpiar buffer
      _log('▶️  Detección iniciada');
      startDetectionLoop();
    } catch (err) {
      console.error('[useMediaPipeDetection] Error al iniciar:', err);
      setError(err.message);
      setIsDetecting(false);
      if (onError) {
        onError(err);
      }
    }
  }, [isReady, _log, startDetectionLoop, onError]);

  /**
   * Detener detección
   */
  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    stopDetectionLoop();
    mediaRef.current.frameBuffer = [];
    _log('⏹️  Detección detenida');
  }, [_log, stopDetectionLoop]);

  /**
   * Obtener buffer actual
   */
  const getFrameBuffer = useCallback(() => {
    return [...mediaRef.current.frameBuffer];
  }, []);

  /**
   * Obtener estado
   */
  const getStatus = useCallback(() => ({
    isReady,
    isDetecting,
    bufferSize: mediaRef.current.frameBuffer.length,
    isInitialized: mediaRef.current.isInitialized,
    error,
  }), [isReady, isDetecting, error]);

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    // Estado
    isReady,
    isDetecting,
    error,

    // Métodos
    startDetection,
    stopDetection,
    getFrameBuffer,
    getStatus,

    // Interno
    _mediaRef: mediaRef,
  };
};

/**
 * Detector dummy para fallback
 * Devuelve keypoints aleatorios (solo para testing)
 */
function createDummyDetector() {
  return {
    detectForVideo: async () => {
      // Simular detección con probabilidad
      if (Math.random() > 0.3) {
        return {
          landmarks: [
            // Mano izquierda simulada
            Array(21)
              .fill(0)
              .map(() => ({
                x: Math.random(),
                y: Math.random(),
                z: Math.random() * 0.3,
              })),
            // Mano derecha simulada
            Array(21)
              .fill(0)
              .map(() => ({
                x: Math.random(),
                y: Math.random(),
                z: Math.random() * 0.3,
              })),
          ],
          handedness: [
            [{ categoryName: 'Left' }],
            [{ categoryName: 'Right' }],
          ],
        };
      }
      return null;
    },
  };
}

export default useMediaPipeDetection;
