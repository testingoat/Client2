import {View, StyleSheet, Image, Animated} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {screenHeight, screenWidth} from '@utils/Scaling';
import {darkWeatherColors} from '@utils/Constants';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import { useWeatherStore } from '@state/weatherStore';
import { getWeatherAnimation, getAnimationKey } from '@service/animationService';

const Visuals = () => {
  // Remove useCollapsibleContext since we're implementing our own solution
  const opacity = useRef(new Animated.Value(1)).current;
  const { current } = useWeatherStore();

  // Get animation source based on weather condition
  const animationSource = getWeatherAnimation(current?.condition);
  const animationKey = getAnimationKey(current?.condition);

  return (
    <Animated.View style={[styles.container, {opacity}]}>
      <LinearGradient colors={darkWeatherColors} style={styles.gradient} />
      <Image
        source={require('@assets/images/cloud.png')}
        style={styles.cloud}
      />
      <LottieView
        key={animationKey} // Force re-render when weather condition changes
        autoPlay={true}
        enableMergePathsAndroidForKitKatAndAbove={true}
        loop={true}
        style={styles.lottie}
        source={animationSource}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  lottie: {
    width: '100%',
    height: 150,
    position: 'absolute',
    transform: [{scaleX: -1}],
  },
  gradient: {
    width: '100%',
    height: screenHeight * 0.4,
    position: 'absolute',
  },
  cloud: {
    width: screenWidth,
    resizeMode: 'stretch',
    height: 100,
  },
});

export default Visuals;