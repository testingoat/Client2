# Goat Grocery App - Run and Setup Guide

## Overview

This document provides instructions on how to run the Goat Grocery mobile application and its backend server to make the complete system functional. The app consists of:

1. A React Native mobile client (Android/iOS)
2. A Node.js backend server using Fastify and MongoDB

## System Architecture

```mermaid
graph TD
    A[Mobile Client] -->|API Calls| B[Backend Server]
    B -->|Database| C[MongoDB]
    A -->|Socket Connection| B
```

### Components

1. **Mobile Client** (`client/` directory)
   - React Native application (v0.77.0)
   - TypeScript for type safety
   - Zustand for state management
   - React Navigation for routing
   - Axios for API calls
   - Socket.IO for real-time communication

2. **Backend Server** (`server/` directory)
   - Fastify web framework
   - MongoDB with Mongoose ODM
   - AdminJS for admin panel
   - Socket.IO for real-time features

## Prerequisites

### For Mobile Client
- Node.js 18+
- npm or yarn
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Physical device or emulator/simulator

### For Backend Server
- Node.js 20+
- MongoDB database (local or cloud)
- npm or yarn

## Running the Application

### Step 1: Start the Backend Server

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the `server/` directory with:
   ```env
   MONGO_URI=mongodb+srv://testingoat24:Qwe_2897@cluster6.l5jkmi9.mongodb.net/Goatgoat?retryWrites=true&w=majority
   PORT=3000
   ```

4. Start the server:
   ```bash
   npm start
   # or for development with auto-restart:
   npm run dev
   ```

   The server should start on `http://localhost:3000`

### Step 2: Configure the Mobile Client

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure API endpoints (if needed):
   In `src/service/config.tsx`, the app is configured to use:
   - Production: `https://api.goatgoat.xyz/api` (VPS with SSL)
   - Development: `http://192.168.1.10:3000/api` (local network IP)

   For local development, you may need to:
   - Update `DEVELOPMENT_IP` to your machine's IP address
   - Set `USE_CLOUD` to `false`

### Step 3: Run the Mobile Application

1. Start the Metro bundler:
   ```bash
   npm start
   # or
   yarn start
   ```

2. In a new terminal, run on Android:
   ```bash
   npm run android
   # or
   yarn android
   ```

   Or for iOS (macOS only):
   ```bash
   npm run ios
   # or
   yarn ios
   ```

### Alternative: Run on Physical Device

If you're having issues with the emulator, you can run the app directly on a physical device:

1. **Connect your Android device**:
   - Enable Developer Options (tap Build Number 7 times in About Phone)
   - Enable USB Debugging in Developer Options
   - Connect via USB cable
   - Run `adb devices` to verify connection

2. **Run the app**:
   With Metro running, execute:
   ```bash
   npx react-native run-android --deviceId=<device_id>
   ```
   Or simply:
   ```bash
   npm run android
   ```
   (The app will be installed on the connected device if only one is connected)

## Configuration Details

### Backend Configuration

The backend server requires the following environment variables:
- `MONGO_URI`: MongoDB connection string
- `PORT`: Server port (defaults to 3000)

### Mobile Client Configuration

Key configuration values in `src/service/config.tsx`:
- `USE_CLOUD`: Set to `true` for production, `false` for local development
- `DEVELOPMENT_IP`: Your machine's IP address for local development
- `VPS_IP_URL`: Production VPS IP address
- `VPS_HTTPS_URL`: Production VPS URL with SSL

## Common Issues and Solutions

### 1. Android Build Failures

If you encounter build failures like `Execution failed for task ':app:packageDebug'`, try these solutions:

1. **Clean the build cache**:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npm run android
   ```

2. **Increase Gradle memory allocation**:
   In `android/gradle.properties`, ensure you have:
   ```
   org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
   ```

3. **Disable parallel builds temporarily**:
   In `android/gradle.properties`, comment out:
   ```
   # org.gradle.parallel=true
   # org.gradle.configureondemand=true
   ```

4. **Check Android SDK versions**:
   Ensure your Android SDK versions match those in `android/build.gradle`:
   - compileSdkVersion: 35
   - targetSdkVersion: 34
   - buildToolsVersion: 35.0.0

5. **Delete node_modules and reinstall**:
   ```bash
   rm -rf node_modules
   npm install
   ```

6. **Try building with verbose output**:
   ```bash
   npm run android --verbose
   ```

7. **Check for dependency conflicts**:
   ```bash
   cd android
   ./gradlew app:dependencies
   ```

8. **Update Gradle and Android Gradle Plugin**:
   - Check `android/gradle/wrapper/gradle-wrapper.properties` for Gradle version
   - Check `android/build.gradle` for Android Gradle Plugin version

9. **Try building directly with Gradle**:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

### 2. Network Connection Issues
- Ensure the mobile device and development machine are on the same network
- Update `DEVELOPMENT_IP` in `config.tsx` to match your machine's IP
- Check firewall settings

### 3. API Connection Failures
- Verify the backend server is running
- Check that the `BASE_URL` in `config.tsx` points to the correct server address
- Confirm the server port is accessible

### 4. Socket Connection Issues
- Ensure WebSocket connections are not blocked by firewalls
- Check that the Socket.IO server is properly configured

### 5. Android Emulator Issues
- Use `10.0.2.2` instead of `localhost` for Android emulator
- Ensure the correct IP is used for physical devices

If you see the error `Failed to launch emulator. Reason: It took too long to start`, try:

1. **Start the emulator manually**:
   ```bash
   C:\Users\prabh\AppData\Local\Android\Sdk\emulator\emulator @Medium_Phone_API_36.0
   ```

2. **Create a new emulator with a different API level**:
   - Open Android Studio
   - Go to AVD Manager
   - Create a new virtual device with API level 30-34

3. **Use a physical device instead**:
   - Connect your Android phone via USB
   - Enable Developer Options and USB Debugging
   - Run `adb devices` to verify connection

### 6. Windows-Specific Issues
- If you're on Windows and experiencing path length issues, try:
  1. Moving the project to a shorter path (e.g., `C:\projects\grocery`)
  2. Enabling long path support in Windows
  3. Using Windows Subsystem for Linux (WSL) for building

## Testing the Application

Once both the client and server are running:

1. The app should start with a splash screen
2. You can log in as either:
   - Customer (phone number only)
   - Delivery partner (email and password)
3. Browse products, add to cart, and place orders
4. Track orders in real-time using the map features

## Building for Distribution

### Android
1. Debug APK (for testing):
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

2. Release APK (for distribution):
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

### iOS
1. Archive the app in Xcode
2. Distribute through App Store Connect

## Useful Scripts

### Client Scripts
- `npm start`: Start Metro bundler
- `npm run android`: Build and run on Android
- `npm run ios`: Build and run on iOS
- `npm run lint`: Run ESLint

### Server Scripts
- `npm start`: Start the server
- `npm run dev`: Start the server with auto-restart (using nodemon)

## Directory Structure

### Client
```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── features/       # Feature-specific screens and logic
│   ├── navigation/     # App navigation setup
│   ├── service/        # API and backend integration
│   ├── state/          # Global state management (Zustand)
│   └── utils/          # Utility functions
├── android/            # Android native code
└── ios/                # iOS native code
```

### Server
```
server/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Middleware functions
│   ├── models/         # Database models
│   └── routes/         # API routes
├── app.js              # Server entry point
└── package.json        # Dependencies and scripts
```