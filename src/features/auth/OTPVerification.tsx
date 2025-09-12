import {
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Keyboard,
  Animated,
  Easing,
  Vibration,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import CustomSafeAreaView from '@components/global/CustomSafeAreaView';
import {Colors, Fonts} from '@utils/Constants';
import CustomText from '@components/ui/CustomText';
import {RFValue} from 'react-native-responsive-fontsize';
import CustomButton from '@components/ui/CustomButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {verifyOTP, requestOTP} from '@service/otpService';
import {useAuthStore} from '@state/authStore';
import {tokenStorage} from '@state/storage';
import {resetAndNavigate, goBack} from '@utils/NavigationUtils';
import CustomModal from '@components/ui/CustomModal';

const {width} = Dimensions.get('window');

const OTPVerification = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {phone}: any = route.params || {};
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0); // Start with 0 so resend is immediately available
  const [canResend, setCanResend] = useState(true); // Start with true so resend is immediately available
  const [hasError, setHasError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const scaleAnimations = useRef(otp.map(() => new Animated.Value(1))).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // Request OTP when component mounts
  // Commented out to prevent duplicate OTP requests
  // The OTP is already sent in CustomerLogin before navigating to this screen
  // useEffect(() => {
  //   const requestOtpOnLoad = async () => {
  //     console.log('OTPVerification mounted, phone:', phone);
  //     if (phone) {
  //       try {
  //         console.log('Requesting OTP on load for:', phone);
  //         const response = await requestOTP(phone);
  //         console.log('OTP request on load response:', response);
  //         if (!response.success) {
  //           showModal('error', 'Error', response.message || 'Failed to send OTP. Please try again.');
  //         }
  //       } catch (error) {
  //         console.log('OTP request on load error:', error);
  //         showModal('error', 'Error', 'Failed to send OTP. Please try again.');
  //       }
  //     } else {
  //       console.log('No phone number provided to OTPVerification');
  //     }
  //   };

  //   requestOtpOnLoad();
  // }, [phone]);

  // Timer effect for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  // Pulse animation for resend button when timer is active
  useEffect(() => {
    if (timer > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnimation.setValue(1);
    }
    
    return () => {
      pulseAnimation.setValue(1);
    };
  }, [timer]);

  // Shake animation for error feedback
  const triggerShake = () => {
    // Set error state to show red borders
    setHasError(true);
    
    // Vibrate to provide haptic feedback
    Vibration.vibrate([100, 100, 100]);
    
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Reset error state after animation
    setTimeout(() => {
      setHasError(false);
    }, 1000);
  };

  const handleOtpChange = (text: string, index: number) => {
    if (isNaN(Number(text))) return;
    
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Add scale animation when a digit is entered
    if (text) {
      Animated.sequence([
        Animated.timing(scaleAnimations[index], {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimations[index], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Haptic feedback when entering a digit
      Vibration.vibrate(50);
    }

    // Move to next input if a digit is entered
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace navigation
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current box is empty and not the first box, move to previous box
        inputRefs.current[index - 1]?.focus();
        // Also clear the previous box's value
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      } else if (otp[index]) {
        // If current box has a value, clear it AND move to previous box
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      }
      // If current box is empty and it's the first box (index === 0), do nothing
    }
  };

  const showModal = (type: 'success' | 'error', title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleVerifyOTP = async () => {
    Keyboard.dismiss();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOTP(phone, otpString);
      
      if (response.success && response.token && response.user) {
        // Success vibration
        Vibration.vibrate([0, 100, 100, 100]);
        
        // Store tokens
        await tokenStorage.set('accessToken', response.token.accessToken);
        await tokenStorage.set('refreshToken', response.token.refreshToken);
        
        // Update auth store
        const {setUser} = useAuthStore.getState();
        setUser(response.user);
        
        // Navigate to dashboard
        resetAndNavigate('ProductDashboard');
      } else {
        triggerShake();
        showModal('error', 'Error', response.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      triggerShake();
      showModal('error', 'Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) {
      console.log('OTPVerification: Resend not allowed, canResend:', canResend);
      return;
    }
    
    console.log('OTPVerification: Phone number for resend:', phone);
    if (!phone) {
      console.log('OTPVerification: No phone number available for resend');
      showModal('error', 'Error', 'Phone number not available. Please try again.');
      return;
    }
    
    setLoading(true);
    try {
      console.log('OTPVerification: Resend OTP requested for phone:', phone);
      const response = await requestOTP(phone);
      console.log('OTPVerification: Resend OTP response:', response);
      
      if (response.success) {
        // Reset timer
        setTimer(30); // Set timer to 30 seconds
        setCanResend(false); // Disable resend until timer completes
        showModal('success', 'Success', 'OTP has been resent to your phone number.');
      } else {
        showModal('error', 'Error', response.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.log('OTPVerification: Resend OTP error:', error);
      showModal('error', 'Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomSafeAreaView>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={RFValue(24)} color={Colors.text} />
          </TouchableOpacity>
          <CustomText
            variant="h2"
            fontFamily={Fonts.Bold}
            style={styles.title}>
            Verification
          </CustomText>
          <View style={{ width: 30 }} />
        </View>
        
        <View style={styles.content}>
          <Icon name="shield-check" size={RFValue(40)} color={Colors.primary} />
          <CustomText
            variant="h2"
            fontFamily={Fonts.Bold}
            style={[styles.title, styles.titleSpacing]}>
            Verification
          </CustomText>
          <CustomText
            variant="h5"
            fontFamily={Fonts.SemiBold}
            style={styles.subtitle}>
            We have sent a code to {phone || '+91 XXXXXXXXXX'}
          </CustomText>

          <Animated.View
            style={[
              styles.otpContainer,
              {
                transform: [{translateX: shakeAnimation}],
              },
            ]}>
            {otp.map((digit, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.otpBox,
                  {
                    borderColor: hasError ? '#F44336' : digit ? Colors.primary : Colors.border,
                    backgroundColor: digit ? '#e0e0e0' : '#f8f9fc',
                    transform: [{scale: scaleAnimations[index]}],
                  },
                ]}>
                <CustomText
                  variant="h4"
                  fontFamily={Fonts.Bold}
                  style={styles.otpDigit}>
                  {digit}
                </CustomText>
                <TextInput
                  ref={ref => (inputRefs.current[index] = ref)}
                  style={styles.hiddenInput}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={text => handleOtpChange(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  autoFocus={index === 0}
                />
              </Animated.View>
            ))}
          </Animated.View>

          <View style={styles.actionGroup}>
            <CustomButton
              onPress={handleVerifyOTP}
              loading={loading}
              title="Verify OTP"
              disabled={otp.join('').length !== 6}
              style={styles.verifyButton}
            />
            
            <CustomText style={styles.helperText}>
              Didn't receive the code?
            </CustomText>
            
            <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
              <CustomButton
                onPress={handleResendOTP}
                disabled={!canResend}
                title={canResend ? 'Resend OTP' : `Resend in ${timer}s`}
                style={styles.resendButton}
                textStyle={styles.resendButtonText}
                variant="outlined"
              />
            </Animated.View>
          </View>
        </View>
        
        <CustomModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title={modalTitle}
          message={modalMessage}
          type={modalType}
        />
      </SafeAreaView>
    </CustomSafeAreaView>
  );
};

export default OTPVerification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    marginTop: 20,
    marginBottom: 10,
  },
  titleSpacing: {
    marginTop: 30,
    marginBottom: 20,
  },
  subtitle: {
    marginBottom: 40,
    textAlign: 'center',
    opacity: 0.8,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  otpBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fc',
    marginHorizontal: 5,
  },
  otpDigit: {
    color: Colors.text,
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    opacity: 0,
  },
  actionGroup: {
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
  },
  verifyButton: {
    width: Math.min(width * 0.75, 350),
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  helperText: {
    fontSize: RFValue(14),
    fontFamily: Fonts.Medium,
    color: '#6B7280',
    marginBottom: 14,
    textAlign: 'center',
  },
  resendButton: {
    width: Math.min(width * 0.75, 350),
    height: 48,  // Increased height for better text visibility
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,  // Reduced padding to fit text better
  },
  resendButtonText: {
    fontSize: RFValue(14),  // Reduced font size to fit within button
    fontFamily: Fonts.Bold,
    color: Colors.secondary,
  },
  resendButtonDisabled: {
    borderColor: Colors.disabled,
  },
  resendButtonTextDisabled: {
    color: '#333333',
    fontFamily: Fonts.Bold,
  },
});