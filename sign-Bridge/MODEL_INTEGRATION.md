# Integración del Modelo TFLite

## Descripción

Se ha integrado el modelo YOLO TFLite para detección de lenguaje de señas chileno (alfabeto y números) en la aplicación SignBridge. La integración incluye un sistema robusto de fallback que mantiene la funcionalidad simulada cuando el modelo no está disponible.

## Características Implementadas

### 1. Detección con Modelo TFLite
- ✅ Carga automática del modelo al iniciar el servicio de detección
- ✅ Soporte para alfabeto (A-Z) y números (0-9) en la misma pantalla
- ✅ Procesamiento de frames de cámara en tiempo real
- ✅ Umbral de confianza configurable (70% por defecto)
- ✅ Debounce de 1.5 segundos para evitar detecciones repetidas

### 2. Sistema de Fallback
- ✅ Si el modelo no se carga, automáticamente usa simulación
- ✅ Reintento automático cada 10 segundos para cargar el modelo
- ✅ Indicadores visuales del estado del modelo
- ✅ La aplicación sigue funcionando incluso sin el modelo

### 3. Interfaz de Usuario
- ✅ Indicador de estado del modelo (TFLite vs Simulación)
- ✅ Panel combinado de alfabeto y números con scroll horizontal
- ✅ Separador visual entre alfabeto y números
- ✅ Distinción de colores: letras (gris) vs números (azul)
- ✅ Icono 🎲 cuando la detección es simulada

## Estructura de Archivos

```
sign-Bridge/
├── assets/
│   └── Modelo/
│       └── runs/
│           └── detect/
│               └── train/
│                   └── weights/
│                       └── best_float16.tflite    # Modelo YOLO TFLite
│
├── utils/
│   └── services/
│       └── detectionService.js                    # Servicio actualizado con TFLite
│
└── screens/
    └── AlphabetDetectionScreen.js                 # Pantalla con alfabeto y números
```

## Configuración del Modelo

### Parámetros en `detectionService.js`

```javascript
const DETECTION_CONFIG = {
  minConfidence: 0.7,           // Confianza mínima: 70%
  detectionInterval: 1500,      // Debounce: 1.5 segundos
  modelRetryInterval: 10000,    // Reintentar cada 10 segundos
  modelPath: require('../../assets/Modelo/runs/detect/train/weights/best_float16.tflite'),
};
```

## Instalación de Dependencias

El modelo requiere TensorFlow.js para React Native:

```bash
cd sign-Bridge
npm install
```

Las dependencias añadidas:
- `@tensorflow/tfjs`: ^4.11.0
- `@tensorflow/tfjs-react-native`: ^0.8.0
- `expo-gl`: ~15.0.5
- `react-native-fs`: ^2.20.0

## Flujo de Detección

### 1. Inicialización
```
App inicia → DetectionService inicia → TensorFlow.js se inicializa
                                      ↓
                              Intenta cargar modelo
                                      ↓
                         ┌────────────┴────────────┐
                         ↓                         ↓
                    Éxito ✅                   Fallo ❌
                Modelo cargado            Modo simulación
                                         Reintento en 10s
```

### 2. Detección en Tiempo Real
```
Cada 1.5s → Captura frame de cámara
                    ↓
              ¿Modelo cargado?
                    ↓
            ┌───────┴───────┐
            ↓               ↓
         Sí ✅           No ❌
    Procesa con TFLite   Simulación
            ↓               ↓
      Retorna detección o null
            ↓
     Aplica debounce (evita repeticiones)
            ↓
     Notifica a la UI
```

### 3. Sistema de Fallback
```
Modelo falla → Activa modo simulación
                      ↓
              Programa reintento en 10s
                      ↓
              Continúa detectando (simulado)
                      ↓
              Timer se cumple → Intenta recargar
                      ↓
              ¿Éxito? → Modo TFLite
              ¿Fallo? → Repite ciclo
```

## API del Servicio de Detección

### Métodos Principales

#### `startDetection(cameraRef)`
Inicia la detección automática.
- **Parámetro**: `cameraRef` - Referencia a la cámara de Expo
- **Retorna**: `Promise<void>`

```javascript
await detectionService.startDetection(cameraRef);
```

