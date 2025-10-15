# Script de Limpieza y Fix de Errores - SignBridge
# Ejecutar como Administrador

param(
    [switch]$Deep,
    [switch]$QuickFix
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SignBridge - Fix de Compilación" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = "c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge"

# Verificar que estamos en el proyecto correcto
if (-not (Test-Path $projectPath)) {
    Write-Host "❌ Error: Proyecto no encontrado en $projectPath" -ForegroundColor Red
    exit 1
}

Set-Location $projectPath

# Quick Fix - Solo problemas comunes
if ($QuickFix) {
    Write-Host "🔧 Quick Fix - Solucionando problemas comunes..." -ForegroundColor Yellow
    Write-Host ""
    
    # 1. Configurar variables de entorno
    Write-Host "1️⃣  Configurando variables de entorno..."
    $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
    $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
    $env:PATH = "$env:PATH;$env:ANDROID_HOME\platform-tools"
    Write-Host "   ✅ Variables configuradas" -ForegroundColor Green
    
    # 2. Crear local.properties si no existe
    Write-Host "2️⃣  Verificando local.properties..."
    $localPropsPath = "android\local.properties"
    if (-not (Test-Path $localPropsPath)) {
        $sdkPath = $env:ANDROID_HOME -replace '\\', '\\'
        "sdk.dir=$sdkPath" | Out-File -FilePath $localPropsPath -Encoding ASCII
        Write-Host "   ✅ local.properties creado" -ForegroundColor Green
    } else {
        Write-Host "   ✅ local.properties existe" -ForegroundColor Green
    }
    
    # 3. Reiniciar ADB
    Write-Host "3️⃣  Reiniciando ADB..."
    adb kill-server | Out-Null
    Start-Sleep -Seconds 2
    adb start-server | Out-Null
    Write-Host "   ✅ ADB reiniciado" -ForegroundColor Green
    
    # 4. Verificar dispositivos
    Write-Host "4️⃣  Verificando dispositivos..."
    $devices = adb devices
    if ($devices -match "device$") {
        Write-Host "   ✅ Dispositivo(s) encontrado(s)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  No se encontraron dispositivos" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "✅ Quick Fix completado" -ForegroundColor Green
    Write-Host ""
    Write-Host "Intenta compilar ahora:" -ForegroundColor Yellow
    Write-Host "  npx expo run:android" -ForegroundColor White
    Write-Host ""
    exit 0
}

# Deep Clean - Limpieza profunda
Write-Host "⚠️  LIMPIEZA PROFUNDA" -ForegroundColor Yellow
Write-Host "Esto eliminará todos los builds y caches." -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "¿Continuar? (s/n)"
if ($confirm -ne "s") {
    Write-Host "Operación cancelada."
    exit 0
}

Write-Host ""
Write-Host "🧹 Iniciando limpieza profunda..." -ForegroundColor Cyan
Write-Host ""

# 1. Limpiar node_modules
Write-Host "1️⃣  Limpiando node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ node_modules eliminado" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  node_modules no existe" -ForegroundColor Gray
}

# 2. Limpiar package-lock
Write-Host "2️⃣  Limpiando package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ package-lock.json eliminado" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  package-lock.json no existe" -ForegroundColor Gray
}

# 3. Limpiar builds Android
Write-Host "3️⃣  Limpiando builds Android..." -ForegroundColor Yellow
$androidPaths = @(
    "android\app\build",
    "android\build",
    "android\.gradle",
    "android\app\.cxx"
)
foreach ($path in $androidPaths) {
    if (Test-Path $path) {
        Remove-Item $path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ $path eliminado" -ForegroundColor Green
    }
}

# 4. Limpiar cache de Gradle
Write-Host "4️⃣  Limpiando cache de Gradle..." -ForegroundColor Yellow
$gradleCache = "$env:USERPROFILE\.gradle\caches"
if (Test-Path $gradleCache) {
    Remove-Item $gradleCache -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cache de Gradle eliminado" -ForegroundColor Green
}

# 5. Limpiar cache de npm
Write-Host "5️⃣  Limpiando cache de npm..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "   ✅ Cache de npm limpiado" -ForegroundColor Green

# 6. Limpiar cache de Metro
Write-Host "6️⃣  Limpiando cache de Metro..." -ForegroundColor Yellow
$metroPaths = Get-ChildItem "$env:LOCALAPPDATA\Temp" -Filter "metro-*" -Directory -ErrorAction SilentlyContinue
$reactPaths = Get-ChildItem "$env:LOCALAPPDATA\Temp" -Filter "react-*" -Directory -ErrorAction SilentlyContinue
foreach ($path in ($metroPaths + $reactPaths)) {
    Remove-Item $path.FullName -Recurse -Force -ErrorAction SilentlyContinue
}
Write-Host "   ✅ Cache de Metro limpiado" -ForegroundColor Green

# 7. Configurar variables de entorno
Write-Host "7️⃣  Configurando variables de entorno..." -ForegroundColor Yellow
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "$env:PATH;$env:ANDROID_HOME\platform-tools"
Write-Host "   ✅ Variables configuradas" -ForegroundColor Green

# 8. Reinstalar dependencias
Write-Host "8️⃣  Reinstalando dependencias..." -ForegroundColor Yellow
Write-Host "   (Esto puede tomar varios minutos...)" -ForegroundColor Gray
npm install --legacy-peer-deps 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Hubo advertencias al instalar" -ForegroundColor Yellow
}

# 9. Crear local.properties
Write-Host "9️⃣  Creando local.properties..." -ForegroundColor Yellow
$sdkPath = $env:ANDROID_HOME -replace '\\', '\\'
"sdk.dir=$sdkPath" | Out-File -FilePath "android\local.properties" -Encoding ASCII
Write-Host "   ✅ local.properties creado" -ForegroundColor Green

# 10. Verificar modelo
Write-Host "🔟 Verificando modelo TFLite..." -ForegroundColor Yellow
if (Test-Path "assets\Modelo\best_float16.tflite") {
    $modelSize = (Get-Item "assets\Modelo\best_float16.tflite").Length / 1MB
    Write-Host "   ✅ Modelo encontrado ($([math]::Round($modelSize, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Modelo no encontrado" -ForegroundColor Yellow
}

# Resumen
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Limpieza Completada" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Configuración actual:" -ForegroundColor Yellow
Write-Host "  ANDROID_HOME: $env:ANDROID_HOME"
Write-Host "  JAVA_HOME: $env:JAVA_HOME"
Write-Host ""
Write-Host "Dispositivos conectados:" -ForegroundColor Yellow
adb devices
Write-Host ""
Write-Host "Próximo paso:" -ForegroundColor Yellow
Write-Host "  npx expo run:android" -ForegroundColor White
Write-Host ""
Write-Host "Si sigue fallando, ejecuta:" -ForegroundColor Yellow
Write-Host "  npx expo run:android --verbose" -ForegroundColor White
Write-Host ""
