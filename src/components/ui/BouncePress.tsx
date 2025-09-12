import React, { useRef } from 'react';
import { TouchableOpacity, Animated, ViewStyle } from 'react-native';

interface BouncePressProps {
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
  bounceScale?: number;
  bounceSpeed?: number;
  activeOpacity?: number;
}

const BouncePress: React.FC<BouncePressProps> = ({
  onPress,
  children,
  style,
  disabled = false,
  bounceScale = 0.95,
  bounceSpeed = 150,
  activeOpacity = 0.8,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    if (disabled) return;
    
    Animated.spring(scaleValue, {
      toValue: bounceScale,
      speed: bounceSpeed,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    if (disabled) return;
    
    Animated.spring(scaleValue, {
      toValue: 1,
      speed: bounceSpeed,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (disabled || !onPress) return;
    
    // Add a slight delay to let the animation complete
    setTimeout(() => {
      onPress();
    }, 50);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      activeOpacity={activeOpacity}
      style={style}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleValue }],
        }}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default BouncePress;
