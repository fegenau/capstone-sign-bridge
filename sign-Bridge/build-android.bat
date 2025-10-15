@echo off
REM ========================================
REM  SignBridge - Build Script
REM ========================================

echo.
echo ========================================
echo   Compilando SignBridge con Expo
echo ========================================
echo.

REM Configurar variables de entorno
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%JAVA_HOME%\bin

echo Configuracion:
echo   ANDROID_HOME = %ANDROID_HOME%
echo   JAVA_HOME = %JAVA_HOME%
echo.

REM Verificar que el SDK existe
if not exist "%ANDROID_HOME%" (
    echo ERROR: Android SDK no encontrado en %ANDROID_HOME%
    echo.
    echo Instalando dependencias...
    cd /d c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge
    call npm install --legacy-peer-deps
    pause
    exit /b 1
)

echo Verificando ADB...
"%ANDROID_HOME%\platform-tools\adb.exe" devices
echo.

echo Verificando dispositivos conectados...
"%ANDROID_HOME%\platform-tools\adb.exe" devices | findstr "device"
if errorlevel 1 (
    echo.
    echo ADVERTENCIA: No se detectaron dispositivos.
    echo Asegurate de tener un emulador corriendo o un dispositivo conectado.
    echo.
    pause
)

echo.
echo ========================================
echo   Iniciando Compilacion
echo ========================================
echo.
echo NOTA: Esto tomara 30-60 minutos la primera vez.
echo Puedes ver el progreso en esta ventana.
echo.
echo Para cancelar, presiona Ctrl+C
echo.
pause

cd /d c:\Users\Sebastian_Medina\Documents\GitHub\capstone-sign-bridge\sign-Bridge

echo Compilando e instalando...
call npx expo run:android

if errorlevel 1 (
    echo.
    echo ========================================
    echo   Error en la Compilacion
    echo ========================================
    echo.
    echo Revisa los errores arriba.
    echo Consulta BUILD_IN_PROGRESS.md para soluciones comunes.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Compilacion Exitosa!
echo ========================================
echo.
echo La app se ha instalado en tu dispositivo.
echo Revisa los logs para confirmar que el modelo se cargo.
echo.
echo Busca en los logs:
echo   "Modelo TFLite cargado exitosamente"
echo.
pause
