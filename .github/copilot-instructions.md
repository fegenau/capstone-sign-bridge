# SignBridge - AI Coding Agent Instructions

## Project Overview
**SignBridge** is a React Native + Expo mobile app for learning Chilean Sign Language (Lengua de Señas Chilena) through real-time gesture detection. It uses a YOLO TFLite model to recognize alphabet (A-Z) and numbers (0-9) via the device camera, with an intelligent fallback system that simulates detections when the ML model is unavailable.

**⚠️ CRITICAL**: The app is currently in **simulation mode**. Real TFLite model integration is pending (see `REAL_MODEL_INTEGRATION.md`). The detection service (detectionService.js) has infrastructure ready but needs actual model inference implementation.

## Critical Architecture Patterns

### 1. Dual-Mode Detection System
The app operates in two modes with automatic fallback:
- **TFLite Mode**: Uses YOLO model at `assets/Modelo/runs/detect/train/weights/best_float16.tflite`
- **Simulation Mode**: Generates random detections when model unavailable

**Key Implementation** (`utils/services/detectionService.js`):
```javascript
// Singleton pattern - ALWAYS use the exported instance
export const detectionService = new DetectionService();

// Auto-retry logic: attempts to load model every 10 seconds
scheduleModelRetry() {
  this.modelRetryTimer = setInterval(() => {
    this.loadModel();
  }, DETECTION_CONFIG.modelRetryInterval);
}
```

**Critical**: Never instantiate `DetectionService` directly. Always import and use `detectionService` singleton.

### 2. Detection Debouncing Pattern
To prevent rapid-fire duplicate detections, the service implements 1.5s debouncing:
```javascript
// In detectionService.js
const timeSinceLastDetection = Date.now() - this.lastDetectionTime;
if (timeSinceLastDetection < DETECTION_CONFIG.detectionInterval) {
  return; // Ignore detection within debounce window
}
```

### 3. Camera Reference Pattern
The detection service requires direct camera access. Pass `cameraRef` from screen components:
```javascript
// In AlphabetDetectionScreen.js
const cameraRef = useRef(null);
await detectionService.startDetection(cameraRef);

// Camera component must have ref
<CameraView ref={cameraRef} ... />
```

## Project Structure

### Core Directories
- `sign-Bridge/`: Main app (Expo project)
  - `screens/`: Full-screen components (HomeScreen, AlphabetDetectionScreen, SettingsScreen)
  - `components/`: Reusable UI (DetectionOverlay, AlphabetGrid)
  - `utils/services/`: Business logic (detectionService - the ML detection singleton)
  - `utils/constants/`: Static data (ALPHABET, NUMBERS, navigation constants)
  - `assets/Modelo/`: YOLO TFLite model location

### Navigation Structure
Uses React Navigation Stack:
- `Splash` → `Home` → `AlphabetDetection` or `Settings`
- Dark theme with neon green accent (`#00FF88`)

## Development Workflow

### Running the App
```bash
cd sign-Bridge
npm install
npm start  # Expo CLI - scan QR with Expo Go app
```

### Key Commands
- `npm start`: Start Expo dev server
- `npm run android`: Open in Android emulator
- `npm run ios`: Open in iOS simulator (macOS only)
- `npx expo install --fix`: Fix dependency version mismatches

### Testing Without Model
The app is designed to work without the TFLite model file. It will automatically:
1. Attempt to load model on startup
2. Fall back to simulation mode if model missing
3. Retry loading every 10 seconds
4. Display "Simulación" badge in UI when using fallback

## Critical Configuration

### Detection Parameters (detectionService.js)
```javascript
const DETECTION_CONFIG = {
  minConfidence: 0.7,        // 70% threshold for valid detections
  detectionInterval: 1500,   // 1.5s debounce between detections
  modelRetryInterval: 10000, // Retry model load every 10s
  processingTime: 800,       // Simulated processing delay (ms)
};
```

### Supported Symbols
- **Alphabet**: A-Z (26 letters)
- **Numbers**: 0-9 (10 digits)
- Total: 36 detectable symbols
- Defined in: `utils/services/detectionService.js` (ALPHABET, NUMBERS arrays)

## UI Conventions

