import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

export const AudioButton = ({ word, language = 'es-CL' }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = async () => {
    if (isPlaying) {
      await Speech.stop();
      setIsPlaying(false);
      return;
    }

    try {
      setIsPlaying(true);
      // Convertir guiones bajos a espacios para mejor pronunciación
      const wordDisplay = word.replace(/_/g, ' ');
      
      await Speech.speak(wordDisplay, {
        language: language,
        pitch: 1.0,
        rate: 0.85,
        onDone: () => setIsPlaying(false),
        onStopped: () => setIsPlaying(false),
        onError: (error) => {
          console.error('TTS Error:', error);
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Error TTS:', error);
      setIsPlaying(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, isPlaying && styles.buttonActive]}
      onPress={handleSpeak}
    >
      <Ionicons 
        name={isPlaying ? "stop-circle" : "volume-high"} 
        size={24} 
        color={isPlaying ? "#FFB800" : "#00FF88"}
      />
      <Text style={styles.label}>
        {isPlaying ? 'Reproduciendo' : 'Escuchar'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 2,
    borderColor: '#00FF88',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: 8
  },
  buttonActive: {
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
    borderColor: '#FFB800'
  },
  label: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600'
  }
});
