import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { FC } from 'react';
import { useAuthStore } from '@state/authStore';
import { navigate } from '@utils/NavigationUtils';
import Icon from 'react-native-vector-icons/Ionicons';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomText from '@components/ui/CustomText';
import { Fonts } from '@utils/Constants';

const LiveHeader: FC<{
  type: 'Customer' | 'Delivery';
  title: string;
  secondTitle?: string;
  eta?: string;
  hideBack?: boolean;
}> = ({ title, type, secondTitle, eta, hideBack }) => {
  const isCustomer = type === 'Customer';

  const { currentOrder, setCurrentOrder } = useAuthStore();

  // Determine which text to display - dynamic ETA or fallback to secondTitle
  const displayText = eta ? `Delivery in ${eta}` : (secondTitle || 'Delivery in 10 minutes');

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
      {!hideBack && (
        <Pressable
          style={[styles.backButton, { top: insets.top + 10 }]}
          onPress={() => {
            if (isCustomer) {
              navigate('MainStack');
              if (currentOrder?.status == 'delivered') {
                setCurrentOrder(null);
              }
              return;
            }
            navigate('DeliveryDashboard');
          }}>
          <Icon
            name="chevron-back"
            size={RFValue(16)}
            color={isCustomer ? '#fff' : '#000'}
          />
        </Pressable>
      )}

      <CustomText
        variant="h8"
        fontFamily={Fonts.Medium}
        style={isCustomer ? styles.titleTextWhite : styles.titleTextBlack}>
        {title}
      </CustomText>

      <CustomText
        variant="h4"
        fontFamily={Fonts.SemiBold}
        style={isCustomer ? styles.titleTextWhite : styles.titleTextBlack}>
        {displayText}
      </CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: 'center',
    paddingBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    justifyContent: 'center',
    zIndex: 1,
  },
  titleTextBlack: {
    color: 'black',
    textAlign: 'center',
  },
  titleTextWhite: {
    color: 'white',
    textAlign: 'center',
  },
});

export default LiveHeader;