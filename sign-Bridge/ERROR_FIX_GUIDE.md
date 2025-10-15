# 🔧 Solución de Errores de Compilación - SignBridge

## Errores Comunes y Soluciones

### Error 1: "Cannot load npx.ps1 - script execution disabled"

**Causa:** Política de ejecución de PowerShell bloqueando scripts.

**Solución A - PowerShell (Rápida):**
```powershell
# Ejecuta esto en PowerShell como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Luego compila
cd "c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
npx expo run:android
```

**Solución B - Usar CMD (Sin cambiar políticas):**
```cmd
cd /d c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge
build-android.bat
```

---

### Error 2: "Filename longer than 260 characters" (Rutas largas)

**Causa:** Limitación de Windows en nombres de archivo.

**Solución:**
```powershell
# Ejecutar como Administrador
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
    -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

# Reiniciar la PC
Restart-Computer
```

---

### Error 3: "JAVA_HOME is not set"

**Causa:** Variable de entorno no configurada.

**Solución:**
```powershell
# Para esta sesión
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

# Permanente (System Properties → Environment Variables)
# O ejecuta:
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")
```

---

### Error 4: "SDK location not found"

**Causa:** Android SDK no encontrado por Gradle.

**Solución - Crear local.properties:**
```powershell
# Crear el archivo
$content = "sdk.dir=C:\\Users\\Sebastian_Medina\\AppData\\Local\\Android\\Sdk"
$content | Out-File -FilePath "c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge\android\local.properties" -Encoding ASCII
```

---

### Error 5: "Could not resolve all dependencies"

**Causa:** Cache corrupto o problemas de red.

**Solución:**
```powershell
cd "c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge"

# Limpiar cache de npm
npm cache clean --force

# Reinstalar node_modules
Remove-Item node_modules -Recurse -Force
npm install --legacy-peer-deps

# Limpiar Gradle
cd android
.\gradlew clean
.\gradlew --refresh-dependencies
cd ..

# Intentar de nuevo
npx expo run:android
```

---

### Error 6: "Execution failed for task ':app:mergeDebugNativeLibs'"

**Causa:** Conflicto de arquitecturas o bibliotecas nativas duplicadas.

**Solución - Limpiar build completo:**
```powershell
cd "c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge"

# Limpiar todo
Remove-Item android\app\build -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item android\build -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item android\.gradle -Recurse -Force -ErrorAction SilentlyContinue

# Limpiar cache de Gradle global
Remove-Item "$env:USERPROFILE\.gradle\caches" -Recurse -Force -ErrorAction SilentlyContinue

# Rebuild desde cero
cd android
.\gradlew clean
cd ..
npx expo run:android
```

---

### Error 7: "Unable to install APK"

**Causa:** Emulador no responde o APK corrupto.

**Solución:**
```powershell
# Reiniciar ADB
adb kill-server
adb start-server

# Verificar dispositivos
adb devices

# Si no aparece, reiniciar emulador
# O desinstalar APK anterior
adb uninstall com.anonymous.signbridge

# Intentar de nuevo
npx expo run:android
```

---

### Error 8: "react-native-fast-tflite compilation error"

**Causa:** Módulo nativo no compila correctamente.

**Solución A - Verificar configuración:**
```powershell
# Asegurar que build.gradle tiene NDK configurado
cd "c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge"
```

**Solución B - Actualizar Gradle:**
Edita `android/gradle/wrapper/gradle-wrapper.properties`:
```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.3-all.zip
```

---

### Error 9: "Out of memory" durante compilación

**Causa:** Gradle necesita más memoria.

**Solución - Aumentar memoria de Gradle:**

Edita o crea `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.daemon=true
org.gradle.configureondemand=true
```

---

### Error 10: "Module not found: Error: Can't resolve 'react-native-fast-tflite'"

**Causa:** Módulo no instalado o node_modules corrupto.

