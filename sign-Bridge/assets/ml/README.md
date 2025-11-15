# SignBridge LSTM Model - TensorFlow.js

## 📊 Información del Modelo

- **Tipo**: Bidirectional LSTM Classifier
- **Clases**: 67 (Alfabeto + Números + Gestos Chilenos)
- **Accuracy**: 92.8% (entrenamiento), 92.0% (validación)
- **Input Shape**: `(batch, 24, 126)`
- **Output Shape**: `(batch, 67)`
- **Parámetros**: 1,032,771
- **Tamaño**: ~12 MB

## 🎯 Uso en React Native / Expo

### Instalación de Dependencias

```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native @tensorflow/tfjs-backend-webgl
```

### Carga del Modelo

```javascript
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

// Esperar a que TensorFlow esté listo
await tf.ready();

// Cargar modelo
const modelJson = require('./assets/ml/model.json');
const modelWeights = require('./assets/ml/group1-shard1of1.bin');
const model = await tf.loadLayersModel(
  bundleResourceIO(modelJson, modelWeights)
);

console.log('✅ Modelo cargado');
```

### Predicción

```javascript
// Preparar input: buffer de 24 frames con 126 features cada uno
const keypointsBuffer = []; // Array de 24 arrays de 126 números

// Convertir a tensor
const inputTensor = tf.tensor3d([keypointsBuffer], [1, 24, 126]);

// Predecir
const prediction = model.predict(inputTensor);
const probabilities = await prediction.data();

// Obtener clase con mayor probabilidad
const predictedClass = probabilities.indexOf(Math.max(...probabilities));
const confidence = probabilities[predictedClass];

// Limpiar memoria
inputTensor.dispose();
prediction.dispose();

console.log(`Predicción: Clase ${predictedClass}, Confianza: ${confidence}`);
```

## 📥 Especificaciones de Input

El modelo espera un **buffer de 24 frames**, donde cada frame contiene **126 features**:

### Estructura de Features (126 total)

#### Mano Izquierda (índices 0-62)
- 21 landmarks × 3 coordenadas (x, y, z) = 63 features

#### Mano Derecha (índices 63-125)
- 21 landmarks × 3 coordenadas (x, y, z) = 63 features

### Orden de Landmarks (MediaPipe Hand)

```
0:  WRIST
1:  THUMB_CMC
2:  THUMB_MCP
3:  THUMB_IP
4:  THUMB_TIP
5:  INDEX_FINGER_MCP
6:  INDEX_FINGER_PIP
7:  INDEX_FINGER_DIP
8:  INDEX_FINGER_TIP
9:  MIDDLE_FINGER_MCP
10: MIDDLE_FINGER_PIP
11: MIDDLE_FINGER_DIP
12: MIDDLE_FINGER_TIP
13: RING_FINGER_MCP
14: RING_FINGER_PIP
15: RING_FINGER_DIP
16: RING_FINGER_TIP
17: PINKY_MCP
18: PINKY_PIP
19: PINKY_DIP
20: PINKY_TIP
```

### Ejemplo de Construcción de Features

```javascript
function extractFeatures(leftHand, rightHand) {
  const features = new Array(126).fill(0);
  
  // Mano izquierda (0-62)
  if (leftHand && leftHand.landmarks) {
    let idx = 0;
    leftHand.landmarks.forEach((landmark) => {
      features[idx++] = landmark.x;
      features[idx++] = landmark.y;
      features[idx++] = landmark.z;
    });
  }
  
  // Mano derecha (63-125)
  if (rightHand && rightHand.landmarks) {
    let idx = 63;
    rightHand.landmarks.forEach((landmark) => {
      features[idx++] = landmark.x;
      features[idx++] = landmark.y;
      features[idx++] = landmark.z;
    });
  }
  
  return features;
}
```

## 🔧 Preprocesamiento

### Normalización
- **Rango**: [0, 1]
- **Método**: MinMax scaling
- **Valores faltantes**: 0.0

### Masking
El modelo incluye una capa `Masking` que automáticamente ignora frames con todos los valores en 0. Esto es útil cuando:
- No se detectan manos
- El buffer aún no tiene 24 frames completos

## 🎯 Clases Reconocidas (67 total)

### Números (0-9)
`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`

### Alfabeto (A-Z)
`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`, `V`, `W`, `X`, `Y`, `Z`

### Gestos Comunes
- Saludos: `Hola`, `Adios`, `Nos_vemos`
- Cortesía: `Gracias`, `Por_favor`, `Permiso`, `disculpa`, `Cuidate`
- Preguntas: `Como`, `Como_estas`, `Como_te_llamas`, `Donde`, `Cuando`, `Cuantos`, `Que`, `Quien`, `Por_que`
- Direcciones: `A_la_derecha`, `A_la_izquierda`, `Al_final_del_pasillo`, `En_el_edificio`, `En_el_segundo_piso`, `En_la_entrada`, `Por_el_ascensor`, `Por_las_escaleras`
- Expresiones: `Si`, `No_lo_recuerdo`, `No_lo_se`, `Yo_estoy`, `Mi_casa`, `Mi_nombre`, `Te_llamas`, `Un_momento`, `Tal_vez`, `Repite_por_favor`, `Que_quieres`

