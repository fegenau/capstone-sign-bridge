# YOLOv8 to TensorFlow.js Converter (Google Colab)
# Open this in Google Colab: https://colab.research.google.com/

"""
INSTRUCTIONS:
1. Go to: https://colab.research.google.com/
2. Click "New Notebook"
3. Copy and paste each cell below
4. Run cells one by one (Shift+Enter)
5. Download the converted model files
6. Copy them to your project
"""

# ==============================================================================
# CELL 1: Install Dependencies
# ==============================================================================
print("📦 Installing packages...")
!pip install -q ultralytics tensorflowjs

print("✅ Installation complete!")

# ==============================================================================
# CELL 2: Upload Your Model
# ==============================================================================
from google.colab import files
import os

print("📤 Upload your YOLOv8 model file (yolov8n.pt)")
print("Click 'Choose Files' button below:")

uploaded = files.upload()

# Get the uploaded filename
model_file = list(uploaded.keys())[0]
print(f"\n✅ Uploaded: {model_file}")

# ==============================================================================
# CELL 3: Load and Analyze Model
# ==============================================================================
from ultralytics import YOLO

print(f"🔍 Loading model: {model_file}")
model = YOLO(model_file)

print(f"\n📊 Model Information:")
print(f"   Task: {model.task}")
print(f"   Classes: {len(model.names)}")
print(f"   Names: {model.names}")

# ==============================================================================
# CELL 4: Export to TensorFlow SavedModel
# ==============================================================================
print("🔄 Step 1/2: Exporting to TensorFlow SavedModel...")

saved_model_path = model.export(
    format='saved_model',
    imgsz=640,
    keras=True,
    optimize=False
)

print(f"✅ SavedModel created: {saved_model_path}")

# ==============================================================================
# CELL 5: Convert to TensorFlow.js
# ==============================================================================
import tensorflowjs as tfjs

print("🔄 Step 2/2: Converting to TensorFlow.js...")

output_dir = "./tfjs_model"
os.makedirs(output_dir, exist_ok=True)

# Convert SavedModel to TFJS
tfjs.converters.convert_tf_saved_model(
    saved_model_path,
    output_dir,
    quantization_dtype_map={'float16': '*'}  # Optional: reduce size
)

print(f"✅ TensorFlow.js model created in: {output_dir}")
print("\n📁 Generated files:")
!ls -lh {output_dir}

# ==============================================================================
# CELL 6: Download the Converted Model
# ==============================================================================
print("📥 Preparing download...")

# Create a zip file
!zip -r tfjs_model.zip {output_dir}

# Download the zip
print("\n⬇️ Click below to download your model:")
files.download('tfjs_model.zip')

print("""
✅ DONE! Next steps:

1. Extract tfjs_model.zip on your computer
2. Copy all files to:
   C:\\Users\\SEED\\Documents\\GitHub\\capstone-sign-bridge\\sign-Bridge\\assets\\models\\alphabet\\

3. Your React Native app will automatically load the model!

4. Test the app:
   cd sign-Bridge
   npx expo start
""")

# ==============================================================================
# CELL 7: (Optional) Test the Model
# ==============================================================================
import numpy as np
import tensorflow as tf

print("🧪 Testing converted model...")

# Load TFJS model back to verify it works
loaded_model = tf.keras.models.load_model(saved_model_path)

# Create dummy input
dummy_input = np.random.rand(1, 640, 640, 3).astype(np.float32)

# Test prediction
output = loaded_model.predict(dummy_input)

print(f"✅ Model test successful!")
print(f"   Input shape: {dummy_input.shape}")
print(f"   Output shape: {output.shape}")
print(f"\n🎉 Your model is ready to use!")
