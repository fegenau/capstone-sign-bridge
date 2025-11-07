// src/components/DetectionOverlay.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DetectionOverlay = ({ 
  detectedLetter, 
  confidence, 
  isProcessing,
  type = 'letter', 
  isVisible = true 
}) => {
  
  const getConfidenceColor = (conf) => {
    if (conf >= 70) return '#00FF88'; // Verde - Alta confianza
    if (conf >= 50) return '#FFB800'; // Amarillo - Media confianza
    return '#FF4444'; // Rojo - Baja confianza
  };

  const renderContent = () => {
    // Estado con letra detectada - SUPER SIMPLE
    if (detectedLetter && confidence >= 50) {
      const confidenceColor = getConfidenceColor(confidence);
      
      return (
        <View style={styles.detectionContainer}>
          <Text style={[styles.detectedLetter, { color: confidenceColor }]}>
            {detectedLetter}
          </Text>
          <View style={[styles.confidenceIndicator, { backgroundColor: confidenceColor }]} />
        </View>
      );
    }

    // Estado esperando - MINIMALISTA
    return (
      <View style={styles.waitingContainer}>
        <Ionicons 
          name={isProcessing ? "scan" : "hand-left"} 
          size={24} 
          color="#CCCCCC" 
        />
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
    top: 80,
    right: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    pointerEvents: 'none',
  },
  
  detectionBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    minHeight: 80,
  },
  
  // Detección activa - MUY SIMPLE
  detectionContainer: {
    alignItems: 'center',
  },
  
  detectedLetter: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  confidenceIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  
  // Estado de espera - MINIMALISTA
  waitingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DetectionOverlay;