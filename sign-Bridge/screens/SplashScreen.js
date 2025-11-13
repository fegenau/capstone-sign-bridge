// screens/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const icon = require('../assets/images/IconSignBridge.png');

const SplashScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const dotOpacity1 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity2 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Secuencia de animaciones
    const startAnimations = () => {
      // Animación principal del logo y título
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Animación de los puntos de carga
      const animateDots = () => {
        const dotAnimations = [
          Animated.sequence([
            Animated.timing(dotOpacity1, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(dotOpacity1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(dotOpacity2, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(dotOpacity2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(dotOpacity3, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(dotOpacity3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          ]),
        ];

        Animated.stagger(200, dotAnimations).start(() => {
          // Repetir animación de puntos
          setTimeout(animateDots, 100);
        });
      };

      // Iniciar animación de puntos después de un delay
      setTimeout(animateDots, 1200);
    };

    startAnimations();

    // Navegar a la pantalla principal después de 3 segundos
    const navigationTimer = setTimeout(() => {
      navigation.replace('Home');
    }, 3500);

    return () => {
      clearTimeout(navigationTimer);
    };
  }, [navigation]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.darkBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },

    backgroundGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.darkBackground,
      opacity: 0.1,
    },

    content: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    logoContainer: {
      position: 'relative',
      marginBottom: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },

    logoBackground: {
      position: 'absolute',
      width: 120,
      height: 120,
      backgroundColor: 'rgba(0, 255, 136, 0.1)',
      borderRadius: 60,
      borderWidth: 2,
      borderColor: 'rgba(0, 255, 136, 0.3)',
    },

    logoGlow: {
      position: 'absolute',
      width: 140,
      height: 140,
      backgroundColor: 'transparent',
      borderRadius: 70,
      borderWidth: 1,
      borderColor: 'rgba(0, 255, 136, 0.2)',
    },

    title: {
      color: colors.textPrimary,
      fontSize: 42,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
      letterSpacing: 2,
    },

    subtitle: {
      color: colors.textSecondary,
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 5,
      fontWeight: '300',
    },

    version: {
      color: colors.textTertiary,
      fontSize: 14,
      textAlign: 'center',
      marginTop: 10,
    },

    loadingContainer: {
      position: 'absolute',
      bottom: height * 0.25,
      alignItems: 'center',
    },

    loadingText: {
      color: colors.textSecondary,
      fontSize: 16,
      marginBottom: 15,
      fontWeight: '500',
    },

    dotsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.neonGreen,
      marginHorizontal: 4,
    },

    footer: {
      position: 'absolute',
      bottom: 40,
      alignItems: 'center',
    },

    footerText: {
      color: colors.textTertiary,
      fontSize: 12,
      textAlign: 'center',
    },

    footerSubtext: {
      color: colors.textTertiary,
      fontSize: 10,
      textAlign: 'center',
      marginTop: 2,
      opacity: 0.7,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={colors.darkBackground} translucent={false} />

      {/* Fondo con gradiente simulado */}
      <View style={styles.backgroundGradient} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ],
          },
        ]}
      >
        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <Image source={icon} style={{
                          marginTop: 80,
                          marginBottom: 10,
                          width: 150  ,
                          height: 150,
                          borderRadius: 75,
                        }} />
        </View>

        {/* Título */}
        <Text style={styles.subtitle}>Aprende el alfabeto de señas</Text>
        <Text style={styles.version}>v1.0.0</Text>
      </Animated.View>

      {/* Indicador de carga */}
      <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
        <Text style={styles.loadingText}>Cargando</Text>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: dotOpacity1 }]} />
          <Animated.View style={[styles.dot, { opacity: dotOpacity2 }]} />
          <Animated.View style={[styles.dot, { opacity: dotOpacity3 }]} />
        </View>
      </Animated.View>

      {/* Footer */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={styles.footerText}>Desarrollado con React Native</Text>
        <Text style={styles.footerSubtext}>Capstone Project</Text>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;
