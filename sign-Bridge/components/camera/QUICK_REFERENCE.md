# DetectionOverlay - Guía Rápida de Referencia

## 🎯 Uso Inmediato

```javascript
import DetectionOverlay from './components/camera/DetectionOverlay';

// En tu componente:
<DetectionOverlay
  detectedLetter="A"
  confidence={0.87}
  isProcessing={false}
  type="letter"
  isVisible={true}
/>
```

---

## 📊 Comportamiento Visual por Confianza

```
CONFIANZA BAJA (< 50%)
┌─────────────────────┐
│  📹 Simulador       │
│     🖐️ Listo       │
└─────────────────────┘
→ Muestra icono de mano
→ Sin overlay de detección
→ Sin animaciones


CONFIANZA MEDIA (50-70%)
┌─────────────────────┐
│  📹 Simulador       │
│     ┌──────────┐    │
│     │    A     │    │ ← Aparece con fade + scale
│     │   65%    │    │ ← Color amarillo
│     │ ████░░░░ │    │ ← Barra 65% llena
│     └──────────┘    │
└─────────────────────┘
→ Animación de entrada suave
→ Sin pulse (no alcanza 70%)


CONFIANZA ALTA (≥ 70%)
┌─────────────────────┐
│  📹 Simulador       │
│     ┌──────────┐    │
│     │    A     │    │ ← Pulsando 1.0x ↔ 1.15x
│     │   87%    │    │ ← Color verde
│     │ ███████░ │    │ ← Barra 87% llena
│     └──────────┘    │
│     ✨ PULSE ✨     │
└─────────────────────┘
→ Animación de entrada + pulse
→ Feedback visual claro
→ Loop continuo de pulse
```

---

## 🎨 Colores y Umbrales

```
ROJO (#FF4444)        AMARILLO (#FFB800)    VERDE (#00FF88)
│                     │                     │
├─ 0% ─ 20% ─ 40% ─ 50% ─ 60% ─ 70% ─ 80% ─ 90% ─ 100% ─┤
│    BAJA            │      MEDIA         │      ALTA      │
│    NO MOSTRAR      │    MOSTRAR NORMAL  │  MOSTRAR+PULSE │
```

**Configuración:**
```javascript
const CONFIDENCE_THRESHOLDS = {
  HIGH: 70,    // ← Umbral para activar pulse
  MEDIUM: 50,  // ← Umbral mínimo para mostrar overlay
  LOW: 0,
};

const COLORS = {
  HIGH: '#00FF88',      // Verde neon
  MEDIUM: '#FFB800',    // Amarillo/Naranja
  LOW: '#FF4444',       // Rojo
};
```

---

## ⏱️ Duraciones de Animación

```
FADE IN/OUT (Opacidad)
├─ 0ms: Opacidad 0 (invisible)
├─ 150ms: Opacidad 0.5
└─ 300ms: Opacidad 1 (visible)

SCALE (Entrada con Rebote)
├─ 0ms: Escala 0.8x
├─ 150ms: Escala 1.05x (rebote)
└─ 300ms: Escala 1.0x (normal)

PULSE (Solo en Alta Confianza)
├─ 0ms: Escala 1.0x
├─ 500ms: Escala 1.15x (expandir)
├─ 1000ms: Escala 1.0x (contraer)
└─ Loop cada 1000ms
```

**Personalizar:**
```javascript
const ANIMATION_DURATION = 300;  // Cambiar a 500 para más lento
const PULSE_DURATION = 1000;     // Cambiar a 1500 para pulse más lento
```

---

## 📱 Tamaños Responsive

```
PANTALLA PEQUEÑA          PANTALLA GRANDE
(<600px)                  (≥600px)
│                         │
├─ 56px Font              ├─ 64px Font
├─ Ej: Móvil             ├─ Ej: Tablet, Web
└─ Aparece más pequeño    └─ Aparece más grande
```

**Cálculo automático:**
```javascript
const SCREEN_WIDTH = Dimensions.get('window').width;
const BASE_FONT_SIZE = SCREEN_WIDTH < 600 ? 56 : 64;
```

---

## 🔧 Props y Defaults

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `detectedLetter` | string | required | Letra/palabra a mostrar |
| `confidence` | number (0-1) | required | Confianza (0=0%, 1=100%) |
| `isProcessing` | boolean | `false` | ¿Está analizando? |
| `type` | string | `'letter'` | Tipo: 'letter' o 'word' |
| `isVisible` | boolean | `true` | ¿Mostrar overlay? |

**Ejemplos:**
```javascript
// Confianza alta
<DetectionOverlay
  detectedLetter="Hola"
  confidence={0.92}
  isProcessing={false}
  type="word"
  isVisible={true}
/>

// Esperando entrada
<DetectionOverlay
  detectedLetter={null}
  confidence={0}
  isProcessing={true}
  type="letter"
  isVisible={true}
/>

// Oculto completamente
<DetectionOverlay
  detectedLetter="A"
  confidence={0.75}
  isVisible={false}
/>
```

---

## 🐛 Troubleshooting

### Problema: No aparece el overlay
```
✓ Verificar: confidence >= 0.50 (50%)
✓ Verificar: isVisible = true
✓ Verificar: detectedLetter no es null/vacío
```

