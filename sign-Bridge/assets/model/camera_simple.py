"""
Servidor Web con Cámara - SignBridge (Versión Simplificada)
Captura video de la webcam y hace predicciones en tiempo real
"""

from flask import Flask, Response
from flask_cors import CORS
import numpy as np
import tensorflow as tf
import json
import cv2
import mediapipe as mp
import time
from collections import deque
import os

app = Flask(__name__)
CORS(app)

print("🚀 Iniciando SignBridge Camera Server...")
print("=" * 80)

# Cargar modelo
MODEL_PATH = "best_model.keras"
print(f"🧠 Cargando modelo: {MODEL_PATH}")
model = tf.keras.models.load_model(MODEL_PATH)
print(f"✅ Modelo cargado ({model.count_params():,} parámetros)")

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
current_prediction = {"class": "Esperando...", "confidence": 0.0, "time": 0.0}

print("=" * 80)
print("🌐 Servidor iniciado. Abre tu navegador en: http://localhost:5001")
print("=" * 80)


def extract_landmarks(hand_landmarks):
    """Extrae los 21 landmarks de una mano (x, y, z) = 63 valores"""
    landmarks = []
    for landmark in hand_landmarks.landmark:
        landmarks.extend([landmark.x, landmark.y, landmark.z])
    return np.array(landmarks, dtype=np.float32)


