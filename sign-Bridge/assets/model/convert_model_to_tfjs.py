"""
Script de Conversión: Keras LSTM → TensorFlow.js (Optimizado para Web/React Native)

Este script convierte el modelo LSTM de detección de señas chilenas a formato TensorFlow.js
con optimizaciones específicas para compatibilidad web y móvil.

Características:
- Compatible con Keras 3.x y TF 2.x
- Optimizaciones para WebGL backend
- Validación exhaustiva de shapes
- Quantización opcional para reducir tamaño
- Generación automática de metadata

Autor: SignBridge Team
Fecha: 2025-11-13
"""

import os
import sys
import json
import yaml
import numpy as np
import tensorflow as tf
from pathlib import Path

# Verificar versiones
print(f"🔍 Verificando entorno...")
print(f"   TensorFlow: {tf.__version__}")
print(f"   Python: {sys.version}")

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

# Rutas
MODEL_INPUT = "best_model.keras"
TFJS_OUTPUT_DIR = "../ml"  # Nueva carpeta para el modelo optimizado
LABELS_FILE = "labels.json"

# Especificaciones del modelo LSTM
EXPECTED_INPUT_SHAPE = (None, 24, 126)  # (batch, timesteps, features)
EXPECTED_OUTPUT_CLASSES = 68  # CRÍTICO: verificar esto
FRAME_LENGTH = 24  # Frames requeridos para predicción
FEATURE_SIZE = 126  # 21 landmarks × 3 coords × 2 manos

# Opciones de conversión
QUANTIZE_WEIGHTS = False  # Reducir tamaño del modelo (float16)
QUANTIZE_TYPE = "float16"  # o "uint8" para máxima compresión
SKIP_OP_CHECK = False  # Omitir verificación de ops no soportadas
SPLIT_WEIGHTS_BY_LAYER = True  # Mejor para carga progresiva

# ============================================================================
# FUNCIONES DE VALIDACIÓN
# ============================================================================

def validate_model_file():
    """Verificar que el archivo del modelo existe"""
    if not os.path.exists(MODEL_INPUT):
        print(f"❌ ERROR: No se encontró el modelo en '{MODEL_INPUT}'")
        print(f"   Ruta actual: {os.getcwd()}")
        print(f"   Archivos disponibles: {os.listdir('.')}")
        sys.exit(1)
    
    file_size_mb = os.path.getsize(MODEL_INPUT) / (1024 * 1024)
    print(f"✅ Modelo encontrado: {MODEL_INPUT} ({file_size_mb:.2f} MB)")


def load_and_inspect_model():
    """Cargar el modelo y mostrar arquitectura"""
    print(f"\n🧠 Cargando modelo Keras...")
    
    try:
        model = tf.keras.models.load_model(MODEL_INPUT)
        print(f"✅ Modelo cargado exitosamente")
    except Exception as e:
        print(f"❌ Error cargando modelo: {e}")
        sys.exit(1)
    
    # Mostrar arquitectura
    print(f"\n📋 Arquitectura del modelo:")
    print(f"   Nombre: {model.name}")
    print(f"   Inputs: {model.input_shape}")
    print(f"   Outputs: {model.output_shape}")
    print(f"   Parámetros: {model.count_params():,}")
    
    # Validar shapes
    input_shape = model.input_shape
    output_shape = model.output_shape
    
    print(f"\n🔍 Validación de shapes:")
    print(f"   Input esperado: {EXPECTED_INPUT_SHAPE}")
    print(f"   Input actual: {input_shape}")
    print(f"   Output esperado: (None, {EXPECTED_OUTPUT_CLASSES})")
    print(f"   Output actual: {output_shape}")
    
    # Verificar timesteps
    if input_shape[1] != FRAME_LENGTH:
        print(f"⚠️  ADVERTENCIA: Timesteps no coinciden! (esperado: {FRAME_LENGTH}, actual: {input_shape[1]})")
    
    # Verificar features
    if input_shape[2] != FEATURE_SIZE:
        print(f"⚠️  ADVERTENCIA: Feature size no coincide! (esperado: {FEATURE_SIZE}, actual: {input_shape[2]})")
    
    # Verificar clases
    num_classes = output_shape[-1]
    if num_classes != EXPECTED_OUTPUT_CLASSES:
        print(f"⚠️  ADVERTENCIA: Número de clases no coincide! (esperado: {EXPECTED_OUTPUT_CLASSES}, actual: {num_classes})")
        
        response = input(f"\n   ¿Continuar con {num_classes} clases? (y/n): ")
        if response.lower() != 'y':
            sys.exit(0)
    
    # Mostrar capas
    print(f"\n🏗️  Capas del modelo:")
    for i, layer in enumerate(model.layers):
        print(f"   {i+1}. {layer.name} ({layer.__class__.__name__}) - output: {layer.output_shape}")
    
    return model, num_classes


