import { View, StyleSheet } from 'react-native';
import React from 'react';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import { Fonts, Colors } from '@utils/Constants';

const SupportScreen = () => {
    return (
        <View style={styles.container}>
            <CustomHeader title="Support" />
            <View style={styles.content}>
                <CustomText variant="h5" fontFamily={Fonts.SemiBold}>
                    How can we help you?
                </CustomText>
                <CustomText variant="h7" fontFamily={Fonts.Regular} style={styles.subtitle}>
                    Contact us for any queries or issues.
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

export default SupportScreen;
