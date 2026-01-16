import axios from 'axios';
import { BASE_URL } from './config';

export type HomeSection =
  | { type: 'banner_carousel'; data: { items: any[] } }
  | { type: 'category_grid'; data: { title: string; tiles: any[] } }
  | { type: string; data?: any };

export type HomeResponse = {
  layoutVersion: number;
  sections: HomeSection[];
};

export const getHome = async (): Promise<HomeResponse> => {
  try {
    const response = await axios.get(`${BASE_URL}/home`);
    return response.data;
  } catch (error) {
    if (__DEV__) console.log('Error Home', error);
    return { layoutVersion: 1, sections: [] };
  }
};

