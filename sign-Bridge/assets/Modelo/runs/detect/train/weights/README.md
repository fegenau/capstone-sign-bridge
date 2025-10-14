# Modelo YOLO TFLite

Este directorio debe contener el modelo TFLite exportado de YOLO.

## Archivo requerido

Coloca aquí el archivo: `best_float16.tflite`

## Ruta completa esperada

```
assets/Modelo/runs/detect/train/weights/best_float16.tflite
```

## Exportar modelo desde Python

Si tienes el modelo YOLO entrenado en Python, puedes exportarlo con:

```python
from ultralytics import YOLO

# Cargar modelo entrenado
model = YOLO('best.pt')

# Exportar a TFLite
model.export(format='tflite', int8=False)  # Genera best_float16.tflite
```

## Comportamiento si el modelo no existe

Si este archivo no existe:
1. La aplicación funcionará en **modo simulación**
2. Se intentará cargar el modelo automáticamente cada 10 segundos
3. La UI mostrará "Modo Simulación" en el panel de estado
4. No se romperá la funcionalidad de la app

## Tamaño del modelo

- El modelo `.tflite` típicamente pesa entre 5-50 MB
- Asegúrate de que el archivo no esté corrupto
- Verifica los permisos de lectura

## Alternativas

Si no tienes el modelo `.tflite`:
1. Usa el modelo `.pt` y expórtalo
2. Continúa usando el modo simulación para desarrollo
3. El sistema está diseñado para funcionar sin el modelo
