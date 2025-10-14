# Arquitectura del Sistema de Detección

## 📐 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         AlphabetDetectionScreen.js                 │    │
│  │                                                     │    │
│  │  • Camera View (Expo Camera)                       │    │
│  │  • Detection Overlay                               │    │
│  │  • Status Panel                                    │    │
│  │  • Alphabet + Numbers Grid                         │    │
│  │  • Controls                                        │    │
│  └──────────────────┬──────────────────────────────────┘    │
│                     │                                        │
│                     │ callbacks                              │
│                     ↓                                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │         DetectionService (Singleton)               │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐  │    │
│  │  │   Model Loading System                      │  │    │
│  │  │   • initializeTensorFlow()                  │  │    │
│  │  │   • loadModel()                             │  │    │
│  │  │   • scheduleModelRetry()                    │  │    │
│  │  │   • checkModelExists()                      │  │    │
│  │  └─────────────────────────────────────────────┘  │    │
│  │                     ↓                              │    │
│  │  ┌─────────────────────────────────────────────┐  │    │
│  │  │   Detection Loop                            │  │    │
│  │  │   • startDetection()                        │  │    │
│  │  │   • detectLoop() every 1.5s                 │  │    │
│  │  │   • captureFrame()                          │  │    │
│  │  │   • processImageWithModel()                 │  │    │
│  │  └─────────────────────────────────────────────┘  │    │
│  │                     ↓                              │    │
│  │  ┌─────────────────────────────────────────────┐  │    │
│  │  │   Fallback System                           │  │    │
│  │  │   • Model failed? → simulateDetection()     │  │    │
│  │  │   • Retry every 10s                         │  │    │
│  │  │   • Always functional                       │  │    │
│  │  └─────────────────────────────────────────────┘  │    │
│  │                     ↓                              │    │
│  │  ┌─────────────────────────────────────────────┐  │    │
│  │  │   Debounce & Processing                     │  │    │
│  │  │   • processPredictions()                    │  │    │
│  │  │   • 1.5s debounce                           │  │    │
│  │  │   • 70% confidence threshold                │  │    │
│  │  └─────────────────────────────────────────────┘  │    │
│  │                     ↓                              │    │
│  │  ┌─────────────────────────────────────────────┐  │    │
│  │  │   Notification System                       │  │    │
│  │  │   • notifyCallbacks()                       │  │    │
│  │  │   • Send to UI                              │  │    │
│  │  └─────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    File System                               │
│                                                              │
│  assets/Modelo/runs/detect/train/weights/                   │
│    └── best_float16.tflite (opcional)                       │
└──────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

### Inicio de la Aplicación

```
Usuario abre app
        ↓
AlphabetDetectionScreen se monta
        ↓
useEffect ejecuta
        ↓
detectionService.startDetection(cameraRef)
        ↓
┌───────────────────────────────────────┐
│ DetectionService.constructor()        │
│   → initializeTensorFlow()            │
│      → loadModel()                    │
│         ↓                             │
│   ¿Modelo existe?                     │
│      ↓          ↓                     │
│    Sí          No                     │
│      ↓          ↓                     │
│   Cargar    Simulación                │
│      ↓          ↓                     │
│   ¿Éxito?   scheduleModelRetry()      │
│      ↓          (cada 10s)            │
│    Sí                                 │
│      ↓                                │
│ isModelLoaded = true                  │
└───────────────────────────────────────┘
```

### Ciclo de Detección (cada 1.5s)

```
Timer ejecuta detectLoop()
        ↓
notifyCallbacks({ isProcessing: true })
        ↓
        UI muestra "Procesando..."
        ↓
¿Modelo cargado?
        ↓
┌───────┴───────┐
↓               ↓
Sí              No
↓               ↓
captureFrame()  simulateDetection()
↓                       ↓
processImageWithModel() generateRandomDetection()
        ↓
processPredictions()
        ↓
¿Resultado válido?
        ↓
┌───────┴───────┐
↓               ↓
Sí              No
↓               ↓
¿Debounce?      notifyCallbacks(null)
↓                       ↓
¿Mismo símbolo          UI: "Sin detección"
 en < 1.5s?
↓       ↓
Sí      No
↓       ↓
Ignorar Notificar
        ↓
notifyCallbacks({
  letter: 'A',
  confidence: 85,
  isSimulated: false
})
        ↓
UI actualiza:
  - Letra detectada
  - Barra de confianza
  - Símbolo destacado
```

## 🎯 Componentes Clave

### 1. DetectionService

**Responsabilidades**:
- Gestión del ciclo de vida del modelo
- Coordinación de detecciones
- Fallback automático
- Notificaciones a UI

**Estado interno**:
```javascript
{
  isActive: boolean,
  isModelLoaded: boolean,
  isTfReady: boolean,
  model: object | null,
  cameraRef: object | null,
  callbacks: Function[],
  detectionTimer: number,
  modelRetryTimer: number,
  lastDetectedSymbol: string,
  lastDetectionTime: number
}
```

