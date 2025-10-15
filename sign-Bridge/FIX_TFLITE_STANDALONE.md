# ❌ PROBLEMA: Modelo solo carga en simulación

## 🔍 CAUSA RAÍZ:

El APK compilado con GitHub Actions **incluye módulos nativos (react-native-fast-tflite)**, pero estás conectando a Metro que sirve código JavaScript desde tu PC local que **NO tiene módulos nativos compilados**.

```
ERROR  ❌ Error al cargar modelo: react-native-fast-tflite no está disponible
```

---

## ✅ SOLUCIÓN: Usar APK Standalone

### **Opción 1: APK Release (RECOMENDADO)**

Compila una versión **release** que NO se conecta a Metro:

1. **Modifica el workflow de GitHub Actions** (`.github/workflows/build-android.yml`):

```yaml
- name: Build Android APK (Release)
  run: |
    cd android
    ./gradlew assembleRelease   # <-- Cambiar a Release
```

2. **Sube el cambio y espera la compilación** (~40 min)

3. **Descarga el APK release** (213 MB aprox)

4. **Instala:**
```powershell
adb install -r app-release.apk
```

5. **Abre la app** (NO necesitas Metro)

---

### **Opción 2: Desactivar Metro en Debug**

Modificar el APK debug para que NO se conecte a Metro:

1. **Edita `android/app/build.gradle`:**

```gradle
android {
    ...
    buildTypes {
        debug {
            // Forzar que el debug NO se conecte a Metro
            bundleInDebug = true
        }
    }
}
```

2. **Recompila con GitHub Actions**

3. **Instala el nuevo APK**

---

### **Opción 3: Compilar Localmente con EAS**

Si tienes cuenta Expo (gratis):

1. **Login:**
```powershell
npx eas login
```

2. **Build local:**
```powershell
npx eas build --platform android --profile preview --local
```

3. **Espera compilación** (~30-40 min)

4. **Instala APK generado**

---

## 🎯 VERIFICACIÓN FINAL:

Después de instalar el APK **release** o **standalone**:

1. **NO inicies Metro** (no ejecutes `npx expo start`)

2. **Abre la app normalmente** desde el emulador

3. **Navega a detección**

4. **Verifica logs:**

```powershell
adb logcat -c
adb logcat | Select-String "TFLite|Modelo"
```

Deberías ver:
```
✅ ¡Modelo TFLite cargado exitosamente!
📐 Input shape: [1, 640, 640, 3]
📐 Output shape: [1, 40, 8400]
```

---

## 🚀 RECOMENDACIÓN INMEDIATA:

**Usa la Opción 1** (APK Release) porque:
- ✅ No se conecta a Metro
- ✅ Módulos nativos incluidos
- ✅ Funciona standalone
- ✅ Es la compilación final de producción

**Modifico el workflow ahora?** (toma 40 min compilar)
