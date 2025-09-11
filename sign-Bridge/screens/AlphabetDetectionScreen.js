// screens/AlphabetDetectionScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Simulador de detección integrado directamente
const useDetectionSimulator = () => {
  const [detectedLetter, setDetectedLetter] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  const simulate = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const hasDetection = Math.random() > 0.3;
      
      if (hasDetection) {
        const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
        const randomConfidence = Math.floor(Math.random() * (95 - 30) + 30);
        
        setDetectedLetter(randomLetter);
        setConfidence(randomConfidence);
      } else {
        setDetectedLetter(null);
        setConfidence(0);
      }
      
      setIsProcessing(false);
    }, 800);
  };

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(simulate, 2000);
    return () => clearInterval(interval);
  }, [isActive]);

  return {
    detectedLetter,
    confidence,
    isProcessing,
    isActive,
    start: () => setIsActive(true),
    stop: () => {
      setIsActive(false);
      setDetectedLetter(null);
      setConfidence(0);
      setIsProcessing(false);
    },
    forceDetection: simulate,
  };
};

// Componente de overlay integrado
const DetectionOverlay = ({ detectedLetter, confidence, isProcessing }) => {
  const getConfidenceColor = (conf) => {
    if (conf >= 70) return '#00FF88';
    if (conf >= 40) return '#FFB800';
    return '#FF4444';
  };

  const renderContent = () => {
    if (isProcessing) {
      return (
        <View style={overlayStyles.contentContainer}>
          <Ionicons name="sync" size={40} color="#00FF88" />
          <Text style={overlayStyles.processingText}>Procesando...</Text>
        </View>
      );
    }

    if (detectedLetter && confidence !== null) {
      const confidenceColor = getConfidenceColor(confidence);
      
      return (
        <View style={overlayStyles.contentContainer}>
          <Text style={overlayStyles.detectedLetter}>{detectedLetter}</Text>
          
          <View style={overlayStyles.confidenceContainer}>
            <Text style={overlayStyles.confidenceLabel}>
              Confianza: {confidence}%
            </Text>
            
            <View style={overlayStyles.confidenceBar}>
              <View 
                style={[
                  overlayStyles.confidenceFill, 
                  { 
                    width: `${Math.min(confidence, 100)}%`,
                    backgroundColor: confidenceColor
                  }
                ]} 
              />
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={overlayStyles.contentContainer}>
        <Ionicons name="hand-left" size={60} color="#CCCCCC" />
        <Text style={overlayStyles.noDetectionText}>
          Muestra una letra con tu mano
        </Text>
      </View>
    );
  };

  return (
    <View style={overlayStyles.overlay}>
      <View style={overlayStyles.detectionBox}>
        {renderContent()}
      </View>
    </View>
  );
};

const overlayStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  detectionBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    minWidth: 250,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  detectedLetter: {
    color: '#00FF88',
    fontSize: 80,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  confidenceContainer: {
    alignItems: 'center',
    width: '100%',
  },
  confidenceLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  confidenceBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  noDetectionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 15,
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
});

const AlphabetDetectionScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [isLoading, setIsLoading] = useState(true);
  
  const detection = useDetectionSimulator();
  const cameraRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsLoading(false);
      const result = await requestPermission();
      if (result?.granted) {
        setTimeout(() => {
          detection.start();
        }, 500);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      detection.stop();
    };
  }, []);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleDetection = () => {
    if (detection.isActive) {
      detection.stop();
    } else {
      detection.start();
    }
  };

  const handleLetterPress = (letter) => {
    Alert.alert(
      `Letra ${letter}`,
      `Has seleccionado la letra ${letter}. Esta función se expandirá para mostrar más información sobre cómo hacer esta letra.`,
      [{ text: 'OK', style: 'default' }]
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

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar style="light" />
        <Ionicons name="camera" size={80} color="#FFB800" />
        <Text style={styles.loadingText}>Verificando permisos...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar style="light" />
        <Ionicons name="camera-off" size={80} color="#FF4444" />
        <Text style={styles.errorText}>Sin acceso a la cámara</Text>
        <Text style={styles.subtitleText}>
          SignBridge necesita acceso a la cámara para detectar letras del alfabeto de señas
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Solicitar permisos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SignBridge</Text>
        <Text style={styles.headerSubtitle}>Detección de Alfabeto</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={facing}
          ref={cameraRef}
        />
        
        <View style={styles.frameGuide}>
          <View style={styles.corner} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
        </View>

        <DetectionOverlay
          detectedLetter={detection.detectedLetter}
          confidence={detection.confidence}
          isProcessing={detection.isProcessing}
        />

        <View style={styles.statusContainer}>
          <View style={styles.statusIndicator}>
            <Ionicons 
              name={detection.isActive ? "camera" : "camera-off"} 
              size={16} 
              color={detection.isActive ? "#00FF88" : "#FFB800"} 
            />
            <Text style={styles.statusText}>
              {detection.isActive ? 'Detectando' : 'Pausado'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
          <Ionicons name="camera-reverse" size={24} color="#fff" />
          <Text style={styles.controlButtonText}>
            {facing === 'back' ? 'Frontal' : 'Trasera'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={detection.forceDetection}>
          <Ionicons name="refresh" size={24} color="#00FF88" />
          <Text style={styles.controlButtonText}>Detectar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={toggleDetection}>
          <Ionicons 
            name={detection.isActive ? "pause" : "play"} 
            size={24} 
            color={detection.isActive ? "#FFB800" : "#00FF88"} 
          />
          <Text style={styles.controlButtonText}>
            {detection.isActive ? 'Pausar' : 'Iniciar'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.alphabetPanel}>
        <Text style={styles.alphabetTitle}>
          Alfabeto de Referencia {detection.detectedLetter ? `- ${detection.detectedLetter}` : ''}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.alphabetRow}>
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map((letter) => (
              <TouchableOpacity
                key={letter}
                style={[
                  styles.letterBox,
                  detection.detectedLetter === letter && styles.letterBoxActive
                ]}
                onPress={() => handleLetterPress(letter)}
              >
                <Text style={[
                  styles.letterText,
                  detection.detectedLetter === letter && styles.letterTextActive
                ]}>
                  {letter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
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
    paddingVertical: 15,
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
  alphabetPanel: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  alphabetTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  alphabetRow: {
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  letterBox: {
    width: 35,
    height: 35,
    backgroundColor: '#333',
    margin: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterBoxActive: {
    backgroundColor: '#00FF88',
    transform: [{ scale: 1.1 }],
  },
  letterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  letterTextActive: {
    color: '#000',
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