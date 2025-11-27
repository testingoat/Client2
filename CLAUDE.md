# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-platform grocery delivery application called "GoatGoat" consisting of:
- **React Native Mobile App** (Customer & Delivery Agent apps)
- **Node.js Backend Server** with Fastify framework
- **Admin Panel** using AdminJS
- **Seller App** (separate React Native application)

## Common Development Commands

### Mobile App (Root Directory)
```bash
# Development
npm start                    # Start Metro bundler
npm run android              # Run Android app
npm run ios                  # Run iOS app
npm run lint                 # Run ESLint
npm test                    # Run Jest tests

# Build & Assets
npm run link:fonts           # Link font assets
npm run pod-install          # Install iOS dependencies (CocoaPods)
```

### Backend Server (./server)
```bash
# Development
npm run dev                  # Start development server with nodemon
npm run build                # Build TypeScript to ./dist
npm run start                # Start production server
npm run clean                # Clean dist directory

# Testing
npm run test-otp            # Run OTP verification tests
```

## Architecture Overview

### Technology Stack
- **Mobile**: React Native 0.77.0 with TypeScript
- **State Management**: Zustand with MMKV persistence
- **Navigation**: React Navigation v7
- **Backend**: Node.js 20.x + Fastify 4.28.1
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT tokens with OTP-based login
- **Real-time**: Socket.IO for live order tracking
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Maps**: React Native Maps with Google Maps API

### Project Structure
```
├── src/                     # Mobile app source code
│   ├── components/         # Reusable UI components
│   ├── features/           # Feature-specific screens
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API services (FCM, etc.)
│   ├── state/              # Zustand stores
│   ├── utils/              # Helper utilities
│   └── config/             # App configuration
├── server/                 # Backend server
│   ├── api/                # API routes
│   ├── config/             # Server configuration
│   ├── models/             # Mongoose models
│   └── dist/               # Compiled JavaScript
├── SellerApp/              # Seller application
└── android/ & ios/         # Native platform files
```

## Environment Configuration

### Mobile App Environments
The app supports three environments configured in `src/service/config.tsx`:
- **Production**: `https://goatgoat.tech/api`
- **Staging**: `https://staging.goatgoat.tech/api`
- **Development**: Local IP address (configurable)

### Server Environments
Environment variables loaded via dotenv:
- `.env` - Base configuration
- `.env.development` - Development settings
- `.env.production` - Production settings
- `.env.staging` - Staging settings

## Key Features

### Mobile App Features
- Customer app with product browsing and ordering
- Delivery agent app with real-time order tracking
- OTP-based authentication system
- Cart management with persistence
- Real-time order tracking with maps integration
- Push notifications via FCM
- Voice search capabilities

### Backend Features
- RESTful API with Fastify
- Admin panel for backend management
- Real-time WebSocket support
- MongoDB database with separate collections per environment
- JWT-based authentication
- File upload handling
- Email/SMS integration capabilities

## Development Notes

### Firebase/FCM Integration
- FCM service is initialized in `App.tsx`
- Configuration in `src/config/firebase.ts`
- Service implementation in `src/services/FCMService.tsx`
- Test utilities in `src/utils/FCMTest.ts`

### State Management
- Uses Zustand for global state
- MMKV for persistence
- Store files located in `src/state/`

### Navigation
- React Navigation v7 setup
- Navigation configuration in `src/navigation/`
- Separate stacks for customer and delivery flows

### API Integration
- Axios for HTTP requests
- Configuration in `src/service/config.tsx`
- Base URL changes based on environment
- WebSocket integration for real-time features

## Build & Deployment

### Mobile App
- Android APK build scripts available
- iOS build requires Xcode
- Environment-specific builds supported
- Fastlane configuration for automated builds

### Backend Server
- TypeScript compilation to `./dist`
- PM2 process management for production
- Nginx reverse proxy configuration
- SSL certificates via Let's Encrypt
- Automated deployment scripts available

## Testing

### Mobile App
- Jest configuration for unit tests
- React Native Testing Library for component tests
- FCM test utilities included
- Debug components available

### Backend
- OTP verification tests
- API endpoint testing
- Database integration tests
- Admin panel functionality tests

## Important Files

### Configuration
- `src/service/config.tsx` - Environment-specific API configuration
- `server/.env*` - Server environment variables
- `babel.config.js` - Babel configuration
- `tsconfig.json` - TypeScript configuration

### Key Services
- `src/services/FCMService.tsx` - Firebase Cloud Messaging
- `src/services/api.ts` - API service layer
- `server/app.js` - Main server application
- `server/config/` - Server configuration files

### Documentation
- `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `React-Native-App-Analysis-and-Development-Strategy.md` - App architecture
- `Docs/` directory contains various guides and troubleshooting docs