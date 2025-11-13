# 🔄 Guía de Migración - Monolítica → Producción

**Objetivo:** Convertir MonolithicDetectionScreen.js en componentes modulares y reutilizables
**Duración estimada:** 2-3 horas
**Complejidad:** Media

---

## 📋 Resumen de Cambios

```
MonolithicDetectionScreen.js (1 archivo, 600+ líneas)
              ↓ REFACTORIZACIÓN
Fase 1: Extraer Hooks
  ├─ hooks/useMonolithicModel.js
  ├─ hooks/useMonolithicMediaPipe.js
  └─ hooks/useMonolithicDetection.js

Fase 2: Crear Servicios
  ├─ utils/services/monolithicModelService.js
  ├─ utils/services/monolithicMediaPipeService.js
  └─ utils/services/monolithicDetectionService.js

Fase 3: Simplificar Componente
  └─ screens/MonolithicDetectionScreen.js (refactorizado)

Fase 4: Crear Variantes
  ├─ screens/WordDetectionScreen.mediapipe.js (actualizado)
  ├─ screens/AlphabetDetectionScreen.js (actualizado)
  └─ screens/NumberDetectionScreen.js (actualizado)

Resultado: Componentes modulares + reutilización
```

---

## 🎯 Fase 1: Extraer Hooks

### 1.1 Crear `hooks/useMonolithicModel.js`

```javascript
/**
 * Hook para cargar y gestionar el modelo TensorFlow.js
 */
import { useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { Asset } from 'expo-asset';

export const useMonolithicModel = () => {
  const [model, setModel] = useState(null);
  const [labels, setLabels] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  const loadLabels = useCallback(async () => {
    try {
      const labelsAsset = Asset.fromModule(
        require('../assets/model/labels.json')
      );
      await labelsAsset.downloadAsync();

      const response = await fetch(labelsAsset.uri);
      const data = await response.json();
      const loadedLabels = data.classes || data;

      setLabels(loadedLabels);
      return loadedLabels;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const loadModel = useCallback(async () => {
    try {
      await tf.ready();

      const loadedLabels = await loadLabels();

      const modelAsset = Asset.fromModule(
        require('../assets/model/tfjs_model/model.json')
      );
      await modelAsset.downloadAsync();

      const loadedModel = await tf.loadLayersModel(modelAsset.uri);

      // Warmup
      const dummyInput = tf.randomNormal([1, 24, 126]);
      const warmupPred = loadedModel.predict(dummyInput);
      dummyInput.dispose();
      warmupPred.dispose();

      setModel(loadedModel);
      setIsReady(true);

      return { model: loadedModel, labels: loadedLabels };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [loadLabels]);

  const predict = useCallback(
    async (frameBuffer) => {
      if (!model || frameBuffer.length < 24) {
        return null;
      }

      try {
        const inputTensor = tf.tensor3d([frameBuffer], [1, 24, 126]);
        const outputTensor = model.predict(inputTensor);
        const predictions = await outputTensor.data();
        const predictionsArray = Array.from(predictions);

        const maxIdx = predictionsArray.indexOf(Math.max(...predictionsArray));
        const maxConfidence = predictionsArray[maxIdx];

        inputTensor.dispose();
        outputTensor.dispose();

        return {
          word: labels[maxIdx],
          confidence: maxConfidence,
          index: maxIdx,
          allPredictions: predictionsArray,
        };
      } catch (err) {
        setError(err.message);
        return null;
      }
    },
    [model, labels]
  );

  return {
    model,
    labels,
    isReady,
    error,
    loadModel,
    predict,
  };
};
```

### 1.2 Crear `hooks/useMonolithicMediaPipe.js`

```javascript
/**
 * Hook para MediaPipe Hand Detection
 */
import { useState, useCallback, useRef } from 'react';

export const useMonolithicMediaPipe = () => {
  const [handDetector, setHandDetector] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  const lastFrameTime = useRef(0);

  const initialize = useCallback(async () => {
    try {
      const vision = await import('@mediapipe/tasks-vision');

      if (!vision || !vision.HandLandmarker) {
        throw new Error('MediaPipe Vision no disponible');
      }

      const detector = await vision.HandLandmarker.createFromOptions(
        window,
        {
          baseOptions: {
            modelAssetPath:
              'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
        }
      );

      setHandDetector(detector);
      setIsReady(true);

      return detector;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const detectHands = useCallback(
    async (video) => {
      if (!handDetector || !video) return null;

      try {
        const now = Date.now();

        // Control FPS
        if (now - lastFrameTime.current < 33) {
          return null;
        }
        lastFrameTime.current = now;

        const detectionResult = await handDetector.detectForVideo(video, now);

        if (!detectionResult || !detectionResult.landmarks) {
          return null;
        }

        let leftHand = null;
        let rightHand = null;

        detectionResult.handedness?.forEach((handedness, idx) => {
          if (handedness[0].categoryName === 'Left') {
            leftHand = { landmarks: detectionResult.landmarks[idx] };
          } else {
            rightHand = { landmarks: detectionResult.landmarks[idx] };
          }
        });

        return { leftHand, rightHand };
      } catch (err) {
        setError(err.message);
        return null;
      }
    },
    [handDetector]
  );

  return {
    handDetector,
    isReady,
    error,
    initialize,
    detectHands,
  };
};
```

