import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { estimateEtaForLocation, EtaResponse } from '@service/deliveryService';
import { getDeliveryLocation, DeliveryLocation } from '@service/locationService';
import { calculateDistance } from '@utils/etaCalculator';

export type EtaState =
    | 'LOADING'
    | 'SUCCESS'
    | 'OUT_OF_COVERAGE'
    | 'GENERIC_FALLBACK'
    | 'PERMISSION_DENIED';

interface UseDeliveryEtaResult {
    state: EtaState;
    etaText: string;
    etaMinutes?: number;
    branchName?: string;
    branchDistance?: number;
    refresh: () => void;
}

const LOCATION_REFRESH_DISTANCE_KM = 0.5; // 500m
const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes

export const useDeliveryEta = (): UseDeliveryEtaResult => {
    const [state, setState] = useState<EtaState>('LOADING');
    const [etaData, setEtaData] = useState<EtaResponse | null>(null);

    const lastLocationRef = useRef<DeliveryLocation | null>(null);
    const lastFetchTimeRef = useRef<number>(0);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);

    const fetchEta = useCallback(async (force = false) => {
        try {
            if (!force && state === 'LOADING' && lastFetchTimeRef.current > 0) {
                // Prevent double loading if already loading or recently fetched (unless forced)
                // But here we want to show loading state if we are actually fetching
            }

            setState('LOADING');

            // 1. Get Location
            const location = await getDeliveryLocation(false); // Don't fallback to manual picker automatically here, just get current pos

            if (!location) {
                setState('PERMISSION_DENIED');
                return;
            }

            // Check if location changed significantly or time elapsed (optimization)
            // For now, we just fetch to be safe and accurate as per requirements

            lastLocationRef.current = location;

            // 2. Call API
            const response = await estimateEtaForLocation(location.latitude, location.longitude);

            // 3. Handle Success
            if (response.success) {
                setEtaData(response);
                setState('SUCCESS');
                lastFetchTimeRef.current = Date.now();
            } else {
                // Should be caught by catch block if it throws, but if it returns success:false
                handleError(response);
            }

        } catch (error: any) {
            handleError(error);
        }
    }, []);

    const handleError = (error: any) => {
        console.log('ETA Error:', error);
        if (error.reason === 'OUT_OF_COVERAGE' || error.reason === 'NO_BRANCHES') {
            setState('OUT_OF_COVERAGE');
        } else if (error.reason === 'INVALID_LOCATION') {
            setState('GENERIC_FALLBACK'); // Should not happen if we got location from device
        } else {
            setState('GENERIC_FALLBACK');
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchEta();
    }, [fetchEta]);

    // App State Listener (Foreground refresh)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appStateRef.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // App came to foreground
                const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current;
                if (timeSinceLastFetch > STALE_TIME_MS) {
                    console.log('App foregrounded and data stale, refreshing ETA...');
                    fetchEta();
                }
            }
            appStateRef.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [fetchEta]);

    // Derived UI values
    let etaText = 'Calculating...';
    let branchName: string | undefined;
    let branchDistance: number | undefined;
    let etaMinutes: number | undefined;

    switch (state) {
        case 'LOADING':
            etaText = 'Calculating delivery time...';
            break;
        case 'SUCCESS':
            if (etaData) {
                etaText = `Delivery in ${etaData.etaText}`;
                branchName = etaData.branch?.name;
                branchDistance = etaData.branch?.distanceKm;
                etaMinutes = etaData.etaMinutes;
            }
            break;
        case 'OUT_OF_COVERAGE':
            etaText = 'Delivery not available at your location';
            break;
        case 'PERMISSION_DENIED':
            etaText = 'Turn on location to see accurate delivery time';
            break;
        case 'GENERIC_FALLBACK':
            etaText = 'Delivery in ~20-30 mins';
            break;
    }

    return {
        state,
        etaText,
        etaMinutes,
        branchName,
        branchDistance,
        refresh: () => fetchEta(true),
    };
};
