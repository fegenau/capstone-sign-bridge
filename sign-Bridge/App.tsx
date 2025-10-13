// ========================================
// App.tsx - SignBridge: Detección de Lenguaje de Señas
// Integración con modelos de alfabeto y números
// ========================================

import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';

// For now, use regular Camera (TensorCamera has compatibility issues with expo-camera v17)
// TODO: Integrate tensor processing separately
const CameraComponent = Platform.OS !== 'web' ? CameraView : View;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Configuración de texturas y tensores
const TEXTURE_SIZE = { 
  width: 1080, 
  height: 1920 
};

const TENSOR_SIZE = { 
  width: 224,  // Ajustar según modelo (comúnmente 224x224 o 320x320)
  height: 224 
};

// Tipos de detección
type DetectionMode = 'numbers' | 'alphabet' | 'gestures';

// Configuración de modelos
const MODEL_CONFIG = {
  numbers: {
    name: 'Números',
    labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    modelPath: './assets/models/numbers/',
    color: '#4CAF50'
  },
  alphabet: {
    name: 'Alfabeto',
    // Based on data.yaml - 27 classes from YOLOv8 model
    labels: ['A', 'B', 'C', 'D', 'E', 'EYE', 'F', 'G', 'H', 'I', 'J',
             'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 
             'U', 'V', 'W', 'X', 'Y', 'Z'],
    modelPath: './assets/models/alphabet/',
    color: '#2196F3'
  },
  gestures: {
    name: 'Gestos',
    labels: ['hola', 'gracias', 'por favor', 'si', 'no', 'ayuda'],
    modelPath: './assets/models/gestures/',
    color: '#FF9800'
  }
};

