import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useSignLanguageModel, SignDetectionResult } from '../../hooks/useSignLanguageModel';

interface SignDetectionCameraProps {
  onClose: () => void;
  onDetection: (result: SignDetectionResult) => void;
}

const SignDetectionCamera: React.FC<SignDetectionCameraProps> = ({ onClose, onDetection }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastDetection, setLastDetection] = useState<SignDetectionResult | null>(null);
  const [detectionHistory, setDetectionHistory] = useState<SignDetectionResult[]>([]);
  
  const { isModelLoaded, useRealModel, startRealTimeDetection, stopRealTimeDetection } = useSignLanguageModel();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cameraRef = useRef<CameraView | null>(null);

  // Animación de pulso para el indicador de detección
  useEffect(() => {
    if (isDetecting) {
      const pulse = Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]);
      
      const loop = Animated.loop(pulse);
      loop.start();
      
      return () => loop.stop();
    }
  }, [isDetecting, pulseAnim]);

  // Manejar detecciones en tiempo real
  useEffect(() => {
    if (isDetecting && isModelLoaded) {
      startRealTimeDetection((result) => {
        setLastDetection(result);
        setDetectionHistory(prev => [result, ...prev.slice(0, 4)]); // Mantener últimas 5 detecciones
        onDetection(result);
      });
    } else {
      stopRealTimeDetection();
    }

    return () => {
      stopRealTimeDetection();
    };
  }, [isDetecting, isModelLoaded, startRealTimeDetection, stopRealTimeDetection, onDetection]);

  const handleStartDetection = () => {
    if (!isModelLoaded) {
      Alert.alert('Modelo no disponible', 'El modelo de IA aún se está cargando. Intenta de nuevo en unos segundos.');
      return;
    }
    setIsDetecting(true);
  };

  const handleStopDetection = () => {
    setIsDetecting(false);
    setLastDetection(null);
  };

  const handleCapturePicture = async () => {
    if (Platform.OS === 'web') {
      // En web, simular captura
      Alert.alert('Captura simulada', 'En web se simula la captura de imagen');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        // Procesar la imagen capturada
        Alert.alert('Foto capturada', 'Procesando imagen para detección...');
        // Aquí podrías procesar la imagen con el modelo
      }
    } catch (error) {
      console.error('Error capturando imagen:', error);
      Alert.alert('Error', 'No se pudo capturar la imagen');
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#27ae60'; // Verde
    if (confidence >= 0.6) return '#f39c12'; // Naranja
    return '#e74c3c'; // Rojo
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'Alta confianza';
    if (confidence >= 0.6) return 'Confianza media';
    return 'Baja confianza';
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Se necesitan permisos de cámara</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Otorgar permisos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing="back"
        ref={cameraRef}
      >
        {/* Indicador de estado del modelo */}
        <View style={styles.modelStatusContainer}>
          <View style={[
            styles.modelStatus, 
            { backgroundColor: isModelLoaded ? (useRealModel ? '#27ae60' : '#f39c12') : '#e74c3c' }
          ]}>
            <Text style={styles.modelStatusText}>
              {!isModelLoaded 
                ? '⏳ Cargando modelo...'
                : useRealModel 
                  ? '🤖 Modelo IA Real'
                  : '🎭 Modo Simulación'
              }
            </Text>
          </View>
          {isModelLoaded && !useRealModel && (
            <View style={styles.simulationWarning}>
              <Text style={styles.simulationWarningText}>
                ⚠️ Las detecciones son simuladas para demostración
              </Text>
            </View>
          )}
        </View>

        {/* Área de detección */}
        <View style={styles.detectionArea}>
          <Animated.View 
            style={[
              styles.detectionFrame,
              { 
                transform: [{ scale: pulseAnim }],
                borderColor: isDetecting ? '#3498db' : '#ecf0f1'
              }
            ]}
          />
          <Text style={styles.detectionInstruction}>
            {isDetecting 
              ? '🔍 Detectando señas...' 
              : '✋ Coloca tu mano aquí para detectar señas'
            }
          </Text>
        </View>

        {/* Resultado de detección */}
        {lastDetection && (
          <View style={styles.detectionResult}>
            <Text style={styles.detectionLetter}>{lastDetection.prediction}</Text>
            <View style={[
              styles.confidenceBar,
              { backgroundColor: getConfidenceColor(lastDetection.confidence) }
            ]}>
              <Text style={styles.confidenceText}>
                {(lastDetection.confidence * 100).toFixed(0)}% - {getConfidenceText(lastDetection.confidence)}
              </Text>
            </View>
          </View>
        )}

        {/* Historial de detecciones */}
        {detectionHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Últimas detecciones:</Text>
            <View style={styles.historyList}>
              {detectionHistory.slice(0, 3).map((detection, index) => (
                <View key={index} style={styles.historyItem}>
                  <Text style={styles.historyLetter}>{detection.prediction}</Text>
                  <Text style={styles.historyConfidence}>
                    {(detection.confidence * 100).toFixed(0)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Controles */}
        <View style={styles.controls}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.captureButton]} 
            onPress={handleCapturePicture}
          >
            <Text style={styles.controlButtonText}>📸</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.controlButton, 
              styles.detectionButton,
              { backgroundColor: isDetecting ? '#e74c3c' : '#27ae60' }
            ]} 
            onPress={isDetecting ? handleStopDetection : handleStartDetection}
            disabled={!isModelLoaded}
          >
            <Text style={styles.controlButtonText}>
              {isDetecting ? '⏹️' : '▶️'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlButton, styles.closeButton]} 
            onPress={onClose}
          >
            <Text style={styles.controlButtonText}>❌</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    margin: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modelStatusContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  modelStatus: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modelStatusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  detectionArea: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    height: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detectionFrame: {
    width: 200,
    height: 200,
    borderWidth: 3,
    borderRadius: 20,
    borderStyle: 'dashed',
  },
  detectionInstruction: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
  detectionResult: {
    position: 'absolute',
    top: '65%',
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    borderRadius: 15,
  },
  detectionLetter: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  confidenceBar: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 150,
  },
  confidenceText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  historyContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
  },
  historyTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 12,
  },
  historyList: {
    flexDirection: 'row',
  },
  historyItem: {
    marginRight: 15,
    alignItems: 'center',
  },
  historyLetter: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyConfidence: {
    color: '#ccc',
    fontSize: 10,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonText: {
    fontSize: 24,
  },
  captureButton: {
    backgroundColor: '#3498db',
  },
  detectionButton: {
    backgroundColor: '#27ae60',
  },
  closeButton: {
    backgroundColor: '#e74c3c',
  },
  simulationWarning: {
    backgroundColor: 'rgba(243, 156, 18, 0.9)',
    padding: 8,
    borderRadius: 15,
    marginTop: 5,
    maxWidth: 280,
  },
  simulationWarningText: {
    color: '#fff',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default SignDetectionCamera;