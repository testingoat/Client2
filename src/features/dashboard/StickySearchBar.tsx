import { View, StyleSheet, Animated } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@utils/Constants'
import FunctionalSearchBar from '@components/dashboard/FunctionalSearchBar'
import { NoticeHeight } from '@utils/Scaling'

interface StickySearchBarProps {
  scrollY?: Animated.Value;
  noticePosition?: Animated.Value;
}

const StickySearchBar: React.FC<StickySearchBarProps> = ({ scrollY, noticePosition }) => {
  const navigation = useNavigation<any>();

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
        // position: 'sticky', // Removed invalid property, default is relative which works

        top: stickyTop,
        zIndex: 800, // Below header but above content
      }
    ]}>
      <FunctionalSearchBar onSearch={(query, results) => {
        if (!query || !query.trim()) {
          return;
        }

        console.log('Search query:', query);
        console.log('Search results:', results);

        navigation.navigate('SearchResults', {
          query,
          initialResults: results,
        });
      }} />
      {/* Removed shadow and any visual effects that appear on scroll */}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  stickyContainer: {
    // Slight bottom padding so the search bar doesn't collide
    // with the top of the ad banner, but keeps the gap tight.
    paddingBottom: 6,
    // No additional styling that could create visual changes
  },
})

export default StickySearchBar
