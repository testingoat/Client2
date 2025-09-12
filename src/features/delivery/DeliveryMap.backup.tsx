import {View, Text, StyleSheet, ScrollView, ActivityIndicator, Linking} from 'react-native';
import React, {useEffect, useState} from 'react';
import LiveHeader from '@features/map/LiveHeader';
import LiveMap from '@features/map/LiveMap';
import DeliveryDetails from '@features/map/DeliveryDetails';
import OrderSummary from '@features/map/OrderSummary';
import CustomButton from '@components/ui/CustomButton';
import {useAuthStore} from '@state/authStore';
import {useMapStore} from '@state/mapStore';
import {confirmOrder, sendLiveOrderUpdates} from '@service/orderService';
import {Colors, Fonts} from '@utils/Constants';
import {RFValue} from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '@components/ui/CustomText';
import CustomDialog from '@components/ui/CustomDialog';
import {hocStyles} from '@styles/GlobalStyles';
import {useRoute} from '@react-navigation/native';
import OrderProgressTimeline from '@features/map/OrderProgressTimeline';
import {calculateDistance, calculateETA, formatETATime} from '@utils/etaCalculator';

const DeliveryMap = () => {
  const route = useRoute<any>();
  const {user, setCurrentOrder} = useAuthStore();
  const {orderData, loading, fetchOrderDetailsById, myLocation, watchLocation, setOrderData} = useMapStore();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState<'success' | 'info' | 'confirmation' | 'error'>('info');
  const [eta, setEta] = useState<string>('10 minutes'); // Default to 10 minutes

  useEffect(() => {
    if (__DEV__) {
      console.log('📍 DeliveryMap mounted');
    }
    // Initialize order data from route params if available
    if (route.params) {
      if (__DEV__) {
        console.log('📍 Route params received');
      }
      // If we have an order ID, fetch the latest order details
      if (route.params._id) {
        fetchOrderDetailsById(route.params._id);
      } else {
        // Otherwise, use the route params directly
        setOrderData(route.params);
      }
    }
    
    // Start watching location when component mounts
    const cleanup = watchLocation();
    
    // Cleanup function to stop watching location when component unmounts
    return () => {
      if (__DEV__) {
        console.log('📍 DeliveryMap unmounting');
      }
      cleanup();
    };
  }, []);

  // Reduce logging frequency for location updates
  useEffect(() => {
    if (__DEV__ && myLocation) {
      console.log('📍 myLocation updated');
    }
  }, [myLocation]);

  // Reduce logging frequency for order data updates
  useEffect(() => {
    if (__DEV__ && orderData) {
      console.log('📍 orderData updated');
    }
  }, [orderData]);

  // Calculate dynamic ETA based on location data
  useEffect(() => {
    const calculateDynamicETA = () => {
      try {
        // Only calculate ETA if we have the necessary data
        if (myLocation && orderData?.deliveryLocation && orderData?.status !== 'delivered') {
          const { latitude: userLat, longitude: userLon } = myLocation;
          const { latitude: destLat, longitude: destLon } = orderData.deliveryLocation;
          
          // Calculate distance in kilometers
          const distance = calculateDistance(userLat, userLon, destLat, destLon);
          
          // Adjust average speed based on order status
          // Higher speed when picking up order (40 km/h), slower when delivering (30 km/h)
          const averageSpeed = orderData?.status === 'confirmed' ? 40 : 30;
          
          // Calculate ETA in minutes
          const etaMinutes = calculateETA(distance, averageSpeed);
          
          // Format the ETA time
          const formattedETA = formatETATime(etaMinutes);
          
          // Update state with the formatted ETA
          setEta(formattedETA);
          
          if (__DEV__) {
            console.log(`📍 ETA Calculation - Distance: ${distance.toFixed(2)}km, Speed: ${averageSpeed}km/h, ETA: ${formattedETA}`);
          }
        } else {
          // Fallback to default if we don't have the necessary data
          setEta('10 minutes');
        }
      } catch (error) {
        if (__DEV__) {
          console.log('📍 Error calculating ETA:', error);
        }
        // Fallback to default if there's an error
        setEta('10 minutes');
      }
    };

    // Calculate ETA immediately
    calculateDynamicETA();
    
    // Set up interval to recalculate ETA every 30 seconds
    const intervalId = setInterval(calculateDynamicETA, 30000);
    
    // Clean up interval on component unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [myLocation, orderData]);

  const showDialog = (title: string, message: string, type: 'success' | 'info' | 'confirmation' | 'error' = 'info') => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogType(type);
    setDialogVisible(true);
  };

  const acceptOrder = async () => {
    if (__DEV__) {
      console.log('📍 Accepting order');
    }
    const data = await confirmOrder(orderData?._id, myLocation);
    if (data) {
      setCurrentOrder(data);
      setOrderData(data); // Update local state as well
      showDialog('Order Accepted', 'Grab your package', 'confirmation');
    } else {
      showDialog('Error', 'There was an error', 'error');
    }
    // Refresh order data
    if (orderData?._id) {
      fetchOrderDetailsById(orderData._id);
    }
  };

  const orderPickedUp = async () => {
    if (__DEV__) {
      console.log('📍 Order picked up');
    }
    const data = await sendLiveOrderUpdates(
      orderData?._id,
      myLocation,
      'arriving',
    );
    if (data) {
      setCurrentOrder(data);
      setOrderData(data); // Update local state as well
      showDialog('Order Picked Up', "Let's deliver it as soon as possible", 'success');
    } else {
      showDialog('Error', 'There was an error', 'error');
    }
    // Refresh order data
    if (orderData?._id) {
      fetchOrderDetailsById(orderData._id);
    }
  };

  const orderDelivered = async () => {
    if (__DEV__) {
      console.log('📍 Order delivered');
    }
    const data = await sendLiveOrderUpdates(
      orderData?._id,
      myLocation,
      'delivered',
    );
    if (data) {
      setCurrentOrder(null);
      setOrderData(null); // Clear local state as well
      showDialog('Order Delivered', 'Woohoo! You made it 🎉', 'success');
    } else {
      showDialog('Error', 'There was an error', 'error');
    }
    // Refresh order data
    if (orderData?._id) {
      fetchOrderDetailsById(orderData._id);
    }
  };

  // Customer interaction functions
  const callCustomer = () => {
    const phoneNumber = orderData?.customer?.phone;
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const messageCustomer = () => {
    const phoneNumber = orderData?.customer?.phone;
    if (phoneNumber) {
      Linking.openURL(`sms:${phoneNumber}`);
    }
  };

  // Calculate earnings (delivery fee is assumed to be ₹29 based on BillDetails)
  const calculateEarnings = () => {
    // Based on the BillDetails component, delivery charge is ₹29
    return 29;
  };

  let message = 'Start this order';
  if (
    orderData?.deliveryPartner?._id == user?._id &&
    orderData?.status === 'confirmed'
  ) {
    message = 'Grab your order';
  } else if (
    orderData?.deliveryPartner?._id == user?._id &&
    orderData?.status === 'arriving'
  ) {
    message = 'Complete your order';
  } else if (
    orderData?.deliveryPartner?._id == user?._id &&
    orderData?.status === 'delivered'
  ) {
    message = 'Your milestone';
  } else if (
    orderData?.deliveryPartner?._id != user?._id &&
    orderData?.status != 'available'
  ) {
    message = 'You missed it!';
  }

  useEffect(() => {
    async function sendLiveUpdates() {
      if (
        orderData?.deliveryPartner?._id == user?._id &&
        orderData?.status != 'delivered' &&
        orderData?.status != 'cancelled'
      ) {
        if (__DEV__) {
          console.log('📍 Sending live updates');
        }
        await sendLiveOrderUpdates(
          orderData._id,
          myLocation,
          orderData?.status,
        );
        // Refresh order data
        if (orderData?._id) {
          fetchOrderDetailsById(orderData._id);
        }
      }
    }
    sendLiveUpdates();
  }, [myLocation]);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <ActivityIndicator color="#000" size="small" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LiveHeader
        type="Delivery"
        title={message}
        eta={eta} // Pass dynamic ETA instead of static text
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Order Progress Timeline */}
        <OrderProgressTimeline currentStatus={orderData?.status} />
        
        {orderData?.deliveryLocation && orderData?.pickupLocation && (
          <LiveMap
            deliveryPersonLocation={
              orderData?.deliveryPersonLocation || myLocation
            }
            deliveryLocation={orderData?.deliveryLocation || null}
            hasAccepted={
              orderData?.deliveryPartner?._id == user?._id &&
              orderData?.status == 'confirmed'
            }
            hasPickedUp={orderData?.status == 'arriving'}
            pickupLocation={orderData?.pickupLocation || null}
          />
        )}

        <DeliveryDetails details={orderData?.customer} />
        
        {/* Customer Interaction Buttons */}
        <View style={styles.customerInteractionContainer}>
          <CustomButton
            title="📞 Call Customer"
            onPress={callCustomer}
            isOutlined
            textStyle={{color: '#fff'}}
            style={styles.customerButton}
          />
          <CustomButton
            title="💬 Message Customer"
            onPress={messageCustomer}
            isOutlined
            textStyle={{color: '#fff'}}
            style={styles.customerButton}
          />
        </View>
        
        <OrderSummary order={orderData} />

        {/* Earnings Display */}
        <View style={styles.earningsContainer}>
          <View style={styles.earningsHeader}>
            <Icon name="currency-inr" size={RFValue(20)} color="#000" />
            <CustomText variant="h7" fontFamily={Fonts.SemiBold}>
              Your Earnings
            </CustomText>
          </View>
          <CustomText variant="h5" fontFamily={Fonts.Bold} style={styles.earningsAmount}>
            ₹{calculateEarnings()}
          </CustomText>
          <CustomText variant="h9" fontFamily={Fonts.Medium} style={styles.earningsText}>
            for this delivery
          </CustomText>
        </View>

        <View style={styles.flexRow}>
          <View style={styles.iconContainer}>
            <Icon
              name="cards-heart-outline"
              color={Colors.disabled}
              size={RFValue(20)}
            />
          </View>

          <View style={{width: '82%'}}>
            <CustomText variant="h7" fontFamily={Fonts.SemiBold}>
              Do you like our app?
            </CustomText>
            <CustomText variant="h9" fontFamily={Fonts.Medium}>
              Hit Like and subscribe button! If you are enjoying comment your
              excitement
            </CustomText>
          </View>
        </View>

        <CustomText
          fontFamily={Fonts.SemiBold}
          variant="h6"
          style={{opacity: 0.6, marginTop: 20}}>
          Ritik Prasad x Grocery Delivery App
        </CustomText>
      </ScrollView>

      {orderData?.status != 'delivered' && orderData?.status != 'cancelled' && (
        <View style={[hocStyles.cartContainer, styles.btnContainer]}>
          {orderData?.status == 'available' && (
            <CustomButton
              disabled={false}
              title="Accept Order"
              onPress={acceptOrder}
              loading={false}
            />
          )}
          {orderData?.status == 'confirmed' &&
            orderData?.deliveryPartner?._id === user?._id && (
              <CustomButton
                disabled={false}
                title="Order Picked Up"
                onPress={orderPickedUp}
                loading={false}
              />
            )}

          {orderData?.status == 'arriving' &&
            orderData?.deliveryPartner?._id === user?._id && (
              <CustomButton
                disabled={false}
                title="Delivered"
                onPress={orderDelivered}
                loading={false}
              />
            )}
        </View>
      )}

      <CustomDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        title={dialogTitle}
        message={dialogMessage}
        type={dialogType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    paddingBottom: 150,
    backgroundColor: Colors.backgroundSecondary,
    padding: 15,
  },
  btnContainer: {
    padding: 10,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginVertical: 15,
  },
  iconContainer: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 15,
    borderRadius: 100,
  },
  customerInteractionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  customerButton: {
    flex: 0.48,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  earningsContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  earningsAmount: {
    color: Colors.secondary,
    marginTop: 5,
  },
  earningsText: {
    marginTop: 3,
    opacity: 0.7,
  },
});

export default DeliveryMap;