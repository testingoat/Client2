import {View, Text, StyleSheet, Modal, TouchableOpacity} from 'react-native';
import React, {FC} from 'react';
import CustomText from './CustomText';
import {Colors, Fonts} from '@utils/Constants';
import {RFValue} from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface CustomDialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'confirmation' | 'error';
}

const CustomDialog: FC<CustomDialogProps> = ({
  visible,
  onClose,
  title,
  message,
  type = 'info',
}) => {
  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'check-circle-outline';
      case 'error':
        return 'close-circle-outline';
      case 'confirmation':
        return 'checkbox-marked-circle-outline';
      default:
        return 'information-outline';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50'; // Green
      case 'error':
        return '#F44336'; // Red
      case 'confirmation':
        return Colors.primary; // Teal green
      default:
        return Colors.primary; // Teal green
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Icon
              name={getIconName()}
              size={RFValue(40)}
              color={getIconColor()}
            />
          </View>
          <CustomText variant="h4" fontFamily={Fonts.SemiBold} style={styles.title}>
            {title}
          </CustomText>
          <CustomText
            variant="h6"
            fontFamily={Fonts.Medium}
            style={styles.message}>
            {message}
          </CustomText>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <CustomText
              variant="h5"
              fontFamily={Fonts.SemiBold}
              style={styles.buttonText}>
              OK
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '85%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
  },
});

export default CustomDialog;