import {useCartStore} from '@state/cartStore';
import {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import React from 'react';
import CustomText from '@components/ui/CustomText';
import CartAnimationWrapper from './CartAnimationWrapper';
import CartSummary from './CartSummary';

// Safe wrapper to prevent string children from causing crashes
const safeWrap = (children: any) =>
  React.Children.map(children, (child) =>
    typeof child === "string" || typeof child === "number"
      ? <CustomText>{child}</CustomText>
      : child
  );

const withCart = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
): FC<P> => {
  const WithCartComponent: FC<P> = props => {
    const cart = useCartStore(state => state.cart);
    const cartCount = cart.reduce((acc, item) => acc + item.count, 0);

    if (__DEV__) {
      console.log("🚨 withCart rendering, cartCount:", cartCount);
      console.log("🚨 withCart props:", typeof props, props);
      console.log("🚨 withCart WrappedComponent:", WrappedComponent);
    }

    return (
      <View style={styles.container}>
        {safeWrap(<WrappedComponent {...props} />)}

        <CartAnimationWrapper cartCount={cartCount}>
          <CartSummary
            cartCount={cartCount}
            cartImage={cart.length > 0 ? cart[0]?.item?.image || null : null}
          />
        </CartAnimationWrapper>
      </View>
    );
  };

  return WithCartComponent;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default withCart;
