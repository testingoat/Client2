import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Animated,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Fonts } from '@utils/Constants';
import CustomText from '@components/ui/CustomText';
import SearchHistoryManager, { SearchHistoryItem } from '@utils/SearchHistoryManager';
import { RFValue } from 'react-native-responsive-fontsize';
import Voice from '@react-native-voice/voice';
import { categories } from '@utils/dummyData';
import Config from 'react-native-config';
import { useQuery } from '@tanstack/react-query';
import { suggest, SearchResult } from '@service/searchService';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

// Default to enabling real search unless explicitly disabled via env
const USE_REAL_SEARCH = Config.USE_REAL_SEARCH !== 'false';

function localSearch(query: string): SearchResult[] {
  if (!query || !query.trim()) {
    return [];
  }

  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  // Search in categories
  categories.forEach(category => {
    if (category.name.toLowerCase().includes(lowerQuery)) {
      results.push({
        type: 'category',
        id: String(category.id),
        name: category.name,
        image: category.image,
        soldCount: 0,
      });
    }

    // Search in products within categories
    if (category.products && category.products.length > 0) {
      category.products.forEach(product => {
        if (product.name.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: 'product',
            id: String(product.id),
            name: product.name,
            image: product.image,
            soldCount: 0,
            // @ts-ignore - keeping for compatibility if needed, though not in SearchResult interface
            categoryName: category.name,
          });
        }
      });
    }
  });

  return results;
}

interface FunctionalSearchBarProps {
  onSearch?: (query: string, results: SearchResult[]) => void;
  placeholder?: string;
  style?: object;
}

