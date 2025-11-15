"""
Servidor Web para el Modelo LSTM - SignBridge
Levanta una API REST y una interfaz web para interactuar con el modelo
"""

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
import json
import os

app = Flask(__name__)
CORS(app)  # Permitir peticiones desde cualquier origen

# ============================================================================
# CARGAR MODELO Y CONFIGURACIÓN
# ============================================================================

print("🚀 Iniciando SignBridge Model Server...")
print("=" * 70)

# Cargar modelo
MODEL_PATH = "best_model.keras"
print(f"🧠 Cargando modelo: {MODEL_PATH}")
model = tf.keras.models.load_model(MODEL_PATH)
print(f"✅ Modelo cargado: {model.input_shape} → {model.output_shape}")

# Cargar etiquetas
LABELS_FILE = "labels.json"
with open(LABELS_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)
    labels = data['classes'] if isinstance(data, dict) else data

print(f"📋 Etiquetas cargadas: {len(labels)} clases")

# Configuración
CONFIG = {
    "model_name": "SignBridge LSTM",
    "version": "1.0.0",
    "num_classes": len(labels),
    "input_shape": list(model.input_shape)[1:],
    "labels": labels
}

print("=" * 70)
print("✅ Servidor listo")

# ============================================================================
# RUTAS DE LA API
# ============================================================================

@app.route('/')
def index():
    """Página principal con interfaz web"""
    return """
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SignBridge Model Server</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .header h1 {
            color: #667eea;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #666;
            font-size: 1.1em;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .stat-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .stat-card h3 {
            color: #667eea;
            font-size: 0.9em;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        
        .stat-card p {
            color: #333;
            font-size: 1.8em;
            font-weight: bold;
        }
        
        .card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .card h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 1.5em;
        }
        
        .button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 1em;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
            margin: 5px;
        }
        
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .button:active {
            transform: translateY(0);
        }
        
        #result {
            margin-top: 20px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            display: none;
        }
        
        .prediction-item {
            display: flex;
            align-items: center;
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 8px;
        }
        
        .prediction-label {
            min-width: 150px;
            font-weight: bold;
            color: #333;
        }
        
        .prediction-bar {
            flex: 1;
            height: 30px;
            background: #e9ecef;
            border-radius: 5px;
            overflow: hidden;
            margin: 0 15px;
        }
        
        .prediction-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            transition: width 0.3s;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 10px;
            color: white;
            font-weight: bold;
        }
        
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-left: 10px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .info-text {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #2196f3;
            margin-bottom: 20px;
        }
        
        .classes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 10px;
            margin-top: 15px;
        }
        
        .class-tag {
            background: #f8f9fa;
            padding: 8px 12px;
            border-radius: 5px;
            text-align: center;
            font-size: 0.9em;
            color: #495057;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🖐️ SignBridge Model Server</h1>
            <p>Servidor de inferencia para reconocimiento de lengua de señas chilena</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <h3>Modelo</h3>
                <p>LSTM</p>
            </div>
            <div class="stat-card">
                <h3>Clases</h3>
                <p id="num-classes">67</p>
            </div>
            <div class="stat-card">
                <h3>Parámetros</h3>
                <p>1.03M</p>
            </div>
            <div class="stat-card">
                <h3>Estado</h3>
                <p style="color: #28a745;">🟢 Activo</p>
            </div>
        </div>
        
        <div class="card">
            <h2>🧪 Probar Modelo</h2>
            <div class="info-text">
                <strong>ℹ️ Información:</strong> El modelo procesa secuencias de 24 frames con 126 features cada uno (landmarks de ambas manos).
            </div>
            
            <button class="button" onclick="testRandom()">🎲 Datos Aleatorios</button>
            <button class="button" onclick="testStatic()">🖐️ Mano Estática</button>
            <button class="button" onclick="testMovement()">👉 Movimiento</button>
            <button class="button" onclick="testDynamic()">✊✋ Gesto Dinámico</button>
            
            <div id="result"></div>
        </div>
        
        <div class="card">
            <h2>📚 Clases Disponibles</h2>
            <p style="margin-bottom: 15px; color: #666;">El modelo puede reconocer las siguientes señas:</p>
            <div id="classes-list" class="classes-grid"></div>
        </div>
    </div>
    
    <script>
        // Cargar información del modelo
        fetch('/api/info')
            .then(r => r.json())
            .then(data => {
                document.getElementById('num-classes').textContent = data.num_classes;
                const classesList = document.getElementById('classes-list');
                data.labels.forEach(label => {
                    const tag = document.createElement('div');
                    tag.className = 'class-tag';
                    tag.textContent = label;
                    classesList.appendChild(tag);
                });
            });
        
        function showLoading() {
            const result = document.getElementById('result');
            result.style.display = 'block';
            result.innerHTML = '<p>⚙️ Procesando...<span class="loading"></span></p>';
        }
        
        function showPrediction(data) {
            const result = document.getElementById('result');
            result.style.display = 'block';
            
            let html = `
                <h3>🎯 Resultados de la Predicción</h3>
                <p><strong>Tiempo de inferencia:</strong> ${data.inference_time_ms.toFixed(1)}ms</p>
                <p><strong>Clase ganadora:</strong> ${data.predicted_class}</p>
                <p><strong>Confianza:</strong> ${(data.confidence * 100).toFixed(2)}%</p>
                <hr style="margin: 20px 0;">
                <h4>Top 5 Predicciones:</h4>
            `;
            
            data.top_5.forEach((item, i) => {
                const medal = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i];
                html += `
                    <div class="prediction-item">
                        <span style="font-size: 1.5em; margin-right: 10px;">${medal}</span>
                        <span class="prediction-label">${item.label}</span>
                        <div class="prediction-bar">
                            <div class="prediction-fill" style="width: ${item.probability * 100}%">
                                ${(item.probability * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>
                `;
            });
            
            result.innerHTML = html;
        }
        
        function testRandom() {
            showLoading();
            fetch('/api/predict/random')
                .then(r => r.json())
                .then(showPrediction);
        }
        
        function testStatic() {
            showLoading();
            fetch('/api/predict/static')
                .then(r => r.json())
                .then(showPrediction);
        }
        
        function testMovement() {
            showLoading();
            fetch('/api/predict/movement')
                .then(r => r.json())
                .then(showPrediction);
        }
        
        function testDynamic() {
            showLoading();
            fetch('/api/predict/dynamic')
                .then(r => r.json())
                .then(showPrediction);
        }
    </script>
</body>
</html>
    """


