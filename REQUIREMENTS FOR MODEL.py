import cv2
import time
from ultralytics import YOLO

# === Parámetros ajustables ===
MODEL_PATH = "../capstone-sign-bridge/sign-Bridge/assets/Modelo/runs/detect/train/weights/best_float16.tflite"  # ruta al modelo .tflite
CONF_THRESH = 0.7     # confianza mínima
DEBOUNCE_SEC = 1.5    # evita repetir la misma letra muy rápido
WINDOW_TITLE = "Traductor de Señas Chilenas (.tflite)"

# === Cargar modelo (.tflite) ===
# Nota: Asegúrate que MODEL_PATH apunte al archivo .tflite real (no a una carpeta 'variables/')
#       Ejemplo típico export YOLOv8: runs/detect/train/weights/best_float16.tflite
model = YOLO(MODEL_PATH)

# === Inicializar cámara ===
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    raise IOError("No se pudo abrir la cámara (índice 0). Prueba con 1, 2, etc.")

# === Estado de texto acumulado ===
sentence = ""
last_detected = None
last_time = time.time()

# === Loop principal ===
while True:
    ret, frame = cap.read()
    if not ret:
        print("No se pudo leer frame de la cámara.")
        break

    # Predicción (Ultralytics soporta .tflite si tienes tflite-runtime o tensorflow instalado)
    # Puedes ajustar imgsz si quieres: model.predict(frame, imgsz=640, ...)
    results = model.predict(
        source=frame,
        conf=CONF_THRESH,
        iou=0.45,
        verbose=False
    )

    # Dibuja anotaciones (cajas, labels, etc.)
    annotated_frame = results[0].plot()

    # Procesar detecciones
    # results es una lista de Result; cada r.boxes contiene las detecciones
    for r in results:
        if r.boxes is None or len(r.boxes) == 0:
            continue

        for box in r.boxes:
            # Índice de clase detectada
            cls = int(box.cls[0])
            # Nombre de la clase mapeado (ej: 'A', 'B', 'C', 'Hola', etc.)
            label = model.names.get(cls, str(cls)) if hasattr(model, "names") else str(cls)

            # Evitar repetir la misma letra/palabra en intervalos muy cortos
            now = time.time()
            if label == last_detected and (now - last_time) < DEBOUNCE_SEC:
                continue

            # Agregar al texto acumulado
            sentence += label
            last_detected = label
            last_time = now

    # Overlay: texto acumulado y tips
    h = annotated_frame.shape[0]
    cv2.rectangle(annotated_frame, (0, 0), (annotated_frame.shape[1], 80), (0, 0, 0), -1)
    cv2.putText(annotated_frame, sentence, (20, 50),
                cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3, cv2.LINE_AA)

    cv2.putText(annotated_frame, "[ESC] salir  [Borrar]=Backspace  [Espacio]=espacio  [C]=limpiar",
                (20, h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1, cv2.LINE_AA)

    cv2.imshow(WINDOW_TITLE, annotated_frame)

    # Teclas: ESC para salir, Backspace para borrar último char, Space para espacio, 'c' para limpiar
    key = cv2.waitKey(1) & 0xFF
    if key == 27:  # ESC
        break
    elif key == 8:  # Backspace
        sentence = sentence[:-1]
    elif key == 32:  # Space
        sentence += " "
    elif key in (ord('c'), ord('C')):
        sentence = ""

cap.release()
cv2.destroyAllWindows()