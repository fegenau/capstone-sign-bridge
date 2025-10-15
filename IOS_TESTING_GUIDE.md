# 🍎 iOS Testing Guide for SignBridge

**Last Updated**: October 14, 2025  
**App**: SignBridge - Chilean Sign Language Detection  
**Model**: YOLO TFLite (5.96 MB)

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Download iOS Build](#download-ios-build)
3. [Install on Simulator](#install-on-simulator)
4. [Install on Real Device](#install-on-real-device)
5. [Testing the App](#testing-the-app)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Prerequisites

### Required:
- **macOS**: 12.0 (Monterey) or later
- **Xcode**: 14.0 or later
- **Command Line Tools**: `xcode-select --install`
- **Node.js**: 18.x or later

### Optional:
- **Apple Developer Account** (for real device testing)
- **TestFlight** (for distribution)
- **Physical iOS device** (iPhone/iPad with iOS 13+)

---

## 📥 Download iOS Build

### Option 1: From GitHub Actions

1. **Go to Actions tab**:
   ```
   https://github.com/fegenau/capstone-sign-bridge/actions
   ```

2. **Select latest workflow**:
   - Click on "Build & Test Real Model - Android & iOS"
   - Choose the most recent successful run

3. **Download artifact**:
   - Scroll to "Artifacts" section
   - Download: `signbridge-ios-{commit-sha}`
   - File: `SignBridge-Simulator.app.zip`

### Option 2: From GitHub Releases

1. **Go to Releases**:
   ```
   https://github.com/fegenau/capstone-sign-bridge/releases
   ```

2. **Download latest release**:
   - Click on latest version
   - Download: `SignBridge-Simulator.app.zip`

### Option 3: Build Locally

```bash
cd sign-Bridge

# Install dependencies
npm ci --legacy-peer-deps

# Validate model
npm run validate-model

# Prebuild for iOS
npx expo prebuild --platform ios --clean

# Install CocoaPods dependencies
cd ios
pod install

# Build for simulator
xcodebuild -workspace SignBridge.xcworkspace \
  -scheme SignBridge \
  -configuration Release \
  -sdk iphonesimulator \
  -derivedDataPath build \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO

# App will be at: ios/build/Build/Products/Release-iphonesimulator/SignBridge.app
```

---

## 📱 Install on Simulator

### Step 1: List Available Simulators

```bash
xcrun simctl list devices available
```

**Expected output**:
```
-- iOS 17.0 --
    iPhone 15 (12345678-1234-1234-1234-123456789012)
    iPhone 15 Pro (87654321-4321-4321-4321-210987654321)
    iPad Air (11th generation) (...)
```

### Step 2: Boot Simulator

```bash
# Boot iPhone 15 (or any device you prefer)
xcrun simctl boot "iPhone 15"

# Or boot by UDID
xcrun simctl boot 12345678-1234-1234-1234-123456789012
```

**Verify simulator is running**:
```bash
xcrun simctl list devices | grep Booted
```

### Step 3: Extract App Bundle

```bash
# Unzip the downloaded file
unzip SignBridge-Simulator.app.zip

# Or if built locally, it's already at:
# sign-Bridge/ios/build/Build/Products/Release-iphonesimulator/SignBridge.app
```

### Step 4: Install App on Simulator

```bash
# Install the app
xcrun simctl install booted SignBridge.app

# Or specify by path
xcrun simctl install booted /path/to/SignBridge.app
```

**Expected output**:
```
✅ App installed successfully
```

### Step 5: Launch App

```bash
# Launch by bundle identifier
xcrun simctl launch booted com.signbridge.app
```

**Expected output**:
```
com.signbridge.app: 12345
```

### Step 6: Open Simulator UI

```bash
# Open Simulator app
open -a Simulator
```

Or launch from Xcode:
- **Xcode** → **Open Developer Tool** → **Simulator**

---

## 📲 Install on Real Device

### Method 1: TestFlight (Recommended for Distribution)

**Requirements**:
- Apple Developer Program membership ($99/year)
- App uploaded to App Store Connect
- TestFlight configured

**Steps**:
1. Build with EAS Build (includes provisioning)
2. Submit to App Store Connect
3. Invite testers via TestFlight
4. Testers install via TestFlight app

### Method 2: Direct Install via Xcode (For Testing)

**Requirements**:
- Apple ID (free)
- Physical device connected via USB
- Xcode installed

**Steps**:

1. **Connect device**:
   ```bash
   # Check device is connected
   xcrun xctrace list devices
   ```

2. **Open Xcode project**:
   ```bash
   cd sign-Bridge/ios
   open SignBridge.xcworkspace
   ```

3. **Configure signing**:
   - Select `SignBridge` project
   - Select `SignBridge` target
   - Go to **Signing & Capabilities** tab
   - Check "Automatically manage signing"
   - Select your **Team** (Apple ID)

4. **Select device**:
   - At top of Xcode: `SignBridge > [Your Device Name]`

5. **Build and run**:
   - Press **⌘R** or click **Play** button
   - Xcode will build, sign, and install on device

6. **Trust developer**:
   - On device: **Settings** → **General** → **VPN & Device Management**
   - Tap your Apple ID
   - Tap **Trust "[Your Name]"**

7. **Launch app**:
   - App icon should appear on home screen
   - Tap to launch

### Method 3: Build IPA and Install via Apple Configurator

**For advanced users**:

```bash
# Build IPA
cd sign-Bridge
eas build --platform ios --profile production

# Download IPA from Expo dashboard
# Install with Apple Configurator 2 or iTunes
```

---

## 🧪 Testing the App

### Initial Launch

1. **Open SignBridge** from home screen or simulator

2. **Grant permissions**:
   - Camera: **Allow**
   - Notifications (optional): **Allow** or **Don't Allow**

3. **Check initial screen**:
   - Should see splash screen
   - Transition to home screen

### Test Model Loading

1. **Navigate to detection screen**
   - Tap "Start Detection" or similar button

2. **Check status indicator**:
   - **Expected**: "TFLite ✓" (green badge)
   - **If seeing**: "Simulación 🔄" (orange badge) = Model not loaded

3. **Check console logs** (if running from Xcode):
   ```
   ✅ Expected:
   🔧 Inicializando sistema de detección...
   🔄 Intentando cargar modelo (intento 1)...
   📦 Modelo localizado en: /path/to/model
   ✅ Modelo TFLite cargado exitosamente
   
   ❌ Problem:
   ⚠️ Archivo del modelo es inválido
   ⚠️ Usando modo simulación como fallback
   ```

### Test Camera

1. **Camera permission**:
   - Should show camera viewfinder
   - On simulator: May show black screen (no camera)
   - On real device: Should show live camera

2. **Simulator camera**:
   ```bash
   # Take photo from camera roll (simulator only)
   xcrun simctl addmedia booted ~/path/to/test-image.jpg
   ```

3. **Real device camera**:
   - Point at sign language gesture
   - Should see detection overlay

### Test Detection

1. **Point camera at sign language**:
   - Use hand gesture for letter (A-Z) or number (0-9)
   - Hold steady for 1-2 seconds

2. **Expected behavior**:
   - Detection overlay appears
   - Letter/number detected with confidence %
   - Debounce: 1.5s between detections
   - Confidence threshold: 70% minimum

3. **UI indicators**:
   - **Processing**: "Procesando..." animation
   - **Detected**: Letter highlights in grid
   - **Confidence bar**: Visual percentage (0-100%)

### Test Performance

1. **Frame rate**:
   - Should be smooth (30+ FPS)
   - Slight lag acceptable during detection

2. **Detection speed**:
   - Inference: 200-500ms per frame
   - Debounce: 1.5s between detections

3. **Memory usage**:
   - Check in Xcode: **Debug Navigator** → **Memory**
   - Should be < 200 MB

### Test Edge Cases

1. **Poor lighting**:
   - Should still detect (may be lower confidence)

2. **Multiple hands**:
   - Should detect most prominent gesture

3. **Non-gestures**:
   - Should show no detection or low confidence

4. **Rapid gestures**:
   - Debouncing should prevent spam

---

## 🐛 Troubleshooting

### App Doesn't Install

**Problem**: `xcrun simctl install` fails

**Solutions**:
```bash
# 1. Check simulator is booted
xcrun simctl list devices | grep Booted

# 2. Boot simulator if not running
xcrun simctl boot "iPhone 15"

# 3. Verify app bundle exists
ls -la SignBridge.app

# 4. Try erasing and reinstalling
xcrun simctl uninstall booted com.signbridge.app
xcrun simctl install booted SignBridge.app
```

### App Crashes on Launch

**Problem**: App opens then immediately closes

**Solutions**:

1. **Check console logs**:
   ```bash
   # View simulator logs
   xcrun simctl spawn booted log stream --predicate 'process == "SignBridge"'
   ```

2. **Check crash logs**:
   ```bash
   # macOS location
   ~/Library/Logs/DiagnosticReports/SignBridge*.crash
   ```

3. **Common causes**:
   - Missing permissions in Info.plist
   - Model file not bundled
   - Incompatible iOS version

### Model Doesn't Load

**Problem**: Shows "Simulación 🔄" instead of "TFLite ✓"

**Solutions**:

1. **Verify model in bundle**:
   ```bash
   # Check app contents
   unzip -l SignBridge-Simulator.app.zip | grep -i tflite
   
   # Should show:
   # assets/Modelo/runs/detect/train/weights/best_float16.tflite
   ```

2. **Check model size**:
   ```bash
   # Should be 5.96 MB, not 247 bytes
   ls -lh SignBridge.app/assets/Modelo/.../best_float16.tflite
   ```

3. **Rebuild with model**:
   ```bash
   cd sign-Bridge
   npm run validate-model  # Should pass
   npx expo prebuild --platform ios --clean
   ```

### Camera Not Working

**Problem**: Black screen or no camera access

**Solutions**:

1. **On Simulator**:
   - Simulators don't have real cameras
   - Use pre-recorded video or images
   - Test on real device for camera

2. **On Real Device**:
   - Check permissions: Settings → SignBridge → Camera
   - Reset permissions: Settings → General → Reset → Reset Location & Privacy
   - Restart device

3. **Code issue**:
   - Check Info.plist has `NSCameraUsageDescription`
   - Verify camera permission request in code

### Slow Performance

**Problem**: App lags or freezes during detection

**Solutions**:

1. **Reduce detection frequency**:
   - Increase debounce interval (currently 1.5s)
   - Skip frames (process every 2nd or 3rd frame)

2. **Optimize model**:
   - Use INT8 quantization (smaller, faster)
   - Reduce model input size

3. **Check device**:
   - Test on newer device (A12+ chip)
   - Close other apps
   - Check memory usage

### Build Errors

**Problem**: Build fails in Xcode

**Common errors**:

1. **Missing CocoaPods**:
   ```bash
   sudo gem install cocoapods
   cd sign-Bridge/ios
   pod install
   ```

2. **Signing issues**:
   - Xcode: Automatically manage signing = ON
   - Select your development team

3. **Swift version**:
   - Ensure Xcode is latest version
   - Update pods: `pod update`

4. **Clean build**:
   ```bash
   cd sign-Bridge/ios
   xcodebuild clean
   rm -rf ~/Library/Developer/Xcode/DerivedData/*
   pod install
   ```

---

## 📊 Testing Checklist

### Pre-Testing:
- [ ] Downloaded/built iOS app
- [ ] Simulator booted or device connected
- [ ] App installed successfully
- [ ] Xcode ready for logs (optional)

### Functional Testing:
- [ ] App launches without crashing
- [ ] Camera permission requested and granted
- [ ] Model loads (shows "TFLite ✓")
- [ ] Camera viewfinder appears
- [ ] Detection overlay visible

### Detection Testing:
- [ ] Detects letter A-Z correctly
- [ ] Detects number 0-9 correctly
- [ ] Confidence shows 70%+ for clear gestures
- [ ] Debouncing works (1.5s interval)
- [ ] UI updates in real-time

### Performance Testing:
- [ ] Smooth frame rate (30+ FPS)
- [ ] Detection speed acceptable (< 500ms)
- [ ] Memory usage reasonable (< 200 MB)
- [ ] No crashes during extended use

### Edge Cases:
- [ ] Works in poor lighting
- [ ] Handles multiple hands
- [ ] No false positives on non-gestures
- [ ] Proper error handling

---

## 🎯 Expected Test Results

### ✅ Success Indicators:
- App launches immediately
- "TFLite ✓" badge shows (green)
- Camera displays live feed
- Detections are accurate (80%+ correct)
- Performance is smooth
- No crashes or freezes

### ⚠️ Warning Signs:
- "Simulación 🔄" badge (model not loaded)
- Slow detection (> 1 second)
- Frequent crashes
- High memory usage (> 300 MB)
- Low accuracy (< 50% correct)

### ❌ Failure Indicators:
- App doesn't install
- Crashes on launch
- Camera doesn't work
- No detections occur
- Model file missing from bundle

---

## 📞 Support

### Resources:
- **GitHub Issues**: https://github.com/fegenau/capstone-sign-bridge/issues
- **Documentation**: See `REAL_MODEL_READY.md`
- **Model Guide**: See `REAL_MODEL_INTEGRATION.md`

### Debugging Commands:
```bash
# View simulator logs
xcrun simctl spawn booted log stream

# List installed apps
xcrun simctl listapps booted

# Take screenshot
xcrun simctl io booted screenshot screenshot.png

# Record video
xcrun simctl io booted recordVideo video.mp4
```

---

## 🎉 Success!

If you can:
✅ Install the app
✅ See "TFLite ✓" badge
✅ Point camera at gestures
✅ Get accurate detections (70%+ confidence)

**Your iOS app is working perfectly!** 🚀

---

**Last Updated**: October 14, 2025  
**Status**: Production Ready  
**Model**: YOLO TFLite (5.96 MB) ✅
