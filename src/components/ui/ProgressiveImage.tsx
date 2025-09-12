import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  Animated,
  StyleSheet,
  ImageStyle,
  ViewStyle,
} from 'react-native';
import { Colors } from '@utils/Constants';
import LoadingAnimation from './LoadingAnimation';

interface ProgressiveImageProps {
  source: { uri: string } | number;
  style?: ImageStyle | ViewStyle;
  thumbnailSource?: { uri: string };
  blurRadius?: number;
  fadeDuration?: number;
  showLoading?: boolean;
  loadingSize?: 'small' | 'medium' | 'large';
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  borderRadius?: number;
}

const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  source,
  style,
  thumbnailSource,
  blurRadius = 1,
  fadeDuration = 300,
  showLoading = true,
  loadingSize = 'small',
  onLoadStart,
  onLoadEnd,
  onError,
  resizeMode = 'cover',
  borderRadius = 0,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const imageOpacity = useRef(new Animated.Value(0)).current;
  const thumbnailOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (imageLoaded) {
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: fadeDuration,
        useNativeDriver: true,
      }).start();
    }
  }, [imageLoaded, imageOpacity, fadeDuration]);

  useEffect(() => {
    if (thumbnailLoaded && !imageLoaded) {
      Animated.timing(thumbnailOpacity, {
        toValue: 1,
        duration: fadeDuration / 2,
        useNativeDriver: true,
      }).start();
    }
  }, [thumbnailLoaded, imageLoaded, thumbnailOpacity, fadeDuration]);

  const handleImageLoadStart = () => {
    setIsLoading(true);
    onLoadStart?.();
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setIsLoading(false);
    onLoadEnd?.();
  };

  const handleImageError = (error: any) => {
    setHasError(true);
    setIsLoading(false);
    onError?.(error);
  };

  const handleThumbnailLoad = () => {
    setThumbnailLoaded(true);
  };

  const getImageSource = () => {
    if (typeof source === 'number') {
      return source;
    }
    return source;
  };

  const getThumbnailSource = () => {
    if (thumbnailSource) {
      return thumbnailSource;
    }
    
    // Generate a low-quality version of the image URL if possible
    if (typeof source === 'object' && source.uri) {
      // This is a simple example - in a real app, you might have a service
      // that generates thumbnail URLs or use a CDN with resize parameters
      const uri = source.uri;
      if (uri.includes('?')) {
        return { uri: `${uri}&w=50&q=10` };
      } else {
        return { uri: `${uri}?w=50&q=10` };
      }
    }
    
    return null;
  };

  const renderPlaceholder = () => (
    <View style={[styles.placeholder, style, { borderRadius }]}>
      {showLoading && isLoading && (
        <LoadingAnimation size={loadingSize} color={Colors.text_light} />
      )}
    </View>
  );

  const renderErrorState = () => (
    <View style={[styles.errorState, style, { borderRadius }]}>
      <View style={styles.errorIcon}>
        <View style={styles.errorIconInner} />
      </View>
    </View>
  );

  if (hasError) {
    return renderErrorState();
  }

  const thumbnailSrc = getThumbnailSource();

  return (
    <View style={[styles.container, style]}>
      {/* Placeholder */}
      {!thumbnailLoaded && !imageLoaded && renderPlaceholder()}

      {/* Thumbnail */}
      {thumbnailSrc && (
        <Animated.Image
          source={thumbnailSrc}
          style={[
            styles.image,
            style,
            {
              opacity: thumbnailOpacity,
              borderRadius,
            },
          ]}
          onLoad={handleThumbnailLoad}
          blurRadius={blurRadius}
          resizeMode={resizeMode}
        />
      )}

      {/* Main Image */}
      <Animated.Image
        source={getImageSource()}
        style={[
          styles.image,
          style,
          {
            opacity: imageOpacity,
            borderRadius,
          },
        ]}
        onLoadStart={handleImageLoadStart}
        onLoad={handleImageLoad}
        onError={handleImageError}
        resizeMode={resizeMode}
      />

      {/* Loading overlay */}
      {showLoading && isLoading && !thumbnailLoaded && (
        <View style={[styles.loadingOverlay, { borderRadius }]}>
          <LoadingAnimation size={loadingSize} color={Colors.text_light} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundSecondary,
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorState: {
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  errorIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconInner: {
    width: 2,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
});

export default ProgressiveImage;
