# SignBridge - Guía de Instalación

## Descripción del Proyecto
SignBridge es una aplicación móvil React Native para aprender el alfabeto de señas mediante detección de gestos en tiempo real usando la cámara del dispositivo.

## Requisitos del Sistema

### Software Requerido
- **Node.js**: v18.x o superior (LTS recomendado)
- **npm**: v9.x o superior (incluido con Node.js)
- **Expo CLI**: Última versión
- **Git**: Para clonar el repositorio

### Dispositivos de Desarrollo
- **Android**: Dispositivo físico con Android 7.0+ o emulador
- **iOS**: Dispositivo físico con iOS 13.0+ o simulador (requiere macOS)

### Herramientas Opcionales
- **Android Studio**: Para emulador Android
- **Xcode**: Para simulador iOS (solo macOS)

## Instalación

### 1. Clonar el Repositorio
```bash
git clone https://github.com/fegenau/capstone-sign-bridge.git
cd capstone-sign-bridge/sign-Bridge
```

### 2. Instalar Node.js y npm
Descarga e instala desde: https://nodejs.org/

Verificar instalación:
```bash
node --version  # Debe ser v18.x+
npm --version   # Debe ser v9.x+
```

### 3. Instalar Expo CLI Global
```bash
npm install -g @expo/cli
```

### 4. Instalar Dependencias del Proyecto
```bash
npm install
```

### 5. Instalar Dependencias Específicas
```bash
# Dependencias principales de cámara
npx expo install expo-camera

# Dependencias de navegación
npx expo install @react-navigation/native @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler

# Dependencias de UI
npx expo install @expo/vector-icons

# Dependencias web (para testing)
npx expo install react-native-web react-dom @expo/metro-runtime

# Verificar y arreglar dependencias
npx expo install --fix
```

## Configuración

### 1. Verificar package.json
Asegúrate de que tu `package.json` contenga estas dependencias:

```json
{
  "dependencies": {
    "@expo/vector-icons": "^14.0.0",
    "@react-navigation/native": "^6.1.7",
    "@react-navigation/stack": "^6.3.17",
    "expo": "~51.0.0",
    "expo-camera": "~15.0.0",
    "expo-status-bar": "~1.12.0",
    "react": "18.2.0",
    "react-native": "0.74.2",
    "react-native-gesture-handler": "~2.16.0",
    "react-native-reanimated": "~3.10.0",
    "react-native-safe-area-context": "4.10.0",
    "react-native-screens": "3.31.0",
    "react-native-web": "~0.19.6",
    "react-dom": "18.2.0",
    "@expo/metro-runtime": "~3.2.0"
  }
}
```

### 2. Configurar app.json
```json
{
  "expo": {
    "name": "SignBridge",
    "slug": "signbridge",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "dark",
    "backgroundColor": "#000000",
    "splash": {
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "ios": {
      "supportsTablet": false,
      "infoPlist": {
        "NSCameraUsageDescription": "SignBridge necesita acceso a la cámara para detectar letras del alfabeto de señas."
      }
    },
    "android": {
      "permissions": ["CAMERA"]
    },
    "web": {
      "bundler": "metro"
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "SignBridge necesita acceso a la cámara para detectar letras del alfabeto de señas."
        }
      ]
    ]
  }
}
```

## Ejecución

### 1. Iniciar el Servidor de Desarrollo
```bash
npm start
# o
npx expo start
```

### 2. Opciones de Testing

#### En Dispositivo Físico (Recomendado)
1. Instala **Expo Go** desde:
   - Google Play Store (Android)
   - App Store (iOS)

2. Escanea el código QR que aparece en la terminal:
   - **Android**: Usa la app Expo Go
   - **iOS**: Usa la app de Cámara nativa

#### En Emulador/Simulador
```bash
# Para Android (requiere Android Studio)
npx expo start --android

# Para iOS (requiere macOS + Xcode)
npx expo start --ios
```

#### En Navegador Web (Solo para Testing UI)
```bash
npx expo start --web
```

## Estructura del Proyecto

```
sign-Bridge/
├── App.js                          # Punto de entrada principal
├── app.json                        # Configuración de Expo
├── package.json                    # Dependencias y scripts
├── screens/
│   └── AlphabetDetectionScreen.js  # Pantalla principal de detección
├── src/
│   ├── components/
│   │   └── camera/
│   │       └── DetectionOverlay.js # Overlay de detección
│   └── utils/
│       └── services/
│           └── detectionService.js # Servicio de detección
└── assets/                         # Recursos (imágenes, iconos)
```

## Funcionalidades Implementadas

- ✅ **Vista de cámara en tiempo real**
- ✅ **Detección simulada de letras A-Z**
- ✅ **Overlay con letra detectada y confianza**
- ✅ **Panel de alfabeto con highlight automático**
- ✅ **Controles de cámara (frontal/trasera, detectar, pausar)**
- ✅ **Panel de estado en tiempo real**
- ✅ **Manejo de permisos de cámara**

## Solución de Problemas

### Error: "Metro bundler failed"
```bash
npx expo start --clear
```

### Error: "Unable to resolve module"
```bash
rm -rf node_modules package-lock.json
npm install
npx expo install --fix
```

### Error: "Camera permissions"
- Verificar que los permisos estén en app.json
- En iOS: Ir a Configuración > SignBridge > Cámara
- En Android: Configuración > Apps > SignBridge > Permisos

### Error: "Expo Go incompatible"
- Actualizar Expo Go en tu dispositivo
- Verificar versión de Expo SDK en package.json

## Scripts Disponibles

```bash
npm start          # Iniciar servidor de desarrollo
npm run android    # Abrir en Android
npm run ios        # Abrir en iOS
npm run web        # Abrir en navegador
```

## Próximos Pasos de Desarrollo

1. **Integración con modelo de IA**: Reemplazar detección simulada
2. **Modo de práctica**: Ejercicios guiados
3. **Progreso del usuario**: Sistema de puntuación
4. **Biblioteca de gestos**: Palabras completas
5. **Modo offline**: Funcionalidad sin internet

## Contacto y Soporte

- **Repositorio**: https://github.com/fegenau/capstone-sign-bridge
- **Issues**: Reportar problemas en GitHub Issues
- **Documentación**: README.md del repositorio

## Versiones Verificadas

- **Expo SDK**: 51.0.0
- **React Native**: 0.74.2
- **Node.js**: 18.17.0
- **npm**: 9.6.7

---

*Última actualización: Diciembre 2024*