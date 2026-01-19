import { StyleSheet, Animated } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import FunctionalSearchBar from '@components/dashboard/FunctionalSearchBar'
import { NoticeHeight } from '@utils/Scaling'

interface StickySearchBarProps {
  scrollY?: Animated.Value;
  noticePosition?: Animated.Value;
  headerHeight?: number;
}

const StickySearchBar: React.FC<StickySearchBarProps> = ({ scrollY, noticePosition, headerHeight = 120 }) => {
  const navigation = useNavigation<any>();

  // Push down when notice is visible
  const NOTICE_HEIGHT = -(NoticeHeight + 12);
  const noticeTranslateY = noticePosition ? noticePosition.interpolate({
    inputRange: [NOTICE_HEIGHT, 0],
    outputRange: [0, NoticeHeight], // Stick below notice when it's visible
    extrapolate: 'clamp',
  }) : 0;

  // As user scrolls down, slide search bar up to the top (true "sticky" behavior)
  const slideUp = scrollY
    ? scrollY.interpolate({
        inputRange: [0, headerHeight],
        outputRange: [0, -headerHeight],
        extrapolate: 'clamp',
      })
    : 0;

  const translateY = Animated.add(slideUp as any, noticeTranslateY as any)

  return (
    <Animated.View style={[
      styles.stickyContainer,
      {
        top: headerHeight,
        transform: [{ translateY }],
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
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 800, // Below header but above scroll content
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
})

export default StickySearchBar
