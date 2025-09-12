@echo off
echo Cleaning Android build...
cd android
call .\gradlew.bat clean
cd ..

echo.
echo Resetting Metro cache...
npx react-native start --reset-cache

echo.
echo Build directories cleaned and Metro cache reset successfully!
pause