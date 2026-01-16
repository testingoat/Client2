import axios from 'axios';
import { BASE_URL } from './config';

export type HomeSection =
  | { type: 'banner_carousel'; data: { items: any[] } }
  | {
      type: 'offer_products';
      data: {
        title: string;
        showAddButton?: boolean;
        showDiscountBadge?: boolean;
        products: any[];
      };
    }
  | { type: 'category_grid'; data: { title: string; tiles: any[] } }
  | { type: string; data?: any };

export type HomeResponse = {
  layoutVersion: number;
  sections: HomeSection[];
};

export const getHome = async (opts?: { bypassCache?: boolean }): Promise<HomeResponse> => {
  try {
    const url = `${BASE_URL}/home${opts?.bypassCache ? `?t=${Date.now()}` : ''}`;
    const response = await axios.get(url, {
      headers: opts?.bypassCache ? { 'Cache-Control': 'no-cache' } : undefined,
    });
    return response.data;
  } catch (error) {
    if (__DEV__) console.log('Error Home', error);
    return { layoutVersion: 1, sections: [] };
  }
};
