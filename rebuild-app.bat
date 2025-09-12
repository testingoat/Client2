@echo off
echo Rebuilding the application...
echo Make sure you've run clean-and-reset.bat first!

echo.
echo Starting Metro bundler in a new window...
start "Metro Bundler" cmd /k "npx react-native start"

timeout /t 10

echo.
echo Building Android app...
npx react-native run-android

echo.
echo Rebuild process completed!
pause