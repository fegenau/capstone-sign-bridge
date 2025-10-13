# 🚀 Quick Model Conversion with Google Colab

## Why Colab?
Your local Python environment has too many dependency conflicts. **Google Colab has everything pre-installed and working!**

## Steps (5 minutes):

### 1. Open Google Colab
Go to: https://colab.research.google.com/

### 2. Create New Notebook
Click **File → New Notebook**

### 3. Upload Your Model
Run this cell to upload `yolov8n.pt`:
```python
from google.colab import files
uploaded = files.upload()  # Click "Choose Files" and select yolov8n.pt from Modelo folder
```

### 4. Install & Convert
Run this cell:
```python
!pip install -q ultralytics tensorflowjs

from ultralytics import YOLO
import tensorflowjs as tfjs
import tensorflow as tf

# Load model
model = YOLO('yolov8n.pt')

# Export to SavedModel
print("🔄 Exporting to TensorFlow...")
saved_model_path = model.export(format='saved_model')

# Convert to TensorFlow.js
print("🔄 Converting to TensorFlow.js...")
tfjs.converters.convert_tf_saved_model(
    saved_model_path,
    'tfjs_model',
    quantization_dtype_map={'uint8': '*', 'uint16': '*'}
)

print("✅ Conversion complete!")
print("📁 Files in tfjs_model:")
!ls -lh tfjs_model/
```

### 5. Download Your Model
Run this cell to download:
```python
!zip -r tfjs_model.zip tfjs_model
from google.colab import files
files.download('tfjs_model.zip')
```

### 6. Extract to Your Project
1. Extract `tfjs_model.zip` on your computer
2. Copy `model.json` and all `.bin` files to:
   ```
   sign-Bridge\assets\models\alphabet\
   ```

### 7. Test Your App
```powershell
cd sign-Bridge
npx expo start --clear
```

---

## Alternative: Direct ONNX Export

Since your local system already exported the ONNX file successfully, you could also just use the `.tflite` files you already have:
- `Modelo/best_float32.tflite`
- `Modelo/best_float16.tflite`

But these need to be loaded differently in React Native using `react-native-tflite` or similar.

---

**Recommendation**: Use Colab for TensorFlow.js conversion. It's the fastest path forward! ✨
