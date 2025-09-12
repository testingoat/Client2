import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Fonts } from '@utils/Constants';
import CustomText from '@components/ui/CustomText';
import CustomButton from '@components/ui/CustomButton';
import ScalePress from '@components/ui/ScalePress';
import FadeInView from '@components/ui/FadeInView';
import { useCartStore } from '@state/cartStore';
import type { SavedItem } from '@state/cartStore';

interface SavedForLaterProps {
  onItemPress?: (item: SavedItem) => void;
  showHeader?: boolean;
  maxItems?: number;
}

const SavedForLater: React.FC<SavedForLaterProps> = ({
  onItemPress,
  showHeader = true,
  maxItems,
}) => {
  const {
    savedForLater,
    moveToCart,
    removeSavedItem,
    clearSavedItems,
    getSavedItemsCount,
  } = useCartStore();

  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const displayItems = maxItems ? savedForLater.slice(0, maxItems) : savedForLater;

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
      return `Saved ${minutes}m ago`;
    } else if (hours < 24) {
      return `Saved ${hours}h ago`;
    } else {
      return `Saved ${days}d ago`;
    }
  };

  const handleMoveToCart = (item: SavedItem) => {
    moveToCart(item._id);
  };

  const handleRemoveItem = (item: SavedItem) => {
    removeSavedItem(item._id);
  };

  const handleEditNotes = (item: SavedItem) => {
    setEditingNotes(item._id.toString());
    setNoteText(item.notes || '');
  };

  const handleSaveNotes = (item: SavedItem) => {
    // Note: We'd need to add updateSavedItemNotes method to the store
    // For now, we'll just close the editing mode
    setEditingNotes(null);
    setNoteText('');
  };

  const handleCancelNotes = () => {
    setEditingNotes(null);
    setNoteText('');
  };

  const renderSavedItem = ({ item, index }: { item: SavedItem; index: number }) => (
    <FadeInView delay={index * 100} fadeFrom="right">
      <ScalePress onPress={() => onItemPress?.(item)}>
        <View style={styles.itemCard}>
          <Image source={{ uri: item.item.image }} style={styles.itemImage} />
          
          <View style={styles.itemInfo}>
            <CustomText
              variant="h6"
              fontFamily={Fonts.Medium}
              style={styles.itemName}
              numberOfLines={2}
            >
              {item.item.name}
            </CustomText>
            
            {item.item.price && (
              <CustomText variant="h6" fontFamily={Fonts.SemiBold} style={styles.price}>
                {formatPrice(item.item.price)}
              </CustomText>
            )}
            
            <CustomText variant="h8" style={styles.timeAgo}>
              {formatTimeAgo(item.savedAt)}
            </CustomText>

            {/* Notes section */}
            {editingNotes === item._id.toString() ? (
              <View style={styles.notesEditContainer}>
                <TextInput
                  style={styles.notesInput}
                  value={noteText}
                  onChangeText={setNoteText}
                  placeholder="Add a note..."
                  placeholderTextColor={Colors.text_light}
                  multiline
                  maxLength={100}
                />
                <View style={styles.notesActions}>
                  <TouchableOpacity onPress={handleCancelNotes}>
                    <CustomText variant="h8" style={styles.cancelText}>
                      Cancel
                    </CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleSaveNotes(item)}>
                    <CustomText variant="h8" style={styles.saveText}>
                      Save
                    </CustomText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {item.notes && (
                  <CustomText variant="h8" style={styles.notes}>
                    Note: {item.notes}
                  </CustomText>
                )}
                <TouchableOpacity
                  onPress={() => handleEditNotes(item)}
                  style={styles.addNoteButton}
                >
                  <Icon name="note-plus" size={14} color={Colors.text_light} />
                  <CustomText variant="h8" style={styles.addNoteText}>
                    {item.notes ? 'Edit note' : 'Add note'}
                  </CustomText>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={styles.itemActions}>
            <TouchableOpacity
              onPress={() => handleMoveToCart(item)}
              style={styles.actionButton}
            >
              <Icon name="cart-plus" size={20} color={Colors.secondary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleRemoveItem(item)}
              style={styles.actionButton}
            >
              <Icon name="delete" size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </ScalePress>
    </FadeInView>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="bookmark-outline" size={48} color={Colors.text_light} />
      <CustomText variant="h5" style={styles.emptyTitle}>
        No Saved Items
      </CustomText>
      <CustomText variant="h7" style={styles.emptySubtitle}>
        Items you save for later will appear here
      </CustomText>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <CustomText variant="h5" fontFamily={Fonts.SemiBold} style={styles.title}>
          Saved for Later
        </CustomText>
        <CustomText variant="h7" style={styles.subtitle}>
          {getSavedItemsCount()} {getSavedItemsCount() === 1 ? 'item' : 'items'}
        </CustomText>
      </View>
      
      {savedForLater.length > 0 && (
        <TouchableOpacity onPress={clearSavedItems}>
          <CustomText variant="h7" style={styles.clearText}>
            Clear All
          </CustomText>
        </TouchableOpacity>
      )}
    </View>
  );

  if (savedForLater.length === 0) {
    return (
      <View style={styles.container}>
        {showHeader && renderHeader()}
        {renderEmptyState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showHeader && renderHeader()}
      
      <FlatList
        data={displayItems}
        renderItem={renderSavedItem}
        keyExtractor={(item) => item._id.toString()}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      
      {maxItems && savedForLater.length > maxItems && (
        <TouchableOpacity style={styles.viewAllButton}>
          <CustomText variant="h6" style={styles.viewAllText}>
            View All ({savedForLater.length - maxItems} more)
          </CustomText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    color: Colors.text,
  },
  subtitle: {
    color: Colors.disabled,
    marginTop: 4,
  },
  clearText: {
    color: Colors.secondary,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    color: Colors.text,
    marginBottom: 4,
  },
  price: {
    color: Colors.secondary,
    marginBottom: 4,
  },
  timeAgo: {
    color: Colors.disabled,
    marginBottom: 8,
  },
  notes: {
    color: Colors.text,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addNoteText: {
    color: Colors.disabled,
    marginLeft: 4,
  },
  notesEditContainer: {
    marginTop: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: Colors.text,
    maxHeight: 60,
  },
  notesActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelText: {
    color: Colors.disabled,
    marginRight: 16,
  },
  saveText: {
    color: Colors.secondary,
  },
  itemActions: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    color: Colors.text,
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtitle: {
    color: Colors.disabled,
    textAlign: 'center',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  viewAllText: {
    color: Colors.secondary,
  },
});

export default SavedForLater;
