import { appAxios } from './apiInterceptors';

/* -----------------------------------------------------------
   TYPES
----------------------------------------------------------- */

export interface DeliveryBranch {
    id: string;
    name: string;
    address?: string;
    distanceKm: number;
    sellerId?: string;
}

export interface EtaMeta {
    prepTimeMin?: number;
    averageSpeedKmph?: number;
    serviceRadiusKm?: number;
}

export interface EtaResponse {
    success: boolean;
    etaMinutes: number;
    etaText: string;
    branch: DeliveryBranch;
    meta?: EtaMeta;
    reason?: string;
    message?: string;
}

export interface EtaError {
    success: boolean;
    reason: string;
    message: string;
    status?: number;
}

export interface EstimateEtaOptions {
    signal?: AbortSignal;
    timeoutMs?: number;
}

export const DEFAULT_ETA_TIMEOUT_MS = 15000; // 15s is a common mobile-network SLA

/* -----------------------------------------------------------
   API CALLS
----------------------------------------------------------- */

/**
 * Estimates delivery ETA for a given location.
 * 
 * @param latitude User's latitude
 * @param longitude User's longitude
 * @returns EtaResponse on success, or throws error with response data
 */
export const estimateEtaForLocation = async (
    latitude: number,
    longitude: number,
    options: EstimateEtaOptions = {}
): Promise<EtaResponse> => {
    const { signal, timeoutMs = DEFAULT_ETA_TIMEOUT_MS } = options;

    try {
        const response = await appAxios.get('/delivery/estimate-for-location', {
            params: {
                latitude,
                longitude,
            },
            signal,
            timeout: timeoutMs,
        });
        return response.data;
    } catch (error: any) {
        if (signal?.aborted || error?.code === 'ERR_CANCELED') {
            throw {
                success: false,
                reason: 'REQUEST_CANCELLED',
                message: 'Delivery ETA request was cancelled',
            };
        }

        if (error?.code === 'ECONNABORTED') {
            throw {
                success: false,
                reason: 'NETWORK_TIMEOUT',
                message: `Delivery ETA request timed out after ${timeoutMs}ms`,
            };
        }

        // Propagate the error response data if available, otherwise throw generic error
        if (error.response && error.response.data) {
            throw {
                ...error.response.data,
                status: error.response.status,
            };
        }
        throw {
            success: false,
            reason: 'NETWORK_ERROR',
            message: error.message || 'Network request failed',
        };
    }
};
