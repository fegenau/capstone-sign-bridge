import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export default function CameraTestTab() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState('Iniciando...');
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setStatus('Solo web (RN usa expo-camera)');
      return;
    }

    const startCamera = async () => {
      try {
        setStatus('Solicitando permisos...');
        const constraints = {
          video: { 
            facingMode: 'user', 
            width: { ideal: 640 }, 
            height: { ideal: 480 } 
          }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setStatus('Stream obtenido, aplicando a video...');
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setDimensions({ 
              w: videoRef.current!.videoWidth, 
              h: videoRef.current!.videoHeight 
            });
            setStatus('✅ Cámara activa');
          };
          await videoRef.current.play();
        }
      } catch (err: any) {
        setStatus(`❌ Error: ${err.message || err}`);
        console.error('[CameraTest]', err);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && (
        <video
          ref={videoRef}
          style={styles.video}
          autoPlay
          playsInline
          muted
        />
      )}
      <View style={styles.overlay}>
        <Text style={styles.title}>Test de Cámara Web</Text>
        <Text style={styles.status}>{status}</Text>
        <Text style={styles.info}>Dimensiones: {dimensions.w} × {dimensions.h}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover' 
  },
  overlay: { 
    position: 'absolute', 
    top: 20, 
    left: 20, 
    right: 20, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    padding: 16, 
    borderRadius: 8 
  },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  status: { color: '#0f0', fontSize: 14, marginBottom: 4 },
  info: { color: '#ccc', fontSize: 12 },
});
