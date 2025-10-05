from ultralytics import YOLO

# --- Rutas y opciones ---
MODEL = r"C:\Users\matia\OneDrive\Documentos\Capstone\capstone-sign-bridge\Modelo\runs\detect\train\weights\best.pt"
IMGSZ = 640          # usa el tamaño con que entrenaste (múltiplo de 32)
NMS = True           # inserta NMS dentro del modelo TFLite

# --- Elegir tipo de export ---
USE_INT8 = False     # True = cuantización INT8 (recomendado para móviles), requiere DATA_YAML
DATA_YAML = r"C:\Users\matia\OneDrive\Documentos\Capstone\capstone-sign-bridge\Modelo\data.yaml" USE_INT8=True

# --- Export ---
model = YOLO(MODEL)
kwargs = dict(format="tflite", imgsz=IMGSZ, nms=NMS)

if USE_INT8:
    kwargs.update(int8=True, data=DATA_YAML)

out = model.export(**kwargs)
print("✓ Export OK →", out)
