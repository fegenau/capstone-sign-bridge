@echo off
REM Quick start script for SignBridge model development
REM This script helps you start the app in different modes

echo.
echo ========================================
echo   SignBridge - Model Loading
echo ========================================
echo.
echo Choose how you want to run the app:
echo.
echo [1] Development Mode (Expo Go - Fast, Simulated)
echo     - No compilation needed
echo     - Uses simulated detection
echo     - Hot reload enabled
echo     - Takes 2 minutes
echo.
echo [2] Production Mode (Native Build - Real Model)
echo     - Compiles native modules
echo     - Uses TFLite model
echo     - First build takes 30-60 min
echo     - Real sign detection
echo.
echo [3] Verify Configuration
echo     - Check if everything is set up correctly
echo     - Run this if you're having issues
echo.
echo [0] Exit
echo.

set /p choice="Enter your choice (0-3): "

if "%choice%"=="1" goto dev_mode
if "%choice%"=="2" goto prod_mode
if "%choice%"=="3" goto verify
if "%choice%"=="0" goto end

echo Invalid choice. Exiting.
goto end

:dev_mode
echo.
echo ========================================
echo   Starting in Development Mode
echo ========================================
echo.
echo This will:
echo - Start Expo dev server
echo - Open QR code for Expo Go
echo - Use SIMULATED detection
echo.
echo Press Ctrl+C to stop the server
echo.
pause
cd sign-Bridge
npx expo start
goto end

:prod_mode
echo.
echo ========================================
echo   Starting in Production Mode
echo ========================================
echo.
echo WARNING: This requires:
echo - Android Studio installed
echo - Android SDK configured
echo - Device connected or emulator running
echo.
echo First time setup includes:
echo 1. Running expo prebuild (if needed)
echo 2. Compiling native code (30-60 minutes first time)
echo 3. Installing APK on device
echo.
set /p confirm="Continue? (y/n): "
if /i not "%confirm%"=="y" goto end

echo.
echo Checking if prebuild is needed...
if not exist "sign-Bridge\android\app" (
    echo Android folder not found. Running prebuild...
    cd sign-Bridge
    call npx expo prebuild --platform android
    if errorlevel 1 (
        echo.
        echo ERROR: Prebuild failed. Check the output above.
        pause
        goto end
    )
) else (
    echo Android folder found. Skipping prebuild.
)

echo.
echo Compiling and installing...
cd sign-Bridge
call npx expo run:android
if errorlevel 1 (
    echo.
    echo ERROR: Build failed. Common issues:
    echo - Android SDK not configured
    echo - Device not connected
    echo - Gradle build errors
    echo.
    echo Check MODEL_LOADING_GUIDE.md for troubleshooting.
    pause
)
goto end

:verify
echo.
echo ========================================
echo   Verifying Configuration
echo ========================================
echo.
cd sign-Bridge
node verify-model.js
echo.
pause
goto end

:end
echo.
echo Goodbye!
echo.
