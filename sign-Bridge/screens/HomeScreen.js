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

const { width, height } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const menuOptions = [
    {
      id: "dictionary",
      title: "Diccionario",
      subtitle: "Explora todas las letras",
      icon: "library",
      color: "#FFB800",
      screen: "Dictionary",
      available: true,
    },
    {
      id: "numbers",
      title: "Modo Números",
      subtitle: "Aprende los números en señas",
      icon: "school",
      color: "#007AFF",
      screen: "Number",
      available: true,
    },
    // {
    //   id: "practice",
    //   title: "Modo Práctica",
    //   subtitle: "Aprende paso a paso",
    //   icon: "school",
    //   color: "#007AFF",
    //   screen: "Practice",
    //   available: false,
    // },
    // {
    //   id: 'progress',
    //   title: 'Mi Progreso',
    //   subtitle: 'Ve tus estadísticas',
    //   icon: 'stats-chart',
    //   color: '#FF6B6B',
    //   screen: 'Progress',
    //   available: false,
    // },
    {
      id: "settings",
      title: "Configuración",
      subtitle: "Ajustes de la aplicación",
      icon: "settings",
      color: "#8E8E93",
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
        { borderLeftColor: option.color },
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
            color={option.available ? option.color : "#666"}
          />
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[styles.menuTitle, !option.available && styles.textDisabled]}
          >
            {option.title}
          </Text>
          <Text
            style={[
              styles.menuSubtitle,
              !option.available && styles.textDisabled,
            ]}
          >
            {option.subtitle}
          </Text>
        </View>

        <View style={styles.arrowContainer}>
          {!option.available && (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Próximamente</Text>
            </View>
          )}
          <Ionicons
            name="chevron-forward"
            size={20}
            color={option.available ? "#CCCCCC" : "#666"}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const icon = require("../assets/images/IconSignBridge.png");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
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
          <Text style={styles.appSubtitle}>Aprende el alfabeto de señas</Text>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
          <Text style={styles.welcomeText}>
            Comienza tu viaje aprendiendo el alfabeto de lenguaje de señas. Usa
            la cámara para practicar o explora nuestras lecciones.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.quickStartCard}
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

        {/* <TouchableOpacity
          style={styles.quickStartCardSecondary}
          onPress={() => navigation.navigate("NumberDetection")}
          activeOpacity={0.8}
        >
          <View style={styles.quickStartContent}>
            <View style={styles.quickStartIconSecondary}>
              <Ionicons name="keypad-outline" size={30} color="#4A90E2" />
            </View>
            <View style={styles.quickStartText}>
              <Text style={styles.quickStartTitleSecondary}>Números</Text>
              <Text style={styles.quickStartSubtitleSecondary}>
                Practica números del 0 al 9
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </View>
        </TouchableOpacity> */}

        {/* Menu Options */}
        <View style={styles.menuSection}>
          {menuOptions.map(renderMenuItem)}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
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

  scrollContainer: {
    paddingBottom: 30,
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
    color: "#CCCCCC",
    fontSize: 14,
    marginTop: 2,
  },

  welcomeSection: {
    padding: 20,
    paddingTop: 10,
  },

  welcomeTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },

  welcomeText: {
    color: "#CCCCCC",
    fontSize: 16,
    lineHeight: 24,
  },

  quickStartCard: {
    margin: 20,
    marginBottom: 12,
    backgroundColor: "#00FF88",
    borderRadius: 16,
    padding: 20,
  },

  // ✅ NUEVO: Estilo para card de números
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

  // ✅ NUEVO: Ícono para card de números
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

  // ✅ NUEVO: Títulos para card de números
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
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
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
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },

  menuSubtitle: {
    color: "#CCCCCC",
    fontSize: 14,
  },

  textDisabled: {
    color: "#666666",
  },

  arrowContainer: {
    alignItems: "flex-end",
  },

  comingSoonBadge: {
    backgroundColor: "rgba(255, 184, 0, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },

  comingSoonText: {
    color: "#FFB800",
    fontSize: 10,
    fontWeight: "600",
  },

  footer: {
    padding: 20,
    alignItems: "center",
  },

  footerText: {
    color: "#666666",
    fontSize: 12,
    textAlign: "center",
  },
});

export default HomeScreen;
