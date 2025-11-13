import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const DetectionResultCard = ({ word, confidence, isProcessing }) => {
  const getConfidenceColor = (conf) => {
    if (conf < 50) return '#FF6B6B'; // Rojo
    if (conf < 75) return '#FFB800'; // Amarillo
    return '#00FF88'; // Verde
  };

  const getConfidenceIcon = (conf) => {
    if (conf < 50) return 'warning';
    if (conf < 75) return 'flash';
    return 'checkmark-circle';
  };

  const confidenceColor = getConfidenceColor(confidence);
  const confidenceIcon = getConfidenceIcon(confidence);

  if (!word && !isProcessing) return null;

  return (
    <View 
      style={[
        styles.container,
        { borderColor: isProcessing ? '#FFB800' : confidenceColor }
      ]}
    >
      {isProcessing ? (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#00FF88" />
          <Text style={styles.processingText}>Analizando...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.wordText}>
            {word.replace(/_/g, ' ')}
          </Text>
          <View style={styles.confidenceContainer}>
            <Ionicons 
              name={confidenceIcon}
              size={20} 
              color={confidenceColor}
            />
            <Text style={[styles.confidenceText, { color: confidenceColor }]}>
              {confidence}% confianza
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150
  },
  processingContainer: {
    alignItems: 'center'
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600'
  },
  wordText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00FF88',
    textAlign: 'center',
    textTransform: 'capitalize'
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12
  },
  confidenceText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600'
  }
});
