import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image, Modal, Dimensions } from 'react-native';

/**
 * PANTALLA DE APRENDIZAJE GAMIFICADA
 *
 * Características innovadoras:
 * - Categorías de señas organizadas (Números, Letras, Frases, etc.)
 * - Videos cortos de demostración de cada seña
 * - Sistema de gamificación (puntos, badges, streaks)
 * - Información detallada sobre cómo hacer cada seña
 * - Interfaz visual atractiva y accesible
 */

const window = Dimensions.get('window');

export default function LearnScreen({ theme, textScale }) {
  const [activeCategory, setActiveCategory] = useState('numbers');
  const [selectedSign, setSelectedSign] = useState(null);
  const [completedSigns, setCompletedSigns] = useState(new Set());
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);

  // Datos de señas organizadas por categoría
  const signDatabase = {
    numbers: [
      { id: '0', name: 'Cero', video: 'https://example.com/0.mp4', steps: ['Forma un círculo con la mano', 'Coloca el dedo pulgar en el centro', 'Mantén estable por 2 segundos'], confidence: 'Básica' },
      { id: '1', name: 'Uno', video: 'https://example.com/1.mp4', steps: ['Levanta el dedo índice', 'Otros dedos cerrados', 'Palma hacia adelante'], confidence: 'Básica' },
      { id: '2', name: 'Dos', video: 'https://example.com/2.mp4', steps: ['Levanta índice y mayor', 'Otros dedos cerrados', 'Palma hacia adelante'], confidence: 'Básica' },
      { id: '3', name: 'Tres', video: 'https://example.com/3.mp4', steps: ['Levanta índice, mayor y anular', 'Palma hacia adelante', 'En forma de "V"'], confidence: 'Básica' },
    ],
    letters: [
      { id: 'A', name: 'Letra A', video: 'https://example.com/A.mp4', steps: ['Forma un puño', 'Levanta el pulgar', 'Palma hacia un lado'], confidence: 'Básica' },
      { id: 'B', name: 'Letra B', video: 'https://example.com/B.mp4', steps: ['Palma abierta', 'Dedos extendidos unidos', 'Pulgar hacia adentro'], confidence: 'Básica' },
      { id: 'C', name: 'Letra C', video: 'https://example.com/C.mp4', steps: ['Forma una "C" con la mano', 'Dedos curvados', 'Palma hacia dentro'], confidence: 'Básica' },
    ],
    phrases: [
      { id: 'hola', name: 'Hola', video: 'https://example.com/hola.mp4', steps: ['Mano abierta a la altura de la oreja', 'Movimiento hacia afuera', 'Gesto relajado'], confidence: 'Intermedia' },
      { id: 'gracias', name: 'Gracias', video: 'https://example.com/gracias.mp4', steps: ['Mano abierta cerca de la boca', 'Movimiento descendente hacia el pecho', 'Expresión de gratitud'], confidence: 'Intermedia' },
      { id: 'porfa', name: 'Por Favor', video: 'https://example.com/porfa.mp4', steps: ['Mano abierta contra el pecho', 'Movimiento circular pequeño', 'Expresión de cortesía'], confidence: 'Intermedia' },
      { id: 'como', name: 'Cómo estás', video: 'https://example.com/como.mp4', steps: ['Ambas manos con dedo índice', 'Movimiento en círculo', 'Expresión de interés'], confidence: 'Intermedia' },
    ],
    actions: [
      { id: 'comer', name: 'Comer', video: 'https://example.com/comer.mp4', steps: ['Dedos juntos frente a la boca', 'Movimiento hacia la boca', 'Repetido'], confidence: 'Intermedia' },
      { id: 'dormir', name: 'Dormir', video: 'https://example.com/dormir.mp4', steps: ['Mejilla inclinada en la mano', 'Ojos cerrados', 'Cabeza hacia un lado'], confidence: 'Básica' },
      { id: 'correr', name: 'Correr', video: 'https://example.com/correr.mp4', steps: ['Ambas manos en puño', 'Movimiento alternado rápido', 'Como corriendo'], confidence: 'Básica' },
    ],
  };

  const categories = [
    { id: 'numbers', name: '🔢 Números', icon: '0-9' },
    { id: 'letters', name: '🔤 Letras', icon: 'A-Z' },
    { id: 'phrases', name: '💬 Frases Comunes', icon: '✋' },
    { id: 'actions', name: '🏃 Acciones', icon: '👋' },
  ];

  const markAsLearned = (signId) => {
    const newCompleted = new Set(completedSigns);
    if (!newCompleted.has(signId)) {
      newCompleted.add(signId);
      setCompletedSigns(newCompleted);
      setPoints(points + 10);
      setStreak(streak + 1);
    }
  };

  const currentSigns = signDatabase[activeCategory] || [];
  const learningProgress = Math.round((completedSigns.size / Object.values(signDatabase).flat().length) * 100);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* HEADER CON GAMIFICACIÓN */}
      <View style={[styles.gamificationHeader, { backgroundColor: theme.accent + '15' }]}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: theme.weak }]}>Puntos</Text>
            <Text style={[styles.statValue, { color: theme.accent, fontSize: 24 * textScale }]}>{points}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: theme.weak }]}>Racha</Text>
            <Text style={[styles.statValue, { color: theme.accent, fontSize: 24 * textScale }]}>🔥 {streak}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: theme.weak }]}>Progreso</Text>
            <Text style={[styles.statValue, { color: theme.accent, fontSize: 24 * textScale }]}>{learningProgress}%</Text>
          </View>
        </View>
      </View>

      {/* BARRA DE PROGRESO */}
      <View style={[styles.progressBarContainer, { backgroundColor: theme.weak + '20' }]}>
        <View style={[styles.progressBar, { width: `${learningProgress}%`, backgroundColor: theme.accent }]} />
      </View>

      {/* CATEGORÍAS TABS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map(cat => (
          <Pressable
            key={cat.id}
            onPress={() => setActiveCategory(cat.id)}
            style={[
              styles.categoryBtn,
              activeCategory === cat.id && { backgroundColor: theme.accent, borderColor: theme.accent },
              activeCategory !== cat.id && { backgroundColor: theme.bg, borderColor: theme.weak },
            ]}
          >
            <Text style={[styles.categoryIcon, { fontSize: 20 * textScale }]}>{cat.icon}</Text>
            <Text style={[styles.categoryText, { color: activeCategory === cat.id ? theme.bg : theme.fg, fontSize: 12 * textScale }]}>
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* GRID DE SEÑAS */}
      <View style={styles.signGrid}>
        {currentSigns.map(sign => (
          <Pressable
            key={sign.id}
            onPress={() => setSelectedSign(sign)}
            style={[
              styles.signCard,
              { backgroundColor: completedSigns.has(sign.id) ? theme.accent + '20' : theme.weak + '10' },
              { borderColor: completedSigns.has(sign.id) ? theme.accent : theme.weak },
            ]}
          >
            <View style={styles.signCardContent}>
              <Text style={[styles.signCardIcon, { fontSize: 32 * textScale }]}>🤟</Text>
              <Text style={[styles.signCardName, { color: theme.fg, fontSize: 14 * textScale }]}>
                {sign.name}
              </Text>
              {completedSigns.has(sign.id) && (
                <Text style={[styles.learnedBadge, { color: theme.accent }]}>✓ Aprendido</Text>
              )}
            </View>
          </Pressable>
        ))}
      </View>

      {/* MODAL DE DETALLE DE SEÑA */}
      {selectedSign && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={[styles.modalOverlay, { backgroundColor: theme.bg + 'ee' }]}>
            <View style={[styles.modalContent, { backgroundColor: theme.bg }]}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.fg, fontSize: 24 * textScale }]}>
                  {selectedSign.name}
                </Text>
                <Pressable onPress={() => setSelectedSign(null)}>
                  <Text style={[styles.closeBtn, { color: theme.accent, fontSize: 24 }]}>×</Text>
                </Pressable>
              </View>

              {/* Video placeholder */}
              <View style={[styles.videoContainer, { backgroundColor: theme.weak + '30' }]}>
                <Text style={[styles.videoPlaceholder, { color: theme.weak, fontSize: 48 }]}>🎥</Text>
                <Text style={[styles.videoText, { color: theme.weak }]}>Video Tutorial</Text>
              </View>

              {/* Instrucciones paso a paso */}
              <View style={styles.stepsContainer}>
                <Text style={[styles.sectionTitle, { color: theme.fg, fontSize: 16 * textScale }]}>
                  Pasos para hacer esta seña:
                </Text>
                {selectedSign.steps.map((step, idx) => (
                  <View key={idx} style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: theme.accent }]}>
                      <Text style={[styles.stepNumberText, { color: theme.bg }]}>{idx + 1}</Text>
                    </View>
                    <Text style={[styles.stepText, { color: theme.fg, fontSize: 13 * textScale }]}>
                      {step}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Dificultad */}
              <View style={styles.difficultyContainer}>
                <Text style={[styles.difficultyLabel, { color: theme.weak, fontSize: 12 * textScale }]}>
                  Nivel: {selectedSign.confidence}
                </Text>
              </View>

              {/* Botones de acción */}
              <View style={styles.actionButtons}>
                <Pressable
                  onPress={() => {
                    markAsLearned(selectedSign.id);
                    setSelectedSign(null);
                  }}
                  style={[styles.btn, { backgroundColor: theme.accent }]}
                >
                  <Text style={[styles.btnText, { color: theme.bg, fontSize: 14 * textScale }]}>
                    {completedSigns.has(selectedSign.id) ? '✓ Aprendido' : 'Marcar como Aprendido'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setSelectedSign(null)}
                  style={[styles.btn, { backgroundColor: theme.weak + '30' }]}
                >
                  <Text style={[styles.btnText, { color: theme.fg, fontSize: 14 * textScale }]}>
                    Cerrar
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gamificationHeader: {
    padding: 16,
    borderRadius: 12,
    margin: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 4,
    fontWeight: '600',
  },
  statValue: {
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  categoryScroll: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  categoryBtn: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 2,
  },
  categoryIcon: {
    marginBottom: 2,
  },
  categoryText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  signGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingBottom: 20,
    justifyContent: 'space-around',
  },
  signCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  signCardIcon: {
    marginBottom: 8,
  },
  signCardName: {
    fontWeight: '600',
    textAlign: 'center',
  },
  learnedBadge: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontWeight: '700',
  },
  closeBtn: {
    fontWeight: '700',
  },
  videoContainer: {
    height: 200,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    marginBottom: 8,
  },
  videoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontWeight: '700',
    fontSize: 12,
  },
  stepText: {
    flex: 1,
    lineHeight: 20,
  },
  difficultyContainer: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  difficultyLabel: {
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontWeight: '700',
  },
});
