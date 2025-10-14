# Backend API para Detección con Python/YOLO

Esta es una guía rápida para implementar un backend que procese el modelo YOLO en Python y lo conecte con tu app React Native.

## Opción 1: Backend Simple con Flask

### 1. Crear el servidor Python (`backend/server.py`)

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from ultralytics import YOLO
import base64
from io import BytesIO
from PIL import Image

app = Flask(__name__)
CORS(app)

# Cargar modelo YOLO
MODEL_PATH = "path/to/best_float16.tflite"
model = YOLO(MODEL_PATH)

CONF_THRESH = 0.7
DEBOUNCE_SEC = 1.5

@app.route('/detect', methods=['POST'])
def detect_sign():
    try:
        data = request.json
        image_base64 = data.get('image')
        
        # Decodificar imagen
        image_data = base64.b64decode(image_base64.split(',')[1] if ',' in image_base64 else image_base64)
        image = Image.open(BytesIO(image_data))
        image_array = np.array(image)
        
        # Predecir
        results = model.predict(
            source=image_array,
            conf=CONF_THRESH,
            iou=0.45,
            verbose=False
        )
        
        # Procesar resultados
        detections = []
        for r in results:
            if r.boxes is None or len(r.boxes) == 0:
                continue
                
            for box in r.boxes:
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                label = model.names.get(cls, str(cls))
                
                detections.append({
                    'className': label,
                    'classId': cls,
                    'confidence': conf,
                    'bbox': box.xyxy[0].tolist()
                })
        
        # Retornar detección con mayor confianza
        if detections:
            best = max(detections, key=lambda x: x['confidence'])
            return jsonify({
                'success': True,
                'detections': [best],
                'timestamp': time.time()
            })
        else:
            return jsonify({
                'success': True,
                'detections': [],
                'timestamp': time.time()
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

### 2. Instalar dependencias

```bash
pip install flask flask-cors opencv-python ultralytics pillow
```

### 3. Ejecutar servidor

```bash
python backend/server.py
```

### 4. Actualizar `detectionService.js`

```javascript
async processImageWithModel(imageData) {
  if (!this.apiEndpoint) {
    return null;
  }

  try {
    // Convertir imagen a base64
    const base64Image = await this.imageToBase64(imageData);
    
    // Llamar API
    const response = await fetch(`${this.apiEndpoint}/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image
      }),
      timeout: 5000
    });
    
    const result = await response.json();
    
    if (result.success && result.detections.length > 0) {
      return this.processPredictions(result);
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error en API:', error);
    return null;
  }
}

async imageToBase64(uri) {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

## Opción 2: Backend con FastAPI (Más rápido)

### 1. Servidor FastAPI (`backend/main.py`)

```python
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
from ultralytics import YOLO
from PIL import Image
import io

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar modelo
model = YOLO("path/to/best_float16.tflite")
CONF_THRESH = 0.7

@app.post("/detect")
async def detect_sign(file: UploadFile = File(...)):
    try:
        # Leer imagen
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        image_array = np.array(image)
        
        # Predecir
        results = model.predict(
            source=image_array,
            conf=CONF_THRESH,
            verbose=False
        )
        
        # Procesar
        detections = []
        for r in results:
            if r.boxes is not None:
                for box in r.boxes:
                    detections.append({
                        'className': model.names[int(box.cls[0])],
                        'classId': int(box.cls[0]),
                        'confidence': float(box.conf[0])
                    })
        
        return {
            'success': True,
            'detections': detections
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

@app.get("/health")
async def health():
    return {'status': 'ok'}
```

### 2. Instalar y ejecutar

```bash
pip install fastapi uvicorn python-multipart
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Opción 3: Serverless (AWS Lambda + API Gateway)

### 1. Lambda Function

```python
import json
import base64
import boto3
from PIL import Image
from io import BytesIO
import numpy as np

# Cargar modelo en /tmp
s3 = boto3.client('s3')
s3.download_file('mi-bucket', 'modelo/best_float16.tflite', '/tmp/model.tflite')

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        image_b64 = body['image']
        
        # Procesar imagen
        image_data = base64.b64decode(image_b64)
        # ... procesamiento con modelo ...
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'detections': []
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

## Configuración en React Native

### Agregar URL del backend

```javascript
// En detectionService.js constructor:
constructor() {
  // ...
  this.apiEndpoint = __DEV__ 
    ? 'http://localhost:5000'      // Desarrollo local
    : 'https://tu-api.com';        // Producción
}
```

### Variables de entorno (`.env`)

```env
API_ENDPOINT=http://localhost:5000
MODEL_CONFIDENCE=0.7
```

```javascript
import Constants from 'expo-constants';

const API_ENDPOINT = Constants.expoConfig?.extra?.apiEndpoint || 'http://localhost:5000';
```

## Despliegue

### Opción A: Railway.app (Gratis)
1. Sube código a GitHub
2. Conecta en Railway.app
3. Despliega automáticamente
4. Obtienes URL pública

### Opción B: Render.com (Gratis)
1. Crea Web Service
2. Conecta repositorio
3. Configura: `pip install -r requirements.txt`
4. Start command: `gunicorn main:app`

### Opción C: Docker + AWS/GCP

```dockerfile
FROM python:3.9

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Ventajas del Backend

✅ No necesita TFLite en React Native  
✅ Modelo Python completo sin conversión  
✅ Más fácil de actualizar el modelo  
✅ Funciona en Expo Go  
✅ Compatible con cualquier dispositivo  

## Desventajas

❌ Requiere conexión a internet  
❌ Latencia de red (~100-500ms)  
❌ Costos de servidor  
❌ Privacidad (imágenes salen del dispositivo)  

## Recomendación

**Para desarrollo rápido**: Usa backend API  
**Para producción**: Implementa TFLite nativo + backend como fallback  
**Para MVP**: Backend es suficiente y funciona bien  

---

**Nota**: El código actual en `detectionService.js` ya está preparado para usar cualquiera de estas opciones. Solo necesitas descomentar y configurar la URL del backend.
