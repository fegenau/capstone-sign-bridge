# 🎯 Real Model Integration Guide - SignBridge TFLite

## 📋 Current Status

Your app is currently running in **simulation mode** because:
- TFLite integration is not yet implemented (line 123 in detectionService.js)
- Model loading throws error: `"Módulo TFLite no implementado - usando simulación"`
- App falls back to random detection generation

## 🎯 Goal: Run Real YOLO TFLite Model

You need to integrate actual TFLite inference to detect real sign language gestures.

---

## 🚀 Option 1: React Native TFLite (RECOMMENDED)

### Best for: Direct on-device inference with your YOLO model

### Step 1: Install TFLite Package
```bash
cd sign-Bridge
npm install react-native-tflite --legacy-peer-deps
npx expo prebuild
```

### Step 2: Place Your Model
```bash
# Copy your trained model to:
sign-Bridge/assets/Modelo/runs/detect/train/weights/best_float16.tflite

# Or if you have best.pt, export it:
```

```python
from ultralytics import YOLO
model = YOLO('best.pt')
model.export(format='tflite', int8=False)
# This creates best_float16.tflite
```

### Step 3: Update detectionService.js

Replace the `loadModel()` function (lines 102-144) with:

```javascript
async loadModel() {
  if (this.isModelLoaded) {
    console.log('⚠️ Modelo ya cargado');
    return;
  }

  try {
    this.modelLoadAttempts++;
    console.log(`🔄 Intentando cargar modelo (intento ${this.modelLoadAttempts})...`);
    
    // Import TFLite module
    const TFLite = require('react-native-tflite');
    
    // Load model from assets
    const modelPath = require('../../assets/Modelo/runs/detect/train/weights/best_float16.tflite');
    
    this.model = await TFLite.loadModel({
      model: modelPath,
      numThreads: 4,
    });
    
    this.isModelLoaded = true;
    console.log('✅ Modelo TFLite cargado exitosamente');
    
    // Notify UI that model is loaded
    this.notifyCallbacks({ modelLoaded: true });
    
  } catch (error) {
    console.error('❌ Error al cargar modelo:', error.message);
    this.isModelLoaded = false;
    console.log('⚠️ Usando modo simulación como fallback');
    this.scheduleModelRetry();
  }
}
```

### Step 4: Update processImageWithModel()

Replace the `processImageWithModel()` function (lines 180-220) with:

```javascript
async processImageWithModel(imageData) {
  if (!this.isModelLoaded || !this.model) {
    throw new Error('Modelo no cargado');
  }

  try {
    // Run inference
    const predictions = await this.model.run(imageData, {
      numResults: 5,      // Top 5 predictions
      threshold: DETECTION_CONFIG.minConfidence,
    });
    
    if (!predictions || predictions.length === 0) {
      return null;
    }
    
    // Get best prediction
    const bestPrediction = predictions[0];
    
    return {
      letter: bestPrediction.label,  // e.g., "A", "B", "1", "2"
      confidence: Math.round(bestPrediction.confidence * 100),
      bbox: bestPrediction.rect,     // Bounding box
    };
    
  } catch (error) {
    console.error('❌ Error en inferencia:', error);
    throw error;
  }
}
```

---

## 🚀 Option 2: TensorFlow.js Lite (Cross-Platform)

### Best for: Web + Mobile compatibility

### Step 1: Install TensorFlow.js
```bash
cd sign-Bridge
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native
npm install @react-native-async-storage/async-storage
npm install expo-gl
```

### Step 2: Update detectionService.js

```javascript
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

// Add to class constructor:
async initializeTensorFlow() {
  try {
    console.log('🔧 Inicializando TensorFlow.js...');
    
    // Wait for TF to be ready
    await tf.ready();
    console.log('✅ TensorFlow.js listo');
    
    this.isTfReady = true;
    await this.loadModel();
    
  } catch (error) {
    console.error('❌ Error al inicializar TensorFlow:', error);
    this.scheduleModelRetry();
  }
}

async loadModel() {
  if (this.isModelLoaded) {
    console.log('⚠️ Modelo ya cargado');
    return;
  }

  try {
    console.log('🔄 Cargando modelo TFLite...');
    
    // Load model from assets
    const modelJson = require('../../assets/Modelo/model.json');
    const modelWeights = require('../../assets/Modelo/weights.bin');
    
    this.model = await tf.loadGraphModel(
      bundleResourceIO(modelJson, modelWeights)
    );
    
    // Warm up the model
    const dummyInput = tf.zeros([1, 640, 640, 3]);
    await this.model.predict(dummyInput);
    dummyInput.dispose();
    
    this.isModelLoaded = true;
    console.log('✅ Modelo cargado exitosamente');
    
    this.notifyCallbacks({ modelLoaded: true });
    
  } catch (error) {
    console.error('❌ Error al cargar modelo:', error.message);
    this.isModelLoaded = false;
    console.log('⚠️ Usando modo simulación');
    this.scheduleModelRetry();
  }
}

async processImageWithModel(imageData) {
  if (!this.isModelLoaded || !this.model) {
    throw new Error('Modelo no cargado');
  }

  try {
    // Convert image to tensor
    const imageTensor = tf.browser.fromPixels(imageData)
      .resizeBilinear([640, 640])
      .expandDims(0)
      .toFloat()
      .div(255.0);
    
    // Run inference
    const predictions = await this.model.predict(imageTensor);
    
    // Process YOLO output
    const [boxes, scores, classes] = predictions;
    const boxesArray = await boxes.data();
    const scoresArray = await scores.data();
    const classesArray = await classes.data();
    
    // Clean up tensors
    imageTensor.dispose();
    boxes.dispose();
    scores.dispose();
    classes.dispose();
    
    // Find best detection
    let bestIdx = -1;
    let bestScore = DETECTION_CONFIG.minConfidence;
    
    for (let i = 0; i < scoresArray.length; i++) {
      if (scoresArray[i] > bestScore) {
        bestScore = scoresArray[i];
        bestIdx = i;
      }
    }
    
    if (bestIdx === -1) {
      return null;
    }
    
    // Map class ID to letter/number
    const classId = classesArray[bestIdx];
    const label = this.getClassLabel(classId);
    
    return {
      letter: label,
      confidence: Math.round(bestScore * 100),
      bbox: [
        boxesArray[bestIdx * 4],
        boxesArray[bestIdx * 4 + 1],
        boxesArray[bestIdx * 4 + 2],
        boxesArray[bestIdx * 4 + 3],
      ],
    };
    
  } catch (error) {
    console.error('❌ Error en inferencia:', error);
    throw error;
  }
}

getClassLabel(classId) {
  // Map YOLO class IDs to letters/numbers
  // Adjust based on your model's training
  const allSymbols = [...ALPHABET, ...NUMBERS];
  return allSymbols[classId] || 'Unknown';
}
```

