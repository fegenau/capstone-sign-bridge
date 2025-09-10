// src/screens/AlphabetDetectionScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const AlphabetDetectionScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [isLoading, setIsLoading] = useState(true);
  const cameraRef = useRef(null);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      setIsLoading(false);
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setIsLoading(false);
    }
  };

  const toggleCameraType = () => {
    setCameraType(current =>
      current === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar style="light" />
        <Ionicons name="camera" size={80} color="#00FF88" />
        <Text style={styles.loadingText}>Inicializando cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar style="light" />
        <Ionicons name="camera-off" size={80} color="#FF4444" />
        <Text style={styles.errorText}>Sin acceso a la cámara</Text>
        <Text style={styles.subtitleText}>
          SignBridge necesita acceso a la cámara para detectar letras
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
          <Text style={styles.buttonText}>Solicitar permisos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SignBridge</Text>
        <Text style={styles.headerSubtitle}>Detección de Alfabeto</Text>
      </View>

      {/* Vista de Cámara */}
      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          type={cameraType}
          ref={cameraRef}
        />
        
        {/* Frame guía */}
        <View style={styles.frameGuide}>
          <View style={styles.corner} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
          
          <View style={styles.guideTextContainer}>
            <Text style={styles.guideText}>
              Coloca tu mano dentro del marco
            </Text>
          </View>
        </View>

        {/* Indicador de estado */}
        <View style={styles.statusContainer}>
          <View style={styles.statusIndicator}>
            <Ionicons name="camera" size={16} color="#00FF88" />
            <Text style={styles.statusText}>Cámara activa</Text>
          </View>
        </View>
      </View>

      {/* Controles */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
          <Ionicons name="camera-reverse" size={24} color="#fff" />
          <Text style={styles.controlButtonText}>
            {cameraType === Camera.Constants.Type.back ? 'Frontal' : 'Trasera'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.controlButton}>
          <Ionicons name="hand-left" size={24} color="#00FF88" />
          <Text style={styles.controlButtonText}>Muestra una letra</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => Alert.alert('Configuración', 'Próximamente...')}
        >
          <Ionicons name="settings" size={24} color="#fff" />
          <Text style={styles.controlButtonText}>Configurar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  frameGuide: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    bottom: '35%',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#00FF88',
    borderWidth: 3,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  guideTextContainer: {
    position: 'absolute',
    bottom: -40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  guideText: {
    color: '#CCCCCC',
    fontSize: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 6,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitleText: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#00FF88',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 30,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AlphabetDetectionScreen;