# 🎯 MonolithicDetectionScreen.js - Guía Completa

**Versión:** 1.0
**Estado:** ✅ Completo y funcional
**Propósito:** Debugging y comprensión del pipeline end-to-end
**Fecha:** 2025-11-13

---

## 📖 Índice

1. [¿Por qué Monolítica?](#por-qué-monolítica)
2. [Estructura General](#estructura-general)
3. [Flujo End-to-End](#flujo-end-to-end)
4. [Componentes Clave](#componentes-clave)
5. [Cómo Usar](#cómo-usar)
6. [Debugging](#debugging)
7. [Migración a Producción](#migración-a-producción)

---

## 🤔 ¿Por qué Monolítica?

### Ventajas ✅

- **TODO EN UN ARCHIVO:** No necesitas saltar entre 5 archivos para entender el flujo
- **SIN ABSTRACCIONES:** Ves exactamente qué está pasando en cada paso
- **DEBUGGING VISUAL:** Logs integrados muestran cada etapa del pipeline
- **EDUCATIVO:** Perfecto para entender cómo funciona el sistema
- **TESTING RÁPIDO:** Modifica un parámetro y ves el resultado inmediatamente

### Desventajas ❌

- **DIFÍCIL DE MANTENER:** El código está repetido
- **ACOPLAMIENTO FUERTE:** Cambios en una parte afectan todo
- **NO ESCALABLE:** Imposible de reutilizar en otros componentes
- **PERFORMANCE:** Sin optimizaciones de hooks

---

## 🏗️ Estructura General

```javascript
const MonolithicDetectionScreen = () => {
  // 1️⃣ STATE (líneas 77-110)
  //    - Modelo, MediaPipe, Cámara, Buffer, UI, Referencias

  // 2️⃣ UTILIDADES (líneas 115-175)
  //    - log(), normalizeKeypoints(), combineHandKeypoints()
  //    - addFrameToBuffer()

  // 3️⃣ INICIALIZACIÓN (líneas 179-280)
  //    - loadLabelsFromAsset()
  //    - loadTensorFlowModel()
  //    - initializeMediaPipe()
  //    - useEffect para carga inicial

  // 4️⃣ DETECCIÓN (líneas 284-450)
  //    - detectHandsInFrame()
  //    - predictWithModel()
  //    - startDetectionLoop()
  //    - handleStartDetection()
  //    - handleStopDetection()

  // 5️⃣ RENDER (líneas 454-600)
  //    - UI Principal

  return (...)
}
```

---

## 🔄 Flujo End-to-End

```
┌─────────────────────────────────────────────────────────────┐
│ 1. INICIALIZACIÓN (Al montar componente)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  loadTensorFlowModel()                                       │
│   ├─ Cargar etiquetas desde assets/model/labels.json       │
│   ├─ Cargar modelo desde assets/model/tfjs_model/model.json│
│   ├─ Validar arquitectura [1, 24, 126] → [1, 67]          │
│   └─ Warmup: una predicción dummy                          │
│                                                              │
│  initializeMediaPipe()                                      │
│   ├─ Importar @mediapipe/tasks-vision                      │
│   ├─ Crear HandLandmarker con configuración                │
│   └─ Listo para detectar 21 landmarks/mano                 │
│                                                              │
│  ✅ Estado: modelReady = true, mediaPipeReady = true       │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. INICIO DE DETECCIÓN (User clickea "Comenzar")          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  handleStartDetection()                                      │
│   ├─ Pedir permisos de cámara                              │
│   ├─ setIsDetecting(true)                                  │
│   ├─ Limpiar frameBuffer y detecciones anteriores          │
│   └─ Iniciar startDetectionLoop()                          │
│                                                              │
│  ✅ Estado: isDetecting = true, frameBuffer = []           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 3. LOOP DE DETECCIÓN (Cada ~33ms @ 30 FPS)               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  requestAnimationFrame(startDetectionLoop)                 │
│   │                                                          │
│   ├─ detectHandsInFrame(videoRef.current)                  │
│   │  ├─ handDetector.detectForVideo()                      │
│   │  ├─ Extraer 21 landmarks × 2 manos                     │
│   │  ├─ Retornar { leftHand, rightHand }                   │
│   │  └─ Tiempo límite: 33ms (30 FPS)                       │
│   │                                                          │
│   ├─ combineHandKeypoints(leftHand, rightHand)            │
│   │  ├─ Mano izq: índices 0-62 (21 × 3)                    │
│   │  ├─ Mano der: índices 63-125 (21 × 3)                  │
│   │  └─ Normalizar a rango [0, 1]                          │
│   │                                                          │
│   ├─ addFrameToBuffer(keypoints)                           │
│   │  ├─ Si buffer.length >= 24: remover más viejo          │
│   │  └─ Agregar nuevo frame                                │
│   │                                                          │
│   ├─ ¿Buffer.length === 24?                               │
│   │  │                                                      │
│   │  └─ SÍ: predictWithModel(frameBuffer)                  │
│   │     ├─ Convertir a tensor [1, 24, 126]                │
│   │     ├─ model.predict(inputTensor)                      │
│   │     ├─ Encontrar argmax de 67 clases                   │
│   │     ├─ Mapear índice a label                           │
│   │     ├─ Dispose tensores                                │
│   │     └─ Retornar { word, confidence, ... }              │
│   │                                                          │
│   └─ setDetectedWord() y setConfidence()                   │
│                                                              │
│  ✅ Estado: frameBuffer lleno, detección hecha             │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 4. VISUALIZACIÓN (Real-time)                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  <DetectionOverlay>                                         │
│   ├─ Mostrar detectedWord (tamaño 32px)                    │
│   ├─ Mostrar confidence (%)                                │
│   └─ Animar si confianza >= 70%                            │
│                                                              │
│  <StatusCard>                                               │
│   ├─ Barra de progreso del buffer (0-24)                   │
│   ├─ Estado de TensorFlow.js                               │
│   ├─ Estado de MediaPipe                                   │
│   └─ Estado de Detección                                   │
│                                                              │
│  ✅ Usuario ve resultado en tiempo real                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 5. PARADA DE DETECCIÓN (User clickea "Detener")          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  handleStopDetection()                                      │
│   ├─ setIsDetecting(false)                                 │
│   ├─ cancelAnimationFrame(animationFrameId)                │
│   └─ Limpiar recursos                                      │
│                                                              │
│  ✅ Estado: isDetecting = false, recursos liberados        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Componentes Clave

### 1️⃣ Estado (Lines 77-110)

```javascript
// Modelo y MediaPipe
const [model, setModel] = useState(null);              // TensorFlow model
const [modelReady, setModelReady] = useState(false);   // ¿Está listo?
const [labels, setLabels] = useState([]);             // 67 etiquetas
const [handDetector, setHandDetector] = useState(null); // MediaPipe detector

// Cámara
const [cameraPermission, setCameraPermission] = useState(null);
const [isDetecting, setIsDetecting] = useState(false);

// Buffer circular
const [frameBuffer, setFrameBuffer] = useState([]);    // Max 24 frames

// Detección
const [detectedWord, setDetectedWord] = useState(null);
const [confidence, setConfidence] = useState(0);
const [isProcessing, setIsProcessing] = useState(false);

// UI y debugging
const [logs, setLogs] = useState([]);                 // Sistema de logs integrado
```

### 2️⃣ Normalización de Keypoints (Lines 135-145)

```javascript
const normalizeKeypoints = (keypoints) => {
  if (!keypoints) return null;

  // Clamp cada valor al rango [0, 1]
  return keypoints.map((val) =>
    Math.max(0, Math.min(1, val))
  );
};
```

**Por qué:** Los keypoints de MediaPipe vienen en coordenadas normalizadas, pero pueden tener pequeños errores numéricos. El clamping asegura que estén dentro del rango esperado.

### 3️⃣ Combinación de Keypoints (Lines 148-178)

```javascript
const combineHandKeypoints = (leftHand, rightHand) => {
  const combined = new Array(126).fill(0);

  // Mano izquierda: índices 0-62 (21 landmarks × 3 axes)
  if (leftHand && leftHand.landmarks) {
    let idx = 0;
    leftHand.landmarks.forEach((landmark) => {
      combined[idx++] = landmark.x || 0;
      combined[idx++] = landmark.y || 0;
      combined[idx++] = landmark.z || 0;
    });
  }

  // Mano derecha: índices 63-125
  if (rightHand && rightHand.landmarks) {
    let idx = 63;
    rightHand.landmarks.forEach((landmark) => {
      combined[idx++] = landmark.x || 0;
      combined[idx++] = landmark.y || 0;
      combined[idx++] = landmark.z || 0;
    });
  }

  return normalizeKeypoints(combined);
};
```

**Estructura:**
```
Array de 126 elementos:
[0-62]   : Mano izquierda (21 landmarks × 3 axes)
[63-125] : Mano derecha (21 landmarks × 3 axes)
```

### 4️⃣ Carga del Modelo (Lines 219-260)

```javascript
const loadTensorFlowModel = async () => {
  // 1. Cargar etiquetas desde JSON
  const loadedLabels = await loadLabelsFromAsset();

  // 2. Cargar modelo LSTM
  const modelAsset = Asset.fromModule(
    require('../assets/model/tfjs_model/model.json')
  );
  const loadedModel = await tf.loadLayersModel(modelAsset.uri);

  // 3. Warmup: predicción dummy
  const dummyInput = tf.randomNormal([1, 24, 126]);
  const warmupPred = loadedModel.predict(dummyInput);
  dummyInput.dispose();
  warmupPred.dispose();

  // 4. Marcar como listo
  setModel(loadedModel);
  setModelReady(true);
};
```

**Por qué warmup:**
- Primera predicción es lenta (compilación de WebGL)
- Warmup pre-compila para que primera detección sea rápida

### 5️⃣ Detección de Manos (Lines 288-325)

```javascript
const detectHandsInFrame = async (video) => {
  if (!handDetector || !video) return null;

  try {
    // Control de FPS: máximo 30 FPS (33ms)
    const now = Date.now();
    if (now - lastFrameTime.current < 33) {
      return null;
    }
    lastFrameTime.current = now;

    // Detectar manos
    const detectionResult = await
      handDetector.detectForVideo(video, now);

    // Organizar por izquierda/derecha
    let leftHand = null;
    let rightHand = null;

    detectionResult.handedness.forEach((handedness, idx) => {
      if (handedness[0].categoryName === 'Left') {
        leftHand = { landmarks: detectionResult.landmarks[idx] };
      } else {
        rightHand = { landmarks: detectionResult.landmarks[idx] };
      }
    });

    return { leftHand, rightHand };
  } catch (error) {
    log(`⚠️ Error: ${error.message}`);
    return null;
  }
};
```

**FPS Control:** Limita a 30 FPS verificando si han pasado 33ms desde el último frame.

### 6️⃣ Predicción con el Modelo (Lines 328-380)

```javascript
const predictWithModel = async (buffer) => {
  if (!model || buffer.length < 24) return null;

  try {
    setIsProcessing(true);

    // 1. Convertir buffer a tensor [1, 24, 126]
    const inputTensor = tf.tensor3d([buffer], [1, 24, 126]);

    // 2. Predicción
    const outputTensor = model.predict(inputTensor);
    const predictions = await outputTensor.data();
    const predictionsArray = Array.from(predictions);

    // 3. Encontrar máxima confianza
    const maxConfidenceIdx = predictionsArray.indexOf(
      Math.max(...predictionsArray)
    );
    const maxConfidence = predictionsArray[maxConfidenceIdx];

    // 4. Mapear a etiqueta
    const predictedLabel = labels[maxConfidenceIdx];

    // 5. Cleanup
    inputTensor.dispose();
    outputTensor.dispose();

    return {
      word: predictedLabel,
      confidence: maxConfidence,
      index: maxConfidenceIdx,
    };
  } catch (error) {
    log(`❌ Error: ${error.message}`);
    return null;
  }
};
```

---

## 🎮 Cómo Usar

### Paso 1: Importar en App.js

```javascript
import MonolithicDetectionScreen from './screens/MonolithicDetectionScreen';

// En tu navegación:
<Stack.Screen
  name="MonolithicDetection"
  component={MonolithicDetectionScreen}
/>
```

### Paso 2: Navegar a la pantalla

```javascript
<TouchableOpacity onPress={() => navigation.navigate('MonolithicDetection')}>
  <Text>Abrir Monolítica</Text>
</TouchableOpacity>
```

### Paso 3: Interactuar

1. **Espera carga:** Modelo + MediaPipe
2. **Click "Comenzar":** Inicia detección
3. **Muestra tu mano:** MediaPipe detecta landmarks
4. **Espera 24 frames:** Buffer se llena
5. **Resultado:** Modelo predice y muestra

---

## 🐛 Debugging

### Sistema de Logs Integrado

La pantalla tiene un sistema de logging completo SIN dependencias:

```javascript
const log = (message, data = null) => {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;

  console.log(logEntry);
  setLogs((prevLogs) => [logEntry, ...prevLogs.slice(0, 49)]);
};
```

**Cómo ver logs:**
1. Click en el icono 🐛 en el header
2. Se abre panel de logs
3. Muestra últimos 50 logs en tiempo real

### Puntos de Log Clave

```javascript
log('📝 Cargando etiquetas...');
log(`✅ ${loadedLabels.length} etiquetas cargadas`);
log('📦 Cargando modelo TensorFlow.js...');
log('✅ Modelo cargado exitosamente');
log('▶️  Detección iniciada');
log(`🖐️ Mano detectada`);
log(`🎯 Detección: ${predictedLabel} (${confidence}%)`);
log('⏹️  Detección detenida');
```

### Debugging Específico

**¿Por qué no detecta manos?**
- Revisa logs: busca "Mano detectada"
- Mejora iluminación
- Coloca mano en centro
- Verifica MediaPipe está listo

**¿Por qué predicción es lenta?**
- Primera predicción es lenta (warmup)
- Siguiente son rápidas
- Si sigue lento: reduce resolución video

**¿Buffer no se llena?**
- Necesita 24 frames válidos
- A 30 FPS tarda ~800ms
- Revisa logs para ver count

---

## 🚀 Migración a Producción

### Paso 1: Extraer Hooks

Crea `hooks/useMonolithicDetection.js`:

```javascript
export const useMonolithicDetection = ({ videoRef, onDetection }) => {
  // Extraer toda la lógica de inicialización y detección
  // Retornar { startDetection, stopDetection, logs, ... }
};
```

### Paso 2: Crear Servicio

Crea `utils/services/monolithicDetectionService.js`:

```javascript
export class MonolithicDetectionService {
  // Encapsular loadModel(), initMediaPipe(), predictWithModel()
  // Usar listeners en lugar de setState
}
```

### Paso 3: Refactorizar Componente

Simplificar `screens/WordDetectionScreen.mediapipe.js`:

```javascript
const WordDetectionScreen = ({ navigation }) => {
  const { startDetection, stopDetection } = useMonolithicDetection({...});

  return (
    <View>
      <Camera ... />
      {detection && <DetectionOverlay ... />}
      <Button onPress={startDetection} />
    </View>
  );
};
```

### Paso 4: Separar UI y Lógica

Usar patrón Container/Presentational:

```
MonolithicDetectionContainer.js (lógica)
  └─ MonolithicDetectionPresenter.js (UI)
```

### Paso 5: Tests

```javascript
test('Model loads correctly', async () => {
  const model = await monolithicDetectionService.loadModel();
  expect(model).toBeDefined();
});

test('Detects 24 frames', async () => {
  const buffer = await monolithicDetectionService.captureFrames(24);
  expect(buffer.length).toBe(24);
});
```

---

## 📊 Comparación: Monolítica vs Producción

| Aspecto | Monolítica | Producción |
|---------|-----------|-----------|
| **Archivo** | 1 | 5+ |
| **Estado** | Todo en componente | Distribuido |
| **Hooks** | Sin hooks abstraídos | useMediaPipeDetection + useModel |
| **Debugging** | Fácil (logs integrados) | Difícil (distribuido) |
| **Testing** | Difícil (acoplado) | Fácil (modular) |
| **Rendimiento** | Bueno | Mejor (optimizado) |
| **Mantenibilidad** | ⭐ | ⭐⭐⭐⭐⭐ |

---

## 🎯 Resumen

`MonolithicDetectionScreen.js` es perfecta para:

✅ **Entender** cómo funciona todo el pipeline
✅ **Debuggear** cada paso de la detección
✅ **Desarrollar** rápidamente nuevas características
✅ **Demostrar** el flujo completo a otros desarrolladores

❌ **NO usar en producción** - demasiado acoplada
❌ **NO reutilizar** - código repetido
❌ **NO escalar** - difícil de mantener

---

## 📚 Referencias

- [MONOLITHIC_MIGRATION.md](./MONOLITHIC_MIGRATION.md) - Guía paso a paso
- [MEDIAPIPE_INTEGRATION.md](./MEDIAPIPE_INTEGRATION.md) - MediaPipe específico
- [PIPELINE_VALIDATION.js](./PIPELINE_VALIDATION.js) - Validación del pipeline

---

**Status:** ✅ Listo para usar
**Última actualización:** 2025-11-13
**Autor:** SignBridge Dev Team
