# DetectionOverlay - Arquitectura y Diagramas

## 🏗️ Flujo de Componentes

```
WordDetectionScreen
         │
         │ props: {
         │   detectedWord,
         │   confidence,
         │   isProcessing
         │ }
         ▼
   DetectionOverlay
    (componente)
         │
         ├─→ [useEffect] Detecta cambios
         │        │
         │        ├─→ confidence >= 50%?
         │        │        ├─ YES → Animar entrada (fade + scale)
         │        │        └─ NO  → Animar salida (fade + scale)
         │        │
         │        ├─→ confidence >= 70%?
         │        │        ├─ YES → Activar pulse loop
         │        │        └─ NO  → Desactivar pulse
         │        │
         └─→ [Render] Mostrar contenido
                  │
                  ├─→ confidence >= 50%?
                  │        │
                  │        ├─ YES → Mostrar detección
                  │        │         ├─ Letra grande (56-64px)
                  │        │         ├─ Porcentaje (28px)
                  │        │         ├─ Barra (6px, dinámica)
                  │        │         └─ Pulse (si >= 70%)
                  │        │
                  │        └─ NO  → Mostrar estado esperando
                  │                 ├─ Icono (scan/hand)
                  │                 └─ Texto ("Analizando..." / "Listo")
                  │
                  └─→ [StyleSheet] Aplicar estilos

```

---

## 🎯 Máquina de Estados

```
┌──────────────────────────────────────────────────────┐
│                   DetectionOverlay                   │
│                   State Machine                      │
└──────────────────────────────────────────────────────┘


1. ESTADO OCULTO
   ├─ isVisible = false
   ├─ Renderiza: null
   └─ Animaciones: pausadas


2. ESTADO ESPERANDO
   ├─ Condición: confidence < 50% O detectedLetter = null
   ├─ Animaciones: Fade out + Scale down
   ├─ Renderiza:
   │  ├─ Icono: hand-left (esperando) o scan (analizando)
   │  └─ Texto: "Listo" o "Analizando..."
   └─ Pulse: desactivado


3. ESTADO DETECTADO MEDIA CONFIANZA
   ├─ Condición: 50% <= confidence < 70%
   ├─ Animaciones: Fade in + Spring bounce
   ├─ Color: Amarillo (#FFB800)
   ├─ Renderiza:
   │  ├─ Letra grande (56-64px)
   │  ├─ Porcentaje (28px)
   │  └─ Barra (6px, 50-70% llena)
   └─ Pulse: desactivado


4. ESTADO DETECTADO ALTA CONFIANZA
   ├─ Condición: confidence >= 70%
   ├─ Animaciones: Fade in + Spring bounce + Pulse loop
   ├─ Color: Verde (#00FF88)
   ├─ Renderiza:
   │  ├─ Letra grande (56-64px) [pulsando]
   │  ├─ Porcentaje (28px)
   │  └─ Barra (6px, 70-100% llena)
   └─ Pulse: 1.0x ↔ 1.15x cada 1000ms


TRANSICIONES:
─────────────

null ─────────────────→ ESPERANDO
                           ▲ │
                           │ │
                           │ └─→ MEDIA (50%)
                           │       ▼
                           └──← ALTA (70%)
```

---

## ⏱️ Timeline de Animaciones

```
ESCENARIO 1: Detección a Confianza Baja (30%)
──────────────────────────────────────────────

Timeline:
0ms      100ms    200ms    300ms
│         │       │        │
├─────────┼───────┼────────┤
│ Fade    ▓▓▓▓▓   ░░░░░░░  │ Fade OUT
│ Scale   ▓▓▓▓▓   ░░░░░░░  │ Scale DOWN
│                          │
└──────────────────────────┘
        (300ms total)

Resultado: Overlay se desvanece suavemente


ESCENARIO 2: Detección a Confianza Media (60%)
───────────────────────────────────────────────

Timeline:
0ms      100ms    200ms    300ms
│         │       │        │
├─────────┼───────┼────────┤
│ Fade    ░░░░░   ▓▓▓▓▓▓▓  │ Fade IN
│ Scale   ▀▀▀▀▀   ███████  │ Scale IN (bounce)
│                          │
└──────────────────────────┘
        (300ms total)

Resultado: Overlay aparece con efecto rebote


ESCENARIO 3: Detección a Confianza Alta (85%)
──────────────────────────────────────────────

Timeline:
0ms      100ms    200ms    300ms    400ms    500ms    600ms    700ms
│         │       │        │         │        │        │        │
├─────────┼───────┼────────┼─────────┼────────┼────────┼────────┤
│ Fade    ░░░░░   ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓  │ IN
│ Scale   ▀▀▀▀▀   ███████  ███████  ███████  ███████  ███████  │ IN
│ Pulse   ─────   ───────  ═════════════════════════════════   │ LOOP
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
        (Entrada: 300ms)        (Pulse: continuo 1000ms cada ciclo)

Resultado: Overlay aparece + inicia pulse automático

Pulse Detail (1000ms ciclo):
    0-500ms:  Escala 1.0x → 1.15x (expandir)
    500-1000ms: Escala 1.15x → 1.0x (contraer)
    1000ms:   Repite
```

