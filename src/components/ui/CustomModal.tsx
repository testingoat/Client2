import React, {useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import CustomText from './CustomText';
import {Colors, Fonts} from '@utils/Constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from './CustomButton';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error';
}

const {width} = Dimensions.get('window');

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  message,
  type,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          speed: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  const iconColor = type === 'success' ? '#10B981' : '#F59E0B';
  const icon = type === 'success' ? 'check-circle' : 'alert-circle';

  return (
    <TouchableOpacity
      style={styles.overlay}
      activeOpacity={1}
      onPress={onClose}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <View style={styles.content}>
          <Icon name={icon} size={40} color={iconColor} />
          <CustomText
            variant="h4"
            fontFamily={Fonts.SemiBold}
            style={styles.title}>
            {title}
          </CustomText>
          <CustomText
            variant="h6"
            fontFamily={Fonts.Regular}
            style={styles.message}>
            {message}
          </CustomText>
          <CustomButton
            title="OK"
            onPress={onClose}
            disabled={false}
            loading={false}
            style={styles.button}
          />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    width: Math.min(width * 0.88, 360),
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    maxHeight: '80%',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#111827',
  },
  message: {
    textAlign: 'center',
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    width: '100%',
    marginTop: 10,
  },
});

export default CustomModal;