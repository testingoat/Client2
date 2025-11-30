import { View, StyleSheet, TouchableOpacity, AppState } from 'react-native';
import React, { FC, useEffect, useRef } from 'react';
import { useAuthStore } from '@state/authStore';
import Geolocation from '@react-native-community/geolocation';
import { reverseGeocode } from '@service/mapService';
import CustomText from '@components/ui/CustomText';
import { Fonts } from '@utils/Constants';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { navigate } from '@utils/NavigationUtils';
import { useWeatherStore, WEATHER_REFRESH_INTERVAL_MS } from '@state/weatherStore';
import { calculateDistance } from '@utils/etaCalculator';
import { useDeliveryEta } from '../../features/dashboard/hooks/useDeliveryEta';

// Helper function to format and truncate address
const formatAddress = (address: string): string => {
  if (!address) return 'Live tracking available';

  // Split address by commas and take relevant parts
  const parts = address.split(',').map(part => part.trim());

  // Try to get street and area (first 2-3 parts usually)
  if (parts.length >= 2) {
    const shortAddress = parts.slice(0, 2).join(', ');
    // Limit to 25 characters for better UI
    return shortAddress.length > 25 ? shortAddress.substring(0, 22) + '...' : shortAddress;
  }

  // Fallback: truncate the full address
  return address.length > 25 ? address.substring(0, 22) + '...' : address;
};

// Safe weather badge text generation
const getWeatherBadgeText = (current: any): string => {
  try {
    const icon = current?.icon || '☀️';
    const label = current?.label || 'Sunny';

    // Ensure both are strings and not undefined/null
    const safeIcon = String(icon).trim() || '☀️';
    const safeLabel = String(label).trim() || 'Sunny';

    return `${safeIcon} ${safeLabel}`;
  } catch (error) {
    if (__DEV__) {
      console.log('Weather badge error:', error);
    }
    return '☀️ Sunny';
  }
};

const Header: FC<{ showNotice: () => void }> = ({ showNotice }) => {
  const { setUser, user } = useAuthStore();
  const { current, refresh, needsRefresh } = useWeatherStore();
  const lastCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use the new ETA hook
  const { state: etaState, etaText, branchName, branchDistance, refresh: refreshEta } = useDeliveryEta();

  const updateUserLocation = async () => {
    Geolocation.requestAuthorization();
    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        const previousCoords = lastCoordsRef.current;

        if (__DEV__) {
          console.log('Location obtained:', { latitude, longitude });
        }

        // Check for significant movement (>1km) for weather refresh
        let significantMovement = false;
        if (previousCoords) {
          const distance = calculateDistance(
            previousCoords.lat,
            previousCoords.lng,
            latitude,
            longitude,
          );
          significantMovement = distance >= 1; // 1km threshold
          if (__DEV__ && significantMovement) {
            console.log(`🚶 Significant movement detected: ${distance.toFixed(2)}km`);
          }
        }

        // Update location in auth store (this refreshes the address display)
        reverseGeocode(latitude, longitude, setUser);
        lastCoordsRef.current = { lat: latitude, lng: longitude };

        // Refresh weather if needed (initial fetch, time-based, or significant movement)
        if (needsRefresh(latitude, longitude) || significantMovement) {
          await refresh(latitude, longitude);
        }
      },
      error => {
        if (__DEV__) {
          console.log('Location error:', error);
          console.log('Using fallback location display');
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
      },
    );
  };

  useEffect(() => {
    updateUserLocation();

    // TEMPORARILY DISABLED - Focus/AppState-based refresh every 10 minutes (weather + location)
    const handleAppStateChange = (state: string) => {
      if (false && state === 'active') {
        // Immediate check when app becomes active
        if (lastCoordsRef.current) {
          const { lat, lng } = lastCoordsRef.current;
          if (needsRefresh(lat, lng)) {
            refresh(lat, lng);
          }
        }

        // Start weather refresh interval while app is active
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => {
            if (lastCoordsRef.current) {
              const { lat, lng } = lastCoordsRef.current;
              if (needsRefresh(lat, lng)) {
                refresh(lat, lng);
              }
            }
          }, WEATHER_REFRESH_INTERVAL_MS);
        }

        // Start location refresh interval (every 10 minutes)
        if (!locationIntervalRef.current) {
          locationIntervalRef.current = setInterval(() => {
            if (__DEV__) {
              console.log('🔄 Refreshing location (10min interval)');
            }
            updateUserLocation();
          }, WEATHER_REFRESH_INTERVAL_MS); // Same 10-minute interval
        }
      } else {
        // Clear intervals when not active to save battery/data
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (locationIntervalRef.current) {
          clearInterval(locationIntervalRef.current);
          locationIntervalRef.current = null;
        }
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      sub.remove();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    };
  }, []);

  // Debug user data and weather
  useEffect(() => {
    if (__DEV__) {
      console.log('Header: Current user data:', user);
      console.log('Header: User address:', user?.address);
      console.log('Header: Weather current:', current);
      console.log('Header: Weather icon type:', typeof current?.icon, current?.icon);
      console.log('Header: Weather label type:', typeof current?.label, current?.label);
    }
  }, [user, current]);

  return (
    <View style={styles.subContainer}>
      <TouchableOpacity activeOpacity={0.8} onPress={refreshEta}>
        <CustomText fontFamily={Fonts.Bold} variant="h8" style={styles.text}>
          {etaState === 'OUT_OF_COVERAGE' ? 'Service Unavailable' : 'Delivery in'}
        </CustomText>
        <View style={styles.flexRowGap}>
          <CustomText
            fontFamily={Fonts.SemiBold}
            variant="h2"
            style={styles.text}>
            {etaState === 'LOADING' ? 'Calculating...' : etaText.replace('Delivery in ', '')}
          </CustomText>
          <TouchableOpacity style={styles.noticeBtn} onPress={showNotice}>
            <CustomText
              fontSize={RFValue(5)}
              fontFamily={Fonts.SemiBold}
              style={{ color: '#3B4886' }}>
              {getWeatherBadgeText(current)}
            </CustomText>
          </TouchableOpacity>
        </View>

        <View style={styles.flexRow}>
          <CustomText
            variant="h8"
            fontFamily={Fonts.Medium}
            style={[styles.text, { opacity: 0.8, fontSize: RFValue(8) }]}
            numberOfLines={1}>
            {String(
              user?.address
                ? formatAddress(user.address)
                : 'Live tracking available',
            )}
          </CustomText>
          <Icon name="check-circle" color="#0B8F3A" size={RFValue(9)} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  subContainer: {
    width: '70%',
  },
  text: {
    color: '#fff',
  },
  flexRowGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noticeBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },
});

export default Header;
