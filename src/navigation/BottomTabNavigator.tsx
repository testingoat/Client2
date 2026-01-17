import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors, Fonts } from '@utils/Constants';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ProductDashboard from '@features/dashboard/ProductDashboard';
import ProductCategories from '@features/category/ProductCategories';
import ProductOrder from '@features/order/ProductOrder';
import LiveGoat from '@features/dashboard/LiveGoat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarHideOnKeyboard: true,
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 0,
                    // No shadow (requested)
                    height: Platform.OS === 'android' ? 70 + insets.bottom : 70 + insets.bottom,
                    paddingBottom: Platform.OS === 'android' ? insets.bottom : insets.bottom,
                    paddingTop: 10,
                },
                tabBarLabelStyle: {
                    fontFamily: Fonts.SemiBold,
                    fontSize: RFValue(10),
                    marginBottom: 5,
                },
                tabBarActiveTintColor: Colors.secondary,
                tabBarInactiveTintColor: Colors.disabled,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'ProductDashboard') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'ProductCategories') {
                        iconName = 'view-grid-outline';
                    } else if (route.name === 'ProductOrder') {
                        iconName = focused ? 'refresh' : 'refresh';
                    } else if (route.name === 'LiveGoat') {
                        iconName = focused ? 'map-marker' : 'map-marker-outline';
                    }

                    return <Icon name={iconName || 'home'} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="ProductDashboard"
                component={ProductDashboard}
                options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="ProductCategories"
                component={ProductCategories}
                options={{ tabBarLabel: 'Categories' }}
            />
            <Tab.Screen
                name="ProductOrder"
                component={ProductOrder}
                options={{ tabBarLabel: 'Order Again' }}
            />
            <Tab.Screen
                name="LiveGoat"
                component={LiveGoat}
                options={{ tabBarLabel: 'Live Goat' }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
