import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Text,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { wordDetectionService } from '../utils/services/wordDetectionService';
import { DetectionResultCard } from '../components/detection/DetectionResultCard';
import { AudioButton } from '../components/detection/AudioButton';
import { DetectionHistory } from '../components/detection/DetectionHistory';

const WordDetectionScreen = ({ navigation }) => {
  const [detectedWord, setDetectedWord] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingMessage, setLoadingMessage] = useState('Inicializando...');

  // Inicialización del modelo
  useEffect(() => {
    const initializeDetection = async () => {
      try {
        setLoadingMessage('Cargando modelo TensorFlow.js...');
        wordDetectionService.setDebugMode(true);
        
        await wordDetectionService.loadModel();
        setIsModelReady(true);
        setLoadingMessage('Modelo cargado exitosamente');
        
        console.log('✅ Modelo cargado:', wordDetectionService.getStatus());
      } catch (error) {
        console.error('❌ Error inicializando:', error);
        setLoadingMessage('Error al cargar el modelo');
        Alert.alert(
          'Error',
          'No se pudo cargar el modelo de detección: ' + error.message,
          [{ text: 'OK' }]
        );
      }
    };

    initializeDetection();

    return () => {
      wordDetectionService.stopDetection();
    };
  }, []);

  // Listener de eventos de detección
  useEffect(() => {
    const handleDetectionResult = (result) => {
      if (result.isProcessing !== undefined) {
        setIsProcessing(result.isProcessing);
      }
      
      if (result.word && result.isValid) {
        setDetectedWord(result.word);
        setConfidence(result.confidence);
        console.log('🎯 Detección:', result.word, `(${result.confidence}%)`);
      }
      
      if (result.detectionStarted) {
        setIsDetecting(true);
        console.log('▶️  Detección iniciada');
      }
      
      if (result.detectionStopped) {
        setIsDetecting(false);
        console.log('⏹️  Detección detenida');
      }
      
      if (result.modelError || result.detectionError) {
        Alert.alert('Error', result.modelError || result.detectionError);
      }
    };

    wordDetectionService.onDetection(handleDetectionResult);
    
    return () => {
      wordDetectionService.offDetection(handleDetectionResult);
    };
  }, []);

  const startDetection = () => {
    if (!isModelReady) {
      Alert.alert(
        'Espera',
        'El modelo aún se está cargando. Por favor espera un momento.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    const success = wordDetectionService.startDetection();
    if (!success) {
      Alert.alert('Error', 'No se pudo iniciar la detección');
    }
  };

  const stopDetection = () => {
    wordDetectionService.stopDetection();
  };

  const confirmDetection = () => {
    if (detectedWord) {
      const newItem = {
        word: detectedWord,
        confidence,
        timestamp: Date.now()
      };
      
      setHistory([newItem, ...history.slice(0, 9)]);
      setDetectedWord(null);
      setConfidence(0);
      
      // Continuar detectando
      setTimeout(() => {
        if (isModelReady) {
          wordDetectionService.startDetection();
        }
      }, 500);
    }
  };

  const retryDetection = () => {
    setDetectedWord(null);
    setConfidence(0);
    wordDetectionService.smoothingBuffer = [];
    
    setTimeout(() => {
      if (isModelReady) {
        wordDetectionService.startDetection();
      }
    }, 500);
  };

  const clearHistory = () => {
    Alert.alert(
      'Limpiar Historial',
      '¿Estás seguro de que deseas limpiar el historial?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: () => setHistory([])
        }
      ]
    );
  };

  const showMetrics = () => {
    const metrics = wordDetectionService.getMetrics();
    const status = wordDetectionService.getStatus();
    
    Alert.alert(
      'Métricas de Performance',
      `Total inferencias: ${metrics.totalInferences}
Detecciones: ${metrics.detectionsMade}
Tasa éxito: ${metrics.successRate}%
Tiempo promedio: ${metrics.averageInferenceTime}ms
Memoria pico: ${metrics.peakMemory}MB
Backend: ${status.backend}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Detección de Palabras</Text>
        </View>
        <TouchableOpacity onPress={showMetrics}>
          <Ionicons name="analytics" size={24} color="#00FF88" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Card de resultado */}
        {(detectedWord || isProcessing) && (
          <>
            <DetectionResultCard 
              word={detectedWord}
              confidence={confidence}
              isProcessing={isProcessing}
            />
            
            {detectedWord && !isProcessing && (
              <>
                {/* Botón de audio */}
                <View style={styles.audioContainer}>
                  <AudioButton word={detectedWord} />
                </View>
                
                {/* Botones de feedback */}
                <View style={styles.feedbackContainer}>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={confirmDetection}
                  >
                    <Ionicons name="checkmark" size={28} color="#000" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={retryDetection}
                  >
                    <Ionicons name="refresh" size={28} color="#FFB800" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </>
        )}

        {/* Controles principales */}
        <View style={styles.mainControls}>
          <TouchableOpacity
            style={[
              styles.mainButton,
              isDetecting && styles.mainButtonActive,
              !isModelReady && styles.mainButtonDisabled
            ]}
            onPress={isDetecting ? stopDetection : startDetection}
            disabled={!isModelReady}
          >
            <Ionicons 
              name={isDetecting ? "stop" : "play"} 
              size={40} 
              color={isDetecting ? "#FFB800" : "#00FF88"}
            />
          </TouchableOpacity>
        </View>

        {/* Status del modelo */}
        <View style={styles.statusContainer}>
          <Ionicons 
            name={isModelReady ? "checkmark-circle" : "hourglass"}
            size={20}
            color={isModelReady ? "#00FF88" : "#FFB800"}
          />
          <Text style={styles.statusText}>
            {isModelReady ? '✅ Modelo listo' : `⏳ ${loadingMessage}`}
          </Text>
        </View>

        {/* Instrucciones */}
        {!isDetecting && !detectedWord && isModelReady && (
          <View style={styles.instructionsContainer}>
            <Ionicons name="information-circle" size={24} color="#00FF88" />
            <Text style={styles.instructionsText}>
              Presiona el botón de reproducción para comenzar a detectar palabras en lengua de señas
            </Text>
          </View>
        )}

        {/* Historial */}
        {history.length > 0 && (
          <DetectionHistory 
            history={history}
            onClear={clearHistory}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center'
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    paddingVertical: 16
  },
  audioContainer: {
    alignItems: 'center',
    marginTop: 12
  },
  feedbackContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    marginHorizontal: 20
  },
  confirmButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00FF88',
    justifyContent: 'center',
    alignItems: 'center'
  },
  retryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
    borderWidth: 2,
    borderColor: '#FFB800',
    justifyContent: 'center',
    alignItems: 'center'
  },
  mainControls: {
    alignItems: 'center',
    marginVertical: 24
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 3,
    borderColor: '#00FF88',
    justifyContent: 'center',
    alignItems: 'center'
  },
  mainButtonActive: {
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
    borderColor: '#FFB800'
  },
  mainButtonDisabled: {
    opacity: 0.5
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16
  },
  statusText: {
    color: '#ccc',
    fontSize: 14,
    marginLeft: 8
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 16
  },
  instructionsText: {
    color: '#00FF88',
    fontSize: 14,
    marginLeft: 12,
    flex: 1
  }
});

export default WordDetectionScreen;
