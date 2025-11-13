import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Theme Provider - Glassmorphic iOS Design
import { ThemeProvider, COLORS } from './context/ThemeContext';

// Screens
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import AlphabetDetectionScreen from './screens/AlphabetDetectionScreen';
import RealTimeDetectionScreen from './screens/RealTimeDetectionScreen';
import SettingsScreen from './screens/SettingsScreen';
import NumberDetectionScreen from './screens/NumberDetectionScreen';
import DictionaryScreen from './screens/DicctionaryScreen';
import NumberScreen from './screens/NumberScreen';

const Stack = createStackNavigator();

// Navigation theme - Glassmorphic iOS
const navigationTheme = {
  dark: true,
  colors: {
    primary: COLORS.neonGreen,
    background: COLORS.darkBackground,
    card: COLORS.darkSurface,
    text: COLORS.textPrimary,
    border: COLORS.border,
    notification: COLORS.error,
  },
};

const configureStatusBar = () => {
  if (Platform.OS === 'android') {
    StatusBar.setBackgroundColor('#000000');
    StatusBar.setBarStyle('light-content');
  }
};

const App = () => {
  React.useEffect(() => {
    configureStatusBar();
  }, []);

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <NavigationContainer theme={navigationTheme}>
          <ExpoStatusBar
            style="light"
            backgroundColor={COLORS.darkBackground}
            translucent={false}
          />

          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: COLORS.darkBackground },
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        >
          {/* Splash Screen */}
          <Stack.Screen 
            name="Splash" 
            component={SplashScreen}
            options={{
              gestureEnabled: false,
              animationEnabled: false,
            }}
          />
          
          {/* Home Screen */}
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              gestureEnabled: false,
              title: 'SignBridge',
            }}
          />
          
          {/* Alphabet Detection Screen */}
          <Stack.Screen
            name="AlphabetDetection"
            component={AlphabetDetectionScreen}
            options={{
              title: 'Detección',
              headerShown: false,
            }}
          />

          {/* Real-Time Detection Screen (with MediaPipe + TensorFlow) */}
          <Stack.Screen
            name="RealTimeDetection"
            component={RealTimeDetectionScreen}
            options={{
              title: 'Detección en Tiempo Real',
              headerShown: false,
            }}
          />

          <Stack.Screen 
            name="Number" 
            component={NumberScreen}
            options={{ 
              title: '',
              headerShown: true,
              
              
            }}
          />

          {/* Settings Screen */}
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{
              title: 'Configuración',
              headerShown: false,
            }}
          />
          
          
          <Stack.Screen 
            name="Dictionary" 
            component={DictionaryScreen}
            options={{
              title: '',
              headerShown: true,
              headerStyle: {
                backgroundColor: '#1A1A1A',
                shadowOpacity: 0,
                elevation: 0,
              },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
            {/* Pantallas futuras - Placeholders */}
            <Stack.Screen 
              name="Practice" 
              component={ComingSoonScreen}
              options={{
                title: 'Modo Práctica',
                headerShown: true,
                headerStyle: {
                  backgroundColor: '#1A1A1A',
                  shadowOpacity: 0,
                  elevation: 0,
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
          
          {/* <Stack.Screen 
            name="Progress" 
            component={ComingSoonScreen}
            options={{
              title: 'Mi Progreso',
              headerShown: true,
              headerStyle: {
                backgroundColor: '#1A1A1A',
                shadowOpacity: 0,
                elevation: 0,
              },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  </ThemeProvider>
  );
};

const ComingSoonScreen = ({ navigation }) => {
  const { View, Text, StyleSheet, TouchableOpacity } = require('react-native');
  const { Ionicons } = require('@expo/vector-icons');
  
  return (
    <View style={comingSoonStyles.container}>
      <View style={comingSoonStyles.content}>
        <Ionicons name="construct" size={80} color="#00FF88" />
        <Text style={comingSoonStyles.title}>Próximamente</Text>
        <Text style={comingSoonStyles.subtitle}>
          Esta función estará disponible en futuras actualizaciones.
        </Text>
        <TouchableOpacity 
          style={comingSoonStyles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={comingSoonStyles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const comingSoonStyles = {
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#00FF88',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
};

export default App;