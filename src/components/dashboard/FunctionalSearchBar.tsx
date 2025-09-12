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

interface FunctionalSearchBarProps {
  onSearch?: (query: string, results: any[]) => void;
  placeholder?: string;
  style?: object;
}

const FunctionalSearchBar: React.FC<FunctionalSearchBarProps> = ({
  onSearch,
  placeholder = 'Search for products...',
  style,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);


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
    if (query.length > 0) {
      loadSuggestions(query);
      performSearch(query);
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

  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      return;
    }

    const results: any[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    // Search in categories
    categories.forEach(category => {
      if (category.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'category',
          id: category.id,
          name: category.name,
          image: category.image,
        });
      }

      // Search in products within categories
      if (category.products && category.products.length > 0) {
        category.products.forEach(product => {
          if (product.name.toLowerCase().includes(lowerQuery)) {
            results.push({
              type: 'product',
              ...product,
              categoryName: category.name,
            });
          }
        });
      }
    });

    onSearch?.(searchQuery, results);
  };

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    await SearchHistoryManager.addSearchQuery(searchQuery);
    setQuery(searchQuery);
    setShowSuggestions(false);
    Keyboard.dismiss();
    performSearch(searchQuery);
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
    marginTop: 15,
    marginHorizontal: 10,
  },
  searchContainer: {
    backgroundColor: '#F3F4F7',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 0.6,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    height: 50,
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