### Status Indicators (AlphabetDetectionScreen)
Four key status displays:
1. **Model Status**: "TFLite ✓" (green) or "Simulación 🔄" (orange)
2. **Detection State**: "Activa ✓" or "Inactiva"
3. **Processing**: "Procesando..." during frame analysis
4. **Confidence Bar**: Visual 0-100% indicator

### Symbol Grid Styling
- **Letters**: Gray background (`#4A4A4A`)
- **Numbers**: Blue background (`#4A90E2`)
- **Detected**: Neon green highlight (`#00FF88`)
- Horizontal scroll for all 36 symbols

## Common Tasks

### Adding New Symbols
1. Update `ALPHABET` or `NUMBERS` array in `detectionService.js`
2. Ensure model training includes new classes
3. Update `AlphabetDetectionScreen.js` symbol grid rendering

### Modifying Detection Parameters
Edit `DETECTION_CONFIG` in `detectionService.js`:
- `minConfidence`: Increase for stricter detection (0.0-1.0)
- `detectionInterval`: Change debounce timing (ms)
- Don't change during active detection loop

### Integrating Real Model (REQUIRED FOR PRODUCTION)
**Current Status**: App runs in simulation mode - random detections generated

**Integration Options** (see `REAL_MODEL_INTEGRATION.md` for details):

1. **TFLite Native** (Recommended for production):
   - Install: `npm install react-native-tflite`
   - Place model: `assets/Modelo/runs/detect/train/weights/best_float16.tflite`
   - Update `loadModel()` in detectionService.js (lines 102-144)
   - Update `processImageWithModel()` (lines 180-220)
   - Rebuild: `npx expo prebuild`

2. **TensorFlow.js** (Cross-platform):
   - Install: `@tensorflow/tfjs @tensorflow/tfjs-react-native`
   - Convert model to TFLite format
   - Implement inference in detectionService.js

3. **API Backend** (Quick testing):
   - Deploy Flask API from `BACKEND_API_GUIDE.md`
   - Update detectionService.js to call API endpoint
   - No native dependencies needed

**Key Files to Modify**:
- `detectionService.js`: Lines 102-144 (loadModel), Lines 180-220 (processImageWithModel)
- Current state: Throws "Módulo TFLite no implementado" and falls back to simulation

## Integration Points

### Backend API (Optional)
If using external inference server:
- **Endpoint**: `POST /detect` (receives base64 image)
- **Response**: `{ success: bool, detections: [{className, confidence, bbox}] }`
- Configure API URL in detectionService.js
- See `BACKEND_API_GUIDE.md` for Flask implementation

### Camera Permissions
Handled by Expo Camera. No manual configuration needed:
```javascript
const [permission, requestPermission] = useCameraPermissions();
if (!permission?.granted) await requestPermission();
```

## Debugging Tips

### Detection Not Working
1. Check console: "🔧 Inicializando sistema..." should appear
2. Verify `isModelLoaded` state in detectionService
3. Confirm camera ref is passed: `cameraRef.current !== null`
4. Check debounce: detections ignored within 1.5s window

### Model Loading Failures
- Expected behavior when `.tflite` file missing
- Should see "❌ Error al cargar modelo" in console
- App continues with simulation mode
- Verify file path: `assets/Modelo/runs/detect/train/weights/best_float16.tflite`

### Performance Issues
- Reduce `detectionInterval` if too slow (default 1500ms)
- Check frame capture in `captureFrame()` - may timeout
- Verify camera resolution not exceeding device capabilities

## Documentation Reference
- `ARCHITECTURE.md`: Detailed system diagrams and data flows
- `MODEL_INTEGRATION.md`: TFLite integration technical details
- `QUICK_START.md`: 3-step setup guide
- `BACKEND_API_GUIDE.md`: Python/Flask inference server setup
- `INTEGRATION_COMPLETE.md`: Implementation changelog

## Code Style
- **Components**: Functional with hooks (useState, useEffect, useRef)
- **Services**: Singleton classes with event callbacks
- **Constants**: Uppercase with underscores (DETECTION_CONFIG)
- **Files**: camelCase for JS, PascalCase for components
- Dark theme: Background `#000000`, accents `#00FF88` (neon green)

## Spanish Language Note
Primary documentation and UI text in Spanish (Chilean audience). Code comments and variable names use English conventions.
