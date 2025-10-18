// test/CameraTest.js
// Componente de prueba específico para diagnosticar problemas de cámara iOS y Web

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { fastTfliteService } from '../utils/services/fastTfliteService';
import { detectionService } from '../utils/services/detectionService';

export default function CameraTest() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [webStream, setWebStream] = useState(null);
  const [webError, setWebError] = useState(null);
  const [detectionLogs, setDetectionLogs] = useState([]);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    initializeServices();
    initializeCamera();
  }, []);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    setDetectionLogs(prev => [logEntry, ...prev.slice(0, 9)]); // Mantener 10 logs
  };

  const initializeCamera = async () => {
    if (Platform.OS === 'web') {
      addLog('🌐 Inicializando cámara web...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'environment' // Cámara trasera preferida
          }
        });
        setWebStream(stream);
        setWebError(null);
        setIsCameraReady(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        addLog('✅ Cámara web inicializada correctamente');
      } catch (err) {
        addLog(`❌ Error cámara web: ${err.message}`);
        setWebError(`Error accediendo a la cámara: ${err.message}`);
        setIsCameraReady(false);
      }
    } else {
      addLog(`📱 Plataforma: ${Platform.OS} - Usando CameraView`);
    }
  };

  const initializeServices = async () => {
    try {
      addLog('🧪 Inicializando servicios de prueba...');
      
      // Cargar modelo
      const loaded = await fastTfliteService.loadModel();
      setIsModelLoaded(loaded);
      
      if (loaded) {
        const info = fastTfliteService.getModelInfo();
        addLog(`📋 Modelo cargado: ${info.mode} - ${info.numClasses} clases`);
      }

      // Cargar servicio de detección
      await detectionService.loadModel();
      addLog('🔄 Servicio de detección inicializado');
      
    } catch (error) {
      addLog(`❌ Error inicializando servicios: ${error.message}`);
    }
  };

  const testDetectionService = async () => {
    try {
      addLog('🧪 Probando servicio de detección...');
      setIsProcessing(true);

      // Probar detección forzada
      await detectionService.forceDetection();
      addLog('✅ Detección forzada ejecutada');

    } catch (error) {
      addLog(`❌ Error en detección: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const testPrediction = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      addLog('🧪 Probando predicción...');
      
      if (Platform.OS === 'web' && webStream) {
        addLog('🌐 Capturando frame de video web...');
        
        // Crear canvas para capturar frame del video
        const video = videoRef.current;
        if (video && video.videoWidth > 0) {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);
          
          // Convertir a blob
          canvas.toBlob(async (blob) => {
            const url = URL.createObjectURL(blob);
            addLog(`📸 Frame capturado: ${canvas.width}x${canvas.height}`);
            
            const result = await fastTfliteService.predictFromImageUri(url, { threshold: 0.3 });
            setLastResult(result);
            addLog(`🎯 Resultado web: ${JSON.stringify(result)}`);
            
            URL.revokeObjectURL(url);
          }, 'image/jpeg', 0.8);
        } else {
          addLog('⚠️ Video no está listo o no tiene dimensiones');
          // Fallback a prueba sin imagen
          const testResult = await fastTfliteService.predictFromImageUri('test://web-image.jpg', { threshold: 0.3 });
          setLastResult(testResult);
          addLog(`🎯 Resultado fallback: ${JSON.stringify(testResult)}`);
        }
        
      } else if (!isCameraReady || !cameraRef.current) {
        addLog('⚠️ Cámara no está lista, usando imagen de prueba');
        
        const testResult = await fastTfliteService.predictFromImageUri('test://mobile-image.jpg', { threshold: 0.3 });
        setLastResult(testResult);
        addLog(`🎯 Resultado de prueba: ${JSON.stringify(testResult)}`);
        
      } else {
        addLog('📸 Tomando foto de la cámara móvil...');
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          skipProcessing: true,
          base64: false,
          exif: false,
        });
        
        addLog(`📸 Foto capturada: ${photo?.uri?.substring(0, 50)}...`);
        
        if (photo?.uri) {
          const result = await fastTfliteService.predictFromImageUri(photo.uri, { threshold: 0.3 });
          setLastResult(result);
          addLog(`🎯 Resultado real: ${JSON.stringify(result)}`);
        }
      }
      
    } catch (error) {
      addLog(`❌ Error en prueba: ${error.message}`);
      Alert.alert('Error', `Error en prueba: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Cleanup para web
  useEffect(() => {
    return () => {
      if (webStream) {
        webStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [webStream]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Verificando permisos...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Necesitamos permisos de cámara</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Solicitar permisos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Prueba de Cámara y Modelo</Text>
      
      {/* Estado */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          📷 Cámara: {isCameraReady ? '✅ Lista' : '⏳ Cargando'}
        </Text>
        <Text style={styles.statusText}>
          🤖 Modelo: {isModelLoaded ? '✅ Cargado' : '❌ No cargado'}
        </Text>
        <Text style={styles.statusText}>
          🔄 Procesando: {isProcessing ? '⏳ Sí' : '✅ No'}
        </Text>
        <Text style={styles.statusText}>
          📱 Plataforma: {Platform.OS}
        </Text>
        {Platform.OS === 'web' && webError && (
          <Text style={styles.errorText}>❌ {webError}</Text>
        )}
      </View>

      {/* Cámara */}
      <View style={styles.cameraContainer}>
        {Platform.OS === 'web' ? (
          webError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error de cámara web</Text>
              <Text style={styles.errorSubtext}>{webError}</Text>
            </View>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={styles.video}
              onLoadedMetadata={() => {
                console.log('📹 Video metadata cargada');
                setIsCameraReady(true);
              }}
              onError={(e) => {
                console.error('❌ Error en video:', e);
                setWebError('Error al reproducir video');
              }}
            />
          )
        ) : (
          <CameraView
            style={styles.camera}
            facing="back"
            active={true}
            onCameraReady={() => {
              console.log('📷 Cámara lista');
              setIsCameraReady(true);
            }}
            onMountError={(error) => {
              console.error('❌ Error montando cámara:', error);
              setIsCameraReady(false);
            }}
            ref={cameraRef}
          />
        )}
      </View>

      {/* Controles */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.button, isProcessing && styles.buttonDisabled]} 
          onPress={testPrediction}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>
            {isProcessing ? '⏳ Procesando...' : '🧪 Probar Detección'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={testDetectionService}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>
            🔄 Probar Servicio
          </Text>
        </TouchableOpacity>
      </View>

      {/* Resultado */}
      {lastResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>🎯 Último Resultado:</Text>
          <Text style={styles.resultText}>
            Letra: {lastResult.label || 'N/A'}
          </Text>
          <Text style={styles.resultText}>
            Confianza: {lastResult.confidence || 0}%
          </Text>
          <Text style={styles.resultText}>
            Fuente: {lastResult.source || 'desconocida'}
          </Text>
        </View>
      )}

      {/* Logs de detección */}
      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>📋 Logs de Detección:</Text>
        {detectionLogs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    fontSize: 18,
    color: '#00FF88',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 5,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginBottom: 5,
  },
  errorSubtext: {
    color: '#ff6666',
    fontSize: 12,
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#000',
    minHeight: 300,
  },
  camera: {
    flex: 1,
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
  button: {
    backgroundColor: '#00FF88',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: '#0088ff',
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  resultTitle: {
    color: '#00FF88',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 5,
  },
  logsContainer: {
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 10,
    maxHeight: 150,
  },
  logsTitle: {
    color: '#00FF88',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  logText: {
    color: '#cccccc',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 2,
  },
});