### Problema: No aparece el pulse
```
✓ Verificar: confidence >= 0.70 (70%)
✓ Esperar 1000ms (duración del pulse)
✓ El pulse es un loop - debe verse continuamente
```

### Problema: Animaciones muy rápidas/lentas
```
// Editar línea 20-21:
const ANIMATION_DURATION = 300;  // Cambiar aquí
const PULSE_DURATION = 1000;     // O aquí
```

### Problema: Colores incorrectos
```
// Verificar rangos de confianza (línea 22-26):
- 0.0 - 0.50 = RED (#FF4444)
- 0.50 - 0.70 = YELLOW (#FFB800)
- 0.70 - 1.0 = GREEN (#00FF88)

// Cambiar colores en línea 28-35:
const COLORS = {
  HIGH: '#00FF88',      // ← Cambiar aquí
  MEDIUM: '#FFB800',    // ← O aquí
  LOW: '#FF4444',       // ← O aquí
};
```

---

## 🧪 Test Cases

### Test 1: Aparición Normal
```javascript
<DetectionOverlay
  detectedLetter="A"
  confidence={0.65}
  isProcessing={false}
  isVisible={true}
/>
// Expected: Amarillo, sin pulse, fade in suave
```

### Test 2: Pulse Activado
```javascript
<DetectionOverlay
  detectedLetter="A"
  confidence={0.85}
  isProcessing={false}
  isVisible={true}
/>
// Expected: Verde, pulse continuo 1.0x ↔ 1.15x
```

### Test 3: Cambio Rápido
```javascript
// Cambiar A → B → C rápidamente
// Expected: Transiciones suaves, sin parpadeos
```

### Test 4: Desaparición
```javascript
<DetectionOverlay
  detectedLetter="A"
  confidence={0.30}  // Debajo de 50%
  isProcessing={false}
  isVisible={true}
/>
// Expected: Muestra "Listo", sin overlay detectado
```

---

## 📂 Estructura de Archivos

```
components/camera/
├── DetectionOverlay.js                    ← Componente principal
├── DETECTION_OVERLAY_IMPROVEMENTS.md      ← Documentación detallada
├── QUICK_REFERENCE.md                     ← Este archivo
└── DetectionOverlay.demo.js               ← Componente de demo
```

---

## 🚀 Integración Rápida

### En WordDetectionScreen.js
```javascript
import DetectionOverlay from '../components/camera/DetectionOverlay';

export default function WordDetectionScreen() {
  const [detectedWord, setDetectedWord] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <View style={styles.container}>
      <Video ref={videoRef} />

      <DetectionOverlay
        detectedLetter={detectedWord}
        confidence={confidence}
        isProcessing={isProcessing}
        type="word"
        isVisible={true}
      />
    </View>
  );
}
```

### En AlphabetDetectionScreen.js
```javascript
import DetectionOverlay from '../components/camera/DetectionOverlay';

<DetectionOverlay
  detectedLetter={detectedLetter}
  confidence={confidence}
  isProcessing={isProcessing}
  type="letter"
  isVisible={true}
/>
```

---

## 💡 Tips Avanzados

### Personalizar para Tema Oscuro/Claro
```javascript
// Editar COLORS según tema:
const isDarkMode = true;
const COLORS = isDarkMode ? {
  HIGH: '#00FF88',
  MEDIUM: '#FFB800',
  LOW: '#FF4444',
} : {
  HIGH: '#0080FF',
  MEDIUM: '#FF9800',
  LOW: '#FF5252',
};
```

### Agregar Sonido en Detección Alta
```javascript
// Después de línea 86 (activar pulse):
if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) {
  startPulseAnimation();
  // playSuccessSound(); ← Agregar aquí
}
```

### Agregar Vibración en Detección
```javascript
// En useEffect, después de notificar:
import { Haptics } from 'expo';
if (confidence >= 0.70) {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
```

---

## 📞 Soporte Rápido

**¿Dónde buscar ayuda?**
- Documentación detallada: `DETECTION_OVERLAY_IMPROVEMENTS.md`
- Demo interactivo: `DetectionOverlay.demo.js`
- Código fuente comentado: `DetectionOverlay.js`

**Líneas de Código Clave:**
| Qué cambiar | Dónde | Línea |
|-------------|-------|-------|
| Duración animaciones | ANIMATION_DURATION | 20 |
| Duración pulse | PULSE_DURATION | 21 |
| Umbral pulse | CONFIDENCE_THRESHOLDS.HIGH | 23 |
| Umbral mínimo | CONFIDENCE_THRESHOLDS.MEDIUM | 24 |
| Color verde | COLORS.HIGH | 29 |
| Color amarillo | COLORS.MEDIUM | 30 |
| Color rojo | COLORS.LOW | 31 |
| Font size móvil | BASE_FONT_SIZE (SCREEN_WIDTH < 600) | 39 |
| Font size tablet | BASE_FONT_SIZE (else) | 39 |

---

**Versión:** 2.0.0
**Última actualización:** 2025-11-12
**Compatible con:** React Native 0.74.5+, Expo 51.0.28+
