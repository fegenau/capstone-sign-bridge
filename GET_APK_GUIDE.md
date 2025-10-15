# 📦 How to Get and Test Your APK

**Quick Guide** - Get your SignBridge APK in 3 ways

---

## 🚀 Method 1: GitHub Actions (Easiest)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "feat: Real model integration with comprehensive tests"
git push origin feature/CSB-47/integrate-CNN-model
```

### Step 2: Wait for Build (~20 minutes)
1. Go to: https://github.com/fegenau/capstone-sign-bridge/actions
2. Click on "Build & Test Real Model - Android & iOS"
3. Wait for green checkmark ✅

### Step 3: Download APK
**Option A - From Artifacts**:
1. Click on the successful workflow run
2. Scroll to "Artifacts" section
3. Click `signbridge-android-{commit-sha}`
4. Extract ZIP → Get `app-release.apk`

**Option B - From Releases**:
1. Go to: https://github.com/fegenau/capstone-sign-bridge/releases
2. Click latest release (e.g., `v1.0.0-123`)
3. Download `app-release.apk` from assets

---

## 🔧 Method 2: EAS Build (Recommended)

### Requirements:
- Expo account (free): https://expo.dev
- EXPO_TOKEN in GitHub secrets

### Steps:
```bash
cd sign-Bridge

# Validate model first
npm run validate-model

# Build with EAS
eas build --platform android --profile production

# Wait 15-20 minutes
# Download from: https://expo.dev/accounts/[username]/projects/signbridge/builds
```

### Get APK:
1. Go to Expo dashboard
2. Click your build
3. Download APK file
4. File size should be ~25-30 MB

---

## 💻 Method 3: Local Build (Advanced)

### Requirements:
- Android SDK installed
- Java JDK 17
- Gradle

### Steps:
```bash
cd sign-Bridge

# Validate model
npm run validate-model

# Install dependencies
npm ci --legacy-peer-deps

# Prebuild native code
npx expo prebuild --platform android --clean

# Build APK
cd android
./gradlew assembleRelease

# Find APK at:
# android/app/build/outputs/apk/release/app-release.apk
```

### Get APK:
```bash
# Copy to easy location
cp android/app/build/outputs/apk/release/app-release.apk ~/Desktop/signbridge.apk
```

---

## 📱 How to Install APK on Android

### Method 1: USB Install (Recommended)

```bash
# Enable USB debugging on device:
# Settings → About Phone → Tap "Build Number" 7 times
# Settings → Developer Options → Enable "USB Debugging"

# Install APK
adb install -r signbridge.apk

# Or from specific path
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Launch app
adb shell am start -n com.signbridge.app/.MainActivity
```

### Method 2: Direct Install on Device

1. **Transfer APK** to phone:
   - USB cable → Copy to `Downloads` folder
   - Or email APK to yourself
   - Or use Google Drive/Dropbox

2. **Enable unknown sources**:
   - Settings → Security → "Install from unknown sources"
   - Or Settings → Apps → Chrome/Files → "Install unknown apps"

3. **Install**:
   - Open Files app → Downloads
   - Tap `signbridge.apk`
   - Tap "Install"
   - Wait for installation

4. **Launch**:
   - Tap "Open" or find app icon
   - Grant camera permission when prompted

---

## 🧪 How to Test APK

### 1. Launch App
- Find "SignBridge" icon on home screen
- Tap to open

### 2. Grant Permissions
- **Camera**: Tap "Allow"
- **Files** (if prompted): Tap "Allow"

### 3. Check Model Status
- Look for status badge in detection screen
- **Expected**: "TFLite ✓" (green)
- **Problem**: "Simulación 🔄" (orange) = model not loaded

### 4. Test Detection
1. Navigate to detection screen
2. Point camera at sign language gesture
3. Hold steady for 1-2 seconds
4. Should detect letter/number with 70%+ confidence

### 5. Test Gestures
- **Letters**: A-Z (26 letters)
- **Numbers**: 0-9 (10 numbers)
- **Total**: 36 detectable gestures

### 6. Verify Features
- ✅ Real-time detection
- ✅ Confidence percentage shown
- ✅ Debouncing (1.5s between detections)
- ✅ Works offline (no internet needed)
- ✅ Smooth performance

---

## 🔍 Verify APK Quality

### Check APK Size
```bash
ls -lh signbridge.apk

# Expected: 25-30 MB
# If < 15 MB: Model might be missing
# If > 50 MB: Too large, investigate
```

### Check APK Contents
```bash
# List files in APK
unzip -l signbridge.apk | grep -i tflite

