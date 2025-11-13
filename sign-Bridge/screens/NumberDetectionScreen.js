import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';

const NumberDetectionScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [detectedNumber, setDetectedNumber] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetectionActive, setIsDetectionActive] = useState(false);
  const [facing, setFacing] = useState('front');
  const [webStream, setWebStream] = useState(null);
  const [webError, setWebError] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    setIsLoading(true);
    const getWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setWebStream(stream);
        setWebError(null);
        setIsLoading(false);
        setIsDetectionActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        startDetection();
      } catch (err) {
        setWebError('No se pudo acceder a la cámara.');
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
  }, []);

  const startDetection = async () => {
    try {
      setIsDetectionActive(true);
      setIsProcessing(true);

      const interval = setInterval(() => {
        const randomNumber = Math.floor(Math.random() * 10);
        const randomConfidence = Math.floor(Math.random() * 40) + 60;

        setDetectedNumber(randomNumber);
        setConfidence(randomConfidence);

        console.log(`Número: ${randomNumber} (${randomConfidence}%)`);
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.darkBackground,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.darkBackground,
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 40,
      paddingBottom: 20,
      paddingHorizontal: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
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
      color: colors.textPrimary,
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    headerSubtitle: {
      color: colors.textSecondary,
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
      borderColor: colors.neonGreen,
    },
    detectedText: {
      fontSize: 100,
      fontWeight: 'bold',
      color: colors.neonGreen,
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
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    waitingBox: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 20,
      borderRadius: 15,
      borderWidth: 2,
      borderColor: colors.border,
    },
    waitingText: {
      color: colors.textPrimary,
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
      borderColor: colors.neonBlue,
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
      color: colors.textSecondary,
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
      color: colors.textPrimary,
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
      borderTopColor: colors.divider,
    },
    controlButton: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      paddingVertical: 8,
    },
    controlButtonText: {
      color: colors.textPrimary,
      fontSize: 11,
      marginTop: 4,
      textAlign: 'center',
    },
    loadingText: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 20,
    },
    errorText: {
      color: colors.error,
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 20,
    },
    subtitleText: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      marginTop: 10,
      lineHeight: 20,
    },
    button: {
      backgroundColor: colors.neonGreen,
      paddingHorizontal: 30,
      paddingVertical: 15,
      borderRadius: 25,
      marginTop: 30,
    },
    buttonText: {
      color: colors.darkBackground,
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    statusPanel: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    statusItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 2,
    },
    statusItemText: {
      color: colors.textSecondary,
      fontSize: 12,
      marginLeft: 8,
    },
    numbersPanel: {
      backgroundColor: colors.darkSurface,
      padding: 15,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    numbersTitle: {
      color: colors.textPrimary,
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
      backgroundColor: colors.darkSurface,
      borderWidth: 1,
      borderColor: colors.border,
      margin: 4,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    numberBoxActive: {
      backgroundColor: colors.neonBlue,
      transform: [{ scale: 1.15 }],
      borderWidth: 2,
      borderColor: colors.textPrimary,
    },
    numberText: {
      color: colors.textPrimary,
      fontSize: 24,
      fontWeight: 'bold',
    },
    numberTextActive: {
      color: colors.textPrimary,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar style="light" />
        <Ionicons name="camera" size={80} color={colors.neonGreen} />
        <Text style={styles.loadingText}>Inicializando cámara...</Text>
      </View>
    );
  }

  if (webError) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar style="light" />
        <Ionicons name="camera-off" size={80} color={colors.error} />
        <Text style={styles.errorText}>Sin acceso a la cámara</Text>
        <Text style={styles.subtitleText}>{webError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>SignBridge</Text>
          <Text style={styles.headerSubtitle}>Detección de Números</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.cameraContainer}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#222' }}
          id="webcam-video-numbers"
        />
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
                        confidence > 80 ? colors.success :
                        confidence > 60 ? colors.warning : colors.error
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

        <View style={styles.statusContainer}>
          <View style={styles.statusIndicator}>
            <Ionicons
              name={isDetectionActive ? "camera" : "camera-off"}
              size={16}
              color={isDetectionActive ? colors.neonGreen : colors.warning}
            />
            <Text style={styles.statusText}>
              {isDetectionActive ? 'Detectando' : 'Pausado'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
          <Ionicons name="camera-reverse" size={24} color={colors.textPrimary} />
          <Text style={styles.controlButtonText}>
            {facing === 'back' ? 'Frontal' : 'Trasera'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={toggleDetection}>
          <Ionicons
            name={isDetectionActive ? "pause" : "play"}
            size={24}
            color={isDetectionActive ? colors.warning : colors.neonGreen}
          />
          <Text style={styles.controlButtonText}>
            {isDetectionActive ? 'Pausar' : 'Iniciar'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusPanel}>
        <View style={styles.statusItem}>
          <Ionicons
            name={isDetectionActive ? "radio-button-on" : "radio-button-off"}
            size={16}
            color={isDetectionActive ? colors.neonGreen : colors.textTertiary}
          />
          <Text style={styles.statusItemText}>
            {isDetectionActive ? 'Detección activa' : 'Detección pausada'}
          </Text>
        </View>

        <View style={styles.statusItem}>
          <Ionicons name="camera" size={16} color={colors.neonGreen} />
          <Text style={styles.statusItemText}>
            Cámara {facing === 'back' ? 'trasera' : 'frontal'}
          </Text>
        </View>

        {detectedNumber !== null && (
          <View style={styles.statusItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.neonGreen} />
            <Text style={styles.statusItemText}>
              Detectado: {detectedNumber} ({confidence}%)
            </Text>
          </View>
        )}
      </View>

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

export default NumberDetectionScreen;
