# SignBridge - Python Camera Server

Real-time hand landmark detection with MediaPipe and LSTM model inference.

## Contents

- `camera_simple.py` — Flask MJPEG server with MediaPipe + TensorFlow
- `server.py` — REST API server (no camera)
- `demo_model.py` — Synthetic demos for the model
- `visualize_model.py` — Model summary and test prediction
- `test_camera_capture.py` — Quick index test
- `test_all_cameras.py` — Exhaustive camera backend test
- `best_model.keras` — Trained model (67 classes)
- `labels.json` — Class labels
- `requirements.txt` — Reproducible deps for Windows/Python 3.11

## Quick start (Windows PowerShell)

```powershell
# 1) Create and activate a virtual environment (recommended)
python -m venv .venv; .\.venv\Scripts\Activate.ps1

# 2) Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 3) Run the real-time camera server
python camera_simple.py
# Open http://localhost:5001
```

If the page carga pero ves ruido/estática:

- Cierra otras apps que usen la cámara (Teams/Zoom/Skype/Cámara)
- Ve a Configuración → Privacidad y seguridad → Cámara y habilita permisos (incluye apps de escritorio)
- Ejecuta `python test_all_cameras.py` para validar el backend DirectShow

## Ports

- Default: `5001` (set via `PORT` env var)

```powershell
$env:PORT=5002; python camera_simple.py
```

## Notes

- TensorFlow 2.15 requiere `numpy<2`; ya lo fijamos a 1.26.4
- MediaPipe 0.10.21 funciona en Windows con OpenCV 4.11
- Usa backend DirectShow en Windows si MSMF no entrega frames
