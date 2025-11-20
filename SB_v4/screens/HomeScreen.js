import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function HomeScreen({ theme, textScale }) {
  // Animaciones
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [bounceAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in + slide up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Bounce infinito en el ícono
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, slideAnim, bounceAnim]);

  return (
    <View style={[styles.wrap, { backgroundColor: theme.bg }]}>
      {/* Fondo decorativo */}
      <View style={[styles.bgGradient, { backgroundColor: theme.accent + '15' }]} />

      {/* Contenido animado */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Ícono con bounce */}
        <Animated.Text
          style={[
            styles.mainIcon,
            {
              transform: [{ translateY: bounceAnim }],
            },
          ]}
        >
          👋
        </Animated.Text>

        {/* Título */}
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: theme.fg, fontSize: 32 * textScale }]}
        >
          SignBridge v4
        </Text>

        {/* Subtítulo */}
        <Text
          style={[
            styles.subtitle,
            { color: theme.accent, fontSize: 14 * textScale },
          ]}
        >
          🇨🇱 Lengua de Señas Chilena (LSCh)
        </Text>

        {/* Descripción */}
        <Text
          style={[
            styles.description,
            { color: theme.fg, fontSize: 16 * textScale },
          ]}
        >
          Detecta y aprende señas en tiempo real usando inteligencia artificial
        </Text>

        {/* Características */}
        <View style={styles.featuresContainer}>
          <View style={[styles.featureItem, { borderColor: theme.accent + '40' }]}>
            <Text style={styles.featureIcon}>📹</Text>
            <Text
              style={[
                styles.featureText,
                { color: theme.fg, fontSize: 14 * textScale },
              ]}
            >
              Detección en Tiempo Real
            </Text>
          </View>

          <View style={[styles.featureItem, { borderColor: theme.accent + '40' }]}>
            <Text style={styles.featureIcon}>🧠</Text>
            <Text
              style={[
                styles.featureText,
                { color: theme.fg, fontSize: 14 * textScale },
              ]}
            >
              IA Avanzada
            </Text>
          </View>

          <View style={[styles.featureItem, { borderColor: theme.accent + '40' }]}>
            <Text style={styles.featureIcon}>♿</Text>
            <Text
              style={[
                styles.featureText,
                { color: theme.fg, fontSize: 14 * textScale },
              ]}
            >
              Accesible
            </Text>
          </View>
        </View>

        {/* Instrucción */}
        <View
          style={[
            styles.instructionBox,
            { backgroundColor: theme.accent + '20', borderColor: theme.accent },
          ]}
        >
          <Text style={[styles.instructionText, { color: theme.fg }]}>
            ➜ Usa la pestaña <Text style={{ fontWeight: '700' }}>Detectar</Text> para
            iniciar la cámara
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    position: 'relative',
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    maxWidth: 500,
  },
  mainIcon: {
    fontSize: 80,
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  description: {
    textAlign: 'center',
    opacity: 0.85,
    marginBottom: 28,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
    fontWeight: '700',
  },
  featureText: {
    flex: 1,
    fontWeight: '600',
  },
  instructionBox: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  instructionText: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
  },
});
