import React, { useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet, Button, ActivityIndicator, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Asset } from 'expo-asset';
import { SignDetectionService } from './services/SignDetectionService';

export default function DetectLettersScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [prediction, setPrediction] = useState<string>('');
  const [isModelReady, setIsModelReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const processingRef = useRef(false);
  const cameraRef = useRef<React.ElementRef<typeof CameraView> | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const captureTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar modelo al inicializar
  useEffect(() => {
    const loadModel = async () => {
      try {
        if (Platform.OS === 'web') {
          setModelError('TensorFlow Lite no es compatible en Web.');
          return;
        }

        const modelAsset = Asset.fromModule(require('./assets/model/model.tflite'));
        const labelsAsset = Asset.fromModule(require('./assets/model/labels.txt'));
        await modelAsset.downloadAsync();
        await labelsAsset.downloadAsync();
        
        const success = await SignDetectionService.initializeModel(
          modelAsset.localUri || modelAsset.uri,
          labelsAsset.localUri || labelsAsset.uri
        );
        
        if (success) {
          setIsModelReady(true);
          console.log('✅ Modelo cargado correctamente');
        } else {
          setModelError('Error al inicializar el servicio de detección');
        }
      } catch (e) {
        console.error('❌ Error al cargar modelo:', e);
        setModelError('No se pudo cargar el modelo.');
      }
    };
    loadModel();
  }, []);

  // Función para capturar y analizar imagen
  const captureAndAnalyze = async () => {
    if (!isModelReady || !!modelError || !isCameraReady || !cameraRef.current) return;
    if (processingRef.current) return;
    processingRef.current = true;
    
    try {
      const photo: any = await cameraRef.current.takePictureAsync({ 
        quality: 0.5, 
        base64: false 
      } as any);
      
      const uri = photo?.uri ?? photo?.localUri ?? photo?.assets?.[0]?.uri;
      if (!uri) return;

      const result = await SignDetectionService.predict(uri);
      
      if (result) {
        setPrediction(`${result.label} (${(result.confidence * 100).toFixed(1)}%)`);
      } else {
        setPrediction('Sin detección');
      }
    } catch (err) {
      console.error('❌ Error al capturar/analizar:', err);
      setPrediction('Error en detección');
    } finally {
      processingRef.current = false;
    }
  };

  // Bucle de captura automático
  useEffect(() => {
    if (permission?.granted && isModelReady && isCameraReady && cameraRef.current) {
      if (captureTimerRef.current) clearInterval(captureTimerRef.current as any);
      captureTimerRef.current = setInterval(() => {
        captureAndAnalyze();
      }, 1500); // Cada 1.5 segundos para no sobrecargar
      return () => {
        if (captureTimerRef.current) clearInterval(captureTimerRef.current as any);
        captureTimerRef.current = null;
      };
    }
  }, [permission?.granted, isModelReady, isCameraReady]);

  if (!permission) {
    return <Text style={styles.centerText}>Cargando permisos...</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.centerText}>Se necesita permiso de cámara</Text>
        <Button title="Conceder permiso" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="front"
        ref={cameraRef}
        onCameraReady={() => setIsCameraReady(true)}
      />
      <View style={styles.overlay}>
        {!isModelReady && !modelError ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#fff" />
            <Text style={[styles.text, { marginLeft: 8 }]}>Cargando modelo…</Text>
          </View>
        ) : modelError ? (
          <View style={styles.loadingRow}>
            <Text style={styles.text}>{modelError}</Text>
          </View>
        ) : (
          <Text style={styles.text}>Predicción: {prediction || 'Listo para detectar'}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  centerText: { textAlign: 'center', fontSize: 16 },
  overlay: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  text: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    fontSize: 18,
    padding: 8,
    borderRadius: 8,
  },
});