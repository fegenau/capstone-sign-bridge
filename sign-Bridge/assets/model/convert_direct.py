"""
Script Alternativo de Conversión: Usando TensorFlow directamente
Este script evita la dependencia problemática de tensorflow_decision_forests
"""

import os
import json
import numpy as np
import tensorflow as tf
from pathlib import Path

# Configuración
MODEL_INPUT = "best_model.keras"
OUTPUT_DIR = "../ml"
LABELS_FILE = "labels.json"

print("🚀 Conversión Directa LSTM → TensorFlow.js")
print("=" * 70)

# Cargar modelo
print("\n🧠 Cargando modelo...")
model = tf.keras.models.load_model(MODEL_INPUT)
print(f"✅ Modelo cargado: {model.input_shape} → {model.output_shape}")

# Crear directorio
output_path = Path(OUTPUT_DIR)
output_path.mkdir(parents=True, exist_ok=True)

# Guardar en formato TensorFlow.js
print(f"\n💾 Guardando modelo en: {output_path.absolute()}")

# Usar tfjs.converters directamente pero sin importar el módulo problemático
try:
    # Intentar método directo de TensorFlow
    model.save(str(output_path / "saved_model"), save_format='tf')
    print("✅ Modelo guardado en formato TensorFlow SavedModel")
    print("\nℹ️  Ahora convierte manualmente con:")
    print(f"   tensorflowjs_converter --input_format=tf_saved_model {output_path / 'saved_model'} {output_path}")
except Exception as e:
    print(f"❌ Error: {e}")

# Cargar labels
print(f"\n🏷️  Procesando etiquetas...")
with open(LABELS_FILE, 'r', encoding='utf-8') as f:
    labels_data = json.load(f)
labels = labels_data.get('classes', labels_data)

# Crear metadata
metadata = {
    "model_info": {
        "name": "SignBridge LSTM",
        "version": "2.0.0",
        "classes": len(labels)
    },
    "input_shape": list(model.input_shape),
    "output_shape": list(model.output_shape)
}

# Guardar label_encoder.json
label_encoder = {
    "classes": labels,
    "num_classes": len(labels)
}

with open(output_path / "label_encoder.json", 'w', encoding='utf-8') as f:
    json.dump(label_encoder, f, indent=2, ensure_ascii=False)
print(f"✅ Guardado: label_encoder.json ({len(labels)} clases)")

# Guardar config.json
config = {
    "model_info": {
        "name": "SignBridge LSTM Movement Classifier",
        "version": "2.0.0",
        "date": "2025-11-13"
    },
    "input": {
        "shape": [24, 126],
        "dtype": "float32"
    },
    "output": {
        "shape": [len(labels)],
        "dtype": "float32"
    }
}

with open(output_path / "config.json", 'w', encoding='utf-8') as f:
    json.dump(config, f, indent=2)
print(f"✅ Guardado: config.json")

print("\n" + "=" * 70)
print("✅ PROCESO COMPLETADO")
print("=" * 70)
