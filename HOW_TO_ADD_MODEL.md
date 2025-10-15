# 🎯 How to Add Your Real YOLO Model

## Current Status
❌ **Placeholder file detected** (247 bytes)  
📍 Location: `sign-Bridge\assets\Modelo\runs\detect\train\weights\best_float16.tflite`

---

## ✅ Steps to Add Real Model

### Step 1: Export Your Trained YOLO Model to TFLite

If you have a trained YOLO model (`best.pt`):

```bash
# Option A: Using Ultralytics YOLO
python -c "from ultralytics import YOLO; YOLO('path/to/best.pt').export(format='tflite')"

# Option B: Using Python script
python export_model.py
```

**Python script (`export_model.py`)**:
```python
from ultralytics import YOLO

# Load your trained model
model = YOLO('best.pt')  # Path to your trained model

# Export to TFLite format
model.export(format='tflite', int8=False)

print("✅ Model exported to best_float16.tflite")
```

This will generate: `best_float16.tflite` (typically 5-50 MB)

---

### Step 2: Replace the Placeholder File

**Windows PowerShell:**
```powershell
# Delete the placeholder
Remove-Item "C:\Users\SEED\Documents\GitHub\capstone-sign-bridge\sign-Bridge\assets\Modelo\runs\detect\train\weights\best_float16.tflite"

# Copy your real model
Copy-Item "path\to\your\real\best_float16.tflite" "C:\Users\SEED\Documents\GitHub\capstone-sign-bridge\sign-Bridge\assets\Modelo\runs\detect\train\weights\best_float16.tflite"
```

**Or manually:**
1. Delete the placeholder file at:
   ```
   sign-Bridge\assets\Modelo\runs\detect\train\weights\best_float16.tflite
   ```
2. Copy your real YOLO TFLite model to the same location

---

### Step 3: Verify the Model File

```powershell
# Check file size (should be > 1 MB)
Get-Item "sign-Bridge\assets\Modelo\runs\detect\train\weights\best_float16.tflite" | Select-Object Name, @{Name="SizeMB";Expression={[math]::Round($_.Length/1MB, 2)}}
```

**Expected output:**
```
Name                SizeMB
----                ------
best_float16.tflite   12.5    # Should be 5-50 MB
```

---

### Step 4: Rebuild the App

After adding the real model:

```bash
cd sign-Bridge

# Clean rebuild
npx expo prebuild --clean

# Run on Android device/emulator
npx expo run:android

# OR use EAS Build
eas build --platform android --profile production
```

---

## 🔍 How to Tell It's Working

### With Placeholder (Current):
- ✅ App runs
- ⚠️ Shows "Simulación 🔄" badge (orange)
- ⚠️ Random A-Z/0-9 detections
- ⚠️ Console: "⚠️ Archivo del modelo es inválido o es un placeholder"

### With Real Model:
- ✅ App runs
- ✅ Shows "TFLite ✓" badge (green)
- ✅ Real gesture-based detections
- ✅ Console: "✅ Modelo TFLite cargado exitosamente"

---

## 📁 Where is Your Trained Model?

Your trained YOLO model should be one of:
- `best.pt` - PyTorch format (needs export)
- `best_float16.tflite` - TFLite format (ready to use)
- `best.onnx` - ONNX format (needs conversion)

**Common locations:**
- `runs/detect/train/weights/best.pt` (after training)
- `runs/detect/train/weights/best_float16.tflite` (after export)

---

## ⚠️ Important Notes

### Model Requirements:
- **Format**: TensorFlow Lite (.tflite)
- **Size**: Typically 5-50 MB
- **Input**: Image tensor
- **Output**: 36 classes (A-Z letters + 0-9 numbers)
- **Type**: Float16 or Float32

### If You Don't Have a Trained Model:
1. **Train your YOLO model** using Chilean Sign Language dataset
2. **Export to TFLite** using the command above
3. **Copy to the assets folder**

### If Model Loading Fails:
- Check file size > 1 MB
- Verify it's a real `.tflite` file (not text)
- Check console logs for specific errors
- Try rebuilding: `npx expo prebuild --clean`

---

## 🎯 Quick Checklist

- [ ] Export YOLO model to TFLite format
- [ ] Verify exported file is 5-50 MB
- [ ] Delete placeholder file
- [ ] Copy real model to `assets/Modelo/runs/detect/train/weights/best_float16.tflite`
- [ ] Run: `npx expo prebuild --clean`
- [ ] Run: `npx expo run:android`
- [ ] Verify UI shows "TFLite ✓" (green badge)
- [ ] Test with real sign language gestures

---

## 🆘 Need Help?

### Don't have the trained model yet?
You need to:
1. Collect Chilean Sign Language dataset (A-Z, 0-9 images)
2. Train YOLO model on this dataset
3. Export to TFLite format

### Have the model but export fails?
```bash
pip install ultralytics
python -c "from ultralytics import YOLO; print(YOLO('best.pt').info())"
```

### Model file too large for Git?
Add to `.gitignore`:
```
*.tflite
```
Use Git LFS or download separately.

---

**Status**: ⏳ Waiting for real model file  
**Next Step**: Export your trained YOLO model and replace the placeholder
