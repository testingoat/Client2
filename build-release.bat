@echo off
echo Building Release APK...
echo.

REM Create a temporary directory with shorter path
set TEMP_DIR=C:\temp\ga
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"

REM Copy project to temp directory
echo Copying project to temporary directory...
xcopy /E /I /Q "%~dp0" "%TEMP_DIR%"

REM Navigate to temp directory and build
cd /d "%TEMP_DIR%\android"
echo Building release APK...
call gradlew.bat assembleRelease

REM Copy APK back to original location
if exist "%TEMP_DIR%\android\app\build\outputs\apk\release\app-release.apk" (
    echo Copying APK back to original location...
    copy "%TEMP_DIR%\android\app\build\outputs\apk\release\app-release.apk" "%~dp0android\app\build\outputs\apk\release\"
    echo.
    echo SUCCESS: Release APK created at android\app\build\outputs\apk\release\app-release.apk
) else (
    echo ERROR: Release APK was not created
)

REM Clean up temp directory
echo Cleaning up temporary files...
cd /d C:\
rmdir /s /q "%TEMP_DIR%"

echo.
echo Build process completed.
pause
