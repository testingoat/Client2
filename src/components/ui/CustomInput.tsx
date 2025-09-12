import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import React, { FC } from 'react'
import Icon from "react-native-vector-icons/Ionicons";
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors, Fonts } from '@utils/Constants';

interface InputProps {
    left: React.ReactNode;
    onClear?: () => void;
    right?: boolean
}

const CustomInput:FC<InputProps & React.ComponentProps<typeof TextInput>> = ({left,onClear,right,...props}) => {
  return (
    <View style={styles.flexRow}>
        {left}
        <TextInput
        {...props}
        style={styles.inputContainer}
        placeholderTextColor="#666" // Increased contrast for better visibility
        />
        <View style={styles.icon}>
            {props?.value?.length !=0 && right && 
            <TouchableOpacity onPress={onClear}>
                <Icon name='close-circle-sharp' size={RFValue(16)} color='#666' />
            </TouchableOpacity>
            }
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    icon: {
        width: '5%',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    inputContainer: {
        flex: 1, // Use flex instead of fixed width to utilize available space
        fontFamily: Fonts.SemiBold,
        fontSize: RFValue(12),
        paddingVertical: 14,
        paddingBottom: 15,
        color: Colors.text,
        minWidth: 100, // Ensure minimum width for placeholder text
        paddingHorizontal: 5, // Add horizontal padding for better text visibility
    },
    text: {
        width: '10%',
        marginLeft: 10
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 10,
        borderWidth: 0.5,
        width: '100%',
        marginVertical: 10,
        backgroundColor: '#fff',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.6,
        shadowRadius: 2,
        shadowColor: Colors.border,
        borderColor: Colors.border,
        paddingHorizontal: 5, // Add padding to ensure proper spacing
    },
})

export default CustomInput