// screens/HomeScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const { colors, styles: themeStyles } = useTheme();

  const menuOptions = [
    {
      id: "dictionary",
      title: "Diccionario",
      subtitle: "Explora todas las letras",
      icon: "library",
      color: colors.warning,
      screen: "Dictionary",
      available: true,
    },
    {
      id: "numbers",
      title: "Modo Números",
      subtitle: "Aprende los números en señas",
      icon: "school",
      color: colors.neonBlue,
      screen: "Number",
      available: true,
    },
    {
      id: "settings",
      title: "Configuración",
      subtitle: "Ajustes de la aplicación",
      icon: "settings",
      color: colors.textSecondary,
      screen: "Settings",
      available: true,
    },
  ];

  const handleMenuPress = (option) => {
    if (!option.available) {
      alert("Esta función estará disponible próximamente.");
      return;
    }
    navigation.navigate(option.screen);
  };

  const renderMenuItem = (option) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.menuItem,
        !option.available && styles.menuItemDisabled,
        {
          borderLeftColor: option.color,
          backgroundColor: colors.darkSurface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
        },
      ]}
      onPress={() => handleMenuPress(option)}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemContent}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${option.color}20` },
          ]}
        >
          <Ionicons
            name={option.icon}
            size={24}
            color={option.available ? option.color : colors.textTertiary}
          />
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.menuTitle,
              { color: colors.textPrimary },
              !option.available && { color: colors.textTertiary },
            ]}
          >
            {option.title}
          </Text>
          <Text
            style={[
              styles.menuSubtitle,
              { color: colors.textSecondary },
              !option.available && { color: colors.textTertiary },
            ]}
          >
            {option.subtitle}
          </Text>
        </View>

        <View style={styles.arrowContainer}>
          {!option.available && (
            <View style={[styles.comingSoonBadge, { backgroundColor: `${colors.warning}20` }]}>
              <Text style={[styles.comingSoonText, { color: colors.warning }]}>Próximamente</Text>
            </View>
          )}
          <Ionicons
            name="chevron-forward"
            size={20}
            color={option.available ? colors.textSecondary : colors.textTertiary}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const icon = require("../assets/images/IconSignBridge.png");

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.darkBackground }]}>
      <StatusBar style="light" backgroundColor={colors.darkBackground} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        scrollIndicatorInsets={{ right: 2 }}
        bounces={true}
        alwaysBounceVertical={true}
        persistentScrollbar={true}
      >
        <View style={styles.header}>
          <Image
            source={icon}
            style={{
              marginTop: 80,
              marginBottom: 10,
              width: 150,
              height: 150,
              borderRadius: 75,
            }}
          />
          <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>Aprende el alfabeto de señas</Text>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>¡Bienvenido!</Text>
          <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
            Comienza tu viaje aprendiendo el alfabeto de lenguaje de señas. Usa
            la cámara para practicar o explora nuestras lecciones.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.quickStartCard, { backgroundColor: colors.neonGreen }]}
          onPress={() => navigation.navigate("AlphabetDetection")}
          activeOpacity={0.8}
        >
          <View style={styles.quickStartContent}>
            <View style={styles.quickStartIcon}>
              <Ionicons name="play" size={30} color="#000" />
            </View>
            <View style={styles.quickStartText}>
              <Text style={styles.quickStartTitle}>Detección de Señas</Text>
              <Text style={styles.quickStartSubtitle}>
                Practica lenguaje de señas
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="rgba(0,0,0,0.5)"
            />
          </View>
        </TouchableOpacity>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          {menuOptions.map(renderMenuItem)}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            SignBridge v1.0.0 • Capstone Project
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  scrollView: {
    flex: 1,
  },

  scrollContainer: {
    paddingBottom: 50,
    minHeight: '120%',
  },

  header: {
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },

  logoSection: {
    resizeMode: "center",
    paddingTop: 80,
    alignItems: "center",
  },

  logoContainer: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(0, 255, 136, 0.1)",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 2,
    borderColor: "rgba(0, 255, 136, 0.3)",
  },

  appTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    marginLeft: 20,
  },

  appSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },

  welcomeSection: {
    padding: 20,
    paddingTop: 10,
  },

  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },

  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
  },

  quickStartCard: {
    margin: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
  },

  quickStartCardSecondary: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#4A90E2",
  },

  quickStartContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  quickStartIcon: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  quickStartIconSecondary: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(74, 144, 226, 0.2)",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  quickStartText: {
    flex: 1,
  },

  quickStartTitle: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "bold",
  },

  quickStartSubtitle: {
    color: "rgba(0, 0, 0, 0.7)",
    fontSize: 14,
    marginTop: 2,
  },

  quickStartTitleSecondary: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  quickStartSubtitleSecondary: {
    color: "#CCCCCC",
    fontSize: 14,
    marginTop: 2,
  },

  menuSection: {
    padding: 20,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },

  menuItem: {
    marginBottom: 12,
    borderLeftWidth: 4,
  },

  menuItemDisabled: {
    opacity: 0.6,
  },

  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  textContainer: {
    flex: 1,
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },

  menuSubtitle: {
    fontSize: 14,
  },

  textDisabled: {
    color: "#666666",
  },

  arrowContainer: {
    alignItems: "flex-end",
  },

  comingSoonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },

  comingSoonText: {
    fontSize: 10,
    fontWeight: "600",
  },

  extraContent: {
    padding: 20,
    marginBottom: 20,
  },

  extraTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  featureItem: {
    marginBottom: 10,
  },

  featureText: {
    color: "#CCCCCC",
    fontSize: 14,
    lineHeight: 20,
  },

  footer: {
    padding: 20,
    alignItems: "center",
  },

  footerText: {
    fontSize: 12,
    textAlign: "center",
  },
});

export default HomeScreen;
