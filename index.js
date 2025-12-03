/**
 * @format
 */

import {AppRegistry, Text, TextInput} from 'react-native';
import React from 'react';
import App from './App';
import {name as appName} from './app.json';

// Development-only console filter to keep dev logs usable
// without crashing the UI on expected geolocation permission errors.
if (__DEV__) {
  const originalConsoleError = console.error;

  console.error = (...args) => {
    const first = args[0];

    // Suppress known, non-fatal geolocation permission errors that
    // otherwise spam LogBox and cause visual flicker:
    // - Object form from @react-native-community/geolocation
    // - Stringified JSON form logged by underlying utilities
    const isGeoPermissionObject =
      first &&
      typeof first === 'object' &&
      first.message === 'Location permission was not granted.';

    const isGeoPermissionString =
      typeof first === 'string' &&
      first.includes('Location permission was not granted.');

    const isGeoPermissionJsonString =
      typeof first === 'string' &&
      first.includes('"PERMISSION_DENIED":1') &&
      first.includes('"TIMEOUT":3') &&
      first.includes('"POSITION_UNAVAILABLE":2');

    if (isGeoPermissionObject || isGeoPermissionString || isGeoPermissionJsonString) {
      return;
    }

    if (typeof originalConsoleError === 'function') {
      originalConsoleError(...args);
    }
  };
}

if (Text.defaultProps) {
  Text.defaultProps.allowFontScaling = false;
} else {
  Text.defaultProps = {};
  Text.defaultProps.allowFontScaling = false;
}

if (TextInput.defaultProps) {
  TextInput.defaultProps.allowFontScaling = false;
} else {
  TextInput.defaultProps = {};
  TextInput.defaultProps.allowFontScaling = false;
}

AppRegistry.registerComponent(appName, () => App);
