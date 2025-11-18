# SB_v4 - Manual QA Checklist

## Pre-Test Setup
- [ ] Node 18+ installed: `node --version`
- [ ] npm installed: `npm --version`
- [ ] Dependencies installed: `npm install`
- [ ] No TypeScript/lint errors visible in console

## Local Testing (npm run start)

### Startup
- [ ] App starts without errors on `npm run start`
- [ ] Browser opens automatically or manual navigation works
- [ ] Home tab loads first
- [ ] All 4 tabs visible and clickable: HOME, DETECT, MANUAL, SETTINGS

### Detect Screen - Camera & Detection
- [ ] Camera permissions dialog appears on first access to DETECT tab
- [ ] "Iniciar" button visible and clickable when no camera active
- [ ] Clicking "Iniciar" starts video stream
- [ ] Video shows real-time webcam feed (not black, not frozen)
- [ ] "Detener" button appears and stops video when clicked
- [ ] FPS counter displays and updates (should be ~30 FPS)
- [ ] Frame counter increases as hands are detected (0-24)
- [ ] Modelo status shows "✓ OK" when TFJS model loads

### Detection & Prediction
- [ ] Model ready message shows before predictions
- [ ] Hand in front of camera triggers frame buffer to fill
- [ ] When 24 frames collected, detection/label updates
- [ ] Confidence bar appears and fills proportionally (0-100%)
- [ ] Bar color changes: orange (<60%), accent green (60-80%), bright green (>80%)
- [ ] Confidence percentage text updates in real-time
- [ ] Prediction text changes when hand moves/changes
- [ ] "✓ Estable" indicator appears when prediction is stable
- [ ] At least one hand position produces a label (any of 59 classes)

### Accessibility Features
- [ ] Settings tab accessible from navbar
- [ ] High contrast toggle works: switches white/black background
- [ ] Large text toggle works: text visibly enlarges (~1.2x)
- [ ] Text is readable in both modes (no overlap, no clipping)
- [ ] Colors remain high contrast in high contrast mode (white text on black/green on black)

### Text-to-Speech (TTS)
- [ ] TTS toggle in Settings (ON by default)
- [ ] When TTS enabled and prediction stable + high confidence: audio plays
- [ ] Spanish (es-CL) voice used (if available, else es-ES)
- [ ] TTS doesn't repeat rapidly (debounced ~800ms)
- [ ] Can toggle TTS off and no audio plays even with high confidence

### Manual Screen
- [ ] Manual tab shows grid of signs
- [ ] Scrollable if many items
- [ ] At least 59 signs displayed (one for each label)
- [ ] Each sign shows label text and SVG placeholder
- [ ] SVG images visible (dark background with neon text)
- [ ] No broken/missing images

### Settings Screen
- [ ] All toggle switches work (visual feedback)
- [ ] "Configuración avanzada" section collapsible
- [ ] Collapsed by default (shows ▶)
- [ ] Clicking expands to show sliders (shows ▼)
- [ ] Umbral de confianza slider: 30-95%, steps of 5%
- [ ] Estabilidad de predicción slider: 3-10, steps of 1
- [ ] Current values displayed next to sliders
- [ ] Help text visible below each slider
- [ ] Sliders respond smoothly to input
- [ ] Values saved and passed to Detect screen

### Settings Integration
- [ ] Increasing confidence threshold: harder to get predictions
- [ ] Decreasing threshold: easier predictions (but more false positives)
- [ ] Increasing queue length: more stable but slower response
- [ ] Decreasing queue length: faster but noisier
- [ ] Changes apply immediately (no page reload needed)

## Responsive Design Testing

### Desktop (1920x1080)
- [ ] Layout spreads nicely with padding
- [ ] Text sizes appropriate
- [ ] Video element fits container without cropping
- [ ] HUD readable below video
- [ ] Buttons easily clickable
- [ ] No horizontal scrolling

### Tablet (iPad, 1024x768)
- [ ] Single-column layout still works
- [ ] Touch targets adequate for fingers (>44px)
- [ ] Text remains readable
- [ ] Camera feed scales appropriately
- [ ] No content overflow

### Mobile (iPhone 12, 390x844)
- [ ] Single-column layout enforced
- [ ] Text sizes scaled appropriately
- [ ] Buttons not too small
- [ ] Video fits in viewport
- [ ] Horizontal layout fits portrait and landscape
- [ ] No horizontal scrolling

## Browser Compatibility

### Chrome/Edge (Desktop)
- [ ] All features work
- [ ] Camera permissions prompt standard
- [ ] No console errors
- [ ] FPS smooth (~30)
- [ ] TTS works with system voice

