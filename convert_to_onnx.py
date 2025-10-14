"""
Convertir modelo YOLO a ONNX para React Native

Este script convierte tu modelo YOLO entrenado (.pt o .tflite) 
a formato ONNX para usar con onnxruntime-react-native.
"""

from ultralytics import YOLO
import os

# Configuración
MODEL_PATH = "best.pt"  # o "best_float16.tflite"
OUTPUT_DIR = "../sign-Bridge/assets/Modelo/"
IMGSZ = 640  # Tamaño de imagen (640x640 es estándar YOLO)

def convert_to_onnx():
    """Convierte modelo YOLO a ONNX"""
    
    print("🔄 Cargando modelo YOLO...")
    model = YOLO(MODEL_PATH)
    
    print(f"✅ Modelo cargado: {MODEL_PATH}")
    print(f"📊 Clases: {len(model.names)}")
    print(f"📝 Nombres: {list(model.names.values())}")
    
    print("\n🔄 Exportando a ONNX...")
    export_path = model.export(
        format='onnx',
        imgsz=IMGSZ,
        simplify=True,  # Simplifica el grafo ONNX
        opset=12,       # Versión de operadores ONNX
    )
    
    print(f"✅ Modelo exportado: {export_path}")
    
    # Obtener tamaño
    size_mb = os.path.getsize(export_path) / (1024 * 1024)
    print(f"📦 Tamaño: {size_mb:.2f} MB")
    
    # Copiar a assets si se especifica
    if OUTPUT_DIR:
        import shutil
        output_path = os.path.join(OUTPUT_DIR, "best.onnx")
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        shutil.copy(export_path, output_path)
        print(f"📁 Copiado a: {output_path}")
    
    print("\n✅ ¡Conversión completada!")
    print("\n📋 Próximos pasos:")
    print("1. Verifica que best.onnx esté en assets/Modelo/")
    print("2. npm install onnxruntime-react-native --legacy-peer-deps")
    print("3. Actualiza detectionService.js para usar ONNX")
    print("4. npx expo prebuild")
    print("5. npx expo run:android (o run:ios)")

def test_model():
    """Prueba el modelo ONNX exportado"""
    print("\n🧪 Probando modelo ONNX...")
    
    import onnxruntime as ort
    import numpy as np
    
    # Cargar modelo
    onnx_path = "best.onnx" if not OUTPUT_DIR else os.path.join(OUTPUT_DIR, "best.onnx")
    session = ort.InferenceSession(onnx_path)
    
    # Info del modelo
    print(f"\n📊 Información del modelo ONNX:")
    print(f"Inputs: {[i.name for i in session.get_inputs()]}")
    print(f"Input shape: {session.get_inputs()[0].shape}")
    print(f"Outputs: {[o.name for o in session.get_outputs()]}")
    
    # Crear input de prueba
    input_shape = session.get_inputs()[0].shape
    input_shape = [1 if isinstance(s, str) else s for s in input_shape]  # Reemplazar dimensiones dinámicas
    dummy_input = np.random.randn(*input_shape).astype(np.float32)
    
    print(f"\n🔄 Ejecutando inferencia de prueba...")
    outputs = session.run(None, {session.get_inputs()[0].name: dummy_input})
    print(f"✅ Inferencia exitosa!")
    print(f"Output shape: {[o.shape for o in outputs]}")
    
    print("\n✅ Modelo ONNX funciona correctamente!")

if __name__ == "__main__":
    print("=" * 60)
    print("  Conversor YOLO → ONNX para SignBridge")
    print("=" * 60)
    
    try:
        convert_to_onnx()
        
        # Preguntar si quiere probar
        response = input("\n¿Quieres probar el modelo ONNX? (s/n): ").lower()
        if response == 's':
            test_model()
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nVerifica que:")
        print("1. ultralytics esté instalado: pip install ultralytics")
        print("2. El archivo del modelo exista")
        print("3. Tengas permisos de escritura en el directorio")
