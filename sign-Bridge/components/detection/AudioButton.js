/**
 * AudioButton.js
 *
 * CSB-79: Componente de reproducción de audio con control de velocidad
 *
 * Características:
 * ✅ Reproducción de palabra detectada
 * ✅ Velocidad ajustable (0.8x - 1.2x)
 * ✅ Idioma: Spanish (Chile)
 * ✅ Control de reproducción (play/stop)
 * ✅ Feedback visual animado
 */

import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Fallback para web usando Web Speech API
let Speech = null;
try {
  Speech = require('expo-speech');
} catch (e) {
  // En web, usar Web Speech API
  Speech = {
    speak: (text, options = {}) => {
      return new Promise((resolve) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = options.rate || 1.0;
          utterance.pitch = options.pitch || 1.0;
          utterance.lang = options.language || 'es-ES';
          utterance.onend = () => {
            if (options.onDone) options.onDone();
            resolve();
          };
          utterance.onerror = (error) => {
            if (options.onError) options.onError(error);
            resolve();
          };
          window.speechSynthesis.speak(utterance);
        } else {
          resolve();
        }
      });
    },
    stop: () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return Promise.resolve();
    },
  };
}

export const AudioButton = ({
  word,
  language = 'es-CL',
  speed = 1.0,
  onPlayStart,
  onPlayEnd,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const [showSpeedControl, setShowSpeedControl] = useState(false);

  // Normalizar velocidad (0.8x - 1.2x)
  const speeds = [0.8, 0.9, 1.0, 1.1, 1.2];
  const getSpeedLabel = (s) => `${(s * 100).toFixed(0)}%`;

  const handleSpeak = async (useSpeed = currentSpeed) => {
    if (isPlaying) {
      await Speech.stop();
      setIsPlaying(false);
      onPlayEnd?.();
      return;
    }

    try {
      setIsPlaying(true);
      onPlayStart?.();

      // Convertir guiones bajos a espacios para mejor pronunciación
      const wordDisplay = word.replace(/_/g, ' ');

      // Mapear idiomas Expo a Web Speech API
      const languageMap = {
        'es-CL': 'es-ES', // Chile español → español genérico
        'es-ES': 'es-ES',
        'es': 'es-ES',
      };
      const webLanguage = languageMap[language] || 'es-ES';

      await Speech.speak(wordDisplay, {
        language: webLanguage,
        pitch: 1.0,
        rate: useSpeed, // Velocidad ajustable
        onDone: () => {
          setIsPlaying(false);
          onPlayEnd?.();
        },
        onStopped: () => {
          setIsPlaying(false);
          onPlayEnd?.();
        },
        onError: (error) => {
          console.error('TTS Error:', error);
          setIsPlaying(false);
          onPlayEnd?.();
        },
      });
    } catch (error) {
      console.error('Error TTS:', error);
      setIsPlaying(false);
      onPlayEnd?.();
    }
  };

  const handleSpeedChange = async (newSpeed) => {
    setCurrentSpeed(newSpeed);
    setShowSpeedControl(false);

    // Si está reproduciendo, detener y reproducir con nueva velocidad
    if (isPlaying) {
      await Speech.stop();
      setIsPlaying(false);
      // Pequeño delay antes de reproducir con nueva velocidad
      setTimeout(() => handleSpeak(newSpeed), 200);
    }
  };

  return (
    <View style={styles.container}>
      {/* Botón principal de reproducción */}
      <TouchableOpacity
        style={[styles.button, isPlaying && styles.buttonActive]}
        onPress={() => handleSpeak()}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isPlaying ? 'stop-circle' : 'volume-high'}
          size={24}
          color={isPlaying ? '#FFB800' : '#00FF88'}
        />
        <Text style={styles.label}>
          {isPlaying ? 'Deteniendo' : 'Escuchar'}
        </Text>
      </TouchableOpacity>

      {/* Selector de velocidad */}
      <TouchableOpacity
        style={[styles.speedButton, showSpeedControl && styles.speedButtonActive]}
        onPress={() => setShowSpeedControl(!showSpeedControl)}
        activeOpacity={0.7}
      >
        <Ionicons
          name="speedometer"
          size={16}
          color={showSpeedControl ? '#FFB800' : '#00FF88'}
        />
        <Text style={styles.speedLabel}>
          {getSpeedLabel(currentSpeed)}
        </Text>
      </TouchableOpacity>

      {/* Panel de control de velocidad */}
      {showSpeedControl && (
        <View style={styles.speedPanel}>
          <Text style={styles.speedPanelTitle}>Velocidad</Text>
          <View style={styles.speedOptions}>
            {speeds.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.speedOption,
                  currentSpeed === s && styles.speedOptionActive,
                ]}
                onPress={() => handleSpeedChange(s)}
              >
                <Text
                  style={[
                    styles.speedOptionText,
                    currentSpeed === s && styles.speedOptionTextActive,
                  ]}
                >
                  {getSpeedLabel(s)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 2,
    borderColor: '#00FF88',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  buttonActive: {
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
    borderColor: '#FFB800',
  },

  label: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },

  speedButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 1,
    borderColor: '#00FF88',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  speedButtonActive: {
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
    borderColor: '#FFB800',
  },

  speedLabel: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '600',
  },

  speedPanel: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00FF88',
    padding: 12,
    zIndex: 1000,
  },

  speedPanelTitle: {
    color: '#00FF88',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },

  speedOptions: {
    flexDirection: 'row',
    gap: 8,
  },

  speedOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  speedOptionActive: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },

  speedOptionText: {
    color: '#CCCCCC',
    fontSize: 11,
    fontWeight: '600',
  },

  speedOptionTextActive: {
    color: '#000000',
  },
});
