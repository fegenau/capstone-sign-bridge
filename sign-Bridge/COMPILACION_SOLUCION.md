# 🚀 GUÍA DE COMPILACIÓN - SignBridge Android con TFLite

## ⚠️ PROBLEMA ACTUAL

La compilación falla con el error:
```
ninja: error: Filename longer than 260 characters
```

Esto es una **limitación de Windows** que no permite rutas de archivo mayores a 260 caracteres.

---

## ✅ SOLUCIÓN: Habilitar Rutas Largas en Windows

### **Opción 1: Script Automatizado (Recomendado)**

1. **Abre PowerShell como Administrador:**
   - Click derecho en el botón de Windows
   - Selecciona "Windows PowerShell (Administrador)" o "Terminal (Administrador)"

2. **Ejecuta el script:**
   ```powershell
   cd "C:\Users\SEED\Documents\GitHub\capstone-sign-bridge\sign-Bridge"
   .\enable-long-paths.ps1
   ```

3. **Reinicia tu computadora**

---

### **Opción 2: Manual con Registro**

1. **Abre PowerShell como Administrador**

2. **Ejecuta este comando:**
   ```powershell
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
   ```

3. **Reinicia tu computadora**

---

### **Opción 3: Editor de Políticas de Grupo**

1. Presiona `Win + R`
2. Escribe `gpedit.msc` y presiona Enter
3. Navega a: 
   ```
   Configuración del equipo
   → Plantillas administrativas
   → Sistema
   → Sistema de archivos
   ```
4. Doble clic en **"Habilitar rutas de acceso largas de Win32"**
5. Selecciona **"Habilitado"**
6. Click en **"Aplicar"** y **"Aceptar"**
7. **Reinicia tu computadora**

---

## 🔧 DESPUÉS DE REINICIAR

### **Compilar la App:**

```powershell
# 1. Configurar variables de entorno
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

# 2. Ir al directorio de Android
cd "C:\Users\SEED\Documents\GitHub\capstone-sign-bridge\sign-Bridge\android"

# 3. Limpiar build anterior
.\gradlew.bat clean

# 4. Compilar APK
.\gradlew.bat assembleDebug
```

### **Instalar en Emulador:**

```powershell
# Verificar que el emulador esté corriendo
adb devices

# Instalar APK
adb install "C:\Users\SEED\Documents\GitHub\capstone-sign-bridge\sign-Bridge\android\app\build\outputs\apk\debug\app-debug.apk"
```

---

## 📱 ALTERNATIVA: Usar Ruta Más Corta (Sin reiniciar)

Si no puedes reiniciar ahora, puedes mover el proyecto a una ruta más corta:

```powershell
# Mover proyecto a raíz
Move-Item "C:\Users\SEED\Documents\GitHub\capstone-sign-bridge" "C:\csb"

# Compilar desde allí
cd "C:\csb\sign-Bridge\android"
.\gradlew.bat assembleDebug
```

**IMPORTANTE**: Después de mover, debes actualizar Git:
```powershell
cd "C:\csb"
git config --local core.worktree "C:\csb"
```

---

## 🎯 RESUMEN DE LO QUE HEMOS LOGRADO

✅ **Código TFLite Integrado**
- react-native-fast-tflite instalado
- detectionService.js con carga e inferencia de modelo
- Modelo YOLO (5.23 MB) listo para empaquetarse

✅ **Configuración Android**
- Kotlin 2.0.0
- minSDK 24, compileSdk 35
- Nueva Arquitectura habilitada (requerida por Worklets)
- Solo arm64-v8a para reducir tamaño

✅ **Módulos Nativos**
- expo-camera para captura de video
- react-native-fast-tflite para inferencia TFLite
- react-native-worklets para procesamiento paralelo

⏸️ **Bloqueado Por**
- Límite de 260 caracteres de Windows en rutas de archivo

---

## 🆘 SI NADA FUNCIONA

Como última opción, puedes compilar en la nube con EAS Build de Expo:

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile development
```

Esto compilará en servidores de Expo (sin límite de ruta) y te enviará el APK.

---

## 📞 PRÓXIMOS PASOS

1. **Ahora**: Habilitar rutas largas y reiniciar
2. **Después del reinicio**: Compilar con el comando de arriba
3. **Cuando compile**: Instalar APK en emulador y probar
4. **Finalmente**: Implementar preprocessing de imagen para inferencia real

---

**Nota**: El preprocessing de imagen está pendiente, pero la app compilará y el modelo se cargará correctamente. Por ahora usará modo simulación hasta implementar el procesamiento de frames de cámara.
