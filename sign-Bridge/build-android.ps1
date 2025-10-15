# SignBridge - Build Script for Android
# Este script compila la app con módulos nativos

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  SignBridge - Compilación Android"  -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""

# Configurar variables de entorno
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "$env:PATH;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools;$env:JAVA_HOME\bin"

Write-Host "Configuración:" -ForegroundColor Yellow
Write-Host "  ANDROID_HOME = $env:ANDROID_HOME"
Write-Host "  JAVA_HOME = $env:JAVA_HOME"
Write-Host ""

# Verificar que el SDK existe
if (-not (Test-Path $env:ANDROID_HOME)) {
    Write-Host "❌ ERROR: Android SDK no encontrado en $env:ANDROID_HOME" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, instala Android Studio desde:"
    Write-Host "https://developer.android.com/studio"
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "✅ Android SDK encontrado" -ForegroundColor Green

# Verificar ADB
Write-Host ""
Write-Host "Verificando herramientas..." -ForegroundColor Yellow
$adbPath = "$env:ANDROID_HOME\platform-tools\adb.exe"

if (Test-Path $adbPath) {
    Write-Host "✅ ADB encontrado" -ForegroundColor Green
    
    # Listar dispositivos
    Write-Host ""
    Write-Host "Dispositivos conectados:" -ForegroundColor Yellow
    & $adbPath devices
    
    $devices = & $adbPath devices | Select-String "device$"
    if ($devices.Count -eq 0) {
        Write-Host ""
        Write-Host "⚠️  ADVERTENCIA: No se detectaron dispositivos" -ForegroundColor Yellow
        Write-Host "Asegúrate de tener:"
        Write-Host "  - Un emulador Android corriendo, O"
        Write-Host "  - Un dispositivo físico conectado por USB"
        Write-Host ""
        $continue = Read-Host "¿Continuar de todas formas? (s/n)"
        if ($continue -ne "s") {
            exit 0
        }
    } else {
        Write-Host "✅ Dispositivo(s) detectado(s)" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  ADB no encontrado" -ForegroundColor Yellow
}

# Cambiar al directorio del proyecto
Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  Iniciando Compilación"  -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Directorio: sign-Bridge"
Write-Host "⏱️  Tiempo estimado: 30-60 minutos (primera vez)"
Write-Host "🔄 Estado: Configurando Gradle y descargando dependencias..."
Write-Host ""
Write-Host "NOTA: Puedes ver el progreso en tiempo real aquí."
Write-Host "Para cancelar, presiona Ctrl+C"
Write-Host ""

$choice = Read-Host "¿Iniciar compilación? (s/n)"
if ($choice -ne "s") {
    Write-Host "Compilación cancelada."
    exit 0
}

Set-Location "c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge"

Write-Host ""
Write-Host "Compilando e instalando..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar expo run:android
try {
    npx expo run:android
    
    Write-Host ""
    Write-Host "========================================"  -ForegroundColor Green
    Write-Host "  ¡Compilación Exitosa!"  -ForegroundColor Green
    Write-Host "========================================"  -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ La app se ha instalado en tu dispositivo"
    Write-Host "✅ La app debería iniciarse automáticamente"
    Write-Host ""
    Write-Host "Próximo paso:" -ForegroundColor Yellow
    Write-Host "  1. Ve a la app en tu dispositivo"
    Write-Host "  2. Navega a 'Alphabet Detection'"
    Write-Host "  3. Busca en los logs del dispositivo:"
    Write-Host "     '✅ Modelo TFLite cargado exitosamente'"
    Write-Host ""
    Write-Host "Para ver logs en tiempo real:" -ForegroundColor Yellow
    Write-Host "  adb logcat -s ReactNativeJS:V"
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "========================================"  -ForegroundColor Red
    Write-Host "  Error en la Compilación"  -ForegroundColor Red
    Write-Host "========================================"  -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Consulta BUILD_IN_PROGRESS.md para soluciones comunes."
    Write-Host ""
}

Read-Host "Presiona Enter para salir"
