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
}

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
    longitude: number
): Promise<EtaResponse> => {
    try {
        const response = await appAxios.get('/delivery/estimate-for-location', {
            params: {
                latitude,
                longitude,
            },
        });
        return response.data;
    } catch (error: any) {
        // Propagate the error response data if available, otherwise throw generic error
        if (error.response && error.response.data) {
            throw error.response.data;
        }
        throw {
            success: false,
            reason: 'NETWORK_ERROR',
            message: error.message || 'Network request failed',
        };
    }
};
