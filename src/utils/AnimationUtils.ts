/**
 * Animation utility functions to prevent precision errors
 */

/**
 * Clamps a value between min and max to prevent precision issues
 */
export const clampValue = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Rounds a number to specified decimal places to prevent precision issues
 */
export const roundToPrecision = (value: number, precision: number = 2): number => {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

/**
 * Safe interpolate wrapper that prevents precision issues
 */
export const safeInterpolate = (
  value: number,
  inputRange: number[],
  outputRange: number[],
  extrapolate: 'extend' | 'clamp' | 'identity' = 'clamp'
) => {
  // Clamp input value to reasonable bounds
  const clampedValue = clampValue(value, -10000, 10000);
  
  // For now, return a simple linear interpolation
  // This would need to be replaced with actual interpolate function in usage
  const inputMin = inputRange[0];
  const inputMax = inputRange[inputRange.length - 1];
  const outputMin = outputRange[0];
  const outputMax = outputRange[outputRange.length - 1];
  
  if (extrapolate === 'clamp') {
    if (clampedValue <= inputMin) return outputMin;
    if (clampedValue >= inputMax) return outputMax;
  }
  
  // Simple linear interpolation
  const ratio = (clampedValue - inputMin) / (inputMax - inputMin);
  const result = outputMin + ratio * (outputMax - outputMin);
  
  return roundToPrecision(result, 3);
};

/**
 * Safe animation value that prevents precision issues
 */
export const safeAnimationValue = (value: number): number => {
  return clampValue(roundToPrecision(value, 3), -1000, 1000);
};

/**
 * Safe opacity value (0-1 range)
 */
export const safeOpacity = (value: number): number => {
  return clampValue(roundToPrecision(value, 3), 0, 1);
};

/**
 * Safe transform value for translations
 */
export const safeTransform = (value: number): number => {
  return clampValue(roundToPrecision(value, 2), -1000, 1000);
};
