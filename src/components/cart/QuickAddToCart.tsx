import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Fonts, shadowPresets, buttonGradient } from '@utils/Constants';
import { spacing } from '@utils/Spacing';
import CustomText from '@components/ui/CustomText';
import { useCartStore } from '@state/cartStore';
import LinearGradient from 'react-native-linear-gradient';

interface QuickAddToCartProps {
  item: any;
  size?: 'small' | 'medium' | 'large';
  style?: object;
  onAddSuccess?: () => void;
  onAddError?: (error: string) => void;
  showQuantity?: boolean;
  maxQuantity?: number;
}

const QuickAddToCart: React.FC<QuickAddToCartProps> = ({
  item,
  size = 'medium',
  style,
  onAddSuccess,
  onAddError,
  showQuantity = true,
  maxQuantity = 10,
}) => {
  const { addItem, getItemCount, updateItemCount } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const currentCount = getItemCount(item._id);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          buttonSize: 32,
          iconSize: 16,
          fontSize: 12,
        };
      case 'medium':
        return {
          buttonSize: 40,
          iconSize: 20,
          fontSize: 14,
        };
      case 'large':
        return {
          buttonSize: 48,
          iconSize: 24,
          fontSize: 16,
        };
      default:
        return {
          buttonSize: 40,
          iconSize: 20,
          fontSize: 14,
        };
    }
  };

  const { buttonSize, iconSize, fontSize } = getSizeStyles();

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showSuccessAnimation = () => {
    setShowSuccess(true);
    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(successAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccess(false);
    });
  };

  const handleQuickAdd = async () => {
    if (isAdding) return;

    setIsAdding(true);
    animateButton();
    
    // Add haptic feedback
    Vibration.vibrate(50);

    try {
      const success = await useCartStore.getState().quickAddItem(item, 1);
      
      if (success) {
        showSuccessAnimation();
        onAddSuccess?.();
      } else {
        onAddError?.('Failed to add item to cart');
      }
    } catch (error) {
      onAddError?.('An error occurred while adding to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleIncrement = () => {
    if (currentCount < maxQuantity) {
      updateItemCount(item._id, currentCount + 1);
      animateButton();
    }
  };

  const handleDecrement = () => {
    if (currentCount > 0) {
      updateItemCount(item._id, currentCount - 1);
      animateButton();
    }
  };

  if (currentCount === 0) {
    // Show add button
    return (
      <View style={[styles.container, style]}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            onPress={handleQuickAdd}
            disabled={isAdding}
            style={[
              styles.addButton,
              {
                width: buttonSize,
                height: buttonSize,
                borderRadius: buttonSize / 2,
              },
            ]}
          >
            <LinearGradient
              colors={buttonGradient}
              style={[
                styles.gradientButton,
                {
                  width: buttonSize,
                  height: buttonSize,
                  borderRadius: buttonSize / 2,
                },
              ]}
            >
              <Icon
                name={isAdding ? 'loading' : 'plus'}
                size={iconSize}
                color="#fff"
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Success indicator */}
        {showSuccess && (
          <Animated.View
            style={[
              styles.successIndicator,
              {
                opacity: successAnim,
                transform: [
                  {
                    scale: successAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Icon name="check-circle" size={iconSize} color={Colors.success} />
          </Animated.View>
        )}
      </View>
    );
  }

  // Show quantity controls
  if (showQuantity) {
    return (
      <View style={[styles.container, style]}>
        <Animated.View
          style={[
            styles.quantityContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <TouchableOpacity
            onPress={handleDecrement}
            style={[
              styles.quantityButton,
              {
                width: buttonSize * 0.8,
                height: buttonSize * 0.8,
                borderRadius: (buttonSize * 0.8) / 2,
              },
            ]}
          >
            <Icon name="minus" size={iconSize * 0.8} color={Colors.secondary} />
          </TouchableOpacity>

          <View style={styles.quantityDisplay}>
            <CustomText
              variant="h6"
              fontFamily={Fonts.SemiBold}
              style={[styles.quantityText, { fontSize }]}
            >
              {currentCount}
            </CustomText>
          </View>

          <TouchableOpacity
            onPress={handleIncrement}
            disabled={currentCount >= maxQuantity}
            style={[
              styles.quantityButton,
              {
                width: buttonSize * 0.8,
                height: buttonSize * 0.8,
                borderRadius: (buttonSize * 0.8) / 2,
              },
              currentCount >= maxQuantity && styles.disabledButton,
            ]}
          >
            <Icon
              name="plus"
              size={iconSize * 0.8}
              color={currentCount >= maxQuantity ? Colors.disabled : Colors.secondary}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    ...shadowPresets.medium,
  },
  gradientButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    ...shadowPresets.small,
  },
  quantityButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  disabledButton: {
    borderColor: Colors.disabled,
  },
  quantityDisplay: {
    paddingHorizontal: spacing.sm,
    minWidth: 30,
    alignItems: 'center',
  },
  quantityText: {
    color: Colors.text_dark,
  },
  successIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 20,
  },
});

export default QuickAddToCart;
