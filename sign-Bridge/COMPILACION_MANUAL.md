# 🚀 Instrucciones de Compilación Manual

## Problema Actual

PowerShell tiene la ejecución de scripts deshabilitada, lo cual impide ejecutar `npx` directamente.

## Solución: Ejecutar Manualmente

Sigue estos pasos **en orden**:

### Paso 1: Abrir PowerShell Como Administrador

1. Presiona `Win + X`
2. Selecciona "Windows PowerShell (Administrador)" o "Terminal (Administrador)"
3. Click en "Sí" para permitir cambios

### Paso 2: Habilitar Ejecución de Scripts (Temporal)

En la ventana de PowerShell como administrador, ejecuta:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Cuando te pregunte, escribe `S` (Sí) y presiona Enter.

**NOTA:** Esto solo afecta a tu usuario, no al sistema completo.

### Paso 3: Navegar al Proyecto

```powershell
cd "c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge"
```

### Paso 4: Configurar Variables de Entorno

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "$env:PATH;$env:ANDROID_HOME\platform-tools"
```

### Paso 5: Verificar que Todo Está Configurado

```powershell
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"
Write-Host "JAVA_HOME: $env:JAVA_HOME"
Write-Host ""
Write-Host "Verificando dispositivos..."
adb devices
```

Deberías ver:
```
List of devices attached
emulator-5554   device
```

### Paso 6: Iniciar Compilación

```powershell
Write-Host "🚀 Iniciando compilación (30-60 minutos)..."
npx expo run:android
```

---

## ¿Qué Esperar Durante la Compilación?

### Fase 1: Configuración (0-5 minutos)
```
› Compiling TypeScript...
› Preparing Android build...
› Checking the iOS bundle...
```

### Fase 2: Gradle Setup (5-15 minutos)
```
> Configure project :app
> Configure project :expo
> Configure project :react-native-reanimated
```

### Fase 3: Descarga de Dependencias (15-25 minutos)
```
Download https://repo.maven.apache.org/...
Download https://jcenter.bintray.com/...
```

### Fase 4: Compilación de Módulos Nativos (25-45 minutos)
```
> Task :react-native:compileDebugJavaWithJavac
> Task :react-native-fast-tflite:compileDebugKotlin
> Task :app:mergeDebugNativeLibs
> Task :app:compileDebugJavaWithJavac
```

### Fase 5: Empaquetado (45-55 minutos)
```
> Task :app:packageDebug
> Task :app:assembleDebug
BUILD SUCCESSFUL in 48m 23s
```

### Fase 6: Instalación (55-60 minutos)
```
› Installing APK on emulator-5554
› Starting app on emulator-5554
```

---

## Alternativa: Usar CMD en Lugar de PowerShell

Si prefieres no cambiar la política de ejecución, usa **Command Prompt (CMD)**:

### Paso 1: Abrir CMD

1. Presiona `Win + R`
2. Escribe `cmd`
3. Presiona Enter

### Paso 2: Navegar y Compilar

```cmd
cd /d c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge

set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%PATH%;%ANDROID_HOME%\platform-tools

echo Verificando dispositivos...
adb devices

echo Iniciando compilacion...
call npx expo run:android
```

---

## Alternativa Más Simple: Usar el Script BAT

Ya creé un script `.bat` que hace todo automáticamente:

### Desde Explorador de Windows:

1. Navega a: `c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge`
2. Haz doble click en: `build-android.bat`
3. Sigue las instrucciones en pantalla

### Desde CMD:

```cmd
cd /d c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge
build-android.bat
```

---

## Después de la Compilación

Una vez que la compilación termine exitosamente:

### 1. La App se Instalará Automáticamente

Verás:
```
✅ BUILD SUCCESSFUL
✅ Installing app on emulator-5554
✅ Starting app...
```

### 2. Verificar Logs del Modelo

Para ver los logs en tiempo real:

```powershell
adb logcat -s ReactNativeJS:V
```

Busca estas líneas:
```
🔄 Intentando cargar modelo TFLite (intento 1)...
📦 Cargando asset del modelo...
✅ Archivo del modelo existe (5.96 MB)
🚀 Cargando modelo TFLite nativo...
✅ ¡Modelo TFLite cargado exitosamente!
📐 Input shape: [1, 640, 640, 3]
📐 Output shape: [1, 8400, 38]
```

Si ves esto, **¡EL MODELO SE CARGÓ CORRECTAMENTE!** 🎉

### 3. Probar la Detección

1. En la app, navega a "Alphabet Detection"
2. Apunta la cámara a tu mano
3. Haz señas del alfabeto
4. La app debería detectarlas (aunque el preprocessing aún no está implementado)

---

## Errores Comunes

### Error: "SDK location not found"

**Solución:** Crea el archivo `android/local.properties`:

```properties
sdk.dir=C:\\Users\\Sebastian_Medina\\AppData\\Local\\Android\\Sdk
```

### Error: "Execution failed for task ':app:installDebug'"

**Causa:** El emulador no responde.

**Solución:**
```powershell
adb kill-server
adb start-server
adb devices
```

### Error: "JAVA_HOME is set to an invalid directory"

**Solución:** Verifica la ruta de Java:
```powershell
Test-Path "C:\Program Files\Android\Android Studio\jbr"
```

Si no existe, busca donde está instalado JBR.

### Error: "Could not resolve all dependencies"

**Causa:** Problemas de red o cache corrupto.

**Solución:**
```powershell
cd android
.\gradlew clean
.\gradlew --refresh-dependencies
cd ..
npx expo run:android
```

---

## Resumen Rápido

**Opción más rápida (PowerShell como admin):**
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
cd "c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
npx expo run:android
```

**Opción sin cambiar políticas (CMD):**
```cmd
cd /d c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge
build-android.bat
```

---

## Próximos Pasos Después de Compilar

1. ✅ Verificar que el modelo se carga en logs
2. ✅ Probar la UI de detección
3. 🔄 Implementar preprocessing de imágenes (siguiente tarea)
4. 🔄 Optimizar rendimiento
5. 🔄 Ajustar confianza y parámetros

---

**¿Necesitas ayuda?** Consulta:
- `MODEL_LOADING_GUIDE.md` - Guía completa
- `BUILD_IN_PROGRESS.md` - Información de compilación
- `NATIVE_TFLITE_GUIDE.md` - Detalles técnicos

¡Buena suerte con la compilación! 🚀