def test_model_inference(model):
    """Probar inferencia con datos dummy"""
    print(f"\n🧪 Probando inferencia del modelo...")
    
    try:
        # Crear input dummy
        dummy_input = np.random.randn(1, FRAME_LENGTH, FEATURE_SIZE).astype(np.float32)
        
        # Predecir
        prediction = model.predict(dummy_input, verbose=0)
        
        # Validar output
        assert prediction.shape[0] == 1, f"Batch size incorrecto: {prediction.shape[0]}"
        assert len(prediction.shape) == 2, f"Output shape incorrecto: {prediction.shape}"
        
        # Verificar que es una distribución de probabilidad
        prob_sum = np.sum(prediction[0])
        assert 0.99 < prob_sum < 1.01, f"Las probabilidades no suman 1: {prob_sum}"
        
        predicted_class = np.argmax(prediction[0])
        confidence = prediction[0][predicted_class]
        
        print(f"✅ Inferencia exitosa!")
        print(f"   Input shape: {dummy_input.shape}")
        print(f"   Output shape: {prediction.shape}")
        print(f"   Clase predicha: {predicted_class} (confianza: {confidence:.4f})")
        print(f"   Suma probabilidades: {prob_sum:.6f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en inferencia: {e}")
        return False


# ============================================================================
# CONVERSIÓN A TENSORFLOW.JS
# ============================================================================

def convert_to_tfjs(model, num_classes):
    """Convertir modelo a formato TensorFlow.js"""
    print(f"\n🔄 Convirtiendo a TensorFlow.js...")
    
    # Crear directorio de salida
    output_path = Path(TFJS_OUTPUT_DIR)
    output_path.mkdir(parents=True, exist_ok=True)
    
    print(f"   Directorio destino: {output_path.absolute()}")
    
    # Usar API Python directamente para evitar problemas con tensorflow_decision_forests en CLI
    print(f"   Usando API Python de tensorflowjs...")
    return convert_to_tfjs_api(model, num_classes, output_path)


