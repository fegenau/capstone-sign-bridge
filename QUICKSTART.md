# 🚀 Quick Start - SignBridge Development

## 📋 Prerequisites Setup

### 1. Install Python (One-time setup)
```powershell
# Download from: https://www.python.org/downloads/
# ✅ MUST check "Add Python to PATH" during installation
# After install, verify:
python --version
pip --version
```

### 2. Install Python Packages (One-time setup)
```powershell
python -m pip install --upgrade pip
python -m pip install tensorflow tensorflowjs
```

### 3. Install Node.js Dependencies (One-time setup)
```powershell
cd sign-Bridge
npm install --legacy-peer-deps
```

---

## 🎯 Daily Development Commands

### Start Development Server
```powershell
cd C:\Users\SEED\Documents\GitHub\capstone-sign-bridge\sign-Bridge
npx expo start
```

Then press:
- **`w`** - Open in web browser
- **`a`** - Open in Android emulator (if installed)
- **`r`** - Reload app
- **`Ctrl+C`** - Stop server

---

## 📱 Testing Options

### Option 1: Web (Fastest for UI testing)
```powershell
npx expo start
# Press 'w'
```
⚠️ Camera features won't work on web

### Option 2: Physical Device (Best for camera testing)
1. Install **Expo Go** app from Play Store/App Store
2. Run `npx expo start`
3. Scan QR code with Expo Go (Android) or Camera (iOS)

### Option 3: Android Emulator
1. Install Android Studio
2. Create virtual device
3. Start emulator
4. Run `npx expo start` and press `a`

---

## 🔄 Model Conversion Workflow

### Current Status
- ✅ TFLite models exist in `Modelo/` folder
- ✅ Placeholder TFJS models in `sign-Bridge/assets/models/`
- ⚠️ Need conversion for real detection

### Convert Models (When Python is installed)
```powershell
cd C:\Users\SEED\Documents\GitHub\capstone-sign-bridge
python convert_models.py
```

---

## 🐛 Common Issues & Fixes

### "pip is not recognized"
```powershell
# Solution: Install Python with "Add to PATH" checked
# Or use:
python -m pip install [package]
```

### "Cannot find module 'react'"
```powershell
cd sign-Bridge
npm install --legacy-peer-deps
```

### "Backend name 'webgl' not found"
- ✅ Already fixed in code
- App will use CPU backend on devices without WebGL

### Expo won't start
```powershell
# Clear cache and reinstall
cd sign-Bridge
rm -r node_modules
npm install --legacy-peer-deps
npx expo start --clear
```

---

## 📂 Project Structure

```
capstone-sign-bridge/
├── Modelo/                          # Original ML models
│   ├── best_float32.tflite         # Main model
│   └── yolov8n.pt                  # YOLOv8 weights
├── sign-Bridge/                     # React Native app
│   ├── assets/models/              # TFJS models (for app)
│   │   ├── numbers/
│   │   ├── alphabet/
│   │   └── gestures/
│   ├── App.tsx                     # Main app file
│   └── package.json
├── convert_models.py               # Model conversion script
└── PYTHON_SETUP.md                 # Detailed Python guide
```

---

## 🎓 Learning Resources

- **Expo Docs:** https://docs.expo.dev/
- **TensorFlow.js:** https://www.tensorflow.org/js
- **React Native:** https://reactnative.dev/

---

## 💡 Next Steps

1. ✅ Install Python (see PYTHON_SETUP.md)
2. ✅ Verify app runs: `cd sign-Bridge; npx expo start`
3. ⏳ Convert models (optional for now)
4. 📱 Test on physical device
5. 🎨 Continue building features

---

**Need Help?** Check PYTHON_SETUP.md for detailed instructions!
