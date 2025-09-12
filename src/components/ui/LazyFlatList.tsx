import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  ViewToken,
  FlatListProps,
  Dimensions,
} from 'react-native';
import { Colors } from '@utils/Constants';
import { spacing } from '@utils/Spacing';
import LoadingAnimation from './LoadingAnimation';
import CustomText from './CustomText';

const { height: screenHeight } = Dimensions.get('window');

interface LazyFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  loadMoreData?: () => Promise<void>;
  refreshData?: () => Promise<void>;
  isLoading?: boolean;
  isRefreshing?: boolean;
  hasMoreData?: boolean;
  loadingThreshold?: number;
  itemHeight?: number;
  enableVirtualization?: boolean;
  enableLazyLoading?: boolean;
  preloadOffset?: number;
  emptyStateComponent?: React.ReactElement;
  errorStateComponent?: React.ReactElement;
  hasError?: boolean;
}

function LazyFlatList<T>({
  data,
  renderItem,
  loadMoreData,
  refreshData,
  isLoading = false,
  isRefreshing = false,
  hasMoreData = true,
  loadingThreshold = 0.7,
  itemHeight,
  enableVirtualization = true,
  enableLazyLoading = true,
  preloadOffset = 5,
  emptyStateComponent,
  errorStateComponent,
  hasError = false,
  ...flatListProps
}: LazyFlatListProps<T>) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [loadingMore, setLoadingMore] = useState(false);
  const flatListRef = useRef<FlatList<T>>(null);

  // Calculate optimal rendering window
  const windowSize = useMemo(() => {
    if (!itemHeight) return 10; // Default window size
    const itemsPerScreen = Math.ceil(screenHeight / itemHeight);
    return Math.max(itemsPerScreen * 2, 10); // At least 2 screens worth
  }, [itemHeight]);

  const getItemLayout = useCallback(
    (data: T[] | null | undefined, index: number) => {
      if (!itemHeight) return { length: 0, offset: 0, index };
      return {
        length: itemHeight,
        offset: itemHeight * index,
        index,
      };
    },
    [itemHeight]
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!enableLazyLoading) return;

      const newVisibleItems = new Set<number>();
      viewableItems.forEach((item) => {
        if (item.index !== null) {
          // Add current item and preload offset items
          for (let i = Math.max(0, item.index - preloadOffset); 
               i <= Math.min(data.length - 1, item.index + preloadOffset); 
               i++) {
            newVisibleItems.add(i);
          }
        }
      });
      setVisibleItems(newVisibleItems);
    },
    [enableLazyLoading, preloadOffset, data.length]
  );

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 10,
      minimumViewTime: 100,
    }),
    []
  );

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMoreData || !loadMoreData) return;

    setLoadingMore(true);
    try {
      await loadMoreData();
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMoreData, loadMoreData]);

  const handleRefresh = useCallback(async () => {
    if (!refreshData) return;
    
    try {
      await refreshData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [refreshData]);

  const onEndReached = useCallback(() => {
    handleLoadMore();
  }, [handleLoadMore]);

  const renderLazyItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      if (enableLazyLoading && !visibleItems.has(index)) {
        // Render placeholder for non-visible items
        return (
          <View
            style={[
              styles.placeholder,
              itemHeight ? { height: itemHeight } : null,
            ]}
          />
        );
      }

      return renderItem({ item, index });
    },
    [renderItem, enableLazyLoading, visibleItems, itemHeight]
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore && !isLoading) return null;

    return (
      <View style={styles.footer}>
        <LoadingAnimation size="small" color={Colors.secondary} />
        <CustomText variant="h7" style={styles.loadingText}>
          Loading more...
        </CustomText>
      </View>
    );
  }, [loadingMore, isLoading]);

  const renderEmpty = useCallback(() => {
    if (isLoading || isRefreshing) {
      return (
        <View style={styles.emptyContainer}>
          <LoadingAnimation size="medium" color={Colors.secondary} />
          <CustomText variant="h6" style={styles.emptyText}>
            Loading...
          </CustomText>
        </View>
      );
    }

    if (hasError && errorStateComponent) {
      return errorStateComponent;
    }

    if (emptyStateComponent) {
      return emptyStateComponent;
    }

    return (
      <View style={styles.emptyContainer}>
        <CustomText variant="h5" style={styles.emptyTitle}>
          No items found
        </CustomText>
        <CustomText variant="h7" style={styles.emptySubtitle}>
          Try refreshing or check back later
        </CustomText>
      </View>
    );
  }, [isLoading, isRefreshing, hasError, errorStateComponent, emptyStateComponent]);

  const keyExtractor = useCallback(
    (item: T, index: number) => {
      // Try to use item's id if available, otherwise use index
      if (typeof item === 'object' && item !== null && 'id' in item) {
        return String((item as any).id);
      }
      if (typeof item === 'object' && item !== null && '_id' in item) {
        return String((item as any)._id);
      }
      return String(index);
    },
    []
  );

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={renderLazyItem}
      keyExtractor={keyExtractor}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      onEndReached={onEndReached}
      onEndReachedThreshold={loadingThreshold}
      onRefresh={refreshData ? handleRefresh : undefined}
      refreshing={isRefreshing}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      getItemLayout={itemHeight ? getItemLayout : undefined}
      removeClippedSubviews={enableVirtualization}
      maxToRenderPerBatch={windowSize}
      windowSize={windowSize}
      initialNumToRender={Math.min(windowSize, 10)}
      updateCellsBatchingPeriod={50}
      disableVirtualization={!enableVirtualization}
      {...flatListProps}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: Colors.backgroundSecondary,
    marginVertical: spacing.xs,
    borderRadius: 8,
    minHeight: 60,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  loadingText: {
    marginLeft: spacing.sm,
    color: Colors.text_light,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    color: Colors.text_light,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: spacing.md,
    color: Colors.text_light,
  },
});

export default LazyFlatList;