---

## 🎨 Pipeline de Colores

```
CONFIDENCE SCORE
     │
     ▼
┌─────────────────────────────┐
│  getConfidenceColor(conf)   │
└─────────────────────────────┘
     │
     ├─→ conf >= 70%?  ──→ GREEN (#00FF88)    🟢
     │
     ├─→ conf >= 50%?  ──→ YELLOW (#FFB800)   🟡
     │
     └─→ else          ──→ RED (#FF4444)      🔴


APLICACIÓN A ELEMENTOS:
──────────────────────

Letra Grande
    │
    └─→ color: confidenceColor
        └─→ Verde / Amarillo / Rojo

Porcentaje (28px)
    │
    └─→ color: confidenceColor
        └─→ Verde / Amarillo / Rojo

Barra de Confianza
    │
    └─→ backgroundColor: confidenceColor
        └─→ Verde / Amarillo / Rojo (% dinámico)


VISUAL:
──────

40% Confianza:        65% Confianza:        88% Confianza:
─────────────         ─────────────         ─────────────
A              🔴     A              🟡     A              🟢
40%                   65%                   88%
████░░░░░░░░░░        █████████░░░░░░░      ████████░░░
(Rojo)                (Amarillo)             (Verde + PULSE)
```

---

## 🎬 Vista de Renderizado

```
DetectionOverlay.render()
        │
        ├─→ isVisible = false?
        │        └─→ return null
        │
        └─→ isVisible = true?
                 │
                 ├─→ Animated.View (con transform)
                 │    │
                 │    └─→ opacity: fadeAnim
                 │        transform: [
                 │          { scale: scaleAnim },
                 │          confidence >= 70% && { scale: pulseAnim }
                 │        ]
                 │
                 ├─→ hasValidConfidence?
                 │    │
                 │    ├─ YES (>= 50%)
                 │    │    │
                 │    │    └─→ View: detectionContainer
                 │    │         ├─ Text: Letra detectada (56-64px)
                 │    │         ├─ View: Divisor
                 │    │         ├─ View: confidenceSection
                 │    │         │    ├─ Text: Porcentaje (28px)
                 │    │         │    └─ View: Barra de confianza
                 │    │         │         └─ Animated.View (width dinámica)
                 │    │         └─ Text: Etiqueta tipo (opcional)
                 │    │
                 │    └─ NO (< 50%)
                 │         │
                 │         └─→ View: waitingContainer
                 │              ├─ Ionicons: scan o hand-left
                 │              └─ Text: Analizando... o Listo
                 │
                 └─→ StyleSheet.create()
                      └─→ Aplica estilos CSS-in-JS
```

---

## 📊 Flujo de Datos

