import { useEffect, useRef, useState } from 'react';
import type { DeliveryLocation } from '@service/locationService';
import {
  fetchDeliveryQuote,
  DeliveryQuotePayload,
  DeliveryQuoteResponse,
} from '@service/orderService';

export interface DeliveryQuoteError {
  code?: string;
  message: string;
  maxDistance?: number;
  distance_km?: number;
}

interface UseDeliveryQuoteArgs {
  branchId?: string;
  cartValue: number;
  deliveryLocation: DeliveryLocation | null;
  enabled?: boolean;
  addressId?: string | null;
}

export const useDeliveryQuote = ({
  branchId,
  cartValue,
  deliveryLocation,
  enabled = true,
  addressId = null,
}: UseDeliveryQuoteArgs) => {
  const [quote, setQuote] = useState<DeliveryQuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<DeliveryQuoteError | null>(null);

  const lastKeyRef = useRef<string | null>(null);
  const abortRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  const coordKey = deliveryLocation
    ? `${Number(deliveryLocation.latitude).toFixed(5)}:${Number(
        deliveryLocation.longitude,
      ).toFixed(5)}`
    : null;

  useEffect(() => {
    if (!enabled || !branchId || (!deliveryLocation && !addressId)) {
      setQuote(null);
      setError(null);
      setLoading(false);
      lastKeyRef.current = null;
      return;
    }

    const payloadKey = `${branchId}|${cartValue}|${addressId ?? ''}|${coordKey ?? ''}`;
    if (payloadKey === lastKeyRef.current) {
      return;
    }
    lastKeyRef.current = payloadKey;

    setLoading(true);
    abortRef.current.cancelled = false;

    const payload: DeliveryQuotePayload = {
      branchId,
      cartValue,
    };
    if (deliveryLocation) {
      payload.deliveryLocation = deliveryLocation;
    }
    if (addressId) {
      payload.addressId = addressId;
    }

    (async () => {
      try {
        const data = await fetchDeliveryQuote(payload);
        if (abortRef.current.cancelled) return;
        setQuote(data);
        setError(null);
      } catch (err: any) {
        if (abortRef.current.cancelled) return;
        const errData = err?.response?.data;
        setError({
          message: errData?.message || 'Unable to calculate delivery charges.',
          code: errData?.code,
          maxDistance: errData?.maxDistance ?? errData?.max_distance,
          distance_km: errData?.distance_km,
        });
      } finally {
        if (!abortRef.current.cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      abortRef.current.cancelled = true;
    };
  }, [
    branchId,
    coordKey,
    cartValue,
    enabled,
    addressId,
  ]);

  return {
    quote,
    loading,
    error,
    refetch: () => {
      lastKeyRef.current = null;
    },
    isDisabled: !branchId || (!deliveryLocation && !addressId) || !enabled,
  };
};
