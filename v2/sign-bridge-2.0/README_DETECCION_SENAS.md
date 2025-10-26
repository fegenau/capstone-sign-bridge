# Sign Bridge 2.0 - Detección de Señas con IA

## 🤖 Funcionalidad de Detección de Señas

Esta aplicación integra un modelo de inteligencia artificial entrenado para detectar señas del alfabeto en tiempo real usando la cámara del dispositivo.

### 📋 Características Principales

#### 🎯 **Detección en Tiempo Real**
- Reconocimiento automático de las letras **A**, **B**, **C** del alfabeto de señas
- Procesamiento continuo de video de la cámara
- Indicadores visuales de confianza de detección
- Historial de las últimas detecciones

#### 🔧 **Modelo de IA**
- **Archivo**: `assets/Modelo/v1.0/model_fp16.tflite`
- **Etiquetas**: `assets/Modelo/v1.0/labels.txt`
- **Formato**: TensorFlow Lite optimizado
- **Precisión**: FP16 para mejor rendimiento

#### 📱 **Compatibilidad Multiplataforma**
- **iOS**: Cámara nativa con permisos específicos
- **Android**: Integración con sistema de cámara Android
- **Web**: Acceso directo a cámara del navegador

### 🎮 **Cómo Usar**

1. **Abrir la aplicación**: Ejecuta `npm start` y selecciona tu plataforma
2. **Modo Detección**: Presiona el botón "🤟 Detectar Señas IA"
3. **Permisos**: Acepta los permisos de cámara cuando se soliciten
4. **Detección**: Coloca tu mano en el área marcada y realiza las señas
5. **Resultados**: Observa las predicciones en tiempo real con indicadores de confianza

### 📊 **Interfaz de Usuario**

#### 🎨 **Elementos Visuales**
- **Marco de detección**: Área delimitada con animación de pulso durante la detección
- **Indicador de estado**: Muestra si el modelo está cargado y listo
- **Resultado actual**: Letra detectada con porcentaje de confianza
- **Historial**: Últimas 3 detecciones realizadas
- **Controles**: Botones para capturar, iniciar/parar detección y cerrar

#### 🎯 **Niveles de Confianza**
- **🟢 Alta (80%+)**: Verde - Detección muy confiable
- **🟡 Media (60-79%)**: Naranja - Detección moderadamente confiable  
- **🔴 Baja (<60%)**: Rojo - Detección de baja confianza

### 🔧 **Configuración Técnica**

#### 📦 **Dependencias**
```json
{
  "expo-camera": "^17.0.8",
  "expo-image-picker": "^15.0.7",
  "expo-image-manipulator": "^12.0.5",
  "expo-media-library": "^16.0.4"
}
```

#### ⚙️ **Permisos Configurados**

**Android (`app.json`):**
```json
"permissions": [
  "CAMERA",
  "RECORD_AUDIO", 
  "READ_EXTERNAL_STORAGE",
  "WRITE_EXTERNAL_STORAGE"
]
```

**iOS (`app.json`):**
```json
"infoPlist": {
  "NSCameraUsageDescription": "Esta aplicación necesita acceso a la cámara para capturar fotos.",
  "NSMicrophoneUsageDescription": "Esta aplicación necesita acceso al micrófono para grabar audio.",
  "NSPhotoLibraryUsageDescription": "Esta aplicación necesita acceso a la galería para guardar fotos."
}
```

### 🏗️ **Arquitectura del Código**

#### 📁 **Estructura de Componentes**
```
components/
├── home.tsx                    # Componente principal con navegación
├── SignDetection/
│   └── SignDetectionCamera.tsx # Cámara especializada para detección
└── hooks/
    └── useSignLanguageModel.ts # Lógica del modelo de IA
```

#### 🔗 **Flujo de Datos**
1. `useSignLanguageModel` → Carga el modelo y procesa detecciones
2. `SignDetectionCamera` → Maneja la interfaz de cámara y visualización
3. `home.tsx` → Coordina la navegación y muestra resultados

### 🚀 **Comandos de Ejecución**

```bash
# Iniciar servidor de desarrollo
npm start

# Ejecutar en web
npm run web

# Ejecutar en Android
npm run android

# Ejecutar en iOS  
npm run ios
```

### 📈 **Funcionalidades Futuras**

- [ ] Ampliación del alfabeto (D-Z)
- [ ] Detección de palabras completas
- [ ] Traducción a texto y voz
- [ ] Entrenamiento de modelo personalizado
- [ ] Exportar oraciones formadas
- [ ] Modo de aprendizaje interactivo

### 🔍 **Notas Técnicas**

#### ⚡ **Rendimiento**
- La detección se actualiza cada 1.5 segundos para optimizar rendimiento
- Solo se aceptan detecciones con confianza ≥ 70%
- El modelo está optimizado con precisión FP16

#### 🐛 **Solución de Problemas**
- **Permisos denegados**: Verificar configuración en Settings → Privacy → Camera
- **Modelo no carga**: Verificar que los archivos estén en `assets/Modelo/v1.0/`
- **Detección inconsistente**: Asegurar buena iluminación y contraste

### 📝 **Créditos**
- Modelo de IA: TensorFlow Lite
- Framework: Expo + React Native
- Cámara: expo-camera
- Procesamiento: expo-image-manipulator