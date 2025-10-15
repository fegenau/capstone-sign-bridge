@echo off
REM Crear Junction Point - Ejecutar como Administrador
echo.
echo ========================================
echo   Creando Junction Point
echo ========================================
echo.

REM Verificar permisos de administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Necesitas ejecutar como Administrador
    echo.
    echo 1. Click derecho en este archivo
    echo 2. Selecciona "Ejecutar como administrador"
    pause
    exit /b 1
)

echo Creando junction C:\SB...
mklink /J "C:\SB" "c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge"

if %errorLevel% equ 0 (
    echo.
    echo ========================================
    echo   Junction Creado Exitosamente
    echo ========================================
    echo.
    echo Ahora puedes compilar desde: C:\SB
    echo.
    echo Ejecuta estos comandos:
    echo   cd C:\SB
    echo   npx expo run:android
    echo.
) else (
    echo.
    echo ERROR: No se pudo crear el junction
    echo Asegurate de ejecutar como Administrador
    echo.
)

pause
