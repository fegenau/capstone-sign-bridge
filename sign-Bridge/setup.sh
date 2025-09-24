#!/bin/bash

# SignBridge - Script de Instalación Rápida
# Para dispositivos móviles (Android/iOS)

echo "🚀 Configurando SignBridge..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Descarga desde: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

echo "✅ npm encontrado: $(npm --version)"

# Instalar Expo CLI globalmente
echo "📦 Instalando Expo CLI..."
npm install -g @expo/cli

# Instalar dependencias del proyecto
echo "📦 Instalando dependencias del proyecto..."
npm install

# Instalar dependencias específicas de Expo
echo "📦 Instalando dependencias de Expo..."
npx expo install expo-camera
npx expo install @react-navigation/native @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler
npx expo install @expo/vector-icons
npx expo install react-native-web react-dom @expo/metro-runtime

# Verificar y arreglar dependencias
echo "🔧 Verificando compatibilidad de dependencias..."
npx expo install --fix

echo ""
echo "✅ ¡Instalación completada!"
echo ""
echo "📱 Para ejecutar en dispositivo móvil:"
echo "   1. Instala 'Expo Go' en tu teléfono"
echo "   2. Ejecuta: npm start"
echo "   3. Escanea el código QR con Expo Go"
echo ""
echo "🌐 Para probar en navegador:"
echo "   npm run web"
echo ""
echo "📖 Lee SETUP.md para más detalles"