import {View, StyleSheet, Image, ScrollView, TouchableOpacity, Animated} from 'react-native';
import React, {FC, useRef, useEffect, useState} from 'react';
import {screenWidth} from '@utils/Scaling';
import ScalePress from '@components/ui/ScalePress';
import CustomText from '@components/ui/CustomText';

const AdCarousal: FC<{adData: any}> = ({adData}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const currentIndex = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const carouselWidth = screenWidth - 40; // Content has paddingHorizontal:20 → total 40
  const carouselHeight = carouselWidth * 0.6; // Increased from 0.4 to 0.6 for bigger banner (3:5 aspect ratio)

  // Auto-scroll functionality
  useEffect(() => {
    if (!adData || adData.length <= 1) return;

    const interval = setInterval(() => {
      try {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          currentIndex.current = (currentIndex.current + 1) % adData.length;
          setActiveIndex(currentIndex.current);

          scrollViewRef.current?.scrollTo({
            x: currentIndex.current * carouselWidth,
            animated: false,
          });

          slideAnim.setValue(50);

          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        });
      } catch (e) {
        console.error('Carousel interval crash', e);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [adData, carouselWidth, fadeAnim, slideAnim]);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / carouselWidth);
    if (index >= 0 && index < adData.length && index !== currentIndex.current) {
      currentIndex.current = index;
      setActiveIndex(index);
    }
  };

  const goToSlide = (index: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      currentIndex.current = index;
      setActiveIndex(index);

      scrollViewRef.current?.scrollTo({
        x: index * carouselWidth,
        animated: false,
      });

      slideAnim.setValue(50);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const goToPrev = () => {
    const newIndex = (currentIndex.current - 1 + adData.length) % adData.length;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex.current + 1) % adData.length;
    goToSlide(newIndex);
  };

  if (!adData || adData.length === 0) {
    return null;
  }

  return (
    <View style={styles.carouselContainer}>
      {/* Previous button */}
      {adData.length > 1 ? (
        <TouchableOpacity
          style={[styles.navButton, styles.prevButton]}
          onPress={goToPrev}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <CustomText style={styles.navButtonText}>{'\u2039'}</CustomText>
        </TouchableOpacity>
      ) : null}

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="fast"
        style={{width: carouselWidth, height: carouselHeight}}
        onScroll={handleScroll}
      >
        {adData.map((item: any, index: number) => (
          <ScalePress
            key={index}
            style={{
              ...styles.imageContainer,
              width: carouselWidth,
              height: carouselHeight,
            }}
          >
            <Animated.View
              style={[
                styles.slideContainer,
                {
                  opacity: fadeAnim,
                  transform: [{translateX: slideAnim}],
                },
              ]}
            >
              <Image source={item} style={styles.img} resizeMode="cover" />
            </Animated.View>
          </ScalePress>
        ))}
      </ScrollView>

      {/* Next button */}
      {adData.length > 1 ? (
        <TouchableOpacity
          style={[styles.navButton, styles.nextButton]}
          onPress={goToNext}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <CustomText style={styles.navButtonText}>{'\u203A'}</CustomText>
        </TouchableOpacity>
      ) : null}

      {/* Pagination strip */}
      {adData.length > 1 ? (
        <View style={styles.paginationStrip}>
          <View style={styles.paginationContainer}>
            <View style={styles.dotsContainer}>
              {adData.map((_: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => goToSlide(index)}
                  style={[
                    styles.dot,
                    index === activeIndex ? styles.activeDot : null,
                  ]}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                  activeOpacity={0.7}
                />
              ))}
            </View>
            <CustomText style={styles.slideCounter}>
              {`${activeIndex + 1}/${adData?.length || 0}`}
            </CustomText>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    // Tighten vertical gap below the search bar while keeping a small buffer.
    marginTop: 8,
    marginBottom: 12, // Increased from 8 to 12 for better spacing below
    marginHorizontal: 0,
    borderRadius: 16,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'visible',
    position: 'relative',
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  slideContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  navButton: {
    position: 'absolute',
    top: '40%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  prevButton: {
    left: 8,
  },
  nextButton: {
    right: 8,
  },
  navButtonText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
    marginTop: -2,
  },
  paginationStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 38,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 12,
    height: 8,
    borderRadius: 4,
  },
  slideCounter: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
});

export default AdCarousal;
