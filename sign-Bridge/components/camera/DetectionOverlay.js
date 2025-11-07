import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DetectionOverlay = ({ 
  detectedLetter, 
  confidence, 
  isProcessing,
  isVisible = true 
}) => {
  
  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.detectionBox}>
        {detectedLetter ? (
          <View style={styles.detectionContainer}>
            <Text style={styles.detectedLetter}>{detectedLetter}</Text>
            <Text style={styles.confidence}>{confidence}%</Text>
          </View>
        ) : (
          <Text style={styles.waitingText}>
            {isProcessing ? 'Detectando...' : 'Muestra una seña'}
          </Text>
        )}
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
    pointerEvents: 'none',
  },
  
  detectionBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    minWidth: 200,
  },
  
  detectionContainer: {
    alignItems: 'center',
  },
  
  detectedLetter: {
    color: '#00FF88',
    fontSize: 60,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  
  confidence: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  
  waitingText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default DetectionOverlay;