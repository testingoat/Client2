import CustomText from '@components/ui/CustomText';
import { useNavigationState } from '@react-navigation/native';
import { SOCKET_URL } from '@service/config';
import { getOrderById } from '@service/orderService';
import { useAuthStore } from '@state/authStore';
import { hocStyles } from '@styles/GlobalStyles';
import { Colors, Fonts } from '@utils/Constants';
import { navigate } from '@utils/NavigationUtils';
import { FC, useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { io } from 'socket.io-client';
import React from 'react';

// Safe wrapper to prevent string children from causing crashes
const safeWrap = (children: any) =>
  React.Children.map(children, (child) =>
    typeof child === "string" || typeof child === "number"
      ? <CustomText>{child}</CustomText>
      : child
  );

const withLiveStatus = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
): FC<P> => {
  const WithLiveStatusComponent: FC<P> = props => {
    const { currentOrder, setCurrentOrder } = useAuthStore();
    const routeName = useNavigationState(
      state => state.routes[state.index]?.name,
    );

    if (__DEV__) {
      console.log("🚨 withLiveStatus rendering, currentOrder:", currentOrder?.status);
      console.log("🚨 withLiveStatus props:", typeof props, props);
      console.log("🚨 withLiveStatus routeName:", routeName);
      console.log("🚨 withLiveStatus WrappedComponent:", WrappedComponent);
    }

    const fetchOrderDetails = async () => {
      const data = await getOrderById(currentOrder?._id as any);
      setCurrentOrder(data);
    };

    const getStatusLabel = (status?: string) => {
      switch (status) {
        case 'pending_seller_approval':
          return 'Waiting for store confirmation';
        case 'available':
        case 'confirmed':
          return 'Order accepted';
        case 'arriving':
          return 'On the way';
        case 'delivered':
          return 'Order delivered';
        default:
          return 'Processing your order';
      }
    };

    useEffect(() => {
      if (currentOrder) {
        const socketInstance = io(SOCKET_URL, {
          transports: ['websocket'],
          withCredentials: true,
        });
        socketInstance.emit('joinRoom', currentOrder?._id);

        socketInstance?.on('liveTrackingUpdates', updatedOrder => {
          fetchOrderDetails();
          if (__DEV__) {
            console.log('RECEIVING LIVE UPDATES 🔴');
          }
        });

        socketInstance.on('orderConfirmed', confirmOrder => {
          fetchOrderDetails();
          if (__DEV__) {
            console.log('ORDER CONFIRMATION LIVE UPDATES🔴');
          }
        });

        socketInstance.on('orderAccepted', acceptedOrder => {
          fetchOrderDetails();
          if (__DEV__) {
            console.log('ORDER ACCEPTED LIVE UPDATE');
          }
        });

        return () => {
          socketInstance.disconnect();
        };
      }
    }, [currentOrder]);

    return (
      <View style={styles.container}>
        {safeWrap(<WrappedComponent {...props} />)}

        {currentOrder && routeName === 'ProductDashboard' && (
          <View style={styles.floatingCard}>
            <View style={styles.cardContent}>
              <View style={styles.statusSection}>
                <View style={styles.iconWrapper}>
                  <Image
                    source={require('@assets/icons/bucket.png')}
                    style={styles.icon}
                  />
                  {currentOrder?.status === 'pending_seller_approval' && (
                    <View style={styles.loadingBadge}>
                      <ActivityIndicator size={10} color="#fff" />
                    </View>
                  )}
                </View>

                <View style={styles.textContainer}>
                  <CustomText
                    variant="h8"
                    fontFamily={Fonts.Bold}
                    style={styles.statusTitle}>
                    {getStatusLabel(currentOrder?.status)}
                  </CustomText>
                  <CustomText
                    variant="h9"
                    fontFamily={Fonts.Medium}
                    numberOfLines={1}
                    style={styles.itemsText}>
                    {currentOrder?.items && currentOrder.items.length > 0
                      ? (currentOrder.items[0]?.item?.name || 'Unknown Item') +
                      (currentOrder.items.length - 1 > 0
                        ? ` + ${currentOrder.items.length - 1} more`
                        : '')
                      : 'No items'}
                  </CustomText>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigate('LiveTracking')}
                style={styles.trackButton}>
                <CustomText variant="h8" fontFamily={Fonts.SemiBold} style={styles.trackButtonText}>
                  Track
                </CustomText>
              </TouchableOpacity>
            </View>

            {/* Progress Bar Indicator */}
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, {
                width: currentOrder?.status === 'confirmed' ? '50%' :
                  currentOrder?.status === 'arriving' ? '75%' :
                    currentOrder?.status === 'delivered' ? '100%' : '25%',
                backgroundColor: currentOrder?.status === 'pending_seller_approval' ? Colors.secondary : '#4CAF50'
              }]} />
            </View>
          </View>
        )}
      </View>
    );
  };

  return WithLiveStatusComponent;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    backgroundColor: '#F5F5F5',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  icon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  loadingBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.secondary,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  statusTitle: {
    color: '#333',
    marginBottom: 2,
  },
  itemsText: {
    color: '#888',
  },
  trackButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  trackButtonText: {
    color: '#fff',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default withLiveStatus;
