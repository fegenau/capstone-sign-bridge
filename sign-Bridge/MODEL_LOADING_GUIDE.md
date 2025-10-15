# 🚀 Guía de Carga del Modelo TFLite

## 📋 Estado Actual

✅ **Completado:**
- react-native-fast-tflite instalado en node_modules
- Modelo best_float16.tflite disponible en assets/Modelo/
- DetectionService actualizado con mejor manejo de errores
- Sistema de fallback a modo simulación

## 🎯 Dos Formas de Usar la App

### Opción 1: Modo Desarrollo con Expo Go (Simulación) 🎲

**Ventajas:**
- ✅ No requiere compilación nativa
- ✅ Rápido para probar UI/UX
- ✅ Hot reload funciona
- ✅ Funciona en cualquier dispositivo con Expo Go

**Limitaciones:**
- ⚠️ No puede cargar el modelo TFLite real
- ⚠️ Usa detección simulada aleatoria

**Cómo usar:**

```powershell
# En la carpeta sign-Bridge
cmd /c "cd /d c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge && npx expo start"

# Escanea el QR con Expo Go
# La app funcionará en modo simulación
```

**Lo que verás en los logs:**
```
🔄 Intentando cargar modelo TFLite (intento 1)...
❌ Error al cargar modelo: react-native-fast-tflite no está disponible
⚠️ Usando modo simulación como fallback
🎯 DetectionService iniciado
📊 Modo: Simulación (fallback)
```

---

### Opción 2: Modo Producción con Compilación Nativa (Modelo Real) 🧠

**Ventajas:**
- ✅ Carga y usa el modelo TFLite real
- ✅ Detección real de señas
- ✅ Mejor rendimiento
- ✅ Experiencia completa

**Requisitos:**
- Android Studio instalado
- SDK de Android configurado
- Dispositivo físico o emulador Android

**Cómo usar:**

#### Paso 1: Prebuild (Genera código nativo)

```powershell
cd sign-Bridge
cmd /c "npx expo prebuild --platform android"
```

Esto generará/actualizará las carpetas nativas:
- `android/` - Proyecto Android Studio completo
- `ios/` - Proyecto Xcode (si tienes macOS)

#### Paso 2: Compilar y Ejecutar

```powershell
# Conecta tu dispositivo Android por USB o inicia el emulador

# Compila e instala en el dispositivo
cmd /c "npx expo run:android"
```

Esto:
1. Compila el código nativo (Java/Kotlin + C++)
2. Incluye react-native-fast-tflite nativo
3. Instala el APK en tu dispositivo
4. Inicia la app

**Lo que verás en los logs (éxito):**
```
🔄 Intentando cargar modelo TFLite (intento 1)...
📦 Cargando asset del modelo...
⬇️ Descargando asset...
📦 Asset del modelo localizado en: file:///data/user/0/com.anonymous.signbridge/files/best_float16.tflite
✅ Archivo del modelo existe (5.23 MB)
🚀 Cargando modelo TFLite nativo...
   Ruta: file:///data/user/0/com.anonymous.signbridge/files/best_float16.tflite
✅ ¡Modelo TFLite cargado exitosamente!
📊 Inputs: 1 tensor(s)
📊 Outputs: 1 tensor(s)
📐 Input shape: [1, 640, 640, 3]
📐 Input data type: float32
📐 Output shape: [1, 8400, 38]
📐 Output data type: float32
🎯 DetectionService iniciado
📊 Modo: Modelo TFLite
```

---

## 🔍 Diagnóstico de Problemas

### Problema: "react-native-fast-tflite no está disponible"

**Causa:** La app está corriendo en Expo Go, que no soporta módulos nativos personalizados.

**Solución:**
```powershell
# Opción A: Usar modo simulación (más rápido)
# Solo ejecuta: npx expo start
# La app funcionará con detección simulada

# Opción B: Compilar nativamente (modelo real)
cmd /c "npx expo prebuild --platform android"
cmd /c "npx expo run:android"
```

---

### Problema: "Archivo del modelo no encontrado"

**Causa:** El modelo no está en la ubicación correcta o no se copió a los assets.

**Solución:**
```powershell
# Verificar que el archivo existe
Test-Path "c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge\assets\Modelo\best_float16.tflite"
# Debe retornar: True

# Si retorna False, copia el modelo:
# Desde: Modelo\runs\detect\train\weights\best_float16.tflite
# Hacia: sign-Bridge\assets\Modelo\best_float16.tflite
```

---

### Problema: Error al compilar con expo run:android

**Causa:** SDK de Android no configurado o Android Studio faltante.

**Solución:**

1. **Instala Android Studio:** https://developer.android.com/studio
2. **Configura SDK:**
   - Abre Android Studio
   - Settings → Appearance & Behavior → System Settings → Android SDK
   - Instala Android 13.0 (API 33) o superior
