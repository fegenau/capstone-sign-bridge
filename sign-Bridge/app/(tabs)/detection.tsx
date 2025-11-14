import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
// @ts-ignore: JS hook
import useMediaPipeDetection from '../../hooks/useMediaPipeDetection';
import { getClassifier } from '../../src/ml/signMovementClassifier';
import SignDetectionOverlay from '../../src/components/SignDetectionOverlay';

export default function DetectionTab() {
  const [permission, requestPermission] = useCameraPermissions();
  const [prediction, setPrediction] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const classifier = getClassifier();
  const rafRef = useRef<number | null>(null);
  const cameraRef = useRef<any>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [permissionInfo, setPermissionInfo] = useState<any>(null);
  const [backendInfo, setBackendInfo] = useState<string>('');
  const [detectionActive, setDetectionActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Cargar modelo al inicio
  useEffect(() => {
    classifier.load().then(() => {
      console.log('[Detection] Modelo cargado');
    }).catch((e) => console.error('[Detection] load error', e));
  }, [classifier]);

  // Start predict loop using rAF to avoid blocking UI thread
  const predictLoop = useCallback(async () => {
    if (classifier.canPredict()) {
      const res = await classifier.predict();
      if (res) {
        setPrediction(res.label);
        setConfidence(res.confidence);
      }
    }
    rafRef.current = requestAnimationFrame(predictLoop);
  }, [classifier]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(predictLoop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [predictLoop]);

  // MediaPipe detection hook (web ready; on native it falls back to dummy)
  const { isReady, isDetecting, startDetection, stopDetection } = (useMediaPipeDetection as unknown as (
    opts: {
      videoRef?: any;
      onKeypointsReady?: ((frames: number[][]) => void) | null;
      onFrameKeypoints?: ((features126: number[]) => void) | null;
      onError?: ((e: any) => void) | null;
      enableDebug?: boolean;
    }
  ) => any)({
    videoRef: cameraRef,
    onFrameKeypoints: (features126: number[]) => {
      classifier.pushFrame(features126);
      setFrameCount((f) => (f < 24 ? f + 1 : 24));
    },
    enableDebug: true,
  });

  // Start/stop MediaPipe detection loop when ready
  useEffect(() => {
    if (isReady && !isDetecting) {
      startDetection?.();
      setDetectionActive(true);
    } else if (!isReady) {
      setDetectionActive(false);
    }
    return () => {
      if (isDetecting) stopDetection?.();
    };
  }, [isReady, isDetecting, startDetection, stopDetection]);

  // Request camera permission on mount
  useEffect(() => {
    setPermissionInfo(permission);
    if (!permission || !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Poll backend info (tf backend available after model load)
  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const tf = require('@tensorflow/tfjs');
      setBackendInfo(tf.getBackend());
    } catch {/* ignore */}
  }, [prediction, frameCount]);

  // Initialize camera on web using getUserMedia
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const initCamera = async () => {
      try {
        console.log('[Camera] Inicializando cámara en web...');
        const constraints = {
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (cameraRef.current) {
          cameraRef.current.srcObject = stream;
          cameraRef.current.onloadedmetadata = () => {
            console.log('[Camera] Video stream ready');
            setCameraReady(true);
          };
          await cameraRef.current.play().catch((e: any) => {
            console.error('[Camera] Play error:', e);
          });
        }
      } catch (err: any) {
        const errorMsg = err.message || String(err);
        console.error('[Camera] Error inicializando:', errorMsg);
        setCameraError(errorMsg);
      }
    };

    initCamera();

    return () => {
      if (cameraRef.current?.srcObject) {
        const tracks = (cameraRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
      }
    };
  }, []);

  if (!permission?.granted) {
    return (
      <View style={styles.center}> 
        <Text style={styles.perm}>Concede permisos de cámara…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <video
          ref={cameraRef}
          style={styles.camera}
          autoPlay
          playsInline
          muted
        />
      ) : (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          onCameraReady={() => { console.log('[Camera] ready'); setCameraReady(true); }}
          onMountError={(e) => console.error('[Camera] mount error', e)}
        />
      )}
      <SignDetectionOverlay prediction={prediction} confidence={confidence} frameCount={frameCount} />
      <View style={styles.debugBox} pointerEvents="none">
        <Text style={styles.debugTitle}>DEBUG</Text>
        <Text style={styles.debugLine}>Permiso: {permissionInfo?.status || 'unknown'}</Text>
        <Text style={styles.debugLine}>CameraReady: {cameraReady ? 'yes' : 'no'}</Text>
        <Text style={styles.debugLine}>Detección: {detectionActive ? 'activa' : 'inactiva'}</Text>
        <Text style={styles.debugLine}>Frames buffer: {frameCount}</Text>
        <Text style={styles.debugLine}>Backend TF: {backendInfo}</Text>
        <Text style={styles.debugLine}>Predicción: {prediction || '—'}</Text>
        <Text style={styles.debugLine}>Confianza: {(confidence * 100).toFixed(1)}%</Text>
        {cameraError && <Text style={styles.debugError}>❌ {cameraError}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', objectFit: 'cover' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  perm: { color: '#fff' },
  debugBox: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 6, maxWidth: 220 },
  debugTitle: { color: '#0f0', fontWeight: '700', marginBottom: 4, fontSize: 12 },
  debugLine: { color: '#fff', fontSize: 11 },
  debugError: { color: '#ff4444', fontSize: 11, marginTop: 4 },
});
