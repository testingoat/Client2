import { View, StyleSheet } from 'react-native';
import React, { FC } from 'react';
import CustomText from '@components/ui/CustomText';
import { Fonts, Colors } from '@utils/Constants';
import { formatISOToCustom } from '@utils/DateUtils';

interface CartItem {
  _id: string | number;
  item: any;
  count: number;
}

interface Order {
  orderId: string;
  items: CartItem[];
  totalPrice: number;
  createdAt: string;
  status: 'confirmed' | 'completed';
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
    case 'completed':
      return '#4CAF50';
    case 'cancelled':
      return '#F44336';
    default:
      return Colors.secondary;
  }
};

const ProfileOrderItem: FC<{ item: Order; index: number }> = ({ item }) => {
  const statusColor = getStatusColor(item.status);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.header}>
        <View>
          <CustomText variant="h8" fontFamily={Fonts.Bold} style={styles.orderId}>
            #{item.orderId}
          </CustomText>
          <CustomText variant="h9" style={styles.dateText}>
            {formatISOToCustom(item.createdAt)}
          </CustomText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '15', borderColor: statusColor }]}>
          <CustomText
            variant="h9"
            fontFamily={Fonts.SemiBold}
            style={{ color: statusColor, textTransform: 'uppercase', fontSize: 10 }}>
            {item.status}
          </CustomText>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.itemsContainer}>
        {item?.items?.map((i, idx) => (
          <View key={idx} style={styles.itemRow}>
            <View style={styles.countBadge}>
              <CustomText variant="h9" fontFamily={Fonts.SemiBold} style={styles.countText}>
                {i?.count}x
              </CustomText>
            </View>
            <CustomText variant="h8" fontFamily={Fonts.Medium} numberOfLines={1} style={styles.itemName}>
              {i?.item?.name}
            </CustomText>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <CustomText variant="h8" style={styles.totalLabel}>Total Amount</CustomText>
        <CustomText variant="h6" fontFamily={Fonts.Bold} style={styles.totalPrice}>
          ₹{item.totalPrice}
        </CustomText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    color: '#333',
    marginBottom: 2,
  },
  dateText: {
    color: '#888',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  countBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  countText: {
    color: '#333',
    fontSize: 10,
  },
  itemName: {
    color: '#444',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  totalLabel: {
    color: '#888',
  },
  totalPrice: {
    color: Colors.text,
  },
});

export default ProfileOrderItem;
