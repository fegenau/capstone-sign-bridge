import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Importar componentes (siguiendo la estructura del alfabeto)
import DetectionOverlay from '../components/camera/DetectionOverlay'; 
import NumberGrid from '../components/common/NumberGrid';


const NumberDetectionScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(CameraType.front);
  const [cameraRef, setCameraRef] = useState(null);
  const [detectedNumber, setDetectedNumber] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetectionActive, setIsDetectionActive] = useState(false);
  // Web-specific states
  const [webStream, setWebStream] = useState(null);
  const [webError, setWebError] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    if (Platform.OS === 'web') {
      setHasPermission(null);
      setWebError(null);
      const getWebcam = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (!isMounted) return;
          setWebStream(stream);
          setHasPermission(true);
          setIsDetectionActive(true);
          setWebError(null);
        } catch (err) {
          if (!isMounted) return;
          setHasPermission(false);
          setWebError('No se pudo acceder a la cámara.');
        }
      };
      getWebcam();
      return () => {
        isMounted = false;
        stopDetection();
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        if (webStream) {
          webStream.getTracks().forEach(track => track.stop());
        }
      };
    } else {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (!isMounted) return;
        setHasPermission(status === 'granted');
        if (status === 'granted') {
          setIsDetectionActive(true);
          startDetection();
        }
      })();
      return () => {
        isMounted = false;
        stopDetection();
      };
    }
  }, []);

  // Simulación de detección (mock - igual que alfabeto pero con números)
  const startDetection = () => {
    setIsProcessing(true);
    
    // Mock: Simular detección de números aleatorios cada 2 segundos
    const detectionInterval = setInterval(() => {
      const randomNumber = Math.floor(Math.random() * 10); // 0-9
      const randomConfidence = Math.floor(Math.random() * 40) + 60; // 60-100%
      
      setDetectedNumber(randomNumber);
      setConfidence(randomConfidence);
      
      console.log(`📊 Número detectado: ${randomNumber} (${randomConfidence}%)`);
    }, 2000);

    // Guardar el interval para limpiarlo después
    return () => clearInterval(detectionInterval);
  };

  const stopDetection = () => {
    setIsProcessing(false);
    setDetectedNumber(null);
    setConfidence(0);
  };

  const toggleDetection = () => {
    if (isDetectionActive) {
      stopDetection();
      setIsDetectionActive(false);
      Alert.alert('Detección pausada', 'Presiona para reanudar');
    } else {
      startDetection();
      setIsDetectionActive(true);
      Alert.alert('Detección activa', 'Muestra tu mano con un número');
    }
  };

  const toggleCameraType = () => {
    setCameraType(current =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };


  // Manejo de permisos multiplataforma
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="camera-off" size={80} color="#666" />
          <Text style={styles.errorText}>Sin acceso a la cámara</Text>
          <Text style={styles.errorSubtext}>
            {Platform.OS === 'web'
              ? 'Debes permitir el acceso a la cámara en tu navegador para usar esta función.'
              : 'SignBridge necesita acceso a la cámara para detectar números en lengua de señas'}
          </Text>
          {webError && <Text style={styles.errorSubtext}>{webError}</Text>}
          {Platform.OS !== 'web' && (
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={async () => {
                const { status } = await Camera.requestCameraPermissionsAsync();
                if (status === 'granted') {
                  setHasPermission(true);
                  setIsDetectionActive(true);
                  startDetection();
                  Alert.alert('¡Listo!', 'Permisos otorgados correctamente');
                } else if (status === 'denied') {
                  Alert.alert(
                    'Permisos denegados',
                    'Para usar esta función, ve a:\n\nConfiguración → SignBridge → Permisos → Cámara',
                    [{ text: 'Entendido' }]
                  );
                }
              }}
            >
              <Text style={styles.permissionButtonText}>Solicitar permisos</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Sincronizar el stream con el ref del video en web
  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current && webStream) {
      videoRef.current.srcObject = webStream;
    }
  }, [webStream]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Cámara multiplataforma */}
      {Platform.OS === 'web' ? (
        <View style={styles.camera}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#222' }}
            id="webcam-video-number"
          />
          <DetectionOverlay
            detectedValue={detectedNumber}
            confidence={confidence}
            isProcessing={isProcessing}
            type="number"
          />
        </View>
      ) : (
        <Camera
          style={styles.camera}
          type={cameraType}
          ref={ref => setCameraRef(ref)}
        >
          <DetectionOverlay
            detectedValue={detectedNumber}
            confidence={confidence}
            isProcessing={isProcessing}
            type="number"
          />
        </Camera>
      )}

      {/* Controles */}
      <View style={styles.controls}>
        {Platform.OS !== 'web' && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleCameraType}
          >
            <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
            <Text style={styles.controlText}>Cambiar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.controlButton,
            styles.mainButton,
            !isDetectionActive && styles.pausedButton,
          ]}
          onPress={toggleDetection}
        >
          <Ionicons
            name={isDetectionActive ? 'pause' : 'play'}
            size={32}
            color="#fff"
          />
          <Text style={styles.controlText}>
            {isDetectionActive ? 'Pausar' : 'Iniciar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => Alert.alert('Ayuda', 'Muestra números del 0 al 9 en lengua de señas chilena')}
        >
          <Ionicons name="information-circle-outline" size={28} color="#fff" />
          <Text style={styles.controlText}>Ayuda</Text>
        </TouchableOpacity>
      </View>

      {/* Panel de números de referencia */}
      <NumberGrid
        detectedNumber={detectedNumber}
        onNumberPress={(num) => Alert.alert('Número', `Seleccionaste el ${num}`)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 70,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  mainButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 40,
    width: 70,
    height: 70,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  pausedButton: {
    backgroundColor: '#666',
  },
  controlText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
  },
  errorSubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});

export default NumberDetectionScreen;