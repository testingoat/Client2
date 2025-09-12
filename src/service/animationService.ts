import { WeatherCondition } from './weatherService';

// Animation mapping service for weather-based lottie animations
export const getWeatherAnimation = (condition?: WeatherCondition) => {
  switch (condition) {
    case 'rain':
      return require('@assets/animations/raining.json');
    case 'clear':
    case 'sunny':
      return require('@assets/animations/sunny.json');
    case 'cloudy':
    case 'snow':
    case 'fog':
    case 'unknown':
    default:
      // Default to rain animation for all other conditions
      return require('@assets/animations/raining.json');
  }
};

// Get a unique key for animation re-rendering when condition changes
export const getAnimationKey = (condition?: WeatherCondition): string => {
  return condition || 'rain';
};
