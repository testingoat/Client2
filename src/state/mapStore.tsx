import { create } from "zustand";
import { getOrderById } from "@service/orderService";
import Geolocation from '@react-native-community/geolocation';

interface MapRefStore {
    mapRef: any;
    setMapRef: (ref: any) => void;
}

export const useMapRefStore = create<MapRefStore>((set) => ({
    mapRef: null,
    setMapRef: (ref) => {
        if (__DEV__) {
            console.log('📍 Map ref updated');
        }
        set({ mapRef: ref });
    }
}));

// Adding the missing useMapStore hook
interface MapStore {
    orderData: any;
    loading: boolean;
    myLocation: { latitude: number; longitude: number } | null;
    setOrderData: (data: any) => void;
    setLoading: (loading: boolean) => void;
    setMyLocation: (location: { latitude: number; longitude: number } | null) => void;
    fetchOrderDetails: (orderId: string) => Promise<void>;
    fetchOrderDetailsById: (orderId: string) => Promise<void>;
    watchLocation: () => () => void;
}

export const useMapStore = create<MapStore>((set, get) => ({
    orderData: null,
    loading: false,
    myLocation: null,
    setOrderData: (data) => set({ orderData: data }),
    setLoading: (loading) => set({ loading }),
    setMyLocation: (location) => set({ myLocation: location }),
    fetchOrderDetails: async (orderId: string) => {
        set({ loading: true });
        try {
            const data = await getOrderById(orderId);
            set({ orderData: data, loading: false });
        } catch (error) {
            if (__DEV__) {
                console.log("Fetch Order Error in MapStore", error);
            }
            set({ loading: false });
        }
    },
    fetchOrderDetailsById: async (orderId: string) => {
        set({ loading: true });
        try {
            const data = await getOrderById(orderId);
            set({ orderData: data, loading: false });
            return data;
        } catch (error) {
            if (__DEV__) {
                console.log("Fetch Order By ID Error in MapStore", error);
            }
            set({ loading: false });
            return null;
        }
    },
    watchLocation: () => {
        // Request authorization first
        Geolocation.requestAuthorization();
        
        const watchId = Geolocation.watchPosition(
            position => {
                const { latitude, longitude } = position.coords;
                if (__DEV__) {
                    console.log('📍 Location Updated');
                }
                set({ myLocation: { latitude, longitude } });
            },
            error => {
                if (__DEV__) {
                    console.log('📍 Location Error:', error);
                }
                // Try to get current position as fallback
                Geolocation.getCurrentPosition(
                    position => {
                        const { latitude, longitude } = position.coords;
                        if (__DEV__) {
                            console.log('📍 Fallback Location');
                        }
                        set({ myLocation: { latitude, longitude } });
                    },
                    fallbackError => {
                        if (__DEV__) {
                            console.log('📍 Fallback Location Error:', fallbackError);
                        }
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 15000,
                        maximumAge: 10000
                    }
                );
            },
            { 
                enableHighAccuracy: true, 
                distanceFilter: 10,
                interval: 5000,
                fastestInterval: 2000
            }
        );
        
        // Return cleanup function
        return () => {
            if (__DEV__) {
                console.log('📍 Stopping location watch');
            }
            Geolocation.clearWatch(watchId);
        };
    }
}));