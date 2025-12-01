import { View, StyleSheet, TouchableOpacity } from 'react-native';
import React, { FC, useEffect, useMemo, useRef } from 'react';
import { useAuthStore } from '@state/authStore';
import Geolocation from '@react-native-community/geolocation';
import { reverseGeocode } from '@service/mapService';
import CustomText from '@components/ui/CustomText';
import { Fonts } from '@utils/Constants';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useWeatherStore } from '@state/weatherStore';
import { calculateDistance } from '@utils/etaCalculator';
import { useDeliveryEta } from '@features/dashboard/hooks/useDeliveryEta';

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
  const setUser = useAuthStore(state => state.setUser);
  const user = useAuthStore(state => state.user);
  const current = useWeatherStore(state => state.current);
  const refresh = useWeatherStore(state => state.refresh);
  const needsRefresh = useWeatherStore(state => state.needsRefresh);
  const lastCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  // Use the new ETA hook
  const { state: etaState, etaText, branchName, branchDistance, refresh: refreshEta } = useDeliveryEta();

  const branchSubtitle = useMemo(() => {
    if (etaState !== 'SUCCESS' || !branchName) {
      return null;
    }
    if (typeof branchDistance === 'number') {
      return `${branchName} • ${branchDistance.toFixed(1)} km away`;
    }
    return branchName;
  }, [branchName, branchDistance, etaState]);

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
          {etaState === 'OUT_OF_COVERAGE' ? 'Service Unavailable' : 'Delivery ETA'}
        </CustomText>
        <View style={styles.flexRowGap}>
          <CustomText
            fontFamily={Fonts.SemiBold}
            variant="h2"
            style={styles.text}>
            {etaState === 'LOADING' ? 'Calculating...' : etaText}
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
        {branchSubtitle && (
          <CustomText
            variant="h9"
            fontFamily={Fonts.Medium}
            style={[styles.text, styles.branchText]}
            numberOfLines={1}>
            {branchSubtitle}
          </CustomText>
        )}
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
  branchText: {
    opacity: 0.85,
    marginTop: 4,
  },
});

export default Header;
