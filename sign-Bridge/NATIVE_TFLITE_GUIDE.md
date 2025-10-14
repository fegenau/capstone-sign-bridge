# 🚀 Guía Completa: Implementar Módulo Nativo TFLite

## 📋 Requisitos Previos

- ✅ Node.js y npm instalados
- ✅ Expo CLI actualizado
- ✅ Android Studio (para Android) o Xcode (para iOS)
- ✅ Expo Dev Client instalado en el proyecto
- ✅ Modelo `best_float16.tflite` en assets

## 🎯 Resumen del Proceso

1. **Configurar Expo Dev Client** ✅ (Ya hecho)
2. **Configurar expo-build-properties**
3. **Crear módulo Expo para TFLite**
4. **Implementar código nativo (Android/iOS)**
5. **Actualizar detectionService.js**
6. **Compilar y probar**

---

## Paso 1: Instalar expo-build-properties

Este plugin permite configurar propiedades de compilación nativas.

```bash
cd sign-Bridge
npx expo install expo-build-properties
```

---

## Paso 2: Configurar app.json

Actualiza tu `app.json` o `app.config.js`:

### app.json
```json
{
  "expo": {
    "name": "signbridge",
    "slug": "signbridge",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.signbridge.app",
      "infoPlist": {
        "NSCameraUsageDescription": "Esta app necesita acceso a la cámara para detectar señas."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.signbridge.app",
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-camera",
      [
        "expo-build-properties",
        {
          "android": {
            "minSdkVersion": 21,
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "buildToolsVersion": "34.0.0",
            "kotlinVersion": "1.9.0"
          },
          "ios": {
            "deploymentTarget": "13.4"
          }
        }
      ]
    ]
  }
}
```

---

## Paso 3: Crear Módulo Expo para TFLite

### Opción A: Usar librería existente (Recomendado) ⭐

Usa `react-native-fast-tflite` que ya tiene todo implementado:

```bash
npm install react-native-fast-tflite --legacy-peer-deps
```

#### Configurar el módulo

En `app.json`, agrega:

```json
{
  "expo": {
    "plugins": [
      "react-native-fast-tflite"
    ]
  }
}
```

#### Actualizar detectionService.js

```javascript
import { loadTensorflowModel } from 'react-native-fast-tflite';

class DetectionService {
  async loadModel() {
    try {
      this.modelLoadAttempts++;
      console.log(`🔄 Intentando cargar modelo TFLite (intento ${this.modelLoadAttempts})...`);
      
      // Obtener URI del modelo
      const assetUri = ExpoAsset.fromModule(
        require('../../assets/Modelo/best_float16.tflite')
      );
      await assetUri.downloadAsync();
      const modelUri = assetUri.localUri || assetUri.uri;
      
      // Cargar modelo con react-native-fast-tflite
      this.model = await loadTensorflowModel(modelUri);
      this.isModelLoaded = true;
      this.modelFileExists = true;
      
      console.log('✅ Modelo TFLite cargado exitosamente');
      console.log('📊 Inputs:', this.model.inputs);
      console.log('📊 Outputs:', this.model.outputs);
      
      // Notificar
      this.notifyCallbacks({
        modelLoaded: true,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('❌ Error al cargar modelo:', error);
      this.isModelLoaded = false;
      this.scheduleModelRetry();
    }
  }
  
  async processImageWithModel(imageUri) {
    if (!this.isModelLoaded || !this.model) {
      return null;
    }
    
    try {
      // Leer imagen
      const imageData = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      // Convertir a array de números (normalizado)
      // YOLO espera input de [1, 640, 640, 3]
      const inputTensor = await this.prepareImageTensor(imageData);
      
      // Ejecutar inferencia
      const outputs = this.model.run([inputTensor]);
      
      // Procesar salidas de YOLO
      return await this.processPredictions(outputs);
      
    } catch (error) {
      console.error('❌ Error en inferencia:', error);
      return null;
    }
  }
  
  async prepareImageTensor(base64Image) {
    // Decodificar imagen
    // Redimensionar a 640x640
    // Normalizar valores a [0, 1]
    // Retornar Float32Array
    
    // Esto requiere procesamiento de imagen nativo
    // Por ahora, retornar placeholder
    return new Float32Array(640 * 640 * 3);
  }
}
```

### Opción B: Crear módulo custom con Expo Modules API

Si prefieres crear tu propio módulo:

```bash
npx create-expo-module tflite-detector --local
```

Esto crea:
```
modules/
  tflite-detector/
    android/          # Código Kotlin/Java
    ios/              # Código Swift/Objective-C
    src/              # Código TypeScript
    package.json
```

---

## Paso 4: Compilar la App

### Para Android

```bash
# Prebuilding (genera carpetas android/ e ios/)
npx expo prebuild --platform android

# Compilar y ejecutar
npx expo run:android
```

### Para iOS

