You are Claude Code, an AI coding agent. Your task is to complete and polish the SB_v4 project to deliver a clean, accessible Chilean Sign Language (LSCh) web app with on-device inference, ready for GCP (Firebase Hosting) and local testing.

Context
- Repo path: SB_v4 (Expo SDK 51, web-first).  
- Goal: run in browser with camera, detect hands (MediaPipe), classify LSCh signs using a TFJS model converted from Keras, speak results (TTS), and provide a manual with drawings.  
- Accessibility: high-contrast theme, large text toggle, semantic cues where applicable.  
- Deployment: Firebase Hosting (HTTPS), optional Cloud Run backend (not required for inference).

Current state
- Camera + MediaPipe hook: hooks/useMediaPipeDetection.js (web WASM Hands).  
- Classifier hook (stub): hooks/useTfjsClassifier.js expects a layers model at /model/model.json and labels at /labels.json.  
- Detection UI: screens/DetectScreen.js shows label, confidence, FPS, frames, and triggers TTS when confidence > 0.6.  
- Manual: screens/ManualScreen.js renders a grid using SVGs from public/manual/*.svg. A.svg included as placeholder.  
- GCP: firebase.json (public: dist). README.md documents local run and deploy.  
- App shell: App.js with tabs (Home, Detect, Manual, Settings).

Key requirements
1) Model integration (web TFJS)
- Convert best_model.keras (from sign-Bridge/assets/model) to TFJS layers model:
  - tensorflowjs_converter --input_format=keras --output_format=tfjs_layers_model best_model.keras SB_v4/public/model
- Ensure the model input matches our pipeline: sequence of 24 frames x 126 features (two hands, 21*3 each).  
- Align normalization: current hook clamps to [0..1]; replace with the exact normalization used during training (e.g., relative to wrist, min-max, z std) if different.  
- Implement hooks/useTfjsClassifier.js classify() with efficient tensor reuse.  
- Load labels from sign-Bridge/assets/model/labels.json and copy to SB_v4/public/labels.json.

2) Detection pipeline polish
- Ensure stable FPS ~30; consider requestVideoFrameCallback when available on web.  
- Add smoothing/debouncing: keep a small queue of predictions; only update UI when the majority agrees and confidence above threshold.  
- Expose settings to tweak threshold, queue length, and TTS toggle in Settings.

3) UI/UX and accessibility
- Stylize overlay: big legible label, confidence bar/progress ring, subtle frame counter/FPS.  
- Responsive layout (mobile/desktop): preserve aspect ratio for video; avoid layout shift.  
- High contrast and large text toggles (present) — ensure consistent theming.  
- Provide Spanish (es-CL) copy and ARIA-friendly labels where applicable in web.  
- Cross-browser: ensure Safari iOS playsinline and camera starts after a tap.

4) Text-to-Speech
- Use expo-speech on web (Web Speech API) with es-CL voice if available; fallback to es-ES.  
- Debounce speech (don’t repeat rapidly).  
- When a phrase (multi-word label) is detected, speak it fully; for letters/numbers, speak single symbol.

5) Manual (LSCh)
- ManualScreen shows a grid with cards.  
- For each label, load public/manual/<Label>.svg (sanitize names).  
- Add placeholders for a core subset (A, B, C, Hola, Gracias, Por_favor, Como_estas, Mi_nombre).  
- Provide a script or instructions to batch-generate SVG placeholders (Node or simple template) for all labels.

6) GCP readiness and local
- Local: npm run start (web) and npm run build -> dist.  
- Firebase Hosting: SB_v4/firebase.json targets dist.  
- Confirm that `public/` static files are copied into dist on export. If not, add a simple post-build step to copy public/** to dist/.
- Optional: GitHub Actions for CI/CD deploy to Hosting (create workflow and docs; do not commit secrets).  
- Optional: Cloud Run example if a server becomes necessary (not required for inference).

Acceptance criteria
- DetectScreen shows the camera, runs the TFJS model, and displays: label (styled), confidence (numeric and bar), FPS, and frame buffer status.  
- TTS pronounces detected label in Spanish when confidence exceeds threshold with debouncing.  
- Manual renders SVGs; placeholders present for the initial set with clear instructions to add more.  
- Build works: npm run build generates dist; Firebase Hosting deploy serves the app over HTTPS and camera permission works.  
- Accessibility: high contrast and large text visibly change UI; texts readable on mobile and desktop.  
- Cross-browser: latest Chrome, Edge, Safari (iOS) able to open camera and render UI.

Implementation notes
- Prefer @tensorflow/tfjs-backend-webgl; allow switching to wasm if stability requires it.  
- Consider adding COOP/COEP only if using TF WASM SIMD/threads; test third-party scripts first.  
- For MediaPipe Hands, ensure CDN model URL remains version-pinned.  
- Add small utility: utils/debounce and utils/smoothPrediction.

Deliverables
- Update hooks/useTfjsClassifier.js to real inference.  
- Add a more polished overlay component (components/Overlay.js) with confidence progress bar.  
- Add public/manual placeholders for the listed core labels.  
- Confirm export:web copies public/** into dist; if not, add a postbuild copy step (Node script or npm script using cpy).  
- Update README with any additional steps found during implementation.  
- Provide a short test checklist for manual QA (camera, TTS, manual assets, deploy).

Constraints
- Keep dependencies minimal; avoid large UI libraries.  
- Maintain Expo SDK 51 compatibility.  
- Do not add native-only code; prioritize web.

Begin by:  
1) Converting the Keras model and committing the artifacts under SB_v4/public/model.  
2) Wiring useTfjsClassifier to produce real predictions.  
3) Polishing UI, TTS, and manual assets.  
4) Verifying build and Hosting deploy.
