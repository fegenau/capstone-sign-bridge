// App.js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importar pantallas
import SplashScreen from './screens/SplashScreen';
import AlphabetDetectionScreen from './screens/AlphabetDetectionScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: '#00FF88',
            background: '#000000',
            card: '#000000',
            text: '#FFFFFF',
            border: 'rgba(255, 255, 255, 0.1)',
            notification: '#FF4444',
          },
        }}
      >
        <StatusBar 
          style="light" 
          backgroundColor="#000000" 
          translucent={false}
        />
        
        <Stack.Navigator 
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
            cardStyle: { backgroundColor: '#000000' },
          }}
        >
          <Stack.Screen 
            name="Splash" 
            component={SplashScreen}
          />
          
          <Stack.Screen 
            name="AlphabetDetection" 
            component={AlphabetDetectionScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}