# Should show:
# assets/Modelo/runs/detect/train/weights/best_float16.tflite (5.96 MB)
```

### Check APK Signature
```bash
# Verify APK is signed
apksigner verify --verbose signbridge.apk

# Expected: "Verified using v1 scheme (JAR signing)"
```

### Get APK Info
```bash
# Detailed APK information
aapt dump badging signbridge.apk

# Check:
# - package: name='com.signbridge.app'
# - versionCode='1'
# - sdkVersion:'21' (Android 5.0+)
# - targetSdkVersion:'34' (Android 14)
```

---

## 🐛 Troubleshooting

### APK Won't Install
**Problem**: "App not installed" error

**Solutions**:
1. Uninstall old version first:
   ```bash
   adb uninstall com.signbridge.app
   ```

2. Check Android version (need 5.0+):
   ```bash
   adb shell getprop ro.build.version.release
   ```

3. Clear package installer cache:
   - Settings → Apps → Package Installer → Clear Cache

### APK Too Small
**Problem**: APK is < 15 MB

**Cause**: Model file not included

**Solution**:
```bash
cd sign-Bridge

# Verify model exists
npm run validate-model

# Should show: 5.96 MB
# If fails, add real model file

# Rebuild
npx expo prebuild --clean
cd android
./gradlew assembleRelease
```

### Model Not Loading
**Problem**: Shows "Simulación 🔄" instead of "TFLite ✓"

**Solutions**:

1. **Verify model in APK**:
   ```bash
   unzip -l signbridge.apk | grep best_float16.tflite
   ```

2. **Check APK size** (should include 5.96 MB model)

3. **View logs**:
   ```bash
   adb logcat | grep -i "modelo\|tflite"
   
   # Look for:
   # ✅ "Modelo TFLite cargado exitosamente"
   # ❌ "Archivo del modelo es inválido"
   ```

### Camera Not Working
**Problem**: Black screen or "No camera access"

**Solutions**:
1. Check permission granted: Settings → Apps → SignBridge → Permissions
2. Reset permissions: Settings → Apps → SignBridge → Storage → Clear Data
3. Restart device

---

## 📊 Testing Checklist

### Pre-Installation:
- [ ] APK downloaded (25-30 MB)
- [ ] Model validated (5.96 MB)
- [ ] Android device ready (5.0+)
- [ ] USB debugging enabled (if using ADB)

### Installation:
- [ ] APK installs successfully
- [ ] No errors during installation
- [ ] App icon appears on home screen
- [ ] App opens without crashing

### Model Testing:
- [ ] Status shows "TFLite ✓" (green)
- [ ] Camera permission granted
- [ ] Camera viewfinder appears
- [ ] Detection overlay visible

### Detection Testing:
- [ ] Detects letter A correctly
- [ ] Detects number 0 correctly
- [ ] Confidence shows 70%+
- [ ] Debouncing works (1.5s)
- [ ] All 36 gestures detectable

### Performance:
- [ ] Smooth frame rate
- [ ] Fast detection (< 500ms)
- [ ] No crashes
- [ ] Works offline

---

## 🎯 Expected Results

### ✅ Good APK:
- **Size**: 25-30 MB
- **Contains**: best_float16.tflite (5.96 MB)
- **Signed**: Yes
- **Installs**: Without errors
- **Shows**: "TFLite ✓" (green badge)
- **Detects**: Accurately (80%+ correct)

### ❌ Bad APK:
- **Size**: < 15 MB (model missing)
- **Size**: > 50 MB (bloated)
- **Shows**: "Simulación 🔄" (fallback mode)
- **Detects**: Randomly (simulation)
- **Crashes**: Frequently

---

## 🚀 Quick Commands Reference

### Build:
```bash
cd sign-Bridge
npm run validate-model
npx expo prebuild --platform android --clean
cd android && ./gradlew assembleRelease
```

### Install:
```bash
adb install -r app-release.apk
```

### Test:
```bash
adb shell am start -n com.signbridge.app/.MainActivity
adb logcat | grep -i signbridge
```

### Debug:
```bash
adb logcat | grep -i "modelo\|tflite\|detección"
```

---

## 📞 Support

- **GitHub Actions**: See workflow logs for build errors
- **Model Issues**: Check `REAL_MODEL_READY.md`
- **iOS**: See `IOS_TESTING_GUIDE.md`
- **Full Docs**: See `PRODUCTION_APK_COMPLETE.md`

---

**Next Step**: Push to GitHub and get your APK! 🚀
