# Crear Junction Point para solucionar rutas largas
# Ejecutar como Administrador

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Solución Rápida - Junction Point" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ Necesitas ejecutar como Administrador" -ForegroundColor Red
    Write-Host ""
    Write-Host "1. Click derecho en Windows → PowerShell (Admin)" -ForegroundColor Yellow
    Write-Host "2. cd 'c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge'" -ForegroundColor Cyan
    Write-Host "3. .\create-junction.ps1" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Presiona Enter"
    exit 1
}

$sourcePath = "c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge"
$targetPath = "C:\SB"

# Eliminar junction anterior si existe
if (Test-Path $targetPath) {
    Write-Host "⚠️  C:\SB ya existe, eliminando..." -ForegroundColor Yellow
    Remove-Item $targetPath -Force -ErrorAction SilentlyContinue
}

# Crear junction
Write-Host "📁 Creando junction point..." -ForegroundColor Yellow
Write-Host "   De: $sourcePath" -ForegroundColor Gray
Write-Host "   A:  $targetPath" -ForegroundColor Gray

try {
    New-Item -ItemType Junction -Path $targetPath -Target $sourcePath -Force | Out-Null
    Write-Host "   ✅ Junction creado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Presiona Enter"
    exit 1
}

# Verificar
if (Test-Path "$targetPath\package.json") {
    Write-Host "   ✅ Verificación exitosa" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Advertencia: No se pudo verificar" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ¡Listo!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora puedes compilar usando la ruta corta:" -ForegroundColor Yellow
Write-Host ""
Write-Host "cd C:\SB" -ForegroundColor Cyan
Write-Host "`$env:ANDROID_HOME = ""`$env:LOCALAPPDATA\Android\Sdk""" -ForegroundColor Cyan
Write-Host "`$env:JAVA_HOME = ""C:\Program Files\Android\Android Studio\jbr""" -ForegroundColor Cyan
Write-Host "cd android; .\gradlew clean; cd .." -ForegroundColor Cyan
Write-Host "npx expo run:android" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ Sin necesidad de reiniciar!" -ForegroundColor Green
Write-Host ""
