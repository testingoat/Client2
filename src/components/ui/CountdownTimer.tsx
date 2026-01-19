import React, { FC, useEffect, useState, useCallback, useRef } from 'react'
import { View, StyleSheet, Animated, ViewStyle } from 'react-native'
import CustomText from './CustomText'
import { Fonts } from '@utils/Constants'
import LinearGradient from 'react-native-linear-gradient'

interface CountdownTimerProps {
    /** Target end time in milliseconds (Date.now() format) */
    endTime: number
    /** Callback when timer reaches zero */
    onComplete?: () => void
    /** Style for the container */
    style?: ViewStyle
    /** Show labels below digits */
    showLabels?: boolean
    /** Compact mode for smaller displays */
    compact?: boolean
}

interface TimeLeft {
    hours: number
    minutes: number
    seconds: number
}

const calculateTimeLeft = (endTime: number): TimeLeft => {
    const difference = endTime - Date.now()

    if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 }
    }

    return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
    }
}

const padZero = (num: number): string => num.toString().padStart(2, '0')

const TimeBlock: FC<{
    value: string
    label?: string
    compact?: boolean
    isLast?: boolean
}> = ({ value, label, compact, isLast }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current
    const prevValue = useRef(value)

    useEffect(() => {
        if (prevValue.current !== value) {
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start()
            prevValue.current = value
        }
    }, [value, scaleAnim])

    return (
        <View style={styles.blockContainer}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <LinearGradient
                    colors={['#1a1a2e', '#16213e']}
                    style={[styles.block, compact && styles.blockCompact]}
                >
                    <CustomText
                        style={[styles.digit, compact && styles.digitCompact]}
                        fontFamily={Fonts.Bold}
                    >
                        {value}
                    </CustomText>
                </LinearGradient>
            </Animated.View>
            {label && (
                <CustomText style={styles.label} fontFamily={Fonts.Medium}>
                    {label}
                </CustomText>
            )}
            {!isLast && (
                <CustomText style={[styles.separator, compact && styles.separatorCompact]}>
                    :
                </CustomText>
            )}
        </View>
    )
}

/**
 * Countdown timer with animated digit blocks.
 * Perfect for flash sales and limited-time offers.
 */
const CountdownTimer: FC<CountdownTimerProps> = ({
    endTime,
    onComplete,
    style,
    showLabels = true,
    compact = false,
}) => {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(endTime))
    const completedRef = useRef(false)

    const updateTimer = useCallback(() => {
        const newTimeLeft = calculateTimeLeft(endTime)
        setTimeLeft(newTimeLeft)

        if (
            newTimeLeft.hours === 0 &&
            newTimeLeft.minutes === 0 &&
            newTimeLeft.seconds === 0 &&
            !completedRef.current
        ) {
            completedRef.current = true
            onComplete?.()
        }
    }, [endTime, onComplete])

    useEffect(() => {
        const interval = setInterval(updateTimer, 1000)
        return () => clearInterval(interval)
    }, [updateTimer])

    return (
        <View style={[styles.container, style]}>
            <TimeBlock
                value={padZero(timeLeft.hours)}
                label={showLabels ? 'HRS' : undefined}
                compact={compact}
            />
            <TimeBlock
                value={padZero(timeLeft.minutes)}
                label={showLabels ? 'MIN' : undefined}
                compact={compact}
            />
            <TimeBlock
                value={padZero(timeLeft.seconds)}
                label={showLabels ? 'SEC' : undefined}
                compact={compact}
                isLast
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    blockContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    block: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    blockCompact: {
        paddingHorizontal: 6,
        paddingVertical: 3,
        minWidth: 30,
        borderRadius: 6,
    },
    digit: {
        color: '#fff',
        fontSize: 20,
    },
    digitCompact: {
        fontSize: 13,
    },
    label: {
        color: '#666',
        fontSize: 9,
        marginTop: 4,
        textAlign: 'center',
        position: 'absolute',
        bottom: -16,
        left: 0,
        right: 0,
    },
    separator: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginHorizontal: 4,
    },
    separatorCompact: {
        fontSize: 13,
        marginHorizontal: 1,
    },
})

export default CountdownTimer
