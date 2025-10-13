# 🐍 Python Setup Guide for SignBridge Model Conversion

## Step 1: Install Python

### Download and Install Python 3.11

1. **Download Python:**
   - Visit: https://www.python.org/downloads/
   - Click "Download Python 3.11.x" (latest 3.11 version)

2. **Install Python:**
   - ✅ **CRITICAL:** Check ☑️ "Add Python 3.11 to PATH" (at bottom of installer)
   - Click "Install Now"
   - Wait for installation to complete
   - Click "Disable path length limit" if prompted (recommended)

3. **Verify Installation:**
   Open a **NEW** PowerShell window and run:
   ```powershell
   python --version
   # Should output: Python 3.11.x
   
   pip --version
   # Should output: pip 23.x.x from ...
   ```

   ⚠️ **If commands don't work:** Restart your computer and try again.

---

## Step 2: Install Required Packages

Open PowerShell and run:

```powershell
# Upgrade pip
python -m pip install --upgrade pip

# Install TensorFlow and conversion tools
python -m pip install tensorflow tensorflowjs tf2onnx onnx onnx-tf

# Verify installation
python -c "import tensorflow as tf; print('TensorFlow version:', tf.__version__)"
```

---

## Step 3: Convert Your Models

### Option A: Convert TFLite to TensorFlow.js (Recommended)

```powershell
# Navigate to project root
cd C:\Users\SEED\Documents\GitHub\capstone-sign-bridge

# Convert the float32 model
tensorflowjs_converter `
  --input_format=tf_saved_model `
  --output_format=tfjs_graph_model `
  --signature_name=serving_default `
  --saved_model_tags=serve `
  .\Modelo\best_float32.tflite `
  .\sign-Bridge\assets\models\numbers\
```

### Option B: Use the Python Conversion Script

I've created a conversion script for you. Run:

```powershell
cd C:\Users\SEED\Documents\GitHub\capstone-sign-bridge
python convert_models.py
```

---

## Troubleshooting

### Error: "python is not recognized"
- Python is not in PATH
- Restart your computer
- Or manually add Python to PATH:
  1. Search "Environment Variables" in Windows
  2. Edit "Path" under System variables
  3. Add: `C:\Users\SEED\AppData\Local\Programs\Python\Python311`
  4. Add: `C:\Users\SEED\AppData\Local\Programs\Python\Python311\Scripts`

### Error: "No module named 'tensorflow'"
```powershell
python -m pip install --upgrade pip
python -m pip install tensorflow
```

### Error during conversion
- Ensure you have enough disk space (> 2GB free)
- Try converting with smaller batch size
- Check that model files are not corrupted

---

## Next Steps

After successful conversion:
1. Your models will be in `sign-Bridge/assets/models/`
2. Start Expo: `cd sign-Bridge; npx expo start`
3. Test on Android emulator or physical device

---

## Alternative: Pre-converted Models

If you have issues, you can:
1. Convert models on another machine with Python
2. Use Google Colab (free, cloud-based Python environment)
3. Ask a team member to convert and share the `.json` and `.bin` files
