import React, { FC, ReactNode } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'

interface GlassCardProps {
    children: ReactNode
    style?: ViewStyle
    intensity?: 'light' | 'medium' | 'strong'
    borderRadius?: number
}

/**
 * A glassmorphism-style card component with frosted glass effect.
 * Uses semi-transparent white background with subtle borders.
 */
const GlassCard: FC<GlassCardProps> = ({
    children,
    style,
    intensity = 'medium',
    borderRadius = 16,
}) => {
    const intensityStyles = {
        light: {
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        medium: {
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            borderColor: 'rgba(255, 255, 255, 0.5)',
        },
        strong: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: 'rgba(255, 255, 255, 0.7)',
        },
    }

    return (
        <View
            style={[
                styles.container,
                intensityStyles[intensity],
                { borderRadius },
                style,
            ]}
        >
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        overflow: 'hidden',
    },
})

export default GlassCard
