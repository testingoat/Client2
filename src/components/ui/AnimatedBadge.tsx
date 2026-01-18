import React, { FC, useEffect, useRef } from 'react'
import { Animated, StyleSheet, View, ViewStyle } from 'react-native'
import CustomText from './CustomText'
import { Fonts } from '@utils/Constants'
import LinearGradient from 'react-native-linear-gradient'

interface AnimatedBadgeProps {
    text: string
    variant?: 'discount' | 'trending' | 'new' | 'limited'
    style?: ViewStyle
    animate?: boolean
}

const variantColors = {
    discount: ['#FF5A5A', '#FF3B3B'],
    trending: ['#FF6B35', '#F7931E'],
    new: ['#00C853', '#00E676'],
    limited: ['#7C3AED', '#A855F7'],
}

/**
 * Animated badge with shine effect for discounts, trending items, etc.
 */
const AnimatedBadge: FC<AnimatedBadgeProps> = ({
    text,
    variant = 'discount',
    style,
    animate = true,
}) => {
    const shineAnim = useRef(new Animated.Value(-1)).current

    useEffect(() => {
        if (!animate) return

        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(shineAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.delay(3000),
                Animated.timing(shineAnim, {
                    toValue: -1,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        )
        animation.start()

        return () => animation.stop()
    }, [animate, shineAnim])

    const shineTranslate = shineAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: [-50, 100],
    })

    const colors = variantColors[variant]

    return (
        <View style={[styles.container, style]}>
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <CustomText style={styles.text} fontFamily={Fonts.SemiBold}>
                    {text}
                </CustomText>

                {/* Shine effect overlay */}
                {animate && (
                    <Animated.View
                        style={[
                            styles.shine,
                            {
                                transform: [{ translateX: shineTranslate }, { rotate: '25deg' }],
                            },
                        ]}
                    />
                )}
            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: 999,
    },
    gradient: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        position: 'relative',
        overflow: 'hidden',
    },
    text: {
        color: '#fff',
        fontSize: 10,
        textAlign: 'center',
    },
    shine: {
        position: 'absolute',
        top: -10,
        bottom: -10,
        width: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
})

export default AnimatedBadge
