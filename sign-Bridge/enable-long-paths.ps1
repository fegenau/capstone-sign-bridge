# Enable Long Paths in Windows (Windows 10/11)
# Run this script as Administrator

Write-Host "Enabling Long Path Support in Windows..." -ForegroundColor Yellow

try {
    # Enable long paths in registry
    New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
                     -Name "LongPathsEnabled" `
                     -Value 1 `
                     -PropertyType DWORD `
                     -Force | Out-Null
    
    Write-Host "✅ Long paths enabled successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: You may need to restart your computer for this change to take full effect." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After restarting, run the build command again:" -ForegroundColor White
    Write-Host "cd C:\Users\SEED\Documents\GitHub\capstone-sign-bridge\sign-Bridge\android" -ForegroundColor Gray
    Write-Host ".\gradlew.bat assembleDebug" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please make sure you're running PowerShell as Administrator" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to close..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
