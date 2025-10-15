# 🎯 APK Build - Quick Reference

## ⚡ FASTEST METHOD (RECOMMENDED)

```bash
# Install EAS CLI (one-time)
npm install -g eas-cli

# Login to Expo
eas login

# Build APK (15-20 minutes)
cd sign-Bridge
eas build --platform android --profile preview

# Download APK when ready
# Link appears in terminal
```

---

## 🤖 GITHUB ACTIONS METHOD

### Setup (One-Time)
```bash
# 1. Get Expo token
npx expo login
# Go to: https://expo.dev → Settings → Access Tokens → Create

# 2. Add to GitHub
# Repo → Settings → Secrets → Actions → New secret
# Name: EXPO_TOKEN
# Value: [paste token]
```

### Trigger Build
```bash
# Automatic (push to main/develop/feature)
git push origin feature/CSB-47/integrate-CNN-model

# Manual
# GitHub → Actions → "Build Android APK" → Run workflow
```

### Download APK
```
Actions → Latest run → Artifacts → Download
```

---

## 💻 LOCAL BUILD METHOD

```bash
# Install dependencies
cd sign-Bridge
npm install --legacy-peer-deps

# Generate Android project
npx expo prebuild --platform android

# Build APK
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## ⚙️ FILES CREATED

```
✅ .github/workflows/build-android-production.yml  # GitHub Actions workflow
✅ sign-Bridge/eas.json                            # EAS Build config
✅ sign-Bridge/app.json                            # Updated with package name
✅ APK_BUILD_GUIDE.md                              # Full documentation
```

---

## 🔑 REQUIRED SECRET

**For GitHub Actions to work:**

1. Visit: https://expo.dev/accounts/[username]/settings/access-tokens
2. Create new token
3. Copy token
4. Go to: https://github.com/fegenau/capstone-sign-bridge/settings/secrets/actions
5. New secret: `EXPO_TOKEN` = [paste token]

---

## ✅ BUILD STATUS CHECK

After pushing, check:
```
https://github.com/fegenau/capstone-sign-bridge/actions
```

Expected results:
- ✅ Workflow runs
- ✅ Build completes (15-25 min)
- ✅ APK artifact available for download

---

## 🚨 IF BUILD FAILS

### Try EAS Build Directly:
```bash
eas build --platform android --profile preview --clear-cache
```

### Check Logs:
```
GitHub Actions → Failed run → Click on failed step → View logs
```

### Common Fixes:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Clear EAS cache
eas build --clear-cache

# Update EAS CLI
npm install -g eas-cli@latest
```

---

## 📊 BUILD COMPARISON

| Method | Speed | Success Rate | Setup |
|--------|-------|--------------|-------|
| **EAS Build** | ⭐⭐⭐⭐ | 99% ✅ | Easy |
| **GitHub Actions** | ⭐⭐⭐ | 95% ✅ | Medium |
| **Local Gradle** | ⭐⭐⭐⭐⭐ | 80% ⚠️ | Hard |

**Recommendation**: Use EAS Build

---

## 🎉 SUCCESS!

Your APK is ready when you see:
- ✅ "Build finished successfully"
- ✅ Download link in terminal/Actions
- ✅ APK file > 30MB
- ✅ Can install on Android device

**Install APK:**
1. Download APK file
2. Enable "Install from Unknown Sources" on Android
3. Tap APK to install
4. Launch SignBridge!

---

## 📞 QUICK HELP

**EAS Build Status:**
```bash
eas build:list
```

**View Specific Build:**
```bash
eas build:view [build-id]
```

**Check Configuration:**
```bash
eas config
```

**Cancel Build:**
```bash
eas build:cancel
```

---

**READY TO BUILD?**

```bash
cd sign-Bridge
eas build --platform android --profile preview
```

**That's it!** ✅ Your APK will be ready in ~15-20 minutes.
