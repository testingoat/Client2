import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface FadeInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: ViewStyle | ViewStyle[];
  fadeFrom?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  distance?: number;
}

const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  duration = 600,
  delay = 0,
  style,
  fadeFrom = 'center',
  distance = 20,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [fadeAnim, translateAnim, duration, delay, distance]);

  const getTransform = () => {
    switch (fadeFrom) {
      case 'top':
        return [{ translateY: translateAnim.interpolate({
          inputRange: [0, distance],
          outputRange: [0, -distance],
        }) }];
      case 'bottom':
        return [{ translateY: translateAnim }];
      case 'left':
        return [{ translateX: translateAnim.interpolate({
          inputRange: [0, distance],
          outputRange: [0, -distance],
        }) }];
      case 'right':
        return [{ translateX: translateAnim }];
      default:
        return [{ scale: translateAnim.interpolate({
          inputRange: [0, distance],
          outputRange: [1, 0.9],
        }) }];
    }
  };

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: getTransform(),
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default FadeInView;
