import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal, Animated } from 'react-native';

/**
 * PANTALLA DE DESAFÍOS GAMIFICADA
 *
 * Características innovadoras:
 * - Desafíos diarios con recompensas
 * - Leaderboard y ranking
 * - Badges y medallas
 * - Sistema de streaks
 * - Retos con video feedback
 */

export default function ChallengeScreen({ theme, textScale }) {
  const [dailyChallenge, setDailyChallenge] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState(new Set([0]));
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [badges, setBadges] = useState(['🏆', '⭐', '💫']);
  const [streak, setStreak] = useState(7);
  const [totalPoints, setTotalPoints] = useState(850);

  const challenges = [
    {
      id: 0,
      title: 'Desafío Diario: Números',
      category: 'daily',
      difficulty: 'Fácil',
      description: 'Aprende a hacer los números 1-10 en LSCh',
      reward: 50,
      icon: '🔢',
      steps: [
        { name: 'Número 1', description: 'Levanta el dedo índice' },
        { name: 'Número 2', description: 'Levanta índice y mayor' },
        { name: 'Número 3', description: 'Levanta índice, mayor y anular' },
      ],
      timeLimit: '15 min',
      participants: 342,
    },
    {
      id: 1,
      title: 'Desafío Semanal: Frases Comunes',
      category: 'weekly',
      difficulty: 'Intermedio',
      description: 'Domina 5 frases essenciales: Hola, Gracias, Por favor, Perdón, Adiós',
      reward: 150,
      icon: '💬',
      steps: [
        { name: 'Hola', description: 'Mano abierta a la oreja, movimiento hacia afuera' },
        { name: 'Gracias', description: 'Mano abierta frente a la boca, movimiento descendente' },
        { name: 'Por favor', description: 'Mano abierta contra el pecho, movimiento circular' },
        { name: 'Perdón', description: 'Mano cerrada sobre el corazón' },
        { name: 'Adiós', description: 'Mano abierta, movimiento de despedida' },
      ],
      timeLimit: '30 min',
      participants: 128,
    },
    {
      id: 2,
      title: 'Desafío Master: Conversación Completa',
      category: 'monthly',
      difficulty: 'Avanzado',
      description: 'Participa en una conversación completa en LSCh (25+ señas)',
      reward: 500,
      icon: '🎓',
      steps: [
        { name: 'Presentación', description: 'Presenta tu nombre y cómo estás' },
        { name: 'Interacción', description: 'Responde preguntas en LSCh' },
        { name: 'Expresión', description: 'Expresa tus opiniones y sentimientos' },
      ],
      timeLimit: '60 min',
      participants: 42,
    },
    {
      id: 3,
      title: 'Reto Flash: Speed Learning',
      category: 'quick',
      difficulty: 'Fácil',
      description: 'Aprende 5 palabras nuevas en 5 minutos',
      reward: 25,
      icon: '⚡',
      steps: [
        { name: 'Palabra 1', description: 'Memoriza rápidamente' },
        { name: 'Palabra 2', description: 'Memoriza rápidamente' },
        { name: 'Palabra 3', description: 'Memoriza rápidamente' },
        { name: 'Palabra 4', description: 'Memoriza rápidamente' },
        { name: 'Palabra 5', description: 'Memoriza rápidamente' },
      ],
      timeLimit: '5 min',
      participants: 156,
    },
  ];

  const leaderboard = [
    { rank: 1, name: 'María S.', points: 2450, badge: '👑' },
    { rank: 2, name: 'Juan P.', points: 2120, badge: '🥈' },
    { rank: 3, name: 'Laura G.', points: 1980, badge: '🥉' },
    { rank: 4, name: 'Tu (750 puntos)', points: 750, badge: '⭐', isYou: true },
    { rank: 5, name: 'Carlos L.', points: 640, badge: '✨' },
    { rank: 6, name: 'Sofia M.', points: 580, badge: '💫' },
  ];

  const handleCompleteChallenge = (challengeId) => {
    const newCompleted = new Set(completedChallenges);
    newCompleted.add(challengeId);
    setCompletedChallenges(newCompleted);
    setTotalPoints(totalPoints + challenges[challengeId].reward);
    setSelectedChallenge(null);

    // Unlock badge occasionally
    if (Math.random() > 0.7) {
      setBadges([...badges, '🎖️']);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* HEADER STATS */}
      <View style={[styles.statsHeader, { backgroundColor: theme.accent + '15' }]}>
        <View style={styles.statBlock}>
          <Text style={[styles.statValue, { color: theme.accent, fontSize: 28 * textScale }]}>
            {totalPoints}
          </Text>
          <Text style={[styles.statLabel, { color: theme.weak }]}>Puntos Totales</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={[styles.statValue, { color: theme.accent, fontSize: 28 * textScale }]}>
            🔥 {streak}
          </Text>
          <Text style={[styles.statLabel, { color: theme.weak }]}>Racha Actual</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={[styles.statValue, { color: theme.accent, fontSize: 28 * textScale }]}>
            {badges.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.weak }]}>Badges</Text>
        </View>
      </View>

      {/* BADGES DISPLAY */}
      <View style={styles.badgesSection}>
        <Text style={[styles.sectionTitle, { color: theme.fg, fontSize: 16 * textScale }]}>
          Tus Logros 🏆
        </Text>
        <View style={styles.badgesGrid}>
          {badges.map((badge, idx) => (
            <View key={idx} style={[styles.badgeItem, { backgroundColor: theme.weak + '20' }]}>
              <Text style={styles.badgeIcon}>{badge}</Text>
            </View>
          ))}
          {[...Array(Math.max(0, 6 - badges.length))].map((_, idx) => (
            <View key={`empty-${idx}`} style={[styles.badgeItem, { backgroundColor: theme.weak + '10', opacity: 0.5 }]}>
              <Text style={[styles.badgeIcon, { opacity: 0.3 }]}>?</Text>
            </View>
          ))}
        </View>
      </View>

      {/* DAILY CHALLENGE HIGHLIGHT */}
      <View style={[styles.dailyHighlight, { backgroundColor: theme.accent + '25', borderColor: theme.accent }]}>
        <View style={styles.dailyContent}>
          <Text style={[styles.dailyIcon, { fontSize: 36 }]}>⭐</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.dailyTitle, { color: theme.accent, fontSize: 15 * textScale }]}>
              Desafío Diario Disponible
            </Text>
            <Text style={[styles.dailyDesc, { color: theme.weak, fontSize: 12 * textScale }]}>
              {challenges[0].title}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => setSelectedChallenge(0)}
          style={[styles.dailyBtn, { backgroundColor: theme.accent }]}
        >
          <Text style={[styles.dailyBtnText, { color: theme.bg, fontSize: 12 * textScale }]}>
            Hacer
          </Text>
        </Pressable>
      </View>

      {/* CHALLENGES LIST */}
      <View style={styles.challengesSection}>
        <Text style={[styles.sectionTitle, { color: theme.fg, fontSize: 16 * textScale }]}>
          Más Desafíos 🎯
        </Text>
        {challenges.map(challenge => (
          <Pressable
            key={challenge.id}
            onPress={() => setSelectedChallenge(challenge.id)}
            style={[
              styles.challengeItem,
              { backgroundColor: completedChallenges.has(challenge.id) ? theme.accent + '15' : theme.weak + '10' },
              { borderColor: completedChallenges.has(challenge.id) ? theme.accent : theme.weak },
            ]}
          >
            <View style={styles.challengeLeft}>
              <Text style={[styles.challengeIcon, { fontSize: 28 }]}>{challenge.icon}</Text>
            </View>
            <View style={styles.challengeMiddle}>
              <Text style={[styles.challengeTitle, { color: theme.fg, fontSize: 13 * textScale }]}>
                {challenge.title}
              </Text>
              <View style={styles.challengeMeta}>
                <Text style={[styles.metaText, { color: theme.weak, fontSize: 10 * textScale }]}>
                  {challenge.difficulty} • {challenge.timeLimit} • {challenge.participants} participantes
                </Text>
              </View>
            </View>
            <View style={styles.challengeRight}>
              <View style={[styles.rewardBadge, { backgroundColor: theme.accent }]}>
                <Text style={[styles.rewardText, { color: theme.bg, fontSize: 11 * textScale }]}>
                  +{challenge.reward}
                </Text>
              </View>
              {completedChallenges.has(challenge.id) && (
                <Text style={{ fontSize: 16, marginTop: 4 }}>✓</Text>
              )}
            </View>
          </Pressable>
        ))}
      </View>

      {/* LEADERBOARD */}
      <View style={styles.leaderboardSection}>
        <Text style={[styles.sectionTitle, { color: theme.fg, fontSize: 16 * textScale }]}>
          Ranking Global 🏅
        </Text>
        {leaderboard.map(entry => (
          <View
            key={entry.rank}
            style={[
              styles.leaderboardItem,
              entry.isYou && { backgroundColor: theme.accent + '20' },
              !entry.isYou && { backgroundColor: theme.weak + '05' },
            ]}
          >
            <Text style={[styles.rankText, { fontSize: 16 * textScale }]}>
              {entry.badge}
            </Text>
            <Text style={[styles.rankNumber, { color: theme.weak, fontSize: 12 * textScale }]}>
              #{entry.rank}
            </Text>
            <Text style={[styles.userName, { color: theme.fg, flex: 1, fontSize: 13 * textScale, marginLeft: 12 }]}>
              {entry.name}
            </Text>
            <Text style={[styles.userPoints, { color: theme.accent, fontWeight: '700', fontSize: 13 * textScale }]}>
              {entry.points}
            </Text>
          </View>
        ))}
      </View>

      {/* CHALLENGE DETAIL MODAL */}
      {selectedChallenge !== null && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={[styles.modalOverlay, { backgroundColor: theme.bg + 'ee' }]}>
            <ScrollView style={[styles.modalContent, { backgroundColor: theme.bg }]}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setSelectedChallenge(null)}>
                  <Text style={[styles.closeBtn, { fontSize: 28, color: theme.accent }]}>×</Text>
                </Pressable>
              </View>

              {/* Challenge Title */}
              <View style={styles.modalTitleSection}>
                <Text style={[styles.modalIcon, { fontSize: 48 }]}>
                  {challenges[selectedChallenge].icon}
                </Text>
                <Text style={[styles.modalTitle, { color: theme.fg, fontSize: 22 * textScale }]}>
                  {challenges[selectedChallenge].title}
                </Text>
                <Text style={[styles.modalDesc, { color: theme.weak, fontSize: 13 * textScale }]}>
                  {challenges[selectedChallenge].description}
                </Text>
              </View>

              {/* Challenge Info */}
              <View style={[styles.infoGrid, { backgroundColor: theme.weak + '10' }]}>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: theme.weak }]}>Dificultad</Text>
                  <Text style={[styles.infoValue, { color: theme.fg, fontSize: 13 * textScale }]}>
                    {challenges[selectedChallenge].difficulty}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: theme.weak }]}>Tiempo Límite</Text>
                  <Text style={[styles.infoValue, { color: theme.fg, fontSize: 13 * textScale }]}>
                    {challenges[selectedChallenge].timeLimit}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: theme.weak }]}>Recompensa</Text>
                  <Text style={[styles.infoValue, { color: theme.accent, fontSize: 13 * textScale, fontWeight: '700' }]}>
                    +{challenges[selectedChallenge].reward} pts
                  </Text>
                </View>
              </View>

              {/* Steps */}
              <View style={styles.stepsSection}>
                <Text style={[styles.sectionTitle, { color: theme.fg, fontSize: 15 * textScale }]}>
                  Pasos del Desafío
                </Text>
                {challenges[selectedChallenge].steps.map((step, idx) => (
                  <View key={idx} style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: theme.accent }]}>
                      <Text style={[styles.stepNumberText, { color: theme.bg }]}>{idx + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.stepName, { color: theme.fg, fontSize: 13 * textScale }]}>
                        {step.name}
                      </Text>
                      <Text style={[styles.stepDesc, { color: theme.weak, fontSize: 12 * textScale }]}>
                        {step.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Action Button */}
              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => handleCompleteChallenge(selectedChallenge)}
                  style={[styles.actionBtn, { backgroundColor: theme.accent }]}
                >
                  <Text style={[styles.actionBtnText, { color: theme.bg, fontSize: 14 * textScale }]}>
                    {completedChallenges.has(selectedChallenge) ? '✓ Completado' : 'Comenzar Desafío'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 12,
  },
  statBlock: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgesSection: {
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  badgeItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 32,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
    fontSize: 16,
  },
  dailyHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  dailyContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dailyIcon: {
    marginRight: 12,
  },
  dailyTitle: {
    fontWeight: '700',
    marginBottom: 2,
  },
  dailyDesc: {
    marginTop: 2,
  },
  dailyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  dailyBtnText: {
    fontWeight: '700',
  },
  challengesSection: {
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  challengeLeft: {
    marginRight: 12,
  },
  challengeIcon: {
    fontWeight: '700',
  },
  challengeMiddle: {
    flex: 1,
  },
  challengeTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  challengeMeta: {
    marginTop: 4,
  },
  metaText: {
    lineHeight: 14,
  },
  challengeRight: {
    alignItems: 'center',
  },
  rewardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rewardText: {
    fontWeight: '700',
  },
  leaderboardSection: {
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  rankText: {
    marginRight: 8,
    marginLeft: -4,
  },
  rankNumber: {
    fontWeight: '600',
    marginRight: 8,
    minWidth: 24,
  },
  userName: {
    fontWeight: '500',
  },
  userPoints: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '95%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  closeBtn: {
    fontWeight: '700',
  },
  modalTitleSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalIcon: {
    marginBottom: 8,
  },
  modalTitle: {
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDesc: {
    textAlign: 'center',
    lineHeight: 18,
  },
  infoGrid: {
    flexDirection: 'row',
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginVertical: 12,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10,
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    fontWeight: '700',
  },
  stepsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
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
  stepName: {
    fontWeight: '700',
    marginBottom: 2,
  },
  stepDesc: {
    marginTop: 2,
    lineHeight: 16,
  },
  modalActions: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  actionBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontWeight: '700',
  },
});
