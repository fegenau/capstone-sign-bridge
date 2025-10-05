# Configuración del Modelo CNN - TensorFlow Lite

## 📋 Dependencias Instaladas

Las siguientes dependencias ya están instaladas en el proyecto:

```bash
npm install @tensorflow/tfjs --legacy-peer-deps
npm install @tensorflow/tfjs-react-native --legacy-peer-deps
npm install expo-gl expo-gl-cpp --legacy-peer-deps
npm install expo-file-system --legacy-peer-deps
```

## 🧠 Modelo CNN

**Ubicación del modelo:** 
```
D:\Proyecto-capstone\capstone-sign-bridge\Modelo\runs\detect\train\weights\best_saved_model\best_float32.tflite
```

## 🔧 Configuración

El modelo está configurado en `detectionService.js` con:
- **Entrada esperada:** 224x224 píxeles, RGB
- **Normalización:** Píxeles divididos por 255 (rango 0-1)
- **Salida:** Probabilidades para 26 letras del alfabeto (A-Z)

## 🚀 Inicialización

Para usar el servicio de detección:

```javascript
import { detectionService } from './utils/services/detectionService';

// Inicializar el servicio
await detectionService.startDetection();

// Registrar callback para recibir resultados
detectionService.onDetection((result) => {
  console.log('Resultado:', result);
});

// Procesar una imagen
const result = await detectionService.forceDetection(imageUri);
```

## ⚠️ Notas Importantes

1. **Formato del modelo:** Asegúrate de que el archivo `.tflite` sea compatible con TensorFlow.js
2. **Tamaño de imagen:** Las imágenes se redimensionan automáticamente a 224x224
3. **Memoria:** Los tensores se liberan automáticamente para evitar memory leaks
4. **Plataforma:** Funciona en iOS y Android con React Native/Expo

## 🔍 Debugging

Para verificar el estado del modelo:

```javascript
const status = detectionService.getStatus();
console.log('Estado del servicio:', status);
```

Logs disponibles:
- `🧠` Carga del modelo
- `🔍` Procesamiento de imagen  
- `✅` Predicción exitosa
- `❌` Errores