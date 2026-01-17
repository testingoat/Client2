import { appAxios } from './apiInterceptors'

export const fetchWishlist = async () => {
  const response = await appAxios.get('/customer/wishlist')
  return response.data?.items || []
}

export const addToWishlist = async (productId: string) => {
  await appAxios.post('/customer/wishlist', { productId })
}

export const removeFromWishlist = async (productId: string) => {
  await appAxios.delete(`/customer/wishlist/${productId}`)
}

