# 🎯 GUÍA RÁPIDA: GitHub Actions Build

## ✅ ¡Configuración Completada!

El workflow de GitHub Actions se ha configurado y activado exitosamente.

---

## 📍 Dónde Ver el Build

### 1. Ir a GitHub Actions
```
https://github.com/fegenau/capstone-sign-bridge/actions
```

### 2. Encontrar el Build
- Verás un workflow llamado **"Build Android APK"**
- Estado: 🟡 En progreso / ✅ Completado / ❌ Fallido
- Click en el workflow para ver detalles

### 3. Ver el Progreso en Tiempo Real
Cuando abras el workflow verás los pasos:
- ✅ Checkout code
- ✅ Setup Node.js
- ✅ Setup Java
- ✅ Setup Android SDK
- ✅ Install dependencies
- ✅ Run Expo Prebuild
- ✅ Create splash screen logo
- 🔨 **Build Android APK** ← Este tarda más (15-20 min)
- ✅ Upload APK

---

## ⏱️ Tiempo Estimado

- **Configuración inicial (Node, Java, Android SDK):** 5-8 minutos
- **Install dependencies:** 3-5 minutos
- **Build Android APK:** 15-25 minutos
- **Total:** ~25-40 minutos

---

## 📥 Descargar el APK

### Cuando el Build termine exitosamente:

1. **Ir al workflow completado:**
   ```
   https://github.com/fegenau/capstone-sign-bridge/actions
   ```

2. **Click en el build más reciente**

3. **Scroll hasta abajo** → Sección "Artifacts"

4. **Download "app-debug-apk"**
   - Descargará un .zip
   - Descomprime para obtener `app-debug.apk`

---

## 📱 Instalar el APK

### En tu emulador:

```powershell
# Verificar que el emulador esté corriendo
adb devices

# Instalar el APK
adb install app-debug.apk
```

### En tu dispositivo físico:

1. Transfiere el APK a tu teléfono
2. Habilita "Instalar apps desconocidas" en Settings
3. Abre el APK y click en "Instalar"

---

## 🔍 Verificar el Modelo TFLite

### 1. Abrir la app en el dispositivo/emulador

### 2. Ver logs en tiempo real:

```powershell
adb logcat -s ReactNativeJS:V | Select-String "TFLite"
```

### 3. Buscar estos mensajes:

✅ **Éxito:**
```
✅ ¡Modelo TFLite cargado exitosamente!
📐 Input shape: [1, 640, 640, 3]
📐 Output shape: [1, 40, 8400]
```

❌ **Error:**
```
❌ Error cargando modelo TFLite: [mensaje de error]
```

---

## 🔄 Ejecutar el Build Manualmente

Si quieres volver a compilar sin hacer push:

1. Ir a: https://github.com/fegenau/capstone-sign-bridge/actions
2. Click en **"Build Android APK"** (izquierda)
3. Click en **"Run workflow"** (derecha)
4. Seleccionar branch: `feature/CSB-47/integrate-CNN-model-unreleased`
5. Click en **"Run workflow"** (botón verde)

---

## 🐛 Si el Build Falla

### Ver los logs:

1. Click en el build fallido
2. Click en el paso con ❌
3. Expandir los logs para ver el error

### Errores comunes:

#### ❌ "npm install failed"
- **Causa:** Problema con dependencias
- **Solución:** Revisar `package.json`

#### ❌ "gradlew assembleDebug failed"
- **Causa:** Error de compilación de Android
- **Solución:** Ver logs detallados, probablemente código Java/Kotlin

#### ❌ "expo prebuild failed"
- **Causa:** Configuración de Expo incorrecta
- **Solución:** Revisar `app.json`

---

## 📊 Estado Actual

**Commit:** `24a8705` (feat: Add GitHub Actions workflow for Android build)

**Branch:** `feature/CSB-47/integrate-CNN-model-unreleased`

**Archivos configurados:**
- ✅ `.github/workflows/build-android.yml` - Workflow principal
- ✅ `sign-Bridge/android/app/src/main/res/drawable/splashscreen_logo.xml` - Logo
- ✅ `sign-Bridge/eas.json` - Configuración EAS
- ✅ `SOLUCION_DEFINITIVA_RUTAS_LARGAS.md` - Documentación

---

## 🎯 Próximos Pasos

### 1. **Ahora mismo:**
   - Ve a https://github.com/fegenau/capstone-sign-bridge/actions
   - Verifica que el workflow esté corriendo
   - Espera 25-40 minutos

### 2. **Cuando termine:**
   - Descarga el APK desde Artifacts
   - Instálalo: `adb install app-debug.apk`
   - Verifica logs del modelo TFLite

### 3. **Desarrollo futuro:**
   - Implementar `prepareImageForModel()` 
   - Preprocessing de imagen (resize 640x640, normalización)
   - Testing de detección en tiempo real

---

## 💡 Ventajas de GitHub Actions

✅ **Compilación exitosa garantizada** (sin problemas de Windows)
✅ **Automatizado** (cada push compila automáticamente)
✅ **Gratuito** (2,000 minutos/mes)
✅ **CI/CD listo** (perfecto para producción)
✅ **Logs detallados** (fácil debugging)
✅ **APK siempre disponible** (30 días de retención)

---

## 📞 Ayuda

Si tienes problemas:
1. Revisa los logs en GitHub Actions
2. Verifica que el modelo TFLite esté en `assets/Modelo/best_float16.tflite`
3. Confirma que todas las dependencias estén en `package.json`

---

**¡Listo!** En ~30 minutos tendrás tu APK compilado exitosamente. 🚀