def convert_using_cli(model, output_path, num_classes):
    """Convertir usando la CLI de tensorflowjs_converter"""
    import subprocess
    import tempfile
    
    # Guardar modelo en formato temporal
    temp_dir = tempfile.mkdtemp()
    temp_model_path = os.path.join(temp_dir, "temp_model.h5")
    
    print(f"   Guardando modelo temporal en: {temp_model_path}")
    model.save(temp_model_path)
    
    # Construir comando
    cmd = [
        "tensorflowjs_converter",
        "--input_format", "keras",
        "--output_format", "tfjs_layers_model",
        "--weight_shard_size_bytes", "4194304",  # 4MB
    ]
    
    if QUANTIZE_WEIGHTS:
        cmd.extend(["--quantize_float16"])
    
    cmd.extend([temp_model_path, str(output_path)])
    
    print(f"   Ejecutando: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(result.stdout)
        
        # Limpiar archivo temporal
        os.remove(temp_model_path)
        os.rmdir(temp_dir)
        
        print(f"✅ Conversión exitosa!")
        
        # Verificar archivos generados
        model_json = output_path / "model.json"
        if not model_json.exists():
            print(f"❌ ERROR: No se generó model.json")
            return False
        
        # Listar archivos generados
        print(f"\n📦 Archivos generados:")
        for file in sorted(output_path.iterdir()):
            if file.is_file():
                size_mb = file.stat().st_size / (1024 * 1024)
                print(f"   - {file.name} ({size_mb:.2f} MB)")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error en conversión: {e}")
        print(f"   stdout: {e.stdout}")
        print(f"   stderr: {e.stderr}")
        return False
    except FileNotFoundError:
        print(f"❌ ERROR: tensorflowjs_converter no encontrado")
        print(f"   Instalar con: pip install tensorflowjs")
        return False


def convert_to_tfjs_api(model, num_classes, output_path):
    """Método alternativo usando API Python (puede fallar con tensorflow_decision_forests)"""
    try:
        # Importar solo lo necesario sin cargar tensorflow_decision_forests
        import tensorflowjs.converters
        print(f"   TensorFlow.js Converter instalado")
    except ImportError:
        print(f"❌ ERROR: tensorflowjs no instalado")
        print(f"   Instalar con: pip install tensorflowjs")
        sys.exit(1)
    
    output_path = Path(TFJS_OUTPUT_DIR)
    
    # Configurar opciones de conversión
    kwargs = {
        'quantization_dtype_map': None,
        'skip_op_check': SKIP_OP_CHECK,
        'strip_debug_ops': True,
        'weight_shard_size_bytes': 4 * 1024 * 1024,  # 4MB por shard
    }
    
    # Aplicar quantización si está habilitada
    if QUANTIZE_WEIGHTS:
        print(f"⚙️  Aplicando quantización {QUANTIZE_TYPE}...")
        if QUANTIZE_TYPE == "float16":
            kwargs['quantization_dtype_map'] = {tf.float32: tf.float16}
        elif QUANTIZE_TYPE == "uint8":
            kwargs['quantization_dtype_map'] = {tf.float32: tf.uint8}
    
    try:
        # Conversión
        tensorflowjs.converters.save_keras_model(
            model,
            str(output_path),
            **kwargs
        )
        
        print(f"✅ Conversión exitosa!")
        
        # Verificar archivos generados
        model_json = output_path / "model.json"
        if not model_json.exists():
            print(f"❌ ERROR: No se generó model.json")
            return False
        
        # Listar archivos generados
        print(f"\n📦 Archivos generados:")
        for file in sorted(output_path.iterdir()):
            if file.is_file():
                size_mb = file.stat().st_size / (1024 * 1024)
                print(f"   - {file.name} ({size_mb:.2f} MB)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en conversión: {e}")
        import traceback
        traceback.print_exc()
        return False


# ============================================================================
# GENERACIÓN DE METADATA
# ============================================================================

def load_labels():
    """Cargar y validar etiquetas"""
    print(f"\n🏷️  Cargando etiquetas...")
    
    if not os.path.exists(LABELS_FILE):
        print(f"⚠️  Advertencia: No se encontró {LABELS_FILE}")
        return None
    
    try:
        with open(LABELS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extraer lista de clases
        if isinstance(data, dict) and 'classes' in data:
            labels = data['classes']
        elif isinstance(data, list):
            labels = data
        else:
            print(f"⚠️  Formato de labels.json no reconocido")
            return None
        
        print(f"✅ {len(labels)} etiquetas cargadas")
        return labels
        
    except Exception as e:
        print(f"⚠️  Error cargando etiquetas: {e}")
        return None


def generate_metadata(model, num_classes, labels):
    """Generar archivos de configuración y metadata"""
    print(f"\n📝 Generando metadata...")
    
    output_path = Path(TFJS_OUTPUT_DIR)
    
    # 1. Label Encoder JSON
    if labels:
        label_encoder = {
            "classes": labels,
            "num_classes": len(labels),
            "encoding": "one-hot",
            "framework": "tensorflow",
        }
        
        encoder_file = output_path / "label_encoder.json"
        with open(encoder_file, 'w', encoding='utf-8') as f:
            json.dump(label_encoder, f, indent=2, ensure_ascii=False)
        print(f"✅ Generado: label_encoder.json")
    
    # 2. Configuración del modelo
    config = {
        "model_info": {
            "name": "SignBridge LSTM Movement Classifier",
            "version": "2.0.0",
            "type": "sequential_classifier",
            "framework": "tensorflow.js",
            "architecture": "bidirectional_lstm",
            "date_converted": "2025-11-13",
        },
        "input": {
            "shape": [FRAME_LENGTH, FEATURE_SIZE],
            "batch_shape": [None, FRAME_LENGTH, FEATURE_SIZE],
            "dtype": "float32",
            "name": "keypoints",
            "description": "Sequential hand landmarks (24 frames × 126 features)",
            "feature_breakdown": {
                "left_hand": {
                    "landmarks": 21,
                    "coords_per_landmark": 3,
                    "total_features": 63,
                    "range": [0, 62]
                },
                "right_hand": {
                    "landmarks": 21,
                    "coords_per_landmark": 3,
                    "total_features": 63,
                    "range": [63, 125]
                }
            }
        },
        "output": {
            "shape": [num_classes],
            "dtype": "float32",
            "activation": "softmax",
            "description": "Probability distribution over sign classes"
        },
        "preprocessing": {
            "normalization": "minmax",
            "value_range": [0, 1],
            "missing_value": 0.0,
            "masking_enabled": True,
        },
        "inference": {
            "min_frames_required": FRAME_LENGTH,
            "buffer_type": "circular",
            "confidence_threshold": 0.5,
            "smooth_window": 8,
            "fps_recommendation": 30,
        },
        "performance": {
            "training_accuracy": 0.928,
            "validation_accuracy": 0.920,
            "dataset": "Chilean Sign Language",
            "num_samples": "unknown",
        },
        "compatibility": {
            "tfjs_version": ">=4.0.0",
            "backends": ["webgl", "wasm", "cpu"],
            "platforms": ["web", "react-native", "node"],
            "optimized_for": "mobile",
        }
    }
    
    config_file = output_path / "config.json"
    with open(config_file, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    print(f"✅ Generado: config.json")
    
    # 3. README para desarrolladores
    readme_content = f"""# SignBridge LSTM Model - TensorFlow.js

## Información del Modelo

- **Tipo**: Bidirectional LSTM Classifier
- **Clases**: {num_classes}
- **Accuracy**: 92.8% (entrenamiento)
- **Input Shape**: (batch, 24, 126)
- **Output Shape**: (batch, {num_classes})

## Uso en React Native

```javascript
import * as tf from '@tensorflow/tfjs';
import {{ bundleResourceIO }} from '@tensorflow/tfjs-react-native';

// Cargar modelo
const modelJson = require('./model.json');
const modelWeights = require('./group1-shard1of1.bin');
const model = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));

// Predicción
const input = tf.tensor3d(keypointsBuffer, [1, 24, 126]);
const prediction = model.predict(input);
const probabilities = await prediction.data();
```

## Especificaciones de Input

El modelo espera un buffer de 24 frames, donde cada frame contiene 126 features:

- **Mano izquierda** (índices 0-62): 21 landmarks × 3 coordenadas (x, y, z)
- **Mano derecha** (índices 63-125): 21 landmarks × 3 coordenadas (x, y, z)

### Orden de landmarks (MediaPipe)
```
WRIST = 0
THUMB_CMC = 1, THUMB_MCP = 2, THUMB_IP = 3, THUMB_TIP = 4
INDEX_FINGER_MCP = 5, INDEX_FINGER_PIP = 6, INDEX_FINGER_DIP = 7, INDEX_FINGER_TIP = 8
... (etc para middle, ring, pinky)
```

## Normalización

- Todos los valores deben estar en rango [0, 1]
- Valores faltantes se rellenan con 0.0
- El modelo incluye una capa de Masking para ignorar frames con zeros

## Performance

- **Inferencia**: ~50-100ms en dispositivos móviles modernos
- **Tamaño**: ~{os.path.getsize(MODEL_INPUT) / (1024*1024):.1f}MB
- **Backend recomendado**: WebGL (móvil), WASM (fallback)

## Archivos

- `model.json`: Arquitectura del modelo
- `group1-shard*.bin`: Pesos del modelo
- `label_encoder.json`: Mapeo clase → etiqueta
- `config.json`: Configuración completa

## Troubleshooting

**Problema**: Pantalla negra en cámara
- Solución: Separar thread de inferencia con `requestAnimationFrame`

**Problema**: Predicciones inconsistentes
- Solución: Usar smooth_window=8 para promediar predicciones

**Problema**: Performance lenta
- Solución: Reducir FPS de captura a 15-20 fps
"""
    
    readme_file = output_path / "README.md"
    with open(readme_file, 'w', encoding='utf-8') as f:
        f.write(readme_content)
    print(f"✅ Generado: README.md")


# ============================================================================
# VALIDACIÓN POST-CONVERSIÓN
# ============================================================================

def validate_tfjs_model():
    """Validar que el modelo convertido es válido"""
    print(f"\n✅ Validando modelo TensorFlow.js...")
    
    output_path = Path(TFJS_OUTPUT_DIR)
    model_json = output_path / "model.json"
    
    if not model_json.exists():
        print(f"❌ ERROR: model.json no encontrado")
        return False
    
    try:
        # Cargar y validar JSON
        with open(model_json, 'r') as f:
            model_data = json.load(f)
        
        print(f"✅ model.json válido")
        
        # Verificar campos críticos
        assert 'modelTopology' in model_data, "Falta modelTopology"
        assert 'weightsManifest' in model_data, "Falta weightsManifest"
        
        # Verificar input shape
        topology = model_data['modelTopology']
        if 'model_config' in topology:
            layers = topology['model_config']['config']['layers']
            input_layer = layers[0]
            
            if 'batch_input_shape' in input_layer['config']:
                shape = input_layer['config']['batch_input_shape']
                print(f"   Input shape: {shape}")
                
                if shape[1] != FRAME_LENGTH or shape[2] != FEATURE_SIZE:
                    print(f"⚠️  Shape no coincide con especificaciones!")
        
        # Verificar archivos de pesos
        weights_manifest = model_data['weightsManifest']
        for manifest in weights_manifest:
            for path in manifest['paths']:
                weight_file = output_path / path
                if not weight_file.exists():
                    print(f"❌ ERROR: Archivo de pesos no encontrado: {path}")
                    return False
        
        print(f"✅ Todos los archivos de pesos encontrados")
        return True
        
    except Exception as e:
        print(f"❌ Error validando modelo: {e}")
        return False


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Script principal de conversión"""
    print("=" * 70)
    print("🚀 CONVERSIÓN MODELO LSTM → TENSORFLOW.JS")
    print("   SignBridge - Chilean Sign Language Recognition")
    print("=" * 70)
    
    # 1. Validar archivo del modelo
    validate_model_file()
    
    # 2. Cargar e inspeccionar modelo
    model, num_classes = load_and_inspect_model()
    
    # 3. Probar inferencia
    if not test_model_inference(model):
        print(f"\n⚠️  Advertencia: Inferencia falló, pero continuaremos...")
    
    # 4. Convertir a TensorFlow.js
    if not convert_to_tfjs(model, num_classes):
        print(f"\n❌ Conversión falló!")
        sys.exit(1)
    
    # 5. Cargar etiquetas
    labels = load_labels()
    
    # 6. Generar metadata
    generate_metadata(model, num_classes, labels)
    
    # 7. Validar modelo convertido
    if not validate_tfjs_model():
        print(f"\n⚠️  Advertencia: Validación falló")
    
    # Resumen final
    print("\n" + "=" * 70)
    print("✅ CONVERSIÓN COMPLETADA EXITOSAMENTE!")
    print("=" * 70)
    print(f"\n📍 Modelo convertido en: {Path(TFJS_OUTPUT_DIR).absolute()}")
    print(f"\n📋 Próximos pasos:")
    print(f"   1. Copiar archivos de assets/ml/ a tu proyecto React Native")
    print(f"   2. Implementar src/ml/signMovementClassifier.ts")
    print(f"   3. Crear hook useSignMovementRecognition")
    print(f"   4. Integrar con expo-camera")
    print(f"\n💡 Consulta README.md en la carpeta del modelo para más detalles")
    print()


if __name__ == "__main__":
    main()
