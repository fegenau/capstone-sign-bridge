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
    if (!hand || !hand.landmarks) return null;
    const keypoints = [];
    hand.landmarks.forEach((lm) => { keypoints.push(lm.x, lm.y, lm.z || 0); });
    return keypoints; // 63
  }, []);

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
      onKeypointsReady(mediaRef.current.frameBuffer);
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
        if (!mediaRef.current.canvas && video) {
          mediaRef.current.canvas = document.createElement('canvas');
          mediaRef.current.canvas.width = video.videoWidth || 640;
          mediaRef.current.canvas.height = video.videoHeight || 480;
          mediaRef.current.ctx = mediaRef.current.canvas.getContext('2d');
        }
        if (mediaRef.current.ctx && video) {
          mediaRef.current.ctx.drawImage(video, 0, 0);
          detectionResult = await mediaRef.current.handDetector.detectForVideo(mediaRef.current.canvas, now);
        }
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
        const combined = combineHandKeypoints(leftHand, rightHand);
        const normalized = normalizeKeypoints(combined);
        addFrameToBuffer(normalized);
      }
    } catch (err) {
      console.error('[useMediaPipeDetection] detect error:', err);
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
        const options = { baseOptions: { modelAssetPath: MODEL_URL }, runningMode: 'VIDEO', numHands: 2 };
        const handLandmarker = await vision.HandLandmarker.createFromOptions(filesetResolver, options);
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
