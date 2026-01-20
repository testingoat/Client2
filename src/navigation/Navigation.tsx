import { View, Text } from 'react-native';
import React, { FC } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '@utils/NavigationUtils';
import SplashScreen from '@features/auth/SplashScreen';
import DeliveryLogin from '@features/auth/DeliveryLogin';
import CustomerLogin from '@features/auth/CustomerLogin';
import OTPVerification from '@features/auth/OTPVerification';
import ProductDashboard from '@features/dashboard/ProductDashboard';
import DeliveryDashboard from '@features/delivery/DeliveryDashboard';
import ProductCategories from '@features/category/ProductCategories';
import ProductOrder from '@features/order/ProductOrder';
import OrderSuccess from '@features/order/OrderSuccess';
import LiveTracking from '@features/map/LiveTracking';
import Profile from '@features/profile/Profile';
import DeliveryMap from '@features/delivery/DeliveryMap';
import NotificationScreen from '@features/notifications/NotificationScreen';
import FAQScreen from '@features/dashboard/FAQScreen';
import OrdersScreen from '@features/profile/OrdersScreen';
import WishlistScreen from '@features/profile/WishlistScreen';
import SupportScreen from '@features/profile/SupportScreen';

// Profile Screens
import AddressBookScreen from '@features/profile/screens/AddressBookScreen';
import SavedItemsScreen from '@features/profile/screens/SavedItemsScreen';
import OffersRewardsScreen from '@features/profile/screens/OffersRewardsScreen';
import TransactionHistoryScreen from '@features/profile/screens/TransactionHistoryScreen';
import HelpCenterScreen from '@features/profile/screens/HelpCenterScreen';
import RaiseTicketScreen from '@features/profile/screens/RaiseTicketScreen';
import SafetyTrustScreen from '@features/profile/screens/SafetyTrustScreen';
import TermsScreen from '@features/profile/screens/TermsScreen';
import PrivacyScreen from '@features/profile/screens/PrivacyScreen';
import CancellationPolicyScreen from '@features/profile/screens/CancellationPolicyScreen';
import NotificationSettingsScreen from '@features/profile/screens/NotificationSettingsScreen';
import LanguageSettingsScreen from '@features/profile/screens/LanguageSettingsScreen';
import PermissionsScreen from '@features/profile/screens/PermissionsScreen';
import CustomerProfileScreen from '@features/profile/screens/CustomerProfileScreen';
import WalletScreen from '@features/profile/screens/WalletScreen';
import CouponsScreen from '@features/profile/screens/CouponsScreen';
import ReferralScreen from '@features/profile/screens/ReferralScreen';
import LoyaltyScreen from '@features/profile/screens/LoyaltyScreen';
import SearchResults from '@features/search/SearchResults';
import OfferProductsScreen from '@features/dashboard/OfferProductsScreen';
import ProductDetailScreen from '@features/product/ProductDetailScreen';

import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator();

const Navigation: FC = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="MainStack" component={BottomTabNavigator} />
        <Stack.Screen name="DeliveryDashboard" component={DeliveryDashboard} />
        <Stack.Screen name="OrderSuccess" component={OrderSuccess} />
        <Stack.Screen name="LiveTracking" component={LiveTracking} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="DeliveryMap" component={DeliveryMap} />
        <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
        <Stack.Screen name="FAQScreen" component={FAQScreen} />
        <Stack.Screen name="OrdersScreen" component={OrdersScreen} />
        <Stack.Screen name="WishlistScreen" component={WishlistScreen} />
        <Stack.Screen name="SupportScreen" component={SupportScreen} />
        <Stack.Screen
          name="SearchResults"
          component={SearchResults}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="OfferProductsScreen" component={OfferProductsScreen} />
        <Stack.Screen
          name="ProductDetailScreen"
          component={ProductDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />

        {/* Profile Screens */}
        <Stack.Screen name="AddressBookScreen" component={AddressBookScreen} />
        <Stack.Screen name="SavedItemsScreen" component={SavedItemsScreen} />
        <Stack.Screen name="OffersRewardsScreen" component={OffersRewardsScreen} />
        <Stack.Screen name="TransactionHistoryScreen" component={TransactionHistoryScreen} />
        <Stack.Screen name="HelpCenterScreen" component={HelpCenterScreen} />
        <Stack.Screen name="RaiseTicketScreen" component={RaiseTicketScreen} />
        <Stack.Screen name="SafetyTrustScreen" component={SafetyTrustScreen} />
        <Stack.Screen name="TermsScreen" component={TermsScreen} />
        <Stack.Screen name="PrivacyScreen" component={PrivacyScreen} />
        <Stack.Screen name="CancellationPolicyScreen" component={CancellationPolicyScreen} />
        <Stack.Screen name="NotificationSettingsScreen" component={NotificationSettingsScreen} />
        <Stack.Screen name="LanguageSettingsScreen" component={LanguageSettingsScreen} />
        <Stack.Screen name="PermissionsScreen" component={PermissionsScreen} />
        <Stack.Screen name="CustomerProfileScreen" component={CustomerProfileScreen} />

        {/* Promotions Screens */}
        <Stack.Screen name="WalletScreen" component={WalletScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="CouponsScreen" component={CouponsScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ReferralScreen" component={ReferralScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="LoyaltyScreen" component={LoyaltyScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen
          options={{
            animation: 'fade',
          }}
          name="DeliveryLogin"
          component={DeliveryLogin}
        />
        <Stack.Screen
          options={{
            animation: 'fade',
          }}
          name="CustomerLogin"
          component={CustomerLogin}
        />
        <Stack.Screen
          name="OTPVerification"
          component={OTPVerification}
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
