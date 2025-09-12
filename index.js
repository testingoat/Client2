/**
 * @format
 */

import {AppRegistry, Text,TextInput} from 'react-native';
import React from 'react';
import App from './App';
import {name as appName} from './app.json';

// 🔍 DYNAMIC STRING DETECTION LOGGER - Find exact culprit
if (__DEV__) {
  console.log('🔍 STRING DETECTION LOGGER ACTIVATED');

  const oldCreateElement = React.createElement;
  React.createElement = (type, props, ...children) => {
    children.forEach((c, index) => {
      // Check for strings in non-Text components
      if (typeof c === 'string' && type !== 'Text' && c.trim() !== '') {
        console.error('🚨 STRING CHILD FOUND IN', type, '=>', JSON.stringify(c));
        console.error('🚨 PROPS:', props);
        console.error('🚨 ALL CHILDREN:', children);
        console.error('🚨 STACK TRACE:', new Error().stack);
      }

      // Check for numbers in non-Text components
      if (typeof c === 'number' && type !== 'Text') {
        console.error('🚨 NUMBER CHILD FOUND IN', type, '=>', c);
        console.error('🚨 PROPS:', props);
        console.error('🚨 STACK TRACE:', new Error().stack);
      }

      // Check for undefined/null that might be rendered
      if ((c === undefined || c === null) && type !== 'Text') {
        console.warn('⚠️ UNDEFINED/NULL CHILD IN', type, '=>', c);
      }

      // Check for boolean values
      if (typeof c === 'boolean' && type !== 'Text') {
        console.warn('⚠️ BOOLEAN CHILD IN', type, '=>', c);
      }
    });

    return oldCreateElement(type, props, ...children);
  };

  // Also catch any direct Text rendering errors
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Text strings must be rendered within')) {
      try {
        console.error('🚨 CAUGHT TEXT RENDERING ERROR:', ...args);
        console.error('🚨 STACK TRACE:', new Error().stack);
      } catch (e) {
        // Fallback if console.error fails
      }
    }
    if (typeof originalConsoleError === 'function') {
      originalConsoleError(...args);
    }
  };
}

// Add global error handler for precision issues
// Console wrapper temporarily disabled for testing
// if (__DEV__) {
//   const originalConsoleError = console.error;
//   console.error = (...args) => {
//     if (args[0] && typeof args[0] === 'string' && args[0].includes('Loss of precision')) {
//       console.warn('Precision warning caught and handled:', ...args);
//       return;
//     }
//     originalConsoleError(...args);
//   };
// }

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
