import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const CACHE_KEY_PREFIX = 'image_cache_';
const CACHE_METADATA_KEY = 'image_cache_metadata';
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheMetadata {
  [key: string]: {
    size: number;
    timestamp: number;
    lastAccessed: number;
    url: string;
  };
}

interface CacheStats {
  totalSize: number;
  totalItems: number;
  oldestItem: number;
  newestItem: number;
}

class ImageCacheManager {
  private metadata: CacheMetadata = {};
  private lastCleanup: number = 0;

  constructor() {
    this.loadMetadata();
    this.scheduleCleanup();
  }

  private async loadMetadata(): Promise<void> {
    try {
      const metadataStr = await AsyncStorage.getItem(CACHE_METADATA_KEY);
      if (metadataStr) {
        this.metadata = JSON.parse(metadataStr);
      }
    } catch (error) {
      console.error('Error loading cache metadata:', error);
      this.metadata = {};
    }
  }

  private async saveMetadata(): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(this.metadata));
    } catch (error) {
      console.error('Error saving cache metadata:', error);
    }
  }

  private generateCacheKey(url: string): string {
    // Simple hash function for URL
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `${CACHE_KEY_PREFIX}${Math.abs(hash)}`;
  }

  private async getCurrentCacheSize(): Promise<number> {
    return Object.values(this.metadata).reduce((total, item) => total + item.size, 0);
  }

  private async cleanupExpiredItems(): Promise<void> {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of Object.entries(this.metadata)) {
      if (now - item.timestamp > MAX_CACHE_AGE) {
        expiredKeys.push(key);
      }
    }

    await this.removeItems(expiredKeys);
  }

  private async cleanupLRUItems(targetSize: number): Promise<void> {
    const currentSize = await getCurrentCacheSize();
    if (currentSize <= targetSize) return;

    // Sort by last accessed time (LRU)
    const sortedItems = Object.entries(this.metadata)
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    let sizeToRemove = currentSize - targetSize;
    const keysToRemove: string[] = [];

    for (const [key, item] of sortedItems) {
      if (sizeToRemove <= 0) break;
      keysToRemove.push(key);
      sizeToRemove -= item.size;
    }

    await this.removeItems(keysToRemove);
  }

  private async removeItems(keys: string[]): Promise<void> {
    try {
      const removePromises = keys.map(async (key) => {
        await AsyncStorage.removeItem(key);
        delete this.metadata[key];
      });

      await Promise.all(removePromises);
      await this.saveMetadata();
    } catch (error) {
      console.error('Error removing cache items:', error);
    }
  }

  private scheduleCleanup(): void {
    const now = Date.now();
    if (now - this.lastCleanup > CLEANUP_INTERVAL) {
      this.performCleanup();
      this.lastCleanup = now;
    }

    // Schedule next cleanup
    setTimeout(() => {
      this.scheduleCleanup();
    }, CLEANUP_INTERVAL);
  }

  private async performCleanup(): Promise<void> {
    try {
      await this.cleanupExpiredItems();
      await this.cleanupLRUItems(MAX_CACHE_SIZE * 0.8); // Keep cache at 80% of max size
    } catch (error) {
      console.error('Error during cache cleanup:', error);
    }
  }

  async cacheImage(url: string, base64Data: string): Promise<boolean> {
    try {
      const cacheKey = this.generateCacheKey(url);
      const dataSize = base64Data.length;

      // Check if we need to make space
      const currentSize = await this.getCurrentCacheSize();
      if (currentSize + dataSize > MAX_CACHE_SIZE) {
        await this.cleanupLRUItems(MAX_CACHE_SIZE - dataSize);
      }

      // Store the image data
      await AsyncStorage.setItem(cacheKey, base64Data);

      // Update metadata
      this.metadata[cacheKey] = {
        size: dataSize,
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        url: url,
      };

      await this.saveMetadata();
      return true;
    } catch (error) {
      console.error('Error caching image:', error);
      return false;
    }
  }

  async getCachedImage(url: string): Promise<string | null> {
    try {
      const cacheKey = this.generateCacheKey(url);
      const cachedData = await AsyncStorage.getItem(cacheKey);

      if (cachedData && this.metadata[cacheKey]) {
        // Update last accessed time
        this.metadata[cacheKey].lastAccessed = Date.now();
        await this.saveMetadata();
        return cachedData;
      }

      return null;
    } catch (error) {
      console.error('Error getting cached image:', error);
      return null;
    }
  }

  async isCached(url: string): Promise<boolean> {
    const cacheKey = this.generateCacheKey(url);
    return !!this.metadata[cacheKey];
  }

  async removeCachedImage(url: string): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(url);
      await AsyncStorage.removeItem(cacheKey);
      delete this.metadata[cacheKey];
      await this.saveMetadata();
    } catch (error) {
      console.error('Error removing cached image:', error);
    }
  }

  async clearCache(): Promise<void> {
    try {
      const keys = Object.keys(this.metadata);
      await this.removeItems(keys);
      this.metadata = {};
      await AsyncStorage.removeItem(CACHE_METADATA_KEY);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async getCacheStats(): Promise<CacheStats> {
    const items = Object.values(this.metadata);
    const totalSize = items.reduce((sum, item) => sum + item.size, 0);
    const timestamps = items.map(item => item.timestamp);

    return {
      totalSize,
      totalItems: items.length,
      oldestItem: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestItem: timestamps.length > 0 ? Math.max(...timestamps) : 0,
    };
  }

  async preloadImages(urls: string[]): Promise<void> {
    const preloadPromises = urls.map(async (url) => {
      if (await this.isCached(url)) {
        return; // Already cached
      }

      try {
        // In a real implementation, you would fetch the image and convert to base64
        // For now, we'll just mark it as a placeholder
        console.log(`Preloading image: ${url}`);
      } catch (error) {
        console.error(`Error preloading image ${url}:`, error);
      }
    });

    await Promise.all(preloadPromises);
  }

  formatCacheSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new ImageCacheManager();
