import {
  View,
  StyleSheet,
  SafeAreaView,
  Animated,
  Image,
  Keyboard,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import CustomSafeAreaView from '@components/global/CustomSafeAreaView';
import ProductSlider from '@components/login/ProductSlider';
import { Colors, Fonts, lightColors } from '@utils/Constants';
import CustomText from '@components/ui/CustomText';
import { RFValue } from 'react-native-responsive-fontsize';
import { resetAndNavigate, navigate } from '@utils/NavigationUtils';
import useKeyboardOffsetHeight from '@utils/useKeyboardOffsetHeight';
import LinearGradient from 'react-native-linear-gradient';
import CustomInput from '@components/ui/CustomInput';
import CustomButton from '@components/ui/CustomButton';
import { customerLogin } from '@service/authService';
import { requestOTP } from '@service/otpService'; // Added OTP service import
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const bottomColors = [...lightColors].reverse();

const CustomerLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const keyboardOffsetHeight = useKeyboardOffsetHeight();

  useEffect(() => {
    // Only shift when the input is focused and keyboard is visible
    const shouldShift = isInputFocused && keyboardOffsetHeight > 0;
    Animated.timing(animatedValue, {
      toValue: shouldShift ? -keyboardOffsetHeight * 0.84 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [keyboardOffsetHeight, isInputFocused]);

  const handleAuth = async () => {
    Keyboard.dismiss()
    setLoading(true)
    try {
      // Format phone number with country code
      const formattedPhoneNumber = `+91${phoneNumber}`;
      console.log('CustomerLogin: Starting OTP request for phone number:', phoneNumber);
      console.log('CustomerLogin: Formatted phone number:', formattedPhoneNumber);

      // Validate phone number format
      if (!phoneNumber || phoneNumber.length !== 10) {
        console.log('CustomerLogin: Invalid phone number length:', phoneNumber?.length);
        Alert.alert("Error", "Please enter a valid 10-digit phone number.");
        setLoading(false);
        return;
      }

      // Request OTP when user clicks Continue
      console.log('CustomerLogin: Calling requestOTP function...');
      const response = await requestOTP(formattedPhoneNumber);
      console.log('CustomerLogin: OTP Request Response received:', response);

      if (response.success) {
        console.log('CustomerLogin: OTP request successful, navigating to OTP screen');
        // Navigate to OTP verification screen if OTP request is successful
        navigate('OTPVerification', { phone: formattedPhoneNumber });
      } else {
        console.log('CustomerLogin: OTP request failed:', response.message);
        Alert.alert("Error", response.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.log('CustomerLogin: OTP request error caught:', error);
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    } finally {
      console.log('CustomerLogin: OTP request process completed');
      setLoading(false)
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <CustomSafeAreaView>
          <ProductSlider />
          <View style={{ flex: 1 }}>
            <Animated.ScrollView
              bounces={false}
              style={[{ transform: [{ translateY: animatedValue }] }, styles.scroll]}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.subContainer}>

              <LinearGradient colors={bottomColors} style={styles.gradient} />

              <View style={styles.content}>
                <Image
                  source={require('@assets/images/logo.png')}
                  style={styles.logo}
                />

                <CustomText variant="h2" fontFamily={Fonts.Bold}>
                  Grocery Delivery App
                </CustomText>
                <CustomText
                  variant="h5"
                  fontFamily={Fonts.SemiBold}
                  style={styles.text}>
                  Log in or sign up
                </CustomText>

                <CustomInput
                  onChangeText={text => setPhoneNumber(text.slice(0, 10))}
                  onClear={() => setPhoneNumber('')}
                  value={phoneNumber}
                  placeholder="Enter mobile number"
                  inputMode="numeric"
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  left={
                    <CustomText
                      style={styles.phoneText}
                      variant="h6"
                      fontFamily={Fonts.SemiBold}>
                      +91
                    </CustomText>
                  }
                  right={true} // Ensure the clear button can show
                />

                <CustomButton
                  disabled={phoneNumber?.length != 10}
                  onPress={() => handleAuth()}
                  loading={loading}
                  title="Continue"
                />
              </View>
            </Animated.ScrollView>
          </View>
        </CustomSafeAreaView>

        <View style={styles.footer}>
          <SafeAreaView />
          <CustomText fontSize={RFValue(6)}>
            By Continuing, you agree to our Terms of Service & Privacy Policy
          </CustomText>
          <SafeAreaView />
        </View>

        {/* <TouchableOpacity style={styles.absoluteSwitch} onPress={() => resetAndNavigate('DeliveryLogin')}>
          <Icon name='bike-fast' color="#000" size={RFValue(18)} />
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  phoneText: {
    marginLeft: 10,
    color: Colors.text, // Ensure the country code text is visible
    fontSize: RFValue(12),
    fontFamily: Fonts.SemiBold,
  },
  absoluteSwitch: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    padding: 10,
    height: 55,
    justifyContent: "center",
    alignItems: 'center',
    width: 55,
    borderRadius: 50,
    right: 10,
    zIndex: 99
  },
  text: {
    marginTop: 2,
    marginBottom: 25,
    opacity: 0.8,
  },
  logo: {
    height: 50,
    width: 50,
    borderRadius: 20,
    marginVertical: 10,
  },
  subContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  footer: {
    borderTopWidth: 0.8,
    borderColor: Colors.border,
    paddingBottom: 10,
    zIndex: 22,
    position: 'absolute',
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fc',
    width: '100%',
  },
  gradient: {
    paddingTop: 60,
    width: '100%',
  },
  scroll: {
    zIndex: 1,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default CustomerLogin;