@app.route('/api/info')
def api_info():
    """Obtener información del modelo"""
    return jsonify(CONFIG)


@app.route('/api/predict', methods=['POST'])
def api_predict():
    """Hacer predicción con datos enviados"""
    try:
        data = request.get_json()
        
        # Esperar array de forma [24, 126]
        input_data = np.array(data['sequence'], dtype=np.float32)
        
        if input_data.shape != (24, 126):
            return jsonify({
                'error': f'Shape incorrecto. Esperado: (24, 126), recibido: {input_data.shape}'
            }), 400
        
        # Hacer predicción
        import time
        start = time.time()
        input_batch = input_data.reshape(1, 24, 126)
        prediction = model.predict(input_batch, verbose=0)
        inference_time = (time.time() - start) * 1000
        
        # Procesar resultados
        top_5_idx = np.argsort(prediction[0])[-5:][::-1]
        top_5_prob = prediction[0][top_5_idx]
        
        result = {
            'predicted_class': labels[top_5_idx[0]],
            'confidence': float(top_5_prob[0]),
            'inference_time_ms': inference_time,
            'top_5': [
                {
                    'label': labels[idx],
                    'probability': float(prob)
                }
                for idx, prob in zip(top_5_idx, top_5_prob)
            ]
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def generate_pattern(pattern_type, num_frames=24):
    """Genera patrones de prueba"""
    frames = []
    for i in range(num_frames):
        # Mano base
        if pattern_type == "static":
            left_hand = np.full(63, 0.5) + np.random.randn(63) * 0.02
            right_hand = np.full(63, 0.6) + np.random.randn(63) * 0.02
        elif pattern_type == "movement":
            progress = i / num_frames
            left_hand = np.full(63, 0.3 + progress * 0.4) + np.random.randn(63) * 0.02
            right_hand = np.full(63, 0.4 + progress * 0.3) + np.random.randn(63) * 0.02
        elif pattern_type == "dynamic":
            progress = (i / num_frames) * 2 * np.pi
            spread = 0.5 + 0.2 * np.sin(progress)
            left_hand = np.full(63, spread) + np.random.randn(63) * 0.03
            right_hand = np.full(63, spread + 0.1) + np.random.randn(63) * 0.03
        else:  # random
            left_hand = np.random.rand(63)
            right_hand = np.random.rand(63)
        
        frame = np.concatenate([left_hand, right_hand])
        frames.append(frame)
    
    return np.array(frames, dtype=np.float32)


@app.route('/api/predict/random')
def predict_random():
    """Predicción con datos aleatorios"""
    sequence = generate_pattern("random")
    return make_prediction(sequence)


@app.route('/api/predict/static')
def predict_static():
    """Predicción con mano estática"""
    sequence = generate_pattern("static")
    return make_prediction(sequence)


@app.route('/api/predict/movement')
def predict_movement():
    """Predicción con movimiento"""
    sequence = generate_pattern("movement")
    return make_prediction(sequence)


@app.route('/api/predict/dynamic')
def predict_dynamic():
    """Predicción con gesto dinámico"""
    sequence = generate_pattern("dynamic")
    return make_prediction(sequence)


def make_prediction(sequence):
    """Hacer predicción y devolver resultados"""
    import time
    
    start = time.time()
    input_batch = sequence.reshape(1, 24, 126)
    prediction = model.predict(input_batch, verbose=0)
    inference_time = (time.time() - start) * 1000
    
    # Top 5
    top_5_idx = np.argsort(prediction[0])[-5:][::-1]
    top_5_prob = prediction[0][top_5_idx]
    
    result = {
        'predicted_class': labels[top_5_idx[0]],
        'confidence': float(top_5_prob[0]),
        'inference_time_ms': inference_time,
        'top_5': [
            {
                'label': labels[idx],
                'probability': float(prob)
            }
            for idx, prob in zip(top_5_idx, top_5_prob)
        ]
    }
    
    return jsonify(result)


# ============================================================================
# INICIAR SERVIDOR
# ============================================================================

if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("🌐 Servidor web iniciado")
    print("=" * 70)
    print("\n📍 Accede a la interfaz web en:")
    print("   http://localhost:5000")
    print("\n📡 API REST disponible en:")
    print("   GET  http://localhost:5000/api/info")
    print("   POST http://localhost:5000/api/predict")
    print("   GET  http://localhost:5000/api/predict/random")
    print("   GET  http://localhost:5000/api/predict/static")
    print("   GET  http://localhost:5000/api/predict/movement")
    print("   GET  http://localhost:5000/api/predict/dynamic")
    print("\n" + "=" * 70)
    print("\n💡 Presiona Ctrl+C para detener el servidor\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
