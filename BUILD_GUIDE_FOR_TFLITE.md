# 🚀 Guía de Build para APK con Modelo TFLite

**Fecha:** 15 de Octubre, 2025  
**Commit:** `aa60ff4`  
**Branch:** `feature/CSB-47/integrate-CNN-model-unreleased`

---

## 📋 Situación Actual

### ✅ Problema Identificado y Resuelto

**Problema:**
```
ERROR: Invariant Violation: TurboModuleRegistry.getEnforcing(...): 
'Tflite' could not be found. Verify that a module by this name is 
registered in the native binary.
```

**Causa Raíz:**
- El APK instalado fue compilado **ANTES** de agregar `react-native-fast-tflite`
- Metro servía el código JS nuevo pero el APK no tenía módulos nativos
- Los módulos nativos de TFLite **NO estaban compilados** en el binario

**Solución Aplicada:**
1. ✅ Reset a commit funcional (24a8705)
2. ✅ Agregadas dependencias faltantes:
   - `react-native-worklets@0.5.1`
   - `react-native-worklets-core@^1.3.3`
3. ✅ Commit y push para triggear GitHub Actions
4. ⏳ Build en progreso...

---

## 🔧 Configuración del Build

### Versiones Clave

| Componente | Versión | Notas |
|-----------|---------|-------|
| **Kotlin** | 2.0.0 | Versión del commit funcional |
| **react-native-fast-tflite** | 1.6.1 | Módulo nativo TFLite |
| **react-native-worklets-core** | 1.3.3 | Dependencia de fast-tflite |
| **react-native-worklets** | 0.5.1 | Requerido por reanimated |
| **react-native-reanimated** | ~4.1.1 | Usa worklets plugin |
| **Expo SDK** | ~54.0.9 | Framework base |
| **React Native** | 0.81.4 | Versión base |

### Workflow de GitHub Actions

**Ubicación:** `.github/workflows/build-android.yml`

**Pasos clave:**
1. ✅ Setup Node.js 22
2. ✅ Setup Java 17
3. ✅ Setup Android SDK
4. ✅ npm install --legacy-peer-deps
5. ✅ expo prebuild --platform android --clean
6. ✅ Crear splashscreen logo
7. 🔨 **gradlew assembleDebug** ← Compila módulos nativos
8. 📤 Upload APK a Artifacts

**Tipo de Build:** **Debug APK** (no Release)

---

## 📦 Qué Incluye el APK

### Módulos Nativos Compilados

El APK incluirá:

1. **TensorFlow Lite Native Module**
   - Inferencia nativa de modelos .tflite
   - GPU acceleration support (si disponible)
   - Optimizaciones nativas para ARM

2. **Worklets Core**
   - Ejecución en threads separados
   - Requerido para procesamiento de imagen en tiempo real

3. **Fast TFLite Bindings**
   - Bindings nativos entre JS y TFLite C++
   - Gestión de memoria optimizada

4. **Modelo TFLite Embedido**
   - `best_float16.tflite` (5.96 MB)
   - Incluido en assets del APK
   - Listo para carga nativa

---

## ⏱️ Tiempo Estimado de Build

**Total:** ~20-25 minutos

Desglose:
- Setup (Node, Java, Android SDK): ~3 min
- npm install: ~2 min
- expo prebuild: ~3 min
- **Compilación Gradle (crítico)**: ~12-15 min
  - Descarga dependencias nativas
  - Compila C++ de TFLite
  - Compila Kotlin/Java
  - Genera APK
- Upload artifacts: ~2 min

---

## 📥 Cómo Descargar el APK

### Opción 1: GitHub Actions Artifacts (Recomendado)

1. Ve a: https://github.com/fegenau/capstone-sign-bridge/actions
2. Busca el workflow más reciente (commit `aa60ff4`)
3. Espera a que aparezca **✅ Build completado**
4. Scroll hasta **Artifacts**
5. Descarga: `app-debug-apk` (archivo .zip)
6. Descomprime el .zip para obtener `app-debug.apk`

### Opción 2: Via CLI

```powershell
# Listar workflows recientes
gh run list --branch feature/CSB-47/integrate-CNN-model-unreleased

# Descargar artifacts del último run
gh run download --name app-debug-apk
```

---

## 📱 Instalación y Prueba

### 1. Desinstalar APK Anterior

