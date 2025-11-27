import { View, StyleSheet } from 'react-native'
import React from 'react'
import { Colors } from '@utils/Constants'
import WalletItem from './WalletItem'
import { useNavigation } from '@react-navigation/native'

const WalletSection = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.walletContainer}>
            <WalletItem
                icon='receipt-outline'
                label='Your Orders'
                onPress={() => navigation.navigate('OrdersScreen')}
            />
            <WalletItem
                icon='heart-outline'
                label='Your Wishlist'
                onPress={() => navigation.navigate('WishlistScreen')}
            />
            <WalletItem
                icon='headset-outline'
                label='Support'
                onPress={() => navigation.navigate('SupportScreen')}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    walletContainer: {
        justifyContent: 'space-around',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundSecondary,
        paddingVertical: 15,
        borderRadius: 15,
        marginVertical: 20
    }
})
export default WalletSection