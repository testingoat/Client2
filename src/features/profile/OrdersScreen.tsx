import { View, StyleSheet, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@state/authStore';
import { fetchCustomerOrders } from '@service/orderService';
import CustomHeader from '@components/ui/CustomHeader';
import ProfileOrderItem from './ProfileOrderItem';
import CustomText from '@components/ui/CustomText';
import { Fonts, Colors } from '@utils/Constants';

const OrdersScreen = () => {
    const [orders, setOrders] = useState([]);
    const { user } = useAuthStore();

    const fetchOrders = async () => {
        const data = await fetchCustomerOrders(user?._id);
        setOrders(data);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const renderOrders = ({ item, index }: any) => {
        return <ProfileOrderItem item={item} index={index} />;
    };

    return (
        <View style={styles.container}>
            <CustomHeader title="Your Orders" />
            <FlatList
                data={orders}
                renderItem={renderOrders}
                keyExtractor={(item: any) => item?.orderId}
                contentContainerStyle={styles.scrollViewContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <CustomText variant="h6" fontFamily={Fonts.Medium}>
                            No orders found
                        </CustomText>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },
    scrollViewContent: {
        padding: 16,
        paddingTop: 20,
        paddingBottom: 100,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    }
});

export default OrdersScreen;
