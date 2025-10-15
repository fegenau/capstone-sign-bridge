# 🔧 Guía de Instalación del APK - Solución de Problemas

## ⚠️ Problema Encontrado

**Error:** `cmd: Can't find service: package`

**Causa:** El Package Manager del emulador está corrupto o no responde.

---

## ✅ Solución: Reiniciar Emulador

### Paso 1: Cerrar el Emulador Actual

**Opción A - Desde Android Studio:**
1. Abre **Android Studio**
2. Ve a **Tools → Device Manager**
3. Encuentra el emulador corriendo
4. Click en **Stop** (ícono de parar)

**Opción B - Desde línea de comandos:**
```powershell
# Matar proceso del emulador
taskkill /F /IM qemu-system-x86_64.exe

# O desde PowerShell:
Get-Process | Where-Object {$_.Name -like "*qemu*" -or $_.Name -like "*emulator*"} | Stop-Process -Force
```

### Paso 2: Limpiar ADB

```powershell
# Matar servidor ADB
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" kill-server

# Esperar 3 segundos
Start-Sleep -Seconds 3

# Reiniciar ADB
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" start-server
```

### Paso 3: Abrir Emulador Fresco

**Desde Android Studio:**
1. **Tools → Device Manager**
2. Click en ▶️ **Play** en tu AVD (ej: Pixel_8_API_35)
3. Espera a que el emulador cargue completamente (~1-2 min)
4. Verifica que la pantalla de inicio esté visible

**Desde línea de comandos:**
```powershell
# Listar emuladores disponibles
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -list-avds

# Lanzar emulador (reemplaza con tu AVD name)
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Pixel_8_API_35
```

### Paso 4: Verificar Conexión

```powershell
# Debe mostrar: emulator-5554   device
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
```

### Paso 5: Instalar APK

```powershell
# Instalar APK
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r "C:\Users\Sebastian_Medina\Downloads\app-debug.apk"

# Debe mostrar: Success
```

**Si aún falla, usar método alternativo:**

```powershell
# Método 1: Push + Install
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" push "C:\Users\Sebastian_Medina\Downloads\app-debug.apk" /sdcard/
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell pm install -r /sdcard/app-debug.apk

# Método 2: Arrastrar y soltar
# Simplemente arrastra app-debug.apk a la ventana del emulador
```

### Paso 6: Lanzar App

```powershell
# Lanzar SignBridge
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell am start -n com.anonymous.signbridge/.MainActivity

# Esperar 5 segundos
Start-Sleep -Seconds 5

# Ver logs del modelo
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" logcat -c
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" logcat | Select-String -Pattern "TFLite|Modelo|detectionService"
```

---

## 🎯 Validación Esperada

Después de lanzar la app, los logs deben mostrar:

```
✅ Modelo TFLite cargado exitosamente
📊 Input shape: [1, 640, 640, 3]
📊 Output shape: [1, 40, 8400]
🎯 Modo: Modelo TFLite
```

**Si ves:** `Modo: Simulación` → El build no incluyó módulos nativos (muy improbable con APK de 230 MB)

**Si ves:** Error de TurboModule → Reinstalar APK

---

## 🐛 Troubleshooting Alternativo

### Si el emulador no arranca:

**Problema común:** Hyper-V o HAXM conflicto

**Solución:**
```powershell
# Verificar que Hyper-V esté habilitado (para emuladores modernos)
Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V

# Si está deshabilitado, habilitar:
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
```

### Si el APK no se puede copiar:

**Verificar espacio:**
```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell df -h /data
```

**Debe tener al menos 500 MB libres**

### Si la instalación falla por firma:

```powershell
# Desinstalar versión anterior primero
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" uninstall com.anonymous.signbridge

# Luego instalar
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r "C:\Users\Sebastian_Medina\Downloads\app-debug.apk"
```

---

## 📋 Script Completo de Instalación

Guarda esto como `install-apk.ps1`:

```powershell
# Script de Instalación Automática
Write-Host "=== Instalación de SignBridge APK ===" -ForegroundColor Cyan

# 1. Verificar ADB
Write-Host "`n1️⃣  Verificando ADB..." -ForegroundColor Yellow
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"

if (-not (Test-Path $adb)) {
    Write-Host "❌ ADB no encontrado" -ForegroundColor Red
    exit 1
}

# 2. Verificar dispositivos
Write-Host "`n2️⃣  Verificando dispositivos..." -ForegroundColor Yellow
$devices = & $adb devices
Write-Host $devices

if ($devices -notmatch "emulator-\d+\s+device") {
    Write-Host "❌ No hay emulador conectado" -ForegroundColor Red
    Write-Host "Por favor, abre el emulador desde Android Studio" -ForegroundColor Yellow
    exit 1
}

# 3. Verificar APK
Write-Host "`n3️⃣  Verificando APK..." -ForegroundColor Yellow
$apkPath = "C:\Users\Sebastian_Medina\Downloads\app-debug.apk"

if (-not (Test-Path $apkPath)) {
    Write-Host "❌ APK no encontrado en: $apkPath" -ForegroundColor Red
    exit 1
}

$apkSize = (Get-Item $apkPath).Length / 1MB
Write-Host "✅ APK encontrado: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Green

# 4. Desinstalar versión anterior
Write-Host "`n4️⃣  Desinstalando versión anterior..." -ForegroundColor Yellow
& $adb uninstall com.anonymous.signbridge 2>$null
Write-Host "✅ Versión anterior removida (si existía)" -ForegroundColor Green

# 5. Instalar nuevo APK
Write-Host "`n5️⃣  Instalando APK (esto puede tardar 1-2 min)..." -ForegroundColor Yellow
$result = & $adb install -r $apkPath 2>&1

if ($result -match "Success") {
    Write-Host "✅ APK instalado exitosamente!" -ForegroundColor Green
} else {
    Write-Host "❌ Error al instalar:" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    
    # Método alternativo
    Write-Host "`n🔄 Intentando método alternativo..." -ForegroundColor Yellow
    & $adb push $apkPath /data/local/tmp/app.apk
    & $adb shell pm install -r /data/local/tmp/app.apk
}

# 6. Lanzar app
Write-Host "`n6️⃣  Lanzando aplicación..." -ForegroundColor Yellow
& $adb shell am start -n com.anonymous.signbridge/.MainActivity

Start-Sleep -Seconds 3

# 7. Mostrar logs
Write-Host "`n7️⃣  Monitoreando logs de TFLite..." -ForegroundColor Yellow
Write-Host "Presiona Ctrl+C para detener`n" -ForegroundColor Gray

& $adb logcat -c
& $adb logcat | Select-String -Pattern "TFLite|Modelo|detectionService" -CaseSensitive:$false
```

**Uso:**
```powershell
.\install-apk.ps1
```

---

## 🎯 Próximos Pasos Después de Instalación Exitosa

1. ✅ **Verificar logs** - Buscar "Modo: Modelo TFLite"
2. ✅ **Abrir cámara** - Ir a pantalla de detección
3. ✅ **Probar detección** - Hacer señas frente a la cámara
4. ⏳ **Implementar preprocessing** - Si el modelo carga pero no detecta
5. ⏳ **Implementar YOLO parser** - Interpretar outputs

---

**Estado Actual:** El emulador necesita reiniciarse. Por favor, sigue los pasos arriba. 🚀
