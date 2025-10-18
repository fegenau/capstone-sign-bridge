#!/usr/bin/env python3
"""
Script para analizar el modelo TensorFlow Lite y obtener información sobre:
- Input/output shapes
- Número de clases
- Metadatos del modelo
"""

import tensorflow as tf
import numpy as np

def analyze_tflite_model(model_path):
    """Analiza un modelo TensorFlow Lite"""
    
    # Cargar el modelo
    interpreter = tf.lite.Interpreter(model_path=model_path)
    interpreter.allocate_tensors()
    
    # Obtener detalles de input y output
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    print("=" * 50)
    print("ANÁLISIS DEL MODELO TENSORFLOW LITE")
    print("=" * 50)
    
    print(f"Archivo: {model_path}")
    print(f"Tamaño del archivo: {round(tf.io.gfile.stat(model_path).length / 1024, 2)} KB")
    
    print("\n--- INPUT DETAILS ---")
    for i, input_detail in enumerate(input_details):
        print(f"Input {i}:")
        print(f"  Name: {input_detail['name']}")
        print(f"  Shape: {input_detail['shape']}")
        print(f"  Data type: {input_detail['dtype']}")
        print(f"  Quantization: {input_detail['quantization']}")
    
    print("\n--- OUTPUT DETAILS ---")
    for i, output_detail in enumerate(output_details):
        print(f"Output {i}:")
        print(f"  Name: {output_detail['name']}")
        print(f"  Shape: {output_detail['shape']}")
        print(f"  Data type: {output_detail['dtype']}")
        print(f"  Quantization: {output_detail['quantization']}")
    
    # Intentar determinar el número de clases
    output_shape = output_details[0]['shape']
    if len(output_shape) > 1:
        num_classes = output_shape[-1]  # Última dimensión suele ser clases
        print(f"\n--- CLASES DETECTADAS ---")
        print(f"Número probable de clases: {num_classes}")
    
    # Probar una inferencia dummy para ver si funciona
    print("\n--- PRUEBA DE INFERENCIA ---")
    try:
        input_shape = input_details[0]['shape']
        # Crear input dummy
        dummy_input = np.random.rand(*input_shape).astype(input_details[0]['dtype'])
        
        interpreter.set_tensor(input_details[0]['index'], dummy_input)
        interpreter.invoke()
        
        output_data = interpreter.get_tensor(output_details[0]['index'])
        print(f"Inferencia exitosa!")
        print(f"Output shape: {output_data.shape}")
        print(f"Output sample: {output_data.flatten()[:10]}")  # Primeros 10 valores
        
    except Exception as e:
        print(f"Error en inferencia: {e}")
    
    return input_details, output_details

if __name__ == "__main__":
    model_path = "assets/model/model.tflite"
    analyze_tflite_model(model_path)