### 1.3 Crear `hooks/useMonolithicDetection.js`

```javascript
/**
 * Hook que orquesta todo: Model + MediaPipe + Buffer
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useMonolithicModel } from './useMonolithicModel';
import { useMonolithicMediaPipe } from './useMonolithicMediaPipe';

export const useMonolithicDetection = ({ videoRef, onDetection }) => {
  const [frameBuffer, setFrameBuffer] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);

  const modelHook = useMonolithicModel();
  const mediaPipeHook = useMonolithicMediaPipe();

  const animationFrameId = useRef(null);

  // Normalizar keypoints
  const normalizeKeypoints = useCallback((keypoints) => {
    if (!keypoints) return null;
    return keypoints.map((val) => Math.max(0, Math.min(1, val)));
  }, []);

  // Combinar manos
  const combineHandKeypoints = useCallback(
    (leftHand, rightHand) => {
      const combined = new Array(126).fill(0);

      if (leftHand && leftHand.landmarks) {
        let idx = 0;
        leftHand.landmarks.forEach((landmark) => {
          combined[idx++] = landmark.x || 0;
          combined[idx++] = landmark.y || 0;
          combined[idx++] = landmark.z || 0;
        });
      }

      if (rightHand && rightHand.landmarks) {
        let idx = 63;
        rightHand.landmarks.forEach((landmark) => {
          combined[idx++] = landmark.x || 0;
          combined[idx++] = landmark.y || 0;
          combined[idx++] = landmark.z || 0;
        });
      }

      return normalizeKeypoints(combined);
    },
    [normalizeKeypoints]
  );

  // Loop de detección
  const detectionLoop = useCallback(async () => {
    if (!isDetecting || !videoRef?.current) return;

    try {
      const hands = await mediaPipeHook.detectHands(videoRef.current);

      if (hands) {
        const keypoints = combineHandKeypoints(
          hands.leftHand,
          hands.rightHand
        );

        if (keypoints) {
          setFrameBuffer((prev) => {
            const newBuffer = [...prev];
            if (newBuffer.length >= 24) newBuffer.shift();
            newBuffer.push(keypoints);

            // Si tenemos 24 frames, hacer predicción
            if (newBuffer.length === 24) {
              (async () => {
                const prediction = await modelHook.predict(newBuffer);
                if (prediction && onDetection) {
                  onDetection(prediction);
                }
              })();
            }

            return newBuffer;
          });
        }
      }
    } catch (error) {
      console.error('Detection error:', error);
    }

    animationFrameId.current = requestAnimationFrame(detectionLoop);
  }, [isDetecting, videoRef, mediaPipeHook, combineHandKeypoints, modelHook, onDetection]);

  // Inicializar modelo y MediaPipe
  useEffect(() => {
    const init = async () => {
      await modelHook.loadModel();
      await mediaPipeHook.initialize();
    };
    init();
  }, [modelHook, mediaPipeHook]);

  // Iniciar/parar detection loop
  useEffect(() => {
    if (isDetecting && mediaPipeHook.isReady) {
      animationFrameId.current = requestAnimationFrame(detectionLoop);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isDetecting, mediaPipeHook.isReady, detectionLoop]);

  const startDetection = useCallback(() => {
    setFrameBuffer([]);
    setIsDetecting(true);
  }, []);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
  }, []);

  return {
    startDetection,
    stopDetection,
    isDetecting,
    frameBuffer,
    modelReady: modelHook.isReady,
    mediaPipeReady: mediaPipeHook.isReady,
    error: modelHook.error || mediaPipeHook.error,
  };
};
```

---

## 🎯 Fase 2: Crear Servicios

### 2.1 Consolidar en un Servicio

```javascript
// utils/services/monolithicDetectionService.js

import * as tf from '@tensorflow/tfjs';
import { Asset } from 'expo-asset';

export class MonolithicDetectionService {
  constructor() {
    this.model = null;
    this.labels = [];
    this.handDetector = null;
    this.callbacks = [];
  }

  async loadModel() {
    // Implementar lógica de loadTensorFlowModel()
  }

  async initMediaPipe() {
    // Implementar lógica de initializeMediaPipe()
  }

  async detectHands(video) {
    // Implementar lógica de detectHandsInFrame()
  }

  async predict(frameBuffer) {
    // Implementar lógica de predictWithModel()
  }

  onDetection(callback) {
    this.callbacks.push(callback);
  }

  notifyCallbacks(data) {
    this.callbacks.forEach((cb) => cb(data));
  }
}

export const monolithicDetectionService = new MonolithicDetectionService();
```

---

