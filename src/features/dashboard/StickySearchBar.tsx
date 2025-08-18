import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Colors } from '@utils/Constants'
import { StickyView, useCollapsibleContext } from '@r0b0t3d/react-native-collapsible'
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated'
import SearchBar from '@components/dashboard/SearchBar'


const StickySearchBar = () => {

  const {scrollY} = useCollapsibleContext()  

  const animatedShadow = useAnimatedStyle(()=>{
    const opacity = interpolate(
      Math.max(0, Math.min(scrollY.value, 140)),
      [0,140],
      [0,1],
      'clamp'
    )
    return {opacity: Math.max(0, Math.min(1, opacity))}
  })

  const backgroundColorChanges = useAnimatedStyle(()=>{
    const opacity = interpolate(
      Math.max(1, Math.min(scrollY.value, 80)),
      [1,80],
      [0,1],
      'clamp'
    )
    const clampedOpacity = Math.max(0, Math.min(1, opacity))
    return { backgroundColor: `rgba(255,255,255,${clampedOpacity})` }
  })



  return (
    <StickyView style={backgroundColorChanges}>
      <SearchBar />
      <Animated.View style={[styles.shadow,animatedShadow]} />
    </StickyView>
  )
}

const styles = StyleSheet.create({
    shadow:{
        height:15,
        width:'100%',
        borderBottomWidth:1,
        borderBottomColor:Colors.border
    }
})

export default StickySearchBar