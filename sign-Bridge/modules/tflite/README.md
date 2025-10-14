# Módulo Nativo TFLite para React Native

## 📦 Estructura del Módulo

Este módulo permite ejecutar modelos TensorFlow Lite directamente en React Native con Expo Dev Client.

## 🛠️ Implementación

### Android (Java/Kotlin)

El módulo usa TensorFlow Lite para Android para ejecutar inferencias del modelo YOLO.

### iOS (Swift/Objective-C)

El módulo usa TensorFlow Lite para iOS para ejecutar inferencias del modelo YOLO.

## 🔧 API

### `TFLiteModule.loadModel(modelPath: string): Promise<boolean>`

Carga el modelo TFLite desde la ruta especificada.

**Parámetros:**
- `modelPath`: Ruta al archivo .tflite

**Retorna:**
- `Promise<boolean>`: true si se cargó exitosamente

**Ejemplo:**
```javascript
const loaded = await TFLiteModule.loadModel('file:///path/to/model.tflite');
if (loaded) {
  console.log('Modelo cargado!');
}
```

### `TFLiteModule.runInference(imageUri: string): Promise<Detection[]>`

Ejecuta inferencia en una imagen.

**Parámetros:**
- `imageUri`: URI de la imagen a procesar

**Retorna:**
- `Promise<Detection[]>`: Array de detecciones

**Tipo Detection:**
```typescript
interface Detection {
  className: string;      // Nombre de la clase (ej: 'A', 'B', '1', '2')
  classId: number;        // ID de la clase
  confidence: number;     // Confianza (0.0 - 1.0)
  bbox: {                 // Bounding box
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
```

**Ejemplo:**
```javascript
const detections = await TFLiteModule.runInference('file:///image.jpg');
console.log('Detecciones:', detections);
// [{ className: 'A', classId: 0, confidence: 0.92, bbox: {...} }]
```

### `TFLiteModule.unloadModel(): Promise<void>`

Descarga el modelo de la memoria.

**Ejemplo:**
```javascript
await TFLiteModule.unloadModel();
console.log('Modelo descargado');
```

## 📋 Configuración Requerida

### 1. app.json

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "minSdkVersion": 21,
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "buildToolsVersion": "34.0.0"
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

### 2. Dependencias Nativas

**Android (build.gradle):**
```gradle
dependencies {
    implementation 'org.tensorflow:tensorflow-lite:2.14.0'
    implementation 'org.tensorflow:tensorflow-lite-support:0.4.4'
    implementation 'org.tensorflow:tensorflow-lite-gpu:2.14.0'
}
```

**iOS (Podfile):**
```ruby
pod 'TensorFlowLiteSwift', '~> 2.14.0'
```

## 🚀 Uso en DetectionService

```javascript
import TFLiteModule from './modules/TFLiteModule';

class DetectionService {
  async loadModel() {
    try {
      const modelUri = 'file:///path/to/best_float16.tflite';
      const loaded = await TFLiteModule.loadModel(modelUri);
      
      if (loaded) {
        this.isModelLoaded = true;
        console.log('✅ Modelo TFLite cargado');
      }
    } catch (error) {
      console.error('❌ Error:', error);
    }
  }
  
  async processImageWithModel(imageUri) {
    try {
      const detections = await TFLiteModule.runInference(imageUri);
      
      if (detections && detections.length > 0) {
        // Obtener la detección con mayor confianza
        const best = detections.reduce((prev, current) => 
          current.confidence > prev.confidence ? current : prev
        );
        
        return {
          letter: best.className,
          confidence: Math.round(best.confidence * 100),
          bbox: best.bbox
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error en inferencia:', error);
      return null;
    }
  }
}
```

## 📊 Rendimiento Esperado

### Android
- **Tiempo de inferencia**: 50-150ms (depende del dispositivo)
- **Uso de memoria**: ~100-200MB
- **GPU**: Soportado con TFLite GPU Delegate

### iOS
- **Tiempo de inferencia**: 30-100ms (Metal optimizado)
- **Uso de memoria**: ~80-150MB
- **Neural Engine**: Soportado en A12+

## 🔨 Compilación

### Desarrollo

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

### Producción

```bash
# Con EAS Build
eas build --platform android
eas build --platform ios
```

## ⚠️ Limitaciones

1. **No funciona con Expo Go** - Requiere Expo Dev Client
2. **Requiere compilación nativa** - No se puede actualizar OTA
3. **Tamaño de la app aumenta** - ~10-20MB por TFLite
4. **Soporte de operadores** - Asegúrate que YOLO use operadores soportados

## 🐛 Troubleshooting

### Error: "TFLiteModule is not available"

**Solución:** Recompilar la app con:
```bash
npx expo run:android --no-build-cache
```

### Error: "Model format not supported"

**Solución:** Verifica que el modelo sea TFLite v2 y no tenga operadores custom.

### Bajo rendimiento

**Solución:** Habilita GPU delegate:
```javascript
await TFLiteModule.loadModel(modelUri, { useGPU: true });
```

## 📚 Referencias

- [TensorFlow Lite Android](https://www.tensorflow.org/lite/guide/android)
- [TensorFlow Lite iOS](https://www.tensorflow.org/lite/guide/ios)
- [Expo Native Modules](https://docs.expo.dev/modules/overview/)
- [YOLO TFLite Export](https://docs.ultralytics.com/modes/export/)

---

**Nota:** Este es un módulo nativo que requiere implementación en Java/Kotlin (Android) y Swift/Objective-C (iOS). El código nativo se encuentra en las carpetas `android/` e `ios/` del módulo Expo.
