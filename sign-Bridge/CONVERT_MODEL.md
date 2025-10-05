# 🔄 Conversión de Modelo TensorFlow Lite a TensorFlow.js

## ❌ Problema Actual

El archivo `best_float32.tflite` no se puede cargar directamente con TensorFlow.js en React Native. Necesitas convertir el modelo al formato compatible.

## ✅ Solución: Convertir el Modelo

### Opción 1: Usar TensorFlow.js Converter (Recomendado)

```bash
# Instalar el convertidor
pip install tensorflowjs

# Convertir el modelo .tflite a formato TensorFlow.js
tensorflowjs_converter \
  --input_format=tf_lite \
  --output_format=tfjs_graph_model \
  D:/Proyecto-capstone/capstone-sign-bridge/Modelo/runs/detect/train/weights/best_saved_model/best_float32.tflite \
  D:/Proyecto-capstone/capstone-sign-bridge/sign-Bridge/assets/model/
```

### Opción 2: Usar Convertidor Online

1. Ve a: https://www.tensorflow.org/js/guide/conversion
2. Sube tu archivo `.tflite`
3. Selecciona formato de salida: "Graph Model"
4. Descarga los archivos generados (`model.json` + `.bin`)

## 📁 Estructura Esperada Después de la Conversión

```
sign-Bridge/
  assets/
    model/
      model.json          # Arquitectura del modelo
      model_weights.bin   # Pesos del modelo (uno o varios archivos .bin)
```

## 🔧 Actualizar Configuración

Después de la conversión, actualiza `detectionService.js`:

```javascript
const DETECTION_CONFIG = {
  minConfidence: 30,
  maxConfidence: 95,
  modelPath: './assets/model/model.json'  // ← Cambiar a ruta del modelo convertido
};
```

## 🚀 Estado Actual (Modo Desarrollo)

Mientras tanto, el servicio funciona en **modo simulación** para permitir el desarrollo:

- ✅ La interfaz funciona normalmente
- ✅ Genera predicciones realistas simuladas
- ⚠️ Las predicciones NO son del modelo real
- ⚠️ Marcado como `isSimulation: true` en los resultados

## 📋 Comandos de Conversión Específicos

```bash
# 1. Instalar dependencias Python
pip install tensorflow tensorflowjs

# 2. Convertir modelo
tensorflowjs_converter \
  --input_format=tf_lite \
  --output_format=tfjs_graph_model \
  --quantize_float16 \
  "D:/Proyecto-capstone/capstone-sign-bridge/Modelo/runs/detect/train/weights/best_saved_model/best_float32.tflite" \
  "D:/Proyecto-capstone/capstone-sign-bridge/sign-Bridge/assets/model/"

# 3. Verificar archivos generados
ls -la "D:/Proyecto-capstone/capstone-sign-bridge/sign-Bridge/assets/model/"
```

## ⚡ Ventajas del Modelo Convertido

- ✅ **Compatibilidad total** con TensorFlow.js
- ✅ **Predicciones reales** del modelo entrenado
- ✅ **Optimización** para web y mobile
- ✅ **Menor tamaño** con cuantización
- ✅ **Mejor rendimiento** en JavaScript

## 🔍 Verificación del Modelo

Una vez convertido, verifica que funcione:

```javascript
import { detectionService } from './utils/services/detectionService';

// El modelo debería cargar sin simulación
const status = detectionService.getStatus();
console.log('Modelo real cargado:', !status.isSimulation);
```

---

**Nota:** El modo simulación actual te permite desarrollar la interfaz mientras preparas la conversión del modelo.