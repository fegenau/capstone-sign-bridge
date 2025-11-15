"""
Script para Visualizar y Probar el Modelo Entrenado
SignBridge - Chilean Sign Language Recognition

Este script te permite ver la arquitectura del modelo y hacer predicciones de prueba.
"""

import os
import json
import numpy as np
import tensorflow as tf
from pathlib import Path

print("=" * 70)
print("🎯 VISUALIZACIÓN DEL MODELO LSTM - SIGNBRIDGE")
print("=" * 70)

# ============================================================================
# CARGAR MODELO
# ============================================================================

MODEL_PATH = "best_model.keras"
LABELS_FILE = "labels.json"

print(f"\n🔍 Verificando entorno...")
print(f"   TensorFlow: {tf.__version__}")

print(f"\n🧠 Cargando modelo: {MODEL_PATH}")

if not os.path.exists(MODEL_PATH):
    print(f"❌ ERROR: No se encontró {MODEL_PATH}")
    exit(1)

model = tf.keras.models.load_model(MODEL_PATH)
print(f"✅ Modelo cargado exitosamente")

# ============================================================================
# INFORMACIÓN DEL MODELO
# ============================================================================

print(f"\n" + "=" * 70)
print("📊 INFORMACIÓN DEL MODELO")
print("=" * 70)

print(f"\n🏗️  Arquitectura:")
print(f"   Nombre: {model.name}")
print(f"   Input Shape: {model.input_shape}")
print(f"   Output Shape: {model.output_shape}")
print(f"   Total Parámetros: {model.count_params():,}")

print(f"\n📋 Capas del modelo:")
print("-" * 70)
for i, layer in enumerate(model.layers, 1):
    params = layer.count_params()
    trainable = "✓" if layer.trainable else "✗"
    print(f"{i:2}. {layer.name:20} | {layer.__class__.__name__:20} | Params: {params:>10,} | Train: {trainable}")
    print(f"    Input:  {layer.input_shape}")
    print(f"    Output: {layer.output_shape}")
    print()

# ============================================================================
# CARGAR ETIQUETAS
# ============================================================================

print("=" * 70)
print("🏷️  CLASES DEL MODELO")
print("=" * 70)

labels = []
if os.path.exists(LABELS_FILE):
    with open(LABELS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
        if isinstance(data, dict) and 'classes' in data:
            labels = data['classes']
        elif isinstance(data, list):
            labels = data
    
    num_classes = model.output_shape[-1]
    print(f"\n✅ Etiquetas cargadas: {len(labels)} clases")
    
    if len(labels) != num_classes:
        print(f"⚠️  ADVERTENCIA: Número de etiquetas ({len(labels)}) no coincide con output del modelo ({num_classes})")
    
    print(f"\n📝 Lista de clases (primeras 20):")
    for i, label in enumerate(labels[:20], 0):
        print(f"   {i:2}. {label}")
    
    if len(labels) > 20:
        print(f"   ... y {len(labels) - 20} clases más")
else:
    print(f"⚠️  No se encontró {LABELS_FILE}")
    num_classes = model.output_shape[-1]
    labels = [f"Clase_{i}" for i in range(num_classes)]
    print(f"   Usando etiquetas genéricas para {num_classes} clases")

# ============================================================================
# PROBAR INFERENCIA
# ============================================================================

print(f"\n" + "=" * 70)
print("🧪 PRUEBA DE INFERENCIA")
print("=" * 70)

print(f"\n🎲 Generando datos de prueba...")
print(f"   Input shape esperado: (batch_size, timesteps, features)")
print(f"   Input shape específico: (1, 24, 126)")
print(f"   - 24 frames (timesteps)")
print(f"   - 126 features (21 landmarks × 3 coords × 2 manos)")

# Generar input aleatorio
dummy_input = np.random.rand(1, 24, 126).astype(np.float32)
print(f"\n   Input generado: {dummy_input.shape}")
print(f"   Rango de valores: [{dummy_input.min():.3f}, {dummy_input.max():.3f}]")

print(f"\n🔮 Ejecutando predicción...")
prediction = model.predict(dummy_input, verbose=0)

print(f"✅ Predicción completada")
print(f"   Output shape: {prediction.shape}")

# Obtener top 5 predicciones
top_5_indices = np.argsort(prediction[0])[-5:][::-1]
top_5_probs = prediction[0][top_5_indices]

print(f"\n🎯 Top 5 Predicciones:")
print("-" * 70)
for i, (idx, prob) in enumerate(zip(top_5_indices, top_5_probs), 1):
    label = labels[idx] if idx < len(labels) else f"Clase_{idx}"
    bar_length = int(prob * 40)
    bar = "█" * bar_length + "░" * (40 - bar_length)
    print(f"{i}. {label:15} | {bar} | {prob*100:5.2f}%")

# Verificación de probabilidades
prob_sum = np.sum(prediction[0])
print(f"\n📊 Estadísticas de la predicción:")
print(f"   Suma de probabilidades: {prob_sum:.6f}")
print(f"   Clase predicha: {labels[top_5_indices[0]]}")
print(f"   Confianza: {top_5_probs[0]*100:.2f}%")
print(f"   Entropía: {-np.sum(prediction[0] * np.log(prediction[0] + 1e-10)):.4f}")

# ============================================================================
# RESUMEN
# ============================================================================

print(f"\n" + "=" * 70)
print("✅ RESUMEN")
print("=" * 70)

print(f"""
El modelo está listo y funcionando correctamente:

📌 Especificaciones:
   - Tipo: Bidirectional LSTM
   - Clases: {num_classes}
   - Parámetros: {model.count_params():,}
   - Input: (batch, 24 frames, 126 features)
   - Output: (batch, {num_classes} clases)

🎯 Para usar en producción:
   1. Este modelo procesa secuencias de 24 frames
   2. Cada frame debe tener 126 features:
      • Mano izquierda: landmarks 0-62 (21 puntos × 3 coords)
      • Mano derecha: landmarks 63-125 (21 puntos × 3 coords)
   3. Los valores deben estar normalizados entre 0 y 1
   4. La predicción devuelve probabilidades para cada clase

💡 Siguiente paso:
   - Para usar en Expo/React Native, necesitarás convertir a TensorFlow.js
   - O usar el modelo directamente en un backend Python
""")

print("=" * 70)
