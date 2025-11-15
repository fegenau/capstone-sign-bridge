"""
Servidor Web con Cámara - SignBridge
Captura video de la webcam y hace predicciones en tiempo real
"""

from flask import Flask, render_template, request, jsonify, Response
from flask_cors import CORS
import numpy as np
import tensorflow as tf
import json
import cv2
import mediapipe as mp
import time
from collections import deque

app = Flask(__name__)
CORS(app)

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

print("🚀 Iniciando SignBridge Camera Server...")
print("=" * 70)

# Cargar modelo
MODEL_PATH = "best_model.keras"
print(f"🧠 Cargando modelo: {MODEL_PATH}")
model = tf.keras.models.load_model(MODEL_PATH)
print(f"✅ Modelo cargado")

# Cargar etiquetas
with open("labels.json", 'r', encoding='utf-8') as f:
    data = json.load(f)
    labels = data['classes'] if isinstance(data, dict) else data

print(f"📋 {len(labels)} clases cargadas")

# Inicializar MediaPipe Hands
print(f"👋 Inicializando MediaPipe Hands...")
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)
print(f"✅ MediaPipe listo")

# Buffer para almacenar frames
frame_buffer = deque(maxlen=24)
current_prediction = {"class": "Esperando...", "confidence": 0.0}

print("=" * 70)

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

def extract_landmarks(hand_landmarks, hand_type="Left"):
    """Extrae los 21 landmarks de una mano (63 valores: x, y, z)"""
    landmarks = []
    for landmark in hand_landmarks.landmark:
        landmarks.extend([landmark.x, landmark.y, landmark.z])
    return np.array(landmarks, dtype=np.float32)


def process_frame(frame):
    """Procesa un frame y extrae landmarks de ambas manos"""
    # Convertir BGR a RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Detectar manos
    results = hands.process(rgb_frame)
    
    # Crear array de features (126 valores)
    features = np.zeros(126, dtype=np.float32)
    
    if results.multi_hand_landmarks and results.multi_handedness:
        for hand_landmarks, handedness in zip(results.multi_hand_landmarks, results.multi_handedness):
            # Determinar si es mano izquierda o derecha
            hand_label = handedness.classification[0].label
            
            # Extraer landmarks
            hand_data = extract_landmarks(hand_landmarks, hand_label)
            
            # Asignar a la posición correcta
            if hand_label == "Left":
                features[0:63] = hand_data
            else:  # Right
                features[63:126] = hand_data
            
            # Dibujar landmarks en el frame
            mp_drawing.draw_landmarks(
                frame, 
                hand_landmarks, 
                mp_hands.HAND_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
                mp_drawing.DrawingSpec(color=(255, 0, 0), thickness=2)
            )
    
    return frame, features


def make_prediction_from_buffer():
    """Hace predicción usando el buffer de frames"""
    global current_prediction
    
    if len(frame_buffer) < 24:
        return
    
    # Crear secuencia de 24 frames
    sequence = np.array(list(frame_buffer))
    
    # Hacer predicción
    start = time.time()
    input_batch = sequence.reshape(1, 24, 126)
    prediction = model.predict(input_batch, verbose=0)
    inference_time = (time.time() - start) * 1000
    
    # Obtener clase predicha
    predicted_idx = np.argmax(prediction[0])
    confidence = prediction[0][predicted_idx]
    
    current_prediction = {
        "class": labels[predicted_idx],
        "confidence": float(confidence),
        "inference_time": inference_time
    }


def generate_frames():
    """Generador de frames para streaming de video"""
    camera = cv2.VideoCapture(0)
    
    if not camera.isOpened():
        print("❌ Error: No se pudo abrir la cámara")
        return
    
    # Configurar cámara
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    camera.set(cv2.CAP_PROP_FPS, 30)
    
    frame_count = 0
    
    try:
        while True:
            success, frame = camera.read()
            if not success:
                break
            
            # Voltear frame horizontalmente (efecto espejo)
            frame = cv2.flip(frame, 1)
            
            # Procesar frame y extraer landmarks
            processed_frame, features = process_frame(frame)
            
            # Agregar features al buffer
            frame_buffer.append(features)
            
            # Hacer predicción cada 5 frames
            if frame_count % 5 == 0 and len(frame_buffer) == 24:
                make_prediction_from_buffer()
            
            # Dibujar información en el frame
            cv2.putText(
                processed_frame,
                f"Frames: {len(frame_buffer)}/24",
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )
            
            cv2.putText(
                processed_frame,
                f"Prediccion: {current_prediction['class']}",
                (10, 60),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 255),
                2
            )
            
            cv2.putText(
                processed_frame,
                f"Confianza: {current_prediction['confidence']*100:.1f}%",
                (10, 90),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 255),
                2
            )
            
            # Codificar frame como JPEG
            ret, buffer = cv2.imencode('.jpg', processed_frame)
            frame = buffer.tobytes()
            
            # Yield frame en formato multipart
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            
            frame_count += 1
    
    finally:
        camera.release()


