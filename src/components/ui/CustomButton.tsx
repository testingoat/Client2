import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native'
import React, { FC, useRef } from 'react'
import { Colors, Fonts } from '@utils/Constants';
import CustomText from './CustomText';


interface CustomButtonProps {
    onPress: () => void;
    title: string;
    disabled?: boolean;
    loading?: boolean;
    style?: object;
    textStyle?: object;  // Added this prop for custom text styling
    variant?: 'filled' | 'outlined';
}


const CustomButton:FC<CustomButtonProps> = ({onPress,loading,title,disabled=false,style,textStyle,variant='filled'}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  };

  const isOutlined = variant === 'outlined';

  const buttonStyle = [
    styles.btn,
    isOutlined ? styles.outlinedBtn : {},
    style,
    disabled ? (isOutlined ? styles.outlinedBtnDisabled : styles.btnDisabled) : null
  ];

  const combinedTextStyle = [
    styles.text,
    isOutlined ? styles.outlinedText : {},
    disabled ? (isOutlined ? styles.outlinedTextDisabled : styles.textDisabled) : null,
    textStyle  // Added custom text style
  ];

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={buttonStyle}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        >
        {loading ? (
        <ActivityIndicator color={isOutlined ? Colors.secondary : '#fff'} size='small' />
        ) : (
        <CustomText style={combinedTextStyle} variant='h6' fontFamily={Fonts.SemiBold}>
            {title}
        </CustomText>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
    btn: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        padding: 15,
        marginVertical: 15,
        width: '100%',
        backgroundColor: Colors.secondary
    },
    btnDisabled: {
        backgroundColor: Colors.disabled
    },
    outlinedBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: Colors.secondary,
    },
    outlinedBtnDisabled: {
        borderColor: Colors.disabled
    },
    text: {
        color: '#fff'
    },
    textDisabled: {
        color: '#fff'
    },
    outlinedText: {
        color: Colors.secondary
    },
    outlinedTextDisabled: {
        color: '#333333'
    }
})

export default CustomButton