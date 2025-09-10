// App.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native'; // IMPORTAR AQUÍ
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importar estilos globales
import { COLORS } from './styles/colors.js';
import { SCREEN_NAMES } from './utils/constants';

// Componente temporal para testing
const TestScreen = () => {
  // ELIMINAR esta línea:
  // const { View, Text, StyleSheet } = require('react-native');
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>✅ SignBridge configurado correctamente</Text>
      <Text style={styles.subtitle}>Dependencias instaladas</Text>
      <Text style={styles.subtitle}>Estructura de carpetas creada</Text>
      <Text style={styles.subtitle}>Estilos globales configurados</Text>
      <Text style={styles.subtitle}>Constantes definidas</Text>
    </View>
  );
};

// Mover los estilos FUERA del componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    color: COLORS.success,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  subtitle: {
    color: COLORS.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
});

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: COLORS.primary,
            background: COLORS.background,
            card: COLORS.surface || COLORS.background,
            text: COLORS.text,
            border: COLORS.border,
            notification: COLORS.error,
          },
        }}
      >
        <StatusBar 
          style="light" 
          backgroundColor={COLORS.background} 
          translucent={false}
        />
        
        <Stack.Navigator 
          initialRouteName="Test"
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
            cardStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen 
            name="Test" 
            component={TestScreen} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}