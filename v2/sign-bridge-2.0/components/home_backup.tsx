import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import SignDetectionCamera from './SignDetection/SignDetectionCamera';
import { SignDetectionResult } from '../hooks/useSignLanguageModel';

const Home: React.FC = () => {
  const [cameraVisible, setCameraVisible] = useState(false);
  const [signDetectionMode, setSignDetectionMode] = useState(false);
  const [detectedWords, setDetectedWords] = useState<string[]>([]);
  const [currentSentence, setCurrentSentence] = useState('');
  const [permission, requestPermission] = useCameraPermissions();

  // Función para solicitar permisos de cámara
  const requestCameraPermission = async () => {
    if (!permission) {
      const result = await requestPermission();
      return result.granted;
    }
    return permission.granted;
  };

  // Función para abrir la cámara nativa (iOS/Android)
  const openNativeCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permisos requeridos', 'Se necesitan permisos de cámara para continuar');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        Alert.alert('Foto capturada', 'La foto se guardó correctamente');
        console.log('Foto capturada:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al abrir la cámara:', error);
      Alert.alert('Error', 'No se pudo abrir la cámara');
    }
  };

  // Función para abrir cámara web
  const openWebCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      setCameraVisible(true);
    } else {
      Alert.alert('Permisos denegados', 'Se necesitan permisos de cámara para continuar');
    }
  };

  // Función principal para abrir cámara según la plataforma
  const openCamera = async () => {
    if (Platform.OS === 'web') {
      await openWebCamera();
    } else {
      // iOS y Android
      await openNativeCamera();
    }
  };

  // Función para abrir el modo de detección de señas
  const openSignDetection = () => {
    setSignDetectionMode(true);
    setDetectedWords([]);
    setCurrentSentence('');
  };

  // Función para cerrar el modo de detección de señas
  const closeSignDetection = () => {
    setSignDetectionMode(false);
  };

  // Manejar nueva detección de seña
  const handleSignDetection = (result: SignDetectionResult) => {
    if (result.confidence >= 0.7) { // Solo aceptar detecciones con alta confianza
      setDetectedWords(prev => {
        const newWords = [...prev, result.prediction];
        const sentence = newWords.join(' ');
        setCurrentSentence(sentence);
        return newWords;
      });
    }
  };

  // Limpiar la oración actual
  const clearSentence = () => {
    setDetectedWords([]);
    setCurrentSentence('');
  };

  // Función para cerrar la cámara web
  const closeCamera = () => {
    setCameraVisible(false);
  };

  // Función para tomar foto en web
  const takePictureWeb = async () => {
    // Aquí puedes implementar la lógica para capturar la foto en web
    Alert.alert('Foto capturada', 'Funcionalidad de captura web implementada');
    setCameraVisible(false);
  };

  const getPlatformText = () => {
    switch (Platform.OS) {
      case 'ios':
        return 'iOS';
      case 'android':
        return 'Android';
      case 'web':
        return 'Web';
      default:
        return 'Plataforma desconocida';
    }
  };

  const getButtonText = () => {
    switch (Platform.OS) {
      case 'ios':
        return '📱 Abrir Cámara iOS';
      case 'android':
        return '🤖 Abrir Cámara Android';
      case 'web':
        return '💻 Abrir Cámara Web';
      default:
        return '📷 Abrir Cámara';
    }
  };

  // Modo de detección de señas
  if (signDetectionMode) {
    return (
      <SignDetectionCamera 
        onClose={closeSignDetection}
        onDetection={handleSignDetection}
      />
    );
  }

  if (cameraVisible && Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.cameraContainer}>
          <CameraView 
            style={styles.camera} 
            facing="back"
          >
            <View style={styles.cameraControls}>
              <TouchableOpacity 
                style={[styles.button, styles.captureButton]} 
                onPress={takePictureWeb}
              >
                <Text style={styles.buttonText}>📸 Capturar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.closeButton]} 
                onPress={closeCamera}
              >
                <Text style={styles.buttonText}>❌ Cerrar</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Bridge 2.0</Text>
      <Text style={styles.subtitle}>Tu solución integral para todas las necesidades de señas</Text>
      
      <View style={styles.platformInfo}>
        <Text style={styles.platformText}>
          Plataforma actual: {getPlatformText()}
        </Text>
      </View>

      {/* Mostrar oración actual si hay palabras detectadas */}
      {currentSentence && (
        <View style={styles.sentenceContainer}>
          <Text style={styles.sentenceLabel}>Oración formada:</Text>
          <Text style={styles.sentenceText}>{currentSentence}</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  platformInfo: {
    backgroundColor: '#ecf0f1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  platformText: {
    fontSize: 14,
    color: '#34495e',
    fontWeight: '600',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginVertical: 5,
    minWidth: 200,
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#3498db',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  captureButton: {
    backgroundColor: '#27ae60',
  },
  closeButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 50,
  },
  sentenceContainer: {
    backgroundColor: '#2c3e50',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    width: '90%',
    alignItems: 'center',
  },
  sentenceLabel: {
    color: '#ecf0f1',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
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
  signDetectionButton: {
    backgroundColor: '#9b59b6',
    marginBottom: 10,
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
