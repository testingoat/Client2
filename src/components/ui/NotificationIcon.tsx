import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '@utils/Constants';
import { RFValue } from 'react-native-responsive-fontsize';
import NotificationManager from '@utils/NotificationManager';
import { useNavigation } from '@react-navigation/native';

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
  const navigation = useNavigation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initialize notification manager
    NotificationManager.initialize();

    // Subscribe to notification updates
    const unsubscribe = NotificationManager.addListener(() => {
      setUnreadCount(NotificationManager.getUnreadCount());
    });

    // Load initial notifications
    loadNotifications();

    return unsubscribe;
  }, []);

  const loadNotifications = async () => {
    await NotificationManager.loadNotifications();
    setUnreadCount(NotificationManager.getUnreadCount());
  };

  const handleNotificationPress = () => {
    // Navigate to NotificationScreen
    navigation.navigate('NotificationScreen' as never);
  };

  return (
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
  },
});

export default NotificationIcon;
