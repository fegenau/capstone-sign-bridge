import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../context/ThemeContext";
import DetectionOverlay from "../components/camera/DetectionOverlay";
import { detectionService } from "../utils/services/detectionService";

const AlphabetDetectionScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [detectedLetter, setDetectedLetter] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetectionActive, setIsDetectionActive] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facing, setFacing] = useState("front");
  const [webStream, setWebStream] = useState(null);
  const [webError, setWebError] = useState(null);
  const videoRef = useRef(null);
  const screenMountedRef = useRef(true);

  useEffect(() => {
    screenMountedRef.current = true;
    setIsLoading(true);

    const getWebcam = async () => {
      try {
        // Request camera with specific constraints for better compatibility
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: facing === "front" ? "user" : "environment",
          },
          audio: false,
        });

        if (!screenMountedRef.current) return;

        setWebStream(stream);
        setWebError(null);

        // Ensure video element gets the stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Ensure video plays
          videoRef.current.play().catch(err => {
            console.warn("Video play failed:", err);
          });
        }

        setIsLoading(false);
        setIsDetectionActive(true);
        startDetection();

      } catch (err) {
        if (screenMountedRef.current) {
          let errorMsg = "No se pudo acceder a la cámara.";
          if (err.name === "NotAllowedError") {
            errorMsg = "Permiso de cámara denegado. Por favor, permite el acceso.";
          } else if (err.name === "NotFoundError") {
            errorMsg = "No se encontró ninguna cámara en el dispositivo.";
          } else if (err.name === "NotReadableError") {
            errorMsg = "La cámara está siendo usada por otra aplicación.";
          }
          setWebError(errorMsg);
          setIsLoading(false);
          console.error("Camera error:", err);
        }
      }
    };

    getWebcam();

    return () => {
      detectionService.stopDetection();
      if (webStream) {
        webStream.getTracks().forEach((track) => track.stop());
      }
      screenMountedRef.current = false;
    };
  }, [facing]);
  useEffect(() => {
    const handleDetectionResult = (result) => {
      if (result.isProcessing !== undefined) {
        setIsProcessing(result.isProcessing);
      }
      if (result.letter !== undefined) {
        setDetectedLetter(result.letter);
        setConfidence(result.confidence || 0);
      }
    };

    detectionService.onDetection(handleDetectionResult);
    return () => {
      detectionService.offDetection(handleDetectionResult);
    };
  }, []);

  const startDetection = async () => {
    try {
      setIsDetectionActive(true);
      await detectionService.startDetection();
      console.log("Detección iniciada");
    } catch (error) {
      console.error("Error al iniciar detección:", error);
      Alert.alert("Error", "No se pudo iniciar la detección");
    }
  };

  const stopDetection = () => {
    try {
      setIsDetectionActive(false);
      detectionService.stopDetection();
      setDetectedLetter(null);
      setConfidence(0);
      setIsProcessing(false);
      console.log("Detección detenida");
    } catch (error) {
      console.error("Error al detener detección:", error);
    }
  };

  const forceDetection = async () => {
    try {
      // Solo web - simulación directa
      await detectionService.forceDetection();
      return;
      return; 
    } catch (error) {
      console.error("Error en detección manual:", error);
      Alert.alert("Error", "Error en detección manual");
    }
  };

  const toggleCameraFacing = () => {
    // Stop detection when switching cameras
    if (isDetectionActive) {
      stopDetection();
    }

    // Stop current stream before switching
    if (webStream) {
      webStream.getTracks().forEach((track) => track.stop());
      setWebStream(null);
    }

    // Toggle facing mode - useEffect will handle camera reinitialization
    setFacing((current) => (current === "back" ? "front" : "back"));
    setIsLoading(true);
  };

  const toggleDetection = () => {
    if (isDetectionActive) {
      stopDetection();
    } else {
      startDetection();
    }
  };

  const handleLetterPress = (letter) => {
    Alert.alert(
      `Letra ${letter}`,
      `Has seleccionado la letra ${letter}. Esta función se expandirá para mostrar más información sobre cómo hacer esta letra.`,
      [{ text: "OK", style: "default" }]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.darkBackground }]}>
        <StatusBar style="light" />
        <Ionicons name="camera" size={80} color={colors.neonGreen} />
        <Text style={[styles.loadingText, { color: colors.textPrimary }]}>Inicializando cámara...</Text>
      </View>
    );
  }

  if (webError) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.darkBackground }]}>
        <StatusBar style="light" />
        <Ionicons name="close-circle-outline" size={80} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.textPrimary }]}>Sin acceso a la cámara</Text>
        <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>{webError}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.darkBackground }]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.darkSurface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>SignBridge</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Detección de Alfabeto</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Vista de Cámara Web */}
      <View style={styles.cameraContainer}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            backgroundColor: "#222",
            transform: facing === "front" ? "scaleX(-1)" : "scaleX(1)",
          }}
          id="webcam-video-alphabet"
          onLoadedMetadata={() => {
            console.log("✓ Video stream loaded successfully");
          }}
          onError={(err) => {
            console.error("✗ Video element error:", err);
            setWebError("Error al reproducir el stream de video");
          }}
        />
        {/* Overlay de detección */}
        <DetectionOverlay
          detectedLetter={detectedLetter}
          confidence={confidence}
          isProcessing={isProcessing}
          isVisible={true}
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
            <Ionicons
              name={isDetectionActive ? "camera" : "close-circle-outline"}
              size={16}
              color={isDetectionActive ? "#00FF88" : "#FFB800"}
            />
            <Text style={styles.statusText}>
              {isDetectionActive ? "Detectando" : "Pausado"}
            </Text>
          </View>
        </View>
      </View>

      {/* Controles actualizados */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleCameraFacing}
        >
          <Ionicons name="camera-reverse" size={24} color="#fff" />
          <Text style={styles.controlButtonText}>
            {facing === "back" ? "Frontal" : "Trasera"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={forceDetection}>
          <Ionicons name="refresh" size={24} color="#00FF88" />
          <Text style={styles.controlButtonText}>Detectar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleDetection}
        >
          <Ionicons
            name={isDetectionActive ? "pause" : "play"}
            size={24}
            color={isDetectionActive ? "#FFB800" : "#00FF88"}
          />
          <Text style={styles.controlButtonText}>
            {isDetectionActive ? "Pausar" : "Iniciar"}
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
            {isDetectionActive ? "Detección activa" : "Detección pausada"}
          </Text>
        </View>

        <View style={styles.statusItem}>
          <Ionicons name="camera" size={16} color="#00FF88" />
          <Text style={styles.statusItemText}>
            Cámara {facing === "back" ? "trasera" : "frontal"}
          </Text>
        </View>

        {detectedLetter && (
          <View style={styles.statusItem}>
            <Ionicons name="checkmark-circle" size={16} color="#00FF88" />
            <Text style={styles.statusItemText}>
              Detectada: {detectedLetter} ({confidence}%)
            </Text>
          </View>
        )}
      </View>

      {/* Panel de alfabeto */}
      <View style={styles.alphabetPanel}>
        <Text style={styles.alphabetTitle}>
          Alfabeto de Referencia {detectedLetter ? `- ${detectedLetter}` : ""}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.alphabetRow}>
            {[
              "A",
              "B",
              "C",
              "D",
              "E",
              "F",
              "G",
              "H",
              "I",
              "J",
              "K",
              "L",
              "M",
              "N",
              "O",
              "P",
              "Q",
              "R",
              "S",
              "T",
              "U",
              "V",
              "W",
              "X",
              "Y",
              "Z",
            ].map((letter) => (
              <TouchableOpacity
                key={letter}
                style={[
                  styles.letterBox,
                  detectedLetter === letter && styles.letterBoxActive,
                ]}
                onPress={() => handleLetterPress(letter)}
              >
                <Text
                  style={[
                    styles.letterText,
                    detectedLetter === letter && styles.letterTextActive,
                  ]}
                >
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
    backgroundColor: "#000000",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
    padding: 20,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerSubtitle: {
    color: "#CCCCCC",
    fontSize: 16,
    textAlign: "center",
    marginTop: 5,
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  frameGuide: {
    position: "absolute",
    top: "20%",
    left: "10%",
    right: "10%",
    bottom: "35%",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#00FF88",
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
    position: "absolute",
    bottom: -40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  guideText: {
    color: "#CCCCCC",
    fontSize: 14,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusContainer: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginLeft: 6,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 8,
  },
  controlButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    color: "#FF4444",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 20,
  },
  subtitleText: {
    color: "#CCCCCC",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#00FF88",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 30,
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  buttonContainer: {
    marginTop: 30,
    width: "100%",
    alignItems: "center",
  },

  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#00FF88",
    marginTop: 15,
  },

  buttonTextSecondary: {
    color: "#00FF88",
  },

  errorDetailText: {
    color: "#FFB800",
    fontSize: 12,
    textAlign: "center",
    marginTop: 15,
    marginHorizontal: 20,
    lineHeight: 18,
  },
  statusPanel: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  statusItemText: {
    color: "#CCCCCC",
    fontSize: 12,
    marginLeft: 8,
  },
  alphabetPanel: {
    backgroundColor: "#1a1a1a",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  alphabetTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  alphabetRow: {
    flexDirection: "row",
    paddingHorizontal: 5,
  },
  letterBox: {
    width: 35,
    height: 35,
    backgroundColor: "#333",
    margin: 2,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  letterBoxActive: {
    backgroundColor: "#00FF88",
    transform: [{ scale: 1.1 }],
  },
  letterText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  letterTextActive: {
    color: "#000",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerSpacer: {
    width: 40,
  },
});

export default AlphabetDetectionScreen;
