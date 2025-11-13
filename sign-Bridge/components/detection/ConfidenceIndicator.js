/**
 * ConfidenceIndicator.js
 *
 * CSB-78: Componente para visualizar la confianza de la detección
 *
 * Características:
 * ✅ Porcentaje (0-100%)
 * ✅ Barra visual animada
 * ✅ Color dinámico (Rojo <50%, Amarillo 50-70%, Verde >=70%)
 * ✅ Iconos animados según estado
 * ✅ Logs de métricas
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ConfidenceIndicator = ({ confidence = 0, isProcessing = false }) => {
  const [displayConfidence, setDisplayConfidence] = useState(0);
  const barAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // Normalizar confianza a 0-1 rango
  const normalizedConfidence = Math.max(0, Math.min(1, confidence));
  const percentage = Math.round(normalizedConfidence * 100);

  // Determinar color basado en confianza
  const getConfidenceColor = () => {
    if (percentage >= 70) return '#00FF88'; // Verde - Alta confianza
    if (percentage >= 50) return '#FFB800'; // Amarillo - Media confianza
    return '#FF6B6B'; // Rojo - Baja confianza
  };

  // Determinar icono basado en estado
  const getIcon = () => {
    if (isProcessing) return 'scan';
    if (percentage >= 70) return 'checkmark-circle';
    if (percentage >= 50) return 'warning';
    return 'close-circle';
  };

  const confidenceColor = getConfidenceColor();
  const icon = getIcon();

  // Animar la barra cuando la confianza cambia
  useEffect(() => {
    Animated.timing(barAnimation, {
      toValue: normalizedConfidence,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setDisplayConfidence(percentage);
  }, [normalizedConfidence]);

  // Animar pulso cuando procesando
  useEffect(() => {
    if (isProcessing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnimation.setValue(1);
    }
  }, [isProcessing]);

  const barWidth = barAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Encabezado con icono y etiqueta */}
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: pulseAnimation }],
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={isProcessing ? '#FFB800' : confidenceColor}
          />
        </Animated.View>

        <Text style={styles.label}>Confianza de Detección</Text>

        <Text style={[styles.percentage, { color: confidenceColor }]}>
          {displayConfidence}%
        </Text>
      </View>

      {/* Barra de progreso animada */}
      <View style={[styles.barBackground, { borderColor: confidenceColor }]}>
        <Animated.View
          style={[
            styles.barFill,
            {
              width: barWidth,
              backgroundColor: confidenceColor,
            },
          ]}
        />
      </View>

      {/* Etiqueta descriptiva */}
      <View style={styles.footer}>
        <Text style={styles.description}>
          {isProcessing
            ? 'Procesando...'
            : percentage >= 70
            ? '✅ Detección confiable'
            : percentage >= 50
            ? '⚠️ Detección parcial'
            : '❌ Detección débil'}
        </Text>
      </View>

      {/* Métricas detalladas (opcional) */}
      {percentage > 0 && !isProcessing && (
        <View style={styles.metricsContainer}>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Valor Raw:</Text>
            <Text style={[styles.metricValue, { color: confidenceColor }]}>
              {confidence.toFixed(4)}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Estado:</Text>
            <Text style={[styles.metricValue, { color: confidenceColor }]}>
              {percentage >= 70
                ? 'Alto'
                : percentage >= 50
                ? 'Medio'
                : 'Bajo'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },

  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginHorizontal: 12,
  },

  percentage: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'right',
  },

  barBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
  },

  barFill: {
    height: '100%',
    borderRadius: 4,
  },

  footer: {
    marginBottom: 8,
  },

  description: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
    fontWeight: '500',
  },

  metricsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },

  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },

  metricLabel: {
    fontSize: 11,
    color: '#999999',
  },

  metricValue: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default ConfidenceIndicator;
