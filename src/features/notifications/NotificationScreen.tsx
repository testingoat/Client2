import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  useColorScheme,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Fonts } from '@utils/Constants';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomText from '@components/ui/CustomText';
import NotificationManager, { NotificationItem } from '@utils/NotificationManager';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const NotificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const systemColorScheme = useColorScheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  // Theme colors based on reference design
  const theme = {
    background: isDarkMode ? '#121212' : '#f8f8f5',
    card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#E5E7EB' : '#1F2937',
    textSecondary: isDarkMode ? '#9CA3AF' : '#6B7280',
    primary: '#fac638',
    primaryLight: 'rgba(250, 198, 56, 0.2)',
    markAsReadBg: isDarkMode ? '#374151' : '#F3F4F6',
    deleteBg: isDarkMode ? 'rgba(220, 38, 38, 0.3)' : '#FEE2E2',
    deleteText: '#EF4444',
  };

  useEffect(() => {
    NotificationManager.initialize();
    const unsubscribe = NotificationManager.addListener((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });
    loadNotifications();
    return unsubscribe;
  }, []);

  useFocusEffect(
    useCallback(() => {
      NotificationManager.refreshFromServer().catch((error) => {
        console.error('Error refreshing notifications:', error);
      });
    }, [])
  );

  const loadNotifications = async () => {
    const loadedNotifications = await NotificationManager.loadNotifications();
    setNotifications(loadedNotifications);
    NotificationManager.refreshFromServer().catch((error) => {
      console.error('Error syncing notifications:', error);
    });
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => NotificationManager.clearAllNotifications(),
        },
      ]
    );
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await NotificationManager.markAsRead(notificationId);
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await NotificationManager.deleteNotification(notificationId);
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order':
        return 'bag-check';
      case 'delivery':
        return 'bicycle';
      case 'promotion':
        return 'pricetag';
      case 'system':
        return 'settings';
      default:
        return 'notifications';
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => (
    <View style={[styles.notificationCard, { backgroundColor: theme.card }]}>
      <View style={styles.notificationContent}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
          <Icon
            name={getNotificationIcon(item.type)}
            size={RFValue(20)}
            color={theme.primary}
          />
        </View>

        {/* Content */}
        <View style={styles.textContent}>
          <CustomText
            variant="h6"
            fontFamily={Fonts.SemiBold}
            style={[styles.title, { color: theme.text }]}
          >
            {item.title}
          </CustomText>
          <CustomText
            variant="h7"
            style={[styles.body, { color: theme.textSecondary }]}
          >
            {item.body}
          </CustomText>
          <CustomText
            variant="h8"
            style={[styles.timestamp, { color: theme.textSecondary }]}
          >
            {formatTimestamp(item.timestamp)}
          </CustomText>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Mark as Read Button */}
          {!item.read && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.markAsReadBg }]}
              onPress={() => handleMarkAsRead(item.id)}
              activeOpacity={0.7}
            >
              <Icon
                name="checkmark"
                size={RFValue(18)}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          )}

          {/* Delete Button */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.deleteBg }]}
            onPress={() => handleDeleteNotification(item.id)}
            activeOpacity={0.7}
          >
            <Icon
              name="trash-outline"
              size={RFValue(18)}
              color={theme.deleteText}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="notifications-off-outline"
        size={RFValue(64)}
        color={theme.textSecondary}
      />
      <CustomText
        variant="h5"
        fontFamily={Fonts.SemiBold}
        style={[styles.emptyText, { color: theme.text }]}
      >
        No notifications yet
      </CustomText>
      <CustomText
        variant="h6"
        style={[styles.emptySubtext, { color: theme.textSecondary }]}
      >
        You'll see your notifications here when you receive them
      </CustomText>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={RFValue(24)} color={theme.text} />
          </TouchableOpacity>
          <CustomText
            variant="h3"
            fontFamily={Fonts.Bold}
            style={[styles.headerTitle, { color: theme.text }]}
          >
            Notifications
          </CustomText>
        </View>

        <View style={styles.headerActions}>
          {notifications.length > 0 && (
            <TouchableOpacity
              onPress={handleClearAll}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <CustomText
                variant="h6"
                fontFamily={Fonts.SemiBold}
                style={[styles.clearButtonText, { color: theme.primary }]}
              >
                Clear All
              </CustomText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notification List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  clearButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  clearButtonText: {
    fontSize: RFValue(12),
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  notificationCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: RFValue(40),
    height: RFValue(40),
    borderRadius: RFValue(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    marginBottom: 4,
  },
  body: {
    marginBottom: 4,
    lineHeight: RFValue(16),
  },
  timestamp: {
    fontSize: RFValue(10),
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
    width: RFValue(40),
    height: RFValue(40),
    borderRadius: RFValue(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: RFValue(80),
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default NotificationScreen;
