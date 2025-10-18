#!/usr/bin/env python3
"""
Script de prueba para verificar que el modelo TFLite funciona correctamente
y simular lo que haría la app móvil
"""

import tensorflow as tf
import numpy as np
import random

def test_model_inference():
    """Prueba la inferencia del modelo con datos simulados"""
    
    model_path = "assets/model/model.tflite"
    
    # Cargar el modelo
    interpreter = tf.lite.Interpreter(model_path=model_path)
    interpreter.allocate_tensors()
    
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    print("🧪 PRUEBA DE INFERENCIA DEL MODELO")
    print("=" * 40)
    
    # Simular diferentes conjuntos de features para las 3 clases
    test_cases = [
        ("Simulación letra A", [random.uniform(0.1, 0.4) for _ in range(63)]),
        ("Simulación letra B", [random.uniform(0.4, 0.7) for _ in range(63)]),
        ("Simulación letra C", [random.uniform(0.7, 1.0) for _ in range(63)]),
        ("Features aleatorias", [random.random() for _ in range(63)]),
    ]
    
    for test_name, features in test_cases:
        print(f"\n📊 {test_name}")
        print("-" * 30)
        
        # Preparar input
        input_data = np.array([features], dtype=np.float32)
        print(f"Input shape: {input_data.shape}")
        print(f"Features range: [{np.min(input_data):.3f}, {np.max(input_data):.3f}]")
        
        # Realizar inferencia
        interpreter.set_tensor(input_details[0]['index'], input_data)
        interpreter.invoke()
        
        # Obtener resultado
        output_data = interpreter.get_tensor(output_details[0]['index'])
        probabilities = output_data[0]
        
        # Interpretar resultado
        labels = ['A', 'B', 'C']
        predicted_class = np.argmax(probabilities)
        confidence = probabilities[predicted_class]
        
        print(f"Probabilidades: {probabilities}")
        print(f"Predicción: {labels[predicted_class]} (confianza: {confidence:.3f})")
        print(f"Todas las probabilidades:")
        for i, (label, prob) in enumerate(zip(labels, probabilities)):
            marker = "👉" if i == predicted_class else "  "
            print(f"  {marker} {label}: {prob:.3f} ({prob*100:.1f}%)")

def simulate_mobile_workflow():
    """Simula el flujo completo de la aplicación móvil"""
    
    print("\n📱 SIMULACIÓN DEL FLUJO DE LA APP")
    print("=" * 40)
    
    # Simular carga del modelo
    print("1️⃣ Cargando modelo...")
    print("   ✅ assets/model/model.tflite cargado")
    print("   ✅ assets/model/labels.txt cargado")
    
    # Simular captura de imagen
    print("\n2️⃣ Capturando imagen de la cámara...")
    print("   📸 Imagen capturada: mock_image.jpg")
    
    # Simular extracción de features
    print("\n3️⃣ Extrayendo features de la imagen...")
    print("   🔍 Detectando landmarks de la mano...")
    print("   📏 Extrayendo 21 landmarks x 3 coordenadas = 63 features")
    
    # Simular features como MediaPipe landmarks
    features = []
    for i in range(21):  # 21 landmarks de la mano
        x = random.uniform(0.2, 0.8)  # Coordenada X normalizada
        y = random.uniform(0.2, 0.8)  # Coordenada Y normalizada  
        z = random.uniform(-0.1, 0.1)  # Profundidad relativa
        features.extend([x, y, z])
    
    print(f"   📊 Features extraídas: {len(features)} valores")
    print(f"   🔢 Sample: [{features[0]:.3f}, {features[1]:.3f}, {features[2]:.3f}, ...]")
    
    # Simular inferencia
    print("\n4️⃣ Realizando inferencia...")
    model_path = "assets/model/model.tflite"
    interpreter = tf.lite.Interpreter(model_path=model_path)
    interpreter.allocate_tensors()
    
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    input_data = np.array([features], dtype=np.float32)
    interpreter.set_tensor(input_details[0]['index'], input_data)
    interpreter.invoke()
    
    output_data = interpreter.get_tensor(output_details[0]['index'])
    probabilities = output_data[0]
    
    labels = ['A', 'B', 'C']
    predicted_class = np.argmax(probabilities)
    confidence = probabilities[predicted_class]
    
    print(f"   🎯 Resultado: {labels[predicted_class]} ({confidence*100:.1f}% confianza)")
    
    # Simular actualización de UI
    print("\n5️⃣ Actualizando interfaz...")
    print(f"   📱 Mostrando: 'Predicción: {labels[predicted_class]} ({confidence*100:.1f}%)'")
    
    print("\n✅ Flujo completado exitosamente!")

if __name__ == "__main__":
    try:
        test_model_inference()
        simulate_mobile_workflow()
    except Exception as e:
        print(f"❌ Error durante las pruebas: {e}")
        print("🔧 Verifica que el modelo TFLite esté en la ruta correcta")