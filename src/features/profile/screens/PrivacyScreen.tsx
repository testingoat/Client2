import { View, StyleSheet } from 'react-native';
import React from 'react';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import { Fonts } from '@utils/Constants';

const PrivacyScreen = () => {
    return (
        <View style={styles.container}>
            <CustomHeader title="Privacy" />
            <View style={styles.content}>
                <CustomText variant="h5" fontFamily={Fonts.SemiBold}>Privacy Policy</CustomText>
                <CustomText variant="h7" fontFamily={Fonts.Regular}>Read our privacy policy.</CustomText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default PrivacyScreen;
