# SignBridge v4 (SB_v4)

Aplicación web de detección de signos de Lengua de Signos Chilena (LSCh) con inferencia on-device usando MediaPipe (detección de manos) y TensorFlow.js. Preparado para despliegue en Firebase Hosting.

## ✨ Características

- **Detección de manos en tiempo real**: MediaPipe Hands (WASM)
- **Clasificación de signos**: Modelo TFJS Bidirectional LSTM (67 clases)
- **Síntesis de voz**: Web Speech API con es-CL
- **Accesibilidad**: Alto contraste, texto grande, TTS configurable
- **Configuración avanzada**: Umbral de confianza y estabilidad de predicción ajustables
- **Manual interactivo**: 67 SVGs para referencia visual
- **Cross-browser**: Chrome, Edge, Safari (iOS)

## Requisitos

- Node 18+
- npm
- Navegador moderno con soporte para camera API y WebGL

## ⚡ Ejecutar localmente

```bash
cd SB_v4
npm install
npm run start
```

Abre tu navegador en `http://localhost:19006` (o la URL mostrada). Ve a "DETECT" y autoriza el acceso a la cámara.

## 🔨 Build

```bash
npm run build
# Salida: SB_v4/dist/
```

Este comando ejecuta `expo export:web` y luego copia los archivos estáticos (`public/`) a `dist/`.

## 🚀 Despliegue en Firebase Hosting

### Configuración inicial (una sola vez)

```bash
npm i -g firebase-tools
firebase login
cd SB_v4
firebase init hosting  # Selecciona public: dist
```

### Deploy

```bash
firebase deploy --only hosting
```

Tu sitio estará disponible en `https://<tu-proyecto>.web.app`

## 🧠 Modelo y etiquetas

### Estado actual

- **Modelo**: Bidirectional LSTM (2 capas, 160 unidades cada una)
- **Entrada**: Secuencia de 24 frames × 126 características (21 landmarks × 3 coords × 2 manos)
- **Salida**: 67 clases (10 dígitos + 26 letras + 31 frases LSCh)
- **Archivo**: `public/model/model.json` + `public/model/group1-shard1of1.bin` (4.1 MB)
- **Etiquetas**: `public/labels.json`

### Si necesitas reconvertir el modelo

```bash
# En la carpeta del proyecto raíz:
pip install tensorflow tensorflowjs
tensorflowjs_converter --input_format=keras --output_format=tfjs_layers_model \
  ../sign-Bridge/assets/model/best_model.keras \
  SB_v4/public/model
```

## 📋 Estructura del proyecto

```
SB_v4/
├── App.js                              # Navegación por pestañas
├── screens/
│   ├── DetectScreen.js                 # Cámara + detección en tiempo real
│   ├── ManualScreen.js                 # Diccionario visual (LSCh)
│   ├── SettingsScreen.js               # Accesibilidad + ajustes avanzados
│   └── HomeScreen.js                   # Pantalla de inicio
├── hooks/
│   ├── useMediaPipeDetection.js        # Detección de manos
│   └── useTfjsClassifier.js            # Inferencia con TensorFlow.js
├── utils/
│   ├── debounce.js                     # Funciones debounce/throttle
│   └── smoothPrediction.js             # Suavizado de predicciones
├── public/
│   ├── model/                          # TFJS model (model.json + weights)
│   ├── labels.json                     # 67 clases
│   └── manual/                         # 67 SVGs (diccionario visual)
├── scripts/
│   └── copy-public.js                  # Post-build: copia public/ → dist/
└── package.json
```

## ⚙️ Configuración avanzada

En **SETTINGS** puedes ajustar:

### Accesibilidad
- ✓ **Texto grande**: Aumenta tamaño de fuente 1.2×
- ✓ **Alto contraste**: Tema blanco/verde fluorescente
- ✓ **Texto a voz**: Anuncia label en es-CL cuando se detecta

### Detección
- **Umbral de confianza** (30-95%): Confianza mínima para aceptar una predicción
- **Estabilidad de predicción** (3-10 frames): Requiere que el mismo label aparezca en N predicciones consecutivas

## 🎨 Personalización de SVGs

El diccionario visual está en `public/manual/`. Cada archivo es un SVG nombrado como su etiqueta:
- Dígitos: `0.svg`, `1.svg`, ... `9.svg`
- Letras: `A.svg`, `B.svg`, ... `Z.svg`
- Frases: `Hola.svg`, `Gracias.svg`, etc.

Puedes reemplazar los placeholders actuales con dibujos o fotos reales de señas.

## 🎤 Soporte de idiomas

- **Texto a voz**: es-CL (español de Chile) con fallback a es-ES
- **Interfaz**: Español
- Fácil de localizar a otros idiomas editando constantes en `App.js` y strings en screens

## 🔍 Notas técnicas

### Normalización de keypoints
Los keypoints de MediaPipe se normalizan a [0, 1] (clamped) en `useMediaPipeDetection.js`. El modelo fue entrenado con esta normalización.

### Suavizado de predicciones
La clase `PredictionSmoother` mantiene un historial de N predicciones recientes y solo acepta un resultado cuando la mayoría está de acuerdo. Reduce ruido y falsos positivos.

### Debouncing de TTS
La síntesis de voz se debounce a 800ms para evitar habla repetida rápidamente.

### Rendimiento
- **FPS objetivo**: ~30 FPS (configurable en `useMediaPipeDetection.js`)
- **Backend**: WebGL (con fallback a WASM si es necesario)
- **Tamaño modelo**: 4.1 MB descargado, ~12 MB descomprimido en memoria

## 🌐 Compatibilidad

| Navegador | Cámara | MediaPipe | TFJS | TTS |
|-----------|--------|-----------|------|-----|
| Chrome    | ✓      | ✓         | ✓    | ✓   |
| Edge      | ✓      | ✓         | ✓    | ✓   |
| Safari    | ✓*     | ✓         | ✓    | ✓   |
| Firefox   | ✓      | ✓         | ✓    | ✓   |

*iOS Safari: Requiere `playsinline` en video y usuario interaction

## 📱 Responsive design

- Optimizado para desktop y tablets
- Móvil: Diseño de 1 columna, botones grandes
- Desktop: Layout flexible con espacios

## 🐛 Troubleshooting

### "Permiso de cámara denegado"
- Asegúrate de estar en HTTPS (o localhost)
- Recarga la página y acepta el permiso
- En Safari iOS, toca primero un botón en la página

### "Modelo no carga"
- Verifica que `public/model/model.json` existe
- Abre la consola (F12) y busca errores de red
- Asegúrate que el servidor sirve los archivos `.bin` con `Content-Type: application/octet-stream`

### "No detecta manos"
- Iluminación adecuada
- Mano completamente visible en cámara
- Intenta ajustar la resolución de cámara en `useMediaPipeDetection.js`

### "Predicciones inestables"
- Aumenta "Estabilidad de predicción" en settings
- Sube el "Umbral de confianza"
- Asegúrate que tienes ≥ 24 frames en el búfer

## 📚 Recursos

- [TensorFlow.js](https://www.tensorflow.org/js)
- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Expo SDK 51](https://docs.expo.dev)

## 📝 Licencia

Proyecto de educación. LSCh es Lengua de Signos Chilena.

## 🤝 Contribuciones

Este es un capstone project. Para mejoras, abre un PR o issue.
