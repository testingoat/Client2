@echo off
echo Installing APK to connected Android device...
echo.

REM Check if ADB is available
adb version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: ADB is not found in PATH
    echo Please make sure Android SDK platform-tools is installed and added to PATH
    echo You can also manually install the APK by copying it to your phone
    pause
    exit /b 1
)

REM Check if device is connected
echo Checking for connected devices...
adb devices

REM Install the debug APK
set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk
if exist "%APK_PATH%" (
    echo.
    echo Installing %APK_PATH%...
    adb install -r "%APK_PATH%"
    if %errorlevel% equ 0 (
        echo.
        echo SUCCESS: APK installed successfully!
        echo You can now find the "grocery_app" app on your device
    ) else (
        echo.
        echo ERROR: Failed to install APK
        echo Make sure USB debugging is enabled on your device
        echo and you have authorized this computer
    )
) else (
    echo ERROR: APK file not found at %APK_PATH%
    echo Please run the build first using: npm run android
)

echo.
pause
