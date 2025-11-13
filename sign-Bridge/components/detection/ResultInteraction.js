/**
 * ResultInteraction.js
 *
 * CSB-80: Componente interactivo para gestionar resultados de detección
 *
 * Características:
 * ✅ ✅ Confirmar palabra (guardar en historial)
 * ✅ ❌ Rechazar detección (reintentar)
 * ✅ 🔄 Limpiar y empezar de nuevo
 * ✅ Animaciones suaves de feedback
 * ✅ Estados de confirmación
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ResultInteraction = ({
  detectedWord,
  confidence,
  onConfirm,
  onReject,
  onClear,
  isEnabled = true,
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleConfirm = () => {
    animatePress();
    setIsConfirmed(true);
    setConfirmMessage(`✅ "${detectedWord}" confirmada`);

    setTimeout(() => {
      onConfirm?.(detectedWord, confidence);
      setIsConfirmed(false);
      setConfirmMessage('');
    }, 1000);
  };

  const handleReject = () => {
    animatePress();
    setConfirmMessage(`❌ Detección rechazada, reintenta`);

    setTimeout(() => {
      onReject?.();
      setConfirmMessage('');
    }, 1000);
  };

  const handleClear = () => {
    animatePress();
    setConfirmMessage(`🔄 Limpiando...`);

    setTimeout(() => {
      onClear?.();
      setConfirmMessage('');
      setIsConfirmed(false);
    }, 1000);
  };

  if (!detectedWord) {
    return null;
  }

  if (isConfirmed) {
    return (
      <Animated.View
        style={[
          styles.container,
          styles.confirmedContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.messageContainer}>
          <Ionicons name="checkmark-circle" size={32} color="#00FF88" />
          <Text style={styles.confirmedText}>{confirmMessage}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      {/* Encabezado con palabra detectada */}
      <View style={styles.header}>
        <Text style={styles.title}>¿Palabra correcta?</Text>
      </View>

      {/* Palabra detectada destacada */}
      <View style={styles.wordDisplay}>
        <Text style={styles.detectedWord}>{detectedWord}</Text>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>
            {(confidence * 100).toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Botones de interacción */}
      <View style={styles.buttonRow}>
        {/* Botón Confirmar */}
        <TouchableOpacity
          style={[
            styles.button,
            styles.confirmButton,
            !isEnabled && styles.buttonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!isEnabled}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-outline" size={20} color="#000" />
          <Text style={[styles.buttonText, styles.confirmText]}>Confirmar</Text>
        </TouchableOpacity>

        {/* Botón Rechazar */}
        <TouchableOpacity
          style={[
            styles.button,
            styles.rejectButton,
            !isEnabled && styles.buttonDisabled,
          ]}
          onPress={handleReject}
          disabled={!isEnabled}
          activeOpacity={0.7}
        >
          <Ionicons name="close-outline" size={20} color="#FFF" />
          <Text style={[styles.buttonText, styles.rejectText]}>Rechazar</Text>
        </TouchableOpacity>
      </View>

      {/* Botón Limpiar */}
      <TouchableOpacity
        style={[
          styles.clearButton,
          !isEnabled && styles.buttonDisabled,
        ]}
        onPress={handleClear}
        disabled={!isEnabled}
        activeOpacity={0.7}
      >
        <Ionicons name="refresh-outline" size={16} color="#FFB800" />
        <Text style={styles.clearButtonText}>Limpiar</Text>
      </TouchableOpacity>

      {/* Mensaje de estado */}
      {confirmMessage && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{confirmMessage}</Text>
        </View>
      )}

      {/* Hint/ayuda */}
      <View style={styles.hintContainer}>
        <Ionicons name="information-circle" size={14} color="#FFB800" />
        <Text style={styles.hintText}>
          Confirma para agregar al historial de aprendizaje
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
    padding: 16,
    marginBottom: 16,
  },

  confirmedContainer: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderColor: '#00FF88',
  },

  header: {
    marginBottom: 12,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  wordDisplay: {
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  detectedWord: {
    color: '#00FF88',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },

  confidenceBadge: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00FF88',
  },

  confidenceText: {
    color: '#00FF88',
    fontSize: 12,
    fontWeight: '600',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },

  confirmButton: {
    backgroundColor: '#00FF88',
  },

  rejectButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },

  confirmText: {
    color: '#000000',
    fontWeight: 'bold',
  },

  rejectText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },

  buttonText: {
    fontSize: 14,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FFB800',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
    marginBottom: 12,
  },

  clearButtonText: {
    color: '#FFB800',
    fontSize: 13,
    fontWeight: '600',
  },

  messageContainer: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },

  messageText: {
    color: '#00FF88',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  hintContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 184, 0, 0.05)',
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },

  hintText: {
    color: '#FFB800',
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
});

export default ResultInteraction;
