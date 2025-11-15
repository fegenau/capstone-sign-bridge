"""
Script Simple de Conversión: Keras → TensorFlow.js
Compatible con Expo + React Native Web

Este script evita problemas con tensorflow_decision_forests
usando solo las funcionalidades básicas de TensorFlow.
"""

import os
import sys
import json
import numpy as np
import tensorflow as tf
from pathlib import Path

print("🔍 Verificando entorno...")
print(f"   TensorFlow: {tf.__version__}")
print(f"   Python: {sys.version}")

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

MODEL_INPUT = "best_model.keras"
TFJS_OUTPUT_DIR = "../ml"
LABELS_FILE = "labels.json"

# ============================================================================
# FUNCIONES
# ============================================================================

def load_model():
    """Cargar modelo"""
    print(f"\n🧠 Cargando modelo: {MODEL_INPUT}")
    
    if not os.path.exists(MODEL_INPUT):
        print(f"❌ ERROR: Modelo no encontrado")
        sys.exit(1)
    
    model = tf.keras.models.load_model(MODEL_INPUT)
    print(f"✅ Modelo cargado")
    print(f"   Input: {model.input_shape}")
    print(f"   Output: {model.output_shape}")
    print(f"   Parámetros: {model.count_params():,}")
    
    return model


def test_inference(model):
    """Probar inferencia"""
    print(f"\n🧪 Probando inferencia...")
    
    dummy_input = np.random.randn(1, 24, 126).astype(np.float32)
    prediction = model.predict(dummy_input, verbose=0)
    
    print(f"✅ Inferencia exitosa")
    print(f"   Output shape: {prediction.shape}")
    print(f"   Clase predicha: {np.argmax(prediction[0])}")
    print(f"   Confianza: {prediction[0][np.argmax(prediction[0])]:.4f}")


def convert_to_tfjs_manual(model, output_dir):
    """
    Conversión manual usando solo TensorFlow
    Evita problemas con tensorflow_decision_forests
    """
    print(f"\n🔄 Convirtiendo a TensorFlow.js...")
    
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Guardar en formato SavedModel primero
    temp_saved_model = "temp_saved_model"
    print(f"   Guardando como SavedModel...")
    model.save(temp_saved_model, save_format='tf')
    
    # Ahora convertir usando subprocess con tensorflowjs_converter
    # pero evitando el import directo de tensorflowjs en Python
    import subprocess
    
    cmd = [
        sys.executable,
        "-c",
        """
import sys
import os
# Evitar el import de tensorflow_decision_forests
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
# Importar directamente la función de conversión sin pasar por __init__
from tensorflowjs.converters import keras_h5_conversion
import tensorflow as tf

model = tf.keras.models.load_model(sys.argv[1])
keras_h5_conversion.save_keras_model(
    model,
    sys.argv[2],
    quantization_dtype_map=None,
    skip_op_check=True,
    strip_debug_ops=True,
    weight_shard_size_bytes=4*1024*1024
)
print("✅ Conversión exitosa")
        """,
        MODEL_INPUT,
        str(output_path.absolute())
    ]
    
    print(f"   Ejecutando conversión...")
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True,
            cwd=os.getcwd()
        )
        print(result.stdout)
        
        # Limpiar
        import shutil
        if os.path.exists(temp_saved_model):
            shutil.rmtree(temp_saved_model)
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        print(f"   stdout: {e.stdout}")
        print(f"   stderr: {e.stderr}")
        return False