```
ENTRADA (Props)
───────────────
  │
  ├─ detectedLetter: "A"
  ├─ confidence: 0.87
  ├─ isProcessing: false
  ├─ type: "letter"
  └─ isVisible: true
  │
  ▼
[PROCESAMIENTO]
───────────────
  │
  ├─ useEffect Hook
  │  ├─ confidence >= 50%? → true
  │  ├─ confidence >= 70%? → true
  │  ├─ Activar fade animation
  │  ├─ Activar scale animation
  │  ├─ Activar pulse animation
  │  └─ setCallbacks()
  │
  ├─ Cálculos
  │  ├─ confidenceColor = getConfidenceColor(0.87) → GREEN
  │  ├─ confidencePercent = 87
  │  └─ hasValidConfidence = true
  │
  └─ getConfidenceColor(0.87)
     └─ conf >= 70%? → return #00FF88 (GREEN)
  │
  ▼
[RENDERIZADO]
──────────────
  │
  ├─ Verificar isVisible (true)
  ├─ Verificar hasValidConfidence (true)
  ├─ Renderizar detectionContainer
  │  ├─ Text "A" en GREEN, 64px
  │  ├─ Divisor
  │  ├─ confidenceSection
  │  │  ├─ Text "87%" en GREEN, 28px
  │  │  └─ Barra 87% llena en GREEN
  │  └─ Text "LETTER" opcional
  │
  ├─ Aplicar animaciones
  │  ├─ opacity: 1 (fade in)
  │  ├─ scale: 1 (spring bounce)
  │  └─ scale: 1.0 → 1.15 → 1.0 (pulse loop)
  │
  ├─ Aplicar estilos
  │  ├─ backgroundColor: rgba(0,0,0,0.8)
  │  ├─ borderRadius: 16
  │  ├─ shadowColor: #000
  │  └─ elevation: 8
  │
  └─ Renderizar View final
  │
  ▼
SALIDA (Visual)
───────────────
  ┌──────────────┐
  │     A        │ ← 64px, GREEN
  │    ──        │ ← Divisor
  │    87%       │ ← 28px, GREEN
  │ ███████░░    │ ← Barra, 87% llena
  │    LETTER    │ ← Etiqueta
  └──────────────┘ ← Pulsando 1.0x ↔ 1.15x
    + Sombra
    + Borde sutil
```

---

## 🔄 Loop de Animación de Pulse

```
CICLO DE PULSE (1000ms total)
─────────────────────────────

  Inicio (0ms)
      │
      │ Scale: 1.0x
      ▼
   ╔═════════════════════════════╗
   ║   EXPANDIR (500ms)          ║
   ║   1.0x → 1.15x              ║
   ║   Usando: Animated.timing   ║
   ╚═════════════════════════════╝
      │
      │ Scale: 1.15x
      ▼
   ╔═════════════════════════════╗
   ║   CONTRAER (500ms)          ║
   ║   1.15x → 1.0x              ║
   ║   Usando: Animated.timing   ║
   ╚═════════════════════════════╝
      │
      │ Scale: 1.0x
      ▼
   ╔═════════════════════════════╗
   ║   REPETIR (Loop infinito)   ║
   ║   Mientras confidence >= 70% ║
   ╚═════════════════════════════╝
      │
      ▼ (volver a Expandir)


VALORES CLAVE:
──────────────
- duration: 500ms por fase
- toValue: 1.15x (15% de aumento)
- friction: 8 (stiffness)
- tension: 40 (bounciness)
- useNativeDriver: true (60 FPS)
```

---

## 🧮 Cálculo de Responsive Font Size

```
┌─────────────────────────────────────────┐
│   Dimensions.get('window').width        │
└─────────────────────────────────────────┘
         │
         ▼
   ┌─────────────┐
   │ < 600px?    │
   └─────────────┘
    │           │
   YES         NO
    │           │
    ▼           ▼
  56px         64px
    │           │
    └─── BASE_FONT_SIZE ───┘
         │
         ▼
    detectedText {
      fontSize: BASE_FONT_SIZE
    }


EJEMPLOS:
─────────
Device Type    Width    Font Size
─────────────────────────────────
iPhone 12       390px    56px ✓
iPhone 14 Pro   430px    56px ✓
iPad Air        834px    64px ✓
Desktop Web    1920px    64px ✓
```

---

## 🎪 Integración en Pantallas

```
WordDetectionScreen
│
├─ [Navigation]
│
├─ [Camera View]
│   └─ <Video />
│
├─ [DetectionOverlay] ← AQUÍ
│   └─ Props: detectedWord, confidence, isProcessing
│
├─ [Result Card]
│
├─ [Audio Button]
│
├─ [Feedback Buttons]
│
└─ [Detection History]


AlphabetDetectionScreen
│
├─ [Navigation]
│
├─ [Camera View]
│   └─ <Video />
│
├─ [DetectionOverlay] ← AQUÍ
│   └─ Props: detectedLetter, confidence, isProcessing
│
├─ [Control Buttons]
│
├─ [Status Panel]
│
└─ [Alphabet Grid]
```

