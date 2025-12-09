import React, { FC, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '@components/ui/CustomText';
import { useAuthStore } from '@state/authStore';
import { useWeatherStore } from '@state/weatherStore';
import { reverseGeocode } from '@service/mapService';
import { calculateDistance } from '@utils/etaCalculator';
import { Fonts } from '@utils/Constants';
import { useDeliveryEta } from '@features/dashboard/hooks/useDeliveryEta';
import {
  getDeliveryLocation,
  requestLocationPermission,
} from '@service/locationService';

// Helper function to format and truncate address
const formatAddress = (address: string): string => {
  if (!address) {
    return 'Live tracking available';
  }

  const parts = address.split(',').map(part => part.trim());

  if (parts.length >= 2) {
    const shortAddress = parts.slice(0, 2).join(', ');
    return shortAddress.length > 25
      ? shortAddress.substring(0, 22) + '...'
      : shortAddress;
  }

  return address.length > 25 ? address.substring(0, 22) + '...' : address;
};

// Safe weather badge text generation
const getWeatherBadgeText = (current: any): string => {
  try {
    const icon = current?.icon || '☀️';
    const label = current?.label || 'Sunny';

    const safeIcon = String(icon).trim() || '☀️';
    const safeLabel = String(label).trim() || 'Sunny';

    return `${safeIcon} ${safeLabel}`;
  } catch (error) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('Weather badge error:', error);
    }
    return '☀️ Sunny';
  }
};

const Header: FC<{ showNotice: () => void }> = ({ showNotice }) => {
  const setUser = useAuthStore(state => state.setUser);
  const user = useAuthStore(state => state.user);

  const current = useWeatherStore(state => state.current);
  const refreshWeather = useWeatherStore(state => state.refresh);
  const needsRefresh = useWeatherStore(state => state.needsRefresh);

  const lastCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  const {
    state: etaState,
    etaText,
    branchName,
    branchDistance,
    refresh: refreshEta,
  } = useDeliveryEta();

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
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log(
            'Header: location permission not granted, skipping fetch',
          );
        }
        return;
      }

      const location = await getDeliveryLocation(false);
      if (!location) {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('Header: no location available after permission check');
        }
        return;
      }

      const { latitude, longitude } = location;
      const previousCoords = lastCoordsRef.current;

      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('Header: Location obtained via service:', {
          latitude,
          longitude,
        });
      }

      let significantMovement = false;
      if (previousCoords) {
        const distance = calculateDistance(
          previousCoords.lat,
          previousCoords.lng,
          latitude,
          longitude,
        );
        significantMovement = distance >= 1;
        if (__DEV__ && significantMovement) {
          // eslint-disable-next-line no-console
          console.log(
            `Header: Significant movement detected: ${distance.toFixed(2)}km`,
          );
        }
      }

      reverseGeocode(latitude, longitude, setUser);
      lastCoordsRef.current = { lat: latitude, lng: longitude };

      if (needsRefresh(latitude, longitude) || significantMovement) {
        await refreshWeather(latitude, longitude);
      }
    } catch (error) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('Header: Location update failed', error);
      }
    }
  };

  useEffect(() => {
    updateUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('Header: Current user data:', user);
      // eslint-disable-next-line no-console
      console.log('Header: User address:', user?.address);
      // eslint-disable-next-line no-console
      console.log('Header: Weather current:', current);
    }
  }, [user, current]);

  return (
    <View style={styles.subContainer}>
      <TouchableOpacity activeOpacity={0.8} onPress={refreshEta}>
        <View style={styles.flexRowGap}>

          <TouchableOpacity style={styles.noticeBtn} onPress={showNotice}>
            <CustomText
              fontSize={RFValue(6)}
              fontFamily={Fonts.SemiBold}
              style={{ color: '#3B4886' }}>
              {getWeatherBadgeText(current)}
            </CustomText>
          </TouchableOpacity>
        </View>

        <CustomText
          fontFamily={Fonts.Bold}
          style={styles.etaValue}>
          {etaState === 'LOADING' ? 'Calculating...' : etaText}
        </CustomText>

        <View style={styles.addressRow}>
          <CustomText
            variant="h8"
            fontFamily={Fonts.Medium}
            style={styles.addressText}
            numberOfLines={1}>
            {String(
              user?.address
                ? formatAddress(user.address)
                : 'Live tracking available',
            )}
          </CustomText>
          <Icon name="chevron-down" color="#ddd" size={RFValue(10)} />
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
    width: '75%',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  text: {
    color: '#fff',
  },
  label: {
    color: '#fff',
    opacity: 0.8,
    fontSize: RFValue(7),
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  etaValue: {
    color: '#fff',
    fontSize: RFValue(18),
    marginTop: 2,
  },
  flexRowGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeBtn: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  addressText: {
    color: '#fff',
    opacity: 0.85,
    fontSize: RFValue(9),
  },
  branchText: {
    opacity: 0.6,
    marginTop: 2,
    fontSize: RFValue(8),
  },
});

export default Header;