## ⚡ Optimización de Performance

### 1. Separar Thread de Inferencia

```javascript
let isProcessing = false;

function processFrame() {
  if (isProcessing) return;
  
  requestAnimationFrame(async () => {
    isProcessing = true;
    
    // Tu lógica de inferencia aquí
    await predictSign();
    
    isProcessing = false;
  });
}
```

### 2. Smooth Predictions (Reducir Ruido)

```javascript
class PredictionSmoother {
  constructor(windowSize = 8) {
    this.window = [];
    this.windowSize = windowSize;
  }
  
  addPrediction(classId, confidence) {
    this.window.push({ classId, confidence });
    if (this.window.length > this.windowSize) {
      this.window.shift();
    }
  }
  
  getSmoothedPrediction() {
    const counts = {};
    this.window.forEach(({ classId, confidence }) => {
      counts[classId] = (counts[classId] || 0) + confidence;
    });
    
    const best = Object.entries(counts).reduce((a, b) => 
      a[1] > b[1] ? a : b
    );
    
    return {
      classId: parseInt(best[0]),
      confidence: best[1] / this.window.length
    };
  }
}
```

### 3. Gestión de Memoria

```javascript
// Siempre limpiar tensores después de usar
const tensor = tf.tensor3d(data);
const result = model.predict(tensor);
const output = await result.data();

// ⚠️ IMPORTANTE: Liberar memoria
tensor.dispose();
result.dispose();

// O usar tf.tidy para limpieza automática
const output = await tf.tidy(() => {
  const tensor = tf.tensor3d(data);
  return model.predict(tensor);
});
```

### 4. Reducir FPS

```javascript
const TARGET_FPS = 15; // Reducir de 30 a 15 fps
const frameInterval = 1000 / TARGET_FPS;
let lastFrameTime = 0;

function onCameraFrame(timestamp) {
  if (timestamp - lastFrameTime < frameInterval) {
    return; // Saltar frame
  }
  
  lastFrameTime = timestamp;
  processFrame();
}
```

## 🐛 Troubleshooting

### Pantalla Negra en Cámara

**Problema**: La cámara se ve negra cuando el modelo está activo.

**Solución**:
```javascript
// ❌ MAL: Bloquea el thread principal
const prediction = model.predict(input);

// ✅ BIEN: Usar requestAnimationFrame
requestAnimationFrame(async () => {
  const prediction = await model.predict(input);
  // Procesar resultado
});
```

### Predicciones Inconsistentes

**Problema**: El modelo cambia constantemente entre clases.

**Solución**: Implementar ventana de suavizado (smooth_window = 8)

### Performance Lenta

**Problema**: La app se siente lenta o se congela.

**Soluciones**:
1. Reducir FPS de captura a 15-20
2. Verificar que WebGL esté habilitado: `tf.getBackend()` debería ser `'webgl'`
3. Limpiar memoria con `tf.dispose()` después de cada inferencia
4. Procesar en background con `requestAnimationFrame`

### Errores de Memory Leak

**Problema**: La app consume cada vez más memoria.

**Solución**:
```javascript
// Monitorear tensores en memoria
console.log('Tensores en memoria:', tf.memory().numTensors);

// Limpiar periódicamente
setInterval(() => {
  tf.engine().startScope();
  // Tu código aquí
  tf.engine().endScope();
}, 5000);
```

## 📱 Compatibilidad

- ✅ **Web** (Chrome, Firefox, Safari)
- ✅ **React Native** (iOS, Android)
- ✅ **Expo SDK** >= 51.0.0
- ✅ **Node.js** (testing)

### Backends Soportados

1. **WebGL** (Recomendado para móvil)
2. **WASM** (Fallback)
3. **CPU** (Última opción)

## 📂 Archivos

- `model.json` - Arquitectura del modelo
- `group1-shard1of1.bin` - Pesos del modelo (~12 MB)
- `label_encoder.json` - Mapeo de clases a etiquetas
- `config.json` - Configuración completa del modelo
- `README.md` - Esta documentación

## 🔄 Versiones

### v2.0.0 (2025-11-13)
- ✅ Conversión optimizada para React Native/Web
- ✅ Metadata completa y documentación
- ✅ Compatible con TensorFlow.js 4.x
- ✅ Sin dependencias problemáticas
- ✅ 67 clases (alfabeto + números + gestos)

## 📞 Soporte

Para problemas o preguntas:
1. Revisa la sección Troubleshooting
2. Consulta `config.json` para especificaciones técnicas
3. Verifica versiones de dependencias

---

**SignBridge Team** - Reconocimiento de Lengua de Señas Chilena 🇨🇱
