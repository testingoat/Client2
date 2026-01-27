import { View, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import React, { FC, useEffect, useRef } from 'react';
import { Colors, Fonts } from '@utils/Constants';
import CustomText from '@components/ui/CustomText';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RFValue } from 'react-native-responsive-fontsize';
import type { DeliveryQuoteResponse } from '@service/orderService';
import { formatINRCurrency } from '@utils/currency';

const ReportItem: FC<{
  iconName: string;
  underline?: boolean;
  title: string;
  price: number;
  isDiscount?: boolean;
}> = ({ iconName, underline, title, price, isDiscount }) => {
  return (
    <View style={[styles.flexRowBetween, { marginBottom: 10 }]}>
      <View style={styles.flexRow}>
        <Icon
          name={iconName}
          style={{ opacity: 0.7 }}
          size={RFValue(12)}
          color={isDiscount ? Colors.secondary : Colors.text}
        />
        <CustomText
          style={{
            textDecorationLine: underline ? 'underline' : 'none',
            textDecorationStyle: 'dashed',
            color: isDiscount ? Colors.secondary : Colors.text,
          }}
          variant="h8">
          {title}
        </CustomText>
      </View>
      <CustomText
        variant="h8"
        style={{ color: isDiscount ? Colors.secondary : Colors.text }}
      >
        {isDiscount ? `- ${formatINRCurrency(price)}` : formatINRCurrency(price)}
      </CustomText>
    </View>
  );
};

// Animated Discount Row Component
const DiscountItem: FC<{
  title: string;
  discount: number;
}> = ({ title, discount }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animValue, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animValue, scaleValue]);

  return (
    <Animated.View
      style={[
        styles.discountRow,
        {
          opacity: animValue,
          transform: [{ scale: scaleValue }],
        }
      ]}
    >
      <View style={styles.flexRow}>
        <Icon
          name="local-offer"
          size={RFValue(12)}
          color={Colors.secondary}
        />
        <CustomText variant="h8" style={styles.discountText}>
          {title}
        </CustomText>
      </View>
      <CustomText variant="h8" fontFamily={Fonts.SemiBold} style={styles.discountAmount}>
        - {formatINRCurrency(discount)}
      </CustomText>
    </Animated.View>
  );
};

interface BillDetailsProps {
  totalItemPrice: number;
  quote: DeliveryQuoteResponse | null;
  isLoading: boolean;
  errorMessage?: string | null;
  couponDiscount?: number;
  couponCode?: string;
}

const BillDetails: FC<BillDetailsProps> = ({
  totalItemPrice,
  quote,
  isLoading,
  errorMessage,
  couponDiscount = 0,
  couponCode,
}) => {
  const baseFare = quote?.breakdown.base_fare ?? 0;
  const distanceSurcharge = quote?.breakdown.distance_surcharge ?? 0;
  const smallOrderFee = quote?.breakdown.small_order_surcharge ?? 0;

  const deliveryFee = quote ? quote.final_fee : 0;
  const grandTotal = totalItemPrice + (quote ? deliveryFee : 0) - couponDiscount;

  const showPlaceholder = !quote && !isLoading && !errorMessage;

  return (
    <View style={styles.container}>
      <CustomText style={styles.text} fontFamily={Fonts.SemiBold}>
        Bill Details
      </CustomText>

      <View style={styles.billContainer}>
        <ReportItem
          iconName="article"
          title="Items total"
          price={totalItemPrice}
        />

        {isLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={Colors.secondary} />
            <CustomText variant="h9" style={{ marginLeft: 6 }}>
              Calculating delivery charges...
            </CustomText>
          </View>
        )}

        {quote && (
          <>
            <ReportItem
              iconName="pedal-bike"
              title="Base delivery fare"
              price={baseFare}
            />
            <ReportItem
              iconName="timeline"
              title={`Distance & surge (${quote.breakdown.distance_km ?? 0} km)`}
              price={distanceSurcharge}
            />
            {smallOrderFee > 0 && (
              <ReportItem
                iconName="shopping-bag"
                title="Small order fee"
                price={smallOrderFee}
              />
            )}
          </>
        )}

        {/* Coupon Discount Row - Shows when coupon is applied */}
        {couponDiscount > 0 && couponCode && (
          <DiscountItem
            title={`Coupon (${couponCode})`}
            discount={couponDiscount}
          />
        )}

        {showPlaceholder && (
          <CustomText variant="h9" style={styles.placeholderText}>
            Add a delivery address to view live delivery fees.
          </CustomText>
        )}

        {errorMessage ? (
          <CustomText variant="h9" style={styles.errorText}>
            {errorMessage}
          </CustomText>
        ) : null}
      </View>

      {/* Savings Banner - Shows when coupon is applied */}
      {couponDiscount > 0 && (
        <View style={styles.savingsBanner}>
          <Icon name="celebration" size={16} color={Colors.secondary} />
          <CustomText variant="h9" fontFamily={Fonts.Medium} style={styles.savingsText}>
            You're saving {formatINRCurrency(couponDiscount)} on this order! 🎉
          </CustomText>
        </View>
      )}

      <View style={[styles.flexRowBetween, { marginBottom: 15 }]}>
        <CustomText
          variant="h7"
          style={styles.text}
          fontFamily={Fonts.SemiBold}>
          Grand Total
        </CustomText>
        <View style={styles.totalContainer}>
          {couponDiscount > 0 && (
            <CustomText variant="h9" style={styles.originalPrice}>
              {formatINRCurrency(totalItemPrice + deliveryFee)}
            </CustomText>
          )}
          <CustomText style={styles.text} fontFamily={Fonts.SemiBold}>
            {formatINRCurrency(grandTotal > 0 ? grandTotal : 0)}
          </CustomText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginVertical: 15,
  },
  text: {
    marginHorizontal: 10,
    marginTop: 15,
  },
  billContainer: {
    padding: 10,
    paddingBottom: 0,
    borderBottomColor: Colors.border,
    borderBottomWidth: 0.7,
  },
  flexRowBetween: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  placeholderText: {
    opacity: 0.65,
    marginVertical: 8,
  },
  errorText: {
    marginVertical: 6,
    color: '#AB1C2E',
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#e8f5e9',
    padding: 8,
    borderRadius: 8,
    marginHorizontal: -2,
  },
  discountText: {
    color: Colors.secondary,
  },
  discountAmount: {
    color: Colors.secondary,
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 10,
    marginTop: 12,
    borderRadius: 8,
    gap: 6,
  },
  savingsText: {
    color: Colors.secondary,
    flex: 1,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
    marginRight: 10,
  },
});

export default BillDetails;
