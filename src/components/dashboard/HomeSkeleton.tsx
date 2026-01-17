import React, { useEffect, useMemo, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'

const Box = ({
  w,
  h,
  r = 12,
  style,
  opacity,
}: {
  w: number | string
  h: number
  r?: number
  style?: any
  opacity: Animated.AnimatedInterpolation<string | number>
}) => (
  <Animated.View
    style={[styles.box, { width: w, height: h, borderRadius: r, opacity }, style]}
  />
)

const HomeSkeleton = () => {
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [pulse])

  const opacity = useMemo(
    () =>
      pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.45, 0.85],
      }),
    [pulse]
  )

  return (
    <View style={{ paddingTop: 12 }}>
      {/* Offer title */}
      <View style={styles.padH}>
        <Box w={200} h={18} r={9} opacity={opacity} />
      </View>

      {/* Offer cards */}
      <View style={[styles.row, styles.padH, { marginTop: 10 }]}>
        <Box w={180} h={250} r={18} opacity={opacity} />
        <Box w={180} h={250} r={18} opacity={opacity} />
      </View>

      {/* Banner */}
      <View style={[styles.padH, { marginTop: 14 }]}>
        <Box w="100%" h={190} r={18} opacity={opacity} />
      </View>

      {/* Category grid title */}
      <View style={[styles.padH, { marginTop: 18 }]}>
        <Box w={220} h={16} r={8} opacity={opacity} />
      </View>

      {/* Category tiles */}
      <View style={[styles.rowWrap, styles.padH, { marginTop: 12 }]}>
        <Box w={84} h={96} r={16} opacity={opacity} />
        <Box w={84} h={96} r={16} opacity={opacity} />
        <Box w={84} h={96} r={16} opacity={opacity} />
        <Box w={84} h={96} r={16} opacity={opacity} />
        <Box w={84} h={96} r={16} opacity={opacity} />
        <Box w={84} h={96} r={16} opacity={opacity} />
        <Box w={84} h={96} r={16} opacity={opacity} />
        <Box w={84} h={96} r={16} opacity={opacity} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  padH: { paddingHorizontal: 20 },
  row: { flexDirection: 'row', gap: 12 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  box: { backgroundColor: '#E9EDF3' },
})

export default HomeSkeleton
