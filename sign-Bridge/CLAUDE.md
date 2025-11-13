# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SignBridge is an Expo-based mobile/web application for learning Chilean Sign Language (LSCh). It uses TensorFlow.js for sign detection with an architecture designed to integrate MediaPipe for hand/body pose detection.

## Common Development Commands

```bash
# Install dependencies
npm install

# Start development server (web)
npm start
# or: npx expo start --web

# Build for web production
npm run build

# Run tests
npm test

# Eject from Expo (destructive - creates Android/iOS native projects)
npm run eject
```

## Architecture

### Directory Structure

- **screens/** - Main app screens (HomeScreen, AlphabetDetectionScreen, WordDetectionScreen, etc.)
- **components/** - Reusable UI components
  - `camera/DetectionOverlay.js` - Renders detected results with confidence indicator
  - `detection/` - Result display components (DetectionResultCard, DetectionHistory, AudioButton)
  - `common/` - Grid components (AlphabetGrid, NumberGrid)
- **utils/services/** - Core business logic
  - `tensorflowInit.js` - TensorFlow.js initialization and backend setup
  - `detectionService.js` - Simulated detection for alphabet learning
  - `wordDetectionService.js` - Real TensorFlow.js detection pipeline
- **assets/model/** - ML models
  - `tfjs_model/` - TensorFlow.js format (model.json + model.weights.bin)
  - `labels.json` - Class labels for predictions
- **utils/constants/** - Configuration and constants

### Key Technology Stack

- **React Native + Expo** - Cross-platform framework (Web, iOS, Android)
- **TensorFlow.js 4.22.0** - ML inference (WebGL backend)
- **React Navigation** - Stack-based navigation
- **expo-camera** - Camera access
- **expo-speech** - Text-to-speech for learned words
- **@expo/vector-icons** - Icon library

### Detection Pipeline Architecture

#### Detection Service Pattern

Both detection services use a callback-based event system:

```javascript
// Registration
detectionService.onDetection((result) => {
  // result = { letter/word, confidence, timestamp, ... }
})

// Start/Stop
detectionService.startDetection()
detectionService.stopDetection()

// Notify subscribers
notifyCallbacks(data)  // Called internally on new detections
```

#### Alphabet Detection (Simulated)

**File:** `utils/services/detectionService.js`

- Simulates detection every 2 seconds with random letters and confidence (30-100%)
- Used for learning the alphabet without live pose detection
- No ML model involved - purely for UI testing

#### Word Detection (TensorFlow.js)

**File:** `utils/services/wordDetectionService.js`

**Model Configuration:**
- Input shape: `[1, 24, 126]` - 24 sequential frames, 126 keypoint dimensions (21 joints × 3 axes × 2 hands)
- Labels: Numbers (0-9), Letters (A-Z), and LSCh words/directions
- Smoothing buffer: 5-frame window with majority voting (60% threshold)
- Confidence threshold: 50% minimum

**Loading Model:**
```javascript
// wordDetectionService.loadModel()
// 1. Initializes TensorFlow.js backend
// 2. Loads labels from assets/model/labels.json
// 3. Loads TensorFlow.js model from assets/model/tfjs_model/model.json + .weights.bin
// 4. Runs warm-up inference to optimize execution
```

**Detection Flow:**
```
Input: Keypoints sequence (from external source like MediaPipe - NOT YET INTEGRATED)
  ↓
detectFromKeypoints(keypointsSequence)
  ├─ Validate sequence shape
  ├─ Normalize & pad to [1, 24, 126]
  ├─ Create tf.tensor3d
  ├─ Run model.predict()
  ├─ Apply smoothing buffer & voting
  ├─ Dispose tensors (memory management)
  └─ Notify callbacks if valid (confidence > 50%, stability > 60%)
```

**Memory Management:**
- Uses `tf.dispose()` to clean up tensors after each inference
- Monitors peak memory usage in metrics

### Current Integration Status

- ✅ TensorFlow.js configured with WebGL backend
- ✅ Model loading and inference pipeline implemented
- ✅ Smoothing and confidence filtering working
- ⏳ MediaPipe integration: **NOT YET IMPLEMENTED** - Code is prepared to receive keypoint sequences but MediaPipe pose/hand detection is not connected

### UI Components

#### DetectionOverlay (components/camera/DetectionOverlay.js)

Renders detected result in upper-right corner of camera view:
- Shows detected letter/word in large text (48px)
- Color-coded confidence indicator (green ≥70%, yellow ≥50%, red <50%)
- Loading state shows animated scan icon or hand icon
- Positioned absolutely, doesn't block camera interactions

#### DetectionResultCard (components/detection/DetectionResultCard.js)

Card-style result display with:
- Word/letter centered
- Confidence percentage and visual bar
- Conditional rendering based on `isProcessing` state

#### DetectionHistory (components/detection/DetectionHistory.js)

Scrollable list of previous detections with:
- Most recent at top
- Confidence-color-coded items
- Progress bars showing confidence strength

#### AudioButton (components/detection/AudioButton.js)

Text-to-speech button:
- Uses `expo-speech` API
- Language: Spanish (Chile) locale
- Reads detected word aloud

### Navigation Structure

**Main Stack (App.js):**
- SplashScreen → HomeScreen
- HomeScreen → AlphabetDetectionScreen
- HomeScreen → NumberDetectionScreen
- HomeScreen → WordDetectionScreen (under development)
- HomeScreen → DictionaryScreen
- HomeScreen → SettingsScreen

**Theme:** Dark theme with neon green (#00FF88) accent color

### Model Assets

- **model.json** - TensorFlow.js model architecture
- **model.weights.bin** - Model weights (binary format, size varies)
- **labels.json** - Class label mapping (0-indexed)

Model must be in `assets/model/tfjs_model/` directory for proper loading via `Asset.fromModule()`.

### Important Notes

1. **Web vs Native**: Currently optimized for web with `expo start --web`. Native support (Android/iOS) requires additional setup for camera permissions and model loading.

2. **TensorFlow Backend**: WebGL backend is configured in `tensorflowInit.js`. React Native may use CPU backend instead.

3. **Memory Leaks**: Always call `tf.dispose()` on tensors after use. WordDetectionService handles this automatically.

4. **Error Handling**: Detection services use callback pattern - errors should be passed via callbacks rather than throwing.

5. **Model Training**: The `.keras` model in assets is the original trained model. Conversion to TensorFlow.js format requires TensorFlow.js converter tool.

6. **Permissions**: Camera and microphone permissions are declared in `app.json`. iOS requires `NSCameraUsageDescription` in infoPlist.

### Debugging

Enable debug mode in WordDetectionService:
```javascript
wordDetectionService.debugMode = true  // Logs inference times and metrics
```

Access metrics:
```javascript
const metrics = wordDetectionService.getMetrics()
// {
//   totalInferences, averageInferenceTime, peakMemory,
//   detectionsMade, lastInferenceTime
// }
```

### Future Work / Known Limitations

- MediaPipe integration not yet implemented (architecture ready)
- Native mobile support requires platform-specific model loading
- Currently no real-time keypoint capture from camera
