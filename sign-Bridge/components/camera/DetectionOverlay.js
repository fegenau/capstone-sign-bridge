// src/components/DetectionOverlay.js
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DetectionOverlay = ({ 
  detectedLetter, 
  confidence, 
  isProcessing, 
  isVisible = true 
}) => {
  
  const getConfidenceColor = (conf) => {
    if (conf >= 70) return '#00FF88'; // Verde - Alta confianza
    if (conf >= 40) return '#FFB800'; // Amarillo - Media confianza
    return '#FF4444'; // Rojo - Baja confianza
  };

  const getConfidenceText = (conf) => {
    if (conf >= 70) return 'Excelente';
    if (conf >= 40) return 'Buena';
    return 'Baja';
  };

  const renderContent = () => {
    // Estado de procesamiento
    if (isProcessing) {
      return (
        <View style={styles.contentContainer}>
          <View style={styles.processingContainer}>
            <Ionicons name="sync" size={40} color="#00FF88" />
            <Text style={styles.processingText}>Procesando...</Text>
          </View>
        </View>
      );
    }

    // Estado con letra detectada
    if (detectedLetter && confidence !== null) {
      const confidenceColor = getConfidenceColor(confidence);
      const confidenceLabel = getConfidenceText(confidence);
      
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.detectedLetter}>{detectedLetter}</Text>
          
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>
              Confianza: {confidenceLabel}
            </Text>
            <Text style={styles.confidencePercent}>
              {confidence}%
            </Text>
            
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
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

    // Estado sin detección
    return (
      <View style={styles.contentContainer}>
        <View style={styles.noDetectionContainer}>
          <Ionicons name="hand-left" size={60} color="#CCCCCC" />
          <Text style={styles.noDetectionText}>
            Muestra una letra con tu mano
          </Text>
          <Text style={styles.noDetectionSubtext}>
            Colócala dentro del marco verde
          </Text>
        </View>
      </View>
    );
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.detectionBox}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none', // Permite tocar la cámara debajo
  },
  
  detectionBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    minWidth: 250,
    maxWidth: 320,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  contentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  
  // Letra detectada
  detectedLetter: {
    color: '#00FF88',
    fontSize: 80,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 90,
  },
  
  // Confianza
  confidenceContainer: {
    alignItems: 'center',
    width: '100%',
  },
  
  confidenceLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  
  confidencePercent: {
    color: '#CCCCCC',
    fontSize: 14,
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
    minWidth: 2, // Mínimo visible
  },
  
  // Estado sin detección
  noDetectionContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  
  noDetectionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 8,
  },
  
  noDetectionSubtext: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
  },
  
  // Estado de procesamiento
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  
  processingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
});

export default DetectionOverlay;