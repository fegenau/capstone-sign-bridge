"""
YOLOv8 Model Export Script for SignBridge
Exports YOLOv8 model to TensorFlow.js format
"""

import os
import sys

def check_ultralytics():
    """Check if ultralytics (YOLOv8) is installed"""
    try:
        from ultralytics import YOLO
        print("✅ Ultralytics (YOLOv8) is installed")
        return True
    except ImportError:
        print("❌ Ultralytics not found")
        print("\nInstall with:")
        print("   python -m pip install ultralytics tensorflowjs")
        return False

def export_yolo_to_tfjs(model_path, output_dir="./exported_models"):
    """
    Export YOLOv8 model to TensorFlow.js format
    """
    try:
        from ultralytics import YOLO
        
        print(f"\n🔄 Loading YOLO model: {model_path}")
        model = YOLO(model_path)
        
        print(f"📊 Model info:")
        print(f"   Type: {model.task}")
        print(f"   Names: {model.names}")
        
        # Export to TensorFlow SavedModel first
        print(f"\n🔄 Step 1: Exporting to TensorFlow SavedModel...")
        saved_model_path = model.export(format='saved_model', imgsz=640)
        print(f"   ✅ Saved to: {saved_model_path}")
        
        # Convert SavedModel to TensorFlow.js
        print(f"\n🔄 Step 2: Converting to TensorFlow.js...")
        import tensorflowjs as tfjs
        
        tfjs_output = os.path.join(output_dir, "tfjs_model")
        os.makedirs(tfjs_output, exist_ok=True)
        
        tfjs.converters.convert_tf_saved_model(
            saved_model_path,
            tfjs_output
        )
        
        print(f"   ✅ TFJS model saved to: {tfjs_output}")
        print(f"\n✅ Conversion complete!")
        print(f"\nNext steps:")
        print(f"1. Copy files from {tfjs_output} to:")
        print(f"   sign-Bridge/assets/models/alphabet/")
        print(f"2. Update MODEL_ASSETS in App.tsx to reference the new files")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error during export: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("=" * 70)
    print("YOLOv8 to TensorFlow.js Conversion Script")
    print("=" * 70)
    
    # Check if ultralytics is installed
    if not check_ultralytics():
        return
    
    # Model path
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "Modelo", "yolov8n.pt")
    
    if not os.path.exists(model_path):
        print(f"\n❌ Model not found: {model_path}")
        print(f"Available files in Modelo/:")
        modelo_dir = os.path.join(base_dir, "Modelo")
        for file in os.listdir(modelo_dir):
            if file.endswith(('.pt', '.tflite')):
                print(f"   - {file}")
        return
    
    print(f"\n📁 Model found: {model_path}")
    
    # Ask user to confirm
    response = input(f"\nConvert this model to TensorFlow.js? (y/n): ").strip().lower()
    if response != 'y':
        print("❌ Conversion cancelled.")
        return
    
    # Export
    output_dir = os.path.join(base_dir, "sign-Bridge", "assets", "models", "alphabet")
    success = export_yolo_to_tfjs(model_path, output_dir)
    
    if success:
        print("\n" + "=" * 70)
        print("🎉 SUCCESS! Your model is ready to use in the app!")
        print("=" * 70)
    else:
        print("\n" + "=" * 70)
        print("❌ Conversion failed. See error messages above.")
        print("=" * 70)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Conversion cancelled by user.")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