```powershell
adb uninstall com.anonymous.signbridge
```

**Importante:** El APK anterior **NO** tenía módulos nativos de TFLite.

### 2. Instalar Nuevo APK

```powershell
adb install -r app-debug.apk
```

Espera: `Success`

### 3. Lanzar App (SIN Metro)

**CRÍTICO:** NO conectar a Metro. El APK debe funcionar standalone.

```powershell
adb shell am start -n com.anonymous.signbridge/.MainActivity
```

### 4. Verificar Logs Nativos

```powershell
# Limpiar logs anteriores
adb logcat -c

# Monitorear logs de TFLite
adb logcat | Select-String -Pattern "TFLite|Tflite|tflite|Modelo|detectionService" -CaseSensitive:$false
```

---

## ✅ Validación de Éxito

### Logs Esperados (Éxito ✅)

Si el modelo carga **NATIVAMENTE**, deberías ver:

```
[detectionService] 🔄 Cargando modelo TFLite...
[detectionService] ✅ Modelo TFLite cargado exitosamente
[detectionService] 📊 Input shape: [1, 640, 640, 3]
[detectionService] 📊 Output shape: [1, 40, 8400]
[detectionService] 🎯 Modo: Modelo TFLite
[detectionService] ⚡ Modelo listo para inferencia
```

**Clave:** Debe decir **"Modo: Modelo TFLite"** (NO "Simulación")

### Logs de Falla (❌)

Si ves esto, el build falló:

```
[detectionService] ⚠️ react-native-fast-tflite no disponible
[detectionService] 🔄 Usando modo de simulación
[detectionService] 🎯 Modo: Simulación
```

O si ves:

```
ERROR: Invariant Violation: TurboModuleRegistry.getEnforcing(...): 
'Tflite' could not be found.
```

→ El módulo nativo no se compiló correctamente.

---

## 🧪 Pruebas de Funcionalidad

### Test 1: Verificar Carga del Modelo

```javascript
// Debería aparecer en logs al iniciar la app
"✅ Modelo TFLite cargado exitosamente"
```

### Test 2: Verificar Input Shape

```javascript
// Debe ser exactamente:
"Input shape: [1, 640, 640, 3]"
```

### Test 3: Verificar No-Simulación

```javascript
// DEBE decir:
"Modo: Modelo TFLite"

// NO debe decir:
"Modo: Simulación"
```

### Test 4: Abrir Cámara

1. Navega a la pantalla de detección
2. La cámara debe abrirse
3. NO debe mostrar errores de permisos

### Test 5: Inferencia Real (Próximo paso)

Una vez que el modelo cargue, implementar:
- prepareImageForModel() → Resize a 640x640, normalizar
- Pasar frame a model.predict()
- Interpretar outputs YOLO v8

---

## 🐛 Troubleshooting

### Si el Build Falla en GitHub Actions

**Error común:** Kotlin version incompatibility

**Solución:**
```bash
# Verificar gradle.properties
grep "kotlinVersion" sign-Bridge/android/gradle.properties

# Debe mostrar:
android.kotlinVersion=2.0.0
```

### Si el APK no se genera

**Verificar logs del workflow:**
1. Ve a GitHub Actions
2. Click en el workflow fallido
3. Busca sección "Build Android APK"
4. Revisa errores de Gradle

**Errores comunes:**
- Out of memory → Aumentar JVM heap
- NDK missing → Workflow instala automáticamente
- Path too long → Por eso usamos GitHub Actions (Linux)

### Si Metro se Conecta Automáticamente

**Problema:** El APK intenta conectarse a Metro

**Solución:**
```powershell
# Detener Metro completamente
taskkill /F /IM node.exe

# Desconectar WiFi temporalmente
# O usar modo avión en el dispositivo
```

---

## 📊 Diferencias: Simulación vs Nativo

| Aspecto | Simulación ❌ | Nativo ✅ |
|---------|--------------|----------|
| **Carga** | Instántanea (fake) | ~2-3 seg (real) |
| **Inferencia** | Retorna null | Retorna tensores |
| **Performance** | N/A | GPU accelerated |
| **Logs** | "Modo: Simulación" | "Modo: Modelo TFLite" |
| **Funcionalidad** | No detecta nada | Detecta señas reales |
| **Módulos nativos** | NO compilados | SÍ compilados |

---

## 🎯 Próximos Pasos (Después del APK)

