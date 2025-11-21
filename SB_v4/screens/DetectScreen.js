import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useMediaPipeDetection from '../hooks/useMediaPipeDetection';
import useTfjsClassifier from '../hooks/useTfjsClassifier';
import * as Speech from 'expo-speech';

const DetectScreen = ({ navigation }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [detectionStats, setDetectionStats] = useState({
    fps: 0,
    handsDetected: 0,
    predictions: 0
  });
  const [speechEnabled, setSpeechEnabled] = useState(true);
  
  const lastSpokenRef = useRef('');
  const statsIntervalRef = useRef(null);
  const predictionCountRef = useRef(0);

  // Hook del clasificador con configuración optimizada
  const {
    classifySequence,
    resetSequence,
    getStats,
    isModelLoading,
    modelError,
    modelReady
  } = useTfjsClassifier({
    sequenceLength: 30,
    confidenceThreshold: 0.85,
    smoothingWindow: 5,
    debug: false
  });

  // Callback para manejar detección de manos
  const handleHandDetection = useCallback(async (handData) => {
    if (!modelReady || !handData || !handData.keypoints) {
      return;
    }

    // Clasificar la secuencia
    const prediction = await classifySequence(handData.keypoints);
    
    if (prediction) {
      setCurrentPrediction(prediction);
      predictionCountRef.current++;

      // Text-to-Speech para la seña detectada
      if (speechEnabled && prediction.confidence > 0.9) {
        const text = prediction.class;
        
        // Evitar repetir la misma palabra muy seguido
        if (text !== lastSpokenRef.current) {
          lastSpokenRef.current = text;
          
          Speech.speak(text, {
            language: 'es-CL',
            pitch: 1.0,
            rate: 0.9,
            onDone: () => {
              // Permitir nueva pronunciación después de completar
              setTimeout(() => {
                lastSpokenRef.current = '';
              }, 1000);
            }
          });

          console.log(`[DetectScreen] 🔊 Pronunciando: "${text}" (${(prediction.confidence * 100).toFixed(1)}%)`);
        }
      }
    }
  }, [classifySequence, modelReady, speechEnabled]);

  // Hook de MediaPipe con configuración optimizada
  const {
    isLoading: isMediaPipeLoading,
    error: mediaPipeError,
    handCount,
    processedFrames,
    resetDetection
  } = useMediaPipeDetection({
    isActive: isDetecting,
    onHandDetection: handleHandDetection,
    debug: false,
    minDetectionConfidence: 0.3,
    minTrackingConfidence: 0.3
  });

  // Manejar inicio/detención de detección
  const toggleDetection = useCallback(() => {
    if (!isDetecting) {
      // Verificar que todo esté listo
      if (!modelReady) {
        Alert.alert(
          'Modelo no listo',
          'El modelo de IA aún se está cargando. Por favor espera.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Iniciar detección
      setIsDetecting(true);
      resetSequence();
      resetDetection();
      predictionCountRef.current = 0;
      lastSpokenRef.current = '';
      
      console.log('[DetectScreen] ✅ Detección iniciada');
      
      // Iniciar actualización de estadísticas
      statsIntervalRef.current = setInterval(() => {
        setDetectionStats({
          fps: Math.round(processedFrames / 10),
          handsDetected: handCount,
          predictions: predictionCountRef.current
        });
      }, 1000);
    } else {
      // Detener detección
      setIsDetecting(false);
      setCurrentPrediction(null);
      Speech.stop();
      
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
        statsIntervalRef.current = null;
      }
      
      console.log('[DetectScreen] ⏹️ Detección detenida');
    }
  }, [isDetecting, modelReady, resetSequence, resetDetection, handCount, processedFrames]);

  // Toggle Text-to-Speech
  const toggleSpeech = useCallback(() => {
    setSpeechEnabled(prev => {
      const newValue = !prev;
      if (!newValue) {
        Speech.stop();
      }
      console.log(`[DetectScreen] TTS: ${newValue ? 'Activado' : 'Desactivado'}`);
      return newValue;
    });
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      Speech.stop();
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
  }, []);

  // Log del estado del modelo
  useEffect(() => {
    const stats = getStats();
    console.log('[DetectScreen] 📊 Estado:', {
      modelReady,
      isModelLoading,
      modelError,
      ...stats
    });
  }, [modelReady, isModelLoading, modelError, getStats]);

  // UI del componente
  const isLoading = isModelLoading || (isDetecting && isMediaPipeLoading);
  const hasError = modelError || mediaPipeError;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Detección de Señas</Text>
        
        <TouchableOpacity
          style={[styles.speechButton, !speechEnabled && styles.speechButtonOff]}
          onPress={toggleSpeech}
        >
          <Ionicons 
            name={speechEnabled ? "volume-high" : "volume-mute"} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>

      {/* Camera Container */}
      <View style={styles.cameraContainer} id="camera-container">
        {!isDetecting && (
          <View style={styles.placeholderContainer}>
            <Ionicons name="camera" size={80} color="#666" />
            <Text style={styles.placeholderText}>
              Presiona el botón para iniciar la cámara
            </Text>
          </View>
        )}
        
        {isDetecting && isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Iniciando cámara...</Text>
          </View>
        )}
      </View>

      {/* Prediction Display */}
      {currentPrediction && (
        <View style={styles.predictionContainer}>
          <Text style={styles.predictionLabel}>Seña Detectada:</Text>
          <Text style={styles.predictionText}>
            {currentPrediction.class}
          </Text>
          <View style={styles.confidenceBar}>
            <View 
              style={[
                styles.confidenceFill,
                { width: `${currentPrediction.confidence * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.confidenceText}>
            Confianza: {(currentPrediction.confidence * 100).toFixed(1)}%
          </Text>
        </View>
      )}

      {/* Stats Display */}
      {isDetecting && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>FPS</Text>
            <Text style={styles.statValue}>{detectionStats.fps}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Manos</Text>
            <Text style={styles.statValue}>{detectionStats.handsDetected}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Detecciones</Text>
            <Text style={styles.statValue}>{detectionStats.predictions}</Text>
          </View>
        </View>
      )}

      {/* Error Display */}
      {hasError && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={24} color="#FF3B30" />
          <Text style={styles.errorText}>{modelError || mediaPipeError}</Text>
        </View>
      )}

      {/* Control Button */}
      <TouchableOpacity
        style={[
          styles.controlButton,
          isDetecting && styles.controlButtonActive,
          !modelReady && styles.controlButtonDisabled
        ]}
        onPress={toggleDetection}
        disabled={!modelReady && !isDetecting}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons 
              name={isDetecting ? "stop-circle" : "play-circle"} 
              size={32} 
              color="#FFFFFF" 
            />
            <Text style={styles.controlButtonText}>
              {isDetecting ? 'Detener' : 'Iniciar'} Detección
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Model Status */}
      <View style={styles.statusBar}>
        <View style={[styles.statusDot, modelReady ? styles.statusDotGreen : styles.statusDotRed]} />
        <Text style={styles.statusText}>
          {modelReady ? 'Modelo listo' : isModelLoading ? 'Cargando modelo...' : 'Error en modelo'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#2C2C2E'
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  speechButton: {
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 20
  },
  speechButtonOff: {
    backgroundColor: '#48484A'
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    backgroundColor: '#000000',
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative'
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1E'
  },
  placeholderText: {
    color: '#666',
    marginTop: 20,
    fontSize: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#007AFF',
    marginTop: 10,
    fontSize: 16
  },
  predictionContainer: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: '#2C2C2E',
    borderRadius: 15,
    alignItems: 'center'
  },
  predictionLabel: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 5
  },
  predictionText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 15,
    textTransform: 'uppercase'
  },
  confidenceBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#48484A',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 3
  },
  confidenceText: {
    color: '#8E8E93',
    fontSize: 14
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    backgroundColor: '#2C2C2E',
    borderRadius: 10
  },
  statItem: {
    alignItems: 'center'
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 5
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold'
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 10
  },
  errorText: {
    color: '#FF3B30',
    marginLeft: 10,
    flex: 1,
    fontSize: 14
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 30
  },
  controlButtonActive: {
    backgroundColor: '#FF3B30'
  },
  controlButtonDisabled: {
    backgroundColor: '#48484A',
    opacity: 0.5
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 30
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8
  },
  statusDotGreen: {
    backgroundColor: '#34C759'
  },
  statusDotRed: {
    backgroundColor: '#FF3B30'
  },
  statusText: {
    color: '#8E8E93',
    fontSize: 14
  }
});

export default DetectScreen;
