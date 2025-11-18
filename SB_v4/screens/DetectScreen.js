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

  // Smoothing and debouncing utilities
  const smootherRef = useRef(new PredictionSmoother(smootherQueueLength));
  const speakDebouncedRef = useRef(debounce((text) => {
    try { ttsSpeak(text, { language: 'es-CL', rate: 0.95 }); } catch (e) {}
  }, 800)); // 800ms debounce for TTS

  const { isReady, isDetecting, startDetection, stopDetection } = useMediaPipeDetection({
    videoRef,
    onKeypointsReady: (seq) => setSequence(seq),
    onFrameKeypoints: () => tickFps(),
  });

  const { ready: modelReady, classify } = useTfjsClassifier();

  useEffect(() => {
    let active = true;
    if (sequence && sequence.length === 24) {
      (async () => {
        const rawPred = await classify(sequence);
        if (active) {
          // Apply smoothing to raw prediction
          const smoothedPred = smootherRef.current.addPrediction(rawPred, confidenceThreshold);
          setPred(smoothedPred);

          // Only speak if stable and above threshold
          if (ttsEnabled && smoothedPred.label && smoothedPred.confidence > confidenceThreshold && smoothedPred.isStable) {
            speakDebouncedRef.current(smoothedPred.label);
          }
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
    startDetection();
  };

  return (
    <View style={[styles.wrap, { backgroundColor: theme.bg }]}> 
      <View style={styles.videoWrap}>
        {Platform.OS === 'web' ? (
          <View ref={videoRef} accessibilityRole="image" accessibilityLabel="Cámara en vivo" style={{ width: '100%', height: '100%' }} />
        ) : (
          <Text style={{ color: theme.fg }}>Cámara móvil se habilitará en futuras versiones.</Text>
        )}
      </View>

      <View style={styles.hud}>
        <View style={styles.hudHeader}>
          <Text style={[styles.hudLabel, { color: theme.fg, fontSize: 18 * textScale }]}>Seña Detectada:</Text>
          {pred.isStable && <Text style={[styles.stableIndicator, { color: theme.accent }]}>✓ Estable</Text>}
        </View>
        <Text style={[styles.pred, { color: pred.isStable ? theme.accent : theme.fg, fontSize: 28 * textScale, fontWeight: '900' }]}>
          {pred.label || 'Detectando…'}
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
            Confianza: {(pred.confidence * 100).toFixed(1)}%
          </Text>
        </View>

        <Text style={[styles.meta, { color: theme.fg, fontSize: 11 * textScale }]}>
          FPS: {fps} | Frames: {sequence?.length || 0}/24 | Modelo: {modelReady ? '✓ OK' : 'Cargando…'}
        </Text>
      </View>

      <View style={styles.actions}>
        {!isDetecting ? (
          <Pressable onPress={startCamera} style={[styles.btn, { backgroundColor: theme.accent }]}><Text style={[styles.btnText, { color: '#000' }]}>Iniciar</Text></Pressable>
        ) : (
          <Pressable onPress={stopDetection} style={[styles.btn, { backgroundColor: '#ef4444' }]}><Text style={[styles.btnText, { color: '#fff' }]}>Detener</Text></Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 12, gap: 12 },
  videoWrap: { flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: '#222' },
  hud: { padding: 16, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.7)', gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  hudHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  hudLabel: { fontWeight: '800', letterSpacing: 1 },
  stableIndicator: { fontWeight: '700', fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, backgroundColor: 'rgba(0,255,136,0.2)' },
  pred: { fontWeight: '900', marginVertical: 4 },
  confidenceContainer: { gap: 6, marginVertical: 4 },
  confidenceBarBg: { height: 24, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  confidenceBarFill: { height: '100%', borderRadius: 4, transition: 'width 100ms ease-out' },
  confText: { fontWeight: '600', opacity: 0.9 },
  meta: { opacity: 0.7, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  btn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  btnText: { fontWeight: '800', letterSpacing: 1 }
});
