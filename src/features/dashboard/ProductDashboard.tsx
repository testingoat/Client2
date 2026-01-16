import {
  View,
  StyleSheet,
  Animated as RNAnimated,
  Platform,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { NoticeHeight, screenHeight } from '@utils/Scaling';
import Geolocation from '@react-native-community/geolocation';
import { reverseGeocode } from '@service/mapService';
import { useAuthStore } from '@state/authStore';
import NoticeAnimation from './NoticeAnimation';
import Visuals from './Visuals';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomText from '@components/ui/CustomText';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withTiming,
} from 'react-native-reanimated';
import { RFValue } from 'react-native-responsive-fontsize';
import { Fonts } from '@utils/Constants';
import AnimatedHeader from './AnimatedHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Content from '@components/dashboard/Content';
import StickySearchBar from './StickySearchBar';
import withCart from '@features/cart/WithCart';
import withLiveStatus from '@features/map/withLiveStatus';
import NotificationManager from '@utils/NotificationManager';
import { useWeatherStore } from '@state/weatherStore';

const { height } = Dimensions.get('window');
const HEADER_HEIGHT = 120; // Adjust this value based on your header height
const NOTICE_HEIGHT = -(NoticeHeight + 12);

const ProductDashboard = () => {
  const { user, setUser } = useAuthStore();
  const noticePosition = useRef(new RNAnimated.Value(NOTICE_HEIGHT)).current;
  const insets = useSafeAreaInsets();
  const { current } = useWeatherStore();
  const isRaining = current?.condition === 'rain';

  // Use React Native Animated for scroll tracking (simpler and more stable)
  const scrollY = useRef(new RNAnimated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const previousScroll = useRef<number>(0);
  const [refreshing, setRefreshing] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)

  // Simple scroll handler
  const handleScroll = RNAnimated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        updateBackToTop(offsetY);
      },
    }
  );

  // For header animation using React Native Animated
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [HEADER_HEIGHT, 0],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Simple back to top button animation without worklets
  const [showBackToTop, setShowBackToTop] = useState(false);
  const backToTopOpacity = useRef(new RNAnimated.Value(0)).current;
  const backToTopTranslateY = useRef(new RNAnimated.Value(10)).current;

  // Update back to top visibility based on scroll
  const updateBackToTop = (scrollValue: number) => {
    const isScrollingUp = scrollValue < previousScroll.current && scrollValue > 180;
    const shouldShow = isScrollingUp;

    if (shouldShow !== showBackToTop) {
      setShowBackToTop(shouldShow);
      RNAnimated.timing(backToTopOpacity, {
        toValue: shouldShow ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      RNAnimated.timing(backToTopTranslateY, {
        toValue: shouldShow ? 0 : 10,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    previousScroll.current = scrollValue;
  };

  const slideUp = () => {
    RNAnimated.timing(noticePosition, {
      toValue: NOTICE_HEIGHT,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  };

  const slideDown = () => {
    RNAnimated.timing(noticePosition, {
      toValue: 0,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    scrollY.setValue(0);
    setShowBackToTop(false);
  };

  useEffect(() => {
    if (isRaining) {
      slideDown();
      const timeoutId = setTimeout(() => {
        slideUp();
      }, 3500);

      return () => clearTimeout(timeoutId);
    }

    const initializeNotifications = async () => {
      await NotificationManager.initialize();
    };

    initializeNotifications();
  }, [isRaining]);

  if (__DEV__) {
    console.log("🚨 Rendering ProductDashboard");
  }

  return (
    <NoticeAnimation noticePosition={noticePosition} enabled={isRaining}>
      <>
        <Visuals />

        {/* Header Container - now flows with content, gets pushed by notice */}
        <View style={[styles.headerContainer, { paddingTop: insets.top || 20 }]}>
          <AnimatedHeader
            showNotice={() => {
              slideDown();
              const timeoutId = setTimeout(() => {
                slideUp();
              }, 3500);
              return () => clearTimeout(timeoutId);
            }}
          />
          <StickySearchBar scrollY={scrollY} noticePosition={noticePosition} />
        </View>

        <RNAnimated.ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true)
                setRefreshToken((t) => t + 1)
              }}
            />
          }
          onScroll={RNAnimated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            {
              useNativeDriver: false,
              listener: (event: any) => {
                const scrollValue = event.nativeEvent.contentOffset.y;
                updateBackToTop(scrollValue);
              },
            }
          )}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}>
          <Content
            refreshToken={refreshToken}
            bypassCache={refreshing}
            onLoaded={() => {
              if (refreshing) setRefreshing(false)
            }}
          />

          <View style={{ backgroundColor: '#f8f8f8', padding: 20 }}>
            <CustomText
              variant="h8"
              fontFamily={Fonts.SemiBold}
              style={{ opacity: 0.7 }}>
              Meat You Fresh Everytime 🍗
            </CustomText>
            <CustomText
              variant="h9"
              style={{ marginTop: 10, opacity: 0.5 }}
              fontFamily={Fonts.Medium}>
              Developed by Argon Technologies ❤️
            </CustomText>
          </View>
        </RNAnimated.ScrollView>
      </>
    </NoticeAnimation>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    // Removed absolute positioning - now flows with content and gets pushed by notice
    backgroundColor: 'transparent',
    zIndex: 1000, // Keep high z-index for search bar stickiness
  },
  scrollContent: {
    paddingTop: 20, // Reduced since header is no longer absolute
  },
  backToTopButton: {
    position: 'absolute',
    alignSelf: 'center',
    top: Platform.OS === 'ios' ? screenHeight * 0.18 : 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'black',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 999,
  },
});

// Debug: Log HOC wrapping
if (__DEV__) {
  console.log("🚨 Wrapping ProductDashboard with HOCs");
}

export default withLiveStatus(withCart(ProductDashboard));
