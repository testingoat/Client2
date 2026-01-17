import React from 'react'
import { StyleSheet, View } from 'react-native'

const Box = ({ w, h, r = 12 }: { w: number | string; h: number; r?: number }) => (
  <View style={[styles.box, { width: w, height: h, borderRadius: r }]} />
)

const HomeSkeleton = () => {
  return (
    <View>
      {/* Offer title */}
      <View style={styles.padH}>
        <Box w={180} h={18} r={8} />
      </View>

      {/* Offer cards */}
      <View style={[styles.row, styles.padH]}>
        <Box w={170} h={240} r={16} />
        <Box w={170} h={240} r={16} />
      </View>

      {/* Banner */}
      <View style={styles.padH}>
        <Box w="100%" h={180} r={16} />
      </View>

      {/* Category grid title */}
      <View style={[styles.padH, { marginTop: 18 }]}>
        <Box w={160} h={16} r={8} />
      </View>

      {/* Category tiles */}
      <View style={[styles.row, styles.padH, { marginTop: 12 }]}>
        <Box w={78} h={92} r={14} />
        <Box w={78} h={92} r={14} />
        <Box w={78} h={92} r={14} />
        <Box w={78} h={92} r={14} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  padH: { paddingHorizontal: 20 },
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  box: { backgroundColor: '#E9EDF3' },
})

export default HomeSkeleton

