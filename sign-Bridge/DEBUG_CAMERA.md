# 📷 Camera Debugging Guide - Black Preview Fix

**Last Updated:** 2025-11-13
**Status:** 🚀 Soluciones documentadas y probadas

---

## 🔴 Problema: Cámara Negra / Sin Preview

### Síntomas
- ✅ Permisos concedidos
- ✅ Cámara abre sin errores
- ❌ Preview queda completamente negro
- ❌ No aparecen frames de video
- ❌ MediaPipe recibe datos nulos

### Causas Comunes

| Causa | Síntoma | Solución |
|-------|--------|----------|
| **PreviewFormat incorrecto** | Negro absoluto | Usar `NATIVE` o `RGB` |
| **onCameraReady no disparado** | No hay frames | Implementar callback onCameraReady |
| **Permisos insuficientes** | Error inmediato | Solicitar en manifesto |
| **Dispositivo sin cámara** | Error de inicialización | Verificar dispositivo |
| **Exposición/Enfoque automático deshabilitado** | Imagen oscura/borrosa | Habilitar `autoFocus` y `whiteBalance` |
| **Framebuffer vacío** | Sin preview inicial | Esperar onCameraReady |

---

## 🔧 Soluciones Técnicas

### 1️⃣ Configuración de Camera Correcta

```javascript
// ✅ CORRECTO - Configuración completa
<Camera
  ref={cameraRef}
  style={styles.camera}
  type={facing}

  // CRÍTICO: PreviewFormat
  pictureSize="640x480"
  previewFormat="NATIVE"  // NO usar 'jpeg'

  // Enfoque y exposición
  autoFocus="on"          // IMPORTANTE: debe estar ON
  flashMode="off"
  whiteBalance="auto"

  // Eventos
  onCameraReady={handleCameraReady}
  onMountError={(error) => handleCameraError(error)}

  // Performance
  ratio="4:3"
  frameRate={30}
/>
```

### 2️⃣ Implementar onCameraReady

```javascript
const handleCameraReady = useCallback(async () => {
  cameraDebugger.logCameraReady();

  // Crucial: Validar que camera está lista ANTES de capturar
  setIsCameraReady(true);

  // Solo entonces iniciar captura
  if (!isDetecting) {
    startDetection();
  }
}, [isDetecting]);
```

### 3️⃣ Retry Logic con Exponential Backoff

```javascript
const initCameraWithRetry = async (maxAttempts = 3) => {
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      cameraDebugger.logCameraInitStart();

      // Solicitar permisos
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Camera permission denied');
      }

      cameraDebugger.logPermissionStatus(true);

      // Esperar a que camera esté lista
      setIsCameraReady(false);

      // onCameraReady se disparará automáticamente
      return true;

    } catch (error) {
      attempt++;
      cameraDebugger.logRetry(attempt, error.message);

      if (attempt < maxAttempts) {
        // Exponential backoff: 500ms, 1s, 2s
        const delayMs = 500 * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new Error('Camera initialization failed after retries');
};
```

### 4️⃣ Logging Cada 100ms

```javascript
useEffect(() => {
  const loggingInterval = setInterval(() => {
    if (isCameraReady && isDetecting) {
      const report = cameraDebugger.getMetricsReport();

      // Log cada 100ms
      console.log(`📊 Camera Health:`, {
        framesPerSecond: (report.framesCaptured / (report.cameraInitTime / 1000)).toFixed(1),
        dropRate: report.dropRate,
        avgFrameTime: report.averageFrameTime,
        status: report.health.performance,
      });
    }
  }, 100);

  return () => clearInterval(loggingInterval);
}, [isCameraReady, isDetecting]);
```

### 5️⃣ Validación de Frames

```javascript
const captureAndValidateFrame = async () => {
  try {
    if (!cameraRef.current) {
      cameraDebugger.log('❌ Camera ref is null', 'ERROR');
      return null;
    }

    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
      base64: false,
      skipProcessing: false,
    });

    // Validar que tenemos datos
    if (!photo || !photo.uri) {
      cameraDebugger.logFrameCapture(frameCount, false);
      return null;
    }

    cameraDebugger.logFrameCapture(frameCount, true, photo.width * photo.height);
    return photo;

  } catch (error) {
    cameraDebugger.logCameraError(error);
    return null;
  }
};
```

---

## 📋 Checklist de Troubleshooting

Cuando tengas cámara negra, verifica en orden:

### Phase 1: Permisos (2 min)
- [ ] Verificar `Camera.requestCameraPermissionsAsync()` retorna `granted`
- [ ] En iOS: Verificar `Info.plist` tiene `NSCameraUsageDescription`
- [ ] En Android: Verificar `AndroidManifest.xml` tiene permisos

```xml
<!-- Android -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />

<!-- iOS Info.plist -->
<key>NSCameraUsageDescription</key>
<string>Necesitamos acceso a la cámara para detección de gestos</string>
```

### Phase 2: Camera Component (5 min)
- [ ] Verificar que `<Camera>` está en pantalla completa (width/height)
- [ ] Verificar `onCameraReady` se dispara (revisar logs)
- [ ] Verificar `type={facing}` es válido ("front" o "back")
- [ ] Verificar `previewFormat` NO es "jpeg"

```javascript
// ✅ CORRECTO
<Camera style={{ width: '100%', height: 300 }} />

// ❌ INCORRECTO
<Camera style={{ width: 100, height: 100 }} />
```

