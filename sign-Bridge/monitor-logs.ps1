# Script para monitorear logs de SignBridge y TFLite
# Ejecuta este script y luego abre la app en el emulador

$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"

Write-Host "🔍 Monitoreando logs de SignBridge..." -ForegroundColor Cyan
Write-Host "📱 Abre la app en el emulador ahora" -ForegroundColor Yellow
Write-Host "⏹️  Presiona Ctrl+C para detener" -ForegroundColor Gray
Write-Host ""

# Limpiar logs anteriores
& $adb logcat -c

# Monitorear logs en tiempo real
& $adb logcat | Select-String -Pattern "SignBridge|TFLite|Modelo|modelo|Model|react-native-fast-tflite|detectionService" -CaseSensitive:$false | ForEach-Object {
    $line = $_.Line
    
    # Colorear según el tipo de mensaje
    if ($line -match "error|Error|ERROR|FATAL") {
        Write-Host $line -ForegroundColor Red
    }
    elseif ($line -match "warning|Warning|WARN") {
        Write-Host $line -ForegroundColor Yellow
    }
    elseif ($line -match "success|Success|cargado|loaded|✅") {
        Write-Host $line -ForegroundColor Green
    }
    elseif ($line -match "TFLite|modelo|Model") {
        Write-Host $line -ForegroundColor Cyan
    }
    else {
        Write-Host $line
    }
}
