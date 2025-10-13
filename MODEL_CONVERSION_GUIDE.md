# 🎯 Converting Your YOLOv8 Model to TensorFlow.js

## Quick Overview

Your model: `Modelo/yolov8n.pt` (YOLOv8 trained on Chilean Sign Language)
- **27 classes**: A-Z alphabet + EYE
- **Format needed**: TensorFlow.js (for React Native)
- **Current format**: PyTorch (.pt) and TFLite (.tflite)

---

## 🚀 Step-by-Step Conversion

### Step 1: Install Python (if not done)

1. Download Python 3.11 from https://www.python.org/downloads/
2. ✅ **MUST CHECK:** "Add Python to PATH" during installation
3. Restart your computer
4. Verify:
```powershell
python --version
pip --version
```

### Step 2: Install Required Packages

```powershell
# Navigate to project root
cd C:\Users\SEED\Documents\GitHub\capstone-sign-bridge

# Install conversion tools
python -m pip install --upgrade pip
python -m pip install ultralytics tensorflowjs tensorflow onnx
```

This will take 5-10 minutes (downloading ~2GB of packages).

### Step 3: Run the Conversion Script

```powershell
# Make sure you're in project root
cd C:\Users\SEED\Documents\GitHub\capstone-sign-bridge

# Run the export script
python export_yolo_to_tfjs.py
```

**What the script does:**
1. Loads your `yolov8n.pt` model
2. Exports to TensorFlow SavedModel format
3. Converts SavedModel to TensorFlow.js format
4. Saves files to `sign-Bridge/assets/models/alphabet/`

**Expected output:**
```
Converting: Modelo/yolov8n.pt
✅ Exported to TensorFlow SavedModel
✅ Converted to TensorFlow.js
✅ Saved to: sign-Bridge/assets/models/alphabet/
```

### Step 4: Update App Configuration

After conversion, the model files will be in:
```
sign-Bridge/assets/models/alphabet/
├── model.json          (← Model architecture)
├── group1-shard1of1.bin (← Model weights)
└── ...
```

**No code changes needed!** The app is already configured to load these files.

---

## 🎨 Update Model Labels

Your model has these 27 classes:
```
A, B, C, D, E, EYE, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z
```

The app's `MODEL_CONFIG.alphabet.labels` already has the alphabet. You just need to add 'EYE'.

---

## ⚠️ Troubleshooting

### "ultralytics not found"
```powershell
python -m pip install ultralytics
```

### "No module named 'tensorflowjs'"
```powershell
python -m pip install tensorflowjs
```

### "CUDA errors" or "GPU not found"
- This is OK! Conversion will use CPU (slower but works)
- Conversion takes 2-5 minutes on CPU

### "Model file not found"
- Check that `Modelo/yolov8n.pt` exists
- Run `ls Modelo` to see available files

### Conversion takes too long
- Be patient, first-time conversion downloads dependencies
- Can take 10-15 minutes on slow internet

---

## 🔍 Alternative: Check Model Details First

If you want to analyze your model before converting:

```powershell
python -c "from ultralytics import YOLO; model = YOLO('Modelo/yolov8n.pt'); print(model.names)"
```

This shows all 27 class names your model was trained on.

---

## 📱 After Conversion - Testing

### Step 1: Restart Expo
```powershell
cd sign-Bridge
npx expo start --clear
```

### Step 2: Test on Device
- Press `a` for Android emulator
- Or scan QR with Expo Go app

### Step 3: Watch Console
The app will log:
```
✅ Modelo Alfabeto cargado
   Input shape: [1, 640, 640, 3]
   Output shape: [1, 27]
```

---

## 🎯 Expected Behavior

After successful conversion:
- ✅ App loads without errors
- ✅ Camera shows on mobile devices
- ✅ Model makes predictions when you show sign language
- ✅ Confidence scores display (85%+ for good detections)

---

## 🚨 If Conversion Fails

**Plan B: Use Online Colab**

I can provide a Google Colab notebook that:
1. Runs in your browser (free)
2. Has all dependencies pre-installed
3. Converts your model
4. Downloads the TFJS files

Let me know if you need this option!

---

## 📊 Quick Reference

| Command | Purpose |
|---------|---------|
| `python --version` | Check Python installation |
| `pip list` | See installed packages |
| `python export_yolo_to_tfjs.py` | Convert model |
| `npx expo start` | Run app |

---

**Ready?** Run this command to start:

```powershell
cd C:\Users\SEED\Documents\GitHub\capstone-sign-bridge
python export_yolo_to_tfjs.py
```

Good luck! 🚀
