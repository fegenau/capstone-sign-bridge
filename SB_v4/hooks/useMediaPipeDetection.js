// Copia adaptada desde sign-Bridge/hooks/useMediaPipeDetection.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as vision from '@mediapipe/tasks-vision';

const FRAME_BUFFER_SIZE = 24;
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

export const useMediaPipeDetection = ({
  videoRef = null,
  onKeypointsReady = null,
  onFrameKeypoints = null,
  onError = null,
  enableDebug = false,
}) => {
  const [isReady, setIsReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);

  const mediaRef = useRef({
    handDetector: null,
    frameBuffer: [],
    lastFrameTime: 0,
    isInitialized: false,
    animationId: null,
    canvas: null,
    ctx: null,
  });

  const _log = useCallback((message, data = null) => {
    if (enableDebug) console.log(`[MediaPipeDetection] ${message}`, data || '');
  }, [enableDebug]);

  const extractKeypointsFromHand = useCallback((hand) => {
    // MediaPipe HandLandmarker returns: landmarks is NormalizedLandmark[][]
    // Each hand is an array of 21 NormalizedLandmark objects
    // Each landmark has: { x: number, y: number, z: number, visibility?: number }

    if (!hand) {
      _log('⚠️ Hand is null/undefined');
      return null;
    }

    let landmarks = null;

    // Case 1: hand is the array of landmarks directly (most common with MediaPipe)
    if (Array.isArray(hand)) {
      landmarks = hand;
    }
    // Case 2: hand is a wrapped object with .landmarks property
    else if (hand.landmarks && Array.isArray(hand.landmarks)) {
      landmarks = hand.landmarks;
    }

    if (!landmarks || landmarks.length === 0) {
      _log('⚠️ No landmarks found or landmarks array is empty');
      return null;
    }

    const keypoints = [];
    let validCount = 0;

    // Extract all 21 landmarks
    for (let idx = 0; idx < landmarks.length; idx++) {
      const lm = landmarks[idx];

      // Check if landmark has valid x, y coordinates
      if (lm && typeof lm.x === 'number' && typeof lm.y === 'number') {
        const x = lm.x;  // Already a number, no need for parseFloat
        const y = lm.y;
        const z = (typeof lm.z === 'number') ? lm.z : 0;

        keypoints.push(x, y, z);
        validCount++;
      }
    }

    if (validCount === 0) {
      console.warn('[MediaPipeDetection] ❌ No valid landmarks extracted from hand. First landmark structure:', lm);
      return null;
    }

    _log(`✅ Extracted ${validCount}/21 landmarks, total ${keypoints.length} coordinate values`);
    return keypoints; // 63 values (21 landmarks × 3 coords)
  }, [_log]);

  const combineHandKeypoints = useCallback((leftHand, rightHand) => {
    const combined = new Array(126).fill(0);
    if (leftHand) {
      const l = extractKeypointsFromHand(leftHand);
      if (l) l.forEach((v, i) => { combined[i] = v; });
    }
    if (rightHand) {
      const r = extractKeypointsFromHand(rightHand);
      if (r) r.forEach((v, i) => { combined[63 + i] = v; });
    }
    return combined;
  }, [extractKeypointsFromHand]);

  const normalizeKeypoints = useCallback((kps) => {
    if (!kps) return null;
    return kps.map((v) => Math.max(0, Math.min(1, v)));
  }, []);

  const addFrameToBuffer = useCallback((kps) => {
    if (mediaRef.current.frameBuffer.length >= FRAME_BUFFER_SIZE) mediaRef.current.frameBuffer.shift();
    mediaRef.current.frameBuffer.push(kps);

    if (mediaRef.current.frameBuffer.length === FRAME_BUFFER_SIZE && onKeypointsReady) {
      console.log('[useMediaPipeDetection] ✅ Buffer completo (24 frames). Keypoints promedio:', {
        minValue: Math.min(...mediaRef.current.frameBuffer.flat()),
        maxValue: Math.max(...mediaRef.current.frameBuffer.flat()),
        avgValue: (mediaRef.current.frameBuffer.flat().reduce((a, b) => a + b, 0) / (24 * 126)).toFixed(3)
      });
      // CRITICAL: Make a copy of the buffer before clearing it
      const bufferCopy = [...mediaRef.current.frameBuffer];
      // Clear buffer for next sequence - IMPORTANT!
      mediaRef.current.frameBuffer = [];
      // Send the completed buffer to parent component
      onKeypointsReady(bufferCopy);
    }
    if (onFrameKeypoints) { try { onFrameKeypoints(kps); } catch(e) {} }
  }, [onKeypointsReady, onFrameKeypoints]);

  const detectHands = useCallback(async (video) => {
    if (!mediaRef.current.handDetector) return;
    try {
      const now = Date.now();
      if (now - mediaRef.current.lastFrameTime < FRAME_INTERVAL) return;
      mediaRef.current.lastFrameTime = now;

      let detectionResult = null;
      if (Platform.OS === 'web') {
        // Check if video has valid dimensions and is playing
        if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
          _log(`⚠️ Video not ready: width=${video?.videoWidth}, height=${video?.videoHeight}, readyState=${video?.readyState}`);
          return;
        }

        // Critical: Check if video is ready to read frames
        if (video.readyState < 2) {
          // readyState: 0=HAVE_NOTHING, 1=HAVE_METADATA, 2=HAVE_CURRENT_DATA, 3=HAVE_FUTURE_DATA, 4=HAVE_ENOUGH_DATA
          _log(`⚠️ Video not ready to read: readyState=${video.readyState} (need >= 2)`);
          return;
        }

        // Pass video element DIRECTLY to MediaPipe (not canvas)
        // MediaPipe can read frames directly from video elements on web
        detectionResult = await mediaRef.current.handDetector.detectForVideo(video, now);
      } else {
        detectionResult = await mediaRef.current.handDetector.detectForVideo(video, now);
      }

      if (detectionResult && detectionResult.landmarks) {
        const hands = detectionResult.landmarks;
        let leftHand = null; let rightHand = null;

        if (detectionResult.handedness && Array.isArray(detectionResult.handedness)) {
          detectionResult.handedness.forEach((h, idx) => {
            if (h[0].categoryName === 'Left') leftHand = hands[idx];
            else if (h[0].categoryName === 'Right') rightHand = hands[idx];
          });
        }

        // Log de manos detectadas
        const handsDetected = `${leftHand ? 'L' : '-'}${rightHand ? 'R' : '-'}`;
        _log(`Manos detectadas: ${handsDetected}`, {
          handCount: hands.length,
          hasLeftHand: !!leftHand,
          hasRightHand: !!rightHand
        });

        // Debug una sola vez - Ver estructura REAL del resultado
        if (hands.length > 0 && !mediaRef.current._debugLogged) {
          mediaRef.current._debugLogged = true;
          const firstHand = hands[0];
          const isArray = Array.isArray(firstHand);
          const firstLandmark = isArray ? firstHand[0] : null;
          console.log('[MediaPipeDetection] 🔍 MediaPipe Detection Structure:', {
            detectionResultKeys: Object.keys(detectionResult),
            handsCount: hands.length,
            firstHandIsArray: isArray,
            firstHandLength: isArray ? firstHand.length : 'N/A',
            firstLandmarkKeys: firstLandmark ? Object.keys(firstLandmark) : 'N/A',
            firstLandmarkValues: firstLandmark ? { x: firstLandmark.x, y: firstLandmark.y, z: firstLandmark.z, visibility: firstLandmark.visibility } : 'N/A',
            firstHandJSON: JSON.stringify(firstHand).substring(0, 300)
          });
        }

        const combined = combineHandKeypoints(leftHand, rightHand);
        const normalized = normalizeKeypoints(combined);

        // Verificar valores antes de agregar al buffer
        const minVal = Math.min(...normalized);
        const maxVal = Math.max(...normalized);
        if (minVal > 0 || maxVal > 0) {
          _log(`✅ Keypoints válidos agregados: min=${minVal.toFixed(3)}, max=${maxVal.toFixed(3)}`);
        } else {
          console.warn('[MediaPipeDetection] ⚠️ Todos los keypoints son 0!');
        }

        addFrameToBuffer(normalized);
      } else {
        _log('No se detectaron manos en este frame');
      }
    } catch (err) {
      console.error('[useMediaPipeDetection] ❌ Error en detección:', err);
      setError(err.message);
      onError && onError(err);
    }
  }, [combineHandKeypoints, normalizeKeypoints, addFrameToBuffer, onError]);

  const startDetectionLoop = useCallback(() => {
    if (!videoRef || !videoRef.current) return;
    const video = videoRef.current;
    const loop = async () => {
      if (isDetecting) {
        await detectHands(video);
        mediaRef.current.animationId = requestAnimationFrame(loop);
      }
    };
    mediaRef.current.animationId = requestAnimationFrame(loop);
  }, [videoRef, isDetecting, detectHands]);

  const stopDetectionLoop = useCallback(() => {
    if (mediaRef.current.animationId) cancelAnimationFrame(mediaRef.current.animationId);
    mediaRef.current.animationId = null;
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        if (Platform.OS !== 'web') {
          mediaRef.current.handDetector = createDummyDetector();
          mediaRef.current.isInitialized = true;
          setIsReady(true);
          return;
        }
        // Usar import estático en lugar de dinámico para evitar problemas con Metro
        // Intentar múltiples URLs para WASM - Local primero, luego CDN como fallback
        let filesetResolver;
        const wasmPaths = [
          '/wasm',  // Local - Intenta primero
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm',
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm',
        ];

        for (const wasmPath of wasmPaths) {
          try {
            filesetResolver = await vision.FilesetResolver.forVisionTasks(wasmPath);
            console.log('[useMediaPipeDetection] WASM loaded from:', wasmPath);
            break;
          } catch (e) {
            console.warn('[useMediaPipeDetection] Failed to load WASM from:', wasmPath, e.message);
          }
        }

        if (!filesetResolver) {
          throw new Error('No se pudo cargar WASM de MediaPipe');
        }
        const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
        const options = {
          baseOptions: { modelAssetPath: MODEL_URL },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.3,  // Lower threshold for better detection
          minHandPresenceConfidence: 0.3,
          minTrackingConfidence: 0.3
        };
        const handLandmarker = await vision.HandLandmarker.createFromOptions(filesetResolver, options);
        console.log('[useMediaPipeDetection] ✅ HandLandmarker initialized with options:', options);
        mediaRef.current.handDetector = handLandmarker;
        mediaRef.current.isInitialized = true;
        setIsReady(true);
      } catch (err) {
        console.error('[useMediaPipeDetection] init error:', err);
        mediaRef.current.handDetector = createDummyDetector();
        mediaRef.current.isInitialized = true;
        setIsReady(true);
      }
    };
    if (!mediaRef.current.isInitialized) initialize();
    return () => { if (mediaRef.current.animationId) cancelAnimationFrame(mediaRef.current.animationId); };
  }, []);

  const startDetection = useCallback(async () => {
    if (!isReady) { Alert.alert('Error', 'MediaPipe aún no está listo'); return; }
    try {
      setIsDetecting(true);
      mediaRef.current.frameBuffer = [];
      startDetectionLoop();
    } catch (err) {
      console.error('[useMediaPipeDetection] start error:', err);
      setError(err.message);
      setIsDetecting(false);
      onError && onError(err);
    }
  }, [isReady, startDetectionLoop, onError]);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    stopDetectionLoop();
    mediaRef.current.frameBuffer = [];
  }, [stopDetectionLoop]);

  const getFrameBuffer = useCallback(() => ([...mediaRef.current.frameBuffer]), []);
  const getStatus = useCallback(() => ({ isReady, isDetecting, bufferSize: mediaRef.current.frameBuffer.length, error }), [isReady, isDetecting, error]);

  return { isReady, isDetecting, error, startDetection, stopDetection, getFrameBuffer, getStatus, _mediaRef: mediaRef };
};

function createDummyDetector() {
  return {
    detectForVideo: async () => {
      if (Math.random() > 0.3) {
        return {
          landmarks: [
            Array(21).fill(0).map(() => ({ x: Math.random(), y: Math.random(), z: Math.random() * 0.3 })),
            Array(21).fill(0).map(() => ({ x: Math.random(), y: Math.random(), z: Math.random() * 0.3 })),
          ],
          handedness: [[{ categoryName: 'Left' }],[{ categoryName: 'Right' }]],
        };
      }
      return null;
    },
  };
}

export default useMediaPipeDetection;
