import { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  estimateEtaForLocation,
  EtaResponse,
  DeliveryBranch,
} from '@service/deliveryService';
import {
  getDeliveryLocation,
  DeliveryLocation,
} from '@service/locationService';

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
  branchId?: string;
  branch?: DeliveryBranch;
  refresh: () => void;
}

const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes

export const useDeliveryEta = (): UseDeliveryEtaResult => {
  const [state, setState] = useState<EtaState>('LOADING');
  const [etaData, setEtaData] = useState<EtaResponse | null>(null);

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastLocationRef = useRef<DeliveryLocation | null>(null);
  const lastFetchTimeRef = useRef<number>(0);

  const performFetch = useCallback(
    async (force = false) => {
      try {
        const now = Date.now();
        const age = now - lastFetchTimeRef.current;

        if (!force && state !== 'LOADING' && age < STALE_TIME_MS) {
          return;
        }

        setState('LOADING');

        const location = await getDeliveryLocation(false);
        if (!location) {
          setState('PERMISSION_DENIED');
          return;
        }

        lastLocationRef.current = location;

        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const response = await estimateEtaForLocation(
          location.latitude,
          location.longitude,
          { signal: controller.signal },
        );

        if (response.success) {
          setEtaData(response);
          setState('SUCCESS');
          lastFetchTimeRef.current = Date.now();
        } else {
          if (response.reason === 'OUT_OF_COVERAGE' || response.reason === 'NO_BRANCHES') {
            setState('OUT_OF_COVERAGE');
          } else {
            setState('GENERIC_FALLBACK');
          }
        }
      } catch (error: any) {
        if (error?.reason === 'REQUEST_CANCELLED') {
          return;
        }
        if (error?.reason === 'OUT_OF_COVERAGE' || error?.reason === 'NO_BRANCHES') {
          setState('OUT_OF_COVERAGE');
        } else if (error?.reason === 'PERMISSION_DENIED') {
          setState('PERMISSION_DENIED');
        } else {
          setState('GENERIC_FALLBACK');
        }
      }
    },
    [state],
  );

  useEffect(() => {
    performFetch();

    const subscription = AppState.addEventListener('change', nextState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        performFetch();
      }
      appStateRef.current = nextState;
    });

    return () => {
      subscription.remove();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const etaCopy = useMemo(() => {
    let etaText = 'Calculating delivery time...';
    let etaMinutes: number | undefined;
    let branchName: string | undefined;
    let branchDistance: number | undefined;

    switch (state) {
      case 'SUCCESS':
        if (etaData) {
          const baseText = etaData.etaText || '';
          etaText = baseText.toLowerCase().includes('delivery')
            ? baseText
            : `Delivery in ${baseText || '~20 mins'}`;
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
      case 'LOADING':
      default:
        etaText = 'Calculating delivery time...';
        break;
    }

    return { etaText, etaMinutes, branchName, branchDistance };
  }, [state, etaData]);

  const refresh = useCallback(() => {
    performFetch(true);
  }, [performFetch]);

  return {
    state,
    etaText: etaCopy.etaText,
    etaMinutes: etaCopy.etaMinutes,
    branchName: etaCopy.branchName,
    branchDistance: etaCopy.branchDistance,
    branchId: etaData?.branch?.id,
    branch: etaData?.branch,
    refresh,
  };
};