```bash
# Prebuilding
npx expo prebuild --platform ios

# Instalar pods
cd ios
pod install
cd ..

# Compilar y ejecutar
npx expo run:ios
```

---

## Paso 5: Alternativa Más Simple - Usar ONNX Runtime

Si TFLite es muy complejo, puedes usar ONNX Runtime que es más fácil de integrar:

### Convertir modelo a ONNX

```python
from ultralytics import YOLO

# Cargar y exportar
model = YOLO('best.pt')
model.export(format='onnx')
# Genera: best.onnx
```

### Instalar ONNX Runtime

```bash
npm install onnxruntime-react-native --legacy-peer-deps
```

### Usar en detectionService.js

```javascript
import { InferenceSession, Tensor } from 'onnxruntime-react-native';

class DetectionService {
  async loadModel() {
    try {
      const assetUri = ExpoAsset.fromModule(
        require('../../assets/Modelo/best.onnx')
      );
      await assetUri.downloadAsync();
      const modelUri = assetUri.localUri;
      
      this.model = await InferenceSession.create(modelUri);
      this.isModelLoaded = true;
      
      console.log('✅ Modelo ONNX cargado exitosamente');
      
    } catch (error) {
      console.error('❌ Error:', error);
    }
  }
  
  async processImageWithModel(imageUri) {
    try {
      // Preparar input tensor
      const inputTensor = new Tensor('float32', inputData, [1, 3, 640, 640]);
      
      // Ejecutar inferencia
      const results = await this.model.run({ images: inputTensor });
      
      // Procesar resultados
      return this.processPredictions(results);
      
    } catch (error) {
      console.error('❌ Error:', error);
      return null;
    }
  }
}
```

---

## 📊 Comparación de Opciones

| Característica | TFLite Nativo | ONNX Runtime | Backend API |
|----------------|---------------|--------------|-------------|
| **Complejidad** | 🔴 Alta | 🟡 Media | 🟢 Baja |
| **Rendimiento** | 🟢 Excelente | 🟢 Bueno | 🟡 Depende red |
| **Offline** | ✅ Sí | ✅ Sí | ❌ No |
| **OTA Updates** | ❌ No | ❌ No | ✅ Sí |
| **Tamaño App** | 📦 +15MB | 📦 +10MB | 📦 Sin cambio |
| **Setup Time** | ⏱️ 2-4 horas | ⏱️ 1-2 horas | ⏱️ 30 mins |

---

## 🎯 Recomendación

### Para Desarrollo/MVP
✅ **Backend API** (ver `BACKEND_API_GUIDE.md`)
- Más rápido de implementar
- Fácil de actualizar
- No requiere recompilación

### Para Producción
✅ **ONNX Runtime**
- Buen balance complejidad/rendimiento
- Funciona offline
- Más fácil que TFLite nativo
- Cross-platform

### Para Máximo Rendimiento
✅ **TFLite Nativo Custom**
- Mejor rendimiento
- Acceso completo a GPU/NPU
- Más control

---

## 🚀 Próximos Pasos Recomendados

### Opción 1: ONNX Runtime (Recomendado para ti) ⭐

```bash
# 1. Convertir modelo
python -c "from ultralytics import YOLO; YOLO('best.pt').export(format='onnx')"

# 2. Copiar best.onnx a assets/Modelo/

# 3. Instalar ONNX Runtime
npm install onnxruntime-react-native --legacy-peer-deps

# 4. Actualizar detectionService.js (código arriba)

# 5. Prebuilding
npx expo prebuild

# 6. Ejecutar
npx expo run:android
# o
npx expo run:ios
```

### Opción 2: Backend API (Más Simple)

Ver `BACKEND_API_GUIDE.md` para implementación completa en Python.

---

## 📝 Checklist

- [ ] Instalar expo-dev-client ✅
- [ ] Instalar expo-build-properties
- [ ] Configurar app.json con plugins
- [ ] Elegir TFLite vs ONNX vs API
- [ ] Convertir modelo al formato elegido
- [ ] Implementar código de inferencia
- [ ] Prebuild (npx expo prebuild)
- [ ] Compilar para Android/iOS
- [ ] Probar en dispositivo real
- [ ] Medir rendimiento
- [ ] Optimizar si es necesario

---

## 🆘 Ayuda

### Si tienes errores de compilación
1. Limpia cache: `npx expo start --clear`
2. Limpia builds: `rm -rf android ios`
3. Vuelve a prebuild: `npx expo prebuild --clean`

### Si el modelo no carga
1. Verifica formato del modelo
2. Chequea tamaño (< 100MB preferible)
3. Revisa logs nativos con `adb logcat` (Android)

### Si va lento
1. Usa GPU delegate
2. Reduce tamaño de input
3. Considera cuantización (int8)

---

**¿Qué opción prefieres? Te recomiendo ONNX Runtime para un buen balance.**
