import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '@utils/Constants';

interface LoadingAnimationProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: object;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  size = 'medium',
  color = Colors.secondary,
  style
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, [spinValue, scaleValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 30;
      case 'large':
        return 40;
      default:
        return 30;
    }
  };

  const containerSize = getSize();
  const dotSize = containerSize * 0.25;

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }, style]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: containerSize,
            height: containerSize,
            transform: [{ rotate: spin }, { scale: scaleValue }],
          },
        ]}
      >
        <View
          style={[
            styles.dot,
            styles.dot1,
            {
              width: dotSize,
              height: dotSize,
              backgroundColor: color,
            },
          ]}
        />
        <View
          style={[
            styles.dot,
            styles.dot2,
            {
              width: dotSize,
              height: dotSize,
              backgroundColor: color,
              opacity: 0.7,
            },
          ]}
        />
        <View
          style={[
            styles.dot,
            styles.dot3,
            {
              width: dotSize,
              height: dotSize,
              backgroundColor: color,
              opacity: 0.4,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    borderRadius: 50,
  },
  dot1: {
    top: 0,
    alignSelf: 'center',
  },
  dot2: {
    bottom: 0,
    alignSelf: 'center',
  },
  dot3: {
    right: 0,
    alignSelf: 'center',
    top: '50%',
    marginTop: -5,
  },
});

export default LoadingAnimation;