# ============================================================================
# RUTAS
# ============================================================================

@app.route('/')
def index():
    """Página principal con cámara"""
    return """
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SignBridge - Cámara en Tiempo Real</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .header {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
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
        
        .main-content {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
        }
        
        .video-container {
            background: white;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .video-container h2 {
            color: #333;
            margin-bottom: 15px;
        }
        
        #video-stream {
            width: 100%;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .prediction-panel {
            background: white;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .prediction-panel h2 {
            color: #333;
            margin-bottom: 20px;
        }
        
        .prediction-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .prediction-class {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .prediction-confidence {
            font-size: 1.5em;
            opacity: 0.9;
        }
        
        .stats {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
        }
        
        .stat-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #dee2e6;
        }
        
        .stat-item:last-child {
            border-bottom: none;
        }
        
        .stat-label {
            color: #666;
            font-weight: 500;
        }
        
        .stat-value {
            color: #333;
            font-weight: bold;
        }
        
        .instructions {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #2196f3;
        }
        
        .instructions h3 {
            color: #1976d2;
            margin-bottom: 10px;
        }
        
        .instructions ul {
            color: #555;
            padding-left: 20px;
        }
        
        .instructions li {
            margin: 5px 0;
        }
        
        @media (max-width: 968px) {
            .main-content {
                grid-template-columns: 1fr;
            }
        }
        
        .pulse {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎥 SignBridge - Detección en Tiempo Real</h1>
            <p>Usa tu cámara para reconocer señas chilenas con IA</p>
        </div>
        
        <div class="main-content">
            <div class="video-container">
                <h2>📹 Video en Tiempo Real</h2>
                <img id="video-stream" src="/video_feed" alt="Video Stream">
            </div>
            
            <div class="prediction-panel">
                <h2>🎯 Predicción Actual</h2>
                
                <div class="prediction-box">
                    <div class="prediction-class pulse" id="pred-class">Esperando...</div>
                    <div class="prediction-confidence" id="pred-confidence">0%</div>
                </div>
                
                <div class="stats">
                    <div class="stat-item">
                        <span class="stat-label">Frames en buffer:</span>
                        <span class="stat-value" id="stat-frames">0/24</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Estado:</span>
                        <span class="stat-value" style="color: #28a745;" id="stat-status">🟢 Activo</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Tiempo inferencia:</span>
                        <span class="stat-value" id="stat-time">0ms</span>
                    </div>
                </div>
                
                <div class="instructions">
                    <h3>📋 Instrucciones</h3>
                    <ul>
                        <li>Posiciónate frente a la cámara</li>
                        <li>Asegúrate de tener buena iluminación</li>
                        <li>Muestra ambas manos claramente</li>
                        <li>Haz la seña que quieras reconocer</li>
                        <li>Espera que se acumulen 24 frames</li>
                        <li>El modelo predecirá la seña automáticamente</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Actualizar predicciones cada segundo
        setInterval(() => {
            fetch('/api/current_prediction')
                .then(r => r.json())
                .then(data => {
                    document.getElementById('pred-class').textContent = data.class;
                    document.getElementById('pred-confidence').textContent = 
                        (data.confidence * 100).toFixed(1) + '%';
                    
                    if (data.inference_time) {
                        document.getElementById('stat-time').textContent = 
                            data.inference_time.toFixed(1) + 'ms';
                    }
                });
        }, 1000);
    </script>
</body>
</html>
    """


@app.route('/video_feed')
def video_feed():
    """Ruta para streaming de video"""
    return Response(
        generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )


@app.route('/api/current_prediction')
def get_current_prediction():
    """Obtener la predicción actual"""
    return jsonify(current_prediction)


@app.route('/api/info')
def api_info():
    """Información del modelo"""
    return jsonify({
        "model": "SignBridge LSTM",
        "classes": len(labels),
        "input_shape": [24, 126],
        "labels": labels
    })


# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("🌐 Servidor con cámara iniciado")
    print("=" * 70)
    print("\n📍 Abre tu navegador en:")
    print("   http://localhost:5001")
    print("\n🎥 Características:")
    print("   • Captura de cámara en tiempo real")
    print("   • Detección de manos con MediaPipe")
    print("   • Predicciones automáticas cada 5 frames")
    print("   • Visualización de landmarks en el video")
    print("\n💡 Presiona Ctrl+C para detener")
    print("=" * 70)
    print()
    
    app.run(host='0.0.0.0', port=5001, debug=False, threaded=True)
