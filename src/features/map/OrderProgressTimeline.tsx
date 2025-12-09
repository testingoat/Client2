import { View, StyleSheet } from 'react-native';
import React, { FC, useEffect } from 'react';
import { Colors, Fonts } from '@utils/Constants';
import CustomText from '@components/ui/CustomText';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RFValue } from 'react-native-responsive-fontsize';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface OrderProgressTimelineProps {
  currentStatus:
  | 'available'
  | 'confirmed'
  | 'arriving'
  | 'delivered'
  | 'cancelled';
}

const AnimatedStepIcon = ({
  isCompleted,
  isCurrent,
  isFuture,
  icon,
}: {
  isCompleted: boolean;
  isCurrent: boolean;
  isFuture: boolean;
  icon: string;
}) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isCurrent) {
      // Pulse effect for the current step
      scale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.out(Easing.ease) }),
        ),
        -1, // Infinite loop
        true, // Reverse
      );
    } else {
      scale.value = withTiming(1);
    }
  }, [isCurrent]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.iconContainer,
        isCompleted
          ? styles.completedIcon
          : isCurrent
            ? styles.currentIcon
            : styles.pendingIcon,
        isCurrent && animatedStyle, // Only animate if current
      ]}>
      {isCompleted ? (
        <Icon name="check" size={RFValue(14)} color="#fff" />
      ) : (
        <Icon
          name={icon}
          size={RFValue(14)}
          color={
            isCurrent
              ? Colors.secondary
              : isFuture
                ? Colors.disabled
                : '#fff'
          }
        />
      )}
    </Animated.View>
  );
};

const OrderProgressTimeline: FC<OrderProgressTimelineProps> = ({
  currentStatus,
}) => {
  // Define the steps in order
  const steps = [
    { id: 'available', title: 'Order Confirmed', icon: 'check-circle' },
    { id: 'confirmed', title: 'Picked Up', icon: 'package-variant' },
    { id: 'arriving', title: 'On the Way', icon: 'motorbike' },
    { id: 'delivered', title: 'Delivered', icon: 'home' },
  ];

  // Determine the current step index
  const getCurrentStepIndex = () => {
    switch (currentStatus) {
      case 'available':
        return 0;
      case 'confirmed':
        return 1;
      case 'arriving':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <View style={styles.container}>
      <View style={styles.timelineContainer}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isFuture = index > currentStepIndex;
          const zIndex = steps.length - index;

          return (
            <View key={step.id} style={[styles.stepContainer, { zIndex }]}>
              {/* Connector line */}
              {index > 0 && (
                <View
                  style={[
                    styles.connector,
                    isCompleted
                      ? styles.completedConnector
                      : styles.pendingConnector,
                  ]}
                />
              )}

              {/* Step icon container with Animation */}
              <AnimatedStepIcon
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                isFuture={isFuture}
                icon={step.icon}
              />

              {/* Step label */}
              <CustomText
                variant="h9"
                fontFamily={isCurrent ? Fonts.SemiBold : Fonts.Medium}
                style={[
                  styles.stepLabel,
                  isCompleted || isCurrent
                    ? styles.activeLabel
                    : styles.inactiveLabel,
                ]}>
                {step.title}
              </CustomText>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 12,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    width: '25%',
  },
  connector: {
    position: 'absolute',
    height: 3,
    width: '100%',
    top: 19, // Center of 40px icon (roughly, adjusted for border)
    left: '-50%',
    zIndex: -1,
  },
  completedConnector: {
    backgroundColor: Colors.secondary,
  },
  pendingConnector: {
    backgroundColor: '#E0E0E0',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 3,
    backgroundColor: '#fff', // Ensure background covers connector
  },
  completedIcon: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  currentIcon: {
    backgroundColor: '#fff',
    borderColor: Colors.secondary,
  },
  pendingIcon: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  stepLabel: {
    textAlign: 'center',
    width: '100%',
    fontSize: RFValue(9),
    marginTop: 4,
  },
  activeLabel: {
    color: Colors.text,
    transform: [{ scale: 1.05 }],
  },
  inactiveLabel: {
    color: '#999',
  },
});

export default OrderProgressTimeline;