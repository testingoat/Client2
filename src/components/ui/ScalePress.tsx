import { View, Text, ViewStyle, TouchableOpacity, Animated } from 'react-native'
import React, { FC, useRef } from 'react'

interface ScalePressProps {
    onPress?: () => void;
    children: React.ReactNode;
    style?: ViewStyle;
    scaleValue?: number;
    disabled?: boolean;
    hapticFeedback?: boolean;
}

const ScalePress: FC<ScalePressProps> = ({
    onPress,
    children,
    style,
    scaleValue = 0.95,
    disabled = false,
    hapticFeedback = false
}) => {
    const animatedScale = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        if (disabled) return;

        Animated.spring(animatedScale, {
            toValue: scaleValue,
            speed: 50,
            bounciness: 4,
            useNativeDriver: true
        }).start();
    };

    const onPressOut = () => {
        if (disabled) return;

        Animated.spring(animatedScale, {
            toValue: 1,
            speed: 50,
            bounciness: 4,
            useNativeDriver: true
        }).start();
    };

    const handlePress = () => {
        if (disabled || !onPress) return;

        // Add haptic feedback if enabled (would need react-native-haptic-feedback)
        // if (hapticFeedback) {
        //     HapticFeedback.trigger('impactLight');
        // }

        onPress();
    };

    return (
        <TouchableOpacity
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={handlePress}
            disabled={disabled}
            activeOpacity={disabled ? 1 : 0.9}
            style={[style, disabled && { opacity: 0.6 }]}
        >
            <Animated.View style={[{
                transform: [{ scale: animatedScale }],
                width: '100%'
            }]}>
                {children}
            </Animated.View>
        </TouchableOpacity>
    );
};

export default ScalePress