import React, { FC, useState, useRef, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Image,
    Dimensions,
    TouchableOpacity,
    FlatList,
    Modal,
    StatusBar,
    Animated,
    PanResponder,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '@utils/Constants';
import { RFValue } from 'react-native-responsive-fontsize';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.85;
const THUMBNAIL_SIZE = 60;

interface ImageGalleryProps {
    images: string[];
    showThumbnails?: boolean;
}

const ImageGallery: FC<ImageGalleryProps> = ({ images, showThumbnails = true }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    // Ensure we have at least one image
    const imageList = images.length > 0 ? images : ['https://via.placeholder.com/400'];

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index || 0);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const scrollToIndex = useCallback((index: number) => {
        flatListRef.current?.scrollToIndex({ index, animated: true });
        setActiveIndex(index);
    }, []);

    const handleThumbnailPress = (index: number) => {
        scrollToIndex(index);
    };

    const openFullscreen = () => {
        setIsFullscreen(true);
    };

    const closeFullscreen = () => {
        setIsFullscreen(false);
        // Reset transforms
        scale.setValue(1);
        translateX.setValue(0);
        translateY.setValue(0);
    };

    // Pan responder for zoom/drag in fullscreen
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                translateX.setValue(gestureState.dx);
                translateY.setValue(gestureState.dy);
            },
            onPanResponderRelease: () => {
                // Spring back to center
                Animated.parallel([
                    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
                    Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
                ]).start();
            },
        })
    ).current;

    const renderImage = ({ item, index }: { item: string; index: number }) => (
        <TouchableOpacity
            activeOpacity={0.95}
            onPress={openFullscreen}
            style={styles.imageContainer}
        >
            <Image
                source={{ uri: item }}
                style={styles.mainImage}
                resizeMode="contain"
            />
        </TouchableOpacity>
    );

    const renderThumbnail = ({ item, index }: { item: string; index: number }) => (
        <TouchableOpacity
            onPress={() => handleThumbnailPress(index)}
            style={[
                styles.thumbnailContainer,
                activeIndex === index && styles.thumbnailActive,
            ]}
        >
            <Image
                source={{ uri: item }}
                style={styles.thumbnail}
                resizeMode="cover"
            />
        </TouchableOpacity>
    );

    const renderPaginationDots = () => (
        <View style={styles.pagination}>
            {imageList.map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.paginationDot,
                        activeIndex === index && styles.paginationDotActive,
                    ]}
                />
            ))}
        </View>
    );

    const renderFullscreenImage = ({ item }: { item: string }) => (
        <Animated.View
            style={[
                styles.fullscreenImageContainer,
                {
                    transform: [
                        { translateX },
                        { translateY },
                        { scale },
                    ],
                },
            ]}
            {...panResponder.panHandlers}
        >
            <Image
                source={{ uri: item }}
                style={styles.fullscreenImage}
                resizeMode="contain"
            />
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            {/* Main Image Carousel */}
            <FlatList
                ref={flatListRef}
                data={imageList}
                renderItem={renderImage}
                keyExtractor={(_, index) => `image-${index}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
            />

            {/* Pagination Dots */}
            {imageList.length > 1 && renderPaginationDots()}

            {/* Thumbnail Strip */}
            {showThumbnails && imageList.length > 1 && (
                <View style={styles.thumbnailStrip}>
                    <FlatList
                        data={imageList}
                        renderItem={renderThumbnail}
                        keyExtractor={(_, index) => `thumb-${index}`}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.thumbnailList}
                    />
                </View>
            )}

            {/* Image Counter */}
            <View style={styles.imageCounter}>
                <Icon name="image-multiple" size={RFValue(12)} color="#fff" />
                <View style={styles.counterText}>
                    <Icon
                        name="numeric"
                        size={RFValue(10)}
                        color="#fff"
                        style={{ opacity: 0 }}
                    />
                    <View style={styles.counterBadge}>
                        <Icon
                            name="image"
                            size={RFValue(10)}
                            color="#fff"
                        />
                    </View>
                </View>
            </View>
            <View style={styles.imageCounterText}>
                <Icon name="image-outline" size={RFValue(14)} color="#fff" />
                <View style={styles.counterTextContainer}>
                    <Image
                        source={require('@assets/icons/search.png')}
                        style={[styles.counterIcon, { opacity: 0 }]}
                    />
                </View>
            </View>

            {/* Fullscreen Modal */}
            <Modal
                visible={isFullscreen}
                transparent
                animationType="fade"
                onRequestClose={closeFullscreen}
            >
                <StatusBar backgroundColor="#000" barStyle="light-content" />
                <View style={styles.fullscreenContainer}>
                    {/* Close Button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={closeFullscreen}
                    >
                        <Icon name="close" size={RFValue(24)} color="#fff" />
                    </TouchableOpacity>

                    {/* Fullscreen Image */}
                    <FlatList
                        data={imageList}
                        renderItem={renderFullscreenImage}
                        keyExtractor={(_, index) => `fullscreen-${index}`}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        initialScrollIndex={activeIndex}
                        getItemLayout={(_, index) => ({
                            length: SCREEN_WIDTH,
                            offset: SCREEN_WIDTH * index,
                            index,
                        })}
                    />

                    {/* Fullscreen Counter */}
                    <View style={styles.fullscreenCounter}>
                        <Icon name="image-outline" size={RFValue(14)} color="#fff" />
                        <View style={styles.fullscreenCounterText}>
                            <Icon
                                name={`numeric-${activeIndex + 1}`}
                                size={RFValue(14)}
                                color="#fff"
                            />
                            <Icon name="slash-forward" size={RFValue(12)} color="#aaa" />
                            <Icon
                                name={`numeric-${imageList.length}`}
                                size={RFValue(14)}
                                color="#fff"
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    imageContainer: {
        width: SCREEN_WIDTH,
        height: IMAGE_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    mainImage: {
        width: SCREEN_WIDTH - 40,
        height: IMAGE_HEIGHT - 20,
        borderRadius: 12,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 6,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.border,
    },
    paginationDotActive: {
        backgroundColor: Colors.secondary,
        width: 24,
    },
    thumbnailStrip: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    thumbnailList: {
        gap: 8,
    },
    thumbnailContainer: {
        width: THUMBNAIL_SIZE,
        height: THUMBNAIL_SIZE,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    thumbnailActive: {
        borderColor: Colors.secondary,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    imageCounter: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        display: 'none', // Hidden for now
    },
    counterText: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    counterBadge: {
        marginLeft: 2,
    },
    imageCounterText: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        display: 'none', // Hidden for now
    },
    counterTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    counterIcon: {
        width: 12,
        height: 12,
        tintColor: '#fff',
    },
    fullscreenContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    fullscreenImageContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.8,
    },
    fullscreenCounter: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    fullscreenCounterText: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default ImageGallery;
