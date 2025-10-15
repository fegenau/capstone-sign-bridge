# 🔍 Script de Verificación del Modelo en APK

## Comando para verificar que el modelo está en el APK

```powershell
# 1. Descargar APK de GitHub Actions
# 2. Verificar contenido del APK (es un archivo ZIP)

# Renombrar APK a ZIP temporalmente
Copy-Item app-debug.apk app-debug.zip

# Listar contenido del APK
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead("$PWD\app-debug.zip")

Write-Host "`n=== Buscando modelo TFLite en APK ===" -ForegroundColor Cyan

$modelFile = $zip.Entries | Where-Object { $_.FullName -like "*best_float16.tflite*" }

if ($modelFile) {
    Write-Host "✅ MODELO ENCONTRADO en APK!" -ForegroundColor Green
    Write-Host "📍 Ubicación: $($modelFile.FullName)" -ForegroundColor Yellow
    Write-Host "📦 Tamaño: $([math]::Round($modelFile.Length / 1MB, 2)) MB" -ForegroundColor Yellow
    
    if ($modelFile.Length -gt 5000000 -and $modelFile.Length -lt 7000000) {
        Write-Host "✅ Tamaño correcto (5-7 MB)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Tamaño inesperado" -ForegroundColor Red
    }
} else {
    Write-Host "❌ MODELO NO ENCONTRADO en APK" -ForegroundColor Red
    Write-Host "⚠️  El modelo NO está incluido. Build falló." -ForegroundColor Red
}

$zip.Dispose()
Remove-Item app-debug.zip

Write-Host "`n=== Buscando librerías nativas TFLite ===" -ForegroundColor Cyan

# Re-abrir para buscar .so files
$zip = [System.IO.Compression.ZipFile]::OpenRead("$PWD\app-debug.apk")

$nativeLibs = $zip.Entries | Where-Object { 
    $_.FullName -like "*libtensorflow*" -or 
    $_.FullName -like "*libtflite*" -or
    $_.FullName -like "*librnfasttflite*"
}

if ($nativeLibs) {
    Write-Host "✅ Librerías nativas TFLite encontradas:" -ForegroundColor Green
    foreach ($lib in $nativeLibs) {
        Write-Host "  📚 $($lib.FullName) - $([math]::Round($lib.Length / 1MB, 2)) MB" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Librerías nativas NO encontradas" -ForegroundColor Red
}

$zip.Dispose()

Write-Host "`n=== RESUMEN ===" -ForegroundColor Cyan
if ($modelFile -and $nativeLibs) {
    Write-Host "✅ APK COMPLETO: Modelo + Librerías nativas incluidas" -ForegroundColor Green
    Write-Host "🚀 Este APK funcionará con el modelo REAL" -ForegroundColor Green
} else {
    Write-Host "❌ APK INCOMPLETO: Falta modelo o librerías" -ForegroundColor Red
    Write-Host "⚠️  El build no incluyó componentes nativos" -ForegroundColor Red
}
```

## Uso del script:

```powershell
# Guardar este contenido como: verify-apk-model.ps1

# Navegar al directorio del APK
cd "ruta\donde\descargaste\app-debug.apk"

# Ejecutar
.\verify-apk-model.ps1
```

## Salida Esperada (Éxito ✅):

```
=== Buscando modelo TFLite en APK ===
✅ MODELO ENCONTRADO en APK!
📍 Ubicación: assets/Modelo/best_float16.tflite
📦 Tamaño: 5.96 MB
✅ Tamaño correcto (5-7 MB)

=== Buscando librerías nativas TFLite ===
✅ Librerías nativas TFLite encontradas:
  📚 lib/arm64-v8a/libtensorflowlite_jni.so - 2.3 MB
  📚 lib/arm64-v8a/librnfasttflite.so - 0.8 MB
  📚 lib/armeabi-v7a/libtensorflowlite_jni.so - 1.9 MB
  📚 lib/armeabi-v7a/librnfasttflite.so - 0.6 MB

=== RESUMEN ===
✅ APK COMPLETO: Modelo + Librerías nativas incluidas
🚀 Este APK funcionará con el modelo REAL
```

## Alternativa: Verificar después de instalado

```powershell
# Verificar APK instalado en dispositivo
adb shell pm path com.anonymous.signbridge

# Extraer APK del dispositivo
adb pull /data/app/~~HASH==/com.anonymous.signbridge-HASH==/base.apk app-from-device.apk

# Verificar contenido
# (usar script de arriba)
```

## Verificación final en runtime:

```powershell
# Después de instalar el APK
adb install -r app-debug.apk

# Lanzar app
adb shell am start -n com.anonymous.signbridge/.MainActivity

# Esperar 5 segundos
Start-Sleep -Seconds 5

# Verificar logs
adb logcat -d | Select-String -Pattern "Modelo|TFLite|tflite" -Context 2, 2

# Buscar específicamente:
# ✅ "Modelo TFLite cargado exitosamente"
# ✅ "Input shape: [1, 640, 640, 3]"
# ✅ "Modo: Modelo TFLite"
#
# ❌ Si ves "Modo: Simulación" → El modelo NO se incluyó
```

## ¿Qué pasa si el modelo NO está en el APK?

**Causas comunes:**

1. **expo prebuild no incluyó assets:**
   ```json
   // Verificar en app.json:
   "assetBundlePatterns": [
     "**/*",
     "assets/**/*"  // ← Debe incluir esto
   ]
   ```

2. **metro.config.js no reconoce .tflite:**
   ```javascript
   // Verificar extensiones:
   resolver: {
     assetExts: [...defaultAssetExts, 'tflite']
   }
   ```

3. **Build falló silenciosamente:**
   - Revisar logs de GitHub Actions
   - Buscar errores en paso "Run Expo Prebuild"

## Conclusión:

El **APK Debug SÍ incluye el modelo real**. Las diferencias con Release son solo de optimización y tamaño, **NO de funcionalidad**.

Para tus pruebas con el modelo real, el APK Debug es **perfecto**. 🎯
