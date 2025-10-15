@echo off
REM ========================================
REM  SignBridge - Configuración de Android
REM ========================================
REM
REM Este script configura las variables de entorno necesarias
REM para compilar la aplicación con Android Studio

echo.
echo ========================================
echo   Configurando Android SDK
echo ========================================
echo.

REM Detectar la ubicación del SDK de Android
set ANDROID_SDK_ROOT=%LOCALAPPDATA%\Android\Sdk

if not exist "%ANDROID_SDK_ROOT%" (
    echo ERROR: Android SDK no encontrado en %ANDROID_SDK_ROOT%
    echo.
    echo Por favor, instala Android Studio desde:
    echo https://developer.android.com/studio
    echo.
    pause
    exit /b 1
)

echo ✅ Android SDK encontrado: %ANDROID_SDK_ROOT%

REM Configurar variables de entorno (temporal para esta sesión)
set ANDROID_HOME=%ANDROID_SDK_ROOT%
set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%ANDROID_HOME%\tools\bin;%ANDROID_HOME%\cmdline-tools\latest\bin

echo ✅ ANDROID_HOME configurado
echo ✅ PATH actualizado con herramientas de Android

echo.
echo Verificando herramientas...
echo.

REM Verificar ADB
adb version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  ADB no encontrado. Verifica la instalación de Android SDK.
) else (
    echo ✅ ADB disponible
    adb version | findstr "version"
)

echo.
echo Dispositivos conectados:
adb devices

echo.
echo ========================================
echo   Configuración Completa
echo ========================================
echo.
echo Variables de entorno configuradas:
echo   ANDROID_HOME = %ANDROID_HOME%
echo.
echo Nota: Estas variables son temporales para esta sesión.
echo Para hacerlas permanentes, agrégalas en:
echo   Panel de Control → Sistema → Variables de entorno
echo.
