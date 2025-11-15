import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export default function SimpleTestScreen() {
  const videoRef = useRef<any>(null);
  const [cameraStatus, setCameraStatus] = useState('📹 Iniciando...');
  const [modelStatus, setModelStatus] = useState('🧠 Esperando...');
  const [bufferCount, setBufferCount] = useState(0);
  const [backend, setBackend] = useState('--');
  const [prediction, setPrediction] = useState('--');
  const [confidence, setConfidence] = useState(0);

  const modelRef = useRef<any>(null);
  const labelsRef = useRef<string[]>([]);
  const frameBuffer = useRef<number[][]>([]);
  const MAX_FRAMES = 24;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setCameraStatus('❌ Solo funciona en web');
      return;
    }

    // 1. Iniciar cámara
    const startCamera = async () => {
      try {
        setCameraStatus('📹 Solicitando permisos...');
        const stream = await (navigator as any).mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraStatus('📹 ✅ Activa');
        }
      } catch (err: any) {
        setCameraStatus(`📹 ❌ ${err.message}`);
      }
    };

    // 2. Cargar modelo
    const loadModel = async () => {
      try {
        setModelStatus('🧠 Cargando TF.js...');
        // @ts-ignore
        const tf = await import('@tensorflow/tfjs');
        await tf.ready();
        setBackend(tf.getBackend());

        setModelStatus('🧠 Cargando modelo...');
        modelRef.current = await tf.loadLayersModel('/assets/ml/model.json');

        const labelsResp = await fetch('/assets/ml/label_encoder.json');
        const labelsData = await labelsResp.json();
        labelsRef.current = labelsData.classes || labelsData;

        setModelStatus(`🧠 ✅ Listo (${labelsRef.current.length} clases)`);

        // Iniciar loop de frames dummy
        captureLoop();
      } catch (err: any) {
        setModelStatus(`🧠 ❌ ${err.message}`);
      }
    };

    // 3. Loop de captura (dummy data por ahora)
    const captureLoop = () => {
      const interval = setInterval(async () => {
        if (!modelRef.current) return;

        // Frame dummy: 126 valores random
        const dummyFrame = Array(126).fill(0).map(() => Math.random());
        frameBuffer.current.push(dummyFrame);
        if (frameBuffer.current.length > MAX_FRAMES) frameBuffer.current.shift();
        
        setBufferCount(frameBuffer.current.length);

        // Predecir cuando tenemos 24 frames
        if (frameBuffer.current.length === MAX_FRAMES) {
          try {
            // @ts-ignore
            const tf = await import('@tensorflow/tfjs');
            const input = tf.tensor3d([frameBuffer.current], [1, MAX_FRAMES, 126]);
            const output = modelRef.current.predict(input);
            const probs = await output.data();

            let maxIdx = 0;
            let maxVal = probs[0];
            for (let i = 1; i < probs.length; i++) {
              if (probs[i] > maxVal) { maxVal = probs[i]; maxIdx = i; }
            }

            setPrediction(labelsRef.current[maxIdx] || `Clase ${maxIdx}`);
            setConfidence(maxVal);

            input.dispose();
            output.dispose();
          } catch (err) {
            console.error('Prediction error:', err);
          }
        }
      }, 100); // cada 100ms

      return () => clearInterval(interval);
    };

    startCamera();
    loadModel();
  }, []);

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Esta pantalla solo funciona en web</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <video
        ref={videoRef}
        style={styles.video}
        autoPlay
        playsInline
        muted
      />
      <View style={styles.overlay}>
        <Text style={styles.title}>🤟 SignBridge Test Simple</Text>
        <Text style={styles.status}>{cameraStatus}</Text>
        <Text style={styles.status}>{modelStatus}</Text>
        <Text style={styles.status}>📊 Buffer: {bufferCount}/{MAX_FRAMES}</Text>
        <Text style={styles.status}>⚙️ Backend: {backend}</Text>
        <View style={styles.predictionBox}>
          <Text style={styles.prediction}>{prediction}</Text>
          <Text style={styles.confidence}>Confianza: {(confidence * 100).toFixed(1)}%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: { 
    position: 'absolute' as any, 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover' as any 
  },
  overlay: { 
    position: 'absolute', 
    top: 20, 
    left: 20, 
    right: 20, 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    padding: 16, 
    borderRadius: 12,
    maxWidth: 400,
  },
  title: { color: '#4ade80', fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  status: { color: '#fff', fontSize: 14, marginVertical: 4, padding: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4 },
  predictionBox: { marginTop: 16, padding: 12, backgroundColor: 'rgba(74,222,128,0.2)', borderRadius: 8 },
  prediction: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  confidence: { color: '#a3a3a3', fontSize: 14, textAlign: 'center', marginTop: 4 },
  error: { color: '#ef4444', fontSize: 16, textAlign: 'center' },
});