const FunctionalSearchBar: React.FC<FunctionalSearchBarProps> = ({
  onSearch,
  placeholder = 'Search for products...',
  style,
}) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [backendSuggestionNames, setBackendSuggestionNames] = useState<string[]>([]);


  const inputRef = useRef<TextInput>(null);
  const suggestionHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSearchHistory();
    initializeVoice();

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    if (!query.length) {
      setSuggestions([]);
      return;
    }

    // If we have backend-based suggestions, prefer them
    if (backendSuggestionNames.length > 0) {
      setSuggestions(backendSuggestionNames);
    } else {
      // Fallback: existing history-based suggestions
      loadSuggestions(query);
    }
  }, [query, backendSuggestionNames]);

  const shouldUseBackend = USE_REAL_SEARCH && debouncedQuery.length >= 2;

  const {
    data: backendData,
    isLoading: isBackendLoading,
    isError: isBackendError,
  } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => suggest(debouncedQuery),
    enabled: shouldUseBackend,
    staleTime: 60_000,
  });

  // Compute final results
  let results: SearchResult[] = [];

  if (!debouncedQuery || debouncedQuery.length < 2) {
    // Very short query → behave as before.
    results = localSearch(debouncedQuery);
  } else if (!USE_REAL_SEARCH) {
    // Feature flag OFF → always local search.
    results = localSearch(debouncedQuery);
  } else if (isBackendError) {
    // Backend error → silent fallback.
    results = localSearch(debouncedQuery);
  } else if (backendData) {
    // Backend success → use API data.
    results = backendData.results;
  } else {
    // Backend loading, no data yet.
    results = [];
  }

  // Derive backend-based suggestion names from backend/local results
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setBackendSuggestionNames([]);
      return;
    }

    let sourceResults: SearchResult[] = [];

    if (!USE_REAL_SEARCH || isBackendError) {
      sourceResults = localSearch(debouncedQuery);
    } else if (backendData) {
      sourceResults = backendData.results;
    }

    const names = sourceResults
      .map(item => item.name)
      .filter(Boolean)
      .map(name => name.trim())
      .filter(name => name.length > 0);

    const uniqueNames = Array.from(new Set(names));
    const newNames = uniqueNames.slice(0, 10);

    setBackendSuggestionNames(prev => {
      if (prev.length === newNames.length && prev.every((val, index) => val === newNames[index])) {
        return prev;
      }
      return newNames;
    });
  }, [debouncedQuery, backendData, isBackendError]);

  useEffect(() => {
    // Animate suggestions container
    Animated.timing(suggestionHeight, {
      toValue: showSuggestions ? 200 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [showSuggestions]);

  const initializeVoice = () => {
    try {
      // Suppress NativeEventEmitter warnings for Voice module
      const originalWarn = console.warn;
      console.warn = (...args) => {
        if (args[0]?.includes?.('new NativeEventEmitter')) {
          return;
        }
        originalWarn(...args);
      };

      Voice.onSpeechStart = onSpeechStart;
      Voice.onSpeechEnd = onSpeechEnd;
      Voice.onSpeechError = onSpeechError;
      Voice.onSpeechResults = onSpeechResults;

      // Restore original console.warn after a short delay
      setTimeout(() => {
        console.warn = originalWarn;
      }, 1000);
    } catch (error) {
      console.log('Voice initialization error (non-critical):', error);
    }
  };

  const onSpeechStart = () => {
    setIsListening(true);
  };

  const onSpeechEnd = () => {
    setIsListening(false);
  };

  const onSpeechError = (error: any) => {
    console.log('Speech Error:', error);
    setIsListening(false);
    Alert.alert('Voice Recognition Error', 'Could not recognize speech. Please try again.');
  };

  const onSpeechResults = (event: any) => {
    const result = event.value[0];
    if (result) {
      setQuery(result);
      handleSearch(result);
    }
  };

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to microphone to use voice search.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const startVoiceRecognition = async () => {
    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Microphone permission is required for voice search.');
        return;
      }

      await Voice.start('en-US');
    } catch (error) {
      console.error('Voice start error:', error);
      Alert.alert('Voice Recognition Error', 'Could not start voice recognition.');
    }
  };

  const stopVoiceRecognition = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Voice stop error:', error);
    }
  };

  const loadSearchHistory = async () => {
    const history = await SearchHistoryManager.getSearchHistory();
    setSearchHistory(history);
  };

  const loadSuggestions = async (searchQuery: string) => {
    const suggestions = await SearchHistoryManager.getSearchSuggestions(searchQuery);
    setSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0 && isFocused);
  };

  // performSearch removed in favor of declarative results calculation

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    await SearchHistoryManager.addSearchQuery(searchQuery);
    setQuery(searchQuery);
    setShowSuggestions(false);
    Keyboard.dismiss();
    loadSearchHistory();

    // Notify parent with the current results for navigation / logging
    onSearch?.(searchQuery, results);
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
      <Icon name="search" size={16} color={Colors.disabled} />
      <CustomText variant="h6" style={styles.suggestionText}>
        {item}
      </CustomText>
      <Icon name="arrow-up" size={14} color={Colors.disabled} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchContainer}>
        <Icon name="search" color={Colors.text} size={RFValue(20)} />

        <TextInput
          ref={inputRef}
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor={Colors.disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />

        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Icon name="close-circle" size={RFValue(18)} color={Colors.disabled} />
          </TouchableOpacity>
        )}

        <View style={styles.divider} />

        <TouchableOpacity
          onPress={isListening ? stopVoiceRecognition : startVoiceRecognition}
          style={[styles.micButton, isListening && styles.micButtonActive]}
          activeOpacity={0.7}
        >
          <Icon
            name={isListening ? "stop" : "mic"}
            color={isListening ? Colors.primary : Colors.text}
            size={RFValue(20)}
          />
        </TouchableOpacity>
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
    // Tighter spacing so more of the header gradient is visible
    marginTop: 8,
    marginHorizontal: 16,
  },
  searchContainer: {
    // Make the search bar feel like a floating pill over the gradient
    backgroundColor: 'rgba(243, 244, 247, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 0.6,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    paddingLeft: 10,
    fontSize: RFValue(14),
    fontFamily: Fonts.Medium,
    color: Colors.text,
  },
  clearButton: {
    padding: 5,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#ddd',
    marginHorizontal: 10,
  },
  micButton: {
    padding: 5,
  },
  micButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderRadius: 15,
  },
  suggestionsContainer: {
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    marginTop: 5,
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

export default FunctionalSearchBar;
