import { View, StyleSheet } from 'react-native';
import React from 'react';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import { Fonts, Colors } from '@utils/Constants';

const WishlistScreen = () => {
    return (
        <View style={styles.container}>
            <CustomHeader title="Your Wishlist" />
            <View style={styles.content}>
                <CustomText variant="h5" fontFamily={Fonts.SemiBold}>
                    Your Wishlist is empty
                </CustomText>
                <CustomText variant="h7" fontFamily={Fonts.Regular} style={styles.subtitle}>
                    Save items you love to buy later!
                </CustomText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subtitle: {
        marginTop: 10,
        opacity: 0.6,
    }
});

export default WishlistScreen;
