// src/features/dashboard/NoticeAnimation.tsx
import React, { ReactNode } from 'react';
import { View, StyleSheet, Animated as RNAnimated } from 'react-native';
import { NoticeHeight } from '@utils/Scaling';
import Notice from '@components/dashboard/Notice';

const NOTICE_HEIGHT = -(NoticeHeight + 12);

interface Props {
  noticePosition?: any;
  children: ReactNode;
  enabled?: boolean;
}

const NoticeAnimation: React.FC<Props> = ({ noticePosition, children, enabled = true }) => {
  // When disabled, render children without notice bar or animated padding.
  if (!enabled) {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>{children}</View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNAnimated.View
        style={[styles.noticeContainer, { transform: [{ translateY: noticePosition }] }]}
      >
        <Notice />
      </RNAnimated.View>

      <RNAnimated.View
        style={[
          styles.contentContainer,
          noticePosition && {
            paddingTop: noticePosition.interpolate({
              inputRange: [NOTICE_HEIGHT, 0],
              outputRange: [0, NoticeHeight + 20],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        {children}
      </RNAnimated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  noticeContainer: {
    width: '100%',
    position: 'absolute',
    zIndex: 999,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    // Allow underlying visuals/gradients to show through
    backgroundColor: 'transparent',
  },
});

export default NoticeAnimation;
