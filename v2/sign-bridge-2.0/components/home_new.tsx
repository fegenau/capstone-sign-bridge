import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import SignDetectionCamera from './SignDetection/SignDetectionCamera';
import { useSignLanguageModel, SignDetectionResult } from '../hooks/useSignLanguageModel';

const Home: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [detectedSigns, setDetectedSigns] = useState<string[]>([]);
  const { 
    isModelLoaded, 
    useRealModel,
    processImage,
    startRealTimeDetection,
    stopRealTimeDetection
  } = useSignLanguageModel();

  const openCamera = async () => {
    // Solicitar permisos
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos requeridos',
        'Necesitamos permisos de cámara para continuar'
      );
      return;
    }

    if (Platform.OS === 'web') {
      // En web, usar la cámara del navegador
      try {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });

        if (!result.canceled) {
          Alert.alert('¡Foto tomada!', 'Foto capturada desde la web');
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo acceder a la cámara');
      }
    } else {
      // En iOS y Android, usar la cámara nativa
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: Platform.OS === 'ios', // Solo en iOS
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        Alert.alert(
          '¡Foto tomada!',
          `Foto capturada desde ${Platform.OS === 'ios' ? 'iOS' : 'Android'}`
        );
      }
    }
  };

  const getButtonText = () => {
    switch (Platform.OS) {
      case 'ios':
        return '📱 Abrir Cámara iOS';
      case 'android':
        return '🤖 Abrir Cámara Android';
      case 'web':
        return '🌐 Abrir Cámara Web';
      default:
        return '📷 Abrir Cámara';
    }
  };

  const openSignDetection = () => {
    setShowCamera(true);
  };

  const closeSignDetection = () => {
    setShowCamera(false);
  };

  const handleSignDetected = (result: SignDetectionResult) => {
    if (result.prediction && result.confidence > 0.6) {
      setDetectedSigns(prev => [...prev, result.prediction]);
    }
  };

  const clearSentence = () => {
    setDetectedSigns([]);
  };

  const getModelStatusText = () => {
    if (!isModelLoaded) {
      return '⏳ Cargando modelo...';
    }
    if (!useRealModel) {
      return '🎭 Modo Simulación (Web/Desarrollo)';
    }
    return '✅ Modelo TensorFlow Lite cargado';
  };

  const getModelStatusColor = () => {
    if (!isModelLoaded) return '#f39c12';
    if (!useRealModel) return '#3498db';
    return '#27ae60';
  };

  if (showCamera) {
    return (
      <SignDetectionCamera
        onClose={closeSignDetection}
        onDetection={handleSignDetected}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Bridge 2.0</Text>
      <Text style={styles.subtitle}>Detección de Señas con IA</Text>

      <View style={styles.statusContainer}>
        <Text style={[
          styles.statusText, 
          { color: getModelStatusColor() }
        ]}>
          {getModelStatusText()}
        </Text>
      </View>

      {detectedSigns.length > 0 && (
        <View style={styles.sentenceContainer}>
          <Text style={styles.sentenceLabel}>Frase detectada:</Text>
          <Text style={styles.sentenceText}>
            {detectedSigns.join(' ')}
          </Text>
          <TouchableOpacity 
            style={[styles.button, styles.clearButton]} 
            onPress={clearSentence}
          >
            <Text style={styles.buttonText}>🗑️ Limpiar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.signDetectionButton]} 
          onPress={openSignDetection}
        >
          <Text style={styles.buttonText}>🤟 Detectar Señas IA</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.cameraButton]} 
          onPress={openCamera}
        >
          <Text style={styles.buttonText}>{getButtonText()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>🤖 Detección de Señas con IA</Text>
        <Text style={styles.infoText}>
          El modelo de IA puede detectar las letras A, B, C del alfabeto de señas.
          Usa "Detectar Señas IA" para reconocimiento en tiempo real.
        </Text>
        <Text style={styles.infoSubtext}>
          {Platform.OS === 'web' 
            ? 'En web: Cámara integrada del navegador'
            : Platform.OS === 'ios'
            ? 'En iOS: Cámara nativa con opciones de edición'
            : 'En Android: Cámara nativa del sistema'
          }
        </Text>
      </View>

      <View style={styles.modelInfo}>
        <Text style={styles.modelInfoTitle}>📊 Información del Modelo</Text>
        <Text style={styles.modelInfoText}>• Modelo: TensorFlow Lite (model_fp16.tflite)</Text>
        <Text style={styles.modelInfoText}>• Letras soportadas: A, B, C</Text>
        <Text style={styles.modelInfoText}>• Versión: 1.0</Text>
        <Text style={styles.modelInfoText}>• Confianza mínima: 70%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 30,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  sentenceContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f39c12',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sentenceLabel: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 10,
    fontWeight: '600',
  },
  sentenceText: {
    color: '#f39c12',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    minHeight: 30,
  },
  clearButton: {
    backgroundColor: '#e74c3c',
  },
  buttonContainer: {
    width: '90%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signDetectionButton: {
    backgroundColor: '#9b59b6',
    marginBottom: 10,
  },
  cameraButton: {
    backgroundColor: '#3498db',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#34495e',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoSubtext: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
  modelInfo: {
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '90%',
    borderLeftWidth: 4,
    borderLeftColor: '#9b59b6',
  },
  modelInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  modelInfoText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 5,
  },
});

export default Home;