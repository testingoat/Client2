import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Text,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Fonts } from '@utils/Constants';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomText from '@components/ui/CustomText';
import NotificationManager, { NotificationItem } from '@utils/NotificationManager';

interface NotificationIconProps {
  size?: number;
  color?: string;
  style?: object;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({
  size = RFValue(24),
  color = Colors.text,
  style,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Initialize notification manager
    NotificationManager.initialize();

    // Subscribe to notification updates
    const unsubscribe = NotificationManager.addListener((updatedNotifications) => {
      setNotifications(updatedNotifications);
      setUnreadCount(NotificationManager.getUnreadCount());
    });

    // Load initial notifications
    loadNotifications();

    return unsubscribe;
  }, []);

  const loadNotifications = async () => {
    const loadedNotifications = await NotificationManager.loadNotifications();
    setNotifications(loadedNotifications);
    setUnreadCount(NotificationManager.getUnreadCount());
  };

  const handleNotificationPress = () => {
    setModalVisible(true);
    // Mark all as read when opening
    NotificationManager.markAllAsRead();
  };

  const handleDeleteNotification = (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => NotificationManager.deleteNotification(notificationId),
        },
      ]
    );
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

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
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

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => (
    <View style={[styles.notificationItem, !item.read && styles.unreadItem]}>
      <View style={styles.notificationHeader}>
        <Icon
          name={getNotificationIcon(item.type)}
          size={RFValue(20)}
          color={Colors.primary}
          style={styles.notificationIcon}
        />
        <View style={styles.notificationContent}>
          <CustomText variant="h6" fontFamily={Fonts.SemiBold} style={styles.notificationTitle}>
            {item.title}
          </CustomText>
          <CustomText variant="h7" style={styles.notificationBody}>
            {item.body}
          </CustomText>
          <CustomText variant="h8" style={styles.notificationTime}>
            {formatTimestamp(item.timestamp)}
          </CustomText>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteNotification(item.id)}
          style={styles.deleteButton}
        >
          <Icon name="close" size={RFValue(16)} color={Colors.text_light} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={handleNotificationPress}
        activeOpacity={0.7}
      >
        <Icon name="notifications-outline" size={size} color={color} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount.toString()}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <CustomText variant="h4" fontFamily={Fonts.SemiBold}>
              Notifications
            </CustomText>
            <View style={styles.headerButtons}>
              {notifications.length > 0 && (
                <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
                  <CustomText variant="h6" style={styles.clearButtonText}>
                    Clear All
                  </CustomText>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={RFValue(24)} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="notifications-off" size={RFValue(64)} color={Colors.text_light} />
              <CustomText variant="h5" style={styles.emptyText}>
                No notifications yet
              </CustomText>
              <CustomText variant="h6" style={styles.emptySubtext}>
                You'll see your notifications here when you receive them
              </CustomText>
            </View>
          ) : (
            <FlatList
              data={notifications}
              renderItem={renderNotificationItem}
              keyExtractor={(item) => item.id}
              style={styles.notificationsList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: RFValue(10),
    fontFamily: Fonts.SemiBold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary + '20',
    borderRadius: 16,
  },
  clearButtonText: {
    color: Colors.primary,
  },
  closeButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    color: Colors.text_light,
    textAlign: 'center',
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
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
  unreadItem: {
    backgroundColor: Colors.primary + '05',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: Colors.text,
    marginBottom: 4,
  },
  notificationBody: {
    color: Colors.text_light,
    marginBottom: 8,
    lineHeight: RFValue(18),
  },
  notificationTime: {
    color: Colors.text_light,
  },
  deleteButton: {
    padding: 4,
  },
});

export default NotificationIcon;