### 2. AlphabetDetectionScreen

**Responsabilidades**:
- Renderizado de UI
- Gestión de cámara
- Controles de usuario
- Visualización de resultados

**Estado local**:
```javascript
{
  permission: object,
  facing: 'back' | 'front',
  isLoading: boolean,
  detectedLetter: string | null,
  confidence: number,
  isProcessing: boolean,
  isDetectionActive: boolean,
  isModelLoaded: boolean,
  isSimulated: boolean
}
```

### 3. DetectionOverlay

**Responsabilidades**:
- Mostrar letra detectada
- Barra de confianza
- Estados de procesamiento
- Guías visuales

## 🔀 Estados del Sistema

### Estado 1: Inicializando
```
┌─────────────────┐
│ isActive: false │
│ isModelLoaded:  │
│   false         │
│ isProcessing:   │
│   false         │
└─────────────────┘
```

### Estado 2: Cargando Modelo
```
┌─────────────────┐
│ isActive: false │
│ isModelLoaded:  │
│   false         │
│ isTfReady: true │
│ Intento: 1      │
└─────────────────┘
```

### Estado 3: Modo Simulación
```
┌─────────────────┐
│ isActive: true  │
│ isModelLoaded:  │
│   false         │
│ isProcessing:   │
│   variable      │
│ Reintentos:     │
│   cada 10s      │
└─────────────────┘
```

### Estado 4: Modo TFLite
```
┌─────────────────┐
│ isActive: true  │
│ isModelLoaded:  │
│   true          │
│ model: object   │
│ isProcessing:   │
│   variable      │
└─────────────────┘
```

## 📊 Tipos de Detección

### Detección Simulada
```javascript
{
  letter: 'A',           // Aleatorio de [A-Z, 0-9]
  confidence: 75,        // 30-95 aleatorio
  timestamp: 1234567890,
  isSimulated: true      // ⬅️ Marcador
}
```

### Detección Real (TFLite)
```javascript
{
  letter: 'A',           // Del modelo
  confidence: 92,        // Confianza real
  timestamp: 1234567890,
  isSimulated: false,    // ⬅️ Sin simulación
  bbox: [x, y, w, h]     // Opcional
}
```

### Detección Manual (Usuario fuerza)
```javascript
{
  letter: 'B',
  confidence: 88,
  timestamp: 1234567890,
  isManual: true,        // ⬅️ Forzada por usuario
  isSimulated: false
}
```

## 🔄 Callbacks y Eventos

### Eventos del DetectionService

```javascript
// Procesando
{ isProcessing: true }

// Resultado exitoso
{
  isProcessing: false,
  letter: 'A',
  confidence: 85,
  timestamp: 1234567890,
  isSimulated: false,
  isManual: false
}

// Sin detección
{
  isProcessing: false,
  letter: null,
  confidence: 0,
  timestamp: 1234567890
}

// Modelo cargado
{
  modelLoaded: true,
  timestamp: 1234567890
}

// Error
{
  isProcessing: false,
  error: 'Error message',
  timestamp: 1234567890
}

// Detenido
{
  isProcessing: false,
  letter: null,
  confidence: 0,
  isStopped: true
}
```

## 🎨 Renderizado Condicional en UI

```javascript
// En AlphabetDetectionScreen

if (isProcessing) {
  // Mostrar spinner
  <Ionicons name="sync" size={40} color="#00FF88" />
}

else if (detectedLetter && confidence) {
  // Mostrar resultado
  <Text>{detectedLetter}</Text>
  <Text>{confidence}%</Text>
  {isSimulated && <Text>🎲</Text>}
}

else {
  // Sin detección
  <Text>Muestra una letra</Text>
}
```

## 🔧 Configuración Global

```javascript
const DETECTION_CONFIG = {
  // Modelo
  minConfidence: 0.7,           // 70%
  modelPath: '...',
  modelRetryInterval: 10000,    // 10s
  
  // Detección
  detectionInterval: 1500,      // 1.5s
  processingTime: 800,          // 800ms (simulación)
  
  // UI
  maxConfidence: 95,            // Para simulación
};

const ALPHABET = ['A', ..., 'Z'];
const NUMBERS = ['0', ..., '9'];
```

## 🚀 Optimizaciones Futuras

1. **Caché de Detecciones**
   - Guardar últimas N detecciones
   - Filtro de ruido con votación

2. **Procesamiento Adaptativo**
   - Ajustar intervalo según rendimiento
   - Reducir calidad si dispositivo lento

3. **Métricas**
   - Tiempo de procesamiento
   - Tasa de éxito
   - Latencia promedio

4. **Modo Offline Completo**
   - Modelo embebido en app
   - Sin dependencia de internet

---

Esta arquitectura proporciona:
✅ Escalabilidad  
✅ Mantenibilidad  
✅ Robustez  
✅ Flexibilidad  
✅ Experiencia de usuario consistente