**Solución:**
```powershell
cd "c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge"

# Verificar que está en package.json
Get-Content package.json | Select-String "react-native-fast-tflite"

# Reinstalar
Remove-Item node_modules\react-native-fast-tflite -Recurse -Force -ErrorAction SilentlyContinue
npm install react-native-fast-tflite@1.6.1 --legacy-peer-deps

# Limpiar cache de Metro
npx expo start --clear
```

---

## 🚀 Script de Limpieza Completa

Si ninguna solución funciona, ejecuta este script de limpieza total:

```powershell
# MEGA LIMPIEZA - Ejecutar como último recurso

cd "c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge"

Write-Host "🧹 Limpiando node_modules..." -ForegroundColor Yellow
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "🧹 Limpiando package-lock..." -ForegroundColor Yellow
Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue

Write-Host "🧹 Limpiando builds Android..." -ForegroundColor Yellow
Remove-Item android\app\build -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item android\build -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item android\.gradle -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "🧹 Limpiando cache Gradle..." -ForegroundColor Yellow
Remove-Item "$env:USERPROFILE\.gradle\caches" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "🧹 Limpiando cache npm..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "🧹 Limpiando cache Metro..." -ForegroundColor Yellow
Remove-Item "$env:LOCALAPPDATA\Temp\metro-*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:LOCALAPPDATA\Temp\react-*" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "📦 Reinstalando dependencias..." -ForegroundColor Yellow
npm install --legacy-peer-deps

Write-Host "🔨 Prebuild..." -ForegroundColor Yellow
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
npx expo prebuild --clean

Write-Host "🚀 Compilando..." -ForegroundColor Yellow
npx expo run:android

Write-Host "✅ Proceso completado!" -ForegroundColor Green
```

---

## 📋 Checklist de Verificación Previa

Antes de compilar, verifica:

```powershell
# 1. Variables de entorno
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"
Write-Host "JAVA_HOME: $env:JAVA_HOME"

# 2. Android SDK existe
Test-Path "$env:LOCALAPPDATA\Android\Sdk"

# 3. JDK existe
Test-Path "C:\Program Files\Android\Android Studio\jbr"

# 4. ADB funciona
adb version

# 5. Dispositivo conectado
adb devices

# 6. Node version
node --version  # Debe ser 16, 18 o 20

# 7. npm version
npm --version

# 8. Expo instalado
npx expo --version

# 9. Modelo existe
Test-Path "assets\Modelo\best_float16.tflite"

# 10. react-native-fast-tflite instalado
Test-Path "node_modules\react-native-fast-tflite"
```

---

## 🆘 Si Sigue Fallando

1. **Copia el error exacto** y búscalo en:
   - https://github.com/mrousavy/react-native-fast-tflite/issues
   - https://stackoverflow.com/

2. **Verifica la versión de Node:**
   ```powershell
   node --version
   # Debe ser LTS: 18.x o 20.x
   ```

3. **Intenta en modo desarrollo primero:**
   ```powershell
   npx expo start
   # Escanea con Expo Go - Usará simulación
   ```

4. **Revisa logs detallados:**
   ```powershell
   npx expo run:android --verbose
   ```

5. **Considera alternativas:**
   - Usar ONNX Runtime en lugar de TFLite
   - Usar backend en la nube para inferencia
   - Simplificar a solo simulación por ahora

---

## 📞 Información para Debug

Si necesitas ayuda, proporciona:

1. **Error exacto** (últimas 50 líneas del log)
2. **Comando ejecutado**
3. **Sistema operativo y versión**
4. **Versiones:**
   ```powershell
   node --version
   npm --version
   npx expo --version
   ```
5. **Contenido de package.json** (sección dependencies)

---

## ✅ Próximo Paso

**Ejecuta el script de limpieza completa** y luego intenta compilar de nuevo.

Si tienes el error específico del log que mencionaste, compártelo y te daré una solución precisa.
