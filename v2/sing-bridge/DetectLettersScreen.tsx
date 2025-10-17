import React, { useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet, Button, ActivityIndicator, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { TensorflowLite } from 'react-native-tensorflow';
import { Asset } from 'expo-asset';

export default function DetectLettersScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [prediction, setPrediction] = useState<string>('');
  const [isModelReady, setIsModelReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const processingRef = useRef(false);
  const cameraRef = useRef<React.ElementRef<typeof CameraView> | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const captureTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        // Validar entorno compatible
        if (Platform.OS === 'web') {
          setModelError('TensorFlow Lite no es compatible en Web. Usa Android o iOS con Dev Client.');
          return;
        }

        if (!TensorflowLite || typeof (TensorflowLite as any).loadModel !== 'function') {
          setModelError('Módulo nativo "react-native-tensorflow" no disponible. Usa un Development Client (expo run:* o EAS) en lugar de Expo Go.');
          return;
        }

        // Usar expo-asset para resolver la URI del archivo en nativo (Android/iOS)
        const modelAsset = Asset.fromModule(require('../assets/model/model.tflite'));
        const labelsAsset = Asset.fromModule(require('../assets/model/labels.txt'));
        await modelAsset.downloadAsync();
        await labelsAsset.downloadAsync();
        await TensorflowLite.loadModel({
          model: modelAsset.localUri || modelAsset.uri,
          labels: labelsAsset.localUri || labelsAsset.uri,
        });
        setIsModelReady(true);
        console.log('Modelo cargado correctamente ✅');
      } catch (e) {
        console.error('Error al cargar modelo', e);
        setModelError('No se pudo cargar el modelo. Revisa logs y rutas de assets.');
      }
    };
    loadModel();
  }, []);

  const captureAndAnalyze = async () => {
  if (!isModelReady || !!modelError || !isCameraReady || !cameraRef.current) return;
    if (processingRef.current) return;
    processingRef.current = true;
    try {
  // Solicitar base64 para fallback de inferencia
  const photo: any = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: true } as any);
      const uri = photo?.uri ?? photo?.localUri ?? photo?.assets?.[0]?.uri;
      if (!uri) return;

      let result: any = null;
      try {
        // Preferimos invocar por ruta si la API lo soporta
        // @ts-ignore API específica de la lib
        result = await TensorflowLite.runModelOnImage({
          path: uri,
          imageMean: 127.5,
          imageStd: 127.5,
          numResults: 1,
          threshold: 0.4,
        });
      } catch (e) {
        console.warn('Fallo runModelOnImage, intenta runModelOnFrame si está soportado', e);
        // Si la API no soporta por ruta, intentamos frame/base64 si existe
        const base64 = photo?.base64;
        if (base64) {
          // Muchas libs aceptan bytes como Buffer/Array; pasamos base64 y dejamos que el nativo lo maneje si soporta
          // @ts-ignore
          result = await TensorflowLite.runModelOnFrame({
            // Algunas implementaciones aceptan { base64 } o { bytes }
            // Probar ambas claves; la lib ignorará desconocidas
            base64,
            bytes: base64,
            width: photo?.width,
            height: photo?.height,
            imageMean: 127.5,
            imageStd: 127.5,
            numResults: 1,
            threshold: 0.4,
          });
        } else {
          // Como último recurso, mantener predicción sin cambios
          result = null;
        }
      }

      const first = Array.isArray(result) ? result[0] : result?.[0];
      const label = first?.label ?? first?.detectedClass ?? 'Sin detección';
      setPrediction(String(label));
    } catch (err) {
      console.error('Error al capturar/analizar:', err);
    } finally {
      processingRef.current = false;
    }
  };

  // Iniciar bucle de captura periódico cuando todo esté listo
  useEffect(() => {
    if (permission?.granted && isModelReady && isCameraReady && cameraRef.current) {
      // Evitar múltiples timers
      if (captureTimerRef.current) clearInterval(captureTimerRef.current as any);
      captureTimerRef.current = setInterval(() => {
        captureAndAnalyze();
      }, 800);
      return () => {
        if (captureTimerRef.current) clearInterval(captureTimerRef.current as any);
        captureTimerRef.current = null;
      };
    }
  }, [permission?.granted, isModelReady, isCameraReady]);

  if (!permission) return <Text style={styles.centerText}>Cargando permisos...</Text>;
  if (!permission.granted)
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.centerText}>Se necesita permiso de cámara</Text>
        <Button title="Conceder permiso" onPress={requestPermission} />
      </View>
    );

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="front"
        ref={(ref) => {
          cameraRef.current = ref;
        }}
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
          <Text style={styles.text}>Predicción: {prediction || '—'}</Text>
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
