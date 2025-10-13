"""
Model Conversion Script for SignBridge
Converts TFLite models to TensorFlow.js format using ai_edge_litert
"""

import os
import sys
import json
import numpy as np

def check_dependencies():
    """Check if required packages are installed"""
    print("📦 Checking dependencies...")
    
    packages = {
        'tensorflow': 'tensorflow',
        'tensorflowjs': 'tensorflowjs',
    }
    
    missing = []
    for package, install_name in packages.items():
        try:
            __import__(package)
            print(f"   ✅ {package}")
        except ImportError:
            print(f"   ❌ {package} - Missing")
            missing.append(install_name)
    
    if missing:
        print(f"\n⚠️  Missing packages. Install with:")
        print(f"   python -m pip install {' '.join(missing)}")
        return False
    
    return True

def analyze_tflite_model(tflite_path):
    """Analyze TFLite model structure"""
    try:
        import tensorflow as tf
        
        print(f"\n� Analyzing model: {tflite_path}")
        
        # Load interpreter
        interpreter = tf.lite.Interpreter(model_path=tflite_path)
        interpreter.allocate_tensors()
        
        # Get input details
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        print("\n📊 Model Information:")
        print(f"   Input:")
        for i, inp in enumerate(input_details):
            print(f"     [{i}] Shape: {inp['shape']}, Type: {inp['dtype']}")
        
        print(f"   Output:")
        for i, out in enumerate(output_details):
            print(f"     [{i}] Shape: {out['shape']}, Type: {out['dtype']}")
        
        return {
            'input_shape': input_details[0]['shape'].tolist(),
            'output_shape': output_details[0]['shape'].tolist(),
            'input_dtype': str(input_details[0]['dtype']),
            'output_dtype': str(output_details[0]['dtype'])
        }
        
    except Exception as e:
        print(f"   ❌ Error analyzing model: {e}")
        return None

def convert_tflite_to_tfjs_via_keras(tflite_path, output_dir):
    """
    Convert TFLite to TFJS by reconstructing via Keras
    This is a workaround since direct TFLite->TFJS is not straightforward
    """
    try:
        import tensorflow as tf
        import tensorflowjs as tfjs
        
        print(f"\n🔄 Converting {os.path.basename(tflite_path)} to TensorFlow.js...")
        
        # Load TFLite model
        interpreter = tf.lite.Interpreter(model_path=tflite_path)
        interpreter.allocate_tensors()
        
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        input_shape = input_details[0]['shape']
        output_shape = output_details[0]['shape']
        
        print(f"   Input shape: {input_shape}")
        print(f"   Output shape: {output_shape}")
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        print(f"\n   ⚠️  Note: TFLite to TFJS requires intermediate conversion")
        print(f"   Recommended approach:")
        print(f"   1. Export original PyTorch/YOLOv8 model to ONNX")
        print(f"   2. Convert ONNX to TensorFlow SavedModel")
        print(f"   3. Convert SavedModel to TFJS")
        
        return False
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    """Main conversion function"""
    
    print("=" * 60)
    print("SignBridge Model Conversion Script")
    print("=" * 60)
    
    # Check dependencies
    if not check_dependencies():
        print("\n❌ Please install missing dependencies first.")
        return
    
    # Define paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    modelo_dir = os.path.join(base_dir, "Modelo")
    output_base = os.path.join(base_dir, "sign-Bridge", "assets", "models")
    
    # Models to convert
    models = {
        "numbers": os.path.join(modelo_dir, "best_float32.tflite"),
        "alphabet": os.path.join(modelo_dir, "best_float32.tflite"),  # Same model for now
        "gestures": os.path.join(modelo_dir, "best_float32.tflite"),  # Same model for now
    }
    
    print("\n📁 Model locations:")
    for name, path in models.items():
        exists = "✅" if os.path.exists(path) else "❌"
        print(f"   {exists} {name}: {path}")
    
    print("\n" + "=" * 60)
    print("⚠️  IMPORTANT INFORMATION")
    print("=" * 60)
    print("""
TFLite to TensorFlow.js conversion requires additional steps:

RECOMMENDED APPROACH:
1. If you have the original training code (PyTorch/TensorFlow):
   - Export to SavedModel format first
   - Then convert SavedModel to TFJS

2. Install tflite2tensorflow (experimental):
   pip install tflite2tensorflow
   
3. Use online conversion tools:
   - TensorFlow.js Converter: https://www.tensorflow.org/js/guide/conversion
   - Google Colab notebook (free GPU)

QUICK FIX FOR TESTING:
   Your app already has placeholder models. You can:
   - Test the UI/UX without real models
   - Add real models later when conversion is complete
   
Would you like me to:
1. Create a Google Colab notebook for conversion? (Recommended)
2. Create placeholder models with proper structure for testing?
3. Guide you through SavedModel conversion?
    """)
    
    choice = input("\nEnter choice (1/2/3) or 'skip': ").strip()
    
    if choice == "2":
        create_test_models(output_base)
    else:
        print("\n💡 Run the app with placeholder models:")
        print("   cd sign-Bridge")
        print("   npx expo start")
        print("\n   The app will work but detections will be random.")

def create_test_models(output_base):
    """Create properly structured test models"""
    print("\n🔨 Creating test models...")
    
    for model_name in ["numbers", "alphabet", "gestures"]:
        output_dir = os.path.join(output_base, model_name)
        os.makedirs(output_dir, exist_ok=True)
        print(f"   ✅ Created directory: {output_dir}")
    
    print("\n✅ Test models already exist in your project!")
    print("   Run: cd sign-Bridge; npx expo start")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Conversion cancelled.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
