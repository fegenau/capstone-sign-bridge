import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { speak as ttsSpeak } from '../utils/tts';
import useMediaPipeDetection from '../hooks/useMediaPipeDetection';
import useTfjsClassifier from '../hooks/useTfjsClassifier';
import PredictionSmoother from '../utils/smoothPrediction';
import { debounce } from '../utils/debounce';

export default function DetectScreen({ theme, textScale, ttsEnabled, confidenceThreshold = 0.6, smootherQueueLength = 5 }) {
  const videoRef = useRef(null);
  const [sequence, setSequence] = useState([]); // 24x126
  const [pred, setPred] = useState({ label: 'Listo', confidence: 0, isStable: false });
  const [fps, setFps] = useState(0);
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
  const [cameraStream, setCameraStream] = useState(null);

  // Smoothing and debouncing utilities
  const smootherRef = useRef(new PredictionSmoother(smootherQueueLength));
  const speakDebouncedRef = useRef(debounce((text) => {
    try { ttsSpeak(text, { language: 'es-CL', rate: 0.95 }); } catch (e) {}
  }, 800)); // 800ms debounce for TTS

  const { isReady, isDetecting, startDetection, stopDetection } = useMediaPipeDetection({
    videoRef,
    onKeypointsReady: (seq) => {
      console.log('[DetectScreen] Secuencia completa de 24 frames lista. Buffer:', {
        framesCount: seq.length,
        featuresDimension: seq[0]?.length || 0,
        firstFrameKeypointsPreview: seq[0]?.slice(0, 6) // Primeros 6 valores (2 puntos x,y,z)
      });
      setSequence(seq);
    },
    onFrameKeypoints: () => tickFps(),
    enableDebug: true, // Habilitar logs de MediaPipe
  });

  const { ready: modelReady, classify, error: modelError } = useTfjsClassifier();

  useEffect(() => {
    let active = true;
    if (sequence && sequence.length === 24) {
      (async () => {
        try {
          console.log('[DetectScreen] 📊 Iniciando clasificación de secuencia...');
          const startTime = performance.now();

          const rawPred = await classify(sequence);
          const inferenceTime = performance.now() - startTime;

          console.log('[DetectScreen] 🎯 Resultado bruto de clasificación:', {
            label: rawPred.label,
            confidence: rawPred.confidence,
            inferenceTimeMs: inferenceTime.toFixed(2)
          });

          if (active) {
            // Apply smoothing to raw prediction
            const smoothedPred = smootherRef.current.addPrediction(rawPred, confidenceThreshold);
            console.log('[DetectScreen] 🔄 Predicción después de suavizado:', {
              label: smoothedPred.label,
              confidence: smoothedPred.confidence,
              isStable: smoothedPred.isStable
            });
            setPred(smoothedPred);

            // Only speak if stable and above threshold
            if (ttsEnabled && smoothedPred.label && smoothedPred.confidence > confidenceThreshold && smoothedPred.isStable) {
              console.log('[DetectScreen] 🔊 Reproduciendo TTS para:', smoothedPred.label);
              speakDebouncedRef.current(smoothedPred.label);
            }
          }
        } catch (err) {
          console.error('[DetectScreen] ❌ Error durante clasificación:', err);
        }
      })();
    }
    return () => { active = false; };
  }, [sequence, classify, ttsEnabled, confidenceThreshold]);

  const tickFps = (() => {
    let last = Date.now(); let frames = 0;
    return () => {
      frames += 1; const now = Date.now();
      if (now - last >= 1000) { setFps(frames); frames = 0; last = now; }
    };
  })();

  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current && videoRef.current.tagName !== 'VIDEO') {
      // Crear elemento <video> para web si no existe
      const vid = document.createElement('video');
      vid.setAttribute('playsinline', '');
      vid.setAttribute('autoplay', '');
      vid.muted = true;
      vid.style.width = '100%';
      videoRef.current.appendChild(vid);
      videoRef.current = vid;
    }
  }, []);

  const startCamera = async () => {
    if (Platform.OS === 'web') {
      try {
        console.log('[DetectScreen] 📷 Solicitando acceso a cámara con facingMode:', facingMode);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode },
          audio: false
        });
        setCameraStream(stream);
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        console.log('[DetectScreen] ✅ Cámara iniciada correctamente');
      } catch (err) {
        console.error('[DetectScreen] ❌ Error al acceder a cámara:', err);
        alert('Error al acceder a la cámara: ' + err.message);
      }
    }
    startDetection();
  };

  const toggleCamera = async () => {
    try {
      console.log('[DetectScreen] 🔄 Alternando cámara...');

      // Detener detección y stream actual
      stopDetection();
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => {
          track.stop();
          console.log('[DetectScreen] ✋ Track de cámara detenido:', track.kind);
        });
        setCameraStream(null);
      }

      // Cambiar facing mode
      const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
      setFacingMode(newFacingMode);
      console.log('[DetectScreen] 🔄 Modo de cámara cambiado a:', newFacingMode);

      // Iniciar nueva cámara
      setTimeout(() => {
        startCamera();
      }, 500);
    } catch (err) {
      console.error('[DetectScreen] ❌ Error al cambiar cámara:', err);
    }
  };

  return (
    <View style={[styles.wrap, { backgroundColor: theme.bg }]}>
      {/* Video Container with Camera Toggle Button */}
      <View style={styles.videoContainer}>
        <View style={styles.videoWrap}>
          {Platform.OS === 'web' ? (
            <View ref={videoRef} accessibilityRole="image" accessibilityLabel="Cámara en vivo" style={{ width: '100%', height: '100%' }} />
          ) : (
            <Text style={{ color: theme.fg }}>Cámara móvil se habilitará en futuras versiones.</Text>
          )}
        </View>

        {/* Camera Toggle Button - Top Right Corner */}
        {isDetecting && Platform.OS === 'web' && (
          <Pressable
            onPress={toggleCamera}
            style={[styles.cameraToggleBtn, { backgroundColor: theme.accent }]}
            accessibilityLabel="Cambiar cámara"
          >
            <Text style={styles.cameraToggleIcon}>🔄</Text>
          </Pressable>
        )}
      </View>

      {/* HUD Section */}
      <View style={styles.hud}>
        <View style={styles.hudHeader}>
          <Text style={[styles.hudLabel, { color: theme.fg, fontSize: 18 * textScale }]}>📍 Seña Detectada:</Text>
          {pred.isStable && (
            <Text style={[styles.stableIndicator, { color: theme.accent }]}>
              ✅ Estable
            </Text>
          )}
        </View>

        <Text style={[styles.pred, { color: pred.isStable ? theme.accent : theme.fg, fontSize: 32 * textScale, fontWeight: '900' }]}>
          {pred.label || '👆 Detectando…'}
        </Text>

        {/* Confidence Bar */}
        <View style={styles.confidenceContainer}>
          <View style={styles.confidenceBarBg}>
            <View
              style={[
                styles.confidenceBarFill,
                {
                  width: `${Math.min(100, pred.confidence * 100)}%`,
                  backgroundColor: pred.confidence > 0.8 ? '#10b981' : pred.confidence > 0.6 ? theme.accent : '#f59e0b'
                }
              ]}
            />
          </View>
          <Text style={[styles.confText, { color: theme.fg, fontSize: 13 * textScale }]}>
            📊 Confianza: {(pred.confidence * 100).toFixed(1)}%
          </Text>
        </View>

        {/* Detailed Debug Information */}
        <View style={styles.debugContainer}>
          <Text style={[styles.meta, { color: theme.fg, fontSize: 11 * textScale }]}>
            ⚡ FPS: {fps}
          </Text>
          <Text style={[styles.meta, { color: theme.fg, fontSize: 11 * textScale }]}>
            📦 Buffer: {sequence?.length || 0}/24 frames
          </Text>
          <Text style={[styles.meta, { color: theme.fg, fontSize: 11 * textScale }]}>
            {modelReady ? '✓ Modelo listo' : '⏳ Cargando modelo...'}
          </Text>
        </View>

        {modelError && (
          <Text style={[styles.errorText, { color: '#ef4444', fontSize: 12 * textScale }]}>
            ⚠️ Error: {modelError}
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {!isDetecting ? (
          <Pressable
            onPress={startCamera}
            style={[styles.btn, styles.btnPrimary, { backgroundColor: theme.accent }]}
            accessibilityLabel="Iniciar detección"
          >
            <Text style={[styles.btnText, { color: '#000', fontSize: 16 * textScale }]}>▶️ Iniciar</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={stopDetection}
            style={[styles.btn, styles.btnDanger, { backgroundColor: '#ef4444' }]}
            accessibilityLabel="Detener detección"
          >
            <Text style={[styles.btnText, { color: '#fff', fontSize: 16 * textScale }]}>⏹️ Detener</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 12, gap: 12 },
  videoContainer: { flex: 1, position: 'relative', borderRadius: 16, overflow: 'hidden' },
  videoWrap: { flex: 1, borderRadius: 16, overflow: 'hidden', backgroundColor: '#222', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)' },
  cameraToggleBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  cameraToggleIcon: { fontSize: 28, fontWeight: '700' },
  hud: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    gap: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)'
  },
  hudHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  hudLabel: { fontWeight: '800', letterSpacing: 0.5, fontSize: 16 },
  stableIndicator: { fontWeight: '700', fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: 'rgba(34,197,94,0.2)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.4)' },
  pred: { fontWeight: '900', marginVertical: 6, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  confidenceContainer: { gap: 8, marginVertical: 6 },
  confidenceBarBg: { height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)' },
  confidenceBarFill: { height: '100%', borderRadius: 7, transition: 'width 150ms ease-out' },
  confText: { fontWeight: '700', opacity: 0.95, fontSize: 12, marginLeft: 4 },
  debugContainer: { gap: 6, marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  meta: { opacity: 0.75, marginTop: 2, fontWeight: '500', fontSize: 11 },
  errorText: { fontWeight: '700', marginTop: 10, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  actions: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  btn: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  btnPrimary: { elevation: 6, shadowOpacity: 0.3 },
  btnDanger: { elevation: 6, shadowOpacity: 0.3 },
  btnText: { fontWeight: '800', letterSpacing: 0.5, textAlign: 'center' }
});
