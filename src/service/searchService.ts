import { appAxios } from './apiInterceptors';

export type SearchResultType = 'product' | 'category' | 'brand';

export interface SearchResult {
    type: SearchResultType;
    id: string;
    name: string;
    image: string;
    soldCount: number;
    price?: number;
    discountPrice?: number;
    quantity?: string;
}

export interface SearchSuggestResponse {
    results: SearchResult[];
    typoCorrected: boolean;
    originalQuery: string;
    correctedQuery: string;
}

export async function suggest(query: string): Promise<SearchSuggestResponse> {
    try {
        const response = await appAxios.get('/search/v1/suggest', {
            params: { q: query },
        });
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            throw error.response.data;
        }
        throw {
            success: false,
            reason: 'NETWORK_ERROR',
            message: error.message || 'Network request failed',
        };
    }
}
