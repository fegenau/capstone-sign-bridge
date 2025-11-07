import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import DetectionOverlay from "../components/camera/DetectionOverlay";
import { detectionService } from "../utils/services/detectionService";

const AlphabetDetectionScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const [isLoading, setIsLoading] = useState(true);
  const [detectedLetter, setDetectedLetter] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetectionActive, setIsDetectionActive] = useState(false);
  const cameraRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  // Web-specific
  const [webStream, setWebStream] = useState(null);
  const [webError, setWebError] = useState(null);
  const videoRef = useRef(null);
  const screenMountedRef = useRef(true);

  useEffect(() => {
    screenMountedRef.current = true;
    if (Platform.OS === "web") {
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
          
          console.log('🌐 Stream de cámara obtenido:', stream.active);
          setWebStream(stream);
          setWebError(null);
          
          // Esperar a que el videoRef esté disponible
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (videoRef.current && stream.active) {
            videoRef.current.srcObject = stream;
            
            // Forzar reproducción del video
            videoRef.current.onloadedmetadata = () => {
              console.log('✅ Video metadata cargado');
              videoRef.current.play()
                .then(() => {
                  console.log('✅ Video reproduciendo correctamente');
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
          setWebError("No se pudo acceder a la cámara. Verifica los permisos.");
          setIsLoading(false);
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
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false);
        startDetection();
      }, 1000);
      return () => {
        clearTimeout(timer);
        detectionService.stopDetection();
        screenMountedRef.current = false;
      };
    }
  }, []);
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
      if (Platform.OS === "web") {
        // En web mantenemos la simulación/flujo actual
        await detectionService.forceDetection();
        return;
      }

      // En nativo: tomar una foto rápida y pasar el URI al servicio
      if (!cameraRef.current || !isCameraReady) {
        console.warn("Cámara no lista aún para capturar");
        await detectionService.forceDetection();
        return;
      }

      if (isCapturing) {
        return; // evitar capturas concurrentes
      }
      setIsCapturing(true);
      let attempts = 0;
      let done = false;
      let lastError = null;
      while (!done && attempts < 2) {
        try {
          // pequeña espera por si acaba de montarse
          await new Promise((r) => setTimeout(r, attempts === 0 ? 50 : 200));
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.5,
            skipProcessing: true,
            base64: false,
            exif: false,
          });
          if (!screenMountedRef.current) return;
          const uri = photo?.uri || photo?.localUri;
          await detectionService.forceDetection({ uri });
          done = true;
        } catch (err) {
          lastError = err;
          const msg = String(err?.message || err);
          if (/unmounted/i.test(msg)) {
            // reintentar una vez tras breve espera
            attempts += 1;
            continue;
          }
          throw err;
        }
      }
      if (!done && lastError) throw lastError;
    } catch (error) {
      console.error("Error en detección manual:", error);
      Alert.alert("Error", "Error en detección manual");
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleCameraFacing = () => {
    // Al cambiar de cámara, la vista se re-monta; marcamos como no lista hasta onCameraReady
    setIsCameraReady(false);
    setFacing((current) => (current === "back" ? "front" : "back"));
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
      <View style={styles.centerContainer}>
        <StatusBar style="light" />
        <Ionicons name="camera" size={80} color="#00FF88" />
        <Text style={styles.loadingText}>Inicializando cámara...</Text>
      </View>
    );
  }

  if (Platform.OS === "web") {
    if (webError) {
      return (
        <View style={styles.centerContainer}>
          <StatusBar style="light" />
          <Ionicons name="close-circle-outline" size={80} color="#FF4444" />
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
          <Ionicons name="close-circle-outline" size={80} color="#FF4444" />
          <Text style={styles.errorText}>Sin acceso a la cámara</Text>
          <Text style={styles.subtitleText}>
            SignBridge necesita acceso a la cámara para detectar letras
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
          <Text style={styles.headerSubtitle}>Detección de Alfabeto</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Vista de Cámara multiplataforma */}
      <View style={styles.cameraContainer}>
        {Platform.OS === "web" ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              webkit-playsinline="true"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                background: "#000",
                display: "block",
              }}
              id="webcam-video-alphabet"
              onLoadedData={() => console.log('📹 Video data loaded')}
              onPlay={() => console.log('▶️ Video playing')}
              onError={(e) => console.error('❌ Video error:', e)}
            />
            {/* Overlay de detección */}
            <DetectionOverlay
              detectedLetter={detectedLetter}
              confidence={confidence}
              isProcessing={isProcessing}
              isVisible={true}
            />
          </>
        ) : (
          <>
            <CameraView
              style={styles.camera}
              facing={facing}
              active={true}
              onCameraReady={() => setIsCameraReady(true)}
              onMountError={(e) => {
                console.error("Error montando cámara:", e?.nativeEvent || e);
                setIsCameraReady(false);
              }}
              ref={cameraRef}
            />
            {/* Overlay de detección */}
            <DetectionOverlay
              detectedLetter={detectedLetter}
              confidence={confidence}
              isProcessing={isProcessing}
              isVisible={true}
            />
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
    paddingTop: Platform.OS === "ios" ? 60 : 40,
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
