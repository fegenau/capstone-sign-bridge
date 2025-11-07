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

const NumberDetectionScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [isLoading, setIsLoading] = useState(true);
  const [detectedNumber, setDetectedNumber] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetectionActive, setIsDetectionActive] = useState(false);
  const cameraRef = useRef(null);
  const [webStream, setWebStream] = useState(null);
  const [webError, setWebError] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsLoading(true);
      const getWebcam = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user'
            }
          });
          
          console.log('🌐 Stream de cámara obtenido (Números):', stream.active);
          setWebStream(stream);
          setWebError(null);
          
          // Esperar a que el videoRef esté disponible
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (videoRef.current && stream.active) {
            videoRef.current.srcObject = stream;
            
            // Forzar reproducción del video
            videoRef.current.onloadedmetadata = () => {
              console.log('✅ Video metadata cargado (Números)');
              videoRef.current.play()
                .then(() => {
                  console.log('✅ Video reproduciendo correctamente (Números)');
                  setIsLoading(false);
                  setIsDetectionActive(true);
                  startDetection();
                })
                .catch(err => {
                  console.error('❌ Error al reproducir video:', err);
                  setWebError("Error al iniciar video de cámara");
                  setIsLoading(false);
                });
            };
          } else {
            console.error('❌ videoRef no disponible o stream inactivo');
            setIsLoading(false);
          }
        } catch (err) {
          console.error('❌ Error al acceder a la cámara:', err);
          setWebError('No se pudo acceder a la cámara. Verifica los permisos.');
          setIsLoading(false);
        }
      };
      getWebcam();
      return () => {
        stopDetection();
        if (webStream) {
          webStream.getTracks().forEach(track => track.stop());
        }
      };
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false);
        startDetection();
      }, 1000);
      return () => {
        clearTimeout(timer);
        stopDetection();
      };
    }
  }, []);

  const startDetection = async () => {
    try {
      setIsDetectionActive(true);
      setIsProcessing(true);
      
      // Mock de detección de números cada 2 segundos
      const interval = setInterval(() => {
        const randomNumber = Math.floor(Math.random() * 10); // 0-9
        const randomConfidence = Math.floor(Math.random() * 40) + 60; // 60-100%
        
        setDetectedNumber(randomNumber);
        setConfidence(randomConfidence);
        
        console.log(`📊 Número: ${randomNumber} (${randomConfidence}%)`);
      }, 2000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error al iniciar detección:', error);
      Alert.alert('Error', 'No se pudo iniciar la detección');
    }
  };

  const stopDetection = () => {
    try {
      setIsDetectionActive(false);
      setDetectedNumber(null);
      setConfidence(0);
      setIsProcessing(false);
      console.log('Detección detenida');
    } catch (error) {
      console.error('Error al detener detección:', error);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleDetection = () => {
    if (isDetectionActive) {
      stopDetection();
    } else {
      startDetection();
    }
  };

  const handleNumberPress = (number) => {
    Alert.alert(
      `Número ${number}`,
      `Has seleccionado el número ${number}. Esta función se expandirá para mostrar más información.`,
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

  if (Platform.OS === 'web') {
    if (webError) {
      return (
        <View style={styles.centerContainer}>
          <StatusBar style="light" />
          <Ionicons name="camera-off" size={80} color="#FF4444" />
          <Text style={styles.errorText}>Sin acceso a la cámara</Text>
          <Text style={styles.subtitleText}>{webError}</Text>
        </View>
      );
    }
  } else {
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
            SignBridge necesita acceso a la cámara para detectar números
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Solicitar permisos</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>SignBridge</Text>
          <Text style={styles.headerSubtitle}>Detección de Números</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Vista de Cámara multiplataforma */}
      <View style={styles.cameraContainer}>
        {Platform.OS === 'web' ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              webkit-playsinline="true"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                background: '#000',
                display: 'block'
              }}
              id="webcam-video-numbers"
              onLoadedData={() => console.log('📹 Video data loaded (Números)')}
              onPlay={() => console.log('▶️ Video playing (Números)')}
              onError={(e) => console.error('❌ Video error (Números):', e)}
            />
            {/* Overlay de detección */}
            {isProcessing && detectedNumber !== null && confidence > 60 ? (
              <View style={styles.detectionOverlay}>
                <View style={styles.detectionBox}>
                  <Text style={styles.detectedText}>{detectedNumber}</Text>
                  <View style={styles.confidenceContainer}>
                    <View 
                      style={[
                        styles.confidenceBar, 
                        { 
                          width: `${confidence}%`,
                          backgroundColor: 
                            confidence > 80 ? '#00FF88' :
                            confidence > 60 ? '#FFD700' : '#FF6B6B'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.confidenceText}>{confidence}% confianza</Text>
                </View>
              </View>
            ) : (
              <View style={styles.detectionOverlay}>
                <View style={styles.waitingBox}>
                  <Text style={styles.waitingText}>
                    {isProcessing ? 'Muestra un número' : 'Pausado'}
                  </Text>
                </View>
              </View>
            )}
          </>
        ) : (
          <>
            <CameraView
              style={styles.camera}
              facing={facing}
              ref={cameraRef}
            />
            {/* Overlay de detección */}
            {isProcessing && detectedNumber !== null && confidence > 60 ? (
              <View style={styles.detectionOverlay}>
                <View style={styles.detectionBox}>
                  <Text style={styles.detectedText}>{detectedNumber}</Text>
                  <View style={styles.confidenceContainer}>
                    <View 
                      style={[
                        styles.confidenceBar, 
                        { 
                          width: `${confidence}%`,
                          backgroundColor: 
                            confidence > 80 ? '#00FF88' :
                            confidence > 60 ? '#FFD700' : '#FF6B6B'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.confidenceText}>{confidence}% confianza</Text>
                </View>
              </View>
            ) : (
              <View style={styles.detectionOverlay}>
                <View style={styles.waitingBox}>
                  <Text style={styles.waitingText}>
                    {isProcessing ? 'Muestra un número' : 'Pausado'}
                  </Text>
                </View>
              </View>
            )}
          </>
        )}

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
            <Ionicons
              name={isDetectionActive ? "camera" : "camera-off"}
              size={16}
              color={isDetectionActive ? "#00FF88" : "#FFB800"}
            />
            <Text style={styles.statusText}>
              {isDetectionActive ? 'Detectando' : 'Pausado'}
            </Text>
          </View>
        </View>
      </View>

      {/* Controles */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
          <Ionicons name="camera-reverse" size={24} color="#fff" />
          <Text style={styles.controlButtonText}>
            {facing === 'back' ? 'Frontal' : 'Trasera'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={toggleDetection}>
          <Ionicons 
            name={isDetectionActive ? "pause" : "play"} 
            size={24} 
            color={isDetectionActive ? "#FFB800" : "#00FF88"} 
          />
          <Text style={styles.controlButtonText}>
            {isDetectionActive ? 'Pausar' : 'Iniciar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Panel de estado */}
      <View style={styles.statusPanel}>
        <View style={styles.statusItem}>
          <Ionicons 
            name={isDetectionActive ? "radio-button-on" : "radio-button-off"} 
            size={16} 
            color={isDetectionActive ? "#00FF88" : "#666"} 
          />
          <Text style={styles.statusItemText}>
            {isDetectionActive ? 'Detección activa' : 'Detección pausada'}
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Ionicons name="camera" size={16} color="#00FF88" />
          <Text style={styles.statusItemText}>
            Cámara {facing === 'back' ? 'trasera' : 'frontal'}
          </Text>
        </View>
        
        {detectedNumber !== null && (
          <View style={styles.statusItem}>
            <Ionicons name="checkmark-circle" size={16} color="#00FF88" />
            <Text style={styles.statusItemText}>
              Detectado: {detectedNumber} ({confidence}%)
            </Text>
          </View>
        )}
      </View>

      {/* Panel de números */}
      <View style={styles.numbersPanel}>
        <Text style={styles.numbersTitle}>
          Números de Referencia {detectedNumber !== null ? `- ${detectedNumber}` : ''}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.numbersRow}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
              <TouchableOpacity
                key={number}
                style={[
                  styles.numberBox,
                  detectedNumber === number && styles.numberBoxActive
                ]}
                onPress={() => handleNumberPress(number)}
              >
                <Text style={[
                  styles.numberText,
                  detectedNumber === number && styles.numberTextActive
                ]}>
                  {number}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40,
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
  detectionOverlay: {
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#00FF88',
  },
  detectedText: {
    fontSize: 100,
    fontWeight: 'bold',
    color: '#00FF88',
    marginBottom: 10,
  },
  confidenceContainer: {
    width: 200,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  confidenceBar: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  waitingBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  waitingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  frameGuide: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    bottom: '35%',
    pointerEvents: 'none',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#4A90E2',
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
    pointerEvents: 'none',
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
  statusPanel: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  statusItemText: {
    color: '#CCCCCC',
    fontSize: 12,
    marginLeft: 8,
  },
  numbersPanel: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  numbersTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  numbersRow: {
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  numberBox: {
    width: 50,
    height: 50,
    backgroundColor: '#333',
    margin: 4,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberBoxActive: {
    backgroundColor: '#4A90E2',
    transform: [{ scale: 1.15 }],
    borderWidth: 2,
    borderColor: '#fff',
  },
  numberText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  numberTextActive: {
    color: '#fff',
  },
});

export default NumberDetectionScreen;