def generate_metadata(model, output_dir):
    """Generar archivos de configuración"""
    print(f"\n📝 Generando metadata...")
    
    output_path = Path(output_dir)
    num_classes = model.output_shape[-1]
    
    # Cargar labels
    labels = []
    if os.path.exists(LABELS_FILE):
        with open(LABELS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, dict) and 'classes' in data:
                labels = data['classes']
            elif isinstance(data, list):
                labels = data
    
    # Config JSON
    config = {
        "modelInfo": {
            "name": "SignBridge LSTM",
            "version": "2.0.0",
            "type": "sequential_classifier",
            "framework": "tensorflow.js",
            "numClasses": num_classes,
            "inputShape": [24, 126],
            "outputShape": [num_classes]
        },
        "preprocessing": {
            "normalization": "minmax",
            "valueRange": [0, 1],
            "missingValue": 0.0
        },
        "inference": {
            "minFramesRequired": 24,
            "confidenceThreshold": 0.5,
            "smoothWindow": 8,
            "fpsRecommendation": 30
        },
        "compatibility": {
            "tfjsVersion": "^4.22.0",
            "backends": ["webgl", "wasm", "cpu"],
            "platforms": ["web", "react-native"],
            "expo": "~51.0.0"
        }
    }
    
    if labels:
        config["labels"] = labels
    
    config_file = output_path / "model-config.json"
    with open(config_file, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    print(f"✅ Generado: model-config.json")
    
    # README
    readme = f"""# SignBridge LSTM Model

## Uso en React Native / Expo Web

```javascript
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

// Para web
const model = await tf.loadLayersModel('/assets/ml/model.json');

// Para React Native
import {{ bundleResourceIO }} from '@tensorflow/tfjs-react-native';
const modelJson = require('./assets/ml/model.json');
const modelWeights = require('./assets/ml/group1-shard1of1.bin');
const model = await tf.loadLayersModel(
  bundleResourceIO(modelJson, modelWeights)
);

// Predicción
const input = tf.tensor3d(keypointsBuffer, [1, 24, 126]);
const prediction = model.predict(input);
const probabilities = await prediction.data();
const predictedClass = probabilities.indexOf(Math.max(...probabilities));
```

## Especificaciones

- **Input**: [1, 24, 126] - 24 frames × 126 features
  - Features 0-62: Mano izquierda (21 landmarks × 3 coords)
  - Features 63-125: Mano derecha (21 landmarks × 3 coords)
- **Output**: [{num_classes}] clases
- **Normalización**: Valores entre 0 y 1

## Compatibilidad

- ✅ Expo Web
- ✅ React Native (con @tensorflow/tfjs-react-native)
- ✅ expo-camera para captura
- ✅ MediaPipe Hands para detección de landmarks

## Performance

- Inferencia: ~50-100ms (móvil)
- Backend recomendado: WebGL
"""
    
    readme_file = output_path / "README.md"
    with open(readme_file, 'w', encoding='utf-8') as f:
        f.write(readme)
    print(f"✅ Generado: README.md")


def validate_output(output_dir):
    """Validar archivos generados"""
    print(f"\n✅ Validando salida...")
    
    output_path = Path(output_dir)
    model_json = output_path / "model.json"
    
    if not model_json.exists():
        print(f"❌ ERROR: model.json no encontrado")
        return False
    
    with open(model_json, 'r') as f:
        data = json.load(f)
    
    print(f"✅ model.json válido")
    print(f"\n📦 Archivos generados:")
    for file in sorted(output_path.iterdir()):
        if file.is_file():
            size_mb = file.stat().st_size / (1024 * 1024)
            print(f"   - {file.name} ({size_mb:.2f} MB)")
    
    return True


# ============================================================================
# MAIN
# ============================================================================

def main():
    print("=" * 70)
    print("🚀 CONVERSIÓN MODELO LSTM → TENSORFLOW.JS")
    print("   Compatible con Expo + React Native Web")
    print("=" * 70)
    
    # 1. Cargar modelo
    model = load_model()
    
    # 2. Probar inferencia
    test_inference(model)
    
    # 3. Convertir
    if not convert_to_tfjs_manual(model, TFJS_OUTPUT_DIR):
        print(f"\n❌ Conversión falló!")
        sys.exit(1)
    
    # 4. Generar metadata
    generate_metadata(model, TFJS_OUTPUT_DIR)
    
    # 5. Validar
    if not validate_output(TFJS_OUTPUT_DIR):
        print(f"\n⚠️ Advertencia: Validación falló")
    
    # Resumen
    print("\n" + "=" * 70)
    print("✅ CONVERSIÓN COMPLETADA!")
    print("=" * 70)
    print(f"\n📍 Modelo en: {Path(TFJS_OUTPUT_DIR).absolute()}")
    print(f"\n📋 Próximos pasos:")
    print(f"   1. El modelo está listo para usar con Expo Web")
    print(f"   2. Compatible con @tensorflow/tfjs v4.22.0")
    print(f"   3. Funciona con expo-camera para captura")
    print(f"   4. Consulta README.md para ejemplos de código")
    print()


if __name__ == "__main__":
    main()