def process_frame(frame):
    """Procesa un frame y extrae landmarks de ambas manos"""
    global current_prediction
    
    # Convertir BGR a RGB para MediaPipe
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Detectar manos
    results = hands.process(rgb_frame)
    
    # Crear array de features (126 valores: 63 por mano izquierda + 63 por mano derecha)
    features = np.zeros(126, dtype=np.float32)
    hands_detected = 0
    
    if results.multi_hand_landmarks and results.multi_handedness:
        for hand_landmarks, handedness in zip(results.multi_hand_landmarks, results.multi_handedness):
            # Determinar si es mano izquierda o derecha
            hand_label = handedness.classification[0].label
            
            # Extraer landmarks (63 valores)
            hand_data = extract_landmarks(hand_landmarks)
            
            # Asignar a la posición correcta
            if hand_label == "Left":
                features[0:63] = hand_data
                hands_detected += 1
            else:  # Right
                features[63:126] = hand_data
                hands_detected += 1
            
            # Dibujar landmarks en el frame
            mp_drawing.draw_landmarks(
                frame, 
                hand_landmarks, 
                mp_hands.HAND_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=3),
                mp_drawing.DrawingSpec(color=(255, 0, 0), thickness=2)
            )
    
    # Agregar features al buffer
    frame_buffer.append(features)
    
    # Hacer predicción cuando tenemos 24 frames
    if len(frame_buffer) == 24:
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
            "time": inference_time
        }
    
    # Dibujar información en el frame
    # Fondo para mejor legibilidad
    cv2.rectangle(frame, (5, 5), (635, 120), (0, 0, 0), -1)
    cv2.rectangle(frame, (5, 5), (635, 120), (0, 255, 0), 2)
    
    # Información
    cv2.putText(frame, f"Frames: {len(frame_buffer)}/24", 
                (15, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    
    cv2.putText(frame, f"Manos detectadas: {hands_detected}", 
                (15, 55), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    
    cv2.putText(frame, f"Prediccion: {current_prediction['class']}", 
                (15, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
    
    cv2.putText(frame, f"Confianza: {current_prediction['confidence']*100:.1f}%  ({current_prediction['time']:.1f}ms)", 
                (15, 105), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
    
    return frame


def _try_open_camera(index: int, use_dshow: bool = False):
    """Intenta abrir una cámara y devuelve el objeto si funciona, None si falla."""
    if use_dshow:
        cam = cv2.VideoCapture(index, cv2.CAP_DSHOW)
    else:
        cam = cv2.VideoCapture(index)
    if cam.isOpened():
        # Intentar leer un frame para validar
        ok, _ = cam.read()
        if ok:
            return cam
        cam.release()
    else:
        cam.release()
    return None


def generate_frames():
    """Generador de frames para streaming de video con lógica de fallback de cámara"""
    print("🔍 Buscando cámara disponible...")
    candidate_indices = list(range(0, 6))  # Probar 0..5
    camera = None
    chosen_index = None
    backend_used = None

    # Primero intentar con backend por defecto
    for idx in candidate_indices:
        cam = _try_open_camera(idx, use_dshow=False)
        if cam:
            camera = cam
            chosen_index = idx
            backend_used = "CAP_ANY"
            break

    # Si no se encontró ninguna, intentar con DirectShow (Windows)
    if camera is None:
        for idx in candidate_indices:
            cam = _try_open_camera(idx, use_dshow=True)
            if cam:
                camera = cam
                chosen_index = idx
                backend_used = "CAP_DSHOW"
                break

    if camera is None:
        print("❌ No se pudo abrir ninguna cámara en índices 0-5")
        print("💡 Acciones sugeridas:")
        print("   1. Cierra aplicaciones que usen la cámara (Teams, Zoom, etc.)")
        print("   2. Revisa Privacidad > Cámara en Configuración de Windows")
        print("   3. Si usas cámara USB externa, desconecta y vuelve a conectar")
        print("   4. Prueba ejecutar: python - <<EOF\nimport cv2; print([i for i in range(10) if cv2.VideoCapture(i).isOpened()])\nEOF")
        return

    print(f"📹 Cámara inicializada correctamente (índice {chosen_index}, backend {backend_used})")

    # Configurar parámetros deseados (no todos se aplican en todas las cámaras)
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    camera.set(cv2.CAP_PROP_FPS, 30)
    camera.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Reducir buffer para frames más recientes
    
    # Warmup: descartar primeros frames (sensor se estabiliza)
    print("⏳ Calentando cámara (descartando primeros 30 frames)...")
    for _ in range(30):
        camera.read()
    print("✅ Cámara lista para streaming")

    dropped_frames = 0
    consecutive_failures = 0

    try:
        while True:
            success, frame = camera.read()
            if not success or frame is None:
                dropped_frames += 1
                consecutive_failures += 1
                if consecutive_failures == 1:
                    print("⚠️ Fallo al leer frame. Intentando recuperar...")
                # Si falla demasiado, intentar reabrir cámara una vez
                if consecutive_failures > 30:
                    print("❗ Demasiados fallos consecutivos. Reintentando apertura de cámara...")
                    camera.release()
                    camera = _try_open_camera(chosen_index, use_dshow=(backend_used == "CAP_DSHOW"))
                    if camera is None:
                        print("❌ Reapertura falló. Terminando streaming.")
                        break
                    consecutive_failures = 0
                time.sleep(0.01)
                continue

            consecutive_failures = 0

            # Voltear para efecto espejo
            frame = cv2.flip(frame, 1)

            # Procesar
            processed_frame = process_frame(frame)

            # Codificar JPEG
            ret, buffer = cv2.imencode('.jpg', processed_frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            if not ret:
                print("⚠️ Fallo al codificar frame JPEG")
                continue
            frame_bytes = buffer.tobytes()

            # Enviar frame
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    except Exception as e:
        print(f"❌ Error durante streaming: {e}")
    finally:
        camera.release()
        print(f"📹 Cámara liberada. Frames descartados: {dropped_frames}")


@app.route('/')
def index():
    """Página principal con interfaz moderna"""
    return """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🤟 SignBridge - Detección en Tiempo Real</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
            max-width: 800px;
            width: 100%;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        h1 {
            font-size: 2.5em;
            color: #333;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
            font-size: 1.1em;
        }
        
        .video-container {
            position: relative;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            margin-bottom: 20px;
        }
        
        #video {
            width: 100%;
            height: auto;
            display: block;
        }
        
        .info-panel {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 15px;
            margin-top: 20px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .info-item {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 10px;
            text-align: center;
        }
        
        .info-label {
            font-size: 0.9em;
            opacity: 0.8;
            margin-bottom: 5px;
        }
        
        .info-value {
            font-size: 1.5em;
            font-weight: bold;
        }
        
        .instructions {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
        }
        
        .instructions h3 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .instructions ul {
            color: #666;
            padding-left: 20px;
        }
        
        .instructions li {
            margin: 8px 0;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .live-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            background: #ff4444;
            border-radius: 50%;
            margin-right: 8px;
            animation: pulse 2s infinite;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤟 SignBridge</h1>
            <p class="subtitle">
                <span class="live-indicator"></span>
                Detección de Lenguaje de Señas en Tiempo Real
            </p>
        </div>
        
        <div class="video-container">
            <img id="video" src="/video_feed" alt="Video en tiempo real">
        </div>
        
        <div class="info-panel">
            <h3 style="margin-bottom: 15px;">📊 Estado del Sistema</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">🧠 Modelo</div>
                    <div class="info-value">LSTM</div>
                </div>
                <div class="info-item">
                    <div class="info-label">🎯 Clases</div>
                    <div class="info-value">67</div>
                </div>
                <div class="info-item">
                    <div class="info-label">🖼️ Frames</div>
                    <div class="info-value">24</div>
                </div>
                <div class="info-item">
                    <div class="info-label">⚡ Velocidad</div>
                    <div class="info-value">~60ms</div>
                </div>
            </div>
        </div>
        
        <div class="instructions">
            <h3>📝 Instrucciones</h3>
            <ul>
                <li>✋ Coloca tu(s) mano(s) frente a la cámara</li>
                <li>🎬 El sistema necesita 24 frames para hacer una predicción</li>
                <li>🎯 Haz una seña estática o con movimiento</li>
                <li>📊 La predicción aparecerá con el % de confianza</li>
                <li>🔄 Los puntos verdes muestran los landmarks detectados</li>
            </ul>
        </div>
    </div>
</body>
</html>"""


@app.route('/video_feed')
def video_feed():
    """Ruta para streaming de video"""
    return Response(
        generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )


if __name__ == '__main__':
    print("\n🚀 Iniciando servidor Flask...")
    print("📱 Presiona Ctrl+C para detener\n")
    
    port = int(os.getenv('PORT', '5001'))
    app.run(
        host='0.0.0.0',
        port=port,
        debug=False,
        threaded=True
    )
