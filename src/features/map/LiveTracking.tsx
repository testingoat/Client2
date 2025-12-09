import { View, Text, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@state/authStore';
import { getOrderById } from '@service/orderService';
import { Colors, Fonts } from '@utils/Constants';
import LiveHeader from './LiveHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomText from '@components/ui/CustomText';
import OrderSummary from './OrderSummary';
import DeliveryDetails from './DeliveryDetails';
import LiveMap from './LiveMap';
import OrderProgressTimeline from './OrderProgressTimeline';
import CustomButton from '@components/ui/CustomButton';
import { calculateDistance, calculateETA, formatETATime } from '@utils/etaCalculator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LiveTracking = () => {
  const { currentOrder, setCurrentOrder, user } = useAuthStore();
  const [dynamicETA, setDynamicETA] = useState<string>('');
  const insets = useSafeAreaInsets();

  const fetchOrderDetails = async () => {
    const data = await getOrderById(currentOrder?._id as any);
    setCurrentOrder(data);
  };

  // Calculate dynamic ETA based on delivery person location and customer location
  const calculateDynamicETA = () => {
    try {
      if (currentOrder?.deliveryPersonLocation && currentOrder?.deliveryLocation) {
        const distance = calculateDistance(
          currentOrder.deliveryPersonLocation.latitude,
          currentOrder.deliveryPersonLocation.longitude,
          currentOrder.deliveryLocation.latitude,
          currentOrder.deliveryLocation.longitude
        );

        // Adjust speed based on order status
        let averageSpeed = 30; // Default speed in km/h
        if (currentOrder.status === 'confirmed') {
          averageSpeed = 40; // Faster when going to pickup
        } else if (currentOrder.status === 'arriving') {
          averageSpeed = 25; // Slower when delivering (traffic, finding location)
        }

        const etaMinutes = calculateETA(distance, averageSpeed);
        const formattedETA = formatETATime(etaMinutes);
        setDynamicETA(formattedETA);
      }
    } catch (error) {
      console.log('ETA calculation error:', error);
      setDynamicETA('');
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  // Update ETA every 30 seconds
  useEffect(() => {
    calculateDynamicETA();
    const interval = setInterval(calculateDynamicETA, 30000);
    return () => clearInterval(interval);
  }, [currentOrder?.deliveryPersonLocation, currentOrder?.deliveryLocation, currentOrder?.status]);

  let msg = 'Packing your order';
  let time = dynamicETA ? `Arriving in ${dynamicETA}` : 'Arriving in 10 minutes';

  if (currentOrder?.status == 'confirmed') {
    msg = 'Delivery partner assigned';
    time = dynamicETA ? `Arriving in ${dynamicETA}` : 'Arriving in 8 minutes';
  } else if (currentOrder?.status == 'arriving') {
    msg = 'Order picked up - On the way';
    time = dynamicETA ? `Arriving in ${dynamicETA}` : 'Arriving in 6 minutes';
  } else if (currentOrder?.status == 'delivered') {
    msg = 'Order Delivered';
    time = 'Fastest Delivery ⚡️';
  }

  // Handle calling delivery partner
  const handleCallDeliveryPartner = () => {
    if (currentOrder?.deliveryPartner?.phone) {
      const phoneNumber = `tel:${currentOrder.deliveryPartner.phone}`;
      Linking.openURL(phoneNumber).catch(() => {
        Alert.alert('Error', 'Unable to make phone call');
      });
    } else {
      Alert.alert('Info', 'Delivery partner not assigned yet');
    }
  };

  // Handle messaging delivery partner
  const handleMessageDeliveryPartner = () => {
    if (currentOrder?.deliveryPartner?.phone) {
      const smsUrl = `sms:${currentOrder.deliveryPartner.phone}`;
      Linking.openURL(smsUrl).catch(() => {
        Alert.alert('Error', 'Unable to open messaging app');
      });
    } else {
      Alert.alert('Info', 'Delivery partner not assigned yet');
    }
  };

  return (
    <View style={styles.container}>
      <LiveHeader
        type="Customer"
        title={msg}
        secondTitle={time}
        eta={dynamicETA}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 150 + insets.bottom }]}>

        {/* Order Progress Timeline */}
        <OrderProgressTimeline currentStatus={currentOrder?.status || 'available'} />

        <LiveMap
          deliveryLocation={currentOrder?.deliveryLocation}
          pickupLocation={currentOrder?.pickupLocation}
          deliveryPersonLocation={currentOrder?.deliveryPersonLocation}
          hasAccepted={currentOrder?.status == 'confirmed'}
          hasPickedUp={currentOrder?.status == 'arriving'}
        />

        {/* Delivery Partner Information */}
        <View style={styles.flexRow}>
          <View style={styles.iconContainer}>
            <Icon
              name={currentOrder?.deliveryPartner ? 'account' : 'shopping'}
              color={Colors.disabled}
              size={RFValue(20)}
            />
          </View>
          <View style={{ width: '82%' }}>
            <CustomText
              numberOfLines={1}
              variant="h7"
              fontFamily={Fonts.SemiBold}>
              {currentOrder?.deliveryPartner?.name ||
                'We will soon assign delivery partner'}
            </CustomText>

            {currentOrder?.deliveryPartner && (
              <CustomText variant="h7" fontFamily={Fonts.Medium}>
                ({currentOrder?.deliveryPartner?.phone})
              </CustomText>
            )}

            <CustomText variant="h9" fontFamily={Fonts.Medium}>
              {currentOrder?.deliveryPartner
                ? 'Your delivery partner - Contact for delivery instructions'
                : msg}
            </CustomText>
          </View>
        </View>

        {/* Contact Delivery Partner Buttons */}
        {currentOrder?.deliveryPartner && (
          <View style={styles.contactButtonsContainer}>
            <CustomButton
              title="📞 Call Partner"
              onPress={handleCallDeliveryPartner}
              style={[styles.contactButton, styles.callButton]}
              textStyle={styles.contactButtonText}
            />
            <CustomButton
              title="💬 Message Partner"
              onPress={handleMessageDeliveryPartner}
              style={[styles.contactButton, styles.messageButton]}
              textStyle={styles.contactButtonText}
            />
          </View>
        )}

        {/* Order Value Display */}
        <View style={styles.flexRow}>
          <View style={styles.iconContainer}>
            <Icon
              name="currency-inr"
              color={Colors.disabled}
              size={RFValue(20)}
            />
          </View>
          <View style={{ width: '82%' }}>
            <CustomText variant="h7" fontFamily={Fonts.SemiBold}>
              Order Total: ₹{currentOrder?.totalPrice || 0}
            </CustomText>
            <CustomText variant="h9" fontFamily={Fonts.Medium}>
              {currentOrder?.status === 'delivered'
                ? 'Payment completed successfully'
                : 'Payment will be collected on delivery'}
            </CustomText>
          </View>
        </View>

        <DeliveryDetails details={currentOrder?.customer} />

        <OrderSummary order={currentOrder} />

        {/* Delivery Instructions */}
        <View style={styles.flexRow}>
          <View style={styles.iconContainer}>
            <Icon
              name="information-outline"
              color={Colors.disabled}
              size={RFValue(20)}
            />
          </View>

          <View style={{ width: '82%' }}>
            <CustomText variant="h7" fontFamily={Fonts.SemiBold}>
              Delivery Instructions
            </CustomText>
            <CustomText variant="h9" fontFamily={Fonts.Medium}>
              Please ensure someone is available at the delivery location.
              Contact your delivery partner if you need to provide specific instructions.
            </CustomText>
          </View>
        </View>

        {/* App Feedback */}
        <View style={styles.flexRow}>
          <View style={styles.iconContainer}>
            <Icon
              name="cards-heart-outline"
              color={Colors.disabled}
              size={RFValue(20)}
            />
          </View>

          <View style={{ width: '82%' }}>
            <CustomText variant="h7" fontFamily={Fonts.SemiBold}>
              Enjoying our service?
            </CustomText>
            <CustomText variant="h9" fontFamily={Fonts.Medium}>
              Rate us on the app store and share your experience with friends!
            </CustomText>
          </View>
        </View>

        <CustomText
          fontFamily={Fonts.SemiBold}
          variant="h6"
          style={{ opacity: 0.6, marginTop: 20 }}>
          Goat - Meat you Fresh everytime
        </CustomText>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
  scrollContent: {
    paddingBottom: 150,
    backgroundColor: Colors.backgroundSecondary,
    padding: 15,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    borderRadius: 15,
    marginTop: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 0.7,
    borderColor: Colors.border,
  },
  iconContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 100,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 10,
  },
  contactButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  callButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.secondary,
  },
  messageButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.secondary,
  },
  contactButtonText: {
    color: Colors.secondary,
    fontSize: RFValue(12),
    fontFamily: Fonts.SemiBold,
  },
});

export default LiveTracking;
