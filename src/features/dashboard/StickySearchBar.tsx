import { View, StyleSheet, Animated } from 'react-native'
import React from 'react'
import { Colors } from '@utils/Constants'
import FunctionalSearchBar from '@components/dashboard/FunctionalSearchBar'
import { NoticeHeight } from '@utils/Scaling'

interface StickySearchBarProps {
  scrollY?: Animated.Value;
  noticePosition?: Animated.Value;
}

const StickySearchBar: React.FC<StickySearchBarProps> = ({ scrollY, noticePosition }) => {

  // Calculate sticky position - stick below notice when visible
  const NOTICE_HEIGHT = -(NoticeHeight + 12);
  const stickyTop = noticePosition ? noticePosition.interpolate({
    inputRange: [NOTICE_HEIGHT, 0],
    outputRange: [0, NoticeHeight], // Stick below notice when it's visible
    extrapolate: 'clamp',
  }) : 0;

  return (
    <Animated.View style={[
      styles.stickyContainer,
      {
        // Keep transparent background always - no visual changes
        backgroundColor: 'transparent',
        // Position search bar to stick below notice
        position: 'sticky',
        top: stickyTop,
        zIndex: 800, // Below header but above content
      }
    ]}>
      <FunctionalSearchBar onSearch={(query, results) => {
        console.log('Search query:', query);
        console.log('Search results:', results);
      }} />
      {/* Removed shadow and any visual effects that appear on scroll */}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  stickyContainer: {
    paddingBottom: 15,
    // No additional styling that could create visual changes
  },
})

export default StickySearchBar