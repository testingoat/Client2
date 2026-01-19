import { appAxios } from './apiInterceptors';

export interface ProductSpecification {
    key: string;
    value: string;
}

export interface NutritionalInfo {
    servingSize?: string;
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
    fiber?: string;
}

export interface ProductDetail {
    _id: string;
    name: string;
    image: string;
    additionalImages?: string[];
    allImages: string[]; // Convenience array with all images
    price: number;
    discountPrice?: number;
    quantity: string;
    description?: string;
    stock: number;
    brand?: string;
    specifications?: ProductSpecification[];
    nutritionalInfo?: NutritionalInfo;
    highlights?: string[];
    warnings?: string;
    storageInstructions?: string;
    category: {
        _id: string;
        name: string;
        image?: string;
    };
    seller?: {
        _id: string;
        storeName?: string;
        name?: string;
    };
    isActive: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface RelatedProduct {
    _id: string;
    name: string;
    image: string;
    price: number;
    discountPrice?: number;
    quantity: string;
}

export interface Category {
    _id: string;
    name: string;
    image: string;
}

/**
 * Fetch all categories
 */
export const getAllCategories = async (): Promise<any> => {
    try {
        const response = await appAxios.get(`/categories`);
        return response.data;
    } catch (error) {
        console.log("Error Categories", error);
        return [];
    }
};

/**
 * Fetch products by category id
 */
export const getProductsByCategoryId = async (id: string): Promise<any> => {
    try {
        const response = await appAxios.get(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.log("Error Products", error);
        return [];
    }
};

/**
 * Fetch full product details by ID
 */
export const getProductById = async (productId: string): Promise<ProductDetail | null> => {
    try {
        const response = await appAxios.get(`/product/${productId}`);
        if (response.data?.success) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error('Error fetching product details:', error);
        return null;
    }
};

/**
 * Fetch related products (same category)
 */
export const getRelatedProducts = async (
    productId: string,
    limit: number = 6
): Promise<RelatedProduct[]> => {
    try {
        const response = await appAxios.get(`/product/${productId}/related`, {
            params: { limit },
        });
        if (response.data?.success) {
            return response.data.data || [];
        }
        return [];
    } catch (error) {
        console.error('Error fetching related products:', error);
        return [];
    }
};
