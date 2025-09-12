import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

/* -----------------------------------------------------------
   LOCATION TYPE
----------------------------------------------------------- */
export interface DeliveryLocation {
  latitude: number;
  longitude: number;
}

/* -----------------------------------------------------------
   PERMISSION HELPER
----------------------------------------------------------- */
async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true; // iOS handled elsewhere

  // Android 8-9  -> only FINE/COARSE
  // Android 10+  -> runtime dialog for FINE
  // Android 11+  -> background only if you explicitly need it
  const permission =
    Platform.Version >= 33
      ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION; // same key on every Android

  const result = await request(permission);

  switch (result) {
    case RESULTS.UNAVAILABLE:
      Alert.alert('Location services are not available on this device.');
      return false;
    case RESULTS.DENIED:
    case RESULTS.LIMITED:
      Alert.alert(
        'Permission needed',
        'Please enable location permission in settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    case RESULTS.BLOCKED:
      // user permanently denied
      Alert.alert(
        'Permission blocked',
        'Location permission is required to deliver your order.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    case RESULTS.GRANTED:
      return true;
    default:
      return false;
  }
}

/* -----------------------------------------------------------
   GET DELIVERY LOCATION (with retry & fallback)
----------------------------------------------------------- */
export async function getDeliveryLocation(
  fallbackToManual = true
): Promise<DeliveryLocation | null> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return null;

  return new Promise((resolve, reject) => {
    // First attempt with high accuracy
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('[LocationService] GPS coordinates obtained:', latitude, longitude);
        resolve({ latitude, longitude });
      },
      (error) => {
        console.error('[LocationService] First attempt failed:', error);
        
        // Retry with different settings
        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log('[LocationService] GPS coordinates obtained on retry:', latitude, longitude);
            resolve({ latitude, longitude });
          },
          (retryError) => {
            console.error('[LocationService] Retry failed:', retryError);
            
            if (fallbackToManual) {
              Alert.alert(
                'Location unavailable',
                'We could not determine your location automatically. Please pick an address on the map.',
                [
                  { text: 'Cancel', onPress: () => resolve(null) },
                  {
                    text: 'Pick on Map',
                    onPress: () => {
                      // TODO: navigate to MapPickerScreen
                      // For now, resolve null to prevent order placement
                      resolve(null);
                    },
                  },
                ]
              );
            } else {
              reject(retryError);
            }
          },
          {
            enableHighAccuracy: false, // Use network location for retry
            timeout: 20000,
            maximumAge: 30000,
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
}

/* -----------------------------------------------------------
   VALIDATE LOCATION FOR ORDER
----------------------------------------------------------- */
export function validateLocationForOrder(location: DeliveryLocation | null): boolean {
  if (!location) {
    Alert.alert(
      'Location Required',
      'Please enable location services or manually select your delivery address to place an order.',
      [{ text: 'OK' }]
    );
    return false;
  }

  if (!location.latitude || !location.longitude) {
    Alert.alert(
      'Invalid Location',
      'Unable to determine your location coordinates. Please try again or select manually.',
      [{ text: 'OK' }]
    );
    return false;
  }

  // Basic coordinate validation
  if (Math.abs(location.latitude) > 90 || Math.abs(location.longitude) > 180) {
    Alert.alert(
      'Invalid Coordinates',
      'The location coordinates appear to be invalid. Please try again.',
      [{ text: 'OK' }]
    );
    return false;
  }

  return true;
}

/* -----------------------------------------------------------
   GET LOCATION WITH VALIDATION
----------------------------------------------------------- */
export async function getValidatedDeliveryLocation(): Promise<DeliveryLocation | null> {
  try {
    const location = await getDeliveryLocation(true);
    
    if (validateLocationForOrder(location)) {
      return location;
    }
    
    return null;
  } catch (error) {
    console.error('[LocationService] Error getting validated location:', error);
    Alert.alert(
      'Location Error',
      'Unable to get your location. Please check your location settings and try again.',
      [{ text: 'OK' }]
    );
    return null;
  }
}

/* -----------------------------------------------------------
   USAGE EXAMPLE (inside a React component)
----------------------------------------------------------- */
/*
import { getValidatedDeliveryLocation } from './locationService';

const handlePlaceOrder = async () => {
  const deliveryLocation = await getValidatedDeliveryLocation();
  if (!deliveryLocation) return; // user cancelled or permission denied

  const payload = {
    items: cartItems,
    deliveryLocation: deliveryLocation,
  };

  // post to server
  await api.post('/orders', payload);
};
*/
