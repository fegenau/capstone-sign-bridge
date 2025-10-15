# ✅ APK INSTALADO - Guía de Verificación

## 🎉 Estado Actual

✅ **APK instalado exitosamente en el emulador**
- Archivo: `app-debug.apk` (213 MB)
- Ubicación: `C:\Users\Sebastian_Medina\Downloads\app-debug-apk\`
- Dispositivo: `emulator-5554`
- Package: `com.anonymous.signbridge`

---

## 🔍 PASOS PARA VERIFICAR EL MODELO TFLITE

### Opción 1: Monitorear Logs (RECOMENDADO)

#### 1. Abrir terminal y ejecutar:
```powershell
cd "c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge"
.\monitor-logs.ps1
```

#### 2. Mientras el script corre, en el emulador:
- Abre la app SignBridge
- Navega a la pantalla de detección de señas
- Observa los logs en la terminal

#### 3. Buscar estos mensajes:

✅ **SI EL MODELO CARGA CORRECTAMENTE:**
```
✅ ¡Modelo TFLite cargado exitosamente!
📐 Input shape: [1, 640, 640, 3]
📐 Output shape: [1, 40, 8400]
📊 Modelo: best_float16.tflite
```

❌ **SI HAY ERRORES:**
```
❌ Error cargando modelo TFLite: [descripción del error]
```

---

### Opción 2: Logs Manuales

```powershell
# Ver todos los logs de React Native
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" logcat ReactNativeJS:V *:S

# Buscar específicamente mensajes del modelo
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" logcat -d | Select-String "TFLite|Modelo"
```

---

## 🧪 PROBAR LA DETECCIÓN

### 1. Abrir la App
```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell am start -n com.anonymous.signbridge/.MainActivity
```

### 2. Navegar en la App
1. Espera a que cargue la pantalla principal
2. Ve a la sección de "Detección de Señas" o "Alphabet Detection"
3. Concede permisos de cámara si lo pide

### 3. Verificar Cámara
- La cámara debería activarse
- Debería aparecer el preview de la cámara del emulador

---

## 🐛 TROUBLESHOOTING

### Problema: No veo logs de TFLite

**Posibles causas:**
1. El modelo aún no se ha intentado cargar (no has abierto la pantalla de detección)
2. El módulo nativo no está disponible
3. La ruta del modelo es incorrecta

**Solución:**
```powershell
# Ver TODOS los logs de la app
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" logcat -v time | Select-String "signbridge"
```

---

### Problema: Error "Module not found"

**Causa:** `react-native-fast-tflite` no se compiló correctamente

**Verificar:**
```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell pm list packages | Select-String "signbridge"
```

Debería mostrar: `package:com.anonymous.signbridge`

---

### Problema: Error de permisos de cámara

**Conceder permisos manualmente:**
```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell pm grant com.anonymous.signbridge android.permission.CAMERA
```

---

## 📊 INFORMACIÓN DEL APK

```
Tamaño: 213 MB
Arquitecturas: arm64-v8a, armeabi-v7a, x86, x86_64
Min SDK: 24 (Android 7.0)
Target SDK: 34 (Android 14)

Librerías nativas incluidas:
- libreact_codegen_rnreanimated.so
- libreact_codegen_rngesturehandler_codegen.so
- libreact_codegen_safeareacontext.so
- libreact_codegen_rnscreens.so
- libreactnativeexpo.so
- libtflite.so ← ¡Modelo TFLite!
```

---

## 🎯 QUÉ ESPERAR

### 1. Al Abrir la App (Primera vez)
- Splash screen con logo
- Carga de módulos React Native (5-10 seg)
- Pantalla principal

### 2. Al Ir a Detección
- Solicitud de permisos de cámara
- Carga del modelo TFLite (2-5 seg)
- Preview de cámara activo

### 3. Al Hacer una Seña
- **SI TODO FUNCIONA:** Detección en tiempo real, bounding boxes, etiquetas
- **SI FALTA PREPROCESSING:** Cámara funciona pero no hay detección (esto es normal por ahora)

---

## 📝 PRÓXIMOS PASOS

### ✅ Si el Modelo Carga Correctamente:

**TODO #1: Implementar Preprocessing**
```javascript
// En detectionService.js
function prepareImageForModel(frame) {
  // 1. Redimensionar a 640x640
  // 2. Normalizar pixels (0-255 → 0-1)
  // 3. Convertir a Float32Array
  // 4. Formato: [1, 640, 640, 3]
  return preprocesedData;
}
```

**TODO #2: Procesar Outputs**
```javascript
// Interpretar resultados YOLO v8
// Output shape: [1, 40, 8400]
// 40 = 4 bbox coords + 36 classes (A-Z, 0-9)
```

---

### ❌ Si Hay Errores:

1. **Captura los logs completos:**
   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" logcat -d > logs.txt
   ```

2. **Busca específicamente:**
   - "react-native-fast-tflite"
   - "TensorflowModel"
   - "tflite"
   - Mensajes de error en rojo

3. **Verifica que el modelo esté en el APK:**
   - Debería estar en `assets/Modelo/best_float16.tflite`
   - Tamaño: ~6 MB

---

## 🚀 COMANDOS ÚTILES

```powershell
# Reiniciar la app
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell am force-stop com.anonymous.signbridge
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell am start -n com.anonymous.signbridge/.MainActivity

# Ver uso de memoria
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell dumpsys meminfo com.anonymous.signbridge

# Desinstalar (si necesitas reinstalar)
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" uninstall com.anonymous.signbridge

# Reinstalar
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r app-debug.apk
```

---

## ✨ ¡LISTO!

Ahora ejecuta:
```powershell
.\monitor-logs.ps1
```

Y abre la app en el emulador. Deberías ver los logs del modelo cargándose. 🎉