### Safari (Desktop & iOS)
- [ ] Camera works (may need permissions prompt)
- [ ] iOS: `playsinline` attribute working (video doesn't fullscreen)
- [ ] iOS: Requires user interaction before camera starts
- [ ] Video stream loads after tap
- [ ] TTS works (uses Safari voice)
- [ ] No WebKit-specific errors in console

### Firefox (Desktop)
- [ ] Camera works
- [ ] Detection functions normally
- [ ] TTS available
- [ ] No console errors

## Build & Deployment Testing

### Build
- [ ] `npm run build` completes without errors
- [ ] `dist/` directory created
- [ ] `dist/` contains `index.html` and bundled assets
- [ ] `dist/model/` directory exists with model.json and weights
- [ ] `dist/labels.json` exists
- [ ] `dist/manual/` contains ≥ 59 SVG files
- [ ] No broken symlinks or missing files

### Local Serve (after build)
- [ ] Serve `dist/` with `npx http-server dist` or similar
- [ ] App loads from file:/// or http://localhost
- [ ] All features work post-build (model loads, detection works)
- [ ] No 404 errors for model files or SVGs

### Firebase Hosting (Optional)
- [ ] `firebase init hosting` runs without issues
- [ ] `firebase deploy --only hosting` completes
- [ ] App accessible via HTTPS
- [ ] All pages load without 404s
- [ ] Camera works over HTTPS
- [ ] Model loads correctly
- [ ] Performance acceptable (load time <3s)

## Edge Cases & Error Handling

### No Camera/Permission Denied
- [ ] App doesn't crash if camera unavailable
- [ ] Error message or graceful degradation visible
- [ ] Can still access other tabs (Manual, Settings)

### Model Load Failure
- [ ] If model.json or weights missing: clear error in console
- [ ] App doesn't hang waiting for model
- [ ] UI shows "Modelo: Cargando..." initially, then "OK" or error state
- [ ] Can still use other features

### No Hands Detected
- [ ] Frame counter stays at 0
- [ ] Prediction shows "Detectando..."
- [ ] No NaN or undefined in confidence display
- [ ] FPS still updates

### Rapid Hand Switching
- [ ] Doesn't crash with multiple quick hand changes
- [ ] Predictions update smoothly
- [ ] No memory leaks or high CPU
- [ ] TTS doesn't stutter

## Performance & Resource Usage

### Memory
- [ ] No rapid memory growth when detecting continuously
- [ ] Model loads to ~12-15 MB in VRAM
- [ ] Task manager shows stable memory after 1 minute of use

### CPU
- [ ] CPU usage reasonable (~20-40% on modern CPU)
- [ ] Fan not constantly spinning
- [ ] No page unresponsiveness

### Network
- [ ] Initial load <3s on 4G (with model cache)
- [ ] Model cached after first load
- [ ] SVGs lazy-loaded or load-on-scroll (if applicable)

## Code Quality

### No Console Errors
- [ ] Open DevTools (F12)
- [ ] Check Console tab: no red error messages
- [ ] Only expected warnings (e.g., from libraries)

### No Memory Leaks
- [ ] Run for 2+ minutes continuously detecting
- [ ] Open DevTools → Memory → Take heap snapshot
- [ ] Take second snapshot after another 2 minutes
- [ ] Heap size growth minimal (<10 MB)

### Accessibility (WCAG)
- [ ] Tab navigation works (Tab key cycles through buttons)
- [ ] Focus indicators visible
- [ ] All buttons have accessible names
- [ ] Color not sole information conveyor (labels + colors)

## Acceptance Criteria Met

- [ ] DetectScreen shows camera + running TFJS model
- [ ] Label, confidence bar, FPS, and frame count displayed
- [ ] TTS pronounces Spanish label when confidence high + stable
- [ ] Manual shows 59+ SVG references
- [ ] Build generates dist/ with all assets
- [ ] Firebase Hosting deployment possible
- [ ] High contrast and large text work
- [ ] Cross-browser compatible (Chrome, Edge, Safari, Firefox)
- [ ] Responsive on mobile, tablet, desktop
- [ ] No console errors or crashes

## Sign-Off

- **Tester**: _________________
- **Date**: _________________
- **Overall Status**: ☐ PASS  ☐ FAIL  ☐ CONDITIONAL

**Notes**:
```
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________
```

## Known Limitations (Document for future improvement)

- [ ] Mobile camera support: Currently web-only (mobile may require additional setup)
- [ ] Real SVG diagrams: Placeholders only; replace with actual LSCh diagrams
- [ ] Offline mode: No service worker (requires internet for model download)
- [ ] Multi-user detection: Single hand/person per frame
- [ ] Session history: No logging of detected signs over time
