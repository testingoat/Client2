import { View, StyleSheet, Image, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { screenHeight, screenWidth } from '@utils/Scaling';
import { darkWeatherColors, sunnyWeatherColors } from '@utils/Constants';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import { useWeatherStore } from '@state/weatherStore';
import { getWeatherAnimation, getAnimationKey } from '@service/animationService';
import { useThemeStore } from '@state/themeStore';

const Visuals = () => {
  // Remove useCollapsibleContext since we're implementing our own solution
  const opacity = useRef(new Animated.Value(1)).current;
  const { current } = useWeatherStore();

  // Get animation source based on weather condition
  const animationSource = getWeatherAnimation(current?.condition);
  const animationKey = getAnimationKey(current?.condition);
  const isRaining = current?.condition === 'rain';
  const headerGradientTop = useThemeStore((s) => s.headerGradientTop);
  const headerGradientBottom = useThemeStore((s) => s.headerGradientBottom);
  const gradientColors =
    !isRaining && headerGradientTop && headerGradientBottom
      ? [headerGradientTop, headerGradientBottom]
      : (isRaining ? darkWeatherColors : sunnyWeatherColors);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <LinearGradient colors={gradientColors} style={styles.gradient} />
      {isRaining && (
        <>
          <Image
            source={require('@assets/images/cloud.png')}
            style={styles.cloud}
          />
          {animationSource && (
            <LottieView
              key={animationKey} // Force re-render when weather condition changes
              autoPlay={true}
              enableMergePathsAndroidForKitKatAndAbove={true}
              loop={true}
              style={styles.lottie}
              source={animationSource}
            />
          )}
        </>
      )}
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  lottie: {
    width: '100%',
    height: 150,
    position: 'absolute',
    transform: [{ scaleX: -1 }],
  },
  gradient: {
    width: '100%',
    // Slightly taller so the sunny gradient is more visible
    height: screenHeight * 0.5,
    position: 'absolute',
  },
  cloud: {
    width: screenWidth,
    resizeMode: 'stretch',
    height: 100,
  },
});

export default Visuals;
