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
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NoticeHeight, screenHeight } from '@utils/Scaling';
import Geolocation from '@react-native-community/geolocation';
import { reverseGeocode } from '@service/mapService';
import { useAuthStore } from '@state/authStore';
import NoticeAnimation from './NoticeAnimation';
import Visuals from './Visuals';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomText from '@components/ui/CustomText';
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
import { fetchWishlist } from '@service/wishlistService';
import { useWishlistStore } from '@state/wishlistStore';

const { height } = Dimensions.get('window');
const HEADER_HEIGHT = 120; // Adjust this value based on your header height
const SEARCH_BAR_HEIGHT = 54; // 48 input + padding
const NOTICE_HEIGHT = -(NoticeHeight + 12);

const ProductDashboard = () => {
  const { user, setUser } = useAuthStore();
  const noticePosition = useRef(new RNAnimated.Value(NOTICE_HEIGHT)).current;
  const insets = useSafeAreaInsets();
  const { current } = useWeatherStore();
  const isRaining = current?.condition === 'rain';
  const setWishlistItems = useWishlistStore((s) => s.setItems);
  const wishlistHydrated = useWishlistStore((s) => s.hydrated);
  const setWishlistHydrated = useWishlistStore((s) => s.setHydrated);

  // Use React Native Animated for scroll tracking (simpler and more stable)
  const scrollY = useRef(new RNAnimated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const previousScroll = useRef<number>(0);
  const [refreshing, setRefreshing] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)
  const isAtTopRef = useRef(true)
  const refreshEnabledRef = useRef(true)
  const [refreshEnabled, setRefreshEnabled] = useState(true)

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

  // For header animation using React Native Animated (avoid height animations for smoothness)
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
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
    const delta = scrollValue - previousScroll.current
    const isScrollingUp = delta < -8
    const isScrollingDown = delta > 8
    const shouldShow = scrollValue > 320 && isScrollingUp

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

  const handleHomeLoaded = useCallback(() => {
    // Keep stable function reference so Content doesn't refetch on every render.
    setRefreshing((prev) => (prev ? false : prev))
  }, [])

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

  useEffect(() => {
    if (wishlistHydrated) return;
    let mounted = true;
    fetchWishlist()
      .then((items) => {
        if (!mounted) return;
        setWishlistItems(items);
        setWishlistHydrated(true);
      })
      .catch(() => {
        if (!mounted) return;
        setWishlistHydrated(true);
      });
    return () => {
      mounted = false;
    };
  }, [wishlistHydrated, setWishlistHydrated, setWishlistItems]);

  if (__DEV__) {
    console.log("🚨 Rendering ProductDashboard");
  }

  const headerSpacer = (insets.top || 20) + HEADER_HEIGHT + SEARCH_BAR_HEIGHT

  return (
    <NoticeAnimation noticePosition={noticePosition} enabled={isRaining}>
      <>
        <Visuals />

        {/* Header Container - absolute so scroll content never relayouts (reduces jitter) */}
        <View style={[styles.headerContainer, { paddingTop: insets.top || 20 }]}>
          <RNAnimated.View
            style={{
              height: HEADER_HEIGHT,
              opacity: headerOpacity,
              overflow: 'hidden',
              transform: [{ translateY: headerTranslateY }],
            }}
          >
            <AnimatedHeader
              showNotice={() => {
                slideDown();
                const timeoutId = setTimeout(() => {
                  slideUp();
                }, 3500);
                return () => clearTimeout(timeoutId);
              }}
            />
          </RNAnimated.View>

          <StickySearchBar scrollY={scrollY} noticePosition={noticePosition} headerHeight={HEADER_HEIGHT} />
        </View>

        <RNAnimated.ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              enabled={refreshEnabled}
              refreshing={refreshing}
              onRefresh={async () => {
                if (!refreshEnabledRef.current) return
                setRefreshing(true)
                setRefreshToken((t) => t + 1)
              }}
            />
          }
          onScrollBeginDrag={() => {
            // Only allow pull-to-refresh if the drag started at the top.
            const enable = isAtTopRef.current
            refreshEnabledRef.current = enable
            setRefreshEnabled(enable)
          }}
          onScrollEndDrag={() => {
            // Disable immediately after the gesture so flings to top don't trigger refresh.
            refreshEnabledRef.current = false
            setRefreshEnabled(false)
          }}
          onMomentumScrollBegin={() => {
            // Momentum should never trigger refresh.
            refreshEnabledRef.current = false
            setRefreshEnabled(false)
          }}
          onScroll={RNAnimated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            {
              useNativeDriver: true,
              listener: (event: any) => {
                const scrollValue = event.nativeEvent.contentOffset.y;
                const nowAtTop = scrollValue <= 0.5
                if (nowAtTop !== isAtTopRef.current) {
                  isAtTopRef.current = nowAtTop
                }
                updateBackToTop(scrollValue);
              },
            }
          )}
          scrollEventThrottle={16}
          contentContainerStyle={[styles.scrollContent, { paddingTop: headerSpacer }]}>
          <Content
            refreshToken={refreshToken}
            bypassCache={refreshing}
            onLoaded={handleHomeLoaded}
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

        {showBackToTop ? (
          <RNAnimated.View
            pointerEvents="box-none"
            style={[
              styles.backToTopButton,
              {
                opacity: backToTopOpacity,
                transform: [{ translateY: backToTopTranslateY }],
              },
            ]}
          >
            <TouchableOpacity onPress={scrollToTop} activeOpacity={0.8}>
              <View style={styles.backToTopInner}>
                <CustomText style={styles.backToTopText}>Back to top</CustomText>
                <Icon name="arrow-up" color="#fff" size={RFValue(12)} />
              </View>
            </TouchableOpacity>
          </RNAnimated.View>
        ) : null}
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
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  scrollContent: {
    paddingTop: 20,
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
  backToTopInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backToTopText: {
    color: '#fff',
    fontSize: RFValue(10),
  },
});

// Debug: Log HOC wrapping
if (__DEV__) {
  console.log("🚨 Wrapping ProductDashboard with HOCs");
}

export default withLiveStatus(withCart(ProductDashboard));
