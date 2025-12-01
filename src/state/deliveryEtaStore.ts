import { create } from 'zustand';
import { estimateEtaForLocation, EtaResponse } from '@service/deliveryService';
import { DeliveryLocation, getDeliveryLocation } from '@service/locationService';
import { calculateDistance } from '@utils/etaCalculator';

export type EtaState =
  | 'LOADING'
  | 'SUCCESS'
  | 'OUT_OF_COVERAGE'
  | 'GENERIC_FALLBACK'
  | 'PERMISSION_DENIED';

export const LOCATION_REFRESH_DISTANCE_KM = 0.5; // 500m
export const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes
const NETWORK_ERROR_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

interface DeliveryEtaStore {
  state: EtaState;
  etaData: EtaResponse | null;
  lastLocation: DeliveryLocation | null;
  lastFetchTime: number;
  currentRequest: Promise<void> | null;
  abortController: AbortController | null;
  networkErrorCount: number;
  networkErrorWindowStart: number | null;
  fetchEta: (options?: { force?: boolean }) => Promise<void>;
}

const initialState = {
  state: 'LOADING' as EtaState,
  etaData: null,
  lastLocation: null,
  lastFetchTime: 0,
  currentRequest: null,
  abortController: null,
  networkErrorCount: 0,
  networkErrorWindowStart: null,
};

export const useDeliveryEtaStore = create<DeliveryEtaStore>((set, get) => ({
  ...initialState,
  fetchEta: async ({ force = false }: { force?: boolean } = {}) => {
    const existingRequest = get().currentRequest;
    if (existingRequest && !force) {
      return existingRequest;
    }

    const runRequest = (async () => {
      try {
        const location = await getDeliveryLocation(false);

        if (!location) {
          set({ state: 'PERMISSION_DENIED' });
          return;
        }

        const { lastLocation, lastFetchTime, etaData } = get();
        const now = Date.now();

        // Skip fetch if we already have fresh data for nearby location
        if (
          !force &&
          etaData &&
          lastLocation &&
          lastFetchTime > 0
        ) {
          const age = now - lastFetchTime;
          const distanceMoved = calculateDistance(
            lastLocation.latitude,
            lastLocation.longitude,
            location.latitude,
            location.longitude
          );

          if (age < STALE_TIME_MS && distanceMoved < LOCATION_REFRESH_DISTANCE_KM) {
            set({ lastLocation: location });
            return;
          }
        }

        // Abort any in-flight request before starting a new one
        const inflightController = get().abortController;
        if (inflightController) {
          inflightController.abort();
        }

        const controller = new AbortController();
        set({
          state: 'LOADING',
          abortController: controller,
        });

        const response = await estimateEtaForLocation(
          location.latitude,
          location.longitude,
          { signal: controller.signal }
        );

        if (response.success) {
          set({
            etaData: response,
            state: 'SUCCESS',
            lastLocation: location,
            lastFetchTime: Date.now(),
            abortController: null,
            networkErrorCount: 0,
            networkErrorWindowStart: null,
          });
        } else {
          set({
            etaData: response,
            state: 'GENERIC_FALLBACK',
            lastLocation: location,
            lastFetchTime: Date.now(),
            abortController: null,
          });
        }
      } catch (error: any) {
        // Swallow cancellation errors - a newer request will resolve soon
        if (error?.reason === 'REQUEST_CANCELLED') {
          return;
        }

        const reason = error?.reason;
        if (reason === 'OUT_OF_COVERAGE' || reason === 'NO_BRANCHES') {
          set({ state: 'OUT_OF_COVERAGE', abortController: null });
        } else if (reason === 'PERMISSION_DENIED') {
          set({ state: 'PERMISSION_DENIED', abortController: null });
        } else if (reason === 'NETWORK_ERROR' || reason === 'NETWORK_TIMEOUT') {
          const now = Date.now();
          const { networkErrorWindowStart, networkErrorCount } = get();

          if (!networkErrorWindowStart || now - networkErrorWindowStart > NETWORK_ERROR_WINDOW_MS) {
            set({
              networkErrorWindowStart: now,
              networkErrorCount: 1,
            });
          } else {
            const updatedCount = networkErrorCount + 1;
            set({
              networkErrorCount: updatedCount,
              networkErrorWindowStart,
            });

            if (updatedCount >= 3) {
              console.warn('Delivery ETA: Frequent network errors detected (3+ in 5 minutes).');
            }
          }

          set({ state: 'GENERIC_FALLBACK', abortController: null });
        } else {
          set({ state: 'GENERIC_FALLBACK', abortController: null });
        }
      }
    })().finally(() => {
      set({ currentRequest: null });
    });

    set({ currentRequest: runRequest });
    return runRequest;
  },
}));

export const resetDeliveryEtaState = () => {
  useDeliveryEtaStore.setState(initialState, true);
};