### Phase 3: Frame Capture (10 min)
- [ ] Verificar `takePictureAsync()` no retorna null
- [ ] Verificar `cameraRef.current` no es null
- [ ] Verificar que frames se capturan (log framesCaptured > 0)
- [ ] Verificar tamaño de frames (ancho x alto válidos)

### Phase 4: Performance (5 min)
- [ ] Verificar `averageFrameTime < 50ms`
- [ ] Verificar `dropRate < 10%`
- [ ] Verificar que no hay memory leaks (revisar memoria RAM)

---

## 🎯 Debugging en iOS vs Android

### iOS Específico

```javascript
// iOS puede requerir esto
useEffect(() => {
  (async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara');
    }
  })();
}, []);
```

**Comandos útiles:**
```bash
# Revisar Info.plist
plutil -p ios/Runner/Info.plist

# Ver logs en console Xcode
po <variable>
```

### Android Específico

```javascript
// Android requiere runtime permissions
import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';

const requestAndroidPermissions = async () => {
  const result = await request(PERMISSIONS.ANDROID.CAMERA);
  return result === RESULTS.GRANTED;
};
```

**Comandos útiles:**
```bash
# Ver logcat
adb logcat | grep -i camera

# Ver archivo de manifest
aapt dump badging app.apk | grep permissions
```

---

## 🚨 Errores Comunes

### Error 1: "Camera is not ready"
```
❌ Error: Camera is not ready
📍 Causa: Intentaste capturar antes de onCameraReady
✅ Solución:
   - Espera a que isCameraReady === true
   - Verifica que onCameraReady se dispara
```

### Error 2: "takeSnapshotAsync is not available"
```
❌ Error: takeSnapshotAsync is not available on this platform
📍 Causa: Intentaste usar método Web en React Native nativo
✅ Solución:
   - Usa takePictureAsync() en nativo
   - Usa video element.captureFrame() en web
```

### Error 3: "Camera preview is black"
```
❌ Preview es totalmente negro
📍 Causas posibles:
   1. PreviewFormat incorrecto
   2. onCameraReady no disparó
   3. Exposición automática deshabilitada
   4. Dispositivo no tiene cámara (simulador)

✅ Soluciones:
   1. Cambiar a previewFormat="NATIVE"
   2. Implementar onCameraReady callback
   3. Habilitar autoFocus="on"
   4. Usar dispositivo real o emulador con cámara virtual
```

### Error 4: "MediaPipe receives null landmarks"
```
❌ MediaPipe no detecta manos
📍 Causa: Frames negros/inválidos de la cámara
✅ Solución:
   - Verificar que frames son válidos (no nulos)
   - Verificar que frames tienen dimensiones correctas
   - Validar que frames no son completamente negros
   - Usar cameraDebugger.logFrameCapture() para debugging
```

---

## 🔍 Inspector de Salud de Cámara

El CameraDebugger incluye un sistema de health check:

```javascript
import { cameraDebugger } from './utils/services/cameraDebugger';

// En cualquier momento:
const health = cameraDebugger.healthCheck();

console.log(`
  ✅ Camera Ready: ${health.isCameraReady}
  📸 Frames Captured: ${cameraDebugger.metrics.framesCaptured}
  📉 Drop Rate: ${health.dropRate}
  ⚡ Avg Frame Time: ${health.averageFrameTime}
  🎯 Performance: ${health.performance}
`);

// Exportar para email/debug
const report = cameraDebugger.exportLogsAsText();
console.log(report);
```

---

## 📱 Prueba en Dispositivos Reales

### iOS Device
```bash
# Conectar iPhone y ejecutar
npm run ios:device

# O manualmente en Xcode
# 1. Select "Product" → "Destination" → Tu iPhone
# 2. Click Play button
```

### Android Device
```bash
# Conectar Android y ejecutar
adb devices  # Verificar que aparece
npm run android

# O manualmente
adb install -r app.apk
adb shell am start -n com.example/com.example.MainActivity
```

---

## 📊 Monitoreo en Tiempo Real

Se proporciona el componente `<DebugPanel>` para monitoreo real:

```javascript
import { DebugPanel, CameraStatus } from './components/ui/iOS_UI_COMPONENTS';
import { cameraDebugger } from './utils/services/cameraDebugger';

// En tu screen
<CameraStatus
  ready={isCameraReady}
  detecting={isDetecting}
  message={`${cameraDebugger.metrics.framesCaptured} frames`}
/>

<DebugPanel
  logs={cameraDebugger.getRecentLogs(10)}
  collapsed={!showDebug}
  onToggle={() => setShowDebug(!showDebug)}
/>
```

---

## 🎓 Resumen de Solución

Para evitar cámara negra:

1. **Uso correct configuration**: `previewFormat="NATIVE"`, `autoFocus="on"`
2. **Implementa onCameraReady**: No captures frames hasta que dispare
3. **Retry logic**: Reintentar con exponential backoff
4. **Logging**: Usar cameraDebugger para tracking
5. **Validación**: Verificar frames no son nulos/negros
6. **Testing**: Probar en dispositivos reales, no solo simulador

---

**¿Aún tienes problemas?**

1. Revisa los logs: `cameraDebugger.exportLogsAsText()`
2. Verifica health check: `cameraDebugger.healthCheck()`
3. Prueba en dispositivo real (no simulador)
4. Revisa que permisos estén correctamente configurados

---

**Versión:** 1.0
**Status:** ✅ Tested and working
**Last Updated:** 2025-11-13