export default function App() {
  // Estados principales
  const [tfReady, setTfReady] = useState(false);
  const [models, setModels] = useState<{[key: string]: tf.LayersModel | null}>({
    numbers: null,
    alphabet: null,
    gestures: null
  });
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [detectionMode, setDetectionMode] = useState<DetectionMode>('numbers');
  const [currentPrediction, setCurrentPrediction] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [detectionHistory, setDetectionHistory] = useState<string[]>([]);
  const [fps, setFps] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Referencias
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());
  const lastDetectionTime = useRef(0);
  const detectionCooldown = 500; // ms entre detecciones para estabilidad

  // ============================================
  // INICIALIZACIÓN
  // ============================================
  
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // 1. Inicializar TensorFlow para React Native PRIMERO (no bloquea UI)
      console.log('🔄 Inicializando TensorFlow...');
      
      // Wait for TensorFlow to be ready
      await tf.ready();
      
      // For React Native, try to use the rn-webgl backend if available
      // Otherwise fall back to cpu
      try {
        // Check if we're on web or native
        if (typeof window !== 'undefined' && window.document) {
          // Web environment - use webgl
          await tf.setBackend('webgl');
        } else {
          // React Native environment - use rn-webgl or cpu
          const backends = tf.engine().registryFactory;
          if (backends['rn-webgl']) {
            await tf.setBackend('rn-webgl');
          } else {
            await tf.setBackend('cpu');
            console.warn('⚠️ Using CPU backend - performance may be slower');
          }
        }
      } catch (backendError) {
        console.warn('⚠️ Could not set preferred backend, using default:', backendError);
        // Use whatever backend is available
      }
      
      setTfReady(true);
      
      console.log('✅ TensorFlow inicializado');
      console.log('📊 Backend:', tf.getBackend());
      console.log('💾 Memoria:', tf.memory());

      // 3. Cargar modelos (skip for now as they are placeholders)
      // await loadAllModels();
      console.log('⚠️ Modelos no cargados - usando placeholders');
      
      // 2. Solicitar permisos de cámara (al final, no bloquea)
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        console.log('⚠️ Permisos de cámara no otorgados');
      }
      
    } catch (error) {
      console.error('❌ Error en inicialización:', error);
      // Set tfReady anyway so the UI doesn't get stuck
      setTfReady(true);
    }
  };

  // ============================================
  // CARGA DE MODELOS
  // ============================================

  const loadAllModels = async () => {
    console.log('🔄 Cargando modelos...');
    
    try {
      // Cargar modelo de números (prioridad)
      const numberModel = await loadModel('numbers');
      
      // Cargar otros modelos en background
      const alphabetModel = await loadModel('alphabet');
      const gesturesModel = await loadModel('gestures');
      
      setModels({
        numbers: numberModel,
        alphabet: alphabetModel,
        gestures: gesturesModel
      });
      
      console.log('✅ Todos los modelos cargados');
    } catch (error) {
      console.error('❌ Error cargando modelos:', error);
    }
  };

  // Model loading function - placeholder for now
  const loadModel = async (mode: DetectionMode): Promise<tf.LayersModel | null> => {
    try {
      console.log(`🔄 Cargando modelo: ${MODEL_CONFIG[mode].name}`);
      console.log('⚠️ Metro bundler no puede resolver .bin files con require()');
      console.log('⚠️ Usando modelo placeholder temporal');
      
      // NOTA: Metro bundler NO PUEDE resolver archivos .bin con require()
      // Esto es una limitación fundamental, no un bug de configuración
      // 
      // Soluciones posibles:
      // 1. Descargar modelos en runtime desde servidor (producción)
      // 2. Usar formato diferente (TFLite con módulos nativos)
      // 3. Embedder como base64 en JS (tamaño gigante)
      // 4. Web-only deployment
      
      return null; // Retornar null para usar placeholder
      
    } catch (error) {
      console.error(`❌ Error cargando modelo ${mode}:`, error);
      return null;
    }
  };

  // ============================================
  // PROCESAMIENTO DE FRAMES
  // ============================================
  // TODO: Re-enable when TensorCamera is properly integrated
  /*
  const handleCameraStream = (images: IterableIterator<tf.Tensor3D>) => {
    const loop = async () => {
      if (!tfReady || isProcessing) {
        requestAnimationFrame(loop);
        return;
      }

      const currentModel = models[detectionMode];
      if (!currentModel) {
        requestAnimationFrame(loop);
        return;
      }

      const nextImageTensor = images.next().value;
      
      if (nextImageTensor) {
        // Cooldown para estabilidad
        const now = Date.now();
        if (now - lastDetectionTime.current < detectionCooldown) {
          tf.dispose(nextImageTensor);
          requestAnimationFrame(loop);
          return;
        }
        
        setIsProcessing(true);
        
        try {
          // 1. Preprocesar imagen
          const preprocessed = preprocessImage(nextImageTensor);
          
          // 2. Hacer predicción
          const predictionTensor = currentModel.predict(preprocessed) as tf.Tensor;
          const predictionData = await predictionTensor.array();
          
          // 3. Procesar resultado
          const result = processDetection(predictionData as number[][], detectionMode);
          
          if (result.confidence > 0.75) {
            setCurrentPrediction(result.label);
            setConfidence(result.confidence);
            lastDetectionTime.current = now;
            
            // Agregar a historial si es confiable
            if (result.confidence > 0.85) {
              addToHistory(result.label);
            }
          }
          
          // 4. Calcular FPS
          updateFPS();
          
          // 5. Liberar memoria
          tf.dispose([nextImageTensor, preprocessed, predictionTensor]);
          
        } catch (error) {
          console.error('Error en predicción:', error);
        }
        
        setIsProcessing(false);
      }

      requestAnimationFrame(loop);
    };

    loop();
  };

  // ============================================
  // PREPROCESAMIENTO
  // ============================================

  const preprocessImage = (imageTensor: tf.Tensor3D): tf.Tensor4D => {
    return tf.tidy(() => {
      // 1. Convertir de RGB a formato correcto si es necesario
      let processed = imageTensor;
      
      // 2. Normalizar valores [0-255] a [0-1]
      processed = processed.div(255.0);
      
      // 3. Expandir dimensiones para batch [1, height, width, 3]
      const batched = processed.expandDims(0);
      
      // 4. Redimensionar si es necesario (según tu modelo)
      // const resized = tf.image.resizeBilinear(batched, [TENSOR_SIZE.height, TENSOR_SIZE.width]);
      
      return batched as tf.Tensor4D;
    });
  };

  // ============================================
  // PROCESAMIENTO DE DETECCIÓN
  // ============================================

  const processDetection = (
    data: number[][], 
    mode: DetectionMode
  ): { label: string; confidence: number } => {
    
    // data es típicamente [[prob1, prob2, prob3, ...]]
    const probabilities = data[0];
    
    // Encontrar el índice con mayor probabilidad
    const maxIndex = probabilities.indexOf(Math.max(...probabilities));
    const maxConfidence = probabilities[maxIndex];
    
    // Obtener la etiqueta correspondiente
    const labels = MODEL_CONFIG[mode].labels;
    const label = labels[maxIndex] || 'Desconocido';
    
    return {
      label,
      confidence: maxConfidence
    };
  };

  // ============================================
  // GESTIÓN DE HISTORIAL
  // ============================================

  const addToHistory = (detection: string) => {
    setDetectionHistory(prev => {
      // Evitar duplicados consecutivos
      if (prev.length > 0 && prev[prev.length - 1] === detection) {
        return prev;
      }
      
      // Mantener solo los últimos 20
      const newHistory = [...prev, detection];
      return newHistory.slice(-20);
    });
  };

  const clearHistory = () => {
    setDetectionHistory([]);
    setCurrentPrediction('');
    setConfidence(0);
  };

  const getHistoryString = (): string => {
    return detectionHistory.join(' ');
  };

  // ============================================
  // CAMBIO DE MODO
  // ============================================

  const switchMode = (newMode: DetectionMode) => {
    setDetectionMode(newMode);
    setCurrentPrediction('');
    setConfidence(0);
    console.log(`🔄 Cambiado a modo: ${MODEL_CONFIG[newMode].name}`);
  };

  // ============================================
  // MÉTRICAS
  // ============================================

  const updateFPS = () => {
    frameCount.current++;
    const now = Date.now();
    const elapsed = now - lastTime.current;
    
    if (elapsed > 1000) {
      setFps(Math.round((frameCount.current * 1000) / elapsed));
      frameCount.current = 0;
      lastTime.current = now;
    }
  };
  */

  // ============================================
  // RENDERIZADO
  // ============================================

  // Removed blocking camera permission checks - app now shows UI regardless

  if (!tfReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Inicializando TensorFlow...</Text>
      </View>
    );
  }

  const currentModel = models[detectionMode];
  const currentConfig = MODEL_CONFIG[detectionMode];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Cámara */}
      <View style={styles.cameraContainer}>
        {!hasPermission ? (
          <View style={styles.noCameraView}>
            <Text style={styles.noCameraText}>📷 Cámara no disponible</Text>
            <Text style={styles.noCameraSubtext}>
              {hasPermission === null 
                ? 'Solicitando permisos...' 
                : 'Permisos de cámara denegados. Habilita los permisos para usar la detección.'}
            </Text>
          </View>
        ) : Platform.OS !== 'web' ? (
          <>
            <CameraComponent
              style={styles.camera}
              facing="front"
            />
            {/* Guía visual para posicionar las manos */}
            <View style={styles.guideBox} />
          </>
        ) : (
          <View style={styles.webPlaceholder}>
            <Text style={styles.webPlaceholderText}>📱</Text>
            <Text style={styles.webPlaceholderText}>
              La cámara solo está disponible en dispositivos móviles
            </Text>
            <Text style={styles.webPlaceholderSubtext}>
              Escanea el código QR con Expo Go para probar en tu teléfono
            </Text>
          </View>
        )}
      </View>

      {/* Overlay superior */}
      <View style={styles.topOverlay}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>🤟 SignBridge</Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { 
              backgroundColor: currentModel ? '#4CAF50' : '#FF5252' 
            }]} />
            <Text style={styles.statusText}>
              {currentModel ? 'Activo' : 'Cargando...'}
            </Text>
          </View>
        </View>

        {/* Selector de modo */}
        <View style={styles.modeSelector}>
          {(['numbers', 'alphabet', 'gestures'] as DetectionMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.modeButton,
                detectionMode === mode && styles.modeButtonActive,
                { borderColor: MODEL_CONFIG[mode].color }
              ]}
              onPress={() => switchMode(mode)}
            >
              <Text style={[
                styles.modeButtonText,
                detectionMode === mode && styles.modeButtonTextActive
              ]}>
                {MODEL_CONFIG[mode].name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Información de FPS */}
        <View style={styles.fpsContainer}>
          <Text style={styles.fpsText}>FPS: {fps}</Text>
        </View>
      </View>

      {/* Overlay inferior con resultados */}
      <View style={styles.bottomOverlay}>
        {/* Detección actual */}
        <View style={[styles.detectionCard, { borderColor: currentConfig.color }]}>
          <Text style={styles.detectionLabel}>Detección Actual:</Text>
          {currentModel ? (
            <>
              <Text style={[styles.detectionValue, { color: currentConfig.color }]}>
                {currentPrediction || '—'}
              </Text>
              <Text style={styles.confidenceText}>
                Confianza: {(confidence * 100).toFixed(1)}%
              </Text>
            </>
          ) : (
            <Text style={styles.detectionValue}>Cargando modelo...</Text>
          )}
        </View>

        {/* Historial */}
        {detectionHistory.length > 0 && (
          <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyLabel}>Historial:</Text>
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={clearHistory}
              >
                <Text style={styles.clearButtonText}>Limpiar</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.historyText}>
              {getHistoryString()}
            </Text>
          </View>
        )}

        {/* Indicador de procesamiento */}
        {isProcessing && (
          <View style={styles.processingIndicator}>
            <ActivityIndicator size="small" color="#FFF" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// ============================================
// ESTILOS
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 15,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#AAA',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  noCameraView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 30,
  },
  noCameraText: {
    fontSize: 32,
    color: '#FFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  noCameraSubtext: {
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
    lineHeight: 24,
  },
  guideBox: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    right: '10%',
    height: '50%',
    borderWidth: 3,
    borderColor: 'rgba(76, 175, 80, 0.6)',
    borderRadius: 20,
    borderStyle: 'dashed',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  modeButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  modeButtonText: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  modeButtonTextActive: {
    color: '#FFF',
  },
  fpsContainer: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  fpsText: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 20,
    paddingBottom: 30,
  },
  detectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  detectionLabel: {
    color: '#AAA',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  detectionValue: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  confidenceText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyLabel: {
    color: '#AAA',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: 'rgba(255, 82, 82, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#FF5252',
    fontSize: 12,
    fontWeight: '600',
  },
  historyText: {
    color: '#FFF',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500',
  },
  processingIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  webPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 40,
  },
  webPlaceholderText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 26,
  },
  webPlaceholderSubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});