### 1. Validar Carga Nativa ✅

- [ ] APK instalado sin Metro
- [ ] Logs muestran "Modelo TFLite" (NO simulación)
- [ ] Input/output shapes correctos

### 2. Implementar Preprocesamiento

```javascript
// En detectionService.js
prepareImageForModel(frame) {
  // 1. Resize frame a 640x640
  const resized = resize(frame, 640, 640);
  
  // 2. Normalizar píxeles (0-255 → 0-1)
  const normalized = normalize(resized);
  
  // 3. Convertir a Float32Array [1,640,640,3]
  return toFloat32Array(normalized);
}
```

### 3. Implementar Inferencia

```javascript
async detectSign(frame) {
  const input = this.prepareImageForModel(frame);
  const output = await this.model.predict(input);
  
  // output shape: [1, 40, 8400]
  const detections = this.parseYOLOv8Output(output);
  
  return detections;
}
```

### 4. Interpretar Outputs YOLO v8

```javascript
parseYOLOv8Output(output) {
  // Output: [1, 40, 8400]
  // 40 = 4 (bbox coords) + 36 (clases A-Z, 0-9)
  // 8400 = número de detecciones posibles
  
  const detections = [];
  
  for (let i = 0; i < 8400; i++) {
    const confidence = Math.max(...output.slice(4, 40)); // Max class confidence
    
    if (confidence > 0.7) { // Threshold 70%
      const bbox = output.slice(0, 4); // x, y, w, h
      const classId = argmax(output.slice(4, 40));
      const label = LABELS[classId]; // A-Z, 0-9
      
      detections.push({ bbox, label, confidence });
    }
  }
  
  return detections;
}
```

### 5. Visualizar Detecciones

```javascript
// Dibujar bounding boxes en cámara
detections.forEach(det => {
  drawBox(det.bbox, det.label, det.confidence);
});
```

---

## 📞 Monitoreo del Build

**URL del Build:** https://github.com/fegenau/capstone-sign-bridge/actions

**Commit a Monitorear:** `aa60ff4`

**Mensaje del Commit:**
```
fix: Agregar react-native-worklets y react-native-worklets-core para TFLite
```

**Rama:** `feature/CSB-47/integrate-CNN-model-unreleased`

---

## 📝 Notas Importantes

### ⚠️ APK Debug vs Release

Este build genera **Debug APK**, no Release:

**Debug APK:**
- ✅ Más rápido de compilar
- ✅ Módulos nativos incluidos
- ✅ Modelo TFLite funciona igual
- ⚠️ Mayor tamaño (~200+ MB)
- ⚠️ No optimizado para producción

**Para Release APK** (después):
- Cambiar workflow: `assembleDebug` → `assembleRelease`
- Requiere keystore para firma
- Optimizaciones R8/Proguard
- APK más pequeño (~50-80 MB)

### 🔒 Seguridad

Este APK es **unsigned** (sin firma):
- ✅ OK para testing interno
- ❌ NO para Google Play Store
- ❌ NO para distribución pública

### 💾 Tamaño Esperado

**APK Debug con TFLite:**
- Base (React Native + Expo): ~80 MB
- TFLite runtime: ~20 MB
- Modelo (best_float16.tflite): ~6 MB
- Worklets + otras deps: ~30 MB
- **Total estimado:** ~200-250 MB

**Artifacts .zip:**
- Comprimido: ~80-100 MB

---

## ✅ Checklist Final

Antes de considerar el build exitoso:

- [ ] Build en GitHub Actions completado sin errores
- [ ] Artifact `app-debug-apk` disponible para descarga
- [ ] APK instalado en dispositivo/emulador
- [ ] App lanza sin crashes
- [ ] Logs muestran "✅ Modelo TFLite cargado exitosamente"
- [ ] Logs muestran "Modo: Modelo TFLite" (NO Simulación)
- [ ] Input shape: [1, 640, 640, 3] ✅
- [ ] Output shape: [1, 40, 8400] ✅
- [ ] NO hay errores "TurboModuleRegistry" ✅
- [ ] Cámara abre correctamente ✅

---

**Estado Actual:** ⏳ Build en progreso (~20-25 min)

**Próxima Actualización:** Cuando el build complete o falle

**Build URL:** https://github.com/fegenau/capstone-sign-bridge/actions/runs/[CHECK_LATEST]
