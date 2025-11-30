import { WeatherCondition } from './weatherService';

// Animation mapping service for weather-based lottie animations
export const getWeatherAnimation = (condition?: WeatherCondition) => {
  // Only show animation when it's actually raining
  if (condition === 'rain') {
    return require('@assets/animations/raining.json');
  }

  // For all other conditions, don't render a weather animation
  return null;
};

// Get a unique key for animation re-rendering when condition changes
export const getAnimationKey = (condition?: WeatherCondition): string => {
  return condition || 'none';
};
