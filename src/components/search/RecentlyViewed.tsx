import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Fonts, shadowPresets } from '@utils/Constants';
import { spacing } from '@utils/Spacing';
import CustomText from '@components/ui/CustomText';
import FadeInView from '@components/ui/FadeInView';
import ScalePress from '@components/ui/ScalePress';
import SearchHistoryManager, { RecentlyViewedItem } from '@utils/SearchHistoryManager';

interface RecentlyViewedProps {
  onProductPress: (product: RecentlyViewedItem) => void;
  onClearAll?: () => void;
  maxItems?: number;
  horizontal?: boolean;
  showHeader?: boolean;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  onProductPress,
  onClearAll,
  maxItems = 10,
  horizontal = true,
  showHeader = true,
}) => {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentlyViewed();
  }, []);

  const loadRecentlyViewed = async () => {
    try {
      const items = await SearchHistoryManager.getRecentlyViewed();
      setRecentlyViewed(items.slice(0, maxItems));
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    try {
      await SearchHistoryManager.clearRecentlyViewed();
      setRecentlyViewed([]);
      onClearAll?.();
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await SearchHistoryManager.removeRecentlyViewed(id);
      setRecentlyViewed(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '';
    return `₹${price.toFixed(0)}`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const renderProduct = ({ item, index }: { item: RecentlyViewedItem; index: number }) => (
    <FadeInView delay={index * 100} fadeFrom="bottom">
      <ScalePress onPress={() => onProductPress(item)}>
        <View style={[styles.productCard, horizontal ? styles.horizontalCard : null]}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveItem(item.id)}
            >
              <Icon name="close-circle" size={16} color={Colors.error} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.productInfo}>
            <CustomText
              variant="h7"
              fontFamily={Fonts.Medium}
              style={styles.productName}
              numberOfLines={2}
            >
              {item.name}
            </CustomText>
            
            {item.price ? (
              <CustomText variant="h6" fontFamily={Fonts.SemiBold} style={styles.price}>
                {formatPrice(item.price)}
              </CustomText>
            ) : null}
            
            {item.category ? (
              <CustomText variant="h8" style={styles.category}>
                {item.category}
              </CustomText>
            ) : null}
            
            <CustomText variant="h9" style={styles.timeAgo}>
              {formatTimeAgo(item.timestamp)}
            </CustomText>
          </View>
        </View>
      </ScalePress>
    </FadeInView>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="time-outline" size={48} color={Colors.text_light} />
      <CustomText variant="h5" style={styles.emptyTitle}>
        No Recent Views
      </CustomText>
      <CustomText variant="h7" style={styles.emptySubtitle}>
        Products you view will appear here
      </CustomText>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <CustomText variant="h6" style={styles.loadingText}>
          Loading...
        </CustomText>
      </View>
    );
  }

  if (recentlyViewed.length === 0) {
    return renderEmptyState();
  }

  return (
    <View style={styles.container}>
      {showHeader ? (
        <View style={styles.header}>
          <CustomText variant="h5" fontFamily={Fonts.SemiBold} style={styles.title}>
            Recently Viewed
          </CustomText>
          <TouchableOpacity onPress={handleClearAll}>
            <CustomText variant="h7" style={styles.clearText}>
              Clear All
            </CustomText>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={recentlyViewed}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          !horizontal ? styles.verticalList : null,
        ]}
        ItemSeparatorComponent={() => (
          <View style={horizontal ? styles.horizontalSeparator : styles.verticalSeparator} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    color: Colors.text_dark,
  },
  clearText: {
    color: Colors.secondary,
  },
  listContainer: {
    paddingHorizontal: spacing.md,
  },
  verticalList: {
    paddingHorizontal: 0,
  },
  productCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.sm,
    width: 140,
    ...shadowPresets.small,
  },
  horizontalCard: {
    width: 140,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  productImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    color: Colors.text,
    marginBottom: spacing.xs,
    lineHeight: 16,
  },
  price: {
    color: Colors.secondary,
    marginBottom: spacing.xs,
  },
  category: {
    color: Colors.text_light,
    marginBottom: spacing.xs,
  },
  timeAgo: {
    color: Colors.text_light,
  },
  horizontalSeparator: {
    width: spacing.sm,
  },
  verticalSeparator: {
    height: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    color: Colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    color: Colors.text_light,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  loadingText: {
    color: Colors.text_light,
  },
});

export default RecentlyViewed;
