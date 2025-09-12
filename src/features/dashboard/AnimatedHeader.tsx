import React, { FC, useRef } from 'react'
import { Animated, View, TouchableOpacity, StyleSheet } from 'react-native'
import Header from '@components/dashboard/Header'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { navigate } from '@utils/NavigationUtils'
import NotificationIcon from '@components/ui/NotificationIcon'

const AnimatedHeader: FC<{ showNotice: () => void }> = ({ showNotice }) => {
  // Simplified version - remove all animation to isolate the text error
  return (
    <View style={styles.row}>
      <Header showNotice={showNotice} />
      <View style={styles.rightSection}>
        <NotificationIcon
          size={24}
          color="#fff"
          style={styles.notificationIcon}
        />
        <TouchableOpacity
          accessibilityLabel="Open profile"
          onPress={() => navigate('Profile')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.profileBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="person-circle-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    marginRight: 8,
  },
  profileBtn: {
    padding: 4,
  },
})

export default AnimatedHeader