3. **Configura variables de entorno:**
   ```powershell
   $env:ANDROID_HOME = "C:\Users\Sebastian_Medina\AppData\Local\Android\Sdk"
   $env:PATH += ";$env:ANDROID_HOME\platform-tools"
   ```
4. **Reintentar:**
   ```powershell
   cmd /c "npx expo run:android"
   ```

---

## 📱 Probar la Detección

### En Modo Simulación (Expo Go):

1. Ejecuta: `npx expo start`
2. Escanea QR con Expo Go
3. Navega a "Alphabet Detection"
4. Verás detecciones aleatorias cada 1.5 segundos
5. El icono 🎲 indica que es simulado
6. Útil para probar UI/UX sin compilar

### En Modo Real (Compilado):

1. Ejecuta: `npx expo run:android`
2. La app se instala en tu dispositivo
3. Navega a "Alphabet Detection"
4. Apunta la cámara a una mano haciendo una seña
5. El modelo YOLO detectará la letra/número
6. Verás la detección real con confianza
7. Sin icono 🎲 (es detección real)

---

## 🎛️ Configuración del Servicio

El archivo `utils/services/detectionService.js` tiene configuración ajustable:

```javascript
const DETECTION_CONFIG = {
  minConfidence: 0.7,       // Confianza mínima: 70%
  maxConfidence: 95,        // Máxima para simulación
  processingTime: 800,      // Tiempo de procesamiento: 0.8s
  detectionInterval: 1500,  // Intervalo entre detecciones: 1.5s
  modelRetryInterval: 10000, // Reintentar cargar modelo: 10s
  modelRelativePath: 'Modelo/best_float16.tflite',
};
```

**Ajustes recomendados:**

- `minConfidence`: Reducir a 0.5 si hay pocas detecciones
- `detectionInterval`: Reducir a 1000 para detección más rápida
- `modelRetryInterval`: Aumentar a 30000 para menos logs

---

## 🧪 Testing Rápido

### Test 1: Verificar instalación de dependencias

```powershell
Test-Path "c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge\node_modules\react-native-fast-tflite"
# Debe retornar: True
```

### Test 2: Verificar modelo

```powershell
Test-Path "c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge\assets\Modelo\best_float16.tflite"
# Debe retornar: True
```

### Test 3: Iniciar en modo desarrollo

```powershell
cd sign-Bridge
cmd /c "npx expo start"
# Escanea QR y prueba
```

### Test 4: Ver logs del servicio

En la app, abre la consola de React Native (sacude el dispositivo o presiona Cmd+D/Ctrl+M) y mira los logs.

Busca:
- `🔄 Intentando cargar modelo...`
- `✅ Modelo cargado exitosamente` o `⚠️ Usando modo simulación`

---

## 📊 Próximos Pasos Recomendados

### 1. Probar en Expo Go (5 minutos)
```powershell
cmd /c "cd /d c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge && npx expo start"
```
- Verifica que la UI funciona
- Confirma que el modo simulación funciona
- Prueba la navegación

### 2. Compilar para Android (30-60 minutos)
```powershell
cmd /c "cd /d c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge && npx expo prebuild --platform android"
cmd /c "cd /d c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge && npx expo run:android"
```
- Primera compilación toma más tiempo
- Requiere Android Studio configurado
- Genera APK con módulos nativos

### 3. Implementar Preprocessing de Imágenes
El modelo se carga correctamente, pero falta el preprocessing:
- Redimensionar frame de cámara a 640x640
- Normalizar píxeles (0-255 → 0-1)
- Convertir a Float32Array

Ver: `prepareImageForModel()` en detectionService.js

---

## ❓ FAQ

**Q: ¿Puedo usar el modelo en Expo Go?**
A: No. Expo Go no soporta módulos nativos personalizados. Usa `expo run:android` para compilar.

**Q: ¿Funciona en iOS?**
A: Sí, pero necesitas macOS y Xcode. Ejecuta `npx expo run:ios`.

**Q: ¿Puedo distribuir el APK?**
A: Sí. Después de compilar, el APK está en `android/app/build/outputs/apk/`.

**Q: ¿Cómo actualizo el modelo?**
A: Reemplaza `assets/Modelo/best_float16.tflite` y recompila con `expo run:android`.

**Q: ¿El modo simulación es útil?**
A: Sí! Perfecto para desarrollo de UI/UX sin esperar compilaciones.

---

## 🆘 Ayuda

Si tienes problemas:

1. **Revisa los logs** en la terminal y en la app
2. **Verifica requisitos**: node_modules, archivo del modelo, SDK
3. **Limpia y recompila**:
   ```powershell
   cmd /c "cd /d c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge && npx expo prebuild --clean"
   cmd /c "cd /d c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge && npx expo run:android"
   ```

---

**¡Éxito! 🎉** Tu modelo está listo para cargarse. Ahora solo necesitas elegir cómo quieres ejecutar la app.
