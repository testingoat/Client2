import React, { useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Animated,
  PanGestureHandler,
  State,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Colors } from '@utils/Constants';
import LoadingAnimation from './LoadingAnimation';
import CustomText from './CustomText';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
  style?: object;
  showRefreshText?: boolean;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshing = false,
  style,
  showRefreshText = true,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Animate the refresh indicator
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 60,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await onRefresh();
    } finally {
      // Hide the refresh indicator
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsRefreshing(false);
      });
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Custom refresh indicator */}
      <Animated.View
        style={[
          styles.refreshIndicator,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <LoadingAnimation size="small" color={Colors.secondary} />
        {showRefreshText ? (
          <CustomText variant="h7" style={styles.refreshText}>
            Refreshing...
          </CustomText>
        ) : null}
      </Animated.View>

      {/* ScrollView with RefreshControl */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.secondary, Colors.primary]}
            tintColor={Colors.secondary}
            progressBackgroundColor={Colors.background}
            progressViewOffset={60}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  refreshIndicator: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    zIndex: 1000,
    flexDirection: 'row',
  },
  refreshText: {
    marginLeft: 8,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
});

export default PullToRefresh;
