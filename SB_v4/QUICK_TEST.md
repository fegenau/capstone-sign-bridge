# Quick Local Testing Guide - SB_v4

## ✅ Automated Tests (Just Completed)

```
✅ 20/20 tests passed (100%)
  ✓ Model files (7.1 KB + 3.9 MB)
  ✓ 67 SVG manual files
  ✓ 67 label classes
  ✓ All hooks and utilities
  ✓ Enhanced UI screens
  ✓ Build configuration
  ✓ All dependencies installed
  ✓ Complete documentation
```

## 🧪 Manual Testing Steps

### 1. Start Development Server
```bash
cd SB_v4
npm start
```
Expected output:
- "Web Bundled 8342ms"
- "Waiting on http://localhost:8081"

### 2. Test Home Screen (HOME tab)
- [ ] Tab appears in navbar
- [ ] Displays welcome message
- [ ] Text sizes scale with large text toggle

### 3. Test Detection Screen (DETECT tab)
- [ ] Camera permission dialog appears
- [ ] "Iniciar" button visible
- [ ] Clicking "Iniciar" enables camera
- [ ] Live video feed displays (not black)
- [ ] FPS counter updates (shows ~30)
- [ ] Frame counter visible (0-24)
- [ ] "Modelo: OK" shows when ready
- [ ] Put hand in front of camera
- [ ] Frames increment from 0 → 24
- [ ] Label appears (e.g., "A", "Hola", etc.)
- [ ] Confidence percentage displays (0-100%)
- [ ] Confidence bar fills proportionally
- [ ] Bar color changes based on confidence:
  - Orange (< 60%)
  - Green (60-80%)
  - Bright green (> 80%)
- [ ] "✓ Estable" indicator shows when stable

### 4. Test Manual Screen (MANUAL tab)
- [ ] Grid displays all 67 signs
- [ ] Scrollable if needed
- [ ] Each sign shows:
  - Label text (e.g., "A", "Hola")
  - SVG placeholder image (dark background, neon text)
- [ ] No broken images

### 5. Test Settings Screen (SETTINGS tab)
- [ ] "Texto grande" toggle works (text enlarges ~1.2x)
- [ ] "Alto contraste" toggle works:
  - OFF: dark background, white text
  - ON: pure black background, white text, neon accent (#00FF88)
- [ ] "Texto a voz (TTS)" toggle works
- [ ] "Configuración avanzada" section expandable
- [ ] When expanded, shows:
  - Confidence Threshold slider (30-95%)
  - Smoothing Queue Length slider (3-10 frames)
  - Help text for each

### 6. Test TTS (Text-to-Speech)
- [ ] Enable TTS toggle in Settings
- [ ] Go to Detect tab
- [ ] Put hand in camera
- [ ] Make a sign and hold stable
- [ ] Wait for prediction to stabilize
- [ ] Listen for audio pronunciation in Spanish (es-CL)
- [ ] Should NOT repeat rapidly (debounced)

### 7. Test Settings Integration
- [ ] Increase confidence threshold → harder to get predictions
- [ ] Decrease confidence threshold → easier predictions
- [ ] Increase queue length → more stable, slower response
- [ ] Decrease queue length → faster, noisier

### 8. Test Responsive Design
- [ ] **Desktop (1920x1080)**:
  - Layout spreads nicely
  - Video fills container properly
  - Text readable
  - No horizontal scrolling

- [ ] **Tablet (iPad portrait, ~1024x768)**:
  - Single column layout
  - Touch targets large (>44px)
  - No content overflow

- [ ] **Mobile (iPhone 12, ~390x844)**:
  - Vertical layout
  - Text appropriately sized
  - Buttons easily tappable
  - Responsive in landscape too

### 9. Test Browser Compatibility
Test on each browser if available:
- [ ] **Chrome**: All features work
- [ ] **Edge**: All features work
- [ ] **Safari (Desktop)**: Camera and detection work
- [ ] **Safari (iOS)**:
  - Requires tap before camera access
  - Video doesn't auto-fullscreen
  - TTS works

### 10. Test Accessibility
- [ ] High contrast theme readable
- [ ] Large text not overlapping
- [ ] Tab key cycles through controls
- [ ] All buttons have labels

### 11. Test Build
```bash
npm run build
```
Expected output:
- "Exporting to web"
- "dist/" directory created
- Check files exist:
  ```bash
  ls -la dist/
  ls -la dist/model/
  ls dist/manual | wc -l  # Should be 67
  ```

### 12. Test Build Output Locally
```bash
# Option A: Python
cd dist
python -m http.server 8000

# Option B: Node http-server
npx http-server dist -p 8000

# Option C: Firefox "Open File"
# Open dist/index.html directly
```
Then visit `http://localhost:8000` and repeat tests 2-10

## 🚀 Ready for Production?

If ALL checks pass:
- ✅ Deploy to Firebase Hosting
- ✅ Share public URL with users
- ✅ Monitor initial user feedback

## 📝 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Permiso de cámara denegado" | Reload page, accept permission popup |
| "Modelo no carga" | Check console (F12) for network errors |
| "Video negro" | Check camera is working on system |
| "Predicciones inestables" | Increase smoothing queue length in Settings |
| "Predictions too slow" | Decrease queue length or confidence threshold |
| "TTS no funciona" | Check browser TTS is enabled, check system volume |

## ✨ Test Completion Checklist

After running through all sections above, mark these:

- [ ] Development server starts without errors
- [ ] All 4 tabs functional
- [ ] Camera works on DETECT tab
- [ ] Hand detection triggers (frames fill 0→24)
- [ ] Predictions appear with label + confidence
- [ ] Confidence bar displays correctly
- [ ] Settings apply live to detection
- [ ] TTS pronounces detections in Spanish
- [ ] Manual shows 67 signs
- [ ] High contrast toggle works
- [ ] Large text toggle works
- [ ] Responsive on desktop/tablet/mobile
- [ ] Build completes successfully
- [ ] dist/ has all required files
- [ ] dist/ version works locally
- [ ] Ready to deploy!

## 🎉 Success!

If all checks pass, you're ready to deploy to Firebase Hosting:

```bash
firebase deploy --only hosting
```

Your app will be live at: `https://<your-project>.web.app`

---

**Time Estimate**: 10-15 minutes for full manual test
**Required**: Webcam/camera, modern browser, speakers (for TTS)