## 🎯 Fase 3: Simplificar Componente

Refactorizar `MonolithicDetectionScreen.js` para usar hooks:

```javascript
import { useMonolithicDetection } from '../hooks/useMonolithicDetection';

const MonolithicDetectionScreen = ({ navigation }) => {
  const videoRef = useRef(null);
  const [detectedWord, setDetectedWord] = useState(null);
  const [confidence, setConfidence] = useState(0);

  const { startDetection, stopDetection, frameBuffer } =
    useMonolithicDetection({
      videoRef,
      onDetection: ({ word, confidence }) => {
        setDetectedWord(word);
        setConfidence(confidence);
      },
    });

  // Render simplificado...
};
```

---

## 🎯 Fase 4: Tests

```javascript
// __tests__/monolithicDetection.test.js

describe('MonolithicDetection', () => {
  test('loadModel carga correctamente', async () => {
    const service = new MonolithicDetectionService();
    await service.loadModel();

    expect(service.model).toBeDefined();
    expect(service.labels.length).toBeGreaterThan(0);
  });

  test('detectHands retorna landmarks válidos', async () => {
    // Mock video
    const mockVideo = {
      videoWidth: 640,
      videoHeight: 480,
    };

    const hands = await service.detectHands(mockVideo);
    expect(hands).toHaveProperty('leftHand', 'rightHand');
  });

  test('predict retorna predicción válida', async () => {
    const mockBuffer = Array(24).fill(Array(126).fill(0.5));
    const prediction = await service.predict(mockBuffer);

    expect(prediction).toHaveProperty('word', 'confidence', 'index');
  });
});
```

---

## ✅ Checklist de Migración

- [ ] Crear `hooks/useMonolithicModel.js`
- [ ] Crear `hooks/useMonolithicMediaPipe.js`
- [ ] Crear `hooks/useMonolithicDetection.js`
- [ ] Crear `utils/services/monolithicDetectionService.js`
- [ ] Refactorizar `MonolithicDetectionScreen.js`
- [ ] Actualizar `WordDetectionScreen.mediapipe.js` para usar hooks
- [ ] Actualizar `AlphabetDetectionScreen.js`
- [ ] Actualizar `NumberDetectionScreen.js`
- [ ] Escribir tests
- [ ] Validar performance
- [ ] Documentar cambios

---

## 📊 Comparación: Antes vs Después

### ANTES (Monolítica)

```
MonolithicDetectionScreen.js
├─ State: modelo, mediaipe, buffer, UI
├─ Lógica: loadModel, initMediaPipe, detect
├─ UI: render
└─ PROBLEMAS:
    ❌ Difícil de mantener
    ❌ No reutilizable
    ❌ Acoplada
    ❌ Difícil de testear
```

### DESPUÉS (Modular)

```
Hooks (reutilizables)
├─ useMonolithicModel
├─ useMonolithicMediaPipe
└─ useMonolithicDetection

Services (lógica centralizada)
└─ MonolithicDetectionService

Components (UI limpia)
├─ MonolithicDetectionScreen (refactorizado)
├─ WordDetectionScreen (usa hooks)
├─ AlphabetDetectionScreen (usa hooks)
└─ NumberDetectionScreen (usa hooks)

Tests
└─ monolithicDetection.test.js

BENEFICIOS:
✅ Fácil de mantener
✅ Reutilizable
✅ Desacoplado
✅ Fácil de testear
✅ Performance mejorado
```

---

## 🚀 Detalles de Ejecución

### Paso 1: Crear Hooks

**Tiempo:** 45 minutos

1. Copiar código de `MonolithicDetectionScreen`
2. Dividir por concerns (modelo, mediaipe, detección)
3. Usar `useCallback` y `useRef` apropiadamente
4. Testear cada hook aisladamente

### Paso 2: Crear Servicios

**Tiempo:** 30 minutos

1. Consolidar lógica común
2. Usar patrón Singleton
3. Implementar Observer pattern para callbacks

### Paso 3: Refactorizar Componente

**Tiempo:** 30 minutos

1. Reemplazar setState con hooks
2. Simplificar JSX
3. Mantener debugging (logs)

### Paso 4: Integrar en Otros Componentes

**Tiempo:** 45 minutos

1. WordDetectionScreen.mediapipe
2. AlphabetDetectionScreen
3. NumberDetectionScreen

### Paso 5: Tests

**Tiempo:** 30 minutos

1. Unit tests para hooks
2. Integration tests para servicios
3. E2E tests para componentes

---

## 🎓 Lecciones Aprendidas

1. **Empezar monolítico para entender el flujo**
2. **Luego extraer hooks para reutilización**
3. **Crear servicios para lógica centralizada**
4. **Separar UI de lógica**
5. **Testear cada parte aisladamente**

---

## 📚 Recursos

- [Hooks API Reference](https://react.dev/reference/react/hooks)
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Testing Library](https://testing-library.com/)

---

**Status:** Guía completa ✅
**Última actualización:** 2025-11-13
