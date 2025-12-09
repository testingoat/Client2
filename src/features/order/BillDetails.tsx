import { View, StyleSheet, ActivityIndicator } from 'react-native';
import React, { FC } from 'react';
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
}> = ({ iconName, underline, title, price }) => {
  return (
    <View style={[styles.flexRowBetween, { marginBottom: 10 }]}>
      <View style={styles.flexRow}>
        <Icon
          name={iconName}
          style={{ opacity: 0.7 }}
          size={RFValue(12)}
          color={Colors.text}
        />
        <CustomText
          style={{
            textDecorationLine: underline ? 'underline' : 'none',
            textDecorationStyle: 'dashed',
          }}
          variant="h8">
          {title}
        </CustomText>
      </View>
      <CustomText variant="h8">{formatINRCurrency(price)}</CustomText>
    </View>
  );
};

interface BillDetailsProps {
  totalItemPrice: number;
  quote: DeliveryQuoteResponse | null;
  isLoading: boolean;
  errorMessage?: string | null;
}

const BillDetails: FC<BillDetailsProps> = ({
  totalItemPrice,
  quote,
  isLoading,
  errorMessage,
}) => {
  const baseFare = quote?.breakdown.base_fare ?? 0;
  const distanceSurcharge = quote?.breakdown.distance_surcharge ?? 0;
  const smallOrderFee = quote?.breakdown.small_order_surcharge ?? 0;

  const deliveryFee = quote ? quote.final_fee : 0;
  const grandTotal = totalItemPrice + (quote ? deliveryFee : 0);

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

      <View style={[styles.flexRowBetween, { marginBottom: 15 }]}>
        <CustomText
          variant="h7"
          style={styles.text}
          fontFamily={Fonts.SemiBold}>
          Grand Total
        </CustomText>
        <CustomText style={styles.text} fontFamily={Fonts.SemiBold}>
          {formatINRCurrency(grandTotal)}
        </CustomText>
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
});

export default BillDetails;
