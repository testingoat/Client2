/**
 * @format
 */

import {AppRegistry, Text,TextInput} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {
    configureReanimatedLogger,
    ReanimatedLogLevel,
  } from 'react-native-reanimated';

configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
});

// Add global error handler for precision issues
if (__DEV__) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Loss of precision')) {
      console.warn('Precision warning caught and handled:', ...args);
      return;
    }
    originalConsoleError(...args);
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
