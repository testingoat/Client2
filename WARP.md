# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **grocery delivery app ecosystem** built with React Native client and Node.js backend. The app supports customers, delivery agents, and includes an admin panel for management.

### Technology Stack
- **Frontend**: React Native 0.77.0 with TypeScript
- **Backend**: Node.js with Fastify framework  
- **Database**: MongoDB with Mongoose ODM
- **State Management**: Zustand with persistence
- **Real-time**: Socket.IO for live order tracking
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Maps**: React Native Maps with Google Maps API
- **Authentication**: JWT tokens with OTP verification

## Common Development Commands

### React Native App Commands
```bash
# Start Metro bundler (required before running app)
npm start

# Run on Android device/emulator
npm run android

# Run on iOS device/simulator  
npm run ios

# Run linting
npm run lint

# Run tests
npm run test

# Link fonts and assets
npm run link:fonts

# Install iOS dependencies (iOS only)
npm run pod-install
# or manually:
cd ios && RCT_NEW_ARCH_ENABLED=1 bundle exec pod install
```

### Server Commands  
```bash
cd server

# Start development server (requires build first)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Clean build files
npm run clean

# Build with clean
npm run prebuild && npm run build

# Test OTP functionality
npm run test-otp
```

### APK Building
```bash
cd android

# Build debug APK (works on Windows)
./gradlew assembleDebug

# Build release APK (may fail due to path length on Windows)
./gradlew assembleRelease
```

**Note**: Release APK builds may fail on Windows due to path length limitations with React Native Reanimated. Use WSL or move project to shorter path (e.g., `C:\GA\client`) as workaround.

### Single Test Running
```bash
# Run specific test file
npm test -- --testPathPattern="ComponentName"

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Code Architecture

### Frontend Architecture (React Native)

**Directory Structure:**
```
src/
├── assets/          # Static assets (images, fonts, animations)
├── components/      # Reusable UI components  
├── features/        # Feature-specific screens and components
├── navigation/      # Navigation configuration
├── services/        # API clients and business logic
├── state/           # Zustand store management
├── utils/           # Helper functions and utilities
├── config/          # App configuration (Firebase, etc.)
└── styles/          # Theme and styling constants
```

**Key Patterns:**
- **Path Aliases**: Uses TypeScript path mapping (`@components/*`, `@features/*`, etc.) configured in `tsconfig.json` and `babel.config.js`
- **State Management**: Zustand for global state with MMKV persistence for offline data
- **Navigation**: React Navigation v7 with native stack navigator
- **API Integration**: Axios-based service layer with JWT authentication
- **Real-time Updates**: Socket.IO client for live order tracking

**Animation Architecture:**
- Uses React Native Reanimated v3 for animations
- Custom animation utilities in `src/utils/AnimationUtils.ts` to prevent precision errors
- All interpolate functions use bounds checking and `extrapolate: 'clamp'`

### Backend Architecture (Node.js/Fastify)

**Directory Structure:**
```
server/src/
├── config/          # Database connection and app setup
├── controllers/     # Request handlers organized by domain
├── models/          # Mongoose schemas and models
├── routes/          # API route definitions
├── services/        # Business logic and external integrations
├── middleware/      # Authentication and request processing
├── adminjs/         # Admin panel configuration
└── types/           # TypeScript type definitions
```

**Key Patterns:**
- **Framework**: Fastify with TypeScript, ES modules enabled
- **Database**: MongoDB with Mongoose ODM, connection pooling
- **Authentication**: JWT tokens with refresh mechanism
- **Real-time**: Socket.IO server for live updates
- **Admin Panel**: AdminJS with MongoDB adapter
- **External Services**: Fast2SMS for OTP, Firebase Admin for push notifications
- **WebSocket Support**: Fastify WebSocket plugin for real-time features

**Socket.IO Architecture:**
- Rooms-based organization for order tracking
- Delivery agents join order-specific rooms
- Real-time location updates and order status changes

### Database Models
- **User**: Customer and delivery agent profiles
- **Product**: Grocery items with categories
- **Order**: Order management with status tracking
- **Branch**: Store/branch information
- **Admin**: Admin panel user management
- **Counter**: Auto-incrementing IDs for orders

## Development Environment Setup

### Local Development Server
```bash
# 1. Set up local MongoDB (using Docker recommended)
docker run -d -p 27017:27017 --name mongo-dev mongo:latest

# 2. Configure server environment
cd server
cp .env.example .env
# Edit .env with local MongoDB URI: mongodb://localhost:27017/grocery-dev

# 3. Build and start local server
npm run build
npm run dev
```

### Client Configuration for Local Testing
The app automatically detects environment:
- **Android Emulator**: Uses `10.0.2.2:3000` (maps to localhost)
- **Real Device**: Configure `DEVELOPMENT_IP` in `src/service/config.tsx` with your machine's IP address
- **Production**: Uses `api.goatgoat.xyz` (HTTPS) or `168.231.123.247:3000` (HTTP)

### Firebase Configuration
- FCM for push notifications requires `firebase-service-account.json` in server directory
- Client uses Firebase SDK for token management
- Server uses Firebase Admin SDK for sending notifications

## Important Development Notes

### Animation Precision Fixes
The app includes custom handling for React Native Reanimated precision errors:
- All animation values use bounds checking
- Interpolate functions include `extrapolate: 'clamp'`
- Custom utilities in `AnimationUtils.ts` for safe animation handling

### Platform-Specific Considerations
- **Android**: Requires API level 21+ for proper React Native Reanimated support
- **iOS**: Requires CocoaPods installation and proper bundle configuration
- **Windows Development**: APK release builds may fail due to path length limitations

### Server Deployment Architecture
- **Production**: VPS deployment at `api.goatgoat.xyz`
- **Database**: MongoDB Atlas or self-hosted MongoDB
- **File Structure**: TypeScript source in `src/`, compiled JavaScript in `dist/`
- **Process Management**: PM2 or similar for production deployment

### Real-time Features
- Socket.IO handles live order tracking between customers and delivery agents
- WebSocket fallback for unreliable connections
- Room-based architecture for scalable real-time updates

### Security Considerations
- JWT tokens with refresh mechanism
- OTP-based authentication via Fast2SMS
- Admin panel with session-based authentication
- CORS configuration for API access
- Environment variable management for secrets

## Testing Strategy

The app includes comprehensive error handling for:
- Network connectivity issues
- Animation precision errors
- Firebase initialization failures
- MongoDB connection problems
- Socket.IO connection drops

Use the debug APK for local testing, as it includes additional logging and error reporting capabilities.
