// screens/SettingsScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const SettingsScreen = ({ navigation }) => {
  // Estados para configuraciones
  const [notifications, setNotifications] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [autoDetection, setAutoDetection] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);

  const settingsSections = [
    {
      title: 'Detección',
      items: [
        {
          id: 'auto-detection',
          title: 'Detección Automática',
          subtitle: 'Detectar letras continuamente',
          type: 'switch',
          value: autoDetection,
          onValueChange: setAutoDetection,
          icon: 'scan',
        },
        {
          id: 'detection-speed',
          title: 'Velocidad de Detección',
          subtitle: 'Ajustar sensibilidad',
          type: 'navigation',
          icon: 'speedometer',
          onPress: () => Alert.alert('Configuración', 'Función disponible próximamente'),
        },
      ],
    },
    {
      title: 'Interfaz',
      items: [
        {
          id: 'notifications',
          title: 'Notificaciones',
          subtitle: 'Recibir alertas y recordatorios',
          type: 'switch',
          value: notifications,
          onValueChange: setNotifications,
          icon: 'notifications',
        },
        {
          id: 'haptic',
          title: 'Vibración',
          subtitle: 'Feedback háptico',
          type: 'switch',
          value: hapticFeedback,
          onValueChange: setHapticFeedback,
          icon: 'phone-portrait',
        },
        {
          id: 'sound',
          title: 'Efectos de Sonido',
          subtitle: 'Sonidos de la interfaz',
          type: 'switch',
          value: soundEffects,
          onValueChange: setSoundEffects,
          icon: 'volume-high',
        },
      ],
    },
    {
      title: 'Información',
      items: [
        {
          id: 'about',
          title: 'Acerca de SignBridge',
          subtitle: 'Versión 1.0.0',
          type: 'navigation',
          icon: 'information-circle',
          onPress: () => showAboutDialog(),
        },
        {
          id: 'help',
          title: 'Ayuda y Tutorial',
          subtitle: 'Cómo usar la aplicación',
          type: 'navigation',
          icon: 'help-circle',
          onPress: () => Alert.alert('Ayuda', 'Tutorial disponible próximamente'),
        },
        {
          id: 'privacy',
          title: 'Privacidad',
          subtitle: 'Política de privacidad',
          type: 'navigation',
          icon: 'shield-checkmark',
          onPress: () => showPrivacyDialog(),
        },
      ],
    },
  ];

  const showAboutDialog = () => {
    Alert.alert(
      'SignBridge v1.0.0',
      'Una aplicación para aprender el alfabeto de lenguaje de señas usando inteligencia artificial.\n\nDesarrollado como proyecto de capstone.\n\n© 2024 SignBridge Team',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const showPrivacyDialog = () => {
    Alert.alert(
      'Privacidad',
      'SignBridge procesa las imágenes de la cámara localmente en tu dispositivo. No se envían datos personales ni imágenes a servidores externos.\n\nTus datos están seguros.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const renderSettingItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      activeOpacity={item.type === 'switch' ? 1 : 0.7}
    >
      <View style={styles.settingContent}>
        <View style={styles.settingIcon}>
          <Ionicons name={item.icon} size={24} color="#00FF88" />
        </View>
        
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
        
        <View style={styles.settingControl}>
          {item.type === 'switch' ? (
            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              trackColor={{ false: '#767577', true: '#00FF88' }}
              thumbColor={item.value ? '#FFFFFF' : '#f4f3f4'}
            />
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (section) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map(renderSettingItem)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {settingsSections.map(renderSection)}
        
        {/* Reset Section */}
        <View style={styles.dangerSection}>
          <TouchableOpacity 
            style={styles.dangerButton}
            onPress={() => {
              Alert.alert(
                'Restablecer Configuración',
                '¿Estás seguro de que quieres restablecer todas las configuraciones a los valores por defecto?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { 
                    text: 'Restablecer', 
                    style: 'destructive',
                    onPress: () => {
                      setNotifications(true);
                      setHapticFeedback(true);
                      setAutoDetection(true);
                      setSoundEffects(false);
                      Alert.alert('Éxito', 'Configuración restablecida');
                    }
                  },
                ]
              );
            }}
          >
            <Ionicons name="refresh" size={20} color="#FF4444" />
            <Text style={styles.dangerButtonText}>Restablecer Configuración</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  headerSpacer: {
    width: 40,
  },
  
  content: {
    flex: 1,
    padding: 20,
  },
  
  section: {
    marginBottom: 30,
  },
  
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  
  sectionContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  settingItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  
  settingIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  
  settingText: {
    flex: 1,
  },
  
  settingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  
  settingSubtitle: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  
  settingControl: {
    marginLeft: 10,
  },
  
  dangerSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#FF4444',
    borderRadius: 12,
    padding: 16,
  },
  
  dangerButtonText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SettingsScreen;