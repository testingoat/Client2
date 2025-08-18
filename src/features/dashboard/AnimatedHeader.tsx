import React, { FC } from 'react'
import { useCollapsibleContext } from '@r0b0t3d/react-native-collapsible'
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated'
import Header from '@components/dashboard/Header'


const AnimatedHeader: FC<{ showNotice: () => void }> = ({ showNotice }) => {

    const { scrollY } = useCollapsibleContext()

    const headerAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            Math.max(0, Math.min(scrollY.value, 120)),
            [0, 120],
            [1, 0],
            'clamp'
        )
        return { opacity: Math.max(0, Math.min(1, opacity)) }
    })

    return (
        <Animated.View style={headerAnimatedStyle}>
            <Header showNotice={showNotice} />
        </Animated.View>
    )
}

export default AnimatedHeader