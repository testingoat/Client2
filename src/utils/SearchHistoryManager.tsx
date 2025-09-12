import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = 'search_history';
const RECENTLY_VIEWED_KEY = 'recently_viewed';
const MAX_SEARCH_HISTORY = 10;
const MAX_RECENTLY_VIEWED = 20;

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  category?: string;
}

export interface RecentlyViewedItem {
  id: string;
  name: string;
  image: string;
  price?: number;
  category?: string;
  timestamp: number;
}

class SearchHistoryManager {
  // Search History Methods
  async getSearchHistory(): Promise<SearchHistoryItem[]> {
    try {
      const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  async addSearchQuery(query: string, category?: string): Promise<void> {
    try {
      if (!query.trim()) return;

      const history = await this.getSearchHistory();
      const newItem: SearchHistoryItem = {
        id: Date.now().toString(),
        query: query.trim(),
        timestamp: Date.now(),
        category,
      };

      // Remove duplicate queries
      const filteredHistory = history.filter(
        item => item.query.toLowerCase() !== query.toLowerCase()
      );

      // Add new item to the beginning
      const updatedHistory = [newItem, ...filteredHistory].slice(0, MAX_SEARCH_HISTORY);

      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error adding search query:', error);
    }
  }

  async removeSearchQuery(id: string): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error removing search query:', error);
    }
  }

  async clearSearchHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const history = await this.getSearchHistory();
      const suggestions = history
        .filter(item => 
          item.query.toLowerCase().includes(query.toLowerCase()) && 
          item.query.toLowerCase() !== query.toLowerCase()
        )
        .map(item => item.query)
        .slice(0, 5);

      // Add some common suggestions based on query
      const commonSuggestions = this.getCommonSuggestions(query);
      
      return [...new Set([...suggestions, ...commonSuggestions])].slice(0, 8);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  private getCommonSuggestions(query: string): string[] {
    const commonQueries = [
      'milk', 'bread', 'eggs', 'rice', 'dal', 'oil', 'sugar', 'tea', 'coffee',
      'vegetables', 'fruits', 'chicken', 'fish', 'mutton', 'paneer', 'yogurt',
      'biscuits', 'chips', 'chocolate', 'ice cream', 'soft drinks', 'water',
      'soap', 'shampoo', 'toothpaste', 'detergent', 'cleaning supplies'
    ];

    return commonQueries
      .filter(item => 
        item.toLowerCase().includes(query.toLowerCase()) && 
        item.toLowerCase() !== query.toLowerCase()
      )
      .slice(0, 3);
  }

  // Recently Viewed Methods
  async getRecentlyViewed(): Promise<RecentlyViewedItem[]> {
    try {
      const items = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error('Error getting recently viewed:', error);
      return [];
    }
  }

  async addRecentlyViewed(item: Omit<RecentlyViewedItem, 'timestamp'>): Promise<void> {
    try {
      const recentlyViewed = await this.getRecentlyViewed();
      const newItem: RecentlyViewedItem = {
        ...item,
        timestamp: Date.now(),
      };

      // Remove duplicate items
      const filteredItems = recentlyViewed.filter(
        viewedItem => viewedItem.id !== item.id
      );

      // Add new item to the beginning
      const updatedItems = [newItem, ...filteredItems].slice(0, MAX_RECENTLY_VIEWED);

      await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error adding recently viewed item:', error);
    }
  }

  async removeRecentlyViewed(id: string): Promise<void> {
    try {
      const items = await this.getRecentlyViewed();
      const updatedItems = items.filter(item => item.id !== id);
      await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error removing recently viewed item:', error);
    }
  }

  async clearRecentlyViewed(): Promise<void> {
    try {
      await AsyncStorage.removeItem(RECENTLY_VIEWED_KEY);
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  }

  // Filter Methods
  getPopularSearches(): string[] {
    return [
      'Fresh Vegetables',
      'Dairy Products',
      'Fruits',
      'Snacks & Beverages',
      'Personal Care',
      'Household Items',
      'Bakery Items',
      'Frozen Foods'
    ];
  }

  getCategoryFilters(): Array<{id: string, name: string, icon: string}> {
    return [
      { id: 'all', name: 'All', icon: 'apps' },
      { id: 'vegetables', name: 'Vegetables', icon: 'leaf' },
      { id: 'fruits', name: 'Fruits', icon: 'nutrition' },
      { id: 'dairy', name: 'Dairy', icon: 'water' },
      { id: 'snacks', name: 'Snacks', icon: 'fast-food' },
      { id: 'beverages', name: 'Beverages', icon: 'wine' },
      { id: 'personal-care', name: 'Personal Care', icon: 'heart' },
      { id: 'household', name: 'Household', icon: 'home' },
    ];
  }

  getPriceFilters(): Array<{id: string, name: string, min: number, max: number}> {
    return [
      { id: 'all', name: 'All Prices', min: 0, max: Infinity },
      { id: 'under-50', name: 'Under ₹50', min: 0, max: 50 },
      { id: '50-100', name: '₹50 - ₹100', min: 50, max: 100 },
      { id: '100-200', name: '₹100 - ₹200', min: 100, max: 200 },
      { id: '200-500', name: '₹200 - ₹500', min: 200, max: 500 },
      { id: 'above-500', name: 'Above ₹500', min: 500, max: Infinity },
    ];
  }
}

export default new SearchHistoryManager();