---

## 🚀 Option 3: External API Backend (Python/Flask)

### Best for: Complex models, cloud inference, easy testing

This is already documented in `BACKEND_API_GUIDE.md`, but here's a quick update:

### Update detectionService.js to use API:

```javascript
const API_URL = 'https://your-api.com/detect'; // Or http://localhost:5000/detect

async processImageWithModel(imageData) {
  try {
    // Convert image to base64
    const base64Image = await this.imageToBase64(imageData);
    
    // Send to API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        confidence: DETECTION_CONFIG.minConfidence,
      }),
    });
    
    const result = await response.json();
    
    if (!result.success || result.detections.length === 0) {
      return null;
    }
    
    const detection = result.detections[0];
    
    return {
      letter: detection.className,
      confidence: Math.round(detection.confidence * 100),
      bbox: detection.bbox,
    };
    
  } catch (error) {
    console.error('❌ Error en API:', error);
    throw error;
  }
}

async imageToBase64(imageData) {
  // Implementation depends on image format
  // Use FileSystem.readAsStringAsync or similar
  return base64String;
}
```

---

## 📊 Comparison of Options

| Method | Pros | Cons | Difficulty |
|--------|------|------|------------|
| **TFLite Native** | Fast, offline, native | Requires rebuild | ⭐⭐⭐ Medium |
| **TensorFlow.js** | Cross-platform, flexible | Slower, larger | ⭐⭐⭐⭐ Hard |
| **API Backend** | Easy testing, powerful | Needs internet, latency | ⭐⭐ Easy |

---

## 🎯 Recommended Approach

### For Quick Testing:
1. **Use API Backend** (Option 3) - Deploy Flask API from `BACKEND_API_GUIDE.md`
2. Test with real detections
3. Iterate quickly

### For Production:
1. **Use TFLite Native** (Option 1) - Best performance
2. Fallback to API if model fails
3. Keep simulation as last resort

---

## 📝 Step-by-Step Implementation Plan

### Phase 1: Get Model Working (1-2 hours)
```bash
# 1. Export your model to TFLite
python export_model.py  # See BACKEND_API_GUIDE.md

# 2. Place in assets folder
cp best_float16.tflite sign-Bridge/assets/Modelo/runs/detect/train/weights/

# 3. Test model locally first
python test_model.py
```

### Phase 2: Choose Integration Method (2-4 hours)

**Quick Testing (API):**
```bash
# Deploy Flask API
cd backend
python server.py

# Update detectionService.js with API URL
# Test in app
```

**Production (TFLite):**
```bash
# Install package
npm install react-native-tflite

# Update detectionService.js
# Rebuild app
npx expo prebuild
```

### Phase 3: Test & Verify (1-2 hours)
```bash
# Test real detections
npm start

# Verify:
# - Model loads successfully
# - Real detections appear
# - Confidence scores are realistic
# - No crashes
```

---

## 🔧 Debug Checklist

If model doesn't load:
- [ ] Model file exists at correct path
- [ ] Model file is not corrupted (check size > 0)
- [ ] TFLite/TensorFlow.js installed correctly
- [ ] Expo rebuild done if using native modules
- [ ] Permissions granted for file access

If detections are wrong:
- [ ] Input image size matches training (640x640 for YOLO)
- [ ] Class IDs mapped correctly to letters/numbers
- [ ] Confidence threshold not too high
- [ ] Model exported correctly from training

---

## 📱 Testing Real Model

### Test Sequence:
1. **Load test**: Does model load without errors?
2. **Inference test**: Does it return predictions?
3. **Accuracy test**: Are predictions correct?
4. **Performance test**: Is FPS acceptable (>10 FPS)?

### Expected Console Output:
```
🔧 Inicializando sistema de detección...
🔄 Intentando cargar modelo (intento 1)...
✅ Modelo TFLite cargado exitosamente
🎯 Detectando...
✓ Detección: A (confianza: 87%)
```

---

## 🎉 Success Criteria

Model integration is complete when:
- ✅ Model loads on app startup
- ✅ Real-time detections from camera
- ✅ Confidence scores 70%+
- ✅ UI shows "TFLite ✓" (not "Simulación")
- ✅ Detection latency < 200ms
- ✅ No crashes or memory leaks

---

## 📞 Need Help?

**Model Export**: See `BACKEND_API_GUIDE.md`  
**TFLite Issues**: Check Expo docs for native modules  
**API Setup**: Use Python Flask backend guide  

**Quick Win**: Start with API backend - easiest to test!

---

**Current Status**: 🟡 Simulation Mode  
**Target Status**: 🟢 Real TFLite Inference  
**Estimated Time**: 3-6 hours total
