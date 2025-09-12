import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Fonts } from '@utils/Constants';
import CustomText from '@components/ui/CustomText';
import SimpleModal from '@components/ui/SimpleModal';
import SearchHistoryManager from '@utils/SearchHistoryManager';
import CustomButton from '@components/ui/CustomButton';

interface SearchFiltersProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  category: string;
  priceRange: string;
  sortBy: string;
  inStock: boolean;
  rating: number;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  visible,
  onClose,
  onApplyFilters,
  initialFilters,
}) => {
  const [filters, setFilters] = useState<FilterState>(
    initialFilters || {
      category: 'all',
      priceRange: 'all',
      sortBy: 'relevance',
      inStock: false,
      rating: 0,
    }
  );

  const categories = SearchHistoryManager.getCategoryFilters();
  const priceRanges = SearchHistoryManager.getPriceFilters();
  
  const sortOptions = [
    { id: 'relevance', name: 'Relevance', icon: 'star' },
    { id: 'price-low', name: 'Price: Low to High', icon: 'arrow-up' },
    { id: 'price-high', name: 'Price: High to Low', icon: 'arrow-down' },
    { id: 'rating', name: 'Customer Rating', icon: 'heart' },
    { id: 'newest', name: 'Newest First', icon: 'time' },
  ];

  const ratingOptions = [
    { value: 0, label: 'All Ratings' },
    { value: 4, label: '4★ & above' },
    { value: 3, label: '3★ & above' },
    { value: 2, label: '2★ & above' },
    { value: 1, label: '1★ & above' },
  ];

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: 'all',
      priceRange: 'all',
      sortBy: 'relevance',
      inStock: false,
      rating: 0,
    });
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const renderFilterSection = (title: string, children: React.ReactNode) => (
    <View style={styles.filterSection}>
      <CustomText variant="h5" fontFamily={Fonts.SemiBold} style={styles.sectionTitle}>
        {title}
      </CustomText>
      {children}
    </View>
  );

  const renderOptionButton = (
    option: any,
    selectedValue: string | number,
    onSelect: (value: any) => void,
    showIcon = false
  ) => (
    <TouchableOpacity
      key={option.id || option.value}
      style={[
        styles.optionButton,
        (selectedValue === option.id || selectedValue === option.value) && styles.selectedOption,
      ]}
      onPress={() => onSelect(option.id || option.value)}
    >
      {showIcon && option.icon ? (
        <Icon
          name={option.icon}
          size={16}
          color={
            (selectedValue === option.id || selectedValue === option.value)
              ? Colors.secondary
              : Colors.text_light
          }
          style={styles.optionIcon}
        />
      ) : null}
      <CustomText
        variant="h6"
        style={[
          styles.optionText,
          (selectedValue === option.id || selectedValue === option.value) && styles.selectedOptionText,
        ]}
      >
        {option.name || option.label}
      </CustomText>
    </TouchableOpacity>
  );

  return (
    <SimpleModal
      visible={visible}
      onClose={onClose}
      style={styles.modal}
      contentStyle={styles.modalContent}
    >
      <View style={styles.header}>
        <CustomText variant="h4" fontFamily={Fonts.SemiBold}>
          Filter & Sort
        </CustomText>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories */}
        {renderFilterSection(
          'Categories',
          <View style={styles.optionsGrid}>
            {categories.map(category =>
              renderOptionButton(category, filters.category, (value) => updateFilter('category', value), true)
            )}
          </View>
        )}

        {/* Price Range */}
        {renderFilterSection(
          'Price Range',
          <View style={styles.optionsColumn}>
            {priceRanges.map(range =>
              renderOptionButton(range, filters.priceRange, (value) => updateFilter('priceRange', value))
            )}
          </View>
        )}

        {/* Sort By */}
        {renderFilterSection(
          'Sort By',
          <View style={styles.optionsColumn}>
            {sortOptions.map(option =>
              renderOptionButton(option, filters.sortBy, (value) => updateFilter('sortBy', value), true)
            )}
          </View>
        )}

        {/* Rating */}
        {renderFilterSection(
          'Customer Rating',
          <View style={styles.optionsColumn}>
            {ratingOptions.map(option =>
              renderOptionButton(option, filters.rating, (value) => updateFilter('rating', value))
            )}
          </View>
        )}

        {/* In Stock Toggle */}
        {renderFilterSection(
          'Availability',
          <TouchableOpacity
            style={[styles.toggleButton, filters.inStock ? styles.toggleActive : null]}
            onPress={() => updateFilter('inStock', !filters.inStock)}
          >
            <Icon
              name={filters.inStock ? 'checkbox' : 'square-outline'}
              size={20}
              color={filters.inStock ? Colors.secondary : Colors.text_light}
            />
            <CustomText variant="h6" style={styles.toggleText}>
              In Stock Only
            </CustomText>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
          <CustomText variant="h6" style={styles.resetText}>
            Reset
          </CustomText>
        </TouchableOpacity>
        
        <CustomButton
          title="Apply Filters"
          onPress={applyFilters}
          variant="gradient"
          style={styles.applyButton}
        />
      </View>
    </SimpleModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  filterSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    color: Colors.text || '#363636',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  optionsColumn: {
    flexDirection: 'column',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#ffffff',
  },
  selectedOption: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondary + '10',
  },
  optionIcon: {
    marginRight: 8,
  },
  optionText: {
    color: Colors.text,
  },
  selectedOptionText: {
    color: Colors.secondary,
    fontFamily: Fonts.SemiBold,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  toggleActive: {
    // Add any active toggle styles if needed
  },
  toggleText: {
    marginLeft: 8,
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  resetButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  resetText: {
    color: Colors.disabled,
  },
  applyButton: {
    flex: 2,
    marginVertical: 0,
  },
});

export default SearchFilters;
