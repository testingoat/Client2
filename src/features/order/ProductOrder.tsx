import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import CustomHeader from '@components/ui/CustomHeader';
import { Colors, Fonts } from '@utils/Constants';
import OrderList from './OrderList';
import CustomText from '@components/ui/CustomText';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BillDetails from './BillDetails';
import { useCartStore } from '@state/cartStore';
import { useAuthStore } from '@state/authStore';
import { hocStyles } from '@styles/GlobalStyles';
import ArrowButton from '@components/ui/ArrowButton';
import { createOrder } from '@service/orderService';
import { navigate } from '@utils/NavigationUtils';
import { DeliveryLocation, getValidatedDeliveryLocation } from '@service/locationService';
import { useDeliveryEta } from '@features/dashboard/hooks/useDeliveryEta';
import { useDeliveryQuote } from './hooks/useDeliveryQuote';
import { useAddressStore } from '@state/addressStore';

const ProductOrder = () => {
  const { getTotalPrice, cart, clearCart } = useCartStore();
  const { user, setCurrentOrder, currentOrder } = useAuthStore();
  const totalItemPrice = getTotalPrice();

  const [loading, setLoading] = useState(false);
  const {
    state: etaState,
    etaText,
    branchName,
    branchDistance,
    branchId,
    refresh: refreshEta,
  } = useDeliveryEta();

  const {
    addresses,
    selectedAddressId,
    loadAddresses,
    loading: addressLoading,
  } = useAddressStore();

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const selectedAddress = useMemo(
    () => addresses.find(addr => addr._id === selectedAddressId) || null,
    [addresses, selectedAddressId],
  );

  const [deliveryLocationState, setDeliveryLocationState] =
    useState<DeliveryLocation | null>(() => {
      if (user?.address?.latitude && user?.address?.longitude) {
        return {
          latitude: user.address.latitude,
          longitude: user.address.longitude,
        };
      }
      return null;
    });

  useEffect(() => {
    if (user?.address?.latitude && user?.address?.longitude) {
      setDeliveryLocationState(prev => {
        if (
          prev &&
          prev.latitude === user.address.latitude &&
          prev.longitude === user.address.longitude
        ) {
          return prev;
        }
        return {
          latitude: user.address.latitude,
          longitude: user.address.longitude,
        };
      });
    }
  }, [user?.address?.latitude, user?.address?.longitude]);

  const effectiveLocation = selectedAddress
    ? { latitude: selectedAddress.latitude, longitude: selectedAddress.longitude }
    : deliveryLocationState;

  const {
    quote,
    loading: isQuoteLoading,
    error: quoteError,
    isDisabled: isQuoteDisabled,
    refetch: refetchQuote,
  } = useDeliveryQuote({
    branchId,
    cartValue: totalItemPrice,
    deliveryLocation: effectiveLocation,
    addressId: selectedAddress?._id || null,
    enabled: etaState === 'SUCCESS' && (!!selectedAddress || !!effectiveLocation),
  });

  const branchDisplay = useMemo(() => {
    if (!branchName) {
      return null;
    }

    const distanceText =
      typeof branchDistance === 'number'
        ? `${branchDistance.toFixed(1)} km away`
        : null;

    return distanceText ? `${branchName} • ${distanceText}` : branchName;
  }, [branchName, branchDistance]);

  const quoteInfoMessage =
    quoteError?.message ||
    (selectedAddress
      ? null
      : addresses.length === 0
        ? 'Add a delivery address to view delivery fee.'
        : 'Select a delivery address to continue.');

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAddresses();
      refreshEta();
      if (!selectedAddress && !deliveryLocationState) {
        const freshLocation = await getValidatedDeliveryLocation();
        if (freshLocation) {
          setDeliveryLocationState(freshLocation);
        }
      }
      refetchQuote();
    } catch (error) {
      console.warn('Checkout refresh error', error);
    } finally {
      setRefreshing(false);
    }
  };
  const deliveryFeeTotal = quote?.final_fee ?? 0;
  const grandTotal = totalItemPrice + deliveryFeeTotal;
  const isPlaceOrderDisabled =
    loading ||
    isQuoteLoading ||
    isQuoteDisabled ||
    etaState === 'OUT_OF_COVERAGE' ||
    quoteError?.code === 'DISTANCE_EXCEEDED';

  const addressHeading = selectedAddress
    ? `Delivering to ${selectedAddress.label || 'Home'}`
    : 'Delivery Address';

  const addressDescription = selectedAddress
    ? [selectedAddress.houseNumber, selectedAddress.street, selectedAddress.landmark, selectedAddress.city, selectedAddress.pincode]
        .filter(Boolean)
        .join(', ')
    : addresses.length === 0
      ? 'Add an address to continue.'
      : 'Select an address from your address book.';

  const handlePlaceOrder = async () => {

    if (etaState === 'OUT_OF_COVERAGE') {
      Alert.alert(
        'Service Unavailable',
        'Delivery is not available at your location.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (currentOrder !== null) {
      Alert.alert('Let your first order to be delivered');
      return;
    }

    if (quoteError?.code === 'DISTANCE_EXCEEDED') {
      Alert.alert(
        'Out of coverage',
        quoteError?.message ||
          'Delivery is currently unavailable for your address.',
      );
      return;
    }

    if (isQuoteDisabled || !branchId) {
      Alert.alert(
        'Select Address',
        'Please set a delivery address to calculate delivery fees before placing the order.',
      );
      return;
    }

    const formattedData = cart.map(item => ({
      id: item._id,
      item: item._id,
      count: item.count,
    }));

    if (formattedData.length === 0) {
      Alert.alert('Add any items to place order');
      return;
    }

    setLoading(true);

    // Try to reuse selected address or cached delivery location first
    let deliveryLocation: DeliveryLocation | null = selectedAddress
      ? {
          latitude: selectedAddress.latitude,
          longitude: selectedAddress.longitude,
        }
      : deliveryLocationState;

    if (!deliveryLocation && user?.address?.latitude && user?.address?.longitude) {
      deliveryLocation = {
        latitude: user.address.latitude,
        longitude: user.address.longitude,
      };
    }

    if (!deliveryLocation) {
      // If no location in user state, try to get current location
      try {
        deliveryLocation = await getValidatedDeliveryLocation();
      } catch (error) {
        console.error('Error getting current location:', error);
      }
    }

    if (!deliveryLocation) {
      Alert.alert(
        'Location Required',
        'Please enable location services or update your address to place an order.',
        [{ text: 'OK' }]
      );
      setLoading(false);
      return;
    }

    if (!deliveryLocationState && deliveryLocation) {
      setDeliveryLocationState(deliveryLocation);
    }

    const data = await createOrder(
      formattedData,
      totalItemPrice,
      deliveryLocation,
      branchId,
      selectedAddress?._id || null,
    );

    if (data != null) {
      setCurrentOrder(data);
      clearCart();
      navigate('OrderSuccess', { ...data });
    } else {
      Alert.alert(
        'Order Failed',
        'Unable to place your order. Please check your location and try again.',
        [{ text: 'OK' }]
      );
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Checkout" hideBack />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.secondary}
          />
        }>
        <OrderList etaText={etaText} />

        <View style={styles.flexRowBetween}>
          <View style={styles.flexRow}>
            <Image
              source={require('@assets/icons/coupon.png')}
              style={styles.couponIcon}
            />
            <CustomText variant="h6" fontFamily={Fonts.SemiBold}>
              Use Coupons
            </CustomText>
          </View>
          <Icon name="chevron-right" size={RFValue(16)} color={Colors.text} />
        </View>

        <BillDetails
          totalItemPrice={totalItemPrice}
          quote={quote}
          isLoading={isQuoteLoading}
          errorMessage={quoteInfoMessage}
        />

        <View style={styles.flexRowBetween}>
          <View>
            <CustomText variant="h8" fontFamily={Fonts.SemiBold}>
              Cancellation Policy
            </CustomText>
            <CustomText
              variant="h9"
              style={styles.cancelText}
              fontFamily={Fonts.SemiBold}>
              Orders cannot be cancelled once packed for delivery, In case of
              unexpected delays, refund will be provided, if applicable
            </CustomText>
          </View>
        </View>
      </ScrollView>

      <View style={hocStyles.cartContainer}>
        <View style={styles.absoluteContainer}>
          <View style={styles.addressContainer}>
            <View style={styles.flexRow}>
              <Image
                source={require('@assets/icons/home.png')}
                style={styles.homeIcon}
              />
              <View style={styles.addressTextContainer}>
                <CustomText variant="h8" fontFamily={Fonts.Medium}>
                  {addressHeading}
                </CustomText>
                <CustomText
                  variant="h9"
                  numberOfLines={2}
                  style={styles.addressText}>
                  {addressLoading ? 'Loading addresses...' : addressDescription}
                </CustomText>
              </View>
            </View>

            <TouchableOpacity onPress={() => navigate('AddressBookScreen')}>
              <CustomText
                variant="h8"
                style={{ color: Colors.secondary }}
                fontFamily={Fonts.Medium}>
                {addresses.length ? 'Change' : 'Add'}
              </CustomText>
            </TouchableOpacity>
          </View>

          {branchDisplay && etaState === 'SUCCESS' && (
            <CustomText
              variant="h9"
              style={styles.branchText}
              fontFamily={Fonts.Medium}>
              {`Order fulfilled by ${branchDisplay}`}
            </CustomText>
          )}

          <View style={styles.paymentGateway}>
            <View style={styles.paymentInfo}>
              <CustomText fontSize={RFValue(6)} fontFamily={Fonts.Regular}>
                PAY USING
              </CustomText>
              <CustomText
                fontFamily={Fonts.Regular}
                variant="h9"
                style={styles.paymentMethod}>
                Cash on Delivery
              </CustomText>
            </View>

            <View style={styles.orderButtonContainer}>
              <ArrowButton
                loading={loading}
                disabled={isPlaceOrderDisabled}
                price={grandTotal}
                title="Place Order"
                onPress={handlePlaceOrder}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 10,
    paddingBottom: 250,
  },
  cancelText: {
    marginTop: 4,
    opacity: 0.6,
  },
  flexRowBetween: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    flexDirection: 'row',
    borderRadius: 15,
  },
  flexRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  paymentGateway: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 14,
    paddingTop: 10,
  },
  addressContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderBottomWidth: 0.7,
    borderColor: Colors.border,
  },
  absoluteContainer: {
    marginVertical: 15,
    marginBottom: Platform.OS === 'ios' ? 30 : 10,
  },
  couponIcon: {
    width: 25,
    height: 25,
  },
  homeIcon: {
    width: 20,
    height: 20,
  },
  addressTextContainer: {
    width: '75%',
  },
  addressText: {
    opacity: 0.6,
  },
  paymentInfo: {
    width: '30%',
  },
  paymentMethod: {
    marginTop: 2,
  },
  orderButtonContainer: {
    width: '70%',
  },
  coverageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  coverageBannerSafe: {
    backgroundColor: '#E6F5EC',
  },
  coverageBannerDanger: {
    backgroundColor: '#FDEAEA',
  },
  coverageBannerText: {
    flex: 1,
    marginLeft: 4,
    color: Colors.text,
  },
  branchText: {
    marginTop: 6,
    color: Colors.text,
    opacity: 0.8,
  },
});

export default ProductOrder;
