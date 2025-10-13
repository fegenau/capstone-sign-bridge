# 🌐 Convert Your Model Online (No Python Installation Needed!)

## Option 1: Google Colab (Recommended - Free & Easy)

### Step 1: Open Google Colab
1. Go to: **https://colab.research.google.com/**
2. Sign in with your Google account (free)
3. Click **"New Notebook"**

### Step 2: Copy and Run These Commands

**Cell 1 - Install packages:**
```python
!pip install -q ultralytics tensorflowjs
print("✅ Packages installed!")
```
Press **Shift+Enter** to run. Wait ~2 minutes.

---

**Cell 2 - Upload your model:**
```python
from google.colab import files

print("📤 Upload your model file...")
uploaded = files.upload()

model_file = list(uploaded.keys())[0]
print(f"✅ Uploaded: {model_file}")
```
Click **"Choose Files"** and upload:
`C:\Users\SEED\Documents\GitHub\capstone-sign-bridge\Modelo\yolov8n.pt`

---

**Cell 3 - Convert to TensorFlow.js:**
```python
from ultralytics import YOLO
import tensorflowjs as tfjs
import os

# Load model
print("🔄 Loading model...")
model = YOLO(model_file)
print(f"✅ Model has {len(model.names)} classes: {model.names}")

# Export to SavedModel
print("\n🔄 Step 1/2: Exporting to TensorFlow...")
saved_model_path = model.export(format='saved_model', imgsz=640)
print(f"✅ Exported: {saved_model_path}")

# Convert to TFJS
print("\n🔄 Step 2/2: Converting to TensorFlow.js...")
output_dir = "./tfjs_model"
tfjs.converters.convert_tf_saved_model(saved_model_path, output_dir)
print(f"✅ Converted to: {output_dir}")

# Zip and download
!zip -r tfjs_model.zip {output_dir}
files.download('tfjs_model.zip')

print("\n🎉 Download started! Extract files and copy to your project.")
```

Press **Shift+Enter**. Wait ~3-5 minutes. A file called `tfjs_model.zip` will download.

---

### Step 3: Copy Files to Your Project

1. **Extract** `tfjs_model.zip`
2. **Copy all files** from `tfjs_model/` folder to:
   ```
   C:\Users\SEED\Documents\GitHub\capstone-sign-bridge\sign-Bridge\assets\models\alphabet\
   ```

3. You should have these files:
   ```
   alphabet/
   ├── model.json
   ├── group1-shard1of1.bin (or similar .bin files)
   ```

---

### Step 4: Update Your App

The app already expects these files! Just restart:

```powershell
cd C:\Users\SEED\Documents\GitHub\capstone-sign-bridge\sign-Bridge
npx expo start --clear
```

Press `a` for Android or scan QR code. Switch to "Alfabeto" mode and test! 🎯

---

## Option 2: Install Python Properly (For Future Use)

If the above doesn't work, here's how to install Python correctly:

### Step 1: Remove Windows Store Python Alias
1. Press **Windows + R**
2. Type: `ms-settings:appsfeatures-app`
3. Click **"App execution aliases"**
4. Turn **OFF** both Python switches

### Step 2: Install Real Python
1. Download: **https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe**
2. Run installer
3. ✅ **CHECK** "Add Python 3.11 to PATH"
4. Click "Install Now"
5. **Restart your computer**

### Step 3: Verify Installation
```powershell
python --version
# Should show: Python 3.11.9
```

### Step 4: Install Packages (One at a Time)
```powershell
cd C:\Users\SEED\Documents\GitHub\capstone-sign-bridge

# Install in order (avoids dependency hell):
python -m pip install --upgrade pip setuptools wheel

python -m pip install numpy<2.0.0

python -m pip install tensorflow==2.15.0

python -m pip install tensorflowjs

python -m pip install ultralytics
```

### Step 5: Run Conversion
```powershell
python export_yolo_to_tfjs.py
```

---

## 🚨 Quick Fix: Use Pre-Converted Demo Model

If both options fail, I can help you set up a demo model to test the app first:

1. Create simple test files
2. Test app functionality
3. Replace with real model later

Let me know which option you want to try! 

**Recommended:** Try **Option 1 (Google Colab)** first - it's fastest and requires no installation! 🚀
