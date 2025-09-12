import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import CustomText from '@components/ui/CustomText';
import { Fonts } from '@utils/Constants';
import { NoticeHeight } from '@utils/Scaling';
import { wavyData } from '@utils/dummyData';

// IMPORTANT: Ensure you have react-native-svg installed and linked
// Clean, safe implementation that never renders strings directly in Views

const Notice = () => {
  // Guard log
  if (__DEV__) {
    console.log('🚨 Rendering Notice component');
    console.log('🚨 wavyData type:', typeof wavyData, 'length:', wavyData?.length);
    console.log('🚨 Notice props resolved');
  }

  return (
    <View style={styles.wrapper} pointerEvents="none">
      {/* Wave background (SVG) */}
      <View style={styles.svgContainer}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 4000 1000"   // Use the original large viewBox for your path
          preserveAspectRatio="none"
        >
          {/* ✅ Correct: Path uses the string as the "d" attribute, never as child */}
          <Path d={wavyData} fill="#CCD5E4" />
        </Svg>
      </View>

      {/* Foreground content */}
      <View style={styles.content} pointerEvents="none">
        <CustomText
          variant="h8"
          fontFamily={Fonts.SemiBold}
          style={styles.title}
          numberOfLines={1}
        >
          It's raining near this location
        </CustomText>

        <CustomText
          variant="h9"
          fontFamily={Fonts.Medium}
          style={styles.subtitle}
          numberOfLines={2}
        >
          Our delivery partners may take longer to reach you
        </CustomText>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    backgroundColor: '#CCD5E4',
    overflow: 'hidden',
    height: NoticeHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 35,
    width: '100%',
    transform: [{ rotateX: '180deg' }],
  },
  content: {
    position: 'absolute',
    top: 16,
    left: 20,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#2D3875',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#2D3875',
    marginBottom: 8,
  },
});

export default memo(Notice);