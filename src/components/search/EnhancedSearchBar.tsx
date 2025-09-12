import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Fonts } from '@utils/Constants';
import CustomText from '@components/ui/CustomText';
import SearchHistoryManager, { SearchHistoryItem } from '@utils/SearchHistoryManager';
import { RFValue } from 'react-native-responsive-fontsize';

interface EnhancedSearchBarProps {
  onSearch: (query: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
  showFilters?: boolean;
  autoFocus?: boolean;
  style?: object;
}

const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  onSearch,
  onFilterPress,
  placeholder = 'Search for products...',
  showFilters = true,
  autoFocus = false,
  style,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const suggestionHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSearchHistory();
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      loadSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  useEffect(() => {
    // Animate suggestions container
    Animated.timing(suggestionHeight, {
      toValue: showSuggestions ? 200 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [showSuggestions]);

  const loadSearchHistory = async () => {
    const history = await SearchHistoryManager.getSearchHistory();
    setSearchHistory(history);
  };

  const loadSuggestions = async (searchQuery: string) => {
    const suggestions = await SearchHistoryManager.getSearchSuggestions(searchQuery);
    setSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0 && isFocused);
  };

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    await SearchHistoryManager.addSearchQuery(searchQuery);
    setQuery(searchQuery);
    setShowSuggestions(false);
    Keyboard.dismiss();
    onSearch(searchQuery);
    loadSearchHistory();
  };

  const handleSuggestionPress = (suggestion: string) => {
    handleSearch(suggestion);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (query.length > 0) {
      setShowSuggestions(suggestions.length > 0);
    } else {
      // Show recent searches when focused with empty query
      const recentQueries = searchHistory.slice(0, 5).map(item => item.query);
      setSuggestions(recentQueries);
      setShowSuggestions(recentQueries.length > 0);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for suggestion tap
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <Icon name="search" size={16} color={Colors.text_light} />
      <CustomText variant="h6" style={styles.suggestionText}>
        {item}
      </CustomText>
      <Icon name="arrow-up-left" size={14} color={Colors.text_light} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <Icon name="search" size={RFValue(18)} color={Colors.text_light} />
          
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder={placeholder}
            placeholderTextColor={Colors.text_light}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
            autoFocus={autoFocus}
            autoCorrect={false}
            autoCapitalize="none"
          />

          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Icon name="close-circle" size={RFValue(18)} color={Colors.text_light} />
            </TouchableOpacity>
          )}
        </View>

        {showFilters && (
          <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
            <Icon name="options" size={RFValue(18)} color={Colors.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions */}
      <Animated.View style={[styles.suggestionsContainer, { height: suggestionHeight }]}>
        {showSuggestions && (
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item, index) => `${item}-${index}`}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: RFValue(14),
    color: Colors.text,
    fontFamily: Fonts.Medium,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  suggestionsContainer: {
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  suggestionText: {
    flex: 1,
    marginLeft: 8,
    color: Colors.text,
  },
});

export default EnhancedSearchBar;