---

## 🔌 Props Flow

```
┌────────────────────────────────┐
│   WordDetectionScreen.js       │
│                                │
│  const [detectedWord, ...] =  │
│  const [confidence, ...] =     │
│  const [isProcessing, ...] =   │
│                                │
│  <DetectionOverlay              │
│    detectedLetter={detectedWord}│ ─────┐
│    confidence={confidence}      │      │
│    isProcessing={isProcessing}  │      │
│    type="word"                  │      │
│    isVisible={true}             │      │
│  />                             │      │
└────────────────────────────────┘      │
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │  DetectionOverlay.js        │
                         │                             │
                         │  const {                    │
                         │    detectedLetter,          │
                         │    confidence,              │
                         │    isProcessing,            │
                         │    type,                    │
                         │    isVisible                │
                         │  } = props                  │
                         │                             │
                         │  → Usa en useEffect        │
                         │  → Usa en render           │
                         │  → Usa en getConfidenceColor
                         │                             │
                         └─────────────────────────────┘
```

---

## 📈 Árbol de Componentes (React)

```
<App>
  └─ <NavigationContainer>
      └─ <Stack.Navigator>
          ├─ <SplashScreen>
          ├─ <HomeScreen>
          ├─ <WordDetectionScreen>
          │   └─ <View style={styles.container}>
          │       ├─ <Video ref={videoRef} />
          │       │
          │       ├─ <DetectionOverlay> ← NUESTRO COMPONENTE
          │       │   ├─ <Animated.View style={...transform}>
          │       │   │   ├─ <View style={styles.detectionContainer}>
          │       │   │   │   ├─ <Text style={styles.detectedText}>
          │       │   │   │   ├─ <View style={styles.divider} />
          │       │   │   │   ├─ <View style={styles.confidenceSection}>
          │       │   │   │   │   ├─ <Text>87%</Text>
          │       │   │   │   │   └─ <View style={styles.confidenceBarContainer}>
          │       │   │   │   │       └─ <Animated.View style={...width}> ← Barra
          │       │   │   │   └─ <Text style={styles.typeLabel}>WORD</Text>
          │       │   │   │
          │       │   │   └─ <View style={styles.waitingContainer}>
          │       │   │       ├─ <Ionicons name="scan" />
          │       │   │       └─ <Text>Analizando...</Text>
          │       │   │
          │       │   └─ StyleSheet.create({...})
          │       │
          │       ├─ <DetectionResultCard />
          │       ├─ <AudioButton />
          │       ├─ <View style={styles.feedbackContainer}>
          │       └─ <DetectionHistory />
          │
          ├─ <AlphabetDetectionScreen>
          ├─ <NumberDetectionScreen>
          ├─ <DictionaryScreen>
          └─ <SettingsScreen>
```

---

## 🎯 Resumen de Interacciones

```
USUARIO GESTO / EVENTO
│
├─ Levanta mano para detectar
│  └─ [Cámara captura]
│     └─ [Modelo predice]
│        └─ [Se genera confidence]
│           │
│           ▼
│        ACTUALIZACIÓN DE PROPS
│        detectedLetter = "A"
│        confidence = 0.87
│        isProcessing = false
│
├─ [DetectionOverlay detecta cambio]
│  └─ useEffect() se ejecuta
│     ├─ Compara confidence anterior con nueva (0 → 0.87)
│     ├─ confidence >= 70%? → SÍ
│     └─ Inicia animaciones (fade + scale + pulse)
│
├─ [Usuario ve resultado]
│  └─ ┌──────────────┐
│     │     A        │ ← Verde + Pulsando
│     │    87%       │
│     │ ███████░░    │
│     └──────────────┘
│
└─ Usuario confirma o reinicia
   └─ confidence = 0 (detección finaliza)
      └─ useEffect() se ejecuta nuevamente
         └─ Inicia fade out + scale down
            └─ Vuelve a mostrar "Listo"
```

---

**Documentación técnica completa**
**Versión:** 2.0.0
**Diagrama actualizado:** 2025-11-12
