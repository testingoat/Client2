import { View, StyleSheet, TouchableOpacity } from 'react-native'
import React, { FC } from 'react'
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Fonts } from '@utils/Constants';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomText from '@components/ui/CustomText';

interface WalletItemProps {
    icon: string;
    label: string;
    onPress?: () => void;
}

const WalletItem: FC<WalletItemProps> = ({ icon, label, onPress }) => {
    return (
        <TouchableOpacity style={styles.walletItemContainer} onPress={onPress}>
            <Icon name={icon} color={Colors.text} size={RFValue(20)} />
            <CustomText variant='h8' fontFamily={Fonts.Medium}>
                {label}
            </CustomText>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    walletItemContainer: {
        alignItems: 'center'
    }
})

export default WalletItem