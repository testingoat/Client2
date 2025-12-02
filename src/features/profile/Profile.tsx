import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { useAuthStore } from '@state/authStore';
import { useCartStore } from '@state/cartStore';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import { Fonts, Colors } from '@utils/Constants';
import ActionButton from './ActionButton';
import { storage, tokenStorage } from '@state/storage';
import { resetAndNavigate } from '@utils/NavigationUtils';
import WalletSection from './WalletSection';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const Profile = () => {
  const { logout, user } = useAuthStore();
  const { clearCart } = useCartStore();
  const navigation = useNavigation();

  const formatPhone = (phone: string | number | undefined) => {
    if (!phone) return '';
    const phoneStr = phone.toString();
    return `+91 ${phoneStr.replace(/(\d{5})(\d{5})/, '$1 $2')}`;
  };

  const menuItems = [
    {
      title: 'YOUR INFORMATION',
      items: [
        { icon: 'book-outline', label: 'Address Book', screen: 'AddressBookScreen' },
        { icon: 'bookmark-outline', label: 'Saved Items', screen: 'SavedItemsScreen' },
        { icon: 'gift-outline', label: 'Offers & Rewards', screen: 'OffersRewardsScreen' },
        { icon: 'time-outline', label: 'Transaction History', screen: 'TransactionHistoryScreen' },
      ]
    },
    {
      title: 'HELP & POLICIES',
      items: [
        { icon: 'help-circle-outline', label: 'Help Center', screen: 'HelpCenterScreen' },
        { icon: 'ticket-outline', label: 'Raise a Ticket', screen: 'RaiseTicketScreen' },
        { icon: 'shield-checkmark-outline', label: 'Safety & Trust', screen: 'SafetyTrustScreen' },
        { icon: 'document-text-outline', label: 'Terms', screen: 'TermsScreen' },
        { icon: 'lock-closed-outline', label: 'Privacy', screen: 'PrivacyScreen' },
        { icon: 'refresh-circle-outline', label: 'Cancellation/Refund Policy', screen: 'CancellationPolicyScreen' },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { icon: 'notifications-outline', label: 'Notifications', screen: 'NotificationScreen' },
        { icon: 'language-outline', label: 'Language', screen: 'LanguageSettingsScreen' },
        { icon: 'key-outline', label: 'Permissions', screen: 'PermissionsScreen' },
      ]
    }
  ];

  return (
    <View style={styles.container}>
      <CustomHeader title="Profile" />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <TouchableOpacity
          style={styles.headerContainer}
          onPress={() => navigation.navigate('CustomerProfileScreen' as never)}
          activeOpacity={0.7}
        >
          <View style={styles.headerTitleRow}>
            <CustomText variant="h3" fontFamily={Fonts.SemiBold} style={styles.centerText}>
              Your account
            </CustomText>
            <Icon name="chevron-forward" size={20} color={Colors.text} />
          </View>
          <CustomText variant="h7" fontFamily={Fonts.Medium} style={styles.centerText}>
            {formatPhone(user?.phone)}
          </CustomText>
        </TouchableOpacity>

        <WalletSection />

        {menuItems.map((section, index) => (
          <View key={index}>
            <CustomText variant="h8" style={styles.sectionTitle}>
              {section.title}
            </CustomText>
            {section.items.map((item, idx) => (
              <ActionButton
                key={idx}
                icon={item.icon}
                label={item.label}
                onPress={() => navigation.navigate(item.screen as never)}
              />
            ))}
          </View>
        ))}

        <View style={styles.logoutContainer}>
          <ActionButton
            icon="log-out-outline"
            label="Logout"
            onPress={async () => {
              clearCart();
              logout();
              await tokenStorage.clearAll();
              await storage.clear();
              resetAndNavigate('CustomerLogin');
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 100,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  centerText: {
    textAlign: 'center',
  },
  sectionTitle: {
    opacity: 0.7,
    marginBottom: 10,
    marginTop: 20,
  },
  logoutContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  }
});

export default Profile;