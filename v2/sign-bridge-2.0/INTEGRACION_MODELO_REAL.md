# 🚀 Guía para Integrar el Modelo TensorFlow Lite Real

## 📋 Estado Actual

**⚠️ IMPORTANTE**: Actualmente la aplicación está en **MODO SIMULACIÓN**. Las detecciones que ves son generadas algorítmicamente para demostrar la interfaz de usuario, **NO están procesando tu modelo `model_fp16.tflite`**.

## 🔧 Pasos para Integrar tu Modelo Real

### 1. 📦 Instalar Dependencias de TensorFlow Lite

Necesitas una librería que pueda ejecutar modelos TensorFlow Lite en React Native/Expo:

```bash
# Opción 1: TensorFlow Lite para React Native (recomendado)
npm install react-native-tflite

# Opción 2: TensorFlow.js (alternativo)
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native @tensorflow/tfjs-platform-react-native
```

### 2. 🔄 Configurar el Modelo en el Hook

Edita el archivo `hooks/useSignLanguageModel.ts`:

```typescript
// En la función loadTensorFlowModel(), reemplaza el contenido con:

import { TensorflowLitePlugin } from 'react-native-tflite';

const loadTensorFlowModel = async () => {
  try {
    // 1. Cargar el modelo
    const modelPath = 'assets/Modelo/v1.0/model_fp16.tflite';
    await TensorflowLitePlugin.loadModel({
      model: modelPath,
      numThreads: 2, // Ajustar según dispositivo
    });

    // 2. Cargar las etiquetas
    const labelsPath = 'assets/Modelo/v1.0/labels.txt';
    const labelsContent = await loadLabelsFromAssets(labelsPath);
    setLabels(labelsContent);

    // 3. Activar modo real
    setUseRealModel(true);
    console.log('✅ Modelo TensorFlow Lite cargado exitosamente');
    
  } catch (error) {
    console.error('❌ Error cargando modelo TensorFlow Lite:', error);
    setUseRealModel(false);
  }
};
```

### 3. 🖼️ Implementar Procesamiento de Imágenes

En la función `processImageWithModel()`:

```typescript
const processImageWithModel = async (imageUri: string): Promise<SignDetectionResult> => {
  try {
    // 1. Preprocesar la imagen
    const processedImage = await preprocessImage(imageUri);
    
    // 2. Ejecutar inferencia
    const results = await TensorflowLitePlugin.runInference({
      input: processedImage
    });
    
    // 3. Procesar resultados
    const predictions = results.output;
    const maxIndex = predictions.indexOf(Math.max(...predictions));
    const prediction = labels[maxIndex];
    const confidence = predictions[maxIndex];
    
    return { prediction, confidence };
    
  } catch (error) {
    console.error('❌ Error en inferencia:', error);
    throw error;
  }
};

const preprocessImage = async (imageUri: string) => {
  // Redimensionar imagen según las especificaciones de tu modelo
  // Normalizar valores de píxeles (0-255 → 0-1 o -1-1)
  // Convertir a tensor del formato correcto
  
  // Ejemplo con expo-image-manipulator:
  const manipulatedImage = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 224, height: 224 } }], // Ajustar al tamaño de tu modelo
    { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
  );
  
  // Convertir a tensor según formato esperado por tu modelo
  return processedTensor;
};
```

### 4. 📱 Capturar Frames de la Cámara

Para detección en tiempo real, necesitas capturar frames de la cámara:

```typescript
// En SignDetectionCamera.tsx, usar onCameraReady o similar
const captureCurrentFrame = async () => {
  if (cameraRef.current) {
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
      skipProcessing: true, // Para mayor velocidad
    });
    return photo.uri;
  }
  throw new Error('Cámara no disponible');
};
```

### 5. ⚙️ Especificaciones de tu Modelo

Basándote en tu modelo `model_fp16.tflite`, necesitas configurar:

```typescript
// Configuraciones específicas para tu modelo
const MODEL_CONFIG = {
  inputShape: [1, 224, 224, 3], // Ajustar según tu modelo
  outputShape: [1, 3], // 3 clases: A, B, C
  inputType: 'float32', // o 'uint8' según tu modelo
  normalizeInput: true, // Si requiere normalización 0-1
  labels: ['A', 'B', 'C']
};
```

## 🔍 Identificar Especificaciones del Modelo

Para conocer las especificaciones exactas de tu modelo:

### Opción 1: Usar Netron (Recomendado)
1. Instala Netron: https://netron.app/
2. Abre tu archivo `model_fp16.tflite`
3. Observa:
   - **Input tensor**: tamaño, formato, tipo de datos
   - **Output tensor**: clases, formato de salida
   - **Arquitectura**: tipo de red neuronal

### Opción 2: TensorFlow Lite Tools
```bash
# Instalar herramientas TF Lite
pip install tensorflow

# Analizar modelo
python -c "
import tensorflow as tf
interpreter = tf.lite.Interpreter(model_path='assets/Modelo/v1.0/model_fp16.tflite')
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

print('Input shape:', input_details[0]['shape'])
print('Input type:', input_details[0]['dtype'])
print('Output shape:', output_details[0]['shape'])
print('Output type:', output_details[0]['dtype'])
"
```

## 🎯 Checklist de Integración

- [ ] ✅ Instalar librería TensorFlow Lite
- [ ] 🔧 Configurar carga del modelo en `loadTensorFlowModel()`
- [ ] 🖼️ Implementar `processImageWithModel()` 
- [ ] 📏 Configurar preprocesamiento según especificaciones del modelo
- [ ] 🎥 Implementar captura de frames en tiempo real
- [ ] 🧪 Probar con imágenes estáticas primero
- [ ] ⚡ Optimizar rendimiento (threads, frecuencia)
- [ ] 🐛 Manejar errores y fallbacks
- [ ] 📊 Ajustar umbrales de confianza

## 🚧 Problemas Comunes

### Error: "Model format not supported"
- Verificar que el archivo `.tflite` no esté corrupto
- Asegurar compatibilidad de la versión de TensorFlow Lite

### Predicciones incorrectas
- Verificar preprocesamiento de imagen (normalización, redimensionamiento)
- Comprobar que las etiquetas estén en el orden correcto
- Ajustar iluminación y contraste de la cámara

### Rendimiento lento
- Reducir resolución de entrada
- Usar menos threads o ajustar configuración
- Implementar cache de modelos

## 📞 Soporte

Si necesitas ayuda con la integración:

1. **Verifica los logs**: La consola muestra el estado actual (simulación vs real)
2. **Prueba paso a paso**: Comienza con imágenes estáticas antes de tiempo real
3. **Documenta errores**: Guarda logs de errores para debugging

## 🎉 ¿Todo Listo?

Una vez integrado correctamente, deberías ver:
- 🤖 **"Modelo IA Real"** en lugar de "Modo Simulación"
- ⚡ Detecciones basadas en las imágenes reales de la cámara
- 🎯 Mayor precisión en las predicciones

¡Tu aplicación estará lista para detectar señas reales! 🚀