#### `stopDetection()`
Detiene la detección automática.

```javascript
detectionService.stopDetection();
```

#### `onDetection(callback)`
Registra un callback para recibir resultados.

```javascript
detectionService.onDetection((result) => {
  console.log('Letra:', result.letter);
  console.log('Confianza:', result.confidence);
  console.log('Simulado:', result.isSimulated);
});
```

#### `getStatus()`
Obtiene el estado actual del servicio.

```javascript
const status = detectionService.getStatus();
console.log('Modelo cargado:', status.isModelLoaded);
console.log('TensorFlow listo:', status.isTfReady);
```

### Eventos del Callback

El callback recibe un objeto con:

```javascript
{
  isProcessing: boolean,      // true durante procesamiento
  letter: string | null,      // 'A'-'Z', '0'-'9', o null
  confidence: number,         // 0-100
  timestamp: number,          // Date.now()
  isSimulated: boolean,       // true si es simulación
  modelLoaded: boolean,       // true cuando modelo carga
  isManual: boolean,          // true si es detección manual
  error: string,              // mensaje de error si aplica
}
```

## Ubicación del Modelo

El modelo debe estar en:
```
sign-Bridge/assets/Modelo/runs/detect/train/weights/best_float16.tflite
```

### Si el modelo no existe:
1. La app usará **modo simulación** automáticamente
2. Se intentará cargar el modelo cada 10 segundos
3. El usuario verá "Modo Simulación" en el panel de estado
4. Las detecciones simuladas mostrarán el icono 🎲

## Personalización

### Cambiar el umbral de confianza
En `detectionService.js`:
```javascript
const DETECTION_CONFIG = {
  minConfidence: 0.6,  // Cambiar a 60%
  ...
};
```

### Cambiar el intervalo de detección
```javascript
const DETECTION_CONFIG = {
  detectionInterval: 2000,  // 2 segundos
  ...
};
```

### Cambiar el intervalo de reintento del modelo
```javascript
const DETECTION_CONFIG = {
  modelRetryInterval: 15000,  // 15 segundos
  ...
};
```

## Símbolos Detectables

### Alfabeto (A-Z)
Todas las letras del alfabeto chileno de señas

### Números (0-9)
Todos los números del lenguaje de señas chileno

**Total**: 36 símbolos detectables en una sola pantalla

## Indicadores de Estado

### Panel de Estado
- 🟢 **Detección activa** / ⚪ **Detección pausada**
- 🟢 **Modelo TFLite** / 🟡 **Modo Simulación**
- 🟢 **Cámara trasera** / **Cámara frontal**
- ✅ **Detectada: A (85%)** 🎲 (si es simulada)

### Estados del Modelo
- ✅ **Modelo TFLite**: Modelo cargado y funcionando
- ⚠️ **Modo Simulación**: Fallback activo, reintentos automáticos

## Solución de Problemas

### El modelo no carga
1. Verificar que el archivo `.tflite` existe en la ruta correcta
2. Revisar la consola para mensajes de error
3. El sistema automáticamente usará simulación
4. El modelo se reintentará cargar cada 10 segundos

### Detecciones lentas
1. Ajustar `detectionInterval` a un valor mayor
2. Reducir la calidad de captura de foto
3. Verificar rendimiento del dispositivo

### Detecciones repetidas
1. Aumentar `detectionInterval` (debounce)
2. El sistema ya implementa debounce de 1.5s
3. No se repiten detecciones del mismo símbolo en ese intervalo

## Próximos Pasos

1. ✅ Modelo integrado con fallback
2. ✅ Soporte de alfabeto y números
3. ✅ Sistema de reintentos automático
4. 🔄 Optimizar rendimiento en dispositivos
5. 🔄 Añadir caché de modelo
6. 🔄 Métricas de detección en tiempo real
7. 🔄 Modo de calibración de confianza

## Contacto y Soporte

Para problemas o preguntas sobre la integración del modelo:
- Revisar logs en la consola de Expo
- Verificar estado con `detectionService.getStatus()`
- El sistema siempre mantiene funcionalidad con simulación

---

**Versión**: 1.0  
**Última actualización**: Octubre 2025  
**Equipo**: Capstone Sign Bridge
