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
          withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
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

          return (
            <View key={step.id} style={styles.stepContainer}>
              {/* Connector line (except for the first step) */}
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
    borderRadius: 15,
    marginVertical: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    // Add shadow for better look
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  stepContainer: {
    alignItems: 'center',
    zIndex: 2,
    width: '25%',
  },
  connector: {
    position: 'absolute',
    height: 2,
    width: '100%',
    top: 15,
    left: '-50%',
    zIndex: 1,
  },
  completedConnector: {
    backgroundColor: Colors.secondary,
  },
  pendingConnector: {
    backgroundColor: Colors.disabled,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    borderWidth: 2,
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
    backgroundColor: '#fff',
    borderColor: Colors.disabled,
  },
  stepLabel: {
    textAlign: 'center',
    width: '100%',
    fontSize: RFValue(9), // Slightly smaller for better fit
  },
  activeLabel: {
    color: '#000',
  },
  inactiveLabel: {
    color: Colors.disabled,
  },
});

export default OrderProgressTimeline;