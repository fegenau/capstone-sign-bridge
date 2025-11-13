/**
 * DetectionOverlay.demo.js
 *
 * Componente de demostración para probar DetectionOverlay
 * Permite visualizar el comportamiento con diferentes valores de confianza
 *
 * Uso:
 * import DetectionOverlayDemo from './components/camera/DetectionOverlay.demo';
 * <DetectionOverlayDemo />
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Slider } from 'react-native';
import DetectionOverlay from './DetectionOverlay';

const DetectionOverlayDemo = () => {
  const [confidence, setConfidence] = useState(0.75);
  const [detectedLetter, setDetectedLetter] = useState('A');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  const testWords = ['A', 'Hola', 'Gracias', 'Si', 'No', '5'];

  const handleConfidenceChange = (value) => {
    setConfidence(value);
  };

  const toggleProcessing = () => {
    setIsProcessing(!isProcessing);
  };

  const testDifferentWords = () => {
    const randomWord = testWords[Math.floor(Math.random() * testWords.length)];
    setDetectedLetter(randomWord);
  };

  const testConfidenceRanges = (range) => {
    const ranges = {
      low: Math.random() * 0.3 + 0.2,     // 20-50%
      medium: Math.random() * 0.2 + 0.5,  // 50-70%
      high: Math.random() * 0.3 + 0.7,    // 70-100%
    };
    setConfidence(ranges[range]);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>DetectionOverlay Demo</Text>
          <Text style={styles.subtitle}>Prueba el componente con diferentes valores</Text>
        </View>

        {/* DEMO AREA */}
        <View style={styles.demoContainer}>
          <View style={styles.cameraSimulator}>
            <Text style={styles.cameraText}>📹 Simulador de Cámara</Text>

            {/* El overlay que estamos probando */}
            {showOverlay && (
              <DetectionOverlay
                detectedLetter={detectedLetter}
                confidence={confidence}
                isProcessing={isProcessing}
                type="letter"
                isVisible={true}
              />
            )}
          </View>
        </View>

        {/* CONTROLES */}
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>⚙️ Controles</Text>

          {/* Slider de Confianza */}
          <View style={styles.controlGroup}>
            <Text style={styles.label}>
              Confianza: {Math.round(confidence * 100)}%
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={confidence}
              onValueChange={handleConfidenceChange}
              minimumTrackTintColor="#00FF88"
              maximumTrackTintColor="#333333"
              thumbTintColor="#00FF88"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>0%</Text>
              <Text style={styles.sliderLabel}>50%</Text>
              <Text style={styles.sliderLabel}>100%</Text>
            </View>
          </View>

          {/* Palabra detectada */}
          <View style={styles.controlGroup}>
            <Text style={styles.label}>Palabra Detectada: {detectedLetter}</Text>
            <View style={styles.buttonRow}>
              {testWords.map((word) => (
                <TouchableOpacity
                  key={word}
                  style={[
                    styles.wordButton,
                    detectedLetter === word && styles.wordButtonActive,
                  ]}
                  onPress={() => setDetectedLetter(word)}
                >
                  <Text style={styles.wordButtonText}>{word}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.randomButton} onPress={testDifferentWords}>
              <Text style={styles.randomButtonText}>🎲 Aleatorio</Text>
            </TouchableOpacity>
          </View>

          {/* Estado de procesamiento */}
          <View style={styles.controlGroup}>
            <TouchableOpacity
              style={[styles.toggleButton, isProcessing && styles.toggleButtonActive]}
              onPress={toggleProcessing}
            >
              <Text style={styles.toggleButtonText}>
                {isProcessing ? '⏸️ Analizando' : '▶️ Esperando'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Visibilidad del overlay */}
          <View style={styles.controlGroup}>
            <TouchableOpacity
              style={[styles.toggleButton, showOverlay && styles.toggleButtonActive]}
              onPress={() => setShowOverlay(!showOverlay)}
            >
              <Text style={styles.toggleButtonText}>
                {showOverlay ? '👁️ Overlay: Visible' : '👁️ Overlay: Oculto'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TESTS RÁPIDOS */}
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>⚡ Tests Rápidos</Text>

          <View style={styles.quickTestsGrid}>
            <TouchableOpacity
              style={[styles.quickTestButton, styles.quickTestButtonLow]}
              onPress={() => testConfidenceRanges('low')}
            >
              <Text style={styles.quickTestText}>🔴 Baja</Text>
              <Text style={styles.quickTestSubtext}>20-50%</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickTestButton, styles.quickTestButtonMedium]}
              onPress={() => testConfidenceRanges('medium')}
            >
              <Text style={styles.quickTestText}>🟡 Media</Text>
              <Text style={styles.quickTestSubtext}>50-70%</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickTestButton, styles.quickTestButtonHigh]}
              onPress={() => testConfidenceRanges('high')}
            >
              <Text style={styles.quickTestText}>🟢 Alta</Text>
              <Text style={styles.quickTestSubtext}>70-100%</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* INFO */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>ℹ️ Información</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>Característica:</Text> Pulse automation
            </Text>
            <Text style={styles.infoText}>
              ✓ Activado automáticamente cuando confianza ≥ 70%
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>Animaciones:</Text>
            </Text>
            <Text style={styles.infoText}>✓ Fade in/out (300ms)</Text>
            <Text style={styles.infoText}>✓ Spring scale (entrada elástica)</Text>
            <Text style={styles.infoText}>✓ Pulse loop (1000ms)</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>Colores:</Text>
            </Text>
            <View style={styles.colorRow}>
              <View style={styles.colorBox}>
                <View style={[styles.colorSquare, { backgroundColor: '#FF4444' }]} />
                <Text style={styles.colorLabel}>Rojo &lt; 50%</Text>
              </View>
              <View style={styles.colorBox}>
                <View style={[styles.colorSquare, { backgroundColor: '#FFB800' }]} />
                <Text style={styles.colorLabel}>Amarillo 50-70%</Text>
              </View>
              <View style={styles.colorBox}>
                <View style={[styles.colorSquare, { backgroundColor: '#00FF88' }]} />
                <Text style={styles.colorLabel}>Verde ≥ 70%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SPACING */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  scrollView: {
    flex: 1,
  },

  // ========================================
  // HEADER
  // ========================================

  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#00FF88',
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: '#CCCCCC',
  },

  // ========================================
  // DEMO AREA
  // ========================================

  demoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  cameraSimulator: {
    width: '100%',
    height: 300,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    border: '2px dashed #00FF88',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },

  cameraText: {
    color: '#00FF88',
    fontSize: 16,
    fontWeight: '600',
  },

  // ========================================
  // CONTROLES
  // ========================================

  controlsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },

  controlGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
    fontWeight: '600',
  },

  slider: {
    width: '100%',
    height: 40,
  },

  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  sliderLabel: {
    fontSize: 11,
    color: '#888888',
  },

  // ========================================
  // BOTONES
  // ========================================

  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },

  wordButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },

  wordButtonActive: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },

  wordButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  randomButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00FF88',
  },

  randomButtonText: {
    color: '#00FF88',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333333',
  },

  toggleButtonActive: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },

  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ========================================
  // QUICK TESTS
  // ========================================

  quickTestsGrid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },

  quickTestButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
  },

  quickTestButtonLow: {
    borderColor: '#FF4444',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },

  quickTestButtonMedium: {
    borderColor: '#FFB800',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
  },

  quickTestButtonHigh: {
    borderColor: '#00FF88',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },

  quickTestText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  quickTestSubtext: {
    fontSize: 11,
    color: '#AAAAAA',
    marginTop: 4,
  },

  // ========================================
  // INFO
  // ========================================

  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },

  infoBox: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#00FF88',
  },

  infoText: {
    color: '#CCCCCC',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },

  infoBold: {
    color: '#00FF88',
    fontWeight: '700',
  },

  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },

  colorBox: {
    alignItems: 'center',
    gap: 4,
  },

  colorSquare: {
    width: 32,
    height: 32,
    borderRadius: 4,
  },

  colorLabel: {
    fontSize: 10,
    color: '#AAAAAA',
    textAlign: 'center',
  },
});

export default DetectionOverlayDemo;
