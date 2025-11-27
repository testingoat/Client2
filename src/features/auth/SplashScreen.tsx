import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import React, { FC, useEffect } from 'react';
import { Colors } from '@utils/Constants';
import Logo from '@assets/images/logo.jpeg';
import { screenHeight, screenWidth } from '@utils/Scaling';
import { resetAndNavigate } from '@utils/NavigationUtils';
import GeoLocation from '@react-native-community/geolocation';
import { useAuthStore } from '@state/authStore';
import { tokenStorage } from '@state/storage';
import { jwtDecode } from 'jwt-decode';
import { refetchUser, refresh_tokens } from '@service/authService';

GeoLocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'always',
  enableBackgroundLocationUpdates: true,
  locationProvider: 'auto',
});

interface DecodedToken {
  exp: number;
}

const SplashScreen: FC = () => {
  const { user, setUser } = useAuthStore();

  const tokenCheck = async () => {
    const accessToken = tokenStorage.getString('accessToken') as string;
    const refreshToken = tokenStorage.getString('refreshToken') as string;

    if (accessToken) {
      const decodedAccessToken = jwtDecode<DecodedToken>(accessToken);
      const decodedRefreshToken = jwtDecode<DecodedToken>(refreshToken);

      const currentTime = Date.now() / 1000;

      if (decodedRefreshToken?.exp < currentTime) {
        resetAndNavigate('CustomerLogin');
        Alert.alert('Session Expired', 'Please login again');
        return false;
      }

      if (decodedAccessToken?.exp < currentTime) {
        try {
          await refresh_tokens();
          await refetchUser(setUser);
        } catch (error) {
          console.log(error);
          Alert.alert('There was an error refreshing token!');
          return false;
        }
      } else {
        // If token is still valid, refetch user data
        await refetchUser(setUser);
      }

      // Get updated user state
      const updatedUser = useAuthStore.getState().user;

      if (updatedUser?.role === 'Customer') {
        resetAndNavigate('MainStack');
      } else if (updatedUser?.role) {
        resetAndNavigate('DeliveryDashboard');
      } else {
        resetAndNavigate('CustomerLogin');
      }

      return true;
    }

    resetAndNavigate('CustomerLogin');
    return false;
  };

  useEffect(() => {
    const intialStartup = async () => {
      try {
        GeoLocation.requestAuthorization();
        await tokenCheck();
      } catch (error) {
        Alert.alert(
          'Sorry we need location service to give you better shopping experience',
        );
      }
    };

    const timeoutId = setTimeout(intialStartup, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={Logo} style={styles.logoImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    height: screenHeight * 0.4,
    width: screenWidth * 0.4,
    resizeMode: 'contain',
  },
});

export default SplashScreen;