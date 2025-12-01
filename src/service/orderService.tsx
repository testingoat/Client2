import { appAxios } from './apiInterceptors';
import { BRANCH_ID } from './config';

export const createOrder = async (
  items: any,
  totalPrice: number,
  deliveryLocation: { latitude: number; longitude: number },
  branchId?: string
) => {
  try {
    // Validate input parameters
    if (!items || items.length === 0) {
      console.error('Create Order Error: No items provided');
      return null;
    }

    if (!deliveryLocation || !deliveryLocation.latitude || !deliveryLocation.longitude) {
      console.error('Create Order Error: Invalid delivery location', deliveryLocation);
      return null;
    }

    const resolvedBranchId = branchId || BRANCH_ID;

    console.log('Creating order with:', {
      items: items.length,
      totalPrice,
      deliveryLocation,
      branch: resolvedBranchId
    });

    const response = await appAxios.post('/order', {
      items: items,
      branch: resolvedBranchId,
      totalPrice: totalPrice,
      deliveryLocation: deliveryLocation,
    });

    console.log('Order created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Create Order Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      deliveryLocation
    });

    // Return more specific error information
    if (error.response?.status === 400) {
      console.error('Validation error - check delivery location data');
    } else if (error.response?.status === 404) {
      console.error('Resource not found - check branch or customer data');
    } else if (error.response?.status === 500) {
      console.error('Server error - check server logs');
    }

    return null;
  }
};

export const getOrderById = async (id: string) => {
  try {
    const response = await appAxios.get(`/order/${id}`);
    return response.data;
  } catch (error) {
    console.log('Fetch Order Error', error);
    return null;
  }
};

export const fetchCustomerOrders = async (userId: string) => {
  try {
    const response = await appAxios.get(`/order?customerId=${userId}`);
    return response.data;
  } catch (error) {
    console.log('Fetch Customer Order Error', error);
    return null;
  }
};

export const fetchOrders = async (
  status: string,
  userId: string,
  branchId: string,
) => {
  // Guard clause to prevent calling with undefined parameters
  if (!userId || !branchId) {
    console.log('Cannot fetch orders: Missing required parameters', { userId, branchId });
    return null;
  }

  let uri =
    status === 'available'
      ? `/order?status=${status}&branchId=${branchId}`
      : `/order?branchId=${branchId}&deliveryPartnerId=${userId}&status=delivered`;

  try {
    console.log('Fetching orders with URI:', uri);
    const response = await appAxios.get(uri);
    console.log('Fetch orders response:', response.data);
    return response.data;
  } catch (error) {
    console.log('Fetch Delivery Order Error', error);
    return null;
  }
};


export const sendLiveOrderUpdates = async (id: string, location: any, status: string) => {
  // Guard clause to prevent calling with undefined parameters
  if (!id || !status) {
    console.log('Cannot send live order updates: Missing required parameters', { id, status });
    return null;
  }

  try {
      console.log('Sending live order updates for order:', id, 'status:', status);
      const response = await appAxios.patch(`/order/${id}/status`, {
          deliveryPersonLocation: location,
          status,
      });
      console.log('SENT LIVE ))))', response.data);
      return response.data;
  } catch (error) {
      console.log('sendLiveOrderUpdates Error', error);
      return null;
  }
};

export const confirmOrder = async (id: string, location: any) => {
  try {
      const response = await appAxios.post(`/order/${id}/confirm`, {
          deliveryPersonLocation: location,
      });
      return response.data;
  } catch (error) {
      console.log('confirmOrder Error', error);
      return null;
  }
};
